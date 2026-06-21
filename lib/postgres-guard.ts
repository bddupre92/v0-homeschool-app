/**
 * Postgres configuration guard. Phase 7 makes Postgres required for the
 * Community room only; the other rooms remain local-first. This helper
 * lets server actions + pages detect a missing POSTGRES_URL and render
 * a friendly "configuration pending" state instead of crashing.
 */

export function isPostgresConfigured(): boolean {
  return Boolean(process.env.POSTGRES_URL)
}

/**
 * Returns a user-facing message when Postgres is unavailable, suitable
 * for Community room empty states. Logs the misconfiguration server-side
 * so operators see it during deploy verification.
 */
export function postgresUnavailableMessage(): string {
  console.warn(
    "[postgres-guard] POSTGRES_URL is not set. Community room is rendering its " +
      "fallback state. Set POSTGRES_URL via the Vercel Postgres integration to " +
      "enable group discovery, announcements, rotations, and field trips.",
  )
  return "Community is being set up. Check back soon — group discovery and shared coordination land once your homeschool admin connects a database."
}
