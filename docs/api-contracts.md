# API Contracts

## Base URL

| Environment | URL |
|-------------|-----|
| **Local Dev** | `http://localhost:3001` |
| **Production** | Configured via `NEXT_PUBLIC_API_SERVER_URL` |

---

## Auth & Identity

Sign-up uses email code only. Google/wallet sign-in works only for already linked accounts.
2FA is required for any link/add/change actions (vault/burner/social/security), but not required for login.

**Endpoints:**
- POST `/api/auth/email/start`
- POST `/api/auth/email/verify`
- POST `/api/auth/oauth/google`
- POST `/api/auth/wallet/challenge`
- POST `/api/auth/wallet/verify`
- POST `/api/auth/link/google`
- POST `/api/auth/link/wallet`
- POST `/api/auth/2fa/setup`
- POST `/api/auth/2fa/verify`
- POST `/api/auth/2fa/disable`
- POST `/api/auth/passkey/register/options`
- POST `/api/auth/passkey/register/verify`
- POST `/api/auth/passkey/authenticate/options`
- POST `/api/auth/passkey/authenticate/verify`
- POST `/api/socials/link`
- POST `/api/socials/unlink`

**Example:**
```json
{ "email": "user@example.com" }
```

---

## Wallet Verification

**Endpoints:**
- POST `/api/wallets/verify-vault`
- POST `/api/wallets/verify-grind`
- POST `/api/wallets/link-grind`
- POST `/api/wallets/report-compromised`
- POST `/api/wallets/verify-vault-recovery`
- POST `/api/wallets/relink-grind`

**Example (verify-grind):**
```json
{ "grind_address": "0x...", "vault_address": "0x...", "user_uid": "user_123", "campaign_id": "cmp_123" }
```

---

## Partner API

**Endpoints:**
- POST `/api/partners/register`
- POST `/api/campaigns`
- GET `/api/campaigns/:id`
- PATCH `/api/campaigns/:id/close`
- GET `/api/partners/analytics`
- GET `/api/trust-scores/:vault_hash`

**Example response (partners/analytics):**
```json
{
  "totals": { "verified": 0, "approved": 0, "rejected": 0, "pending": 0, "linked": 0 },
  "avg_trust_score": 0,
  "approval_rate": 0,
  "verification_latency_ms": { "p50": 0, "p95": 0 },
  "verifications_per_day": [],
  "top_reject_reasons": [],
  "last_updated_at": "2025-12-20T00:00:00Z",
  "freshness_s": 0
}
```

---

## Notes
- CEX API credentials are used for verification and never stored.
- For full data model and scaling notes, see `backend_development_plan.md`.
