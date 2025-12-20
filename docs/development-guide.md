# Development Guide

> **Getting started with SafeDrop development**

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- **Git**
- **Wallet Extension:** MetaMask or Phantom

---

## Quick Start

### Frontend Development

```bash
# Navigate to frontend
cd safedrop-front-main

# Install dependencies
npm install

# Start dev server (with Turbopack)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

For local testing, if backend is running:
```bash
cd safedrop-back-main
npm install
npm run start:dev
```

---

## Environment Setup

### Frontend `.env.local`

```env
# WalletConnect Project ID (get from cloud.walletconnect.com)
NEXT_PUBLIC_PROJECT_ID=your_project_id

# Backend API URL
NEXT_PUBLIC_API_SERVER_URL=http://localhost:3001

# Payment destination wallets
NEXT_PUBLIC_WALLET=0x...
NEXT_PUBLIC_WALLET_SOL=...

# Transaction amount
NEXT_PUBLIC_AMOUNT=0.001

# Solana RPC (optional, defaults to devnet)
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
```

### Backend `.env`

```env
PORT=3001
MODE=DEV
ORIGIN=http://localhost:3000
YEARS=1
```

---

## Project Structure

```
safedrop-app/
├── safedrop-front-main/          # ✅ EDITABLE
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Main 4-step wizard
│   │   │   ├── layout.tsx        # Root layout
│   │   │   └── globals.css       # CSS variables
│   │   ├── components/
│   │   │   ├── button/           # Primary/Secondary button
│   │   │   └── info/             # CEX instructions modal
│   │   └── providers/
│   │       └── Web3Provider.tsx  # Wallet contexts
│   ├── public/assets/            # Exchange screenshots
│   └── package.json
│
├── safedrop-back-main/           # ✅ EDITABLE
│   └── src/
│       ├── verification/         # Main API
│       └── [exchange]/           # Exchange modules
│
└── docs/                         # 📚 Documentation
```

---

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/my-feature

# Start dev server
cd safedrop-front-main && npm run dev

# Make changes...

# Build check
npm run build

# Commit
git add . && git commit -m "feat: my feature"
```

### 2. Code Quality

```bash
# Lint
npm run lint

# Type check (via build)
npm run build
```

### 3. Testing Wallet Flows

**EVM (MetaMask):**
1. Connect MetaMask to Base Sepolia testnet
2. Get testnet ETH from faucet
3. Complete 4-step flow

**Solana (Phantom):**
1. Switch Phantom to Devnet
2. Airdrop SOL via CLI: `solana airdrop 1`
3. Complete 4-step flow

---

## Key Patterns

### Wallet Connection (EVM)

```tsx
import { useAccount, useConnect, useSendTransaction } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Use the account
const { address, isConnected } = useAccount();
```

### Wallet Connection (Solana)

```tsx
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const { publicKey, sendTransaction } = useWallet();
```

### API Calls

```tsx
const verifyExchange = async (data: VerificationRequest) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json(); // { found: boolean }
};
```

---

## Common Issues

### "Module not found"
```bash
rm -rf node_modules && npm install
```

### Wallet not connecting
1. Check `NEXT_PUBLIC_PROJECT_ID` is set
2. Ensure wallet extension is installed
3. Check browser console for errors

### API CORS error
Ensure backend `ORIGIN` includes your frontend URL.

---

## Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start dev server with Turbopack |
| `build` | `npm run build` | Production build |
| `start` | `npm run start` | Start production server |
| `lint` | `npm run lint` | Run ESLint |

---

## Backend Notes (Grind Linking)

### New Endpoint
- `POST /api/verification/link-grind`

### Additional Backend Env Vars
```env
DATABASE_URL=postgres://user:pass@host:5432/db
PG_POOL_MAX=10
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
EVM_RPC_URL=https://mainnet.infura.io/v3/...
EVM_HISTORY_API_URL=https://api.etherscan.io/api
EVM_HISTORY_API_KEY=...
RPC_TIMEOUT_MS=8000
RPC_RETRY_MAX=3
RPC_RETRY_DELAY_MS=300
ADDRESS_HASH_SALT=change-me
PROJECT_INTEGRATION_URL=https://partner.example.com/api/safedrop/link
PROJECT_INTEGRATION_API_KEY=...
```
