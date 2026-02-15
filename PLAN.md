# Production Readiness Fix Plan

## Prerequisites

### Step 0: Merge the most current branch

Merge `origin/codex/fix-module-not-found-@vercel/postgres-2ruioe` into the working branch. This brings in 7 commits that:
- Migrated from Vercel Postgres to Firebase Firestore (fixes SQL injection)
- Removed deprecated `@vercel/postgres` dependency
- Added Google Calendar sync endpoints (with proper auth)
- Added auth to event API routes

---

## Priority 1 — CRITICAL: Re-enable authentication (3 files, do together)

These three files must be fixed as a unit — deploying with any one still bypassed leaves the app wide open.

### 1a. `contexts/auth-context.tsx`
- **Line 26:** Change `const DEV_MODE_BYPASS_AUTH = true` → `false`
- This single change restores all real Firebase auth flows

### 1b. `components/auth/protected-route.tsx`
- **Replace entire file** with real auth-gating logic
- Use `useAuth()` hook to check `user` and `loading` state
- Redirect to `/sign-in?callbackUrl=...` when not authenticated
- Show loading spinner while auth state resolves

### 1c. `middleware.ts`
- **Uncomment lines 27-35** (the `isProtectedPath` redirect block)
- Remove the "DEV MODE" comments around it
- This restores server-side auth enforcement for `/dashboard`, `/boards`, `/planner`, `/profile`, `/settings`, `/resources/create`

---

## Priority 2 — CRITICAL: Add auth to all unprotected API routes (10 files)

Use the existing `requireAuth()` helper from `lib/auth-service.ts`. Add `const user = await requireAuth()` as the first line in each handler's `try` block, with a 401 catch.

### Mutation routes (must have auth):
| File | Methods to protect |
|---|---|
| `app/api/groups/route.ts` | POST |
| `app/api/groups/[id]/route.ts` | PUT, DELETE |
| `app/api/groups/[id]/members/route.ts` | POST |
| `app/api/groups/[id]/members/[userId]/route.ts` | DELETE, PUT |
| `app/api/lessons/route.ts` | POST |
| `app/api/lessons/[id]/route.ts` | PUT, DELETE |
| `app/api/curricula/route.ts` | POST |
| `app/api/state-requirements/route.ts` | POST |
| `app/api/backups/route.ts` | GET, POST |

### AI routes (auth + rate limiting):
| File | Methods | Rate limit |
|---|---|---|
| `app/api/ai/generate-curriculum/route.ts` | POST | 5 req/min |
| `app/api/ai/research/route.ts` | POST | 10 req/min |

---

## Priority 3 — HIGH: Build configuration hardening

### 3a. `next.config.mjs`
1. **Remove** `typescript: { ignoreBuildErrors: true }` — errors should be fixed, not hidden
2. **Remove** `eslint: { ignoreDuringBuilds: true }` — or set to `false`
3. **Remove** `images: { unoptimized: true }` — re-enable Next.js image optimization
4. **Replace wildcard CORS** `'*'` → `process.env.NEXT_PUBLIC_APP_URL || 'https://atozfamily.org'`

---

## Priority 4 — HIGH: Pin dependency versions

### 4a. `package.json`
Replace all `"latest"` tags with pinned semver ranges:

| Package | Current | Pin to |
|---|---|---|
| `@ai-sdk/groq` | `"latest"` | Resolved version from lock file |
| `@auth/core` | `"latest"` | Resolved version from lock file |
| `@auth/firebase-adapter` | `"latest"` | Resolved version from lock file |
| `@emotion/is-prop-valid` | `"latest"` | Resolved version from lock file |
| `@hookform/resolvers` | `"latest"` | Resolved version from lock file |
| `@mapbox/mapbox-gl-geocoder` | `"latest"` | Resolved version from lock file |
| `next-themes` | `"latest"` | Resolved version from lock file |

---

## Priority 5 — MEDIUM: Tighten security headers

### 5a. `middleware.ts` (CSP)
- Remove `'unsafe-eval'` from `script-src` (not needed unless using eval-based templating)
- Keep `'unsafe-inline'` for now (required by many CSS-in-JS and Next.js patterns), but add nonce-based CSP as a follow-up

---

## Priority 6 — MEDIUM: Remove debug code

### 6a. `app/dashboard/page.tsx`
- Remove `console.log('Quick Add clicked')` and `alert('Quick Add menu would open here')`

### 6b. `app/resources/page.tsx`
- Remove `console.log('Opening resource submission form')` and `alert('Resource submission form would open here')`
- Either implement the actual functionality or disable the button

---

## Priority 7 — MEDIUM: Rate limiter hardening

### 7a. `lib/rate-limit.ts`
- Add cleanup mechanism to prevent unbounded memory growth (evict expired entries when map exceeds 10k entries)
- Long-term: migrate to Redis/Vercel KV for distributed rate limiting

---

## Implementation Order

1. Merge codex branch (Step 0)
2. Auth bypass removal — 1a, 1b, 1c (single commit)
3. API route auth — all Priority 2 files (single commit)
4. Build config — 3a (single commit)
5. Pin dependencies — 4a (single commit)
6. Security headers — 5a (single commit)
7. Debug code removal — 6a, 6b (single commit)
8. Rate limiter — 7a (single commit)

---

## Post-Implementation Testing Checklist

- [ ] `npm run build` succeeds without error suppression
- [ ] Unauthenticated requests to all mutation API routes return 401
- [ ] `ProtectedRoute` redirects to `/sign-in` when not logged in
- [ ] Middleware redirects protected paths when no session cookie
- [ ] AI endpoints reject unauthenticated requests
- [ ] AI endpoints are rate-limited under rapid requests
- [ ] CORS header returns configured domain, not `*`
- [ ] No `alert()` or debug `console.log` in production bundle
- [ ] All `"latest"` tags replaced with pinned versions
