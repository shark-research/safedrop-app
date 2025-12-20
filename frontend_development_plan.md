# 🎨 SafeDrop Frontend Development Plan 

**Acting as:** frontend-implementer, nextjs-developer, ui-designer

***

## 📋 Текущее Состояние (As-Is)

### ✅ Что Работает
- Next.js 16 + React 19 UI с 4-шаговым stepper
- Подключение EVM (RainbowKit/Wagmi) и Solana кошельков
- Мок-флоу верификации через CEX API ключи
- Базовая структура компонентов

### ❌ Критические Пробелы

| Gap | Описание |
|-----|----------|
| **Vault/Grind flows** | UI работает на моках, реальные flows отсутствуют |
| **Роуты верификации** | Нет `/verify/vault` и `/verify/grind` |
| **API клиент** | Ограничен одним эндпоинтом `/api/verification` |
| **Partner Portal** | Отсутствует UI для партнёров |
| **Wallet pairing UX** | Нет dual-signature подтверждения |
| **Recovery flow** | UI для восстановления Vault отсутствует |

***

## 📍 Phase 5: Frontend Flows (2-3 недели)

### Epic 6.1: `/verify/vault` UI

**Components:**
✅ `VaultConnect` - wallet connection + signature challenge  
✅ `CEXAuth` - API keys
✅ `VerificationResult` - Trust Score display с breakdown факторов

**User Flow:**
1. Connect Wallet → Sign Challenge/Nonce
2. CEX Verification → API Keys
3. DeBank Analysis → On-chain проверка (first 3 deposits)
4. Trust Score Result → Display факторов

**Tasks:**
- Page route: `src/app/verify/vault/page.tsx`
- `VaultConnect` component с подписью сообщения
- `CEXAuthModal` с выбором биржи API keys
- `TrustScoreCard` с визуализацией факторов (pie chart)
- Success/Error states с guidance

**AC:** Успешная верификация отображается с breakdown факторов

### Epic 6.2: `/verify/grind` UI

**Flow:**
1. Analyze Grind → показать warnings (если legacy wallet)
2. Verify Grind → conditional logic display
3. Link Grind → dual-signature confirmation

**Components:**
✅ `GrindAnalyzer` - анализ состояния кошелька  
✅ `GrindWarnings` - предупреждения для legacy wallets  
✅ `DualSignatureFlow` - подтверждение обеих подписей  
✅ `LinkingSuccess` - результат линковки

**Tasks:**
- Page route: `src/app/verify/grind/page.tsx`
- Wallet state analysis (fresh/legacy/vault-funded)
- Warning UI для non-zero history wallets
- **CEX Selection UI:** "Provide API for one of: Binance, OKX, Kraken"
- Dual-signature modal flow

**UX Flow для пользователя:**
```
User connects old Grind wallet (2022)
SafeDrop:
  ⚠️ "This wallet has transaction history from 2022"
  🔍 "Verifying funding source..."
  
  [If NO match for ANY of 3 CEXs]:
  ❌ "Cannot verify this wallet belongs to you"
  💡 "Options:"
     1. Create new burner wallet (1-click)
     2. Use wallet funded from your CEX account
     3. Provide API for: Binance, OKX, or Kraken
```

**AC:** Show warnings + guidance для edge cases

### Epic 6.3: API Client Integration

**New API endpoints:**
```typescript
// src/api/vaultApi.ts
export const verifyVault = async (address: string, signature: string) => { ... }
export const verifyGrind = async (grindAddress: string, vaultAddress: string) => { ... }
export const linkWallets = async (vaultSig: string, grindSig: string) => { ... }
export const getTrustScore = async (vaultHash: string) => { ... }
```

**Tasks:**
- Create `src/api/vaultApi.ts`
- Create `src/api/grindApi.ts`
- Create `src/api/partnerApi.ts`
- Add retry/backoff logic
- Error handling with user-friendly messages
- TypeScript types for all responses

**AC:** Все запросы имеют retry/backoff, error handling

### Epic 6.4: Partner Portal UI

**Features:**
- Campaign dashboard (create, list, close)
- Trust Score queries
- Analytics (verifications per day, avg score)

**Tasks:**
- Page route: `src/app/partner/page.tsx`
- `CampaignList` component
- `CampaignCreateForm` component
- `TrustScoreQuery` component
- `AnalyticsDashboard` component
- Partner API authentication

**AC:** Базовый портал доступен партнёрам

### Epic 6.5: Wallet Pairing UX

**Dual-signature flow:**
1. Request Vault signature → Show pending UI
2. Request Grind signature → Show pending UI
3. Verify both signatures → Success animation
4. Link created → Confirmation screen

**Tasks:**
- `DualSignatureModal` component
- Step-by-step visual progress
- Signature request prompts
- Success/failure states
- Transaction hash display

**AC:** Обе подписи подтверждены, успех/ошибка показаны

### Epic 6.6: Vault Recovery UI ⚠️ **NEW**

**Alert Component:**
```jsx
┌─────────────────────────────────────────────┐
│ ⚠️  Your Vault Was Compromised              │
│                                             │
│ Verify it as a burner to recover safely     │
│                                             │
│ • Create new clean vault                    │
│ • Verify via same CEX API                   │
│ • Relink burners (1-click)                  │
│ • Get your Trust Score back                 │
│                                             │
│ [Start Vault Recovery →]                    │
└─────────────────────────────────────────────┘
```

**Tasks:**
- `VaultCompromisedAlert` component
- Recovery wizard (3-step modal):
  - Step 1: Create new Vault
  - Step 2: Verify via CEX API (same master account)
  - Step 3: Relink Grind wallets
- Burner relink interface (one-click per Grind)
- Status tracking UI

**AC:**
- User sees alert when Vault compromised
- Can create recovery vault via wizard
- Can relink Grinds in one click

***

## 📍 Additional Frontend Features

### Epic 6.7: Campaign Selection UI
**Tasks:**
- `CampaignSelector` component
- Campaign cards with partner details
- Active/completed status badges
- Campaign-specific requirements display

### Epic 6.8: Trust Score Visualization
**Components:**
- `TrustScoreCard` - main score display
- `FactorBreakdown` - pie chart or bar chart
- `SignalBadges` - HIGH_CEX_VOLUME, etc.
- `RiskFlagsAlert` - warning badges

***

## 🎨 UI/UX Guidelines

### Design System
```css
/* CSS Variables */
--background: #0a0a0a;
--foreground: #ededed;
--sefa-mint: #22D3EE;
--sefa-cyan: #22D3EE;
--dark: #191919;
```

### Component Patterns
- Use RainbowKit `ConnectButton` for EVM
- Use Solana Wallet Adapter `WalletMultiButton` for Solana
- TailwindCSS 4.x for styling
- Shadcn/ui components where appropriate
- Framer Motion for animations

### Accessibility
✅ Keyboard navigation  
✅ Screen reader support  
✅ Color contrast compliance  
✅ Loading states for async operations

***

## 🔗 API Integration Points

### Backend Endpoints to Consume

**User-facing API:**
```typescript
POST /api/auth/connect
POST /api/auth/verify-signature
GET /api/user/profile
POST /api/verification/cex
POST /api/verification/social
GET /api/verification/status
POST /api/wallets/link
GET /api/campaigns
GET /api/trust-score
```

**B2B API (Partner Portal):**
```typescript
POST /api/b2b/campaigns
GET /api/b2b/campaigns/{id}
POST /api/b2b/trust-scores
POST /api/b2b/campaigns/{id}/results
GET /api/b2b/analytics
```

***

## 🚀 Sprint Allocation (FINAL)

| Sprint | Weeks | Focus | Deliverable |
|--------|-------|-------|-------------|
| **Sprint 0** | 1-2 | Phase 0 | БД + схемы + User Service |
| **Sprint 1** | 3-4 | Phase 1 (Part 1) | Signature + CEX API |
| **Sprint 2** | 5-6 | Phase 1 (Part 2) + **Epic 2.6** | DeBank + Correlation + Trust Score v1 + **Multi-CEX + Recovery** |
| **Sprint 3** | 7-8 | Phase 2 (Part 1) + **Epic 3.1 UPDATED** | **Conditional verify (CEX API required)** + On-chain analysis |
| **Sprint 4** | 9-10 | Phase 2 (Part 2) | Dual-signature linking + No-honeypot |
| **Sprint 5** | 11-12 | Phase 3 | Campaign API + Trust Score endpoint |
| **Sprint 6** | 13-14 | Phase 5 + **Epic 6.6** | /verify/vault + /verify/grind UI + **Recovery UI** |
| **Sprint 7** | 15-16 | Phase 4 | Fingerprinting + Graph clustering |
| **Sprint 8** | 17-18 | Phase 5 | Partner Portal + UX improvements |
| **Sprint 9** | 19-20 | Phase 6 | Tests + Observability + Security audit |

**Total:** ~20 недель (5 месяцев) до Production-Ready

***

## 📌 Immediate Next Steps (Week 1)

1. **Setup Postgres + TypeORM**
   - Создать миграции для 4 таблиц
   - **ADD:** `vault_verifications.first_deposits`, `detected_cex_sources`, `status`
   - Seed тестовые данные

2. **Implement User Service**
   - CRUD endpoints: `POST /users`, `GET /users/:uid`
   - Repository pattern

3. **Add Hashing Utils**
   - `vault_hash = SHA256(address + salt)`
   - `cex_master_hash = SHA256(master_account_id + salt)`

4. **External Config Setup**
   - `.env` переменные для DeBank, RPC URLs
   - ConfigService injection

5. **Logging & Retention**
   - Winston structured logs (JSON)
   - Rotate daily, keep 30 days

***

## ⚠️ Open Questions (требуют решения перед стартом)

| # | Question | Recommendation |
|---|----------|----------------|
| **1** | Какие CEX поддерживаем в MVP API? | API keys by CEXs  |
| **2** | MVP только EVM или Solana + EVM? | EVM first, Solana в Phase 2 |
| **3** | Как связывать `user_uid` с `vault_hash`? | JWT token, in-memory mapping |
| **4** | Threshold confidence для Grind? | Fresh: **CEX API required**, Legacy: 70% |
| **5** | Fallback если DeBank rate limit? | Direct RPC fallback |
| **6** | Что делать если все 3 CEX утеряны? | REJECT (likely scammer), но можно добавить manual review |

***

## 🎯 Success Criteria (Definition of Done)

### MVP Core (Phase 0-2):
✅ Vault verification works end-to-end  
✅ **First 3 deposits stored** as fallback  
✅ Grind verification **requires CEX API** (no auto-approve)  
✅ **User can verify via ANY of 3 CEXs**  
✅ **Vault Recovery flow works**  
✅ No-honeypot: Grind адрес не сохраняется  
✅ API документация актуальна  

### B2B Ready (Phase 3-4):
✅ Partner API endpoints работают  
✅ Push webhook отправляется партнёрам  
✅ Anti-Sybil clustering работает  

### Production (Phase 6):
✅ 80%+ test coverage  
✅ Observability настроена  
✅ Security audit passed  

***

## 📚 Источники

Информация собрана из:
- **[audit.md]** - Gap analysis + backlog + deep dive
- **[rules.txt]** - Полная структура репозитория + tech stack
- **[PRD.txt]** - Текущая функциональность + улучшения
- **[CLAUDE.md]** - AI агенты + workflows
- **[SafeDrop 40 questions.docx]** - Бизнес логика (Burner→Vault model)
- **Диалоги с пользователем** - Уточнения по Multi-CEX fallback, Vault Recovery, Grind verification logic

***

## 📁 File Structure

```
safedrop-front-main/src/
├── app/
│   ├── verify/
│   │   ├── vault/page.tsx        # NEW
│   │   └── grind/page.tsx        # NEW
│   ├── partner/
│   │   └── page.tsx              # NEW
│   └── page.tsx                   # Existing
├── components/
│   ├── vault/
│   │   ├── VaultConnect.tsx      # NEW
│   │   ├── CEXAuth.tsx           # NEW
│   │   ├── TrustScoreCard.tsx    # NEW
│   │   └── VaultCompromisedAlert.tsx  # NEW (Recovery)
│   ├── grind/
│   │   ├── GrindAnalyzer.tsx     # NEW
│   │   ├── GrindWarnings.tsx     # NEW
│   │   ├── DualSignatureFlow.tsx # NEW
│   │   └── CEXSelectionModal.tsx # NEW (Multi-CEX)
│   ├── partner/
│   │   ├── CampaignList.tsx      # NEW
│   │   └── AnalyticsDashboard.tsx # NEW
│   └── recovery/
│       ├── RecoveryWizard.tsx    # NEW
│       └── BurnerRelinkCard.tsx  # NEW
├── api/
│   ├── index.ts                   # Existing
│   ├── vaultApi.ts               # NEW
│   ├── grindApi.ts               # NEW
│   └── partnerApi.ts             # NEW
└── providers/
    └── Web3Provider.tsx           # Existing
```

***

## ⚠️ Dependencies

### From Backend (must be ready):
- `POST /api/wallets/verify-vault`
- `POST /api/wallets/verify-grind` (with CEX API requirement)
- `POST /api/wallets/link-grind`
- `GET /api/trust-scores/:vault_hash`
- `POST /api/campaigns`
- **`POST /api/wallets/report-compromised`** (NEW)
- **`POST /api/wallets/verify-vault-recovery`** (NEW)
- **`POST /api/wallets/relink-grind`** (NEW)

### External Services:
- DeBank API (backend handles)
- CEX API endpoints (backend handles)
- RPC nodes (already configured)
