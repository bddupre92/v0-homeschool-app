"use server"

/**
 * Phase 8 server actions for state-compliance filing generation.
 *
 * Filings are persisted with their frozen `source_data_snapshot` so the
 * PDF is reproducible. The download route at /api/filings/[id]/download
 * regenerates the PDF on demand from the snapshot — no blob storage in
 * 8.1; we can add Vercel Blob caching later if rendering becomes a hot
 * path.
 */

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth-middleware"
import { db } from "@/lib/db"
import { isPostgresConfigured } from "@/lib/postgres-guard"
import { getFilingMeta, type FilingSnapshot } from "@/lib/compliance/filings"

interface GenerateInput {
  state: FilingSnapshot["state"]
  filingType: string
  schoolYear: string
  childId?: string
  child: { name: string; birthDate?: string; age?: number; grade?: string }
  parent: {
    displayName: string
    email?: string
    phone?: string
    addressLine1?: string
    addressLine2?: string
    city?: string
    addressState?: string
    zip?: string
  }
  instructionStartDate?: string
  notes?: string
}

export async function generateFiling(input: GenerateInput) {
  if (!isPostgresConfigured()) {
    return { success: false, error: "Compliance filings require a connected database." }
  }
  const meta = getFilingMeta(input.state, input.filingType)
  if (!meta) {
    return { success: false, error: `No template for ${input.state}:${input.filingType}` }
  }
  if (!input.child.name?.trim() || !input.parent.displayName?.trim()) {
    return { success: false, error: "Parent name and child name are required." }
  }

  try {
    const auth = await requireAuth()
    const userId = await db.resolveOrCreateUserId(auth.userId, auth.email || undefined)

    const snapshot: FilingSnapshot = {
      state: input.state,
      filingType: input.filingType,
      schoolYear: input.schoolYear,
      generatedAt: new Date().toISOString(),
      instructionStartDate: input.instructionStartDate,
      parent: {
        displayName: input.parent.displayName,
        email: input.parent.email,
        phone: input.parent.phone,
        address: {
          line1: input.parent.addressLine1,
          line2: input.parent.addressLine2,
          city: input.parent.city,
          state: input.parent.addressState,
          zip: input.parent.zip,
        },
      },
      child: {
        id: input.childId ?? "",
        name: input.child.name,
        birthDate: input.child.birthDate,
        age: input.child.age,
        grade: input.child.grade,
      },
      rulesVersion: getRulesVersionFor(input.state),
      notes: input.notes,
    }

    const row = await db.createFiling(userId, {
      stateCode: input.state,
      filingType: input.filingType,
      schoolYear: input.schoolYear,
      childId: input.childId ?? null,
      sourceDataSnapshot: snapshot as unknown as Record<string, any>,
      rulesVersion: snapshot.rulesVersion ?? null,
      notes: input.notes ?? null,
    })

    revalidatePath("/filings")
    return { success: true, filingId: row.id as string }
  } catch (err) {
    console.error("[filings] generateFiling failed:", err)
    return { success: false, error: "Could not generate the filing. Try again." }
  }
}

export async function listMyFilings(opts: { schoolYear?: string; stateCode?: string } = {}) {
  if (!isPostgresConfigured()) return { success: true, filings: [] }
  try {
    const auth = await requireAuth()
    const userId = await db.resolveOrCreateUserId(auth.userId, auth.email || undefined)
    const filings = await db.listFilings(userId, opts)
    return { success: true, filings }
  } catch (err) {
    console.error("[filings] listMyFilings failed:", err)
    return { success: true, filings: [] }
  }
}

export async function markFilingSubmitted(filingId: string) {
  if (!isPostgresConfigured()) return { success: false, error: "Database not configured." }
  try {
    await requireAuth()
    await db.markFilingSubmitted(filingId, new Date().toISOString())
    revalidatePath("/filings")
    revalidatePath(`/filings/${filingId}`)
    return { success: true }
  } catch (err) {
    console.error("[filings] markFilingSubmitted failed:", err)
    return { success: false, error: "Could not mark submitted." }
  }
}

/** Per-state "rules data last reviewed" stamp. Surfaced on the PDF footer. */
function getRulesVersionFor(state: FilingSnapshot["state"]): string {
  switch (state) {
    case "or":
      return "2026-06-14"
    case "ny":
    case "pa":
    case "ma":
    default:
      return new Date().toISOString().slice(0, 10)
  }
}
