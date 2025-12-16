# Architecture - Backend (`safedrop-back-main`)

> **status**: **READ-ONLY**
> **note**: No modifications allowed. Documentation is for reference only.

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
