# Architecture - Frontend (`safedrop-front-main`)

## Executive Summary
The frontend is a **Next.js 16** application delivering a modern, responsive interface for the SafeDrop platform. It handles user authentication via Web3 wallets (EVM & Solana), interacts with the backend verification API, and guides users through the exchange verification process.

## Technology Stack

| Category | Technology | Version | Justification |
|----------|------------|---------|---------------|
| **Framework** | Next.js | 16.0.1 | Server-Side Rendering, App Router architecture. |
| **UI Library** | React | 19.2.0 | Standard component-based UI. |
| **Styling** | TailwindCSS | 4.x | Utility-first styling for rapid development. |
| **Web3 (EVM)** | Wagmi + Viem | 2.19.1 | Robust hooks for Ethereum interaction. |
| **Web3 UI** | RainbowKit | 2.2.9 | Pre-built wallet connection UI. |
| **Solana** | Solana Adapter | 0.x | Solana wallet connection support. |
| **State** | React Query | 5.x | Server state management and caching. |

## Architecture Pattern
**Component-Based / Page-Driven**
- Uses **Next.js App Router** (`src/app`) for routing.
- **Client-Side Data Fetching** via React Query.
- **Web3 Contexts** (`src/providers`) wrap the application for wallet state.

## Core Modules

### 1. Web3 Integration
Handles wallet connections for both ecosystems:
- **EVM**: Configured via Wagmi/RainbowKit.
- **Solana**: Configured via `@solana/wallet-adapter-react`.

### 2. API Layer (`src/api`)
Encapsulates communication with `safedrop-back-main`.
- `verification`: Posts signed payloads to backend checks.

### 3. UI System (`src/components`)
Reusable atomic components using TailwindCSS.

## Development Workflow
(See `development-guide.md` - _To be generated_)
```bash
npm run dev
```
