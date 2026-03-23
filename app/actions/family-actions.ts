"use server"

import { sql } from "@vercel/postgres"

// ─── Family Blueprint ────────────────────────────────────────────────────────

export async function getFamilyBlueprint(userId: string) {
  try {
    const result = await sql`
      SELECT * FROM family_blueprints WHERE user_id = ${userId}
    `
    return result.rows[0] || null
  } catch {
    return null
  }
}

export async function saveFamilyBlueprint(userId: string, data: {
  familyName?: string
  values?: string[]
  philosophy?: string[]
  traitPillars?: { name: string; description: string }[]
  stateAbbreviation?: string
}) {
  try {
    const result = await sql`
      INSERT INTO family_blueprints (user_id, family_name, values, philosophy, trait_pillars, state_abbreviation)
      VALUES (
        ${userId},
        ${data.familyName || null},
        ${data.values || []},
        ${data.philosophy || []},
        ${JSON.stringify(data.traitPillars || [])},
        ${data.stateAbbreviation || null}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        family_name = EXCLUDED.family_name,
        values = EXCLUDED.values,
        philosophy = EXCLUDED.philosophy,
        trait_pillars = EXCLUDED.trait_pillars,
        state_abbreviation = EXCLUDED.state_abbreviation,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Failed to save family blueprint:", error)
    return { success: false, error: "Failed to save family blueprint" }
  }
}

// ─── Children ────────────────────────────────────────────────────────────────

export async function getChildren(userId: string) {
  try {
    const result = await sql`
      SELECT * FROM children WHERE user_id = ${userId} ORDER BY created_at
    `
    return result.rows
  } catch {
    return []
  }
}

export async function addChild(userId: string, data: {
  name: string
  age?: number
  grade?: string
  learningStyle?: string
  interests?: string[]
  strengths?: string[]
  challenges?: string[]
}) {
  try {
    const result = await sql`
      INSERT INTO children (user_id, name, age, grade, learning_style, interests, strengths, challenges)
      VALUES (
        ${userId},
        ${data.name},
        ${data.age || null},
        ${data.grade || null},
        ${data.learningStyle || null},
        ${data.interests || []},
        ${data.strengths || []},
        ${data.challenges || []}
      )
      RETURNING *
    `
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Failed to add child:", error)
    return { success: false, error: "Failed to add child" }
  }
}

export async function updateChild(childId: string, data: {
  name?: string
  age?: number
  grade?: string
  learningStyle?: string
  interests?: string[]
  strengths?: string[]
  challenges?: string[]
}) {
  try {
    const result = await sql`
      UPDATE children SET
        name = COALESCE(${data.name || null}, name),
        age = COALESCE(${data.age || null}, age),
        grade = COALESCE(${data.grade || null}, grade),
        learning_style = COALESCE(${data.learningStyle || null}, learning_style),
        interests = COALESCE(${data.interests || null}, interests),
        strengths = COALESCE(${data.strengths || null}, strengths),
        challenges = COALESCE(${data.challenges || null}, challenges),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${childId}
      RETURNING *
    `
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Failed to update child:", error)
    return { success: false, error: "Failed to update child" }
  }
}

export async function deleteChild(childId: string) {
  try {
    await sql`DELETE FROM children WHERE id = ${childId}`
    return { success: true }
  } catch (error) {
    console.error("Failed to delete child:", error)
    return { success: false, error: "Failed to delete child" }
  }
}

// ─── Hour Logging ────────────────────────────────────────────────────────────

export async function logHours(userId: string, data: {
  childId: string
  subject: string
  hours: number
  date?: string
  notes?: string
  lessonPacketId?: string
}) {
  try {
    const result = await sql`
      INSERT INTO hour_logs (user_id, child_id, subject, hours, date, notes, lesson_packet_id)
      VALUES (
        ${userId},
        ${data.childId},
        ${data.subject},
        ${data.hours},
        ${data.date || new Date().toISOString().split("T")[0]},
        ${data.notes || null},
        ${data.lessonPacketId || null}
      )
      RETURNING *
    `
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Failed to log hours:", error)
    return { success: false, error: "Failed to log hours" }
  }
}

export async function getHourLogs(userId: string, options?: {
  childId?: string
  subject?: string
  startDate?: string
  endDate?: string
}) {
  try {
    let conditions = [`user_id = '${userId}'`]
    if (options?.childId) conditions.push(`child_id = '${options.childId}'`)
    if (options?.subject) conditions.push(`subject = '${options.subject.replace(/'/g, "''")}'`)
    if (options?.startDate) conditions.push(`date >= '${options.startDate}'`)
    if (options?.endDate) conditions.push(`date <= '${options.endDate}'`)

    const where = conditions.join(" AND ")
    const result = await sql.query(
      `SELECT hl.*, c.name as child_name FROM hour_logs hl JOIN children c ON hl.child_id = c.id WHERE ${where} ORDER BY hl.date DESC, hl.created_at DESC`
    )
    return result.rows
  } catch {
    return []
  }
}

export async function getHourSummary(userId: string, childId?: string) {
  try {
    const childFilter = childId ? `AND hl.child_id = '${childId}'` : ""
    const result = await sql.query(
      `SELECT
        hl.subject,
        SUM(hl.hours)::numeric(10,2) as total_hours,
        COUNT(*)::int as session_count,
        MAX(hl.date) as last_logged
      FROM hour_logs hl
      WHERE hl.user_id = '${userId}' ${childFilter}
        AND hl.date >= date_trunc('year', CURRENT_DATE)
      GROUP BY hl.subject
      ORDER BY total_hours DESC`
    )
    return result.rows
  } catch {
    return []
  }
}

export async function getTotalHoursThisYear(userId: string, childId?: string) {
  try {
    const childFilter = childId ? `AND child_id = '${childId}'` : ""
    const result = await sql.query(
      `SELECT COALESCE(SUM(hours), 0)::numeric(10,2) as total
       FROM hour_logs
       WHERE user_id = '${userId}' ${childFilter}
         AND date >= date_trunc('year', CURRENT_DATE)`
    )
    return parseFloat(result.rows[0].total)
  } catch {
    return 0
  }
}

// ─── Compliance Filings ──────────────────────────────────────────────────────

export async function getComplianceFilings(userId: string) {
  try {
    const result = await sql`
      SELECT * FROM compliance_filings
      WHERE user_id = ${userId}
      ORDER BY due_date ASC NULLS LAST
    `
    return result.rows
  } catch {
    return []
  }
}

export async function saveComplianceFiling(userId: string, data: {
  stateAbbreviation: string
  filingType: string
  status?: string
  dueDate?: string
  filedDate?: string
  notes?: string
}) {
  try {
    const result = await sql`
      INSERT INTO compliance_filings (user_id, state_abbreviation, filing_type, status, due_date, filed_date, notes)
      VALUES (
        ${userId},
        ${data.stateAbbreviation},
        ${data.filingType},
        ${data.status || "pending"},
        ${data.dueDate || null},
        ${data.filedDate || null},
        ${data.notes || null}
      )
      RETURNING *
    `
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Failed to save compliance filing:", error)
    return { success: false, error: "Failed to save compliance filing" }
  }
}

export async function updateComplianceFiling(filingId: string, data: {
  status?: string
  filedDate?: string
  notes?: string
}) {
  try {
    const result = await sql`
      UPDATE compliance_filings SET
        status = COALESCE(${data.status || null}, status),
        filed_date = COALESCE(${data.filedDate || null}, filed_date),
        notes = COALESCE(${data.notes || null}, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${filingId}
      RETURNING *
    `
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Failed to update compliance filing:", error)
    return { success: false, error: "Failed to update compliance filing" }
  }
}
