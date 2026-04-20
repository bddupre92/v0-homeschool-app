# AtoZ Family

A calm, local-first homeschool companion. Five rooms — **Today**,
**Teach**, **Family**, **Community**, **Library** — plus onboarding,
settings, and a hand-to-learner **Kid Mode**. No streaks, no badges,
no leaderboards.

## Read these first

| Doc | Purpose |
|---|---|
| [`.kiro/steering/product.md`](.kiro/steering/product.md) | Product thesis in 50 lines. |
| [`HANDOFF.md`](HANDOFF.md) | Full repo state — surface map, locked architectural decisions, deferrals. |
| [`ROADMAP.md`](ROADMAP.md) | Phased development plan (Phase 0 through 6). |
| [`DESIGN.md`](DESIGN.md) | Design partner brief — tokens, primitives, empty states. |
| [`DEPLOY.md`](DEPLOY.md) | Production deploy checklist. |

## Quick start

```bash
# Install
npm install --legacy-peer-deps

# Run with dev bypass auth so you don't need Firebase creds
NEXT_PUBLIC_DEV_BYPASS_AUTH=true npm run dev

# http://localhost:3000 — signed in as "Developer User"
```

## Scripts

```bash
npm run dev                # dev server
npm run build              # production build
npm run lint               # next lint
npm run test:run           # vitest (unit tests in lib/__tests__)
npm run test:e2e           # playwright (e2e smoke suite)
npm run review:screenshots # 14 routes × mobile + desktop (see DESIGN.md)
```

## Stack

- **Next.js 15** App Router, React 19, TypeScript.
- **Firebase Auth** — only always-online dependency. Primary data
  lives locally (localStorage + IndexedDB).
- **Claude (Anthropic API)** — optional, opt-in advisor features.
- **Tailwind + shadcn/ui + Radix primitives** — component layer.
- **Vercel** — hosting target (see `DEPLOY.md`).

## Local data model

- `lib/atoz-store.ts` — kids, lessons, sessions, captures,
  portfolio, memberships, invites, preferences. All localStorage.
- `lib/blob-store.ts` — IndexedDB for photo/voice blobs > 100KB.
- `lib/demo-kids.ts` — `useKids()` hook + initial seed roster.

## Environment

Copy `.env.example` to `.env.local` and fill in whatever you need.
Everything is optional for dev bypass mode; real auth needs
`NEXT_PUBLIC_FIREBASE_*` + `FIREBASE_ADMIN_*`, advisor needs
`ANTHROPIC_API_KEY`.

## Anti-goals

- No streaks, badges, leaderboards, points, XP, scoring.
- No social feed, hashtags, upvotes.
- No mandatory sign-in for reading; auth only on write.
- No performance-culture copy. Rest is learning too.
- No global AI chat widget.

## Contributing

The five-room shape is fixed in MVP. New work should fit within an
existing room or one of the documented phases in `ROADMAP.md`. See
`DESIGN.md` for the visual-iteration workflow.
