# SafeDrop UI/UX Reference (v6.2)

> **Purpose:** Code-first UI component references
> **Status:** Privacy-first, advisory-based versioning
> **Updated:** December 18, 2025

---

## 📋 CONTENTS

1. [Quick Start](#quick-start)
2. [Privacy Components](#privacy)
3. [React-admin](#react-admin)
4. [Arco Pro](#arco-pro)
5. [Animation](#animation)

---

<a name="quick-start"></a>
# 1. QUICK START

## Installation (EXACT VERSIONS)

```bash
# Shadcn (PINNED)
npx shadcn@2.1.7 init
npx shadcn@2.1.7 add button card alert dialog

# Icons (SINGLE SOURCE)
# Already in package.json: "@phosphor-icons/react": "2.1.0"
```

---

<a name="privacy"></a>
# 2. PRIVACY COMPONENTS

## AddressChip (Privacy-First)

**Key:** NO external avatar services.

```tsx
import { useState } from 'react';
import { Copy, Check } from '@phosphor-icons/react';

export function AddressChip({ 
  address, 
  showAvatar = false  // ✅ Privacy-first default
}) {
  const [copied, setCopied] = useState(false);

  // Local identicon (NO external requests)
  const getLocalIdenticon = (addr: string) => {
    const hash = addr.slice(2, 10);
    const hue = parseInt(hash.slice(0, 2), 16);
    return `hsl(${hue}, 70%, 60%)`;
  };

  return (
    <div className="inline-flex items-center gap-2">
      {showAvatar && (
        <div 
          className="w-5 h-5 rounded-full"
          style={{ backgroundColor: getLocalIdenticon(address) }}
        />
      )}

      <span className="font-mono text-sm">
        {`${address.slice(0, 6)}...${address.slice(-4)}`}
      </span>

      <button onClick={() => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}
```

**Usage:**
```tsx
// ✅ CORRECT - Privacy-first (no avatar)
<AddressChip address="0x..." />

// ✅ CORRECT - Opt-in avatar (local only)
<AddressChip address="0x..." showAvatar={true} />

// ❌ FORBIDDEN - External service
<img src={`https://source.boringavatars.com/${address}`} />
```

---

<a name="react-admin"></a>
# 3. REACT-ADMIN

## Install (EXACT)

```bash
npm install react-admin@5.4.3 --save-exact
npm install ra-data-simple-rest@5.4.3 --save-exact
```

## Admin Dashboard

```tsx
import { Admin, Resource, List, Datagrid, TextField } from 'react-admin';
import restProvider from 'ra-data-simple-rest';
import { RiskBadge } from '@/components/risk-badge';
import { AddressChip } from '@/components/address-chip';

export function TransactionList() {
  return (
    <List>
      <Datagrid>
        <TextField source="id" />
        
        <FunctionField
          label="Address"
          render={(record) => (
            <AddressChip 
              address={record.address} 
              showAvatar={false}
            />
          )}
        />
        
        <TextField source="amount" />
        
        <FunctionField
          label="Risk"
          render={(record) => (
            <RiskBadge 
              level={record.risk_level} 
              category={record.risk_category} 
            />
          )}
        />
      </Datagrid>
    </List>
  );
}

export default function AdminApp() {
  return (
    <Admin dataProvider={restProvider('/api/admin')}>
      <Resource name="transactions" list={TransactionList} />
    </Admin>
  );
}
```

---

<a name="arco-pro"></a>
# 4. ARCO PRO

## Setup

```json
{
  "@arco-design/web-react": "2.64.1"
}
```

**Import CSS (B2B only):**
```tsx
// apps/b2b/app/layout.tsx
import '@arco-design/web-react/dist/css/arco.css';
```

## Table with Risk Badges

```tsx
import { Table } from '@arco-design/web-react';
import { Warning, ShieldCheck } from '@phosphor-icons/react';
import { AddressChip } from '@/components/address-chip';
import { RiskBadge } from '@/components/risk-badge';

const columns = [
  {
    title: 'Address',
    dataIndex: 'address',
    render: (address: string) => (
      <AddressChip 
        address={address} 
        showAvatar={false}
      />
    ),
  },
  {
    title: 'Risk',
    dataIndex: 'risk',
    render: (risk: any) => (
      <RiskBadge 
        level={risk.level} 
        category={risk.category} 
      />
    ),
    filters: [
      { text: 'Safe', value: 'safe' },
      { text: 'Warning', value: 'warn' },
      { text: 'Critical', value: 'crit' },
    ],
    onFilter: (value, row) => row.risk.level === value,
  },
];

export function RiskTable({ data }) {
  return (
    <Table 
      columns={columns} 
      data={data}
      pagination={{ pageSize: 20 }}
    />
  );
}
```

---

<a name="animation"></a>
# 5. ANIMATION

## Framer Motion

```json
{
  "framer-motion": "11.15.0"
}
```

```tsx
import { motion } from 'framer-motion';

export function AnimatedAlert() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Alert>Content</Alert>
    </motion.div>
  );
}
```

## tw-animate-css

```json
{
  "tw-animate-css": "1.0.1"
}
```

**Setup (CSS import, NOT plugin):**
```css
/* app/globals.css - FIRST line */
@import "tw-animate-css";
```

**Usage:**
```tsx
<div className="animate-fade-in animate-delay-200">
  <Alert>Animated alert</Alert>
</div>
```

---

## 🚫 FORBIDDEN PATTERNS

```tsx
// ❌ External avatar service
<img src={`https://source.boringavatars.com/${address}`} />

// ✅ CORRECT
<AddressChip address={address} showAvatar={true} />

// ❌ lucide-react
import { AlertTriangle } from 'lucide-react';

// ✅ CORRECT - Phosphor
import { Warning } from '@phosphor-icons/react';

// ⚠️ Avoid raw fetch for consistency
const response = await fetch('/api/verification');

// ✅ RECOMMENDED - apiClient (axios) for unified error handling
const response = await apiClient.post('/api/verification', data);

// ❌ Direct address display
<span>{address.slice(0, 10)}...</span>

// ✅ CORRECT
<AddressChip address={address} />
```

---

## ✅ QUICK CHECKLIST

**Privacy:**
- [ ] NO boringavatars or external avatars
- [ ] AddressChip showAvatar default: false
- [ ] Local identicon generation only

**Icons:**
- [ ] Phosphor Icons (`@phosphor-icons/react`) - ONLY allowed library
- [ ] NO lucide-react imports

**API:**
- [ ] Use `apiClient` (axios) for unified error handling
- [ ] Raw `fetch` allowed but discouraged for consistency
- [ ] SSR safe (typeof window check)

**Components:**
- [ ] AddressChip for addresses
- [ ] RiskBadge for risk display
- [ ] TimerButton for high risk
- [ ] ChainGuard for network checks

---

# END OF REFERENCE (v6.2)

**✅ Privacy-first patterns, exact versions (verify against current advisories)**
