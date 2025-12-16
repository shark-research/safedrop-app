# SafeDrop Master Documentation Part 1 (PRODUCTION FINAL v2)

> **Status:** PRODUCTION READY - ALL CONFLICTS FIXED
> **Last Updated:** December 2025
> **Fixes Applied:** Opacity classes, Shadcn theming lock, single tailwind.config, icon policy clarified

---

## 📋 СОДЕРЖАНИЕ

- [VERSION LOCK](#version-lock) - Зафиксированные версии
- [MASTER_CONTEXT](#master-context) - Технический устав
- [UX_PRINCIPLES](#ux-principles) - Психология и паттерны
- [SECURITY_PATTERNS](#security-patterns) - Логика защиты
- [PROMPT_PROTOCOL](#prompt-protocol) - Шаблоны задач

---

<a name="version-lock"></a>
# VERSION LOCK

> **CRITICAL:** These versions are LOCKED. Do not upgrade without updating docs.

```json
{
  "next": "16.0.1",
  "react": "19.2.0",
  "wagmi": "2.19.1",
  "viem": "2.38.5",
  "@rainbow-me/rainbowkit": "2.2.9",
  "tailwindcss": "4.0.0",
  "@arco-design/web-react": "2.60.3",
  "shadcn": "2.1.6",
  "tailwindcss-animate": "1.0.7"
}
```

> ⚠️ **NO CARET (^)**: All versions are EXACT. Use package-lock.json as source of truth.

## ⚠️ THEMING LOCK (CRITICAL)

```
Repo theming mode: HSL tokens ONLY
Forbidden: OKLCH, @theme inline, CSS Color Level 4

When running `npx shadcn@2.1.6 init` or `npx shadcn@2.1.6 add`:
- ALWAYS choose HSL when prompted for color format
- NEVER copy tokens from current shadcn docs (they use OKLCH)
- Use PINNED version shadcn@2.1.6, NOT @latest
```

**Wagmi Hooks Reference:** [wagmi.sh/react/api/hooks](https://wagmi.sh/react/api/hooks) (v2.19.x)

## 🎨 ICON POLICY (CLARIFIED)

```
Primary: @phosphor-icons/react ONLY

Exception: Shadcn-generated components (sonner.tsx, etc.)
- Shadcn may include lucide-react internally
- DO NOT manually add lucide-react imports
- After `npx shadcn add`, replace lucide icons with Phosphor equivalents

Verification: grep for lucide-react imports in YOUR code (not node_modules)
```

---

<a name="master-context"></a>
# 1. MASTER_CONTEXT.md

> **Single Source of Truth для технического стека**

## ⚠️ ZERO TOLERANCE CONSTRAINTS

### BACKEND IS READ-ONLY
```
Путь: safedrop-back-main/
✅ Можно: ЧИТАТЬ для API contracts
❌ Нельзя: Изменять/удалять/добавлять файлы
```

### NO EXTERNAL DESIGN TOOLS
```
❌ Figma, Framer (продукт), Sketch, Adobe XD
✅ Код-first design в IDE
```

### HYBRID FRONTEND (СТРОГОЕ РАЗДЕЛЕНИЕ)

| Context | Stack | Icons | Styling | Forbidden |
|---------|-------|-------|---------|-----------|
| **B2C App** | Shadcn + Tailwind | Phosphor | Utility CSS | Arco components |
| **B2B Dashboard** | Arco Design | Phosphor | CSS-in-JS | Tailwind on components |

---

## 🛠️ TECH STACK (LOCKED VERSIONS)

### 🎨 B2C Stack

**Framework:**
- **Next.js** 16.0.1 → [nextjs.org/docs](https://nextjs.org/docs)
- **React** 19.2.0 → [react.dev](https://react.dev)
- **TypeScript** 5.x

**UI System:**
- **Shadcn/ui** 2.1.6 (PINNED) → [ui.shadcn.com](https://ui.shadcn.com)
  ```bash
  # IMPORTANT: Use pinned version, NOT @latest
  npx shadcn@2.1.6 init
  # When asked about theming: choose HSL (NOT OKLCH)
  npx shadcn@2.1.6 add button card dialog sheet alert badge
  
  # After adding components, verify no lucide leaked in:
  grep -r "lucide-react" src/components/ui/
  # Replace any found with Phosphor equivalents
  ```
- **Tailwind CSS** 4.0.0 → [tailwindcss.com](https://tailwindcss.com)

**UI Libraries:**
- **Sonner** → [sonner.emilkowal.ski](https://sonner.emilkowal.ski)
- **Vaul** → [vaul.emilkowal.ski](https://vaul.emilkowal.ski)
- **CMDK** → [cmdk.paco.me](https://cmdk.paco.me)
- **Framer Motion** 11.x → [framer.com/motion](https://www.framer.com/motion)

**Forms:**
- **React Hook Form** → [react-hook-form.com](https://react-hook-form.com)
- **Zod** → [zod.dev](https://zod.dev)

**Web3:**
- **RainbowKit** 2.2.9 → [rainbowkit.com](https://rainbowkit.com)
- **Wagmi** 2.19.1 → [wagmi.sh](https://wagmi.sh) **(v2.x docs ONLY)**
- **Viem** 2.38.5 → [viem.sh](https://viem.sh)
- **Solana Wallet Adapter** 0.15.39

**Data & State:**
- **@tanstack/react-query** 5.x → [tanstack.com/query](https://tanstack.com/query)
- **TanStack Table** 8.x → [tanstack.com/table](https://tanstack.com/table)
- **Axios** 1.7.x

**Icons (SINGLE SOURCE):**
- **@phosphor-icons/react** 2.1.0 → [phosphoricons.com](https://phosphoricons.com)
  ```bash
  npm install @phosphor-icons/react@2.1.0
  ```
  **FORBIDDEN in YOUR code:** lucide-react, react-icons, heroicons
  **Exception:** Shadcn internals may use lucide (replace after generation)

### 🏢 B2B Stack

**Design System (SINGLE CHOICE):**
- **Arco Design** 2.60.x → [arco.design/react/docs/start](https://arco.design/react/docs/start)
  ```bash
  npm install @arco-design/web-react@^2.60.0
  ```

**Styling Rules (STRICT):**
```
✅ Arco CSS-in-JS: ALL component styles
✅ Tailwind: ONLY layout (container, grid, flex, gap)
❌ Tailwind: NEVER on Arco components
❌ Shadcn: B2C only
```

**Data Visualization:**
- **Apache ECharts** 5.5.x → [echarts.apache.org](https://echarts.apache.org)
- **AntV G6** 5.x → [g6.antv.antgroup.com](https://g6.antv.antgroup.com)

**FORBIDDEN в B2B:**
- ❌ Ant Design (antd)
- ❌ ProComponents
- ❌ Shadcn components

---

## 💎 DESIGN TOKENS (HSL FORMAT + OPACITY SUPPORT)

### Theming Mode
```
Format: HSL with alpha-value placeholder for opacity classes
NOT using: OKLCH, @theme inline
Reason: Wider browser support, Tailwind opacity utilities work (bg-primary/50)
```

### Color System
```css
/* styles/globals.css */

@layer base {
  :root {
    /* Base Colors (HSL - RAW VALUES for opacity support) */
    --background: 0 0% 4%;        /* #0a0a0a */
    --foreground: 0 0% 93%;       /* #ededed */
    --card: 0 0% 10%;             /* #191919 */
    --card-foreground: 0 0% 93%;
    
    /* Brand Primary (HSL) */
    --primary: 188 86% 54%;       /* #22D3EE */
    --primary-foreground: 0 0% 0%;
    
    /* Risk Colors (HSL) */
    --risk-safe: 160 84% 39%;     /* #10B981 - Green */
    --risk-warn: 38 92% 50%;      /* #F59E0B - Yellow */
    --risk-crit: 0 84% 60%;       /* #EF4444 - Red */
    
    /* Muted & Accents */
    --muted: 0 0% 15%;
    --muted-foreground: 0 0% 64%;
    --accent: 0 0% 15%;
    --accent-foreground: 0 0% 93%;
    
    /* Borders */
    --border: 0 0% 15%;
    --input: 0 0% 15%;
    --ring: 188 86% 54%;
    
    /* Destructive */
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 93%;
  }
}
```

### Tailwind Config (MONOREPO STANDARD)

> ⚠️ **MONOREPO IS THE STANDARD** - All quality gates assume this structure.
> If you need single-app, adjust the paths but keep the same config format.

```typescript
// tailwind.config.ts - MONOREPO (STANDARD)
import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: [
    // ✅ MONOREPO paths - adjust app names as needed
    './apps/b2c/src/**/*.{ts,tsx}',
    './apps/b2c/components/**/*.{ts,tsx}',
    './apps/b2b/src/**/*.{ts,tsx}',
    './packages/ui-primitives/**/*.{ts,tsx}',
  ],
```

> 📝 **Shadcn Monorepo:** Each app needs its own `components.json`. See [v3.shadcn.com/docs/monorepo](https://v3.shadcn.com/docs/monorepo)

#### Full Config (applies to both)
```typescript
import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: [
    // ← Use paths from Option A or B above
  ],
  theme: {
    extend: {
      colors: {
        // ✅ Tailwind v4: <alpha-value> is OPTIONAL but still works
        // If you see it in existing code, keep it. Don't add to new tokens.
        // Both formats work in v4:
        //   'hsl(var(--primary))'              ← v4 native
        //   'hsl(var(--primary) / <alpha-value>)'  ← legacy, still works
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        // Risk colors
        risk: {
          safe: 'hsl(var(--risk-safe))',
          warn: 'hsl(var(--risk-warn))',
          crit: 'hsl(var(--risk-crit))',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
  // ✅ LOCKED: tailwindcss-animate@1.0.7 (NOT tw-animate-css)
  plugins: [require('tailwindcss-animate')],
} satisfies Config
```

**Usage (now works correctly):**
```tsx
// ✅ Opacity classes now work!
<div className="bg-risk-safe/10 text-risk-safe border border-risk-safe/20">
  Verified
</div>

<div className="bg-background/90">
  Overlay
</div>
```

---

## 📖 SETUP FOR ANTIGRAVITY IDE

### Complete Installation (EXACT VERSIONS)

> ⚠️ **NO RANGES**: All versions are pinned exactly. Use package-lock.json as source of truth.

```bash
# 1. Core (EXACT)
npm install next@16.0.1 react@19.2.0 react-dom@19.2.0

# 2. B2C Stack (PINNED shadcn)
npx shadcn@2.1.6 init  # Choose HSL theming!
npx shadcn@2.1.6 add button card dialog sheet badge alert
npm install sonner@1.7.0 vaul@1.1.0 cmdk@1.0.4
npm install framer-motion@11.15.0
npm install react-hook-form@7.54.0 zod@3.24.1

# 3. Data & State (EXACT)
npm install @tanstack/react-query@5.62.7 @tanstack/react-table@8.20.6
npm install axios@1.7.9

# 4. Web3 (LOCKED)
npm install @rainbow-me/rainbowkit@2.2.9
npm install wagmi@2.19.1 viem@2.38.5
npm install @solana/wallet-adapter-react@0.15.39

# 5. Icons (SINGLE SOURCE)
npm install @phosphor-icons/react@2.1.0

# 6. B2B Stack (EXACT - NO CARET)
npm install @arco-design/web-react@2.60.3
npm install echarts@5.5.1 @antv/g6@5.0.24

# 7. Dev Tools
npm install -D @types/node@22.10.2 @types/react@19.0.1
npm install -D eslint@9.16.0 prettier@3.4.2
npm install -D @playwright/test@1.49.1
npm install -D eslint-plugin-import@2.31.0

# 8. Tailwind v4 (EXACT)
npm install tailwindcss@4.0.0 tailwindcss-animate@1.0.7

# 9. Post-install: Replace lucide in generated shadcn components
grep -r "lucide-react" src/components/ui/ && echo "⚠️ Replace with Phosphor"
```

### Environment Config

```env
# .env.local
NEXT_PUBLIC_PROJECT_ID=your_walletconnect_id
NEXT_PUBLIC_API_SERVER_URL=http://localhost:3001
NEXT_PUBLIC_WALLET=0x...
NEXT_PUBLIC_WALLET_SOL=...
NEXT_PUBLIC_AMOUNT=0.001
```

### components.json Check

After `npx shadcn init`, verify:
```json
// components.json
{
  "style": "default",
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css"
  },
  // ⚠️ If iconLibrary is "lucide", components will have lucide imports
  // Replace them with Phosphor after generation
}
```

---

<a name="ux-principles"></a>
# 2. UX_PRINCIPLES.md

> **Operational Logic для UI/UX решений**

## 🧠 CORE PHILOSOPHY

SafeDrop = **Security Product**

### Trust Rules

1. **Zero Jankiness** → CLS = 0
2. **Explain Why** → Never block без объяснения
3. **Vault Mental Model** → Постоянно reinforce изоляцию

---

## 📚 BEHAVIORAL PSYCHOLOGY

### Hook Model (Nir Eyal)

| Stage | B2C Example | B2B Example |
|-------|-------------|-------------|
| **Trigger** | Email: "Wallet High Risk" | Slack: "Sybil detected" |
| **Action** | < 2 clicks to Scan | ProTable filter |
| **Variable Reward** | "100% Safe" | "Prevented $50k loss" |
| **Investment** | Add API key | Create whitelist |

### System 1 vs System 2

**B2C (System 1):** Big buttons, Green/Red, Shadcn/ui  
**B2B (System 2):** High density, Shortcuts, Arco Design

### Loss Aversion

| ❌ Avoid | ✅ Use |
|---------|-------|
| "Get safe airdrops" | "Stop losing 40% to Sybils" |

---

## 📝 TYPOGRAPHY

| Element | Font | Use Case |
|---------|------|----------|
| **H1** | Clash Display | Value props |
| **Body** | Geist Sans | Instructions |
| **Data** | Geist Mono | Hashes, Prices, API Keys |

**Rule:** `font-mono tabular-nums` для всех чисел

---

## 💬 MICRO-COPY

### Concise
| ❌ Bad | ✅ Good |
|-------|--------|
| "Please click to verify" | "Verify Wallet" |

### No Technobabble
| ❌ Bad | ✅ Good |
|-------|--------|
| "RPC Error 400" | "Network Error" |

---

<a name="security-patterns"></a>
# 3. SECURITY_PATTERNS.md

> **Strict UI Rules для asset interactions**

## 🎯 FRICTION MATRIX

| Risk | Friction | UI Pattern | Timing |
|------|----------|------------|--------|
| **safe** | None | Standard button | Instant |
| **warn** | Confirmation | Alert + Checkbox | Instant |
| **crit** | High | Timer + Slide | 3 sec |

---

## 🛑 INTENTIONAL FRICTION

### TimerButton (FIXED - FINAL VERSION)

```typescript
// components/ui/timer-button.tsx
import { useState, useEffect, useRef } from 'react';
import { Button } from './button';

interface TimerButtonProps {
  onConfirm: () => void;
  children: React.ReactNode;
  delay?: number;
}

export function TimerButton({ 
  onConfirm, 
  children, 
  delay = 3 
}: TimerButtonProps) {
  const [countdown, setCountdown] = useState(delay);
  const [enabled, setEnabled] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Reset on delay change
    setCountdown(delay);
    setEnabled(false);
    
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Start countdown
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setEnabled(true);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [delay]); // ← CRITICAL: Reset on delay change

  return (
    <Button 
      disabled={!enabled} 
      onClick={onConfirm}
      className="relative"
    >
      {!enabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-md">
          <span className="font-mono text-2xl tabular-nums">
            {countdown}
          </span>
        </div>
      )}
      {children}
    </Button>
  );
}
```

---

## 👤 ADDRESS HUMANIZATION (FIXED - next/image)

```typescript
// components/ui/address-chip.tsx
import { useState } from 'react';
import Image from 'next/image';
import { Copy, Check } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/types/risk';

interface AddressChipProps {
  address: string;
  label?: string;
  ens?: string;
  risk?: RiskLevel;
  showCopy?: boolean;
  showAvatar?: boolean;
}

export function AddressChip({ 
  address, 
  label, 
  ens,
  risk = 'safe',
  showCopy = true,
  showAvatar = true 
}: AddressChipProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border",
      risk === 'safe' && "bg-risk-safe/10 text-risk-safe border-risk-safe/20",
      risk === 'warn' && "bg-risk-warn/10 text-risk-warn border-risk-warn/20",
      risk === 'crit' && "bg-risk-crit/10 text-risk-crit border-risk-crit/20"
    )}>
      {showAvatar && (
        <Image 
          src={`https://source.boringavatars.com/beam/24/${address}`}
          width={20}
          height={20}
          alt=""
          className="rounded-full"
          unoptimized // External URL
        />
      )}

      <span className="font-mono text-sm tabular-nums">
        {label || ens || `${address.slice(0, 6)}...${address.slice(-4)}`}
      </span>

      {showCopy && (
        <button 
          onClick={handleCopy}
          className="hover:opacity-70 transition-opacity"
          aria-label="Copy address"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      )}

      <div className={cn("w-2 h-2 rounded-full", {
        'bg-risk-safe': risk === 'safe',
        'bg-risk-warn': risk === 'warn',
        'bg-risk-crit': risk === 'crit',
      })} />
    </div>
  );
}
```

### next.config.js for boringavatars

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.boringavatars.com',
        pathname: '/beam/**',
      },
    ],
  },
};
```

---

<a name="prompt-protocol"></a>
# 4. PROMPT_PROTOCOL.md

> **Template для постановки задач**

## 📋 TASK TEMPLATE

```markdown
### Role
@frontend-implementer @ui-designer

### Task
[Component/Screen Name]

### Context
[ ] B2C App (Shadcn + Tailwind)
[ ] B2B Dashboard (Arco CSS-in-JS)

---

## 1. Requirements

**Input:** [User action]
**Output:** [UI state]

**Constraints:**
- **Stack:** [Shadcn Dialog OR Arco Drawer]
- **Security:** Follow SECURITY_PATTERNS friction matrix
- **Data:** Use `tabular-nums font-mono` for numbers
- **Icons:** @phosphor-icons/react ONLY (replace any lucide after shadcn add)

---

## 2. Acceptance Criteria

### Functionality
- [ ] Dark theme
- [ ] Mobile (375px)
- [ ] Loading states

### Trust & Security
- [ ] AddressChip for addresses (with next/image)
- [ ] Correct friction per risk level
- [ ] Numbers use `tabular-nums`

### Code Quality
- [ ] No inline styles
- [ ] TypeScript types
- [ ] Phosphor icons only (no lucide in your code)

---

## 3. Command
Generate code.
```

---

# END OF PART 1 (FINAL v3)

**✅ FIXED IN THIS VERSION:**
- ✅ Exact versions (no caret ^)
- ✅ Tailwind v4: `<alpha-value>` optional, both formats work
- ✅ Single-app vs Monorepo options documented
- ✅ Shadcn theming lock: HSL only, pinned version @2.1.6
- ✅ Animation: tailwindcss-animate@1.0.7 (NOT tw-animate-css)
- ✅ AddressChip: next/image instead of img

---

## 📚 ESLINT: BLOCK LUCIDE IN YOUR CODE

Add to `.eslintrc.json`:
```json
{
  "rules": {
    "no-restricted-imports": ["error", {
      "paths": [{
        "name": "lucide-react",
        "message": "Use @phosphor-icons/react instead. Lucide only allowed in /components/ui (shadcn internals)."
      }],
      "patterns": [{
        "group": ["lucide-react/*"],
        "message": "Use @phosphor-icons/react instead."
      }]
    }]
  },
  "overrides": [{
    "files": ["**/components/ui/**/*.tsx"],
    "rules": {
      "no-restricted-imports": "off"
    }
  }]
}
```

This allows lucide-react only in `components/ui/` (shadcn internals) and blocks it everywhere else.

---

## 🚀 SAAS REFERENCE LIBRARIES (BUILD MVP FAST)

### UI Primitives & Accessibility
| Library | Purpose | Link |
|---------|---------|------|
| **Radix Primitives** | Headless components, shadcn base | [radix-ui.com](https://radix-ui.com/primitives) |
| **React Aria** | Accessibility base | [react-spectrum.adobe.com](https://react-spectrum.adobe.com/react-aria) |
| **Headless UI** | Minimal headless components | [headlessui.com](https://headlessui.com) |
| **Ark UI** | Modern headless | [ark-ui.com](https://ark-ui.com) |

### Chinese Enterprise UI (Premium Look)
| Library | Purpose | Link |
|---------|---------|------|
| **Semi Design** | B2B interfaces | [semi.design](https://semi.design) |
| **TDesign** | Tencent patterns | [tdesign.tencent.com](https://tdesign.tencent.com) |
| **Arco Design** | Our B2B stack | [arco.design](https://arco.design) |

### Tokens & Palettes
| Library | Purpose | Link |
|---------|---------|------|
| **Radix Colors** | Ready-made scales | [radix-ui.com/colors](https://radix-ui.com/colors) |
| **Open Props** | CSS variables | [open-props.style](https://open-props.style) |

### Tables & Dashboards
| Library | Purpose | Link |
|---------|---------|------|
| **TanStack Table** | Headless tables | [tanstack.com/table](https://tanstack.com/table) |
| **AG Grid Community** | Complex B2B grids | [ag-grid.com](https://ag-grid.com) |
| **Tremor** | Dashboard blocks | [tremor.so](https://tremor.so) |

### Templates & Blocks
| Library | Purpose | Link |
|---------|---------|------|
| **shadcn blocks** | Ready sections | [ui.shadcn.com/blocks](https://ui.shadcn.com/blocks) |
| **shadcn Registry** | Community components | [ui.shadcn.com/docs/directory](https://ui.shadcn.com/docs/directory) |
| **Aceternity UI** | WOW effects, hero, micro-interactions | [ui.aceternity.com](https://ui.aceternity.com) |
| **Vercel Templates** | Next.js examples | [vercel.com/templates](https://vercel.com/templates) |