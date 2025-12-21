# Architecture - Backend (`safedrop-back-main`)

> **status**: **EDITABLE**
> **note**: Backend is actively evolving alongside the new auth + verification flow.

## Executive Summary
The backend is a **NestJS 11** service that handles **auth/2FA**, **vault & grind verification**, **partner analytics**, and **exchange integrations**.
It is chain-agnostic and focuses on proof-of-ownership and risk scoring without storing raw PII.

## Technology Stack

| Category | Technology | Version | Justification |
|----------|------------|---------|---------------|
| **Framework** | NestJS | 11.1.8 | Modular, scalable Node.js framework. |
| **Language** | TypeScript | 5.x | Type safety. |
| **API Docs** | Swagger | 11.2.1 | API exploration and documentation. |
| **HTTP Client** | Axios | 1.13.1 | External exchange API requests. |
| **Validation** | class-validator | 0.14.2 | DTO validation pipelines. |
| **DB** | Postgres | 15+ | Analytics + auth storage. |

## Architecture Pattern
**Service-Oriented / Controller-Service**
- **Controllers**: HTTP endpoints (auth, wallets, partners).
- **Services**: Business logic (verification, analytics, auth).
- **Adapters**: Exchange and blockchain integrations.

## Core Modules (Planned + In-Flight)

### 1. Auth Module (`src/auth`)
- Email-code sign-up, OAuth sign-in, wallet signature sign-in.
- Sessions, 2FA (TOTP), passkeys (WebAuthn).

### 2. Wallet Verification Module (`src/verification`)
- Vault verification with CEX API + DeBank first deposits.
- Grind verification + dual-signature linking.
- Recovery flow and multi-CEX fallback.

### 3. Partner Analytics Module (`src/partners` or `src/analytics`)
- Campaign CRUD.
- Analytics aggregations with Redis caching.

### 4. Exchange Services (`src/binance`, `src/okx`, ...)
- CEX API connectors for withdrawal history.

### 5. Blockchain Module (`src/blockchain`)
- EVM + Solana history lookups.

### 6. Database Module (`src/database`)
- Postgres pool + repository layer.

## Rules & Constraints
- **Chain Agnostic**: Treat wallet addresses as strings; chain restrictions are on the frontend.
- **No Raw PII**: Store hashed identifiers only (master account hashes, wallet hashes).
- **2FA Gate**: Required for link/add/change actions; login does not require 2FA.

## Current Plan Updates (2025-12-20)
- Canonical endpoints standardized under `/api/auth/*` and `/api/wallets/*`.
- Partner analytics scaling path defined (events + aggregates + cache).
- Reason-code enum defined for rejected verifications.
- Vault recovery and multi-CEX fallback specified.

## Configuration (Backend)

### Required Env Vars
```
DATABASE_URL
PG_POOL_MAX
AUTH_JWT_SECRET
AUTH_JWT_TTL_SECONDS
AUTH_JWT_ISSUER
AUTH_JWT_AUDIENCE
EMAIL_SMTP_HOST
EMAIL_SMTP_PORT
EMAIL_SMTP_USER
EMAIL_SMTP_PASS
EMAIL_FROM
SOLANA_RPC_URL
EVM_RPC_URL
EVM_HISTORY_API_URL
EVM_HISTORY_API_KEY
RPC_TIMEOUT_MS
RPC_RETRY_MAX
RPC_RETRY_DELAY_MS
ADDRESS_HASH_SALT
PROJECT_INTEGRATION_URL
PROJECT_INTEGRATION_API_KEY
```

### Required SQL (see full list in backend_development_plan.md)
```sql
CREATE TABLE grind_wallet_links (
  grind_address TEXT PRIMARY KEY,
  vault_hash TEXT NOT NULL,
  project_id TEXT NOT NULL,
  chain TEXT NOT NULL,
  linked_at TIMESTAMP NOT NULL,
  message_hash TEXT NOT NULL
);
```
