/**
 * Health / integration-status endpoint.
 *
 * GET /api/health reports which external integrations are configured so a
 * fresh deploy can be verified in one request instead of discovering missing
 * env vars through silently-empty pages.
 *
 * Reports presence of configuration only — never values.
 */

import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const integrations = {
    firebaseClient: Boolean(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    ),
    firebaseAdmin: Boolean(
      process.env.FIREBASE_ADMIN_PRIVATE_KEY &&
        process.env.FIREBASE_ADMIN_PROJECT_ID &&
        process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    ),
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    postgres: Boolean(process.env.POSTGRES_URL),
    sentry: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
    blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  }

  const missing = Object.entries(integrations)
    .filter(([, configured]) => !configured)
    .map(([name]) => name)

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
    integrations,
    missing,
  })
}
