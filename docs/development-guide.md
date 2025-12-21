# Development Guide

> **Getting started with SafeDrop development**

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- **Git**
- **Wallet Extension:** MetaMask or Phantom

---

## Quick Start

### Frontend Development

```bash
# Navigate to frontend
cd safedrop-front-main

# Install dependencies
npm install

# Start dev server (with Turbopack)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

For local testing, if backend is running:
```bash
cd safedrop-back-main
npm install
npm run start:dev
```

---

## Environment Setup

### Frontend `.env.local`

```env
# WalletConnect Project ID (get from cloud.walletconnect.com)
NEXT_PUBLIC_PROJECT_ID=your_project_id

# Backend API URL
NEXT_PUBLIC_API_SERVER_URL=http://localhost:3001

# Payment destination wallets
NEXT_PUBLIC_WALLET=0x...
NEXT_PUBLIC_WALLET_SOL=...

# Transaction amount
NEXT_PUBLIC_AMOUNT=0.001

# Solana RPC (optional, defaults to devnet)
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
```

### Backend `.env`

```env
PORT=3001
MODE=DEV
ORIGIN=http://localhost:3000

DATABASE_URL=postgres://user:pass@host:5432/db
PG_POOL_MAX=10

AUTH_JWT_SECRET=change-me
AUTH_JWT_TTL_SECONDS=3600
AUTH_JWT_ISSUER=safedrop
AUTH_JWT_AUDIENCE=safedrop-web

EMAIL_SMTP_HOST=smtp.example.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=user@example.com
EMAIL_SMTP_PASS=change-me
EMAIL_FROM=SafeDrop <no-reply@example.com>
```

---

## Project Structure

```
safedrop-app/
??? safedrop-front-main/
?   ??? src/
?   ?   ??? app/
?   ?   ?   ??? sign-in/page.tsx
?   ?   ?   ??? sign-up/page.tsx
?   ?   ?   ??? verify/vault/page.tsx
?   ?   ?   ??? verify/grind/page.tsx
?   ?   ?   ??? partner/page.tsx
?   ?   ??? api/
?   ?   ??? components/
?   ??? package.json
??? safedrop-back-main/
?   ??? src/
?   ?   ??? auth/
?   ?   ??? verification/
?   ?   ??? blockchain/
?   ?   ??? database/
?   ?   ??? project-integration/
?   ??? package.json
??? docs/
```

---

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/my-feature

# Start dev server
cd safedrop-front-main && npm run dev

# Make changes...

# Build check
npm run build
```

### 2. Code Quality

```bash
# Lint
npm run lint

# Type check (via build)
npm run build
```

---

## Testing Wallet Flows (Updated)

**1) Sign-up + 2FA:**
- Sign up via email code (no Google sign-up)
- Set up Google Authenticator immediately after registration

**2) Vault verification:**
- Connect vault wallet
- Provide CEX API keys
- Verify first 3 deposits

**3) Grind verification + linking:**
- Grind wallet must have at least 1 inbound deposit
- Verify via CEX API and link using dual signatures

---

## API Calls

```tsx
const verifyVault = async (payload) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/wallets/verify-vault`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );
  return res.json();
};
```

---

## Backend Notes (Linking + Analytics)

- `POST /api/wallets/link-grind` performs dual-signature linking.
- `GET /api/partners/analytics` serves aggregated metrics (SLA <= 60s).

---

## Common Issues

### "Module not found"
```bash
rm -rf node_modules && npm install
```

### Wallet not connecting
1. Check `NEXT_PUBLIC_PROJECT_ID` is set
2. Ensure wallet extension is installed
3. Check browser console for errors

### API CORS error
Ensure backend `ORIGIN` includes your frontend URL.
