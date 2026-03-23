"use server"

import { sql } from "@vercel/postgres"
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

// ─── Curriculum Recommendations ─────────────────────────────────────────────

export async function saveRecommendation(_userId: string, data: {
  childId: string
  title: string
  schoolYear?: string
  grade?: string
  tags?: string[]
  aiNotes?: string
  subjects: {
    name: string
    color?: string
    sortOrder?: number
    objectives: {
      title: string
      description?: string
      sortOrder?: number
    }[]
  }[]
}) {
  try {
    const userId = await getAuthenticatedUserId()
    // Create the recommendation
    const rec = await sql`
      INSERT INTO curriculum_recommendations (user_id, child_id, title, school_year, grade, tags, ai_notes, status)
      VALUES (
        ${userId},
        ${data.childId},
        ${data.title},
        ${data.schoolYear || null},
        ${data.grade || null},
        ${data.tags || []},
        ${data.aiNotes || null},
        'pending'
      )
      RETURNING *
    `
    const recommendation = rec.rows[0]

    // Create subjects and objectives
    for (const subject of data.subjects) {
      const subResult = await sql`
        INSERT INTO recommendation_subjects (recommendation_id, name, color, sort_order)
        VALUES (${recommendation.id}, ${subject.name}, ${subject.color || '#3b82f6'}, ${subject.sortOrder || 0})
        RETURNING *
      `
      const subjectRow = subResult.rows[0]

      for (const obj of subject.objectives) {
        await sql`
          INSERT INTO recommendation_objectives (subject_id, recommendation_id, title, description, sort_order)
          VALUES (${subjectRow.id}, ${recommendation.id}, ${obj.title}, ${obj.description || null}, ${obj.sortOrder || 0})
        `
      }
    }

    return { success: true, data: recommendation }
  } catch (error) {
    console.error("Failed to save recommendation:", error)
    return { success: false, error: "Failed to save recommendation" }
  }
}

export async function getRecommendations(_userId?: string, childId?: string) {
  try {
    const userId = await getAuthenticatedUserId()
    let result
    if (childId) {
      result = await sql`
        SELECT cr.*, c.name as child_name
        FROM curriculum_recommendations cr
        JOIN children c ON cr.child_id = c.id
        WHERE cr.user_id = ${userId} AND cr.child_id = ${childId}
        ORDER BY cr.created_at DESC
      `
    } else {
      result = await sql`
        SELECT cr.*, c.name as child_name
        FROM curriculum_recommendations cr
        JOIN children c ON cr.child_id = c.id
        WHERE cr.user_id = ${userId}
        ORDER BY cr.created_at DESC
      `
    }
    return result.rows
  } catch {
    return []
  }
}

export async function getRecommendationDetail(recommendationId: string) {
  try {
    const rec = await sql`
      SELECT cr.*, c.name as child_name
      FROM curriculum_recommendations cr
      JOIN children c ON cr.child_id = c.id
      WHERE cr.id = ${recommendationId}
    `
    if (!rec.rows[0]) return null

    const subjects = await sql`
      SELECT * FROM recommendation_subjects
      WHERE recommendation_id = ${recommendationId}
      ORDER BY sort_order, name
    `

    const objectives = await sql`
      SELECT * FROM recommendation_objectives
      WHERE recommendation_id = ${recommendationId}
      ORDER BY sort_order, title
    `

    // Group objectives by subject
    const subjectsWithObjectives = subjects.rows.map(sub => ({
      ...sub,
      objectives: objectives.rows.filter(obj => obj.subject_id === sub.id)
    }))

    return {
      ...rec.rows[0],
      subjects: subjectsWithObjectives,
      totalObjectives: objectives.rows.length,
      approvedCount: objectives.rows.filter(o => o.status === 'approved').length,
      completedCount: objectives.rows.filter(o => o.status === 'completed').length,
    }
  } catch (error) {
    console.error("Failed to get recommendation detail:", error)
    return null
  }
}

export async function getApprovedObjectives(_userId?: string) {
  try {
    const userId = await getAuthenticatedUserId()
    const result = await sql`
      SELECT ro.id, ro.title, ro.description, ro.status, ro.lesson_source, ro.lesson_packet_id,
             rs.name as subject, cr.child_id
      FROM recommendation_objectives ro
      JOIN recommendation_subjects rs ON ro.subject_id = rs.id
      JOIN curriculum_recommendations cr ON ro.recommendation_id = cr.id
      WHERE cr.user_id = ${userId}
        AND ro.status = 'approved'
      ORDER BY rs.sort_order, ro.sort_order
    `
    return result.rows
  } catch (error) {
    console.error("Failed to get approved objectives:", error)
    return []
  }
}

export async function updateRecommendationStatus(recommendationId: string, status: string) {
  try {
    const result = await sql`
      UPDATE curriculum_recommendations
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${recommendationId}
      RETURNING *
    `
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Failed to update recommendation status:", error)
    return { success: false, error: "Failed to update recommendation status" }
  }
}

// ─── Objective Review (Parent Approval Flow) ────────────────────────────────

export async function reviewObjective(objectiveId: string, data: {
  status: 'approved' | 'rejected'
  parentNotes?: string
}) {
  try {
    const result = await sql`
      UPDATE recommendation_objectives
      SET status = ${data.status},
          parent_notes = ${data.parentNotes || null},
          reviewed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${objectiveId}
      RETURNING *
    `
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Failed to review objective:", error)
    return { success: false, error: "Failed to review objective" }
  }
}

export async function bulkReviewObjectives(objectiveIds: string[], status: 'approved' | 'rejected') {
  try {
    for (const id of objectiveIds) {
      await sql`
        UPDATE recommendation_objectives
        SET status = ${status}, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `
    }
    return { success: true }
  } catch (error) {
    console.error("Failed to bulk review objectives:", error)
    return { success: false, error: "Failed to bulk review objectives" }
  }
}

export async function setObjectiveLessonSource(objectiveId: string, source: 'ai' | 'parent', lessonPacketId?: string) {
  try {
    const result = await sql`
      UPDATE recommendation_objectives
      SET lesson_source = ${source},
          lesson_packet_id = ${lessonPacketId || null},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${objectiveId}
      RETURNING *
    `
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Failed to set lesson source:", error)
    return { success: false, error: "Failed to set lesson source" }
  }
}

export async function markObjectiveCompleted(objectiveId: string) {
  try {
    const result = await sql`
      UPDATE recommendation_objectives
      SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${objectiveId}
      RETURNING *
    `
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Failed to mark objective completed:", error)
    return { success: false, error: "Failed to mark objective completed" }
  }
}

// ─── Chat Messages ──────────────────────────────────────────────────────────

export async function saveChatMessage(userId: string, data: {
  childId?: string
  role: 'user' | 'assistant'
  content: string
  structuredData?: any
  messageType?: string
}) {
  try {
    const result = await sql`
      INSERT INTO advisor_chat_messages (user_id, child_id, role, content, structured_data, message_type)
      VALUES (
        ${userId},
        ${data.childId || null},
        ${data.role},
        ${data.content},
        ${data.structuredData ? JSON.stringify(data.structuredData) : null},
        ${data.messageType || 'text'}
      )
      RETURNING *
    `
    return result.rows[0]
  } catch (error) {
    console.error("Failed to save chat message:", error)
    return null
  }
}

export async function getChatHistory(userId: string, limit = 50) {
  try {
    const result = await sql`
      SELECT * FROM advisor_chat_messages
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return result.rows.reverse() // Return in chronological order
  } catch {
    return []
  }
}

export async function clearChatHistory(userId: string) {
  try {
    await sql`DELETE FROM advisor_chat_messages WHERE user_id = ${userId}`
    return { success: true }
  } catch (error) {
    console.error("Failed to clear chat history:", error)
    return { success: false, error: "Failed to clear chat history" }
  }
}

// ─── State Filing Types ─────────────────────────────────────────────────────

export async function getStateFilingTypes(stateAbbreviation: string) {
  try {
    const result = await sql`
      SELECT * FROM state_filing_types
      WHERE state_abbreviation = ${stateAbbreviation}
      ORDER BY is_required DESC, filing_name
    `
    return result.rows
  } catch {
    return []
  }
}

export async function getAllStateFilingTypes() {
  try {
    const result = await sql`
      SELECT * FROM state_filing_types
      ORDER BY state_abbreviation, filing_name
    `
    return result.rows
  } catch {
    return []
  }
}
