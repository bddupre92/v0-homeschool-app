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
| Today | `/today` | Daily landing. Three layouts (Agenda / Per-kid / Compass), compliance countdown, upcoming lessons, day tweaks. |
| Teach | `/teach` | Author a lesson → schedule it → run it full-screen → capture what happened. Optional advisor sidebar for contextual help. |
| Family | `/family/calm` | Kids roster with inline CRUD, weekly rhythm grid, per-kid portfolios at `/family/kid/[id]`. |
| Community | `/people` | Co-parents, tutors, grandparents with scoped access. |
| Library | `/library` | Every lesson across statuses; filter by kid, subject, status. |

Supporting surfaces:

- `/onboarding` — 3-step first-run (welcome → state → first learner).
- `/kid/[id]` — "Kid Mode" — chromeless, big tappable tiles when the
  phone is handed to the learner.
- `/settings`, `/settings/compliance`, `/profile`.
- Auth: `/sign-in`, `/sign-up`, `/reset-password`. Email verification
  at `/verify-email` is **opt-in**, not gated.

## Data doctrine

**Local-first.** Kids, lessons, sessions, captures, portfolio,
memberships, invites, onboarding state, and user preferences live in
localStorage via `lib/atoz-store.ts`. Photos and voice clips larger
than 100KB go to IndexedDB via `lib/blob-store.ts`. The app works
offline and on any device without a backend.

**Firebase Auth** is the only always-online dependency; it gates
access to the rooms but never holds the user's primary data.

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
