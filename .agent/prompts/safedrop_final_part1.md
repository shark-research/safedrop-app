# SafeDrop Extended Documentation Part 1 (v6.2)

> **Status:** CRITICAL SECURITY UPDATES VERIFIED
> **Last Updated:** December 17, 2025
> **CANONICAL FILE:** This is the ONLY Part 1 file
> **Version:** 6.1 (post-December 2025 security updates)

---

## 📋 TABLE OF CONTENTS

- [VERSION_LOCK.md](#version-lock) - Exact dependency versions + SECURITY FIXES
- [SETUP_GUIDE.md](#setup-guide) - Installation steps
- [TAILWIND_V4_GUIDE.md](#tailwind-v4) - Tailwind v4 setup
- [ICON_POLICY.md](#icon-policy) - Phosphor ONLY
- [SECURITY_COMPONENTS.md](#security-components) - TimerButton, friction patterns

---

<a name="version-lock"></a>
# 1. VERSION_LOCK.md

## 🔒 EXACT VERSIONS (NO CARET, NO RANGES)

**Policy:** All versions MUST be EXACT. NO `^` NO `~` NO ranges.

> **⚠️ Note:** The versions below are examples from December 2025. For React and Next.js, always verify against latest security advisories at https://react.dev/blog and https://nextjs.org/blog before deployment.

### package.json (Example)

```json
{
  "name": "safedrop",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "16.0.7",
    "react": "19.2.1",
    "react-dom": "19.2.1",
    "typescript": "5.7.2",
    "wagmi": "2.19.1",
    "viem": "2.38.5",
    "@rainbow-me/rainbowkit": "2.2.9",
    "tailwindcss": "4.0.0",
    "@arco-design/web-react": "2.64.1",
    "tw-animate-css": "1.0.1",
    "@phosphor-icons/react": "2.1.0",
    "framer-motion": "11.15.0",
    "@tanstack/react-query": "5.39.0",
    "@tanstack/react-table": "8.20.5",
    "axios": "1.7.7",
    "echarts": "5.5.1",
    "@antv/g6": "5.3.0",
    "sonner": "1.7.1",
    "vaul": "1.1.1",
    "cmdk": "1.0.4",
    "react-hook-form": "7.54.2",
    "zod": "3.24.1"
  },
  "devDependencies": {
    "@types/node": "22.10.2",
    "@types/react": "19.0.2",
    "@types/react-dom": "19.0.2",
    "eslint": "9.17.0",
    "eslint-config-next": "16.0.7",
    "@playwright/test": "1.49.1",
    "eslint-plugin-import": "2.31.0"
  }
}
```

**NO postinstall scripts.**

---

## 🚨 CRITICAL SECURITY (December 2025)

### React Server Components Security

**⚠️ IMPORTANT**: Follow https://react.dev/blog for latest advisories.

**Verification:**
```bash
# Check React version
grep '"react"' package.json

# Check react-server-dom packages
npm ls react-server-dom-webpack react-server-dom-turbopack

# Verify lockfile
grep -A 5 "react-server-dom" package-lock.json
```

**References:** 
- https://react.dev/blog/2025/12/03/critical-security-vulnerability
- https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure

### Next.js Security

Track https://nextjs.org/blog for security updates in your version branch.

```bash
grep '"next"' package.json
# Compare with nextjs.org/blog (security tag)
```

### Post-Patch Actions (Recommended)

If service was running while vulnerable:
- Review audit logs
- Consider rotating secrets
- Monitor for unusual patterns

---

<a name="setup-guide"></a>
# 2. SETUP_GUIDE.md

## 🚀 INITIAL SETUP

### Prerequisites

```bash
node --version  # >= 20.9.0 required
```

### Step 1: Clone & Install

```bash
git clone https://github.com/shark-research/safedrop-app.git
cd safedrop-app
npm ci
```

### Step 2: Shadcn Init

```bash
npx shadcn@2.1.7 init
```

**Prompts:**
- TypeScript? Yes
- Style? New York
- Base color? Slate
- Global CSS? app/globals.css
- CSS variables? Yes
- Tailwind prefix? No
- Config location? tailwind.config.ts
- Components alias? @/components
- Utils alias? @/lib/utils

### Step 3: Add Components

```bash
npx shadcn@2.1.7 add button
npx shadcn@2.1.7 add input
npx shadcn@2.1.7 add card
npx shadcn@2.1.7 add alert
npx shadcn@2.1.7 add dialog
```

**After:** Replace lucide icons with Phosphor.

---

<a name="tailwind-v4"></a>
# 3. TAILWIND_V4_GUIDE.md

### tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'risk-safe': 'hsl(142, 76%, 36%)',
        'risk-warn': 'hsl(38, 92%, 50%)',
        'risk-crit': 'hsl(0, 84%, 60%)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
  plugins: [],
} satisfies Config
```

### globals.css

```css
@import "tw-animate-css";

@layer base {
  :root {
    --background: 0 0% 4%;
    --foreground: 0 0% 98%;
    /* ... */
  }
}
```

---

<a name="icon-policy"></a>
# 4. ICON_POLICY.md

**POLICY:** Phosphor ONLY. Lucide FORBIDDEN.

```tsx
// ✅ CORRECT
import { Warning } from '@phosphor-icons/react'

// ❌ WRONG
import { AlertTriangle } from 'lucide-react'
```

---

<a name="security-components"></a>
# 5. SECURITY_COMPONENTS.md

### TimerButton

```tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from './button'

export function TimerButton({ 
  onClick, 
  delay = 3000, 
  children,
  variant = 'destructive'
}) {
  const [countdown, setCountdown] = useState(delay / 1000)
  const [isReady, setIsReady] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setCountdown(delay / 1000)
    setIsReady(false)

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsReady(true)
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [delay])

  return (
    <Button
      onClick={onClick}
      disabled={!isReady}
      variant={variant}
      className="min-w-[120px]"
    >
      {isReady ? children : `Wait ${countdown}s`}
    </Button>
  )
}
```

---

# END OF PART 1 (v6.2)

> **⚠️ Security versions:** Always verify React/Next.js versions against current advisories before deployment. Versions in this document are examples, not mandates.
