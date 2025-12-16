# SafeDrop Extended Documentation Part 2 (PRODUCTION FINAL v2)

> **Status:** PRODUCTION READY - ALL CONFLICTS FIXED
> **Last Updated:** December 2025
> **Fixes Applied:** AddressChip next/image, opacity classes, icon consistency, no AlertTriangle

---

## 📋 СОДЕРЖАНИЕ

- [RISK_MODEL.md](#risk-model) - Матрица рисков
- [COMPONENT_CONTRACTS.md](#component-contracts) - Обязательные компоненты
- [QUALITY_GATES.md](#quality-gates) - Проверки
- [API_CLIENT_RULES.md](#api-client-rules) - API правила

---

<a name="risk-model"></a>
# 5. RISK_MODEL.md

> **Single Source of Truth для risk-related UI**

## 🚦 RISK LEVELS

### TypeScript Types

```typescript
// types/risk.ts

export type RiskLevel = 'safe' | 'warn' | 'crit';

export type RiskCategory = 
  | 'verified'
  | 'sybil'
  | 'drainer'
  | 'approval'
  | 'sanction'
  | 'new-contract'
  | 'low-reputation';

export type EvidenceSource = 
  | 'internal'
  | 'chainalysis'
  | 'trm-labs'
  | 'ofac'
  | 'etherscan';

export interface Evidence {
  date: string;
  title: string;
  description: string;
  source: EvidenceSource;
  externalLink?: string;  // Required for non-internal sources
  internalRef?: string;   // Optional reference for source='internal'
}

export interface RiskAssessment {
  level: RiskLevel;
  category: RiskCategory;
  confidence: number;
  evidence: Evidence[];
  canProceed: boolean;
}
```

---

## 📊 RISK MATRIX

| Level | Category | Tailwind Classes | Friction |
|-------|----------|------------------|----------|
| **safe** | `verified` | `text-risk-safe bg-risk-safe/10 border-risk-safe/20` | None |
| **warn** | `new-contract` | `text-risk-warn bg-risk-warn/10 border-risk-warn/20` | Alert |
| **warn** | `low-reputation` | `text-risk-warn bg-risk-warn/10 border-risk-warn/20` | Alert |
| **crit** | `sybil` | `text-risk-crit bg-risk-crit/10 border-risk-crit/20` | Timer |
| **crit** | `drainer` | `text-risk-crit bg-risk-crit/10 border-risk-crit/20` | Timer |
| **crit** | `sanction` | `text-risk-crit bg-risk-crit/10 border-risk-crit/20` | Block |

> ✅ **Tailwind v4:** Opacity classes like `/10`, `/20` work WITHOUT `<alpha-value>` in config.
> v4 uses `color-mix()` internally. See [tailwindcss.com/blog/tailwindcss-v4](https://tailwindcss.com/blog/tailwindcss-v4)

---

## 🛡️ EVIDENCE RULES

1. **Source from enum only**
2. **For crit/sanction with non-internal source: externalLink REQUIRED**
3. **For source='internal': use optional `internalRef` field instead**
4. **Never hallucinate sources**

```typescript
// ✅ Correct - external source with link
const evidence: Evidence = {
  date: '2025-12-15T10:00:00Z',
  title: 'OFAC Sanctioned',
  description: 'Address on OFAC SDN list',
  source: 'ofac',
  externalLink: 'https://sanctionssearch.ofac.treas.gov/...'
};

// ✅ Correct - internal source, no externalLink needed
const evidence: Evidence = {
  date: '2025-12-15T10:00:00Z',
  title: 'High Risk Transaction',
  description: 'Multiple drainer interactions',
  source: 'internal',
  internalRef: 'CASE-2025-1234' // Optional internal reference
};

// ❌ Wrong - external source without link
const evidence = {
  source: 'chainalysis',
  // Missing externalLink for non-internal source!
};

// ❌ Wrong - made up source
const evidence = {
  source: 'AI Security Analysis', // Not in enum
};
```

---

<a name="component-contracts"></a>
# 6. COMPONENT_CONTRACTS.md

> **Mandatory Components**

## 🧩 CORE COMPONENTS

### 1. AddressChip (FIXED - next/image)

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
          unoptimized // External URL - skip optimization
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

**Required next.config.js:**
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

### 2. RiskBadge (PHOSPHOR ICONS ONLY)

```typescript
// components/ui/risk-badge.tsx
import { ShieldCheck, Warning, XCircle, CaretRight } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { RiskLevel, RiskCategory, Evidence } from '@/types/risk';

interface RiskBadgeProps {
  level: RiskLevel;
  category: RiskCategory;
  evidence?: Evidence[];
  onClick?: () => void;
}

export function RiskBadge({ 
  level, 
  category, 
  evidence,
  onClick 
}: RiskBadgeProps) {
  const categoryLabels: Record<RiskCategory, string> = {
    verified: "Verified",
    sybil: "Sybil Risk",
    drainer: "Drainer",
    approval: "High Approval",
    sanction: "Sanctioned",
    'new-contract': "New Contract",
    'low-reputation': "Low Reputation"
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
        level === 'safe' && "bg-risk-safe/10 text-risk-safe",
        level === 'warn' && "bg-risk-warn/10 text-risk-warn",
        level === 'crit' && "bg-risk-crit/10 text-risk-crit",
        onClick && "cursor-pointer hover:opacity-80 transition-opacity"
      )}
    >
      {/* ✅ PHOSPHOR ICONS - no lucide */}
      {level === 'safe' && <ShieldCheck size={16} weight="fill" />}
      {level === 'warn' && <Warning size={16} weight="fill" />}
      {level === 'crit' && <XCircle size={16} weight="fill" />}
      
      <span>{categoryLabels[category]}</span>
      
      {evidence && evidence.length > 0 && (
        <CaretRight size={14} />
      )}
    </button>
  );
}
```

---

### 3. Money

```typescript
// components/ui/money.tsx
interface MoneyProps {
  amount: number | string;
  symbol: string;
  decimals?: number;
  showSymbol?: boolean;
}

export function Money({ 
  amount, 
  symbol, 
  decimals,
  showSymbol = true 
}: MoneyProps) {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const finalDecimals = decimals ?? (symbol === 'USD' ? 2 : 4);
  
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: finalDecimals,
    maximumFractionDigits: finalDecimals,
  }).format(numAmount);

  return (
    <span className="font-mono tabular-nums">
      {showSymbol && symbol === 'USD' && '$'}
      {formatted}
      {showSymbol && symbol !== 'USD' && ` ${symbol}`}
    </span>
  );
}
```

---

### 4. ChainGuard (WAGMI V2)

```typescript
// components/ui/chain-guard.tsx
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { Alert, AlertTitle, AlertDescription } from './alert';
import { Button } from './button';

interface ChainGuardProps {
  requiredChainId: number;
  children: React.ReactNode;
}

export function ChainGuard({ requiredChainId, children }: ChainGuardProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  if (!isConnected) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No Wallet Connected</AlertTitle>
        <AlertDescription>
          Please connect your wallet to continue
        </AlertDescription>
      </Alert>
    );
  }
  
  if (chainId !== requiredChainId) {
    return (
      <Alert>
        <AlertTitle>Wrong Network</AlertTitle>
        <AlertDescription>
          You're connected to the wrong network.
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => switchChain?.({ chainId: requiredChainId })}
            className="mt-2"
          >
            Switch Network
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  return <>{children}</>;
}
```

**Wagmi v2 Reference:** [wagmi.sh/react/api/hooks/useSwitchChain](https://wagmi.sh/react/api/hooks/useSwitchChain)

---

### 5. TimerButton (FINAL - NO BUGS)

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
    // Reset state on delay change
    setCountdown(delay);
    setEnabled(false);
    
    // Clear existing timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Start new countdown
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

    // Cleanup on unmount or delay change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [delay]); // Re-run when delay changes

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

## 🚫 FORBIDDEN PATTERNS

```typescript
// ❌ Wrong - custom address display
<span>{addr.slice(0, 10)}...</span>

// ✅ Correct
<AddressChip address={addr} />

// ❌ Wrong - lucide icons
import { AlertTriangle } from 'lucide-react';

// ✅ Correct - Phosphor
import { Warning } from '@phosphor-icons/react';

// ❌ Wrong - img tag (lint error)
<img src={`https://.../${address}`} />

// ✅ Correct - next/image
<Image src={`https://.../${address}`} unoptimized />
```

---

<a name="quality-gates"></a>
# 7. QUALITY_GATES.md

> **Automated Checks**

## 🚨 REPO BOUNDARIES

### Monorepo Structure
```
├── apps/
│   ├── b2c/          # Shadcn + Tailwind
│   └── b2b/          # Arco CSS-in-JS
├── packages/
│   ├── shared/       # Types, utils
│   └── ui-primitives/
```

### ESLint Config

```json
// .eslintrc.json
{
  "plugins": ["import"],
  "rules": {
    "import/no-restricted-paths": ["error", {
      "zones": [
        {
          "target": "./apps/b2c",
          "from": "./apps/b2b",
          "message": "B2C cannot import from B2B"
        },
        {
          "target": "./apps/b2b",
          "from": "./apps/b2c",
          "message": "B2B cannot import from B2C"
        }
      ]
    }],
    "@next/next/no-img-element": "error"
  }
}
```

**Install:**
```bash
npm install -D eslint-plugin-import
```

---

## 🔍 CODE QUALITY

### Custom ESLint Rules

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // No inline styles
    'react/forbid-dom-props': ['error', {
      forbid: ['style']
    }],
    
    // No img element (use next/image)
    '@next/next/no-img-element': 'error',
    
    // Enforce boundaries
    'import/no-restricted-paths': ['error', {
      zones: [
        { target: './apps/b2c', from: './apps/b2b' },
        { target: './apps/b2b', from: './apps/b2c' }
      ]
    }]
  }
};
```

---

## 📊 TELEMETRY

```typescript
// lib/telemetry.ts
export type TelemetryEvent = 
  | 'risk_shown'
  | 'evidence_opened'
  | 'sign_blocked'
  | 'friction_completed'
  | 'wallet_connected'
  | 'chain_switched';

export interface TelemetryPayload {
  event: TelemetryEvent;
  userId?: string;
  walletAddress?: string;
  riskLevel?: RiskLevel;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export function track(payload: TelemetryPayload) {
  if (process.env.NODE_ENV === 'production') {
    // Analytics integration
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Telemetry:', payload);
  }
}
```

---

## ⚡ PERFORMANCE

### Dynamic Imports

```typescript
// app/dashboard/graph/page.tsx
import dynamic from 'next/dynamic';

const SybilGraph = dynamic(
  () => import('@/components/sybil-graph'),
  { 
    loading: () => <div>Loading...</div>,
    ssr: false
  }
);
```

### Next.js Config

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
  webpack: (config) => {
    config.optimization.splitChunks = {
      cacheGroups: {
        g6: {
          test: /[\\/]node_modules[\\/]@antv[\\/]g6/,
          name: 'g6',
          priority: 10,
        },
        echarts: {
          test: /[\\/]node_modules[\\/]echarts/,
          name: 'echarts',
          priority: 10,
        },
      },
    };
    return config;
  },
};
```

---

## 🧪 PLAYWRIGHT TESTS

```typescript
// tests/p0-flow.spec.ts
import { test, expect } from '@playwright/test';

test('P0: Wallet verification', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="connect-wallet"]');
  await expect(page.locator('[data-testid="risk-badge"]')).toBeVisible();
});

test('High risk shows timer', async ({ page }) => {
  await page.route('**/api/risk-check', route => {
    route.fulfill({
      json: { level: 'crit', category: 'drainer' }
    });
  });
  
  await page.goto('/');
  const timer = page.locator('[data-testid="timer-button"]');
  await expect(timer).toBeDisabled();
  await page.waitForTimeout(3500);
  await expect(timer).toBeEnabled();
});
```

---

<a name="api-client-rules"></a>
# 8. API_CLIENT_RULES.md

> **API Layer Standards**

## 📡 API CLIENT (SSR SAFE)

```typescript
// lib/api-client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_SERVER_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    config.headers['X-Request-Time'] = Date.now().toString();
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (CLIENT-SIDE ONLY)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    
    // Only toast on client
    if (typeof window !== 'undefined') {
      const { toast } = await import('sonner');
      const message = getErrorMessage(status);
      toast.error(message.title, {
        description: message.description
      });
    }
    
    return Promise.reject(error);
  }
);

function getErrorMessage(status?: number) {
  const messages: Record<number, { title: string; description: string }> = {
    400: { title: "Invalid Request", description: "Check input" },
    401: { title: "Unauthorized", description: "Session expired" },
    403: { title: "Access Denied", description: "Insufficient permissions" },
    429: { title: "Rate Limited", description: "Too many requests" },
    500: { title: "Server Error", description: "Try again later" },
  };
  
  return messages[status ?? 0] || {
    title: "Network Error",
    description: "Check connection"
  };
}
```

---

## ⚛️ REACT QUERY

```typescript
// hooks/use-wallet-verification.ts
import { useMutation } from '@tanstack/react-query';
import { verifyWallet } from '@/lib/api/verification';
import { toast } from 'sonner';

export function useWalletVerification() {
  return useMutation({
    mutationFn: verifyWallet,
    onSuccess: (data) => {
      if (data.found) {
        toast.success("Verified", {
          description: "Successfully verified via exchange"
        });
      } else {
        toast.warning("Not Found", {
          description: "No matching withdrawal"
        });
      }
    },
    // No onError - interceptor handles it
  });
}
```

### Provider Setup

```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          refetchOnWindowFocus: false,
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

---

## ✅ PRE-MERGE CHECKLIST

### Code Quality
- [ ] No inline styles
- [ ] AddressChip for all addresses (with next/image)
- [ ] Phosphor icons only (no lucide in your code)
- [ ] Numbers use `tabular-nums`

### Functionality
- [ ] Playwright tests pass
- [ ] Mobile responsive (375px)
- [ ] Dark mode works

### Security
- [ ] ChainGuard wraps transactions
- [ ] Correct friction per risk
- [ ] Evidence sources from enum

### Performance
- [ ] G6/ECharts lazy loaded
- [ ] CLS = 0
- [ ] Bundle < 500KB

---

## 🎯 VERIFICATION COMMANDS

```bash
# Check for old bugs
grep -R "useSwitchNetwork" apps/
grep -R "NodeJS.Timeout" apps/
grep -R 'variant="warning"' apps/

# Check icon library usage in YOUR code (not node_modules)
grep -R "lucide-react" src/ apps/ --include="*.tsx" --include="*.ts"
# ⚠️ Exception: shadcn-generated components may have lucide

# Check for img elements (should use next/image)
grep -R "<img " src/ apps/ --include="*.tsx"

# All should return: No matches (or only shadcn internals for lucide)

# Build test
npm run build

# Playwright test
npm run test:e2e
```

---

# END OF DOCUMENTATION (FINAL v2)

**✅ FIXED IN THIS VERSION:**
- ✅ AddressChip: next/image instead of img
- ✅ remotePatterns for boringavatars in next.config.js
- ✅ RiskBadge: Phosphor icons only (no AlertTriangle)
- ✅ no-img-element ESLint rule enabled
- ✅ Opacity classes note about tailwind.config requirement
- ✅ Icon verification commands clarified

**Ready for AI agent consumption in Antigravity IDE.**