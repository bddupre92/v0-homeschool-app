# AtoZ Family — Development Roadmap

This roadmap takes the post-review MVP baseline (main branch, PRs #38 +
#39 merged) to a production-ready v1, phase by phase. Each phase has
concrete tasks tied to files that already exist, acceptance criteria,
and the design decisions that must happen before the phase can start.

Anti-goals from `.kiro/steering/product.md` hold throughout: no streaks,
no badges, no social feed, no leaderboards. Rest is learning too.

## Orientation

- **Baseline (Phase 0):** `HANDOFF.md` — what ships today.
- **Source of truth for product:** `.kiro/steering/product.md`.
- **Source of truth for rooms:** `components/navigation.tsx` (`PRIMARY_ROOMS`).
- **Open tracker:** GitHub issue **#37**.
- **Competitive reference:** Pavved (conversational logging, photo
  capture, state-specific guides, trait tracking). We keep our calm look
  and local-first doctrine but must reach feature parity on capture UX
  and state compliance before v1.

---

## Phase 0 — MVP baseline (DONE)

Shipped via PRs #38 + #39. See `HANDOFF.md` for route map, bundle
changes, and deferrals.

- Five rooms only: Today, Teach, Family, Community, Library.
- `lib/atoz-store.ts` for lessons/sessions/captures/portfolio.
- Firebase Auth with dev bypass flag (`NEXT_PUBLIC_DEV_BYPASS_AUTH`).
- Single source of truth for demo kids: `lib/demo-kids.ts`.
- Screenshot review tooling: `scripts/review-screenshots.mjs`.

---

## Phase 1 — Foundation gaps (unblock design iteration)

**Goal:** close the architectural and flow debt that blocks real-user
testing. Nothing in this phase is new product surface; it is making
what exists work on real accounts with real kids.

### 1.1 Kid CRUD doctrine decision + port (#30)
- **Decision needed:** do kids live in Firebase (via
  `app/actions/family-actions.ts`) or in `lib/atoz-store.ts` alongside
  lessons? Local-first doctrine argues for atoz-store.
- Once decided, port the six pages that currently import `DEMO_KIDS`
  from `lib/demo-kids.ts` to read from the chosen source:
  `components/navigation.tsx`, `app/today/page.tsx`,
  `app/family/calm/page.tsx`, `app/family/kid/[kidId]/page.tsx`,
  `app/teach/page.tsx`, `app/library/page.tsx`, `app/people/page.tsx`.
- Remove the legacy `/family` admin callout from `/family/calm`.
- Add the inline "Add a learner" dialog to `/family/calm` (designed in
  the prototype but not wired).

### 1.2 T&C checkbox on sign-up (#25)
- Add required checkbox to `app/sign-up/page.tsx` linking to
  `/terms-of-service` + `/privacy-policy`.
- Copy must be approved before shipping.

### 1.3 Nested html/body hydration warning
- Console warning on `/today` + `/teach`. Likely an extra `<html>` or
  `<body>` in `app/layout.tsx` or a route-group layout.
- Blocks any future Playwright visual-regression work.

### 1.4 /verify-email flow intent
- Decide: is email verification *required* before first `/today`
  access, or optional?
- Today `app/verify-email/page.tsx` is a thin wrapper. Update auth
  context + middleware accordingly.

### 1.5 Onboarding flow
- First-time user lands on `/sign-up` → completes a short onboarding
  (name, state, first learner). Prototype shows this as three screens.
- Create `app/onboarding/page.tsx`, gate via `atoz-store` flag
  `onboardingComplete`.
- State selection feeds Phase 4's compliance-guide logic.

**Acceptance:** new email can sign up, verify, onboard, add a real
learner, and log a lesson — end to end, no demo kids, no dev bypass.

---

## Phase 2 — Finish planned features (design-prototype parity)

**Goal:** wire up the surfaces already designed in the Claude-design
prototype but not yet in the shipping app. These are **not** new
design work — they have mocks and copy decisions already.

### 2.1 Three Today layouts
The prototype offers three view modes for `/today`: **Agenda**,
**Per-kid**, **Compass**. Only Agenda is live today.
- Add a view-switcher at the top of `app/today/page.tsx`.
- Persist choice in `atoz-store` (`todayLayout: "agenda" | "per-kid" | "compass"`).
- **Agenda** (shipping): linear timeline of today's lessons.
- **Per-kid:** columns per learner with that kid's lessons grouped.
- **Compass:** weekly radial view — subjects as sectors, hours as
  fill. Matches weekly rhythm view in Phase 2.2.

### 2.2 Weekly rhythm view
- Prototype screen: 7-day grid with hours per subject per kid.
- Create `components/weekly-rhythm.tsx`; surface on `/family/calm` and
  optionally as the Compass layout on `/today`.
- Reads from existing `readDemoHours()` / portfolio sessions.

### 2.3 Compliance countdown
- Prototype shows "Next filing · Annual assessment Due Thu, May 15".
- Create `components/compliance-strip.tsx` (lightweight, top of
  `/today`). Data comes from the state-specific compliance module
  stubbed in Phase 4.
- Ship with a hand-curated stub first (one state) so the UI lands
  before the guides database.

### 2.4 Upcoming events on /today
- Below today's lessons, show the next 3 scheduled lessons across the
  week. `app/today/page.tsx` already reads lessons from
  `atoz-store`; add a filter for `scheduledFor` > tomorrow.

### 2.5 Add-lesson inline dialog
- Quick lesson creation from `/today` and `/family/calm` without
  routing to `/teach`. Dialog uses the same form shape as
  `app/teach/page.tsx`. Share a `components/lesson-form.tsx`.

### 2.6 Kid Mode
- Prototype: simplified full-screen view a parent hands to a learner.
  Shows today's lessons, big tappable tiles, no nav.
- New route `app/kid/[kidId]/page.tsx`, chromeless (add to
  `isChromelessRoute()` in `navigation.tsx`).
- Launch via a "Hand to [kid]" button on `/family/kid/[kidId]`.

### 2.7 Tweaks panel
- Prototype: lightweight settings drawer on `/today` for per-day
  adjustments (skip a subject, shorten lesson block).
- Drawer from `/today` header; writes to `atoz-store` for the day only.

**Acceptance:** all seven prototype surfaces are click-reachable from
the five rooms; screenshots match the prototype layout (visual polish
comes in Phase 5, not here).

---

## Phase 3 — Capture UX polish

**Goal:** make the capture loop (the core "teach → capture" flow)
feel as good as Pavved's. This is where the app's value compounds.

### 3.1 Photo capture during teach mode
- `app/teach/[sessionId]/page.tsx` already has a capture button.
  Extend to accept photos from camera / upload.
- Storage decision: data URLs in localStorage (v1, small, already
  typed in `Capture.dataUrl`) vs. IndexedDB for larger blobs. Default
  to IndexedDB for photos > 100KB; keep text/voice in localStorage.

### 3.2 Voice-note capture
- MediaRecorder API → blob → IndexedDB → linked `Capture` record.
- Playback on portfolio page (`app/family/kid/[kidId]/page.tsx`).

### 3.3 Natural-language quick log
- Today's Log-hours FAB opens a structured dialog. Replace the primary
  path with a single text field ("Emma did 40 min of math and we read
  Charlotte's Web for 20"). Parse client-side first; AI fallback
  later (Phase 4).
- Keep the structured dialog as "advanced" fallback.

### 3.4 Session reflection prompts
- After ending a session, surface 3-4 tap-sized reflection prompts
  ("Great / Good / Okay / Tough" is live; add "what stuck?" and "what
  to revisit?"). Writes to `LessonSession.reflection`.

**Acceptance:** parent can teach a lesson, capture a photo + voice
note, end with a reflection, and see all of it on the kid's
portfolio — without leaving mobile.

---

## Phase 4 — Pavved parity

**Goal:** reach competitive parity on the three things Pavved does
that we don't — without betraying the calm-room doctrine.

### 4.1 Conversational AI advisor
- **Not** a global chat widget (explicit anti-goal). Instead, a
  **contextual sidebar** on `/teach` that suggests lesson structure
  based on the kid's age + subject + recent sessions.
- New route/component: `components/advisor-panel.tsx`, opt-in via
  settings (not shown by default).
- API route: `app/api/advisor/route.ts` calls Anthropic Claude with a
  system prompt grounded in `lib/atoz-store` data.
- **Decision needed:** bring the dropped `ai` SDK back, or call
  `@anthropic-ai/sdk` directly? Direct SDK is lighter.

### 4.2 State-specific compliance guides
- Data: `lib/compliance/<state>.ts` files (start with 5 most-common
  states, expand iteratively). Each defines filing deadlines,
  required hours, assessment type.
- Fed into `components/compliance-strip.tsx` (Phase 2.3) and a full
  guide page at `app/settings/compliance/page.tsx`.
- Legal review required before shipping any state guide.

### 4.3 Trait tracking (lightweight)
- Per-kid traits (curiosity, focus, collaboration) surfaced as *rest*
  observations, not scores. No numeric rating, no rollup.
- Addition to `PortfolioItem`: `traits?: string[]`.
- Displayed on `/family/kid/[kidId]` as a tag cloud, not a chart.

### 4.4 AI-assisted quick-log parsing
- Phase 3.3 added natural-language parsing client-side. Here: fall
  back to the advisor API when local parse fails.

### 4.5 Family branding + theme
- Prototype: families pick an accent color + photo avatar for their
  "home". Already half-wired — DEMO_KIDS has per-kid colors.
- `app/settings/appearance/page.tsx` — one accent color, one family
  name override. Persisted in atoz-store.

**Acceptance:** advisor sidebar produces a usable lesson suggestion
for at least one subject; one state's compliance guide is accurate
and legally reviewed; trait tracking does not gamify.

---

## Phase 5 — Design iteration handoff

**Goal:** hand the baseline to the design partner, iterate on visual
polish, land the v1 look.

- Deliverable into design: this repo, `HANDOFF.md`, `screenshots/`
  output of `npm run review:screenshots`.
- Design scope: typography hierarchy, color palette refinement,
  component density, empty-state illustrations.
- Design out of scope: architecture, data layer, anti-goals.
- Cadence: design delivers Figma → we port to `components/primitives/`
  and `app/globals.css` (sage/terracotta/linen tokens).

**Acceptance:** visual regression tests pass; a Playwright
full-screenshot diff against Phase 4 shows only intended changes.

---

## Phase 6 — Production prep

**Goal:** take the polished app from "works on my machine" to
"real people use it and nothing is on fire."

### 6.1 Real Firebase + Postgres config
- Environment variables documented in `README.md`.
- Firestore security rules reviewed.
- `/api/init-db` (currently silently 500s) works or is removed.

### 6.2 Test coverage
- Unit: `vitest` already set up; add tests for `lib/atoz-store.ts`
  CRUD and `lib/compliance/*` lookups.
- E2E: Playwright covers the sign-up → onboard → first-lesson golden
  path.
- CI: run both on every PR.

### 6.3 Performance
- Lighthouse audit on `/today`, `/teach`, `/family/calm`. Target
  mobile LCP < 2.5s.
- Dynamic-import heavy Radix components not used above the fold.
- Audit the ~31 routes for unused client components.

### 6.4 PWA polish
- Service worker already scaffolded. Verify offline fallback on all
  five rooms, not just the `/offline` page.
- Install prompt on mobile, app icon, splash screens.

### 6.5 Analytics + error tracking
- Sentry already in `package.json` — wire the DSN.
- Vercel Analytics events for the capture loop (lesson start, capture
  taken, session end). No per-user tracking beyond that.

### 6.6 Deploy
- Vercel production project; preview deploys on every PR.
- Domain decision. Legal pages (`/terms-of-service`, `/privacy-policy`)
  reviewed before public launch.

**Acceptance:** public URL; a non-developer homeschool parent can sign
up, onboard, and complete a full teach → capture → portfolio loop on
their phone without help.

---

## Cross-cutting tracks

These run alongside the phases, not as blockers.

- **Accessibility:** every phase's new components pass a keyboard +
  screen-reader pass before merge. Icons use `aria-hidden="true"`
  (already enforced by the `826c430` fix).
- **Copy review:** brand voice stays "calm, not cute." Every new
  string reviewed against `.kiro/steering/product.md`.
- **Bundle watch:** `npm run build` after every phase. If bundle
  grows by >10KB gzipped without a new user-facing feature, push back.
- **Telemetry on deferrals:** each `HANDOFF.md` deferral becomes a
  tracked issue. No undocumented "we'll fix it later."

## Open architectural decisions

Must be resolved before the phase that needs them starts:

1. **Kid data doctrine** (Phase 1.1) — Firebase server actions vs.
   atoz-store migration. Argue for atoz-store.
2. **Email verification enforcement** (Phase 1.4) — required vs.
   optional.
3. **Photo storage** (Phase 3.1) — data URLs vs. IndexedDB threshold.
4. **AI SDK choice** (Phase 4.1) — Vercel AI SDK vs. direct
   `@anthropic-ai/sdk`.
5. **State compliance data maintenance** (Phase 4.2) — community-edited
   vs. hand-curated. Legal implications either way.

## Out of scope (for v1)

- Multi-family households / shared curriculum libraries.
- Marketplace for curriculum or tutors.
- Native iOS/Android apps. PWA only.
- Real-time multi-device sync. Local-first means device-local until v2.
- Anything in the "Anti-goals" list of `.kiro/steering/product.md`.
