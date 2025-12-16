# SafeDrop - Quick Verification Guide (PRODUCTION FINAL v2)

> **Use this to verify all fixes are applied**
> **Fixes Applied:** ESLint step added, components.json check, img element check

---

## ✅ PRE-FLIGHT CHECKLIST

### 1. Version Lock (package.json)

```bash
grep -A 20 '"dependencies"' package.json | grep -E '(next|react|wagmi|viem|rainbowkit|tailwind)'
```

**Expected:**
```json
"next": "16.0.1",
"react": "19.2.0",
"wagmi": "2.19.1",
"viem": "2.38.5",
"@rainbow-me/rainbowkit": "2.2.9",
"tailwindcss": "4.0.0"
```

---

### 2. No Old Bugs

```bash
# Should return ZERO matches
grep -r "useSwitchNetwork" apps/ src/
grep -r "NodeJS.Timeout" apps/ src/
grep -r 'variant="warning"' apps/ src/
grep -r "ProComponents" apps/ src/
grep -r "@ant-design" apps/ src/
```

**Expected:** `No matches` for all commands

---

### 3. Icon Library Check ⚠️ UPDATED

```bash
# Check YOUR code (not node_modules, not shadcn internals)
grep -r "lucide-react" src/components --include="*.tsx" --include="*.ts" | grep -v "node_modules"
grep -r "lucide-react" apps/ --include="*.tsx" --include="*.ts" | grep -v "node_modules"

# Check Phosphor usage
grep -r "@phosphor-icons/react" src/ apps/ | wc -l
```

**Expected:**
- Lucide: = 0 matches in YOUR component files (shadcn internals are OK, but replace after generate)
- Phosphor: > 0

---

### 4. components.json Check (NEW)

```bash
cat components.json | grep iconLibrary
```

**Expected:**
- If `iconLibrary: "lucide"` exists, you'll need to replace icons after each `shadcn add`
- Add this to shadcn workflow: after generation, replace lucide → Phosphor

---

### 5. HSL Color Format

```bash
grep -A 5 ":root" apps/*/styles/globals.css src/app/globals.css | grep "primary"
```

**Expected (HSL numbers, not hex):**
```css
--primary: 188 86% 54%;
```

**Wrong:**
```css
--primary: #22D3EE;  /* ❌ This will break Shadcn */
```

---

### 6. Tailwind Config (Monorepo Paths)

```bash
grep -A 20 "colors:" tailwind.config.*
```

**Check monorepo paths are correct:**
```typescript
content: [
  './apps/b2c/src/**/*.{ts,tsx}',
  './apps/b2c/components/**/*.{ts,tsx}',
  './apps/b2b/src/**/*.{ts,tsx}',
  './packages/ui-primitives/**/*.{ts,tsx}',
],
```

> ✅ **Tailwind v4:** `<alpha-value>` is NOT required for opacity classes.
> v4 uses `color-mix()` internally. Both formats work:
> - `'hsl(var(--primary))'` ← v4 native
> - `'hsl(var(--primary) / <alpha-value>)'` ← legacy, still works
> 
> If you see legacy format, leave it. Don't add to new tokens.

---

### 7. No img Elements (NEW)

```bash
# Should return ZERO matches
grep -r "<img " src/ apps/ --include="*.tsx"
```

**Expected:** `No matches`

If found, replace with:
```tsx
import Image from 'next/image';
<Image src={url} unoptimized />
```

---

### 8. next.config.js remotePatterns (NEW)

```bash
grep -A 10 "remotePatterns" next.config.*
```

**Expected:**
```javascript
remotePatterns: [
  {
    protocol: 'https',
    hostname: 'source.boringavatars.com',
    pathname: '/beam/**',
  },
],
```

---

### 9. ESLint Boundaries

```bash
grep -A 10 "import/no-restricted-paths" .eslintrc.json
```

**Expected:**
```json
"import/no-restricted-paths": ["error", {
  "zones": [
    { "target": "./apps/b2c", "from": "./apps/b2b" },
    { "target": "./apps/b2b", "from": "./apps/b2c" }
  ]
}]
```

---

### 10. TimerButton Implementation

```bash
grep -A 30 "export function TimerButton" apps/*/components/ui/timer-button.tsx src/components/ui/timer-button.tsx 2>/dev/null
```

**Must have:**
- ✅ `useRef<ReturnType<typeof setInterval> | null>(null)`
- ✅ `useEffect(..., [delay])`  ← delay in deps
- ✅ Reset countdown on delay change

**Must NOT have:**
- ❌ `useRef<NodeJS.Timeout>()`
- ❌ `useEffect(..., [])`  ← empty deps

---

### 11. ChainGuard Hooks

```bash
grep -A 20 "export function ChainGuard" apps/*/components/ui/chain-guard.tsx src/components/ui/chain-guard.tsx 2>/dev/null
```

**Must have (wagmi v2):**
- ✅ `import { useAccount, useChainId, useSwitchChain } from 'wagmi'`
- ✅ `const { switchChain } = useSwitchChain()`

**Must NOT have (wagmi v1):**
- ❌ `useNetwork`
- ❌ `useSwitchNetwork`

---

### 12. B2B Stack Purity

```bash
grep -r "ProComponents\|@ant-design/pro" apps/b2b/
```

**Expected:** `No matches`

---

## 🚀 BUILD & TEST (UPDATED v3)

```bash
# 1. Clean install
rm -rf node_modules package-lock.json
npm install

# 2. TypeScript check
npx tsc --noEmit

# 3. ESLint check ⚠️ CRITICAL - Next.js 16 removed next lint
npx eslint . --ext .ts,.tsx --max-warnings 0

# 4. Build
npm run build

# 5. Tests (if configured)
npm run test:e2e
```

**All must pass with ZERO errors**

> ⚠️ **CRITICAL:** Next.js 16 does NOT run lint during build.
> **FIX:** Update package.json to run lint before build:

```json
// package.json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx --max-warnings 0",
    "build": "npm run lint && next build",
    "dev": "next dev --turbopack",
    "start": "next start"
  }
}
```

This ensures lint ALWAYS runs before build, agent will see errors.

---

## 📋 FILE STRUCTURE CHECK

```bash
tree -L 2 -I 'node_modules|.next'
```

**Expected structure:**
```
.
├── apps/
│   ├── b2c/              # Shadcn + Tailwind
│   └── b2b/              # Arco Design
├── packages/
│   ├── shared/
│   └── ui-primitives/
├── docs/
│   └── ...
├── .agent/
│   └── prompts/
│       ├── safedrop_final_part1.md   # Part 1
│       ├── safedrop_final_part2.md   # Part 2
│       └── safedrop_verification.md  # This file
├── package.json          # Locked versions
├── tailwind.config.ts    # Monorepo paths + opacity
├── next.config.js        # remotePatterns
├── components.json       # Shadcn config
└── .eslintrc.json        # Boundaries
```

---

## 🎯 CRITICAL IMPORTS CHECK

### AddressChip
```bash
grep -A 5 "^import" apps/*/components/ui/address-chip.tsx src/components/ui/address-chip.tsx 2>/dev/null
```

**Expected:**
```typescript
import Image from 'next/image';
import { Copy, Check } from '@phosphor-icons/react';
```

**Wrong:**
```typescript
<img src={...} />  // ❌ Use next/image
import { ... } from 'lucide-react';  // ❌ Use Phosphor
```

### RiskBadge
```bash
grep -A 5 "^import" apps/*/components/ui/risk-badge.tsx src/components/ui/risk-badge.tsx 2>/dev/null
```

**Expected:**
```typescript
import { ShieldCheck, Warning, XCircle, CaretRight } from '@phosphor-icons/react';
```

**Wrong:**
```typescript
import { AlertTriangle } from 'lucide-react';  // ❌
```

---

## 🔥 FINAL SMOKE TEST

```bash
# Start dev server
npm run dev

# In browser:
# 1. Open http://localhost:3000
# 2. Open DevTools Console
# 3. Check for errors → Should be ZERO

# 4. Connect wallet
# 5. Check risk badge renders
# 6. Verify no layout shifts (CLS = 0)
```

---

## 📊 METRICS

**Bundle Size (First Load):**
- Target: < 500KB
- Check: `npm run build` output

**Web Vitals:**
- CLS: < 0.1
- LCP: < 2.5s
- FID: < 100ms

**Coverage:**
- Playwright P0 flow: Must pass
- No console errors: Required

---

## 🚨 RED FLAGS (MUST FIX)

If you see any of these, **STOP and fix immediately:**

1. ❌ `useSwitchNetwork` anywhere
2. ❌ `NodeJS.Timeout` in browser code
3. ❌ `lucide-react` imports in YOUR components (not shadcn internals)
4. ❌ `variant="warning"` in Alert
5. ❌ ProComponents in B2B
6. ❌ Hex colors in CSS vars (use HSL)
7. ❌ Missing `[delay]` in TimerButton deps
8. ❌ Tailwind classes on Arco components
9. ❌ `<img>` elements (use next/image)
10. ❌ Missing `/ <alpha-value>` in tailwind.config colors

---

## 📝 DOCUMENTATION STATUS

**Active Files (AI agents READ these):**
- ✅ `.agent/prompts/safedrop_final_part1.md` (Part 1)
- ✅ `.agent/prompts/safedrop_final_part2.md` (Part 2)
- ✅ `.agent/prompts/safedrop_verification.md` (This file)

**Archive Files (AI agents IGNORE these):**
- 🗃️ `archive/safedrop_fixes_patch.md`
- 🗃️ `archive/old_versions/`

---

## ✅ SIGN-OFF CHECKLIST

Before considering docs "production ready":

- [ ] All version lock commands pass
- [ ] Zero old bug matches
- [ ] HSL color format confirmed
- [ ] Monorepo paths in Tailwind
- [ ] Opacity support (`/ <alpha-value>`) in tailwind.config
- [ ] Phosphor icons only (lucide only in shadcn internals)
- [ ] components.json checked for iconLibrary
- [ ] No `<img>` elements (all next/image)
- [ ] remotePatterns in next.config.js
- [ ] ESLint boundaries enforced
- [ ] TimerButton has delay deps
- [ ] ChainGuard uses wagmi v2
- [ ] B2B stack is pure Arco
- [ ] **ESLint runs separately** (Next.js 16 doesn't auto-lint)
- [ ] Build completes without errors
- [ ] Playwright tests pass
- [ ] No console errors in browser

**When all checkboxes are ✅, docs are PRODUCTION READY.**

---

# END OF VERIFICATION GUIDE (v2)

**✅ FIXED IN THIS VERSION:**
- ✅ Added explicit ESLint step (Next.js 16 doesn't auto-lint on build)
- ✅ Added components.json iconLibrary check
- ✅ Added `<img>` element grep check
- ✅ Added remotePatterns verification
- ✅ Added opacity `/ <alpha-value>` verification
- ✅ Clarified lucide exception for shadcn internals

Use this document to:
1. Verify fixes after applying docs
2. CI/CD pre-merge checks
3. Onboarding new developers
4. Debugging regressions