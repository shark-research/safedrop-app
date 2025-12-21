# Architecture - Frontend (`safedrop-front-main`)

## Executive Summary
The frontend is a Next.js 16 application that drives the SafeDrop auth and verification flows. It supports email-code sign-up, wallet and OAuth sign-in for linked accounts, 2FA onboarding, Vault/Grind verification with multi-CEX fallback, recovery, and partner analytics UI. It integrates with the backend via a typed API client layer and guides users through dual-signature linking.

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

### 1. Auth + Security UI (Planned)
- Sign-in/sign-up routes and account linking screens.
- 2FA setup and step-up prompts for sensitive actions.
- Socials and passkeys (WebAuthn) enrollment.

### 2. Verification Flows (Planned)
- Vault verification: signature challenge, CEX API, first 3 deposits.
- Grind verification: on-chain analysis, CEX selection, dual signatures.
- Recovery flow: compromised vault alert and relink wizard.

### 3. Partner Portal (Planned)
- Campaign list and creation.
- Trust score lookup and analytics dashboard.

### 4. API Layer (`src/api`)
- Planned modules: `authApi`, `securityApi`, `vaultApi`, `grindApi`, `partnerApi`.
- Centralizes retries, errors, and response typing.

### 5. UI System (`src/components`)
Reusable components (buttons, modals, motion utilities).

## Development Workflow
See `docs/development-guide.md`.
