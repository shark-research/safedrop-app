# SafeDrop Verification Guide (v6.2)

> **Purpose:** Verify all security & privacy fixes
> **Status:** December 2025 Updates
> **Updated:** December 17, 2025

---

## ✅ PRE-FLIGHT CHECKLIST

### 0. Confirm Repo Root

```bash
# REQUIRED: All commands assume you are in repo root
cd <your-repo-path> && pwd
git rev-parse --show-toplevel
```

**PASS:** Output shows your project root (e.g., `/path/to/safedrop-app`)
**FAIL:** Not a git repo or wrong directory

### 0.1. Node.js Version

```bash
node --version  # Expected: >= 20.9.0
```

**PASS:** Version >= 20.9.0
**FAIL:** Version < 20.9.0 → upgrade Node.js

---

### 🚨 CRITICAL SECURITY CHECKS

### 1. React Security (ADVISORY-BASED)

**⚠️ Do NOT hardcode version numbers in verification**

Always verify against CURRENT advisories:

```bash
# 1. Check installed React version
grep '"react"' package.json

# 2. Check react-server-dom packages
npm ls react-server-dom-webpack react-server-dom-turbopack

# 3. Verify lockfile has correct resolved versions
grep -A 10 "react-server-dom" package-lock.json

# 4. Compare with current advisories
# Visit: https://react.dev/blog (filter: security)
```

**PASS:** Your version >= latest patched version from https://react.dev/blog
**FAIL:** Your version < advisory requirement → run `npm update react react-dom`

**References:**
- https://react.dev/blog/2025/12/03/critical-security-vulnerability
- https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure

---

### 2. Next.js Security

```bash
grep '"next"' package.json

# Compare with latest security advisory
# Visit: https://nextjs.org/blog (filter: security tag)
```

**Expected:** Version matches latest patched version for your branch.

---

### 3. Privacy Check (NO External Avatars)

```bash
# Should return NO output
grep -r "boringavatars" apps/ src/
```

**Expected:** No matches (no external tracking).

**If found:** Replace with local identicon from safedrop_part2_v6_final.md

---

### 4. AddressChip Default Avatar OFF

```bash
grep -A 5 "showAvatar =" apps/*/components/ui/address-chip.tsx src/components/ui/address-chip.tsx
```

**Expected:**
```typescript
showAvatar = false  // ✅ Privacy-first default
```

**NOT:**
```typescript
showAvatar = true  // ❌ Privacy leak
```

---

## 📦 DEPENDENCY CHECKS

### 5. Version Lock (NO CARET)

```bash
grep -A 25 '"dependencies"' package.json
```

**Policy:** All versions MUST be exact (no `^` or `~`).

**PASS:** All versions are exact (e.g., `"1.2.3"`, NOT `"^1.2.3"`) - use your lockfile values
**FAIL:** Any `^` or `~` found - remove and use exact versions

**Note:** For React and Next.js versions, always verify against latest security advisory. The exact version should match **your project's lockfile** after applying security patches.

---

### 6. No Caret Check

```bash
grep '"\^' package.json
```

**Expected:** No output (zero carets).

---

### 7. Shadcn CLI Version

```bash
grep "shadcn@" docs/*.md | head -1
```

**Expected:**
```
npx shadcn@2.1.7 init
```

**NOT @latest**

---

### 8. tw-animate-css Setup

```bash
# In package.json
grep "tw-animate-css" package.json

# In CSS (import not plugin)
grep "@import.*tw-animate-css" app/globals.css

# NOT in tailwind.config plugins
grep "require('tw-animate-css')" tailwind.config.ts
grep "plugins:.*tw-animate-css" tailwind.config.ts
```

**Expected:**
- package.json: `"tw-animate-css": "<PINNED_VERSION>"`
- globals.css: `@import "tw-animate-css"`
- tailwind.config greps: No output (both)

---

### 9. TimerButton Implementation

```bash
grep -A 30 "export function TimerButton" apps/*/components/ui/timer-button.tsx src/components/ui/timer-button.tsx
```

**Must have:**
- ✅ `useRef<ReturnType<typeof setInterval> | null>(null)`
- ✅ `useEffect(..., [delay])` - delay in deps
- ✅ Reset countdown on delay change

**Must NOT have:**
- ❌ `useRef<NodeJS.Timeout>()`
- ❌ `useEffect(..., [])` - empty deps

---

### 10. npm Workflow

```bash
# Should return NO output
grep "postinstall" package.json
```

**Expected:** No postinstall script.

---

### 11. Evidence Interface

```bash
grep -A 10 "export interface Evidence" apps/*/types/risk.ts src/types/risk.ts
```

**Must have:**
```typescript
export interface Evidence {
  date: string;
  title: string;
  description: string;
  source: EvidenceSource;
  internalRef?: string;    // ✅ present
  externalLink?: string;
}
```

**Check no invalid sources:**
```bash
grep -r "AI Security Analysis" apps/ src/ | grep -v "❌"
```

**Expected:** No output.

---

### 12. Icon Library

```bash
# Phosphor installed
grep "@phosphor-icons/react" package.json

# NO lucide in YOUR code
grep -r "from 'lucide-react'" apps/ src/ | grep -v "node_modules"
```

**Expected:**
- Phosphor: YES (`"@phosphor-icons/react"` pinned exact)
- Lucide: NO output

---

### 13. TypeScript Version

```bash
grep '"typescript"' package.json
```

**Expected:**
```json
"typescript": "<PINNED_VERSION>"
```

**NOT:** `"5.x"` or `"5.7"`

---

### 14. Middleware Config (Corrected)

**Check body size limit (Next.js 16+):**
```bash
grep -E "(proxyClientMaxBodySize|middlewareClientMaxBodySize)" next.config.*
```

**PASS:** `proxyClientMaxBodySize` found (Next.js 16+ naming)
**PASS (also valid):** No output — config not needed if not reading body in middleware
**FAIL:** `middlewareClientMaxBodySize` found — rename to `proxyClientMaxBodySize`

**Note:** Verify current option name at https://nextjs.org/docs/app/api-reference/next-config-js

---

## 🚀 BUILD & TEST

```bash
# 1. Node check
node --version

# 2. Install
npm ci

# 3. TypeScript
npx tsc --noEmit

# 4. Build
npm run build

# 5. Lint
npx eslint . --ext .ts,.tsx

# 6. Tests (if available)
npm run test:e2e
```

---

## 🚨 RED FLAGS

If you see ANY of these, FIX IMMEDIATELY:

### Security
1. ❌ React version doesn't match latest advisory
2. ❌ Next.js version doesn't match latest advisory
3. ❌ `boringavatars.com` in code (privacy leak)
4. ❌ `showAvatar = true` by default
5. ❌ Missing `internalRef` in Evidence
6. ❌ "AI Security Analysis" as source

### Dependencies
7. ❌ `^` caret in package.json
8. ❌ Ranges like 5.x, 11.x in docs
9. ❌ @latest in shadcn commands
10. ❌ tw-animate-css in tailwind plugins
11. ❌ postinstall script

### Code
12. ❌ NodeJS.Timeout in browser code
13. ❌ useEffect(..., []) in TimerButton
14. ❌ lucide-react imports in YOUR code
15. ❌ TypeScript "5.x" in package.json
16. ❌ middlewareClientMaxBodySize (old name)

---

## ✅ SIGN-OFF CHECKLIST

### Security (v6.2)
- [ ] React follows latest advisories (not hardcoded)
- [ ] Next.js follows latest advisories
- [ ] NO boringavatars (privacy leak removed)
- [ ] showAvatar default: false
- [ ] Evidence has internalRef
- [ ] NO "AI Security Analysis"
- [ ] Subscribed to security blogs

### Setup
- [ ] Node.js >= 20.9.0
- [ ] All exact versions (NO ^)
- [ ] Shadcn @2.1.7 (pinned)
- [ ] package-lock.json committed
- [ ] npm ci documented
- [ ] NO postinstall

### Config
- [ ] tw-animate-css CSS import only
- [ ] proxyClientMaxBodySize (if configured)
- [ ] NO middlewareClientMaxBodySize

### Code
- [ ] TimerButton: ReturnType + [delay] deps
- [ ] ChainGuard: wagmi v2
- [ ] Phosphor icons only
- [ ] TypeScript exact (pinned, no ranges)

### Build
- [ ] Build completes
- [ ] Tests pass
- [ ] Bundle < 500KB

---

## 📚 REPO STRUCTURE

**Current (verify with git):**
```bash
git ls-tree --name-only -r HEAD | head -20
```

**Planned Migration:**
- Current: `safedrop-app/` (this repo, editable)
- Target: `apps/b2c/`, `apps/b2b/` (future monorepo)

**Verify paths exist before importing:**
```bash
ls -d apps/b2c || echo "NOT FOUND"
```

---

## 🔗 SECURITY REFERENCES

1. **React Security**: https://react.dev/blog (filter: security)
2. **Next.js Security**: https://nextjs.org/blog (filter: security)
3. **CVE-2025-55182**: https://nvd.nist.gov/vuln/detail/CVE-2025-55182
4. **Next.js Middleware**: https://nextjs.org/docs/app/building-your-application/routing/middleware

---

# END OF VERIFICATION (v6.2)

**✅ SECURITY VERIFIED (as of verification date):**
1. ✅ React: Verify against current advisories at https://react.dev/blog
2. ✅ Next.js: Verify against current advisories at https://nextjs.org/blog
3. ✅ Privacy: NO external tracking (boringavatars removed)
4. ✅ Middleware: Use `proxyClientMaxBodySize` (Next.js 16+)
5. ✅ Dependencies: All exact versions (no carets)
6. ✅ Code: Correct patterns (TimerButton, icons)
7. ✅ Build: Passes TypeScript and lint

> **⚠️ IMPORTANT:** Security versions must be verified against **current** advisories.
> This document does NOT guarantee production readiness — run verification commands above and compare with latest official sources.
