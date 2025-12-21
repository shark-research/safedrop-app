# 🎨 SafeDrop Frontend Development Plan

**Acting as:** frontend-implementer, nextjs-developer, ui-designer

***

## 🔎 Текущее Состояние (As-Is)

### ✅ Что Работает
- Next.js 16 + React 19 UI с 4-шаговым stepper
- Подключение EVM (RainbowKit/Wagmi) и Solana кошельков
- Мок-флоу верификации через CEX API ключи
- Базовая структура компонентов

### ❗ Критические Пробелы

| Gap | Описание |
|-----|----------|
| **Vault/Grind flows** | UI работает на моках, реальные flows отсутствуют |
| **Роуты верификации** | Нет `/verify/vault` и `/verify/grind` |
| **API клиент** | Ограничен одним эндпоинтом, нет полноценного API слоя |
| **Partner Portal** | Отсутствует UI для партнёров |
| **Wallet pairing UX** | Нет dual-signature подтверждения |
| **Recovery flow** | UI для восстановления Vault отсутствует |

***

## ✅ End-to-End User Flow (Sign in/up -> 2FA -> Vault -> Grind -> Link -> Socials/SSO)
1. **Sign in** via Google or wallet (existing accounts only). If not linked, user must sign up.
2. **Sign up** via email code only (no Google sign-up).
3. **2FA (Google Authenticator)** setup is prompted right after registration. Required for any link/add/change actions (vault/burner/social/security), not required for Google/wallet sign-in.
4. **Connect Vault**: sign challenge -> CEX API proof -> DeBank first 3 deposits.
5. **Connect Grind (Burner)**: must have at least 1 on-chain deposit -> CEX API verification against Vault first deposits.
6. **Dual-signature linking** for Vault + Grind.
7. **Link socials** and optionally enable **passkey/biometric** (WebAuthn) for SSO.

***

## 🧩 Phase 4: Identity & Security UI (2-3 недели)

### Epic 6.0: Auth & Account Linking UI (NEW)
- [ ] Routes: `src/app/sign-in/page.tsx`, `src/app/sign-up/page.tsx`, `src/app/settings/security/page.tsx`
- [ ] Sign-in options: Google OAuth + wallet (only if already linked)
- [ ] Sign-up via email code (no Google sign-up)
- [ ] Link/unlink Google + wallet inside settings
- [ ] Session/device list + logout everywhere

**AC:**
- If provider not linked, show "Not linked - sign up with email code" flow
- Clear error states for "already linked to another account"
- Google/wallet sign-in does not require 2FA

### Epic 6.0b: 2FA (TOTP) UI (NEW)
- [ ] Setup wizard: QR code, verification, backup codes
- [ ] Prompt 2FA setup right after registration
 - [ ] 2FA prompt modal for link/add/change actions (vault/burner/socials/security)
- [ ] Disable 2FA with code + confirmation

### Epic 6.0c: Socials + Passkeys (SSO) (NEW)
- [ ] Link Twitter/Discord in settings
- [ ] WebAuthn passkey enroll + sign-in option
- [ ] Status UI (enabled/disabled, last used)

## 🧩 Phase 5: Frontend Flows (2-3 недели)

### Epic 6.1: `/verify/vault` UI

**Components:**
- [ ] `VaultConnect` - wallet connection + signature challenge
- [ ] `CEXAuth` - API keys flow
- [ ] `VerificationResult` - Trust Score display с breakdown факторов

**User Flow:**
```
1. Connect Wallet → Sign Challenge/Nonce
2. CEX Verification → API Keys
3. DeBank Analysis → On-chain проверка (first 3 deposits)
4. Trust Score Result → Display факторов
```

**Tasks:**
- [ ] Page route: `src/app/verify/vault/page.tsx`
- [ ] `VaultConnect` component с подписью сообщений
- [ ] `CEXAuthModal` с выбором биржи и API keys
- [ ] `TrustScoreCard` с визуализацией факторов (pie chart)
- [ ] Success/Error states с guidance

**AC:** Успешная верификация отображается с breakdown факторов

---

### Epic 6.2: `/verify/grind` UI

**Flow:**
1. Analyze Grind → показать warnings (если legacy wallet)
2. Verify Grind → conditional logic display
3. Link Grind → dual-signature confirmation

**Components:**
- [ ] `GrindAnalyzer` - анализ состояния кошелька
- [ ] `GrindWarnings` - предупреждения для legacy wallets
- [ ] `DualSignatureFlow` - подтверждение обеих подписей
- [ ] `LinkingSuccess` - результат линковки

**Tasks:**
- [ ] Page route: `src/app/verify/grind/page.tsx`
- [ ] Wallet state analysis (fresh/legacy/vault-funded)
- [ ] If no inbound deposit, block flow and show "Fund wallet with 1 deposit" message
- [ ] Warning UI для non-zero history wallets
- [ ] **CEX Selection UI:** "Provide API for one of the detected CEX sources from `detected_cex_sources` (max 3)"
- [ ] Dual-signature modal flow

**UX Flow для пользователя:**
```
User connects old Grind wallet (2022)

SafeDrop:
  ⚠️ "This wallet has transaction history from 2022"
  🔍 "Verifying funding source..."
  
  [If NO match for ANY detected CEX]:
  ❌ "Cannot verify this wallet belongs to you"
  ✅ "Options:"
     1. Create new burner wallet (1-click)
     2. Use wallet funded from your CEX account
     3. Provide API for one of detected CEX sources
```

**AC:** Show warnings + guidance для edge cases

---

### Epic 6.3: API Client Integration

**New API endpoints:**
```typescript
// src/api/authApi.ts
export const startEmailLogin = async (email: string) => { ... }
export const verifyEmailCode = async (email: string, code: string) => { ... }
export const googleSignIn = async (idToken: string) => { ... }
export const walletChallenge = async (address: string) => { ... }
export const walletVerify = async (address: string, signature: string) => { ... }
export const refreshSession = async () => { ... }
export const logout = async () => { ... }

// src/api/vaultApi.ts
export const verifyVault = async (address: string, signature: string) => { ... }
export const verifyGrind = async (grindAddress: string, vaultAddress: string) => { ... }
export const linkWallets = async (vaultSig: string, grindSig: string) => { ... }
export const getTrustScore = async (vaultHash: string) => { ... }
```

**Tasks:**
- [ ] Create `src/api/authApi.ts`
- [ ] Create `src/api/vaultApi.ts`
- [ ] Create `src/api/grindApi.ts`
- [ ] Create `src/api/partnerApi.ts`
- [ ] Create `src/api/securityApi.ts` (2FA, passkeys, socials)
- [ ] Add retry/backoff logic
- [ ] Error handling with user-friendly messages
- [ ] TypeScript types for all responses

**AC:** Все запросы имеют retry/backoff, error handling

---

### Epic 6.4: Partner Portal UI (Scaling)

**Features:**
- Campaign dashboard (create, list, close)
- Trust Score queries
- Analytics dashboard: totals, time-series, approval rate, avg score, reject reasons
- Data freshness indicator (last updated + SLA)

**Analytics UI Requirements (Step-by-step):**
1. **Totals strip**
   - Verified, Approved, Rejected, Pending, Linked
   - Visible above the chart for quick scan

2. **Time-series chart**
   - Daily counts for last 7/30 days (toggle)
   - Optional hourly view for last 24h

3. **Health metrics**
   - Approval rate (%)
   - Avg trust score
   - Median/P95 verification latency (ms)

4. **Reject reasons panel**
   - Top reject reasons with counts
   - Tooltip for reason description

**Reason code mapping (label + tooltip):**
- `SIGNATURE_INVALID` - "Signature invalid" - User signature failed verification
- `CEX_API_INVALID` - "CEX API invalid" - API keys invalid or missing required permissions
- `CEX_MASTER_MISMATCH` - "Account mismatch" - Master account hash does not match vault
- `NO_CEX_ACCESS_FOR_FIRST_3_DEPOSITS` - "No CEX access" - No API for any of the first 3 deposit exchanges
- `CEX_SOURCE_MISMATCH` - "Funding source mismatch" - Grind funded from different exchange
- `TEMPORAL_IMPOSSIBILITY` - "Temporal mismatch" - Grind funded before vault or before CEX account creation
- `LOW_CONFIDENCE_CORRELATION` - "Low correlation" - Time/amount correlation below threshold
- `ONCHAIN_HISTORY_UNAVAILABLE` - "History unavailable" - Cannot fetch first deposit history
- `NO_ONCHAIN_ACTIVITY` - "No on-chain activity" - Grind wallet has no inbound deposit
- `MIN_TRUST_SCORE_NOT_MET` - "Trust score too low" - Below campaign minimum score
- `VAULT_COMPROMISED` - "Vault compromised" - Vault marked compromised/recovered
- `GRIND_ALREADY_LINKED` - "Already linked" - Grind already linked/verified
- `CAMPAIGN_CLOSED` - "Campaign closed" - Campaign not accepting new verifications
- `UNSUPPORTED_CHAIN` - "Unsupported chain" - Chain not allowed for campaign
- `OTHER` - "Other" - Fallback when reason is unknown

5. **Filters**
   - Campaign selector
   - Date range: 24h / 7d / 30d / all
   - Status filter (approved/rejected/pending)

6. **Freshness & trust**
   - `last_updated_at` shown near totals
   - If data older than SLA, show warning badge

**Tasks:**
- [ ] Page route: `src/app/partner/page.tsx`
- [ ] `CampaignList` component
- [ ] `CampaignCreateForm` component
- [ ] `TrustScoreQuery` component
- [ ] `AnalyticsDashboard` component
- [ ] Subcomponents: `TotalsStrip`, `TimeSeriesChart`, `RejectReasonsTable`, `ApprovalRateCard`, `LastUpdatedBadge`
- [ ] Partner API authentication + role gate
- [ ] Auto-refresh polling (15-30s) + manual refresh button
- [ ] Optimistic increment (optional) for local session actions
- [ ] Empty/zero-state messaging for new campaigns

**AC:**
- Analytics numbers update within SLA (<= 60s)
- UI shows last_updated_at and refresh status
- No confusing ?stale? metrics for newly verified users


---

### Epic 6.5: Wallet Pairing UX

**Dual-signature flow:**
```
1. Request Vault signature → Show pending UI
2. Request Grind signature → Show pending UI
3. Verify both signatures → Success animation
4. Link created → Confirmation screen
```

**Tasks:**
- [ ] `DualSignatureModal` component
- [ ] Step-by-step visual progress
- [ ] Signature request prompts
- [ ] Success/failure states
- [ ] Transaction hash display

**AC:** Обе подписи подтверждены, успех/ошибка показаны

---

### Epic 6.6: Vault Recovery UI (NEW)

**Alert Component:**
```jsx
┌───────────────────────────────────────────────┐
│ ⚠️  Your Vault Was Compromised                │
│                                               │
│ Verify it as a burner to recover safely       │
│                                               │
│ • Create new clean vault                      │
│ • Verify via same CEX API                     │
│ • Relink burners (1-click)                    │
│ • Get your Trust Score back                   │
│                                               │
│ [Start Vault Recovery →]                      │
└───────────────────────────────────────────────┘
```

**Tasks:**
- [ ] `VaultCompromisedAlert` component
- [ ] Recovery wizard (3-step modal):
  - Step 1: Create new Vault
  - Step 2: Verify via CEX API (same master account)
  - Step 3: Relink Grind wallets
- [ ] Burner relink interface (one-click per Grind)
- [ ] Status tracking UI

**AC:**
- User sees alert when Vault compromised
- Can create recovery vault via wizard
- Can relink Grinds in one click

***

## ✨ Additional Frontend Features

### Epic 6.7: Campaign Selection UI
**Tasks:**
- [ ] `CampaignSelector` component
- [ ] Campaign cards with partner details
- [ ] Active/completed status badges
- [ ] Campaign-specific requirements display

### Epic 6.8: Trust Score Visualization
**Components:**
- [ ] `TrustScoreCard` - main score display
- [ ] `FactorBreakdown` - pie chart or bar chart
- [ ] `SignalBadges` - HIGH_CEX_VOLUME, etc.
- [ ] `RiskFlagsAlert` - warning badges

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
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast compliance
- [ ] Loading states for async operations

***

## 🔗 API Integration Points

### Backend Endpoints to Consume

**User-facing API:**
```typescript
POST /api/auth/email/start
POST /api/auth/email/verify
POST /api/auth/oauth/google
POST /api/auth/wallet/challenge
POST /api/auth/wallet/verify
POST /api/auth/link/google
POST /api/auth/link/wallet
POST /api/auth/sessions/refresh
POST /api/auth/logout
POST /api/auth/2fa/setup
POST /api/auth/2fa/verify
POST /api/auth/2fa/disable
POST /api/auth/passkey/register/options
POST /api/auth/passkey/register/verify
POST /api/auth/passkey/authenticate/options
POST /api/auth/passkey/authenticate/verify
POST /api/socials/link
POST /api/socials/unlink
POST /api/wallets/verify-vault
POST /api/wallets/verify-grind
POST /api/wallets/link-grind
POST /api/wallets/report-compromised
POST /api/wallets/verify-vault-recovery
POST /api/wallets/relink-grind
GET /api/trust-scores/:vault_hash
GET /api/campaigns
```

**Partner API (Portal):**
```typescript
POST /api/partners/register
POST /api/campaigns
GET /api/campaigns/:id
PATCH /api/campaigns/:id/close
GET /api/partners/analytics
```

Additional auth/security paths:
- `safedrop-front-main/src/app/sign-in/page.tsx`
- `safedrop-front-main/src/app/sign-up/page.tsx`
- `safedrop-front-main/src/app/settings/security/page.tsx`
- `safedrop-front-main/src/api/authApi.ts`
- `safedrop-front-main/src/api/securityApi.ts`
- `safedrop-front-main/src/components/auth/*`
- `safedrop-front-main/src/components/security/*`

***

## 🏁 Sprint Allocation (FINAL)

| Sprint | Weeks | Focus | Deliverable |
|--------|-------|-------|-------------|
| **Sprint 0** | 1-2 | Phase 0 + Auth/2FA | БД + схемы + Auth + 2FA core |
| **Sprint 1** | 3-4 | Phase 1 (Part 1) | Signature + CEX API |
| **Sprint 2** | 5-6 | Phase 1 (Part 2) + **Epic 2.6** | DeBank + Correlation + Trust Score v1 + **Multi-CEX + Recovery** |
| **Sprint 3** | 7-8 | Phase 2 (Part 1) + **Epic 3.1 UPDATED** | **Conditional verify (CEX API required)** + On-chain analysis |
| **Sprint 4** | 9-10 | Phase 2 (Part 2) | Dual-signature linking + No-honeypot |
| **Sprint 5** | 11-12 | Phase 3 | Campaign API + Trust Score endpoint |
| **Sprint 6** | 13-14 | Phase 4 + Phase 5 | Auth UI + /verify/vault + /verify/grind + **Recovery UI** |
| **Sprint 7** | 15-16 | Phase 4 | Fingerprinting + Graph clustering |
| **Sprint 8** | 17-18 | Phase 5 | Partner Portal + UX improvements |
| **Sprint 9** | 19-20 | Phase 6 | Tests + Observability + Security audit |

**Total:** ~20 недель (5 месяцев) до Production-Ready

***

## 📌 Immediate Next Steps (Week 1)

1. **Create route structure**
   - `src/app/sign-in/page.tsx`
   - `src/app/sign-up/page.tsx`
   - `src/app/settings/security/page.tsx`
   - `src/app/verify/vault/page.tsx`
   - `src/app/verify/grind/page.tsx`
   - `src/app/partner/page.tsx`

2. **Implement API client modules**
   - `src/api/authApi.ts`, `src/api/securityApi.ts`
   - `src/api/vaultApi.ts`, `src/api/grindApi.ts`, `src/api/partnerApi.ts`
   - Add wrappers for recovery endpoints

3. **Build Auth + 2FA UI**
   - Sign-in (Google + wallet) + email code sign-up
   - 2FA setup + step-up prompt modal

4. **Build Vault verification UI**
   - `VaultConnect` + `CEXAuthModal`
   - CEX list sourced from `detected_cex_sources`

5. **Build Grind verification UI**
   - `GrindAnalyzer`, `GrindWarnings`, `DualSignatureFlow`
   - CEX selection aligned with backend sources

6. **Wire Recovery UI**
   - `VaultCompromisedAlert` + `RecoveryWizard`
   - Connect to recovery endpoints

***

## ❓ Open Questions (требуют решения перед стартом)

| # | Question | Recommendation |
|---|----------|----------------|
| **1** | Какие CEX поддерживаем в MVP API? | API keys by CEXs |
| **2** | MVP только EVM или Solana + EVM? | EVM first, Solana в Phase 2 |
| **3** | Как связывать `user_uid` с `vault_hash`? | JWT token, in-memory mapping |
| **4** | Threshold confidence для Grind? | Fresh: **CEX API required**, Legacy: 70% |
| **5** | Fallback если DeBank rate limit? | Direct RPC fallback |
| **6** | Что делать если все 3 CEX утеряны? | REJECT (likely scammer), но можно добавить manual review |

***

## ✅ Success Criteria (Definition of Done)

### MVP Core (Phase 0-2):
- [ ] Sign-up via email code only (no Google sign-up)
- [ ] Sign-in via Google/wallet for linked accounts
- [ ] 2FA required for link/add/change actions (vault/burner/social/security), not required for login
- [ ] Grind requires at least 1 on-chain deposit before verification
- [ ] Vault verification works end-to-end
- [ ] **First 3 deposits stored** as fallback
- [ ] Grind verification **requires CEX API** (no auto-approve)
- [ ] **User can verify via ANY of 3 CEXs**
- [ ] **Vault Recovery flow works**
- [ ] No-honeypot: Grind адрес не сохраняется
- [ ] API документация актуальна

### B2B Ready (Phase 3-4):
- [ ] Partner API endpoints работают
- [ ] Push webhook отправляется партнёрам
- [ ] Anti-Sybil clustering работает

### Production (Phase 6):
- [ ] 80%+ test coverage
- [ ] Observability настроена
- [ ] Security audit passed

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

## 🗂️ File Structure

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
- `POST /api/auth/email/start`
- `POST /api/auth/email/verify`
- `POST /api/auth/oauth/google`
- `POST /api/auth/wallet/challenge`
- `POST /api/auth/wallet/verify`
- `POST /api/auth/link/google`
- `POST /api/auth/link/wallet`
- `POST /api/auth/2fa/setup`
- `POST /api/auth/2fa/verify`
- `POST /api/auth/2fa/disable`
- `POST /api/auth/passkey/register/options`
- `POST /api/auth/passkey/register/verify`
- `POST /api/auth/passkey/authenticate/options`
- `POST /api/auth/passkey/authenticate/verify`
- `POST /api/socials/link`
- `POST /api/socials/unlink`
- `POST /api/wallets/verify-vault`
- `POST /api/wallets/verify-grind` (with CEX API requirement)
- `POST /api/wallets/link-grind`
- `POST /api/wallets/report-compromised`
- `POST /api/wallets/verify-vault-recovery`
- `POST /api/wallets/relink-grind`
- `GET /api/trust-scores/:vault_hash`
- `GET /api/campaigns`
- `POST /api/partners/register`
- `POST /api/campaigns`
- `GET /api/campaigns/:id`
- `PATCH /api/campaigns/:id/close`
- `GET /api/partners/analytics`

### External Services:
- DeBank API (backend handles)
- CEX API endpoints (backend handles)
- RPC nodes (already configured)
