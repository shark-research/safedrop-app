# Component Inventory

> **Source of truth for all UI components in SafeDrop frontend**

## Overview

| Category | Count | Location |
|----------|-------|----------|
| **UI Components** | 3 | `src/components/` |
| **Pages** | 1 | `src/app/page.tsx` |
| **Providers** | 2 | `src/providers/` |

---

## UI Components

### Button (`src/components/button/button.tsx`)

**Purpose:** Primary action button with gradient styling.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' or 'secondary'` | `'primary'` | Visual style |
| `children` | `ReactNode` | - | Button content |
| `className` | `string` | `''` | Additional CSS classes |
| `...props` | `ButtonHTMLAttributes` | - | Native button props |

**Variants:**
- **Primary:** `bg-gradient-to-r from-sefa-cyan to-sefa-mint`
- **Secondary:** `border border-sefa-cyan` (transparent background)

**Usage:**
```tsx
import { Button } from '@/components/button/button';

<Button variant='primary' onClick={handleClick}>
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
  current='binance'
  open={showInfo}
  setOpen={setShowInfo}
/>
```

---

### Animated Beam (`src/components/ui/animated-beam.tsx`)

**Purpose:** Animated SVG beam connecting two elements using a motion gradient.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `containerRef` | `RefObject<HTMLElement | null>` | - | Container element |
| `fromRef` | `RefObject<HTMLElement | null>` | - | Start element |
| `toRef` | `RefObject<HTMLElement | null>` | - | End element |
| `curvature` | `number` | `0` | Curve height |
| `reverse` | `boolean` | `false` | Reverse gradient direction |
| `pathColor` | `string` | `gray` | Base path color |
| `pathWidth` | `number` | `2` | Path stroke width |
| `pathOpacity` | `number` | `0.2` | Base path opacity |
| `gradientStartColor` | `string` | `#ffaa40` | Gradient start |
| `gradientStopColor` | `string` | `#9c40ff` | Gradient end |
| `delay` | `number` | `0` | Animation delay |
| `duration` | `number` | `6` | Animation duration |
| `startXOffset` | `number` | `0` | Start X offset |
| `startYOffset` | `number` | `0` | Start Y offset |
| `endXOffset` | `number` | `0` | End X offset |
| `endYOffset` | `number` | `0` | End Y offset |

**Usage:**
```tsx
import { AnimatedBeam } from '@/components/ui/animated-beam';

<AnimatedBeam
  containerRef={containerRef}
  fromRef={fromRef}
  toRef={toRef}
/>
```

---

## Pages

### Main Page (`src/app/page.tsx`)

**Purpose:** Legacy 4-step verification wizard (planned to be replaced by `/verify/vault` and `/verify/grind`).

**Steps:**
1. **Connect Wallet** - EVM (RainbowKit) or Solana (Wallet Adapter)
2. **Connect Exchange** - API key input + verification
3. **Transaction** - Pay from wallet
4. **Verification** - Connect new wallet + finish

**Size:** ~60KB (large, consider splitting)

---

## Providers

### Web3Provider (`src/providers/Web3Provider.tsx`)

**Purpose:** Wraps app with wallet connection contexts.

**Integrations:**
- RainbowKit + Wagmi (EVM chains)
- React Query

---

### SolanaProvider (`src/providers/SolWalletProvider.tsx`)

**Purpose:** Wraps app with Solana connection and wallet adapters.

**Integrations:**
- `@solana/wallet-adapter-react`
- `@solana/wallet-adapter-react-ui`

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

