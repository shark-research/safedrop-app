# SafeDrop Workflow & Architecture

> **Acting as:** `docs-engineer` + `product-manager`
> **Diagram Source:** `sd.drawio`

---

## System Overview

SafeDrop is a Web3 security platform that verifies ownership (Vault + Grind) while protecting airdrop campaigns from Sybil/drainer risk.
The current flow adds email-code sign-up, immediate 2FA setup, and partner analytics.

---

## Architecture (Mermaid)

```mermaid
graph TD
    subgraph Client
        U[User] -->|HTTPS| FE[Frontend WebApp]
    end

    subgraph Backend
        FE -->|HTTPS| GW[API Gateway Public]
        GW --> AUTH[Auth & 2FA Service]
        GW --> WV[Wallet Verification Service]
        GW --> PA[Partner Analytics Service]
        WV --> EX[Exchange API]
        WV --> BG[Blockchain API Gateway]
    end

    subgraph ThirdParty
        EX[Exchange API] --> CEX[Binance, OKX, ...]
        BG --> RPC[Blockchain Node API]
    end
```

---

## User Flow (Updated)

1. Sign in via Google or wallet (linked accounts only) or sign up via email code.
2. After sign-up, user completes 2FA setup (Google Authenticator).
3. 2FA required for link/add/change actions (vault/burner/social/security).
4. Vault verification: signature challenge -> CEX API -> DeBank first 3 deposits.
5. Grind verification: must have at least 1 inbound deposit -> CEX API proof.
6. Dual-signature linking (Vault + Grind).
7. Socials linking + optional passkey/biometric SSO.

---

## Flow 1: Auth + Vault Verification

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend
    participant GW as API Gateway
    participant AUTH as Auth Service
    participant WV as Wallet Verification

    U->>FE: Sign up via email code
    FE->>GW: POST /api/auth/email/start
    FE->>GW: POST /api/auth/email/verify
    GW->>AUTH: Create session
    U->>FE: Setup 2FA (TOTP)
    FE->>GW: POST /api/auth/2fa/setup

    U->>FE: Connect Vault + sign challenge
    FE->>GW: POST /api/wallets/verify-vault
    GW->>WV: Verify via CEX + DeBank
    WV-->>GW: Vault verified
    GW-->>FE: Result
```

---

## Flow 2: Grind Verification + Linking

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend
    participant GW as API Gateway
    participant WV as Wallet Verification

    U->>FE: Connect Grind wallet
    FE->>GW: POST /api/wallets/verify-grind
    GW->>WV: Conditional verification
    WV-->>GW: Status
    FE->>GW: POST /api/wallets/link-grind
    GW-->>FE: Linked
```

---

## Flow 3: Partner Analytics

```mermaid
sequenceDiagram
    participant P as Partner
    participant GW as API Gateway
    participant PA as Partner Analytics

    P->>GW: GET /api/partners/analytics
    GW->>PA: Read aggregates + time-series
    PA-->>GW: Metrics + freshness
    GW-->>P: Response
```

---

## API Endpoints (Current)

### Auth & Identity
- POST /api/auth/email/start
- POST /api/auth/email/verify
- POST /api/auth/oauth/google
- POST /api/auth/wallet/challenge
- POST /api/auth/wallet/verify
- POST /api/auth/2fa/setup
- POST /api/auth/2fa/verify
- POST /api/auth/2fa/disable

### Wallet Verification
- POST /api/wallets/verify-vault
- POST /api/wallets/verify-grind
- POST /api/wallets/link-grind
- POST /api/wallets/verify-vault-recovery
- POST /api/wallets/relink-grind

### Partner API
- POST /api/partners/register
- POST /api/campaigns
- GET /api/campaigns/:id
- PATCH /api/campaigns/:id/close
- GET /api/partners/analytics

---

## Exchanges & Chains

- **Exchanges:** Binance, OKX, Bybit, Bitget, BingX, Gate, Kucoin, MEXC, Kraken
- **Chains:** EVM (Ethereum + L2s), Solana
