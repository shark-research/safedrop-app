# Source Tree Analysis

## Directory Structure Overview

The project is split into two main root directories within the repository:

### 1. Frontend (`safedrop-front-main/`)

Next.js 16 application using App Router.

```
safedrop-front-main/
├── public/              # Static assets (images, icons)
├── src/
│   ├── api/             # API client functions (calls backend)
│   ├── app/             # Application routes (Next.js App Router)
│   ├── components/      # Reusable React components
│   └── providers/       # Global providers (Web3Modal, Theme)
├── .env                 # Environment variables
├── next.config.ts       # Next.js configuration
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

### 2. Backend (`safedrop-back-main/`)

NestJS 11 application tailored for exchange verification.

```
safedrop-back-main/
├── src/
│   ├── verification/    # Core logic (Controller, Service, DTOs)
│   │   ├── dto/         # Data Transfer Objects
│   │   ├── verification.controller.ts # Entry point for /api/verification
│   │   └── verification.service.ts    # Router logic
│   ├── binance/         # Binance integration
│   ├── bingx/           # BingX integration
│   ├── bitget/          # Bitget integration
│   ├── bybit/           # Bybit integration
│   ├── gate/            # Gate.io integration
│   ├── kraken/          # Kraken integration
│   ├── kucoin/          # KuCoin integration
│   ├── mexc/            # MEXC integration
│   ├── okx/             # OKX integration
│   ├── logger/          # Custom logging service
│   ├── app.module.ts    # Root application module
│   └── main.ts          # Application entry point
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript configuration
```

## Critical Files

- **Entry Points**:
  - Frontend: `safedrop-front-main/src/app/layout.tsx` (implied)
  - Backend: `safedrop-back-main/src/main.ts`

- **Configuration**:
  - Frontend: `next.config.ts`, `tailwind.config.ts` (implied)
  - Backend: `.env` (managed locally)

- **Integration**:
  - Frontend API calls: Located in `safedrop-front-main/src/api/` matches backend endpoints.
