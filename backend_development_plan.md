# 🧠 SafeDrop Backend Development Plan

**Acting as:** backend-developer, architect-reviewer, api-designer

***

## 🔎 Текущее Состояние (As-Is)

### ✅ Что Работает
- NestJS API с интеграцией 9 CEX (Binance, OKX, Bybit, Bitget, BingX, Gate, Kucoin, Mexc, Kraken)
- Базовая проверка withdrawal history (legacy verification endpoint)
- Swagger документация

### ❗ Критические Пробелы

| Gap | Описание |
|-----|----------|
| **Vault-подпись** | Нет challenge/nonce верификации |
| **Trust Score Engine** | Отсутствует полностью |
| **User Service** | Нет хранения профилей |
| **Grind verification** | Не реализован conditional logic с **обязательным CEX API** |
| **Multi-CEX Fallback** | Нет логики first 3 deposits |
| **Dual-signature linking** | Отсутствует |
| **Vault Recovery** | Полностью отсутствует |
| **Project Integration** | Нет партнёрских API |
| **Anti-Sybil** | Нет fingerprinting и clustering |
| **Database** | Нет Postgres, миграций, ORM |

***

## 🧱 Phase 0: Data Foundation (2-3 недели)

### Epic 1.1: Database Setup
- [ ] Postgres + TypeORM/Prisma setup
- [ ] Миграции применяются, схемы доступны

**Tables:**
```sql
-- Core entities
user_profile (user_uid, created_at, updated_at)

vault_verifications (
  vault_hash,
  cex_source,
  cex_master_hash VARCHAR(64),  -- SHA256(master_account_id + salt)
  first_deposits JSONB,  -- Store first 3 deposits
  detected_cex_sources TEXT[],  -- ["binance", "okx", "kraken", ...]
  trust_score,
  signals,
  status VARCHAR(50),  -- "active" | "compromised" | "recovered_to_new"
  is_recovered_from VARCHAR(64),  -- old vault_hash
  recovery_timestamp TIMESTAMP
)

grind_verifications (
  grind_hash VARCHAR(64),  -- SHA256(grind_address + salt)
  vault_hash,
  wallet_type,
  correlation_score,
  status,
  verified_cex VARCHAR(50)  -- Which CEX was used for verification
)

linking_events (
  event_id,
  vault_hash,
  campaign_id,
  timestamp,
  signature_hash
)

analytics_events (
  event_id,
  campaign_id,
  event_type,  -- VERIFIED | APPROVED | REJECTED | LINKED | RECOVERED
  vault_hash,
  grind_hash,
  trust_score,
  reason_code,
  created_at
)

campaign_stats (
  campaign_id,
  verified_total,
  approved_total,
  rejected_total,
  pending_total,
  linked_total,
  avg_trust_score,
  last_updated_at
)

campaign_timeseries_daily (
  campaign_id,
  date,
  verified,
  approved,
  rejected,
  linked
)

campaign_timeseries_hourly (
  campaign_id,
  hour,
  verified,
  approved,
  rejected,
  linked
)

```

### Epic 1.2: Hashing/PII Utilities
- [ ] Функции `vault_hash()`, `grind_hash()`, `cex_master_hash()`
- [ ] **AC:** Нет хранения raw mapping Vault↔Grind; master_account_id хранится только в виде хеша

### Epic 1.3: User Service
- [ ] CRUD профиля, статусы verification
- [ ] Repository pattern: `UserRepository`, `VerificationRepository`
- [ ] Endpoints: `POST /users`, `GET /users/:uid`

### Epic 1.4: External Config
- [ ] ConfigService для DeBank, RPC endpoints, CEX API keys
- [ ] `.env.example` с полным набором переменных

### Epic 1.5: Logging & Retention
- [ ] Winston structured logs (JSON)
- [ ] Rotate daily, keep 30 days
- [ ] AC: audit-лог событий без чувствительных данных

***

## 🔐 Phase 1: Vault Verification (3-4 недели)

### Epic 2.1: Challenge/Nonce Signature
```typescript
POST /api/wallets/verify-vault
Body: { address, signature, message }
Response: { vault_hash, nonce, status }
```
- [ ] Валидация подписи EVM/Solana
- [ ] Сохранение vault_hash

### Epic 2.2: CEX API Flow
- [ ] Минимум 1 биржа через API ключи
- [ ] Получение `master_account_id` + withdrawal history через API ключи
- [ ] Сохраняем `cex_master_hash` в `vault_verifications` (hash(master_account_id + salt))

### Epic 2.3: DeBank Service (UPDATED)
```typescript
class DebankService {
  async getFirstDeposits(address: string, chain: string): Promise<Deposit[]> {
    // Get ALL deposits, sorted chronologically (oldest first)
    const allDeposits = await this.getWalletHistory(address, chain);
    
    // Take FIRST 3 chronologically (not latest!)
    const firstThree = allDeposits
      .filter(tx => tx.category === 'receive')
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, 3);

    return firstThree.map(deposit => ({
      timestamp: deposit.timestamp,
      amount: deposit.amount,
      txHash: deposit.txHash,
      cex_source: detectCEXSource(deposit)
    }));
  }
}
```
**AC:**
- Корректно извлекаются первые 3 депозита хронологически
- Каждый депозит имеет detected `cex_source`
- Сохраняются в `vault.first_deposits` для fallback

### Epic 2.4: Correlation Engine
- [ ] Сравнение `vault_first_deposits` с CEX withdrawals
- [ ] Output: `confidence_score` (0-100) + reason codes
- [ ] AC: score формируется на основе temporal/amount match

### Epic 2.5: Trust Score v1
**Факторы:**
- CEX History Score (40%) - age, volume, tx count
- On-Chain Heuristics (30%) - wallet age, tx count, contracts
- Social Reputation (30%) - Twitter/Discord OAuth (future)

**Output:**
```json
{
  "score": 85,
  "factors": [
    {"name": "CEX History", "score": 90, "weight": 0.4},
    {"name": "On-Chain", "score": 75, "weight": 0.3},
    {"name": "Social", "score": 0, "weight": 0.3}
  ],
  "signals": ["HIGH_CEX_VOLUME", "FRESH_WALLET"]
}
```

### Epic 2.6: Multi-CEX Fallback & Vault Recovery (NEW)

#### Part A: Multi-CEX Fallback
```python
# During Vault Verification
vault.first_deposits = getFirstDeposits(vault_address)  # [2020_binance, 2021_okx, 2022_kraken]
vault.detected_cex_sources = ["binance", "okx", "kraken"]

# For Grind Verification (later)
# User can verify via ANY of the 3 CEXs
for deposit in vault.first_deposits:
    if user_provides_cex_api(deposit.cex_source):
        master_account_id = verify_api(deposit.cex_source)
        master_hash = hash(master_account_id)
        if master_hash == vault.cex_master_hash:
            return APPROVED  # Even if 1st/2nd CEX lost
```

#### Part B: Vault Recovery
```typescript
// 1. Report Compromised
POST /api/wallets/report-compromised
Body: { vault_hash, reason: "stolen" }
→ vault.status = "compromised"

// 2. Create Recovery Vault
POST /api/wallets/verify-vault-recovery
Body: {
  new_vault_address,
  old_vault_hash,
  cex_api_key,
  cex_api_secret
}

Algorithm:
- Verify new Vault via CEX API
- Check: same cex_master_hash as old Vault?
- IF yes:
  - new_vault.is_recovered_from = old_vault_hash
  - new_vault.status = "active"
  - old_vault.status = "recovered_to_new"
  - Return APPROVED
- ELSE:
  - Return REJECTED("Different master account")

// 3. Relink Grinds
POST /api/wallets/relink-grind
Body: { grind_hash, new_vault_hash }
→ grind.vault_hash = new_vault_hash (one-click update)
```

**AC:**
- Vault can be recovered after theft
- User must verify via SAME CEX master account
- Old Vault automatically blocked after recovery
- Grinds can be relinked in one-click
- Scammer blocked (can't provide CEX credentials)

***

## 🔗 Phase 2: Grind Verification + Linking (3-4 недели)

### Epic 3.1: Conditional Verify Grind (CORRECTED)
```typescript
POST /api/wallets/verify-grind
Body: { grind_address, vault_address, user_uid, campaign_id }
```

**Algorithm (CORRECTED):**
1. Analyze grind state (age, tx_count, balance)

2. For FRESH Grind (age < 7d, tx_count == 0):
   - DON'T auto-approve
   - Require CEX API verification:
   
   for (const deposit of vault.first_deposits) {
     try {
       grind_cex_api = request_cex_api(deposit.cex_source);
       master_account_id = verify_api(grind_cex_api);
       master_hash = hash(master_account_id);
       
       // Check: Same master account as Vault?
       if (master_hash == vault.cex_master_hash):
         return APPROVED(100%, deposit.cex_source);
       
       // Check: Different account but correlates?
       if (correlate_deposits(grind_cex_api, deposit) > 75):
         return APPROVED(85%, deposit.cex_source);
     } catch:
       continue;  // Try next CEX (2nd or 3rd deposit)
   }
   
   // No match for ANY of the 3 first deposits
   return REJECTED("no_cex_access_for_first_3_deposits");

3. For LEGACY Grind (has history):
   - Get first deposit via DeBank
   - Detect CEX source
   - Require CEX API for detected exchange
   - Check: Matches ANY of Vault's first 3 deposits
   - Temporal coherence check
   - IF all pass → APPROVED(95%)
   - ELSE → REJECTED

**AC:**
- Fresh Grind requires CEX API (NO auto-approve)
- User can provide API for ANY of first 3 deposit CEXs
- REJECT only if no CEX API for ALL 3 sources
- Even if 1st/2nd CEX lost → APPROVED if 3rd works

### Epic 3.2: On-Chain Grind Analysis
- [ ] `BlockchainService.analyzeGrindFunding(address)`
- [ ] AC: Определение `source_exchange` из first deposit

### Epic 3.3: Temporal Coherence Check
- [ ] Rule: `vault_first_funding <= grind_first_funding`
- [ ] Rule: Gap bounds (max 90 дней)
- [ ] AC: REJECT при temporal impossibility

### Epic 3.4: Dual-Signature Linking
```typescript
POST /api/wallets/link-grind
Body: {
  vault_address,
  vault_signature,
  grind_signature,
  message: { campaign_id, timestamp, nonce }
}
```
- [ ] Обе подписи верифицированы
- [ ] Создан `linking_event`

### Epic 3.5: No-Honeypot Storage
- [ ] `linking_events` хранит только `vault_hash` + `event_id`
- [ ] **AC:** В БД хранится только grind_hash (без raw grind_address)

***

## 🤝 Phase 3: Partner Integration (2-3 недели)

### Epic 4.1: Partner Onboarding
```typescript
POST /api/partners/register
Body: { project_name, contact_email }
Response: { api_key, secret }
```
- [ ] API ключи выдаются, логируется доступ

### Epic 4.2: Campaign CRUD
```typescript
POST /api/campaigns
GET /api/campaigns/:id
PATCH /api/campaigns/:id/close
```
- [ ] Партнёр создаёт/обновляет/закрывает кампании

### Epic 4.3: Trust Scores Endpoint
```typescript
GET /api/trust-scores/:vault_hash
Headers: { Authorization: Bearer <partner_api_key> }
Response: {
  score: 85,
  factors: [...],
  signals: ["HIGH_CEX_VOLUME"],
  risk_flags: []
}
```

### Epic 4.4: Push linkWallets Webhook
```json
POST <partner_webhook_url>
Body: {
  "event_type": "wallet_linked",
  "vault_hash": "0x...",
  "campaign_id": "abc123",
  "timestamp": "2025-12-20T00:00:00Z",
  "signature": "..."
}
```
- [ ] Retry logic (3x), signed payload

### Epic 4.5: Billing Reports
- [ ] Track: Usage per partner (API calls, verifications)
- [ ] AC: Monthly reports генерируются автоматически

### Epic 4.6: Partner Analytics (Scaling)

**Goal:** партнёр видит актуальные метрики почти в реальном времени (SLA <= 60s).

**Endpoint:**
```typescript
GET /api/partners/analytics
Query: {
  campaign_id?: string,
  range?: "24h" | "7d" | "30d" | "all",
  tz?: string
}
Response: {
  totals: {
    verified: number,
    approved: number,
    rejected: number,
    pending: number,
    linked: number
  },
  avg_trust_score: number,
  approval_rate: number,
  verification_latency_ms: { p50: number, p95: number },
  verifications_per_day: Array<{ date: string, verified: number, approved: number, rejected: number, linked: number }>,
  top_reject_reasons: Array<{ reason: string, count: number }>,
  last_updated_at: string,
  freshness_s: number
}
```

**Data model (analytics):**
- `analytics_events` — append-only событийный лог
- `campaign_stats` — быстрые агрегаты (totals)
- `campaign_timeseries_daily` — дневные ряды
- `campaign_timeseries_hourly` — часовые ряды (последние 24-72h)

**Write path (step-by-step):**
1. На завершение верификации создаём запись в `analytics_events` (APPROVED/REJECTED).
2. В той же транзакции обновляем `campaign_stats` (инкремент counters, avg_trust_score).
3. Пушим задачу в очередь `analytics.update` (BullMQ) для обновления time-series.
4. При `wallet_linked` и recovery — добавляем события LINKED/RECOVERED и обновляем counters.

**Read path:**
- `GET /api/partners/analytics` читает `campaign_stats` + time-series таблицы.
- Кэшируем ответ в Redis на 15-30s и invalidation при новом событии.
- Возвращаем `last_updated_at` + `freshness_s` для UI.

**Scaling & reliability:**
- Индексы: `analytics_events (campaign_id, created_at)`
- Партиционирование `analytics_events` по месяцу при росте объёмов
- Ночной job: backfill и recompute (сверка totals)
- Alerting: lag очереди, cache misses, stale data

**AC:**
- Партнёр видит рост verified/approved в течение SLA
- Нет расхождений между totals и time-series
- Данные выдерживают рост (партиции + кэш)

***

## 🛡️ Phase 4: Anti-Sybil & Analytics (3-4 недели)

### Epic 5.1: Fingerprints
```typescript
class FingerprintService {
  async generateFingerprint(user_uid): Promise<{
    cex_hash: string,        // Hashed master_account_id
    social_hash?: string,    // Hashed Twitter/Discord ID
    onchain_pattern: string  // Hashed behavioral pattern
  }>
}
```
- [ ] Анонимизированные идентификаторы без raw PII

### Epic 5.2: Graph Storage + Clustering
- [ ] Tool: Neo4j или Postgres JSONB
- [ ] Logic: Найти кластеры с shared fingerprints
- [ ] Output: `cluster_id`, `risk_flags` (SYBIL_CLUSTER)

### Epic 5.3: Risk Signals → Trust Score
- [ ] Integration: Понижение Trust Score при `sybil_risk > threshold`
- [ ] AC: Партнёр видит `risk_flags` в API response

### Epic 5.4: Decision History & Explainability
- [ ] Table: `verification_decisions` (vault_hash, decision, reason_codes, timestamp)
- [ ] AC: Партнёры могут запрашивать audit trail

### Epic 5.5: Per-Campaign Thresholds
- [ ] Feature: Партнёр устанавливает `min_trust_score` для кампании
- [ ] AC: Верификация auto-rejected если `score < campaign.min_trust_score`

