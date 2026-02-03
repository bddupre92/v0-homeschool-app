import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-service"
import { getPool } from "@/lib/db"

const pool = getPool()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const query = `
      SELECT 
        e.*,
        u.display_name as created_by_name,
        u.email as created_by_email,
        COUNT(DISTINCT ea.user_id) as attendee_count
      FROM events e
      LEFT JOIN users u ON e.created_by_id = u.id
      LEFT JOIN event_attendees ea ON e.id = ea.event_id
      WHERE e.id = $1
      GROUP BY e.id, u.id
    `

    const result = await pool.query(query, [params.id])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, date, time, location, address, type, maxAttendees, ageGroups, tags } = body

    // Verify ownership
    const ownerQuery = "SELECT created_by_id FROM events WHERE id = $1"
    const ownerResult = await pool.query(ownerQuery, [params.id])

    if (ownerResult.rows.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Get user ID
    const userQuery = "SELECT id FROM users WHERE firebase_uid = $1"
    const userResult = await pool.query(userQuery, [user.uid])
    const userId = userResult.rows[0]?.id

    if (!userId || ownerResult.rows[0].created_by_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const eventDateTime = time ? `${date}T${time}` : `${date}T00:00:00`

    const query = `
      UPDATE events
      SET 
        title = $1,
        description = $2,
        date = $3,
        location = $4,
        address = $5,
        type = $6,
        max_attendees = $7,
        age_groups = $8,
        tags = $9,
        updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `

    const result = await pool.query(query, [
      title,
      description,
      eventDateTime,
      location,
      address,
      type,
      maxAttendees,
      JSON.stringify(ageGroups || []),
      JSON.stringify(tags || []),
      params.id,
    ])

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify ownership
    const ownerQuery = "SELECT created_by_id FROM events WHERE id = $1"
    const ownerResult = await pool.query(ownerQuery, [params.id])

    if (ownerResult.rows.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Get user ID
    const userQuery = "SELECT id FROM users WHERE firebase_uid = $1"
    const userResult = await pool.query(userQuery, [user.uid])
    const userId = userResult.rows[0]?.id

    if (!userId || ownerResult.rows[0].created_by_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete event
    const query = "DELETE FROM events WHERE id = $1"
    await pool.query(query, [params.id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    )
  }
}
