# Source Tree Analysis

## Directory Structure Overview

The project is split into two main root directories within the repository:

### 1. Frontend (`safedrop-front-main/`)

Next.js 16 application using App Router.

```
safedrop-front-main/
  public/              # Static assets
  src/
    api/               # API client functions
      index.ts
    app/               # Application routes (Next.js App Router)
      layout.tsx
      page.tsx
      globals.css
      favicon.ico
    components/        # Reusable React components
      button/
      info/
      ui/
    providers/         # Global providers (Web3, Solana)
      SolWalletProvider.tsx
      Web3Provider.tsx
```

### 2. Backend (`safedrop-back-main/`)

NestJS 11 application tailored for exchange verification.

```
safedrop-back-main/
  src/
    auth/                # Email code, OAuth, wallet, 2FA
    verification/        # Vault + Grind verification
    blockchain/          # EVM + Solana history lookups
    database/            # Postgres module
    project-integration/ # Partner webhooks
    [exchange]/          # Exchange modules
    common/
    logger/
  package.json           # Dependencies
  tsconfig.json          # TypeScript configuration
```

## Critical Files

- **Entry Points**:
  - Frontend: `safedrop-front-main/src/app/layout.tsx`
  - Backend: `safedrop-back-main/src/main.ts`

- **Configuration**:
  - Frontend: `safedrop-front-main/next.config.ts`, `safedrop-front-main/tailwind.config.ts`
  - Backend: `safedrop-back-main/.env` (managed locally)

- **Integration**:
  - Frontend API calls: `safedrop-front-main/src/api/` align with `/api/auth/*` and `/api/wallets/*`
