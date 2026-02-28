import { sql } from '@vercel/postgres'

// Export the sql function for use in API routes and server actions
export { sql }

// Compatibility wrapper for API routes that use the pool.query(text, params) pattern
export function getPool() {
  return { query: (text: string, params?: any[]) => sql.query(text, params) }
}

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

  // ─── Group Discovery & Coordination ──────────────────────────────────────────

  /** Resolve a Firebase UID to the Postgres users.id UUID */
  async resolveUserId(firebaseUid: string): Promise<string | null> {
    const result = await sql`
      SELECT id FROM users WHERE firebase_uid = ${firebaseUid}
    `
    return result.rows[0]?.id || null
  },

  /** Get or create user ID — ensures the user exists in Postgres */
  async resolveOrCreateUserId(firebaseUid: string, email?: string): Promise<string> {
    const existing = await sql`SELECT id FROM users WHERE firebase_uid = ${firebaseUid}`
    if (existing.rows[0]) return existing.rows[0].id
    const created = await sql`
      INSERT INTO users (firebase_uid, email)
      VALUES (${firebaseUid}, ${email || `${firebaseUid}@placeholder.local`})
      ON CONFLICT (firebase_uid) DO UPDATE SET firebase_uid = EXCLUDED.firebase_uid
      RETURNING id
    `
    return created.rows[0].id
  },

  /** Get groups with optional filters for discovery */
  async getGroupsByFilters(filters?: {
    search?: string
    philosophy?: string
    ageGroup?: string
    city?: string
    isAccepting?: boolean
    groupType?: string
    boundingBox?: { minLat: number; maxLat: number; minLng: number; maxLng: number }
  }) {
    let conditions = ['1=1']
    if (filters?.search) {
      const escaped = filters.search.replace(/'/g, "''")
      conditions.push(`(g.name ILIKE '%${escaped}%' OR g.description ILIKE '%${escaped}%')`)
    }
    if (filters?.philosophy) {
      conditions.push(`g.philosophy = '${filters.philosophy.replace(/'/g, "''")}'`)
    }
    if (filters?.ageGroup) {
      conditions.push(`'${filters.ageGroup.replace(/'/g, "''")}' = ANY(g.age_groups)`)
    }
    if (filters?.city) {
      conditions.push(`g.city ILIKE '%${filters.city.replace(/'/g, "''")}%'`)
    }
    if (filters?.isAccepting) {
      conditions.push(`g.is_accepting_members = true`)
    }
    if (filters?.groupType) {
      conditions.push(`g.group_type = '${filters.groupType.replace(/'/g, "''")}'`)
    }
    if (filters?.boundingBox) {
      const { minLat, maxLat, minLng, maxLng } = filters.boundingBox
      conditions.push(`g.latitude BETWEEN ${minLat} AND ${maxLat}`)
      conditions.push(`g.longitude BETWEEN ${minLng} AND ${maxLng}`)
    }

    const where = conditions.join(' AND ')
    const result = await sql.query(
      `SELECT g.*, u.display_name as creator_name
       FROM groups g
       LEFT JOIN users u ON g.created_by_id = u.id
       WHERE g.is_private = false AND ${where}
       ORDER BY g.member_count DESC, g.created_at DESC
       LIMIT 100`
    )
    return result.rows
  },

  /** Get a single group by ID with full detail */
  async getGroupById(groupId: string) {
    const result = await sql`
      SELECT g.*, u.display_name as creator_name
      FROM groups g
      LEFT JOIN users u ON g.created_by_id = u.id
      WHERE g.id = ${groupId}
    `
    return result.rows[0]
  },

  /** Get all members of a group with user info */
  async getGroupMembers(groupId: string) {
    const result = await sql`
      SELECT gm.id, gm.user_id, gm.role, gm.joined_at,
             u.display_name, u.email, u.photo_url
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ${groupId}
      ORDER BY
        CASE gm.role WHEN 'admin' THEN 0 WHEN 'moderator' THEN 1 ELSE 2 END,
        gm.joined_at
    `
    return result.rows
  },

  /** Create a group with all discovery fields and add creator as admin */
  async createGroupFull(
    userId: string,
    data: {
      name: string
      description?: string
      groupType?: string
      location?: string
      stateAbbreviation?: string
      maxMembers?: number
      isPrivate?: boolean
      philosophy?: string
      ageGroups?: string[]
      subjectsOffered?: string[]
      schedule?: object
      meetingFrequency?: string
      meetingSchedule?: string
      latitude?: number
      longitude?: number
      city?: string
      zipCode?: string
    }
  ) {
    const result = await sql`
      INSERT INTO groups (
        created_by_id, name, description, group_type, location, state_abbreviation,
        max_members, is_private, philosophy, age_groups, subjects_offered, schedule,
        meeting_frequency, meeting_schedule, latitude, longitude, city, zip_code,
        is_accepting_members, member_count
      ) VALUES (
        ${userId}, ${data.name}, ${data.description || null}, ${data.groupType || 'co-op'},
        ${data.location || null}, ${data.stateAbbreviation || null},
        ${data.maxMembers || null}, ${data.isPrivate || false},
        ${data.philosophy || null}, ${data.ageGroups || []},
        ${data.subjectsOffered || []}, ${data.schedule ? JSON.stringify(data.schedule) : null},
        ${data.meetingFrequency || null}, ${data.meetingSchedule || null},
        ${data.latitude || null}, ${data.longitude || null},
        ${data.city || null}, ${data.zipCode || null},
        true, 1
      )
      RETURNING *
    `
    const group = result.rows[0]

    // Add creator as admin member
    await sql`
      INSERT INTO group_members (group_id, user_id, role)
      VALUES (${group.id}, ${userId}, 'admin')
    `

    return group
  },

  /** Update group profile fields */
  async updateGroupProfile(groupId: string, data: Record<string, any>) {
    const allowedFields = [
      'name', 'description', 'group_type', 'location', 'state_abbreviation',
      'max_members', 'is_private', 'image_url', 'philosophy', 'age_groups',
      'subjects_offered', 'schedule', 'meeting_frequency', 'meeting_schedule',
      'latitude', 'longitude', 'city', 'zip_code', 'is_accepting_members',
    ]
    const updates: string[] = []
    for (const [key, value] of Object.entries(data)) {
      if (!allowedFields.includes(key)) continue
      if (value === null || value === undefined) {
        updates.push(`${key} = NULL`)
      } else if (Array.isArray(value)) {
        updates.push(`${key} = ARRAY[${value.map((v: string) => `'${v.replace(/'/g, "''")}'`).join(',')}]::text[]`)
      } else if (typeof value === 'object') {
        updates.push(`${key} = '${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`)
      } else if (typeof value === 'boolean') {
        updates.push(`${key} = ${value}`)
      } else if (typeof value === 'number') {
        updates.push(`${key} = ${value}`)
      } else {
        updates.push(`${key} = '${String(value).replace(/'/g, "''")}'`)
      }
    }
    if (updates.length === 0) return null
    updates.push('updated_at = CURRENT_TIMESTAMP')
    const result = await sql.query(
      `UPDATE groups SET ${updates.join(', ')} WHERE id = '${groupId}' RETURNING *`
    )
    return result.rows[0]
  },

  /** Add a member to a group */
  async addGroupMember(groupId: string, userId: string, role = 'member') {
    await sql`
      INSERT INTO group_members (group_id, user_id, role)
      VALUES (${groupId}, ${userId}, ${role})
      ON CONFLICT (group_id, user_id) DO NOTHING
    `
    await sql`
      UPDATE groups SET member_count = member_count + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${groupId}
    `
  },

  /** Remove a member from a group */
  async removeGroupMember(groupId: string, userId: string) {
    const result = await sql`
      DELETE FROM group_members
      WHERE group_id = ${groupId} AND user_id = ${userId}
      RETURNING id
    `
    if (result.rows.length > 0) {
      await sql`
        UPDATE groups SET member_count = GREATEST(member_count - 1, 0), updated_at = CURRENT_TIMESTAMP
        WHERE id = ${groupId}
      `
    }
  },

  /** Check if a user is a member of a group */
  async isGroupMember(groupId: string, userId: string): Promise<boolean> {
    const result = await sql`
      SELECT 1 FROM group_members WHERE group_id = ${groupId} AND user_id = ${userId}
    `
    return result.rows.length > 0
  },

  /** Check if a user is an admin of a group */
  async isGroupAdmin(groupId: string, userId: string): Promise<boolean> {
    const result = await sql`
      SELECT 1 FROM group_members WHERE group_id = ${groupId} AND user_id = ${userId} AND role = 'admin'
    `
    return result.rows.length > 0
  },

  /** Get user's role in a group */
  async getGroupMemberRole(groupId: string, userId: string): Promise<string | null> {
    const result = await sql`
      SELECT role FROM group_members WHERE group_id = ${groupId} AND user_id = ${userId}
    `
    return result.rows[0]?.role || null
  },

  /** Get groups a user belongs to */
  async getUserGroupsList(userId: string) {
    const result = await sql`
      SELECT g.id, g.name, g.image_url, gm.role
      FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ${userId}
      ORDER BY g.name
    `
    return result.rows
  },

  /** Share a packet to a group */
  async sharePacketToGroup(groupId: string, packetId: string, userId: string, notes?: string) {
    const result = await sql`
      INSERT INTO group_shared_packets (group_id, packet_id, shared_by_user_id, notes)
      VALUES (${groupId}, ${packetId}, ${userId}, ${notes || null})
      ON CONFLICT (group_id, packet_id) DO NOTHING
      RETURNING *
    `
    return result.rows[0]
  },

  /** Get shared packets for a group with sharer info and packet summary */
  async getGroupSharedPackets(groupId: string, page = 1, pageSize = 12) {
    const offset = (page - 1) * pageSize
    const result = await sql`
      SELECT gsp.id, gsp.group_id, gsp.packet_id, gsp.shared_by_user_id, gsp.notes, gsp.shared_at,
             u.display_name as shared_by_name,
             lp.title as packet_title, lp.subject as packet_subject,
             lp.grade as packet_grade, lp.child_name as packet_child_name, lp.topic as packet_topic
      FROM group_shared_packets gsp
      JOIN users u ON gsp.shared_by_user_id = u.id
      JOIN lesson_packets lp ON gsp.packet_id = lp.id
      WHERE gsp.group_id = ${groupId}
      ORDER BY gsp.shared_at DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `
    return result.rows
  },

  /** Remove a shared packet */
  async removeSharedPacket(sharedPacketId: string) {
    await sql`DELETE FROM group_shared_packets WHERE id = ${sharedPacketId}`
  },

  /** Create an announcement */
  async createAnnouncement(groupId: string, userId: string, title: string, content: string) {
    const result = await sql`
      INSERT INTO group_announcements (group_id, author_user_id, title, content)
      VALUES (${groupId}, ${userId}, ${title}, ${content})
      RETURNING *
    `
    return result.rows[0]
  },

  /** Get announcements for a group (pinned first, then chronological) */
  async getGroupAnnouncements(groupId: string, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize
    const result = await sql`
      SELECT ga.*, u.display_name as author_name, u.photo_url as author_photo_url
      FROM group_announcements ga
      JOIN users u ON ga.author_user_id = u.id
      WHERE ga.group_id = ${groupId}
      ORDER BY ga.is_pinned DESC, ga.created_at DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `
    return result.rows
  },

  /** Update an announcement */
  async updateAnnouncement(announcementId: string, data: { title?: string; content?: string; isPinned?: boolean }) {
    const updates: string[] = []
    if (data.title !== undefined) updates.push(`title = '${data.title.replace(/'/g, "''")}'`)
    if (data.content !== undefined) updates.push(`content = '${data.content.replace(/'/g, "''")}'`)
    if (data.isPinned !== undefined) updates.push(`is_pinned = ${data.isPinned}`)
    if (updates.length === 0) return null
    updates.push('updated_at = CURRENT_TIMESTAMP')
    const result = await sql.query(
      `UPDATE group_announcements SET ${updates.join(', ')} WHERE id = '${announcementId}' RETURNING *`
    )
    return result.rows[0]
  },

  /** Delete an announcement */
  async deleteAnnouncement(announcementId: string) {
    await sql`DELETE FROM group_announcements WHERE id = ${announcementId}`
  },

  /** Get announcement by ID */
  async getAnnouncementById(announcementId: string) {
    const result = await sql`SELECT * FROM group_announcements WHERE id = ${announcementId}`
    return result.rows[0]
  },

  /** Create a teaching rotation entry */
  async createTeachingRotation(groupId: string, teacherUserId: string, subject: string, dayOfWeek: string, startTime?: string, endTime?: string, notes?: string) {
    const result = await sql`
      INSERT INTO teaching_rotations (group_id, teacher_user_id, subject, day_of_week, start_time, end_time, notes)
      VALUES (${groupId}, ${teacherUserId}, ${subject}, ${dayOfWeek}, ${startTime || null}, ${endTime || null}, ${notes || null})
      RETURNING *
    `
    return result.rows[0]
  },

  /** Get teaching rotations for a group */
  async getTeachingRotations(groupId: string) {
    const result = await sql`
      SELECT tr.*, u.display_name as teacher_name
      FROM teaching_rotations tr
      JOIN users u ON tr.teacher_user_id = u.id
      WHERE tr.group_id = ${groupId}
      ORDER BY
        CASE tr.day_of_week
          WHEN 'Monday' THEN 0 WHEN 'Tuesday' THEN 1 WHEN 'Wednesday' THEN 2
          WHEN 'Thursday' THEN 3 WHEN 'Friday' THEN 4 WHEN 'Saturday' THEN 5 WHEN 'Sunday' THEN 6
        END,
        tr.start_time
    `
    return result.rows
  },

  /** Delete a teaching rotation */
  async deleteTeachingRotation(rotationId: string) {
    await sql`DELETE FROM teaching_rotations WHERE id = ${rotationId}`
  },

  /** Get rotation by ID */
  async getTeachingRotationById(rotationId: string) {
    const result = await sql`SELECT * FROM teaching_rotations WHERE id = ${rotationId}`
    return result.rows[0]
  },

  /** Create a field trip */
  async createFieldTrip(groupId: string, organizerUserId: string, data: {
    title: string; description?: string; location: string;
    latitude?: number; longitude?: number; tripDate: string;
    maxAttendees?: number; costPerFamily?: number; relatedPacketId?: string
  }) {
    const result = await sql`
      INSERT INTO group_field_trips (
        group_id, organizer_user_id, title, description, location,
        latitude, longitude, trip_date, max_attendees, cost_per_family, related_packet_id
      ) VALUES (
        ${groupId}, ${organizerUserId}, ${data.title}, ${data.description || null},
        ${data.location}, ${data.latitude || null}, ${data.longitude || null},
        ${data.tripDate}, ${data.maxAttendees || null}, ${data.costPerFamily || null},
        ${data.relatedPacketId || null}
      )
      RETURNING *
    `
    return result.rows[0]
  },

  /** Get field trips for a group with RSVP counts */
  async getGroupFieldTrips(groupId: string) {
    const result = await sql`
      SELECT gft.*, u.display_name as organizer_name,
             COALESCE(rsvp.rsvp_count, 0)::int as rsvp_count
      FROM group_field_trips gft
      JOIN users u ON gft.organizer_user_id = u.id
      LEFT JOIN (
        SELECT field_trip_id, COUNT(*) as rsvp_count
        FROM group_field_trip_rsvps
        WHERE status = 'going'
        GROUP BY field_trip_id
      ) rsvp ON gft.id = rsvp.field_trip_id
      WHERE gft.group_id = ${groupId}
      ORDER BY gft.trip_date ASC
    `
    return result.rows
  },

  /** Get a single field trip by ID */
  async getFieldTripById(fieldTripId: string) {
    const result = await sql`
      SELECT gft.*, u.display_name as organizer_name
      FROM group_field_trips gft
      JOIN users u ON gft.organizer_user_id = u.id
      WHERE gft.id = ${fieldTripId}
    `
    return result.rows[0]
  },

  /** RSVP to a field trip (upsert) */
  async rsvpFieldTrip(fieldTripId: string, userId: string, numChildren: number, status: string) {
    const result = await sql`
      INSERT INTO group_field_trip_rsvps (field_trip_id, user_id, num_children, status)
      VALUES (${fieldTripId}, ${userId}, ${numChildren}, ${status})
      ON CONFLICT (field_trip_id, user_id)
      DO UPDATE SET num_children = ${numChildren}, status = ${status}
      RETURNING *
    `
    return result.rows[0]
  },

  /** Cancel RSVP */
  async cancelFieldTripRSVP(fieldTripId: string, userId: string) {
    await sql`DELETE FROM group_field_trip_rsvps WHERE field_trip_id = ${fieldTripId} AND user_id = ${userId}`
  },

  /** Get RSVPs for a field trip with user info */
  async getFieldTripRSVPs(fieldTripId: string) {
    const result = await sql`
      SELECT r.*, u.display_name as user_name
      FROM group_field_trip_rsvps r
      JOIN users u ON r.user_id = u.id
      WHERE r.field_trip_id = ${fieldTripId}
      ORDER BY r.created_at
    `
    return result.rows
  },

  /** Get user's RSVP for a field trip */
  async getUserFieldTripRSVP(fieldTripId: string, userId: string) {
    const result = await sql`
      SELECT * FROM group_field_trip_rsvps
      WHERE field_trip_id = ${fieldTripId} AND user_id = ${userId}
    `
    return result.rows[0]
  },

  /** Delete a field trip */
  async deleteFieldTrip(fieldTripId: string) {
    await sql`DELETE FROM group_field_trips WHERE id = ${fieldTripId}`
  },
}
