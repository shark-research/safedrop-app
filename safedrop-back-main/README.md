# SafeDrop Backend

NestJS API for auth/2FA, vault + grind verification, and partner analytics.

## Key Endpoints

**Auth:**
- `POST /api/auth/email/start`
- `POST /api/auth/email/verify`
- `POST /api/auth/oauth/google`
- `POST /api/auth/wallet/challenge`
- `POST /api/auth/wallet/verify`
- `POST /api/auth/2fa/setup`
- `POST /api/auth/2fa/verify`
- `POST /api/auth/2fa/disable`

**Wallets:**
- `POST /api/wallets/verify-vault`
- `POST /api/wallets/verify-grind`
- `POST /api/wallets/link-grind`
- `POST /api/wallets/verify-vault-recovery`
- `POST /api/wallets/relink-grind`

**Partners:**
- `POST /api/partners/register`
- `POST /api/campaigns`
- `GET /api/campaigns/:id`
- `PATCH /api/campaigns/:id/close`
- `GET /api/partners/analytics`

## Local Development

```bash
cd safedrop-back-main
npm install
npm run start:dev
```

## Environment

```
DATABASE_URL=postgres://user:pass@host:5432/db
AUTH_JWT_SECRET=change-me
EMAIL_SMTP_HOST=smtp.example.com
EMAIL_SMTP_USER=user@example.com
EMAIL_SMTP_PASS=change-me
```
