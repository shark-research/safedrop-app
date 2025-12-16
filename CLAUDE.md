# SafeDrop - AI Agent Configuration

> This file works with: **Claude Code**, **Antigravity (Gemini)**, and any LLM that reads project files.

## 🔌 IDE/LLM Compatibility

| IDE/LLM | Config File | Status |
|---------|-------------|--------|
| **Antigravity (Gemini)** | `CLAUDE.md` (this file) | ✅ Auto |
| **Claude Code CLI** | `CLAUDE.md` (this file) | ✅ Auto |
| **Cursor** | `.cursorrules` | ✅ Auto |
| **Windsurf/Codeium** | `.windsurfrules` | ✅ Auto |
| **VS Code + Copilot** | `.vscode/settings.json` | ✅ Auto |
| **ChatGPT / GPT-o1** | Copy `.agent/prompts/system-prompt.md` | 📋 Manual |
| **Gemini Web** | Copy `.agent/prompts/system-prompt.md` | 📋 Manual |
| **Claude.ai** | Copy `.agent/prompts/system-prompt.md` | 📋 Manual |
| **API (any)** | Read `system-prompt.md` as system msg | 🔧 Code |

---

## ⚠️ BACKEND ACCESS RULE

> **`safedrop-back-main/` — READ-ONLY**
> 
> ✅ Allowed: read code, document, analyze
> ❌ Forbidden: modify, add, delete files

## Project Overview

**SafeDrop** - The Security & Verification Infrastructure for the Airdrop Economy

- **B2B (Trust Protocol API)**: Sybil-resistant audience for projects
- **B2C (Burner → Vault)**: Safe asset claiming for users
- **Audited by**: Fidesium
- **Clients**: Cedra Network, Webacy

## Tech Stack

### Frontend (safedrop-front-main/) - EDITABLE
- Next.js 16.0.1 (App Router)
- React 19.2.0
- TailwindCSS 4.x
- RainbowKit 2.2.9 + Wagmi 2.19.1 (EVM wallets)
- Solana Wallet Adapter 0.15.39

### Backend (safedrop-back-main/) - READ ONLY ⛔
- NestJS 11.1.8
- Exchange modules: Binance, BingX, Bitget, Bybit, Kraken, KuCoin, MEXC, OKX

## Supported Chains

- **EVM**: Ethereum, BSC, Polygon, Optimism, Arbitrum, Base, Linea
- **Solana**: Mainnet/Devnet (RPC configurable)

> Backend is chain-agnostic — wallets are just strings to match.

## Key Patterns

### Wallet Connection (EVM)
```tsx
import { useAccount, useConnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
```

### Wallet Connection (Solana)
```tsx
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
```

### API Call to Backend
```tsx
POST ${NEXT_PUBLIC_API_SERVER_URL}/api/verification
Body: { exchange, key, secret, passphrase?, wallet }
```

## CSS Variables
```css
--background: #0a0a0a
--foreground: #ededed
--sefa-mint: #22D3EE
--sefa-cyan: #22D3EE
--dark: #191919
```

## Available Agents (20)

See `.agent/agents/` for all specialized agents:

**Core Development:**
- `frontend-implementer` - Next.js/React code
- `backend-developer` - NestJS (⏸️ frozen)
- `nextjs-developer` - Next.js 16 App Router
- `react-specialist` - React 19 patterns
- `typescript-pro` - TypeScript types
- `blockchain-specialist` - Wagmi/Viem/Solana

**Design & UX:**
- `ui-designer` - Visual design, components
- `ux-researcher` - User research, flows

**Quality & Security:**
- `architect-reviewer` - Architecture review
- `code-reviewer` - Code quality
- `security-auditor` - Web3 security
- `qa-tester` - Testing
- `debugger` - Bug fixing
- `performance-engineer` - Web Vitals

**Business & Infrastructure:**
- `product-manager` - User stories
- `project-manager` - Coordination
- `api-designer` - API contracts
- `devops-engineer` - CI/CD
- `docs-engineer` - Documentation
- `refactoring-specialist` - Tech debt

## Workflows

- `/feature-development` - New feature flow
- `/bug-fix` - Bug fixing flow
- `/claude-setup` - Setup instructions

## Common Commands

```bash
# Start frontend dev server
cd safedrop-front-main && npm run dev

# Build frontend
cd safedrop-front-main && npm run build

# Check backend README (don't modify!)
cat safedrop-back-main/README.md
```
