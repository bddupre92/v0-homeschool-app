/**
 * PDF download for a generated filing. Regenerates the PDF from the
 * frozen source_data_snapshot — no blob storage in Phase 8.1.
 *
 * Auth: user must own the filing. We resolve the auth context, look up
 * the user's pg uuid, and only serve if user_id matches.
 */

import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth-middleware"
import { db } from "@/lib/db"
import { isPostgresConfigured } from "@/lib/postgres-guard"
import { renderFilingPdf, type FilingSnapshot } from "@/lib/compliance/filings"

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

  const snapshot = filing.source_data_snapshot as FilingSnapshot
  if (!snapshot) {
    return NextResponse.json({ error: "Snapshot missing from filing." }, { status: 500 })
  }

  const pdf = await renderFilingPdf(snapshot)
  const filename = `${snapshot.state}-${snapshot.filingType}-${snapshot.child.name.replace(/[^a-z0-9]+/gi, "-")}-${snapshot.schoolYear}.pdf`

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    },
  })
}
