import { sql } from '@vercel/postgres'

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

  // Lesson Packets
  async createPacket(
    userId: string,
    title: string,
    subject: string,
    grade: string,
    childName: string,
    topic: string,
    packetData: object,
    options?: { learningStyle?: string; interests?: string; location?: string }
  ) {
    const result = await sql`
      INSERT INTO lesson_packets (user_id, title, subject, grade, child_name, topic, packet_data, learning_style, interests, location)
      VALUES (${userId}, ${title}, ${subject}, ${grade}, ${childName}, ${topic}, ${JSON.stringify(packetData)}, ${options?.learningStyle || null}, ${options?.interests || null}, ${options?.location || null})
      RETURNING *
    `
    return result.rows[0]
  },

  async getPacketsByUser(
    userId: string,
    options?: { subject?: string; grade?: string; childName?: string; isFavorite?: boolean; search?: string; page?: number; pageSize?: number }
  ) {
    const page = options?.page || 1
    const pageSize = options?.pageSize || 12
    const offset = (page - 1) * pageSize

    // Use parameterized query for the base condition; dynamic filters added safely
    let conditions = [`user_id = '${userId}'`]
    if (options?.subject) conditions.push(`subject = '${options.subject}'`)
    if (options?.grade) conditions.push(`grade = '${options.grade}'`)
    if (options?.childName) conditions.push(`child_name = '${options.childName}'`)
    if (options?.isFavorite) conditions.push(`is_favorite = true`)
    if (options?.search) {
      const escaped = options.search.replace(/'/g, "''")
      conditions.push(`(title ILIKE '%${escaped}%' OR topic ILIKE '%${escaped}%')`)
    }

    const where = conditions.join(' AND ')
    const countResult = await sql.query(`SELECT COUNT(*) FROM lesson_packets WHERE ${where}`)
    const total = parseInt(countResult.rows[0].count, 10)

    const result = await sql.query(
      `SELECT id, user_id, title, subject, grade, child_name, topic, learning_style, interests, location, is_favorite, tags, times_printed, is_shared, shared_to_group_id, created_at, updated_at FROM lesson_packets WHERE ${where} ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`
    )

    return { packets: result.rows, total, page, pageSize }
  },

  async getPacketById(packetId: string) {
    const result = await sql`
      SELECT * FROM lesson_packets WHERE id = ${packetId}
    `
    return result.rows[0]
  },

  async toggleFavorite(packetId: string) {
    const result = await sql`
      UPDATE lesson_packets
      SET is_favorite = NOT is_favorite, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${packetId}
      RETURNING *
    `
    return result.rows[0]
  },

  async deletePacket(packetId: string) {
    await sql`DELETE FROM lesson_packets WHERE id = ${packetId}`
  },

  async incrementPrintCount(packetId: string) {
    await sql`
      UPDATE lesson_packets
      SET times_printed = times_printed + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${packetId}
    `
  },

  async getDistinctChildNames(userId: string) {
    const result = await sql`
      SELECT DISTINCT child_name FROM lesson_packets WHERE user_id = ${userId} ORDER BY child_name
    `
    return result.rows.map((r: any) => r.child_name)
  },
}
