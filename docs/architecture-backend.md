# Architecture - Backend (`safedrop-back-main`)

> **status**: **EDITABLE**
> **note**: Backend is now fully editable.

## Executive Summary
The backend is a **NestJS 11** service acting as the verification engine. It exposes a unified API for checking wallet withdrawal history across multiple centralized exchanges (CEXs).

## Technology Stack

| Category | Technology | Version | Justification |
|----------|------------|---------|---------------|
| **Framework** | NestJS | 11.1.8 | Modular, scalable Node.js framework. |
| **Language** | TypeScript | 5.x | Type safety. |
| **API Docs** | Swagger | 11.2.1 | API exploration and documentation. |
| **HTTP Client** | Axios | 1.13.1 | For external exchange API requests. |
| **Validation** | class-validator | 0.14.2 | DTO validation pipelines. |

## Architecture Pattern
**Service-Oriented / Controller-Service**
- **Controllers**: Handle HTTP requests (e.g., `verification.controller.ts`).
- **Services**: Business logic (e.g., `verification.service.ts`).
- **Use Cases**: Each exchange integration (Binance, OKX, etc.) is a separate module/service.

## Core Modules

### 1. Verification Module (`src/verification`)
- Central entry point.
- Routes requests to specific exchange services based on the `exchange` parameter.

### 2. Exchange Services
- `src/binance/`: Implementation of Binance checks.
- `src/okx/`: Implementation of OKX checks.
- ...and others.
- **Logic**: Each service implements `checkWallet(key, secret, wallet)` pattern.

## Rules & Constraints
- **Chain Agnostic**: The backend does not validate chain specifics; it treats wallet addresses as strings.
- **Withdrawal History**: Checks defaults to 1 year lookback (configurable via `YEARS`).
- **CORS**: Configurable `ORIGIN` in `main.ts`.

## Recent Updates (2025-12-20)
- Added Grind linking flow with RPC new-wallet checks, DB first-use gate, dual signatures, and partner push after DB commit.
- Added BlockchainService for Solana (web3.js) + EVM (ethers).
- Added Postgres module and grind link repository with transaction lock.
- Added Project Integration service for partner push.
- Added endpoint: `POST /api/verification/link-grind`.

## Configuration (Backend)

### Required Env Vars
```
DATABASE_URL
PG_POOL_MAX
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

### Required SQL
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
