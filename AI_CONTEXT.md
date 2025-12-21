# SafeDrop AI Context

## Primary Prompts
- `.agent/prompts/system-prompt.md`
- `.agent/rules/claude-system-prompt.md`
- `.agent/workflows/claude-setup.md`

## Documentation Sources
- `docs/index.md` - documentation index and entry point
- `docs/project-overview.md` - project structure
- `docs/architecture-frontend.md`
- `docs/architecture-backend.md`
- `docs/api-contracts.md`
- `docs/workflow.md`

## IDE Rules
- `.cursorrules`
- `.windsurfrules`
- `.vscode/settings.json`
- `CLAUDE.md`

## Access
- Both `safedrop-front-main/` and `safedrop-back-main/` are editable.

## Canonical User Flow
1. Sign in via Google or wallet for linked accounts, or sign up via email code.
2. Prompt 2FA setup right after sign-up; require 2FA for link/add/change actions.
3. Verify Vault: signature challenge -> CEX API proof -> first 3 deposits.
4. Verify Grind: require at least 1 inbound deposit -> CEX API verification.
5. Dual-signature link Vault + Grind.
6. Link socials and optional passkey/biometric SSO.

## Canonical Endpoints
- Auth: `POST /api/auth/email/start`, `POST /api/auth/email/verify`, `POST /api/auth/oauth/google`, `POST /api/auth/wallet/challenge`, `POST /api/auth/wallet/verify`, `POST /api/auth/2fa/*`, `POST /api/auth/passkey/*`, `POST /api/socials/*`
- Wallets: `POST /api/wallets/verify-vault`, `POST /api/wallets/verify-grind`, `POST /api/wallets/link-grind`, `POST /api/wallets/report-compromised`, `POST /api/wallets/verify-vault-recovery`, `POST /api/wallets/relink-grind`
- Partners: `POST /api/partners/register`, `GET /api/partners/analytics`
- Campaigns: `POST /api/campaigns`, `GET /api/campaigns/:id`, `PATCH /api/campaigns/:id/close`
- Trust score: `GET /api/trust-scores/:vault_hash`

## Avoid
- Legacy 4-step UI flow with a payment/transaction step.
- Deprecated `/api/verification` endpoint.
- Google sign-up (sign-up is email code only).
- Auto-approving Grind verification without CEX API proof.
- Storing CEX API credentials or raw Vault/Grind mappings.

