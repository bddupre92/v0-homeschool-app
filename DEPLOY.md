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
  server page views flow automatically. The capture-loop events
  (`lesson_start`, `capture_taken`, `session_end`, `hours_logged`,
  `kid_added`) fire through `window.va` on supported browsers.
- **Sentry dashboards** — create alerts for (a) unhandled
  exceptions, (b) the 503s on `/api/advisor/*` so you notice if the
  Anthropic key ever gets revoked.

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
