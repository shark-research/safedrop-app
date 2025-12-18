# SafeDrop Part 2 (v6.2)

> **Status:** Privacy & Component Fixes Applied
> **Updated:** December 17, 2025

---

## 📋 CONTENTS

- [RISK_MODEL](#risk-model)
- [COMPONENTS](#components)
- [QUALITY_GATES](#quality-gates)
- [API_CLIENT](#api-client)

---

<a name="risk-model"></a>
# 1. RISK_MODEL

## Types

```typescript
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
  internalRef?: string;
  externalLink?: string;
}
```

## Evidence Rules

1. Source from enum only
2. For `source='internal'`: use `internalRef`
3. For non-internal: `externalLink` REQUIRED
4. Never hallucinate sources

```tsx
// ✅ CORRECT - internal
const evidence: Evidence = {
  date: '2025-12-15T10:00:00Z',
  title: 'High Risk Pattern',
  description: 'Multiple drainer interactions',
  source: 'internal',
  internalRef: 'ALERT-2025-12-1234'
};

// ✅ CORRECT - external
const evidence: Evidence = {
  date: '2025-12-15T10:00:00Z',
  title: 'OFAC Sanctioned',
  source: 'ofac',
  externalLink: 'https://sanctionssearch.ofac.treas.gov/...'
};

// ❌ WRONG
const evidence = {
  source: 'AI Security Analysis'  // Not in enum!
};
```

---

<a name="components"></a>
# 2. COMPONENTS

## AddressChip (Privacy-First)

```tsx
import { useState } from 'react';
import { Copy, Check } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface AddressChipProps {
  address: string;
  label?: string;
  ens?: string;
  risk?: 'safe' | 'warn' | 'crit';
  showCopy?: boolean;
  showAvatar?: boolean;  // Default: false (privacy)
}

export function AddressChip({ 
  address, 
  label, 
  ens,
  risk = 'safe',
  showCopy = true,
  showAvatar = false
}: AddressChipProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Local identicon (NO external requests)
  const getLocalIdenticon = (addr: string) => {
    const hash = addr.slice(2, 10);
    const hue = parseInt(hash.slice(0, 2), 16);
    return `hsl(${hue}, 70%, 60%)`;
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border",
      risk === 'safe' && "bg-risk-safe/10 text-risk-safe border-risk-safe/20",
      risk === 'warn' && "bg-risk-warn/10 text-risk-warn border-risk-warn/20",
      risk === 'crit' && "bg-risk-crit/10 text-risk-crit border-risk-crit/20"
    )}>
      {showAvatar && (
        <div 
          className="w-5 h-5 rounded-full"
          style={{ backgroundColor: getLocalIdenticon(address) }}
        />
      )}

      <span className="font-mono text-sm tabular-nums">
        {label || ens || `${address.slice(0, 6)}...${address.slice(-4)}`}
      </span>

      {showCopy && (
        <button 
          onClick={handleCopy}
          className="hover:opacity-70"
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

**Key:** NO external avatar services (privacy-first).

## RiskBadge

```tsx
import { ShieldCheck, Warning, XCircle } from '@phosphor-icons/react';

export function RiskBadge({ level, category }) {
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1 rounded-full",
      level === 'safe' && "bg-risk-safe/10 text-risk-safe",
      level === 'warn' && "bg-risk-warn/10 text-risk-warn",
      level === 'crit' && "bg-risk-crit/10 text-risk-crit"
    )}>
      {level === 'safe' && <ShieldCheck size={16} weight="fill" />}
      {level === 'warn' && <Warning size={16} weight="fill" />}
      {level === 'crit' && <XCircle size={16} weight="fill" />}
      <span>{category}</span>
    </div>
  );
}
```

## ChainGuard (Wagmi v2)

```tsx
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { Alert } from './alert';
import { Button } from './button';

export function ChainGuard({ requiredChainId, children }) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  if (!isConnected) {
    return <Alert>Connect wallet to continue</Alert>;
  }

  if (chainId !== requiredChainId) {
    return (
      <Alert>
        Wrong network
        <Button onClick={() => switchChain?.({ chainId: requiredChainId })}>
          Switch Network
        </Button>
      </Alert>
    );
  }

  return <>{children}</>;
}
```

---

<a name="quality-gates"></a>
# 3. QUALITY_GATES

## Repo Structure (Current → Target)

> **⚠️ IMPORTANT:** Before running any commands, confirm your repo root:
> ```bash
> cd <your-project> && pwd
> git rev-parse --show-toplevel
> ```

**Current (cloned from shark-research/safedrop-app):**
```
./                    # Repo root (NOT safedrop-front-main subfolder)
├── app/              # Next.js app directory
├── components/       # UI components
└── ...               # Other project files
```

**Backend (separate repo, READ-ONLY):**
```
safedrop-back-main/   # Do NOT modify
```

**Target (planned migration):**
```
apps/
  b2c/      # Shadcn + Tailwind
  b2b/      # Arco Design
packages/
  shared/
  ui-primitives/
```

**Migration Path:**
- Verify target paths exist before importing: `ls -d apps/b2c || echo "NOT FOUND - use current structure"`
- Update import paths during transition
- Keep backend separate (READ-ONLY)

## ESLint Boundaries

```json
{
  "plugins": ["import"],
  "rules": {
    "import/no-restricted-paths": ["error", {
      "zones": [
        { "target": "./apps/b2c", "from": "./apps/b2b" },
        { "target": "./apps/b2b", "from": "./apps/b2c" }
      ]
    }]
  }
}
```

## Performance

```tsx
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const SybilGraph = dynamic(
  () => import('@/components/sybil-graph'),
  { loading: () => <div>Loading...</div>, ssr: false }
);
```

---

<a name="api-client"></a>
# 4. API_CLIENT

## Client Setup (SSR Safe)

```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_SERVER_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // SSR safe: only toast on client
    if (typeof window !== 'undefined') {
      const { toast } = await import('sonner');
      toast.error('Error', {
        description: error.message
      });
    }
    return Promise.reject(error);
  }
);
```

## React Query

```tsx
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useWalletVerification() {
  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post('/api/verification', data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.found) {
        toast.success("Verified");
      } else {
        toast.warning("Not Found");
      }
    },
  });
}
```

---

# END OF PART 2 (v6.2)

**✅ Privacy-first components, SSR-safe API client, migration path documented with repo root clarification**
