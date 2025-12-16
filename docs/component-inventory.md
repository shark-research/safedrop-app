# Component Inventory

> **Source of truth for all UI components in SafeDrop frontend**

## Overview

| Category | Count | Location |
|----------|-------|----------|
| **UI Components** | 2 | `src/components/` |
| **Pages** | 1 | `src/app/page.tsx` |
| **Providers** | 1 | `src/providers/` |

---

## UI Components

### Button (`src/components/button/button.tsx`)

**Purpose:** Primary action button with gradient styling.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"primary" \| "secondary"` | `"primary"` | Visual style |
| `children` | `ReactNode` | - | Button content |
| `className` | `string` | `""` | Additional CSS classes |
| `...props` | `ButtonHTMLAttributes` | - | Native button props |

**Variants:**
- **Primary:** `bg-gradient-to-r from-sefa-cyan to-sefa-mint`
- **Secondary:** `border border-sefa-cyan` (transparent background)

**Usage:**
```tsx
import { Button } from '@/components/button/button';

<Button variant="primary" onClick={handleClick}>
  Next Step
</Button>
```

---

### Info Modal (`src/components/info/info.tsx`)

**Purpose:** Modal overlay displaying CEX API key creation instructions with screenshots.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `current` | `ExchangeType` | Selected exchange |
| `open` | `boolean` | Modal visibility |
| `setOpen` | `(b: boolean) => void` | Toggle callback |

**Supported Exchanges:**
- `binance`, `bingx`, `bitget`, `bybit`, `gate`, `kraken`, `kucoin`, `mexc`, `okx`

**Assets Required:**
- `/assets/{exchange}/screen1.jpg` (or `.png` for Binance)
- Optional: `/assets/{exchange}/screen2.jpg`

**Usage:**
```tsx
import { Info } from '@/components/info/info';

<Info 
  current="binance" 
  open={showInfo} 
  setOpen={setShowInfo} 
/>
```

---

## Pages

### Main Page (`src/app/page.tsx`)

**Purpose:** 4-step verification wizard.

**Steps:**
1. **Connect Wallet** - EVM (RainbowKit) or Solana (Wallet Adapter)
2. **Connect Exchange** - API key input + verification
3. **Transaction** - Payment from wallet
4. **Verification** - Connect new wallet + finish

**Size:** ~60KB (large, consider splitting)

---

## Providers

### Web3Provider (`src/providers/Web3Provider.tsx`)

**Purpose:** Wraps app with wallet connection contexts.

**Integrations:**
- RainbowKit + Wagmi (EVM chains)
- Solana Wallet Adapter

---

## CSS System

### Design Tokens (`src/app/globals.css`)

```css
:root {
  --background: #0a0a0a;
  --foreground: #ededed;
  --sefa-mint: #22D3EE;
  --sefa-cyan: #22D3EE;
  --dark: #191919;
}
```

### Tailwind Theme Extensions

- Gradient utilities: `from-sefa-cyan`, `to-sefa-mint`
- Custom colors: `bg-dark`, `text-sefa-cyan`

---

## Roadmap

### Planned Components
- [ ] `Stepper` - Visual progress indicator (extracted from page.tsx)
- [ ] `WalletCard` - Unified wallet display
- [ ] `ExchangeSelector` - Dropdown with passphrase detection
- [ ] `TransactionPreview` - Human-readable tx confirmation
