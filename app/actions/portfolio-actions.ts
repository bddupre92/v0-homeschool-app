"use server"

import { sql } from "@vercel/postgres"
import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth-middleware"
import { db } from "@/lib/db"
import { AuthenticationError } from "@/lib/errors"

// ─── Auth helpers ────────────────────────────────────────────────────────────

async function getAuthenticatedUserId(): Promise<string> {
  const auth = await requireAuth()
  return db.resolveOrCreateUserId(auth.userId, auth.email || undefined)
}

async function getOptionalUserId(): Promise<string | null> {
  try {
    const auth = await requireAuth()
    return db.resolveOrCreateUserId(auth.userId, auth.email || undefined)
  } catch (error) {
    if (error instanceof AuthenticationError) return null
    throw error
  }
}

// ─── Portfolio Entries ──────────────────────────────────────────────────────

export async function getPortfolioEntries(filters?: {
  childId?: string
  subject?: string
  entryType?: string
  startDate?: string
  endDate?: string
}) {
  try {
    const userId = await getAuthenticatedUserId()
    let conditions = [`pe.user_id = '${userId}'`]
    if (filters?.childId) conditions.push(`pe.child_id = '${filters.childId}'`)
    if (filters?.subject) conditions.push(`pe.subject = '${filters.subject.replace(/'/g, "''")}'`)
    if (filters?.entryType) conditions.push(`pe.entry_type = '${filters.entryType.replace(/'/g, "''")}'`)
    if (filters?.startDate) conditions.push(`pe.date >= '${filters.startDate}'`)
    if (filters?.endDate) conditions.push(`pe.date <= '${filters.endDate}'`)

    const where = conditions.join(" AND ")
    const result = await sql.query(
      `SELECT pe.*, c.name as child_name
       FROM portfolio_entries pe
       LEFT JOIN children c ON pe.child_id = c.id
       WHERE ${where}
       ORDER BY pe.date DESC, pe.created_at DESC`
    )
    return result.rows
  } catch {
    return []
  }
}

export async function addPortfolioEntry(data: {
  childId?: string
  entryType?: string
  title: string
  description?: string
  subject?: string
  date?: string
  fileUrl?: string
  fileType?: string
  tags?: string[]
}) {
  try {
    const userId = await getAuthenticatedUserId()
    const result = await sql`
      INSERT INTO portfolio_entries (user_id, child_id, entry_type, title, description, subject, date, file_url, file_type, tags)
      VALUES (
        ${userId},
        ${data.childId || null},
        ${data.entryType || "work_sample"},
        ${data.title},
        ${data.description || null},
        ${data.subject || null},
        ${data.date || new Date().toISOString().split("T")[0]},
        ${data.fileUrl || null},
        ${data.fileType || null},
        ${data.tags || []}
      )
      RETURNING *
    `
    revalidatePath("/portfolio")
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Failed to add portfolio entry:", error)
    return { success: false, error: "Failed to add portfolio entry" }
  }
}

export async function updatePortfolioEntry(id: string, data: {
  childId?: string
  entryType?: string
  title?: string
  description?: string
  subject?: string
  date?: string
  fileUrl?: string
  fileType?: string
  tags?: string[]
}) {
  try {
    await getAuthenticatedUserId()
    const result = await sql`
      UPDATE portfolio_entries SET
        child_id = COALESCE(${data.childId || null}, child_id),
        entry_type = COALESCE(${data.entryType || null}, entry_type),
        title = COALESCE(${data.title || null}, title),
        description = COALESCE(${data.description || null}, description),
        subject = COALESCE(${data.subject || null}, subject),
        date = COALESCE(${data.date || null}, date),
        file_url = COALESCE(${data.fileUrl || null}, file_url),
        file_type = COALESCE(${data.fileType || null}, file_type),
        tags = COALESCE(${data.tags || null}, tags),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    revalidatePath("/portfolio")
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Failed to update portfolio entry:", error)
    return { success: false, error: "Failed to update portfolio entry" }
  }
}

export async function deletePortfolioEntry(id: string) {
  try {
    await getAuthenticatedUserId()
    await sql`DELETE FROM portfolio_entries WHERE id = ${id}`
    revalidatePath("/portfolio")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete portfolio entry:", error)
    return { success: false, error: "Failed to delete portfolio entry" }
  }
}
