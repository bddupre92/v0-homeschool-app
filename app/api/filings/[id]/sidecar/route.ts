/**
 * JSON sidecar for a generated filing — "your records belong to you."
 *
 * Returns the frozen source_data_snapshot for a filing as application/json
 * so a family leaving the app (or wanting independent records) can take
 * the full input data with them in a format any other tool can read.
 *
 * Auth: same ownership check as the PDF download route.
 */

import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth-middleware"
import { db } from "@/lib/db"
import { isPostgresConfigured } from "@/lib/postgres-guard"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 })
  }

  const { id } = await ctx.params

  let userId: string
  try {
    const auth = await getCurrentUser()
    userId = await db.resolveOrCreateUserId(auth.userId, auth.email || undefined)
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const filing = await db.getFilingById(id)
  if (!filing) return NextResponse.json({ error: "Filing not found." }, { status: 404 })
  if (filing.user_id !== userId) {
    return NextResponse.json({ error: "Not yours to download." }, { status: 403 })
  }

  const sidecar = {
    // Provenance — written by us, not user-supplied. Makes the JSON
    // sufficient on its own to retrace which tool produced it.
    generator: "AtoZ Family",
    generator_version: "Phase 8",
    generated_at: filing.created_at,
    submitted_at: filing.submitted_at ?? null,
    rules_version: filing.rules_version ?? null,
    state_code: filing.state_code,
    filing_type: filing.filing_type,
    school_year: filing.school_year,
    // The full input snapshot the PDF was rendered from. This is the
    // portable record — drop it into any other tool and you've got
    // everything you logged.
    snapshot: filing.source_data_snapshot,
    // Status the family last asserted to us.
    status: filing.status,
    notes: filing.notes,
  }

  const snap = filing.source_data_snapshot ?? {}
  const childName = (snap.child?.name ?? "filing").toString().replace(/[^a-z0-9]+/gi, "-")
  const filename = `${filing.state_code ?? "filing"}-${filing.filing_type ?? "data"}-${childName}-${filing.school_year ?? ""}.json`

  return new NextResponse(JSON.stringify(sidecar, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    },
  })
}
