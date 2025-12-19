# SafeDrop Security Guide (v6.2)

> **Status:** December 2025 Security Updates Applied
> **Updated:** December 17, 2025

---

## 🚨 CRITICAL SECURITY UPDATES

### React Server Components (December 2025)

**⚠️ ALWAYS FOLLOW CURRENT ADVISORIES**

Do NOT rely on fixed version numbers. Instead:

1. **Check latest advisories**: https://react.dev/blog
2. **Verify ALL packages**: Not just `react` and `react-dom`, but also `react-server-dom-*` packages
3. **Check resolved versions**: Use `npm ls`, not just package.json

**Commands:**
```bash
# Check current React version
grep '"react"' package.json

# Check ALL react-server-dom packages
npm ls react-server-dom-webpack react-server-dom-turbopack

# Verify lockfile has correct resolved versions
grep -A 10 "react-server-dom" package-lock.json
```

**Official Sources:**
- https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components
- https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components
- https://nvd.nist.gov/vuln/detail/CVE-2025-55182

### Next.js Security

**Policy:** Track official Next.js security advisories

**Action:** Visit https://nextjs.org/blog regularly and filter by "security" tag. Apply patches for your version branch.

**Verification:**
```bash
grep '"next"' package.json
# Compare with latest security advisory for your version branch
```

---

## 🔒 PRIVACY POLICY

### Address Display

**Policy Decision (NOT a vulnerability):** Using external avatar services like boringavatars.com sends wallet addresses to third parties and correlates them with user IPs via browser requests. This is a **privacy policy choice**, not a security incident or CVE.

**Solution:** Local identicon generation (no external requests).

```tsx
// ✅ CORRECT - Local generation
const getLocalIdenticon = (addr: string) => {
  const hash = addr.slice(2, 10);
  const hue = parseInt(hash.slice(0, 2), 16);
  return `hsl(${hue}, 70%, 60%)`;
};

// ❌ WRONG - External leak
<img src={`https://source.boringavatars.com/beam/24/${address}`} />
```

**Verification:**
```bash
# Should return NO output
grep -r "boringavatars" apps/ src/
```

### Default Avatar Policy

`showAvatar` defaults to `false` in AddressChip (privacy-first approach).

---

## 🚫 MIDDLEWARE CONSTRAINTS

### Rate Limiting

**⚠️ DEMO ONLY**: In-memory Map is NOT production-safe on serverless.

**Issue:** Global state resets unpredictably on cold starts.

**Production Solution:** Use external service:
- Cloudflare WAF (recommended for edge)
- Vercel KV (if using Vercel)
- Upstash Redis (high volume)

**Demo Example (NOT for production):**
```typescript
// ⚠️ DEVELOPMENT/TESTING ONLY
const rateLimits = new Map<string, { count: number; resetAt: number }>();

export function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown';
  // ... rate limit logic
  return NextResponse.next();
}
```

**Decision Gate (choose ONE):**
- [ ] Cloudflare WAF selected
- [ ] Vercel KV configured
- [ ] Upstash Redis deployed
- [ ] Rate limiting provider documented

### Body Reading

**Issue:** Reading request body in middleware causes memory buffering.

**Configuration (Next.js 16+):**
```javascript
// next.config.js
module.exports = {
  experimental: {
    proxyClientMaxBodySize: 10240,  // 10KB limit
  },
};
```

**Recommendation:** Use JWT tokens in headers, avoid body reading in middleware.

**Reference:** https://nextjs.org/docs/app/api-reference/next-config-js

**Migration:** https://nextjs.org/docs/app/building-your-application/upgrading (official migration entry point; verify proxy/middleware option rename)

> **⚠️ Note:** `proxyClientMaxBodySize` replaced `middlewareClientMaxBodySize` in Next.js 16 proxy migration. If upgrading, ensure the old parameter is removed. The value 10KB is an example — verify current limits in official docs.

### Middleware/Proxy Logging Pattern (Corrected)

**Issue Fixed:** Old docs showed `response.waitUntil()` which doesn't match Next.js proxy signature.

**Correct Pattern (Next.js 16 Proxy):**
```typescript
// Next.js proxy function signature (NOT middleware)
// See: https://axiom.co/docs/send-data/nextjs
export function proxy(
  request: NextRequest,
  event: { waitUntil: (promise: Promise<any>) => void }
) {
  // Log event
  logger.info('request', {
    path: request.nextUrl.pathname,
  });

  // Flush logs before response completes
  event.waitUntil(logger.flush());

  return NextResponse.next();
}
```

> **⚠️ Important:** The second argument is named `event` in Axiom docs, not `context`. For traditional middleware, verify the current signature at official docs.

**References:**
- Next.js middleware docs: https://nextjs.org/docs/app/building-your-application/routing/middleware
- Axiom Next.js guide: https://axiom.co/docs/send-data/nextjs

---

## 🛡️ BACKEND SECURITY (READ-ONLY)

### CORS Configuration

**⚠️ Backend is READ-ONLY**: Verify only, do NOT modify.

**Current config (verify, DO NOT CHANGE):**
```typescript
// safedrop-back-main/src/main.ts
app.enableCors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ORIGIN?.split(',') || [];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-Payment-Token', 'X-Request-Time'],
});
```

**If issues found:** Report to backend team, do NOT modify directly.

---

## ✅ SECURITY CHECKLIST

### Frontend (Editable)

**Security Critical:**
- [ ] React version follows latest advisories (not hardcoded)
- [ ] Next.js version tracks security updates
- [ ] NO external avatar services (boringavatars)
- [ ] AddressChip generates local identicon only
- [ ] Evidence interface has internalRef
- [ ] NO "AI Security Analysis" in evidence sources

**Production Edge/Middleware:**
- [ ] Rate limiting: External service selected and configured
- [ ] Body reading: Size limits documented + tested
- [ ] JWT tokens: In headers (NOT body parsing)
- [ ] Logging: Correct proxy/middleware signature with event.waitUntil

**Build & Deploy:**
- [ ] All dependencies exact versions (NO ^)
- [ ] package-lock.json committed
- [ ] npm ci in CI/CD
- [ ] NO postinstall scripts
- [ ] TypeScript strict mode

### Backend (Read-Only, Verify Only)

- [ ] NO custom modifications
- [ ] CORS config verified
- [ ] Exchange modules unchanged
- [ ] Audit status: Valid

---

## 📊 MONITORING

### Required Monitoring

1. **React Security Blog**
   - URL: https://react.dev/blog
   - Frequency: Weekly check
   - Filter: Security posts

2. **Next.js Security Advisories**
   - URL: https://nextjs.org/blog (filter: security)
   - Action: Subscribe to notifications

3. **Application Logs**
   - Metrics: 4xx/5xx errors, rate limit hits
   - Alerts: >100 402/403 per hour

---

## 🚀 POST-PATCH RECOMMENDATIONS

If your service was running with vulnerable versions:

**Recommended (not mandatory):**
- [ ] Review audit logs for suspicious activity
- [ ] Consider rotating API keys/secrets
- [ ] Review transaction logs
- [ ] Monitor for unusual patterns

**Note:** These are best practices. Follow your organization's security policy for mandatory requirements.

---

## 🔗 REFERENCES

### Official Security

1. **CVE-2025-55182**: https://nvd.nist.gov/vuln/detail/CVE-2025-55182
2. **React Blog (Dec 3)**: https://react.dev/blog/2025/12/03/critical-security-vulnerability
3. **React Blog (Dec 11)**: https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure

### Technical

4. **Next.js Middleware**: https://nextjs.org/docs/app/building-your-application/routing/middleware
5. **Next.js Config Reference**: https://nextjs.org/docs/app/api-reference/next-config-js (verify current option names)
6. **Vercel Functions**: https://vercel.com/docs/functions/runtimes
7. **Axiom Next.js**: https://axiom.co/docs/send-data/nextjs

---

# END OF SECURITY GUIDE (v6.2)

**✅ SECURITY GUIDANCE:**
1. ✅ Security advisories: Follow current, not hardcoded versions
2. ✅ Package verification: npm ls for resolved versions
3. Middleware logging: Corrected to event.waitUntil (verify at official docs)
4. ✅ Body size config: Use proxyClientMaxBodySize (verify current name)
5. ✅ Rate limiting: External service decision gate required for production
6. ✅ Privacy policy: NO external avatar services
7. ✅ Post-patch: Clarified as recommendations
8. ✅ References linked to official sources

> **For UI/UX agents:** Always verify security patterns against current official documentation before implementation.
