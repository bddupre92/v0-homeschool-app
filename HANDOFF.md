# AtoZ Family — Design Iteration Handoff

This doc is the brief for the next session (design iteration). If you're
starting fresh, read this first, then `.kiro/steering/product.md` for the
product thesis, then explore the five rooms live.

## The product in one sentence

A calm, local-first homeschool companion. Five rooms — `Today`, `Teach`,
`Family`, `Community`, `Library` — plus auth + settings + profile. No
streaks, no badges, no leaderboards.

## Current state (after PRs #38 + #39)

- **Build:** passes (`npm run build` → 31 routes, down from 41)
- **Routes shipping:** only the five rooms + auth + settings + profile + admin/offline/legal. All legacy rooms deleted with 308 redirects.
- **Nav chrome:** `Navigation` returns `null` on `/`, `/sign-in`, `/sign-up`, `/reset-password`, `/verify-email`, `/offline`, and fullscreen `/teach/[id]`. Authenticated rooms get the topbar + Log-hours FAB + phone bottom nav.
- **Demo data:** single source of truth at `lib/demo-kids.ts`. Emma/Noah/Lily with weekly-hour localStorage helpers.
- **Data doctrine:** localStorage (`lib/atoz-store.ts`) for lessons, sessions, captures, portfolio, memberships, invites. Firebase Auth for sign-in. Firebase server actions for family blueprint + kid CRUD (the one exception — see deferrals below).
- **Bundle diet:** dropped `mapbox-gl`, `@mapbox/mapbox-gl-geocoder`, `@ai-sdk/groq`, `ai`. 128 fewer npm packages.

## Five rooms — source of truth

`components/navigation.tsx:53-61` (`PRIMARY_ROOMS`):

| Room | Route | Page file | Job |
|---|---|---|---|
| Today | `/today` | `app/today/page.tsx` | Daily landing: greeting + today's lessons + weekly progress + FAB. |
| Teach | `/teach` | `app/teach/page.tsx` | Author → schedule → teach → capture. `/teach/[sessionId]` is fullscreen teach mode. |
| Family | `/family/calm` | `app/family/calm/page.tsx` | Kid roster + per-kid portfolio via `/family/kid/[kidId]`. |
| Community | `/people` | `app/people/page.tsx` | Co-parents, tutors, grandparents. Scoped access. |
| Library | `/library` | `app/library/page.tsx` | Every lesson across statuses. Filter by kid/subject/status. |

## Quick-start for iteration

```bash
npm install --legacy-peer-deps
NEXT_PUBLIC_DEV_BYPASS_AUTH=true npm run dev
# → http://localhost:3000, signed in as "Developer User"
```

## Screenshot tooling (for visual diff mid-iteration)

```bash
# All 13 core routes × mobile + desktop
npm run review:screenshots

# Include legacy-redirect targets too
node scripts/review-screenshots.mjs --legacy=true

# Seed a lesson + session + portfolio so dynamic routes render
node scripts/review-seed-dynamic.mjs
```

Screenshots write to `screenshots/<viewport>/<slug>.png` (gitignored).
Drag-drop into GitHub issues or compare before/after locally.

## Auth bypass flag

`contexts/auth-context.tsx:27` — set `NEXT_PUBLIC_DEV_BYPASS_AUTH=true`
in the env when running the dev server and you render as a mock user
with no Firebase required.

## Known deferrals (design decisions needed before tackling)

### 1. Kid CRUD port — #30

- `/family/calm` currently renders kids from `lib/demo-kids.ts` (hardcoded Emma/Noah/Lily). There's still a callout on the page linking users to the legacy `/family` admin for add/edit/delete.
- Real kid CRUD lives in `app/actions/family-actions.ts` via Firebase. It's not wired to the calm room.
- **Decision needed:** do kids stay Firebase-backed, or move into `lib/atoz-store.ts` to match the local-first doctrine used by lessons/sessions/portfolio? Once decided, port all six rooms that import `DEMO_KIDS` to read from the chosen source.

### 2. T&C checkbox on `/sign-up` — #25

- No "I agree to Terms & Privacy" checkbox. `/terms-of-service` and `/privacy-policy` exist. Needs copy approved and a required-checkbox component wired in.

### 3. Nested `<html>`/`<body>` hydration warning

- Console-only warning on `/today` + `/teach`. No visible break. Likely in `app/layout.tsx`. Worth fixing before any e2e visual-regression work.

### 4. `/verify-email` flow intent

- `app/verify-email/page.tsx` is a thin wrapper. Unclear whether email verification is enforced or optional before first `/today` access. Trace it when you touch auth UX.

### 5. `/settings/modules` gone; no replacement settings UI yet

- We deleted `/settings/modules` entirely. If opt-in features (Advisor sidebar, etc.) come back later, they'll need a new settings surface.

## Deleted routes (redirects in `middleware.ts`)

```
/dashboard       → /today
/planner         → /teach
/plan            → /today
/resources       → /library
/portfolio       → /family/calm
/advisor         → /today
/boards          → /library
/scroll          → /library
/search          → /library
/about           → /
/community/*     → /people
/settings/modules → /settings
```

## Anti-goals (don't re-add)

- Streaks, badges, leaderboards, points, XP, scoring.
- Social feed with upvotes/hashtags (`/scroll` used to be this; it's gone).
- Pinterest-style resource boards (`/boards` — gone).
- AI assistant global chat widget (`AIAssistant` component — gone).
- Mapbox / location-based community features.
- Module-preferences toggle UI that lets users turn features on/off. The app is a fixed shape — five rooms — in MVP.

## Files to grep when designing

- **Brand voice / copy:** `app/page.tsx` (landing hero), `app/today/page.tsx` (greeting), `app/teach/page.tsx` ("The lesson loop."), `.kiro/steering/product.md`
- **Design tokens / primitives:** `components/primitives/` (KidDot, ProgressRail, Pill, Chip, KidChip, ComplianceStrip), `app/globals.css`, `app/design-system/page.tsx` (internal tool — safe to iterate in)
- **Demo seeds:** `lib/demo-kids.ts`, `scripts/review-seed-dynamic.mjs`

## Open tracker

Tracker issue **#37** — linked to all the per-page review issues. Most are closed by PRs #38 + #39; the deferrals above are what remains.

## Environment caveats

- Firebase isn't configured in the Claude Code on the web environment — `/family/calm`'s server actions return empty. Design flows that depend on real kid CRUD need either (a) the port-to-atoz-store decision, or (b) a test Firebase project.
- Postgres isn't configured either — `/api/init-db` returns 500, silently caught in `components/db-initializer.tsx`. Harmless in dev.
