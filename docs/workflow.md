# SafeDrop — Архитектура и Рабочий Процесс

> **Acting as:** `docs-engineer` + `product-manager` агенты
> **Источник:** [sd.drawio](file:///c:/Users/karte/Downloads/safedrop-app/sd.drawio)

---

## Обзор Системы

SafeDrop — платформа для безопасной верификации и защиты airdrop-участников от Sybil-атак и drainer-скамов.

```mermaid
graph TD
    subgraph "Client Layer"
        U[👤 User] -->|HTTPS| FE[Frontend WebApp]
        TS[🔌 Third-party Service] -->|HTTPS| IGW[Internal API Gateway]
    end
    
    subgraph "Frontend"
        FE -->|JS API| CW[CryptoWallet App<br/>MetaMask, Phantom]
    end
    
    subgraph "Backend Services"
        FE -->|HTTPS| GW[API Gateway Public]
        GW --> VS[Verification Service]
        GW --> VRS[Verification Request Service]
        IGW --> VRS
        VS --> EA[Exchange API<br/>Binance, OKX...]
        VS --> BGA[Blockchain API Gateway<br/>Infura, Moralis]
        IGW --> PS[Payments Service]
    end
    
    subgraph "Third-party APIs"
        CW -->|Tx Sign| BN[Blockchain Node API]
        BGA --> BN
    end
```

---

## Компоненты Системы

### 1. Client Layer (Уровень Клиента)

| Компонент | Описание | Протокол |
|-----------|----------|----------|
| **User (Client)** | Конечный пользователь приложения | HTTPS |
| **Frontend (WebApp)** | Next.js 16 + React 19 приложение | HTTPS, JS API |
| **Third-party Service** | Внешние интеграции (партнёры) | HTTPS |

### 2. Backend Layer

| Компонент | Описание | Связь |
|-----------|----------|-------|
| **API Gateway (Public)** | Публичный входной шлюз | Frontend → Backend |
| **API Gateway (Internal)** | Приватный шлюз для партнёров | Third-party → Backend |
| **Verification Service** | Верификация CEX аккаунтов | → Exchange API |
| **Verification Request Service** | Обработка запросов верификации | API Gateways |
| **Payments Service** | Обработка платежей | Internal Gateway |

### 3. Third-party Integrations

| Сервис | Примеры | Назначение |
|--------|---------|------------|
| **CryptoWallet App** | MetaMask, Phantom | Подпись транзакций |
| **Exchange API** | Binance, OKX, Bybit... | Верификация CEX |
| **Blockchain API Gateway** | Infura, Moralis | RPC endpoints |
| **Blockchain Node API** | Ethereum, Solana | Запись транзакций |

---

## Потоки Данных

### Flow 1: Верификация Пользователя

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend
    participant GW as API Gateway
    participant VS as Verification Service
    participant EX as Exchange API
    
    U->>FE: 1. Connect Wallet
    FE->>FE: 2. Get wallet address
    U->>FE: 3. Enter CEX API Keys
    FE->>GW: 4. POST /api/verification
    GW->>VS: 5. Forward request
    VS->>EX: 6. Query deposit history
    EX-->>VS: 7. Return wallet matches
    VS-->>GW: 8. {found: true/false}
    GW-->>FE: 9. Verification result
    FE-->>U: 10. Display status
```

### Flow 2: Транзакция (Платёж)

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend
    participant CW as Crypto Wallet
    participant BC as Blockchain
    
    U->>FE: 1. Initiate payment
    FE->>CW: 2. Request tx signature
    CW->>U: 3. Confirm transaction
    U->>CW: 4. Approve
    CW->>BC: 5. Broadcast transaction
    BC-->>CW: 6. Tx hash
    CW-->>FE: 7. Confirm success
    FE-->>U: 8. Payment complete
```

### Flow 3: Third-party Integration (B2B)

```mermaid
sequenceDiagram
    participant TP as Third-party Service
    participant IGW as Internal Gateway
    participant VRS as Verification Request Service
    participant PS as Payments Service
    
    TP->>IGW: 1. HTTPS Request
    IGW->>VRS: 2. Process verification
    VRS-->>IGW: 3. Status
    IGW->>PS: 4. Process payment (if needed)
    PS-->>IGW: 5. Payment result
    IGW-->>TP: 6. Response
```

---

## Сетевая Архитектура

```
┌─────────────────────────────────────────────────────────────────┐
│                         PUBLIC NETWORK                          │
│  ┌──────────┐    ┌──────────────┐    ┌────────────────────┐    │
│  │  User    │───→│   Frontend   │───→│  API Gateway       │    │
│  └──────────┘    │   (WebApp)   │    │  (Public)          │    │
│                  └──────┬───────┘    └─────────┬──────────┘    │
│                         │                      │                │
│  ┌──────────────────────┴──────────────────────┴─────────────┐ │
│  │                     PRIVATE NETWORK                        │ │
│  │  ┌─────────────────┐    ┌─────────────────────────────┐   │ │
│  │  │ Third-party     │───→│ API Gateway (Internal)      │   │ │
│  │  │ Service         │    └──────────────┬──────────────┘   │ │
│  │  └─────────────────┘                   │                  │ │
│  │                                        ▼                  │ │
│  │  ┌───────────────────────────────────────────────────┐   │ │
│  │  │                   BACKEND                          │   │ │
│  │  │  ┌─────────────────┐   ┌──────────────────────┐   │   │ │
│  │  │  │ Verification    │   │ Verification Request │   │   │ │
│  │  │  │ Service         │   │ Service              │   │   │ │
│  │  │  └────────┬────────┘   └──────────────────────┘   │   │ │
│  │  │           │            ┌──────────────────────┐   │   │ │
│  │  │           │            │ Payments Service     │   │   │ │
│  │  │           │            └──────────────────────┘   │   │ │
│  │  └───────────┼───────────────────────────────────────┘   │ │
│  └──────────────┼───────────────────────────────────────────┘ │
│                 │                                              │
│  ═══════════════│══════════════════════════════════════════   │
│                 │          THIRD-PARTY SERVICES                │
│                 ▼                                              │
│  ┌──────────────────────┐  ┌──────────────────────────────┐   │
│  │ Exchange API         │  │ Blockchain API Gateway       │   │
│  │ (Binance, OKX...)    │  │ (Infura, Moralis)            │   │
│  └──────────────────────┘  └───────────────┬──────────────┘   │
│                                             │                  │
│  ┌──────────────────────┐  ┌───────────────▼──────────────┐   │
│  │ CryptoWallet App     │  │ Blockchain Node API          │   │
│  │ (MetaMask, Phantom)  │──│                              │   │
│  └──────────────────────┘  └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Ключевые API Endpoints

### POST /api/verification

Проверка соответствия кошелька CEX-аккаунту.

**Request:**
```json
{
  "exchange": "binance",
  "key": "API_KEY",
  "secret": "API_SECRET",
  "passphrase": "PASSPHRASE",
  "wallet": "0x..."
}
```

**Response:**
```json
{
  "found": true
}
```

---

## Поддерживаемые Интеграции

### Биржи (CEX)
| Exchange | Status |
|----------|--------|
| Binance | ✅ Active |
| OKX | ✅ Active |
| Bybit | ✅ Active |
| KuCoin | ✅ Active |
| Bitget | ✅ Active |
| MEXC | ✅ Active |
| Kraken | ✅ Active |
| BingX | ✅ Active |
| Gate.io | ❌ Disabled |

### Блокчейны
| Chain | Type | Status |
|-------|------|--------|
| Ethereum | EVM | ✅ |
| BSC | EVM | ✅ |
| Polygon | EVM | ✅ |
| Arbitrum | EVM | ✅ |
| Optimism | EVM | ✅ |
| Base | EVM | ✅ |
| Linea | EVM | ✅ |
| Solana | Non-EVM | ✅ |

---

## See Also

- [Project Overview](./project-overview.md)
- [Architecture - Frontend](./architecture-frontend.md)
- [Architecture - Backend](./architecture-backend.md)
- [API Contracts](./api-contracts.md)
