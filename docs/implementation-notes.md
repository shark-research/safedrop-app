# Implementation Notes (Backend)

Date: 2025-12-20

## Summary
- Added Grind linking flow with RPC new-wallet checks, DB first-use gate, dual-signature validation, and partner push after DB commit.
- Added BlockchainService for Solana (web3.js) and EVM (ethers) with timeout handling and EVM history fallback.
- Added Postgres module + repository for grind link storage with transaction lock.
- Added Project Integration service + module.
- Added DTO + controller endpoint: POST /api/verification/link-grind.
- Upgraded Winston logger utility with info/warn/error helpers.
- Installed new dependencies.

## New Files
- safedrop-back-main/src/verification/verification.tokens.ts
- safedrop-back-main/src/verification/interfaces/blockchain.interface.ts
- safedrop-back-main/src/verification/interfaces/grind-wallet-repository.interface.ts
- safedrop-back-main/src/verification/interfaces/project-integration.interface.ts
- safedrop-back-main/src/verification/repositories/grind-wallet.repository.ts
- safedrop-back-main/src/verification/dto/link-grind.dto.ts
- safedrop-back-main/src/blockchain/blockchain.service.ts
- safedrop-back-main/src/blockchain/blockchain.module.ts
- safedrop-back-main/src/database/postgres.module.ts
- safedrop-back-main/src/database/postgres.tokens.ts
- safedrop-back-main/src/project-integration/project-integration.service.ts
- safedrop-back-main/src/project-integration/project-integration.module.ts

## Modified Files
- safedrop-back-main/src/verification/verification.service.ts
- safedrop-back-main/src/verification/verification.controller.ts
- safedrop-back-main/src/verification/verification.module.ts
- safedrop-back-main/src/logger/file-logger.service.ts
- safedrop-back-main/package.json

## Env Vars Required
- DATABASE_URL
- PG_POOL_MAX (optional)
- SOLANA_RPC_URL
- EVM_RPC_URL
- EVM_HISTORY_API_URL
- EVM_HISTORY_API_KEY (optional)
- RPC_TIMEOUT_MS, RPC_RETRY_MAX, RPC_RETRY_DELAY_MS
- ADDRESS_HASH_SALT
- PROJECT_INTEGRATION_URL
- PROJECT_INTEGRATION_API_KEY (optional)

## SQL Required
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

## Strict Mode Note
- Global strict mode is not enabled because legacy modules are not strict-ready.
- New code is written with explicit typing.
- Decision pending:
  - keep current config and enforce strict on new modules only
  - add tsconfig.strict.json
  - enable strict globally and refactor legacy modules
