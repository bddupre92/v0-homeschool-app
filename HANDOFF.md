# AtoZ Family — Repo Handoff

This doc is the state of the repo as of **Phase 4 complete**. For the
phased plan read `ROADMAP.md`; for a design-partner brief read
`DESIGN.md`; for the product thesis read `.kiro/steering/product.md`.

## The product in one sentence

A calm, local-first homeschool companion. Five rooms — `Today`, `Teach`,
`Family`, `Community`, `Library` — plus auth, onboarding, settings, and
a hand-to-learner Kid Mode. No streaks, no badges, no leaderboards.

## Shipping state

- **Build:** passes (`npm run build` → 33 routes).
- **Phases shipped:** 1 through 4 (see `ROADMAP.md`).
- **Nav chrome:** `Navigation` returns `null` on `/`, `/sign-in`,
  `/sign-up`, `/reset-password`, `/verify-email`, `/onboarding`,
  `/offline`, `/kid/[id]`, and fullscreen `/teach/[id]`. Authenticated
  rooms get the topbar + Log-hours FAB + phone bottom nav.
- **Data doctrine:** local-first. `lib/atoz-store.ts` holds kids,
  lessons, sessions, captures, portfolio, memberships, invites,
  onboarding state, today-layout preference, day-tweaks, advisor
  prefs, and family branding. IndexedDB (`lib/blob-store.ts`) holds
  photo + voice blobs that exceed the 100KB inline threshold.
  Firebase Auth is the only always-online dependency.

## Surface map (33 routes)

| Room / Surface | Route | Notes |
|---|---|---|
| Today | `/today` | Three layouts (Agenda / Per-kid / Compass), compliance countdown, upcoming, recently saved, day tweaks drawer, inline add-lesson. |
| Teach | `/teach` | Lesson authoring hub (drafts + scheduled). |
| Teach (fullscreen) | `/teach/[sessionId]` | Timer, plan steps, capture bar (note / photo / quote / voice), optional advisor sidebar, wrap screen with reflection + traits + "worth remembering" prompts. |
| Family | `/family/calm` | Kid roster, weekly rhythm grid, inline add/edit kid, inline add lesson. `/family` redirects here. |
| Per-kid portfolio | `/family/kid/[kidId]` | Observed traits cloud, photos, voice clips, reflections, "Hand to [kid]" launcher. |
| Kid Mode | `/kid/[kidId]` | Chromeless, big tappable lesson tiles for the learner. |
| Community | `/people` | Co-parents, tutors, grandparents with scoped access. |
| Library | `/library` | Every lesson, filter by kid / subject / status. |
| Onboarding | `/onboarding` | 3-step: welcome → state → first learner. |
| Settings | `/settings` | Account, Advisor (opt-in), Appearance (family name + accent), Notifications, Security. |
| Settings → Compliance | `/settings/compliance` | State-specific filings (FL/TX/CA/NY/PA). |
| Auth | `/sign-in`, `/sign-up`, `/reset-password`, `/verify-email` | Email verification is opt-in. |
| Legal / system | `/privacy-policy`, `/terms-of-service`, `/offline` | |

## API routes

- `POST /api/advisor/suggest` — contextual lesson suggestions (Claude
  Sonnet 4.6). 503 if `ANTHROPIC_API_KEY` missing.
- `POST /api/advisor/quick-log` — NL fallback for log-hours (Claude
  Haiku 4.5). 503 if key missing.
- Legacy `/api/*` routes (lessons, backups, etc.) retained from
  earlier scaffolding; not all are wired.

## Architecture decisions locked

1. **Kid data lives in atoz-store**, not Firebase. `app/actions/family-actions.ts` remains for reference but isn't wired.
2. **Email verification is optional.** Sign-up routes to `/onboarding`, not `/verify-email`.
3. **Photos > 100KB go to IndexedDB**, ≤ 100KB stay inline as data URLs. See `lib/blob-store.ts` `BLOB_SIZE_THRESHOLD`.
4. **Direct `@anthropic-ai/sdk`** — not Vercel AI SDK. Routes live at `app/api/advisor/*`.
5. **State compliance data is hand-curated.** Covered: FL, TX, CA, NY, PA. All other states show "coming soon" in `/settings/compliance`.

## Design tokens

Source of truth: `design/tokens.json` (W3C design-tokens format) and
the `:root` block in `app/globals.css`. Must stay in sync. See
`DESIGN.md` for the full palette + type + spacing breakdown.

## Screenshot review workflow

```bash
# Terminal 1
NEXT_PUBLIC_DEV_BYPASS_AUTH=true npm run dev

# Terminal 2 — all 14 static routes × mobile + desktop
npm run review:screenshots

# Seed dynamic routes (/teach/[id], /family/kid/emma, /kid/emma)
node scripts/review-seed-dynamic.mjs
```

Outputs to `screenshots/<viewport>/<slug>.png` (gitignored).

## Auth bypass flag

`contexts/auth-context.tsx:27` — set `NEXT_PUBLIC_DEV_BYPASS_AUTH=true`
in the env when running the dev server and you render as a mock user
with no Firebase required.

## Known deferrals

### 1. Real Firebase + Postgres config (Phase 6)

Works with `NEXT_PUBLIC_DEV_BYPASS_AUTH` on. Production needs
`NEXT_PUBLIC_FIREBASE_*` and the Postgres connection string in the
environment. `/api/init-db` currently silently 500s — harmless in dev.

### 2. `ANTHROPIC_API_KEY` for advisor features (Phase 6)

Advisor sidebar (4.1) and NL quick-log fallback (4.4) both return 503
until the key is set. UI hides gracefully in dev — no noisy warnings.

### 3. Compliance data pending legal review (Phase 4.2 noted)

`lib/compliance/index.ts` has hand-curated stubs for 5 states. UI
ships a disclaimer. Expanding the dataset and getting legal sign-off
is a v1-launch gate.

### 4. Test coverage (Phase 6)

Vitest configured, no tests for atoz-store CRUD yet. Playwright
scripts exist for screenshots; no e2e tests yet.

### 5. Sentry DSN not wired (Phase 6)

`@sentry/nextjs` installed; DSN left unset. No events flow to Sentry
until that's configured.

## Anti-goals (don't re-add)

- Streaks, badges, leaderboards, points, XP, scoring.
- Social feed (`/scroll` gone), upvotes, hashtags.
- Pinterest-style resource boards (`/boards` gone).
- Global AI chat widget. (Advisor is contextual to a single lesson
  and opt-in.)
- Mapbox / location-based community features.
- Module-preferences toggle UI — five rooms are fixed in MVP.

## Deleted routes (redirects in `middleware.ts`)

```
/dashboard        → /today
/planner          → /teach
/plan             → /today
/resources        → /library
/portfolio        → /family/calm
/advisor          → /today
/boards           → /library
/scroll           → /library
/search           → /library
/about            → /
/community/*      → /people
/settings/modules → /settings
/family           → /family/calm   (EXACT match — /family/calm, /family/kid/* still resolve)
```

## Files to grep when working

- **Local data**: `lib/atoz-store.ts`, `lib/blob-store.ts`, `lib/demo-kids.ts`.
- **Kid roster hook**: `useKids()` in `lib/demo-kids.ts` — auto-seeds on first read.
- **Design tokens**: `design/tokens.json` + `:root` in `app/globals.css`.
- **Primitives**: `components/primitives/`.
- **Compliance data**: `lib/compliance/index.ts`.
- **NL parser**: `lib/quick-log-parser.ts`.
- **Brand voice / copy**: `.kiro/steering/product.md`.

## Environment caveats

- Firebase isn't configured in the dev sandbox — `/family/calm`'s
  Firebase server actions return empty. Kid CRUD is on atoz-store
  now so this doesn't affect the UI.
- Postgres isn't configured — `/api/init-db` returns 500, silently
  caught in `components/db-initializer.tsx`. Harmless in dev.
- `ANTHROPIC_API_KEY` unset — advisor features return 503. UI
  hides them behind the opt-in toggle + local-parser-first path.
