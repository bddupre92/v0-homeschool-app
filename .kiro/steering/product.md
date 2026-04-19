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
| Today | `/today` | Daily landing: greeting, today's lessons, weekly progress, quick-log FAB. |
| Teach | `/teach` | Author a lesson → schedule it → run it full-screen → capture what happened. |
| Family | `/family/calm` | Kids roster, per-kid portfolio, hours summary. |
| Community | `/people` | Co-parents, tutors, grandparents with scoped access. |
| Library | `/library` | Every lesson across statuses; filter by kid, subject, status. |

Plus: `/settings`, `/profile`, and the auth pages (`/sign-in`, `/sign-up`,
`/reset-password`, `/verify-email`).

## Data doctrine

**Local-first.** Lessons, sessions, captures, memberships, invites, and
the portfolio live in `localStorage` via `lib/atoz-store.ts`. The app
works offline and on any device without a backend. See the docstring at
the top of that file.

**Firebase Auth** is the only always-online dependency; it gates access
to the rooms but never holds the user's primary data.

Kid and family data *currently* runs through Firebase-backed server
actions (`app/actions/family-actions.ts`). That's a known architectural
inconsistency queued for migration into `atoz-store`. Demo kids
(`lib/demo-kids.ts`) render until real CRUD ships in `/family/calm`.

## Anti-goals

- No streaks, badges, leaderboards, or scoring UI.
- No "social" feed; no hashtags, upvotes, or shared boards.
- No mandatory sign-in for reading; auth only on write.
- No performance-culture copy ("you're 3 hours behind!"). Rest is
  learning too.

## Target users

Homeschooling families who want a quiet, organized surface for planning
and capturing learning — without a tool that implies their kids are
falling behind.
