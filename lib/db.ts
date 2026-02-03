import { createPool, sql } from '@vercel/postgres'

let poolInstance: ReturnType<typeof createPool> | null = null

export const getPool = () => {
  if (!poolInstance) {
    poolInstance = createPool()
  }
  return poolInstance
}

// Export the sql function for use in API routes and server actions
export { sql }

// Helper functions for common database operations
export const db = {
  // Users
  async getUserByFirebaseUid(uid: string) {
    const result = await sql`
      SELECT * FROM users WHERE firebase_uid = ${uid}
    `
    return result.rows[0]
  },

  async createUser(firebaseUid: string, email: string, displayName?: string, photoUrl?: string) {
    const result = await sql`
      INSERT INTO users (firebase_uid, email, display_name, photo_url)
      VALUES (${firebaseUid}, ${email}, ${displayName || null}, ${photoUrl || null})
      RETURNING *
    `
    return result.rows[0]
  },

  async updateUser(firebaseUid: string, data: Record<string, any>) {
    const updates = Object.entries(data)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(', ')
    const result = await sql`
      UPDATE users 
      SET ${sql.raw(updates)}, updated_at = CURRENT_TIMESTAMP
      WHERE firebase_uid = ${firebaseUid}
      RETURNING *
    `
    return result.rows[0]
  },

  // Curricula
  async getCurriculaByUser(userId: string) {
    const result = await sql`
      SELECT * FROM curricula WHERE user_id = ${userId} ORDER BY created_at DESC
    `
    return result.rows
  },

  async createCurriculum(userId: string, title: string, description?: string, gradeLevel?: string) {
    const result = await sql`
      INSERT INTO curricula (user_id, title, description, grade_level)
      VALUES (${userId}, ${title}, ${description || null}, ${gradeLevel || null})
      RETURNING *
    `
    return result.rows[0]
  },

  // Lessons
  async getLessonsByCurriculum(curriculumId: string) {
    const result = await sql`
      SELECT * FROM lessons WHERE curriculum_id = ${curriculumId} ORDER BY week_number, day_of_week
    `
    return result.rows
  },

  async createLesson(curriculumId: string, title: string, subject?: string, weekNumber?: number) {
    const result = await sql`
      INSERT INTO lessons (curriculum_id, title, subject, week_number)
      VALUES (${curriculumId}, ${title}, ${subject || null}, ${weekNumber || null})
      RETURNING *
    `
    return result.rows[0]
  },

  async updateLesson(lessonId: string, data: Record<string, any>) {
    const updates = Object.entries(data)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(', ')
    const result = await sql`
      UPDATE lessons 
      SET ${sql.raw(updates)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${lessonId}
      RETURNING *
    `
    return result.rows[0]
  },

  // Groups
  async getPublicGroups(stateAbbr?: string) {
    let query = 'SELECT * FROM groups WHERE is_private = false'
    if (stateAbbr) {
      query += ` AND state_abbreviation = '${stateAbbr}'`
    }
    query += ' ORDER BY created_at DESC'
    const result = await sql.query(query)
    return result.rows
  },

  async getUserGroups(userId: string) {
    const result = await sql`
      SELECT g.* FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ${userId}
      ORDER BY g.created_at DESC
    `
    return result.rows
  },

  async createGroup(createdById: string, name: string, description?: string, type?: string) {
    const result = await sql`
      INSERT INTO groups (created_by_id, name, description, group_type)
      VALUES (${createdById}, ${name}, ${description || null}, ${type || 'coop'})
      RETURNING *
    `
    return result.rows[0]
  },

  // Events
  async getPublicEvents(stateAbbr?: string) {
    let query = 'SELECT * FROM events WHERE 1=1'
    if (stateAbbr) {
      query += ` AND state_abbreviation = '${stateAbbr}'`
    }
    query += ' ORDER BY start_time ASC'
    const result = await sql.query(query)
    return result.rows
  },

  async createEvent(createdById: string, title: string, startTime: Date, description?: string) {
    const result = await sql`
      INSERT INTO events (created_by_id, title, start_time, description)
      VALUES (${createdById}, ${title}, ${startTime.toISOString()}, ${description || null})
      RETURNING *
    `
    return result.rows[0]
  },

  // State Requirements
  async getStateRequirements(stateAbbr: string) {
    const result = await sql`
      SELECT * FROM state_requirements WHERE state_abbreviation = ${stateAbbr}
    `
    return result.rows[0]
  },

  async getAllStateRequirements() {
    const result = await sql`
      SELECT * FROM state_requirements ORDER BY state_name
    `
    return result.rows
  },
}
