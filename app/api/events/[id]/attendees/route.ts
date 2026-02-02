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
        ea.*,
        u.display_name,
        u.email,
        u.id as user_id
      FROM event_attendees ea
      JOIN users u ON ea.user_id = u.id
      WHERE ea.event_id = $1
      ORDER BY ea.created_at ASC
    `

    const result = await pool.query(query, [params.id])

    return NextResponse.json({
      attendees: result.rows,
      count: result.rows.length,
    })
  } catch (error) {
    console.error("Error fetching attendees:", error)
    return NextResponse.json(
      { error: "Failed to fetch attendees" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get or create user in database
    const userQuery = `
      INSERT INTO users (firebase_uid, email, display_name)
      VALUES ($1, $2, $3)
      ON CONFLICT (firebase_uid) DO UPDATE SET updated_at = NOW()
      RETURNING id
    `

    const userResult = await pool.query(userQuery, [
      user.uid,
      user.email,
      user.displayName || "User",
    ])
    const userId = userResult.rows[0].id

    // Check if already attending
    const existingQuery = `
      SELECT id FROM event_attendees WHERE event_id = $1 AND user_id = $2
    `
    const existingResult = await pool.query(existingQuery, [params.id, userId])

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: "Already attending this event" },
        { status: 400 }
      )
    }

    // Check event capacity
    const eventQuery = `
      SELECT max_attendees, (
        SELECT COUNT(*) FROM event_attendees WHERE event_id = $1
      ) as current_attendees
      FROM events
      WHERE id = $1
    `
    const eventResult = await pool.query(eventQuery, [params.id])

    if (eventResult.rows.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const { max_attendees, current_attendees } = eventResult.rows[0]
    if (max_attendees && current_attendees >= max_attendees) {
      return NextResponse.json(
        { error: "Event is at full capacity" },
        { status: 400 }
      )
    }

    // Add attendee
    const query = `
      INSERT INTO event_attendees (event_id, user_id)
      VALUES ($1, $2)
      RETURNING *
    `

    const result = await pool.query(query, [params.id, userId])

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Error joining event:", error)
    return NextResponse.json(
      { error: "Failed to join event" },
      { status: 500 }
    )
  }
}
