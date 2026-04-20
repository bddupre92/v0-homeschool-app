# AtoZ Family — Design Partner Brief

This doc is for a design partner (human or Claude-design) picking up the
app for visual iteration. It is grounded in the code shipped through
**Phase 4**. If a section contradicts the code, the code is canonical
and this doc needs updating.

Read first: `.kiro/steering/product.md` (thesis), `HANDOFF.md` (state
of the repo), `ROADMAP.md` (phased plan). Then this doc.

## The product in one sentence

> A calm, local-first homeschool companion. Five rooms — Today, Teach,
> Family, Community, Library — plus auth, onboarding, settings, and a
> hand-to-learner Kid Mode. No streaks, no badges, no leaderboards.

## What design should do here

- **Typography hierarchy.** Three font families ship (Fraunces, Inter,
  Caveat). We use them but haven't tuned them. Size scale, line-height,
  tracking are ready for a pass.
- **Palette refinement.** The tokens in `design/tokens.json` are the
  current language. Three pre-wired palette intensities (soft /
  default / rich) give you room to iterate without touching architecture.
- **Component density.** Every page is functional but some are dense.
  Card padding, empty-state illustrations, and list spacing are the
  primary levers.
- **Empty-state voice.** Every list has an empty state. They're
  literal today. They can be warmer and more specific per surface.
- **Kid Mode** (`/kid/[kidId]`) — designed but only scaffolded. Big
  tappable lesson tiles. Needs a visual language all its own.

## What design should not do here

- Don't propose new rooms, routes, or features. The **five-room shape**
  is fixed in MVP.
- Don't break the anti-goals (below). Anything performance-y, anything
  scored, anything that pressures the parent is out of scope.
- Don't rebuild navigation, the five-room model, or the local-first
  data layer. Those are product decisions, not design ones.

## Anti-goals (strict — mirror from `.kiro/steering/product.md`)

- No streaks, badges, leaderboards, points, XP, scoring, grading.
- No social feed, upvotes, hashtags, activity feed.
- No mandatory sign-in for reading — auth gates writes only.
- No performance-culture copy ("you're 3 hours behind", "catch up").
- No global AI chat widget. The advisor (4.1) is contextual to a
  single lesson and opt-in.

## Brand voice

- **Calm, not cute.** "Your people." "The lesson loop." "Rest is
  learning too." "A quiet day."
- **Second person, direct, warm.** "Tap any field to change it."
- **Never apologize for rest.** Missed lessons are not debt.
- **Learner voice stays hand-written.** `atoz-quote` uses Caveat for
  pull-quotes from captured student words — that's its only job.

## Surfaces (what to design)

Every surface exists in code today. Screenshots live in
`screenshots/<viewport>/<slug>.png` after `npm run review:screenshots`.

### Public / auth (chromeless)

| Route | Slug | Job |
|---|---|---|
| `/` | `root` | Public landing + sign-in / sign-up CTAs. |
| `/sign-in` | `sign-in` | Email + Google. |
| `/sign-up` | `sign-up` | Email + Google, required T&C checkbox. |
| `/reset-password` | `reset-password` | Password reset flow. |
| `/verify-email` | `verify-email` | **Opt-in** post-signup. Not gated. |
| `/onboarding` | `onboarding` | **3-step wizard**: welcome → state → first learner. |

### Five rooms (authenticated, full chrome)

| Route | Slug | Job | Notes |
|---|---|---|---|
| `/today` | `today` | Daily landing. Three layouts (Agenda / Per-kid / Compass), compliance countdown, upcoming, recently saved, day tweaks. | Highest-traffic surface. |
| `/teach` | `teach` | Author a lesson → schedule it. | Drafts + scheduled list. |
| `/teach/[sessionId]` | `teach-session` | **Fullscreen dark teach mode.** Timer, plan steps, capture bar (note / photo / quote / voice), advisor panel, wrap screen with reflection + traits + "worth remembering" prompts. | The only dark surface in the app. |
| `/family/calm` | `family-calm` | Kid roster + weekly rhythm grid + inline add/edit kid. |
| `/family/kid/[kidId]` | `family-kid-emma` | Per-kid portfolio. Observed traits cloud, photos, voice clips, reflections. "Hand to [kid]" button. |
| `/people` | `people` | Parents / helpers / pending invites. |
| `/library` | `library` | Every lesson across statuses, filterable by kid/subject/status. |

### Kid Mode (chromeless, hand-to-learner)

| Route | Slug | Job |
|---|---|---|
| `/kid/[kidId]` | `kid-mode-emma` | **Big tappable tiles** for today's lessons. Kid-color gradient background. No nav. Launched via "Hand to [kid]" button on `/family/kid/[kidId]`. |

### Settings + profile

| Route | Slug | Job |
|---|---|---|
| `/settings` | `settings` | Account, Advisor (opt-in AI), Appearance (family name + accent), Notifications, Security (password, email verification). |
| `/settings/compliance` | `settings-compliance` | State-specific filing deadlines (FL/TX/CA/NY/PA curated). |
| `/profile` | `profile` | Read-only profile stats. |

### Legal / system

| Route | Slug |
|---|---|
| `/privacy-policy` | `privacy-policy` |
| `/terms-of-service` | `terms-of-service` |
| `/offline` | `offline` |

## Design tokens

Authoritative source: `design/tokens.json` — W3C design tokens format,
importable into Figma Tokens. CSS source: top of `app/globals.css`.

### Palette summary

- **Linen** (`#faf6ee`) — page background. The default canvas. Never fights type.
- **Ink** 4-stop ramp (`#1f2a22` → `#8c8472`) — the only neutral we
  need. `--ink` is headline, `--ink-4` is the whisper.
- **Sage** 5-stop — default accent. `--sage-dd` is primary CTA fill.
- **Terracotta** + **Honey** — warm attention. Used *sparingly* for
  pills, alerts, compliance urgency.
- **Brand** (`--brand`, default `#556b47`) — user-overridable family
  accent from Settings → Appearance. Painted onto the brand mark and
  the mobile log-hours FAB. **Your palette should keep `--brand` as a
  single token the user can swap.**

### Type

- **Fraunces** (display) — all headlines, all numbers. Light / normal
  weights only (we use 300 and 400). Tracking tightens at larger sizes.
- **Inter** (sans) — all body, all UI chrome.
- **Caveat** (hand) — `atoz-quote` class only. Pull-quotes of student
  voice. Reserve it.

Existing scale (tokens are in `design/tokens.json`):

- `display-xl` 48-56px / 300 / tracking -0.02em — hero h1
- `display-lg` 32-40px / 400 — kid pages
- `display-md` 24px / 500 — section titles
- `body` 14-15px / 400
- `eyebrow` 11-12px / 600 / 0.14em uppercase — label above headlines

### Density + palette modifiers

Already wired in CSS. Set `data-density` or `data-palette` on the
document root to preview alternates:

```css
data-density="compact" | "comfortable" (default) | "spacious"
data-palette="soft"    | "default"              | "rich"
```

Designers can iterate freely on either axis — they only change
CSS-custom-property values, not shapes.

## Component primitives (your Figma library seeds)

Source: `components/primitives/`. Treat these as the only shapes that
appear on more than one surface.

- **KidDot** (`kid-dot.tsx`) — colored circle with learner's initial.
  Sizes: xs / sm / md / lg.
- **Pill** (`pill.tsx`) — small rounded tag. Variants: default / sage
  / honey / terracotta.
- **Chip / KidChip** (`chip.tsx`, `kid-chip.tsx`) — selectable filters
  with active + inactive states.
- **ProgressRail** (`progress-rail.tsx`) — horizontal progress bar
  with sage / honey / terracotta tones.
- **ComplianceStrip** (`primitives/index.ts`) — full-width inline
  banner with icon + action.
- **Topbar / PhoneBottomNav / FAB** — the five-room chrome.
- **Teach primitives** (`primitives/teach.tsx`) — dark-mode
  equivalents: `TeachScreen`, `TeachTimer`, `TeachCard`, `TeachBtn`,
  `TeachProgress`, `CaptureBar`, `TeachSubjectChip`.

Ad-hoc components worth extracting to the Figma library later (but not
yet primitives):

- Lesson row (used on /today, /library, /teach).
- Portfolio item card (used on /today "Recently saved", /family/kid).
- Weekly rhythm grid cell (from `components/weekly-rhythm.tsx`).
- Capture dialog (note / photo / quote / voice modes).

## Empty states (low-hanging polish)

Currently literal. Each has a tone and a suggestion. Open for rewrite.

| Surface | Current state | Hint |
|---|---|---|
| `/today` with no scheduled lessons | "No lessons scheduled today. That's a quiet day — rest is learning too." | Keep warm. This is the most-seen empty state. |
| `/family/calm` with no kids | "No learners yet. Add your first to start planning lessons." | Paired with a prominent Add button. |
| `/teach` drafts | "Nothing in drafts. Use **New lesson** to start one." | — |
| `/library` no lessons | "Nothing here yet. **New lesson** is a good next step." | — |
| `/people` solo parent | "It's just you. That's plenty. Invite a co-parent anytime." | — |
| Kid portfolio with 0 items | "Nothing saved yet. Items land here after a teach session ends with 'Save to portfolio'." | — |
| Compass (weekly) with no hours | "No captured hours yet this week. Teach a lesson and it'll land here." | — |

## Visual-regression workflow

```bash
# Terminal 1
NEXT_PUBLIC_DEV_BYPASS_AUTH=true npm run dev

# Terminal 2 — all 14 core routes × mobile + desktop
npm run review:screenshots

# Seed dynamic routes (/teach/[id], /family/kid/emma, /kid/emma)
node scripts/review-seed-dynamic.mjs
```

Outputs to `screenshots/<viewport>/<slug>.png` (gitignored). Drag-drop
into Figma or compare before/after locally.

## Design handoff cadence

1. Design delivers Figma with updated tokens + any new primitive
   shapes.
2. We port token changes into `app/globals.css` and
   `design/tokens.json`.
3. We rebuild primitives in `components/primitives/` to match.
4. Ad-hoc components that show up in 2+ places graduate into
   primitives.
5. Visual-regression via the screenshot script confirms the full app
   moved together, not just the pages we touched.

## Open visual questions (worth discussing first)

1. **Hero typography on `/today`.** Current hero is Fraunces Light at
   48-56px. Does it want a number eyebrow too ("Lesson 3 of 5")?
2. **The dark teach mode.** Only dark surface in the app. Should the
   palette get its own semantic tokens (currently uses `bg-[#1b1f15]`
   inline) or stay inline?
3. **Kid Mode.** Needs its own visual language — currently a
   color-tinted gradient. Should it look more playful without
   slipping into gamification?
4. **Compliance countdown urgency.** Three tones (calm / soon /
   urgent) based on days-until. Terracotta for "≤14 days" — too
   strong? Too subtle?
5. **Log-hours FAB + brand color.** Now painted with `--brand`. Does
   a custom family color hold up at 56px on linen? Need a contrast
   floor.

## Where to put the answers

When design iterations come back:

- **Token changes** → update `design/tokens.json` **and** the CSS
  custom properties at the top of `app/globals.css`. Both must stay
  in sync.
- **Primitive shape changes** → edit `components/primitives/<name>.tsx`.
  The component API stays stable; only visuals change.
- **New screen variants** → new files in `app/` only when a new route
  is justified; otherwise it's a composition of existing primitives.

## Deferred / out of scope for this pass

- Motion language beyond the two tokens (150ms / 250ms ease). A full
  motion spec is Phase 6 material.
- Illustrated empty states (SVG mascots, etc.). Ship as strings first.
- Multi-language / RTL. Not considered in v1.
- Print stylesheets for portfolio export — Phase 6.

---

**You have:**
- The repo (all 5 phases shipped through 4).
- `HANDOFF.md`, `ROADMAP.md`, this doc.
- `design/tokens.json`.
- `screenshots/` (generated on-demand).

**You don't have:**
- A production Firebase / Postgres / Sentry setup — those are Phase 6.
- A design system Figma file — that's what you're making.
- A brand guideline PDF — the written sections above are the guide.
