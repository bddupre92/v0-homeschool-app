# AtoZ Family — Repo Handoff

This doc is the state of the repo as of **Phase 8 complete** (state-
compliance generator across NY, PA, MA, OR — six filings, JSON sidecar,
dashboard hints). For the phased plan read `ROADMAP.md`; for a design-
partner brief read `DESIGN.md`; for the product thesis read
`.kiro/steering/product.md`.

## The product in one sentence

A calm, local-first homeschool companion. Five rooms — `Today`, `Teach`,
`Family`, `Community`, `Library` — plus auth, onboarding, settings, and
a hand-to-learner Kid Mode. No streaks, no badges, no leaderboards.

## Shipping state

- **Build:** passes with strict TypeScript + ESLint gates on
  (`next.config.mjs` `ignoreBuildErrors: false`).
- **Phases shipped:** 1–8 (see `ROADMAP.md`). Phase 6.10 locked the
  three-room contract (Today read-only, Teach workshop, Library
  catalog with 30-day draft TTL). Phase 7 made Community a real room.
  Phase 8 added the state-compliance generator: six filings across NY,
  PA, MA, OR, with PDF + JSON-sidecar export and a calm `/today`
  deadlines card.
- **Tests:** 108 vitest + Phase 6.10 + Phase 7 + Phase 8 behavioral
  probes (all 10/10, 8/8, 10/10 on the latest runs).
- **Nav chrome:** `Navigation` returns `null` on `/`, `/sign-in`,
  `/sign-up`, `/reset-password`, `/verify-email`, `/onboarding`,
  `/offline`, `/kid/[id]`, and fullscreen `/teach/[id]`. Authenticated
  rooms get the topbar + Log-hours FAB + phone bottom nav.
- **Data doctrine:** local-first for everything device-local (kids,
  lessons, sessions, captures, portfolio, today-layout, branding,
  notification prefs, advisor prefs) via `lib/atoz-store.ts`. IndexedDB
  via `lib/blob-store.ts` for photo/voice blobs >100KB. **Community
  data (groups, members, announcements, rotations, field trips,
  discovery preferences) is server-side in Postgres** — a deliberate
  scoped exception because shared-by-nature data can't be device-local.
  Firebase Auth gates everything.

## Surface map

| Room / Surface | Route | Notes |
|---|---|---|
| Today | `/today` | Daily slice (read-only — mark complete + pencil-to-Teach). Three layouts (Agenda / Per-kid / Compass), compliance countdown. |
| Teach | `/teach` | Workshop. Drafts (auto-clear 30 days untouched) + This week (next 7 days). `?edit=<lessonId>` deep-link opens the authoring dialog. |
| Teach (fullscreen) | `/teach/[sessionId]` | Timer, plan steps, capture bar, advisor sidebar, wrap screen. |
| Family | `/family/calm` | Kid roster, weekly rhythm grid, "People · N" link to `/people`. `/family` 308s here. |
| Per-kid portfolio | `/family/kid/[kidId]` | Traits, photos, voice, reflections, "Hand to [kid]" launcher. |
| Kid Mode | `/kid/[kidId]` | Chromeless, big tiles. |
| Community | `/community` | Discovery (ZIP + match scoring) + Your groups. |
| Community → New | `/community/new` | Create a co-op (chips + ZIP + private toggle). |
| Community → Preferences | `/community/preferences` | Discovery prefs, auto-save. |
| Community → Group detail | `/community/groups/[groupId]` | Members + Join/Leave + Announcements + Teaching rotation + Field trips. |
| Library | `/library` | Catalog. Filter by status (incl. Recently deleted with Restore). |
| Family access | `/people` | Co-parents, tutors, grandparents. Reached via `/family/calm`'s "People · N" link. |
| Filings | `/filings` | State-compliance generator landing — list of generated filings grouped by school year, PDF + JSON-sidecar download per filing. |
| Filings → New | `/filings/new` | Picker for the six supported filings (NY IHIP, NY Quarterly, PA Act 169 portfolio, MA Charles plan, OR notification, OR test results) with state-specific extra fields. |
| Onboarding | `/onboarding` | 3-step. |
| Settings | `/settings` | Account · Appearance · Notifications · Compliance (auto-save). |
| Settings → Compliance | `/settings/compliance` | |
| Auth | `/sign-in`, `/sign-up`, `/reset-password`, `/verify-email` | |
| Legal / system | `/privacy-policy`, `/terms-of-service`, `/offline` | |

## API routes

- `POST /api/advisor/suggest` — Claude Sonnet 4.6. 503 when
  `ANTHROPIC_API_KEY` missing.
- `POST /api/advisor/quick-log` — Claude Haiku 4.5. 503 when missing.
- `POST /api/init-db` — idempotent Postgres schema bootstrap. Returns
  `{ skipped: true }` when `POSTGRES_URL` unset.
- `GET /api/health` — integration status (firebaseClient, firebaseAdmin,
  anthropic, postgres, sentry, blob). Use this to verify a fresh deploy.
- `GET /api/filings/[id]/download` — Phase 8. Auth-gated PDF render
  from `source_data_snapshot`. Returns 503 when `POSTGRES_URL` unset.
- `GET /api/filings/[id]/sidecar` — Phase 8. Auth-gated JSON sidecar
  containing the full source snapshot + provenance envelope. The
  "your records belong to you" wedge.
- Legacy `/api/lessons/*`, `/api/backups` retained from earlier
  scaffolding.

## Architecture decisions locked

1. **Five rooms, three local + two server-aware.** Today/Teach/Family/
   Library/Settings/etc. are local-first. Community is server-side
   (Postgres). Family Auth (Firebase) gates everything.
2. **Today is read-only.** Authoring lives in Teach. Per-row pencil
   icon on /today routes to `/teach?edit=<lessonId>`.
3. **Drafts auto-expire after 30 days untouched.** Soft-delete to
   Library's "Recently deleted" filter; Restore brings them back.
4. **Settings auto-save.** Text inputs debounce 400ms; toggles fire
   immediate Undo toasts. No Save buttons.
5. **Photos > 100KB go to IndexedDB**, ≤100KB stay inline as data URLs.
6. **Direct `@anthropic-ai/sdk`** for advisor; routes at
   `app/api/advisor/*`.
7. **State compliance data is hand-curated** — FL/TX/CA/NY/PA covered
   in `lib/compliance/index.ts`. Filing PDF templates ship for NY
   (IHIP + 4 quarterlies), PA (Act 169 portfolio), MA (Charles plan),
   and OR (notification + test results).
8. **Community discovery is ZIP-radius only** — no map library, no
   street-level geocoding. Server-side Haversine distance scoring.
9. **Filings carry their own source-of-truth** — every PDF is rendered
   from a frozen `source_data_snapshot` (JSONB) so re-generation is
   deterministic. The JSON sidecar exports the same snapshot so a
   family can take their records to any other tool.

## Auth bypass flag

`contexts/auth-context.tsx:27` — set `NEXT_PUBLIC_DEV_BYPASS_AUTH=true`
in the env when running the dev server and you render as a mock user
with no Firebase required. Production guards: bypass is hard-disabled
unless `ALLOW_DEV_AUTH_BYPASS=true` also set.

## Known deferrals

### 1. Postgres operator turn-on (Phase 7 ships the code; deploy is operator action)

`POSTGRES_URL` unset → Community pages render calm "Community is being
set up" fallback cards; init-db skips; health endpoint reports
`postgres: false`. Operator follows `DEPLOY.md §3.5` to wire it.

### 2. `ANTHROPIC_API_KEY` for advisor features

Advisor + quick-log return 503 until the key is set; UI hides
gracefully.

### 3. Compliance data pending legal review

5 states covered; UI ships a "pending legal review" banner.

### 4. Test coverage gaps

`lib/__tests__` has zipcode + draft-expiry + atoz-store + utils +
quick-log + compliance + session + auth-integration. Component
coverage is minimal — Playwright probes (`scripts/probe-phase-6-10.mjs`,
`scripts/probe-phase-7.mjs`) cover the contract behaviors instead.

### 5. Community invite tokens

`/community/join/[token]` and admin-issued invite codes are deferred
to a later phase. Public-group Join via the detail page covers the
common path today.

### 6. Sentry DSN not wired

`@sentry/nextjs` installed; left unset.

## Anti-goals (don't re-add)

- Streaks, badges, leaderboards, points, XP, scoring.
- Social feed (`/scroll` gone), upvotes, hashtags.
- Pinterest-style resource boards (`/boards` gone).
- Global AI chat widget. (Advisor is contextual to a single lesson
  and opt-in.)
- **No map library / no street-level geocoding.** ZIP-code radius is
  permitted for Community discovery (server-side Haversine).
- Module-preferences toggle UI — five rooms are fixed.
- Authoring affordances on `/today` — Today is read-only by doctrine.

## Deleted routes (redirects in `middleware.ts`)

```
/dashboard            → /today
/planner              → /teach
/plan                 → /today
/resources            → /library
/portfolio            → /family/calm
/advisor              → /today
/boards               → /library
/scroll               → /library
/search               → /library
/about                → /
/community/events     → /people    (legacy)
/community/locations  → /people    (legacy)
/settings/modules     → /settings
/family               → /family/calm   (EXACT match)
```

Note `/community` itself is now a live route, not a redirect.

## Files to grep when working

- **Local data**: `lib/atoz-store.ts`, `lib/blob-store.ts`,
  `lib/demo-kids.ts`.
- **Server data**: `lib/db.ts` (Postgres helpers, ~80 methods on the
  `db` object), `lib/postgres-guard.ts` (config detection).
- **Community discovery**: `lib/group-matching.ts` (Haversine + Jaccard
  scoring), `lib/zipcodes.ts` (ZIP → coords).
- **Community actions**: `app/actions/group-discovery-actions.ts`
  (discover / join / leave / prefs / create), `app/actions/group-
  coordination-actions.ts` (announcements / rotation / trips).
- **Filing templates**: `lib/compliance/filings/` — one file per
  template (`or-notification.tsx`, `ny-ihip.tsx`, `ny-quarterly.tsx`,
  `pa-portfolio.tsx`, `ma-plan.tsx`, `or-test-results.tsx`),
  `shared.tsx` for the common header/footer/disclaimer primitives,
  `deadlines.ts` for the per-state deadlines knowledge.
- **Filing actions**: `app/actions/filings-actions.ts` — generateFiling,
  listMyFilings, markFilingSubmitted, getUpcomingFilingDeadlines.
- **Design tokens**: `design/tokens.json` + `:root` in
  `app/globals.css`.
- **Primitives**: `components/primitives/`.
- **Compliance data**: `lib/compliance/index.ts`.
- **NL parser**: `lib/quick-log-parser.ts`.

## Review tooling

- **Static text DOM walk:** `node scripts/review-dom-walk.mjs` — fetches
  every route in headless Chromium and dumps headings, button labels,
  links, and a digest. Outputs to stdout; redirect to a file in
  `.review-logs/`. No image artifacts.
- **Phase 6.10 probe:** `node scripts/probe-phase-6-10.mjs` — 6
  behavioral assertions (draft expiry, Today checkbox, pencil deep-
  link, Library Recently-deleted Restore).
- **Phase 7 probe:** `node scripts/probe-phase-7.mjs` — 8 behavioral
  assertions (nav swap, /community fallback, /community/new + prefs
  forms, group-detail fallback, legacy redirect, /people reachable,
  ZIP validation).
- **Phase 8 probe:** `node scripts/probe-phase-8.mjs` — 10 behavioral
  assertions (`/filings` + `/filings/new` fallbacks, /download +
  /sidecar 503s without Postgres, per-filing-type seeding for NY
  IHIP / NY Quarterly / PA Portfolio / MA Plan / OR Test Results,
  FilingsDueSoon hidden without an onboarding state).
- **Screenshots (legacy):** `scripts/review-screenshots.mjs` still
  works; outputs to gitignored `screenshots/`.

## Environment caveats

- Firebase isn't configured in the dev sandbox — `/family/calm`'s
  Firebase server actions return empty. Kid CRUD is on atoz-store.
  now so this doesn't affect the UI.
- Postgres isn't configured — `/api/init-db` returns 500, silently
  caught in `components/db-initializer.tsx`. Harmless in dev.
- `ANTHROPIC_API_KEY` unset — advisor features return 503. UI
  hides them behind the opt-in toggle + local-parser-first path.
