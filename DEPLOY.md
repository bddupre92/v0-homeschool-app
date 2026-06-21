# Deploy checklist

End-to-end deploy guide for AtoZ Family. Assumes Vercel as the host
(the app ships as a Next.js 15 server + a small set of API routes).
Adjust the Vercel-specific steps for other hosts if you prefer.

## 0. Before you start

Have ready:

- A domain you want to use (or postpone and run on `*.vercel.app`).
- A Firebase project (Authentication + Firestore enabled).
- An Anthropic API key (optional — advisor features 503 without it).
- A Sentry project (optional — client errors silently skipped without
  `NEXT_PUBLIC_SENTRY_DSN`).
- A Vercel account connected to the `bddupre92/v0-homeschool-app`
  GitHub repo.

Clone a copy of `.env.example` to keep as a paste reference while
filling out Vercel project settings.

## 1. Firebase project setup

1. **Create project** at https://console.firebase.google.com. Turn
   off Google Analytics unless you want it — we don't use it.
2. **Enable Authentication** → Sign-in method → **Email/Password**
   and **Google**. Add your production domain (and `localhost`) to
   the **Authorized domains** list.
3. **Create a Web app** (</>) under Project settings → General. Copy
   the config into the `NEXT_PUBLIC_FIREBASE_*` env vars.
4. **Generate an admin service account** under Project settings →
   Service accounts → Generate new private key. This yields a JSON.
   Copy into `FIREBASE_ADMIN_*`. Preserve the private key's newlines
   — Vercel's env UI supports multiline values.
5. **(Optional) Firestore rules.** If you're not using Firestore yet
   but have it created, set rules to `allow read, write: if false;`
   so you don't leak data while you're not using it.

## 2. Anthropic + Sentry (optional)

**Anthropic** — `ANTHROPIC_API_KEY` unlocks:

- `/api/advisor/suggest` — contextual lesson suggestions on /teach.
- `/api/advisor/quick-log` — NL fallback for the Log-hours dialog.

Both endpoints return 503 when unset; the UI hides the features. The
advisor also has to be opted-in per-user in Settings → Advisor, so
even with the key present, users see nothing until they enable it.

**Sentry** — create a project, paste the DSN into
`NEXT_PUBLIC_SENTRY_DSN`. `lib/error-tracking.tsx` only initializes
when both `NODE_ENV=production` and the DSN are set.

## 3. Vercel project

1. **Import** the GitHub repo in Vercel. Framework preset should
   auto-detect Next.js.
2. **Install command:** `npm install --legacy-peer-deps`.
3. **Build command:** `npm run build` (default).
4. **Output:** Next.js default.
5. **Node version:** 22.x (matches what CI runs).
6. **Environment variables** — paste every required value from
   `.env.example`. Critical ones:

   | Variable | Required for | Notes |
   |---|---|---|
   | `NEXT_PUBLIC_FIREBASE_*` (6 vars) | Real auth | Missing → sign-in/sign-up fail. |
   | `FIREBASE_ADMIN_*` (3 vars) | Server session verify | Needed for Firebase session cookies. |
   | `ANTHROPIC_API_KEY` | Advisor features | Missing → features hidden (opt-in already off). |
   | `NEXT_PUBLIC_SENTRY_DSN` | Error tracking | Missing → Sentry is a no-op. |
   | `NEXT_PUBLIC_DEV_BYPASS_AUTH` | **Never set on prod** | Keep unset or `false`. |
   | `ALLOW_DEV_AUTH_BYPASS` | **Never set on prod** | Belt + suspenders for the above. |

   Set env vars for **Production**, **Preview**, and **Development**
   scopes. Preview deploys inherit all of them by default.

7. **Deploy.** Vercel picks the repo's default branch (main).

## 3.5. Postgres (required for the Community room)

As of Phase 7 the **Community** room (`/community`, `/community/new`,
`/community/preferences`, `/community/groups/[id]`) reads and writes
Postgres. Without `POSTGRES_URL` set, every Community page renders a
calm "Community is being set up" empty state — the app does not crash,
but discovery + group coordination won't work. The other four rooms
remain fully local-first.

### Connect Vercel Postgres

1. **Storage tab** → **Create Database** → **Postgres** → pick a region
   near your users.
2. **Connect Project** → select `bddupre92/v0-homeschool-app`. Vercel
   auto-populates three env vars in **Production**, **Preview**, and
   **Development** scopes:
   - `POSTGRES_URL` (pooled)
   - `POSTGRES_PRISMA_URL` (pooled, Prisma-shaped)
   - `POSTGRES_URL_NON_POOLING`
   For local dev, run `vercel env pull .env.local` to mirror the
   connection strings down.
3. **Trigger a fresh deploy** so the new env vars take effect.

### Run the one-time schema bootstrap

`app/api/init-db/route.ts` is idempotent — it creates every table with
`CREATE TABLE IF NOT EXISTS` and backfills new discovery columns via
`ALTER TABLE ADD COLUMN IF NOT EXISTS`. Safe to call at any time.

```bash
curl -X POST https://<your-domain>/api/init-db
# Expected: {"success": true, "message": "All tables created successfully"}
```

If `POSTGRES_URL` isn't picked up yet, the route returns
`{ skipped: true, reason: "POSTGRES_URL not configured" }` — that means
the env var didn't propagate; redeploy and try again.

### Verify

```bash
curl https://<your-domain>/api/health
```

Expected JSON:

```json
{
  "status": "ok",
  "integrations": {
    "firebaseClient": true,
    "firebaseAdmin": true,
    "anthropic": true,
    "postgres": true,
    "sentry": true,
    "blob": false
  },
  "missing": ["blob"]
}
```

Anything in `missing` won't crash the app, but the corresponding
feature will degrade. `postgres: false` here is the single signal that
Community discovery is non-functional.

### Schema overview

Tables created by `/api/init-db` (in dependency order):

- `users` — Firebase UID ↔ Postgres UUID bridge.
- `curricula`, `lessons` — legacy scaffolding (Phase 8 will use).
- `groups` (with 13 discovery columns: `philosophy`, `age_groups`,
  `subjects_offered`, `schedule JSONB`, `latitude`/`longitude`,
  `zip_code`, `is_accepting_members`, `member_count`, `external_url`).
- `group_members` — UUID ↔ UUID with role.
- `group_shared_packets`, `group_announcements`, `teaching_rotations`,
  `group_field_trips`, `group_field_trip_rsvps` — coordination tables.
- `user_group_preferences` — per-user discovery prefs.
- `state_requirements`, `lesson_packets`, `family_blueprints`,
  `children`, `hour_logs`, `compliance_filings`, `filing_documents`,
  `portfolio_entries`, `user_module_preferences` — earlier-phase tables.

Indexes for `groups(latitude, longitude)`, `groups(zip_code)`,
`groups(philosophy)`, and the per-group coordination queries are
created automatically.

### Roll back

Vercel Postgres → Disconnect Project. Community pages fall back to the
calm empty-state cards immediately on next request. Other rooms are
unaffected because their data lives in localStorage / IndexedDB.

## 3.6. Filings generator (Phase 8 — Postgres required)

State-compliance filing generation reuses the same Postgres database
configured in §3.5. There are no new env vars. Once Postgres is wired,
`/filings` + `/filings/new` start working immediately; the
`/api/filings/[id]/download` and `/api/filings/[id]/sidecar` endpoints
go live for filings the user generates.

Six filings ship across four states:

| State | Filing | Citation |
|---|---|---|
| NY | IHIP (annual) | 8 NYCRR § 100.10 |
| NY | Quarterly Report (Q1-Q4) | 8 NYCRR § 100.10(g) |
| PA | Act 169 portfolio | 24 P.S. § 13-1327.1 |
| MA | Home Education Plan (Charles criteria) | Care and Protection of Charles, 399 Mass. 324 (1987) |
| OR | Notification of Intent | ORS 339.030 / OAR 581-021-0026 |
| OR | Standardized test results | ORS 339.035 / OAR 581-021-0029 |

Each filing carries:
- a per-page footer with `Generated by AtoZ Family on <date>, state
  rules as of <YYYY-MM-DD>`, so an evaluator or district admin can see
  exactly which version of the rules data was used.
- a first-page disclaimer block with the statutory citation and a
  "not legal advice — verify your state's current requirements"
  warning.
- a downloadable JSON sidecar (`/api/filings/[id]/sidecar`) with the
  full source snapshot, so families can take their records to any
  other tool.

**When statutes change**, edit:
1. The matching template in `lib/compliance/filings/*.tsx` (citation,
   required-subject lists, etc.).
2. The rules-version stamp in `app/actions/filings-actions.ts`'s
   `getRulesVersionFor(state)`.
3. `lib/compliance/filings/deadlines.ts` if a deadline shifted.

All three changes ship in one commit so the footer date and the
template body stay in sync.

## 4. First deploy checks

Visit the preview URL Vercel gives you. Verify:

- `/` renders the public landing.
- `/sign-up` creates a Firebase user (check Firebase console →
  Authentication → Users).
- New user lands on `/onboarding`, completes all 3 steps, arrives at
  `/today`.
- `/family/calm` — add a learner via the inline dialog. Refresh the
  page: learner persists (localStorage).
- `/teach` → create a lesson → schedule for today → "Teach" →
  capture a note, a photo, a voice clip → End lesson → Save to
  portfolio.
- `/family/kid/<id>` renders the saved portfolio item with photo +
  voice.
- `/settings/compliance` — pick your state, see filings.
- Open DevTools → Application → Service Workers. Service worker is
  registered at `/service-worker.js`. Turn off network → refresh
  `/today` → you get the `/offline` shell, not the browser error.

## 5. Domain + HTTPS

In Vercel project → Domains → add your custom domain. Vercel handles
the TLS cert automatically.

**Firebase:** after the domain is live, go back to the Firebase
console and add the production domain to Authentication → Settings →
Authorized domains. Sign-in will fail against unauthorized domains.

## 6. Legal + privacy gates (before public launch)

- Update `/privacy-policy` with your real data-handling statement.
  Mention: we store lesson data on the device (localStorage +
  IndexedDB), we use Firebase for auth only, and (if enabled)
  Anthropic for advisor features.
- Update `/terms-of-service` — have a lawyer review before
  accepting sign-ups.
- **Compliance data** in `lib/compliance/index.ts` is community-
  curated and unreviewed. Either (a) get legal sign-off per state
  before launch, or (b) keep the "pending legal review" banner on
  `/settings/compliance` so users know to verify independently.

## 7. Analytics + monitoring

- **Vercel Analytics** — enable in the Vercel project. Client +
  server page views flow automatically. Calm-loop events
  (`lesson_start`, `lesson_row_action`, `capture_taken`, `session_end`,
  `hours_logged`, `kid_added`) plus Phase 7 community events
  (`community_preferences_saved`, `community_discovery_queried`,
  `community_group_created`, `community_group_joined`,
  `community_group_left`, `community_group_viewed`,
  `community_external_link_opened`) fire through `window.va`. All
  community events are deliberately data-minimal — only `zip_prefix3`
  (first 3 digits), never the full ZIP, never group descriptions or
  member identities. Phase 8 will add `filing_generated`,
  `filing_downloaded`, `filing_sidecar_downloaded`, and
  `filing_marked_submitted` events in a follow-up — they're not
  emitted yet to keep the surface area small for the v1 launch.
- **Sentry dashboards** — create alerts for (a) unhandled
  exceptions, (b) the 503s on `/api/advisor/*` so you notice if the
  Anthropic key ever gets revoked, (c) any 5xx on `/api/init-db` or
  `/community/*` once Postgres is wired.

## 8. Production smoke tests

Run these against the production domain once a week:

- Incognito → /sign-up → onboard → log a lesson.
- Incognito → /sign-in with an existing account → / → teach a
  lesson → photo capture.
- `/settings/compliance` shows the right state after sign-in.
- Network-off test — service worker falls back to `/offline`.

## 9. Rollback

Vercel keeps every deploy. From the dashboard → Deployments, click
"Promote to Production" on any prior deploy to instantly roll back.
No data migration needed because the app's primary data is local to
the device.

## 10. Known follow-ups (Phase 6 deferrals)

- **Two e2e interaction tests are parked** with `test.skip()` —
  `/today` layout switcher and `/family/calm` add-learner dialog.
  Both fail against `npm run dev` due to a React state-update
  timing issue that resolves against `npm run build && npm start`.
  Re-enable once CI runs e2e against the prod build.
- **`/api/init-db`** silently 500s in production because Postgres
  isn't required. If you do wire up Postgres, expect this endpoint
  to start succeeding.
- **Legacy routes under `/api/lessons`, `/api/backups`,
  `/api/state-requirements`** were retained from earlier scaffolding
  and aren't used by the shipping UI. Safe to delete at launch time
  if Postgres remains out of scope.
- **Hydration-mismatch warnings** in dev mode are cosmetic — see
  `HANDOFF.md` deferrals. They don't surface in production builds
  but do block the parked e2e tests above.
