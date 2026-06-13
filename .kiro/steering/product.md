# Product Overview

**AtoZ Family** is a calm, local-first homeschool companion. The product
is deliberately scoped to five "rooms" — surfaces where one job happens
well — and refuses to build performance-culture features (streaks,
badges, leaderboards).

## Tagline
> A calm home for homeschool. Plan, teach, capture, and rest.

## The five calm rooms

Source of truth: `components/navigation.tsx` (PRIMARY_ROOMS).

| Room | Route | Job |
|---|---|---|
| Today | `/today` | The daily slice. Read-only management — check lessons off, tap to teach. Authoring lives in Teach. |
| Teach | `/teach` | The workshop. Drafts (auto-clear after 30 days untouched) and "This week" (next 7 days). Author, schedule, run a session, capture. |
| Family | `/family/calm` | Kids roster with inline CRUD, weekly rhythm grid, per-kid portfolios at `/family/kid/[id]`. |
| Community | `/people` | Co-parents, tutors, grandparents with scoped access. |
| Library | `/library` | The catalog. Every lesson across statuses, plus "Recently deleted" with restore. Search, filter, browse — but author in Teach. |

Supporting surfaces:

- `/onboarding` — 3-step first-run (welcome → state → first learner).
- `/kid/[id]` — "Kid Mode" — chromeless, big tappable tiles when the
  phone is handed to the learner.
- `/settings`, `/settings/compliance`, `/profile`.
- Auth: `/sign-in`, `/sign-up`, `/reset-password`. Email verification
  at `/verify-email` is **opt-in**, not gated.

## Data doctrine

**Local-first reads, durable system of record.** Kids, lessons,
sessions, captures, portfolio, memberships, invites, onboarding state,
and user preferences live in localStorage via `lib/atoz-store.ts`.
Photos and voice clips larger than 100KB go to IndexedDB via
`lib/blob-store.ts`. The app works offline and renders instantly from
local data.

**End-state (DRAFT — pending owner sign-off):** localStorage is a
cache, not the only copy. Postgres (`lib/db.ts`, turned on in Phase 7)
becomes the durable system of record for anything a family cannot
afford to lose — compliance hours, portfolio entries, kids. Sync model
is deliberately simple: explicit "backup to server / restore on new
device" first; live sync only if real demand appears. Until backup
ships, treat localStorage truthfully in copy: never imply records are
"safe" across devices.

**Shared-by-nature data is server-side from day one.** Community
data (groups, co-ops, announcements, rotations, field trips) cannot be
device-local; it lives in Postgres, gated by Firebase Auth + group
membership. This is a deliberate, scoped exception to local-first.

**Firebase Auth** gates access to the rooms but never holds the
user's primary data.

**Claude (Anthropic API)** powers two **opt-in, contextual** features:
the advisor sidebar on `/teach` (4.1) and the NL quick-log fallback
(4.4). Both silently disable when `ANTHROPIC_API_KEY` is not set.
Neither is a global chat widget.

## Anti-goals

- No streaks, badges, leaderboards, or scoring UI.
- No "social" feed; no hashtags, upvotes, or shared boards.
- No mandatory sign-in for reading; auth only on write.
- No performance-culture copy ("you're 3 hours behind!"). Rest is
  learning too.
- No global AI chat widget. Advisor features are contextual to a
  single lesson / log entry and opt-in.

## Target users

Homeschooling families who want a quiet, organized surface for
planning and capturing learning — without a tool that implies their
kids are falling behind.
