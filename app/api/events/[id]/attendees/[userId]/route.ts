import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-service"
import { getPool } from "@/lib/db"

const pool = getPool()

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current user's ID from database
    const userIdQuery = "SELECT id FROM users WHERE firebase_uid = $1"
    const userIdResult = await pool.query(userIdQuery, [user.uid])

    if (userIdResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const currentUserId = userIdResult.rows[0].id

    // Users can only remove themselves, unless they're the event creator
    const eventQuery = "SELECT created_by_id FROM events WHERE id = $1"
    const eventResult = await pool.query(eventQuery, [params.id])

    if (eventResult.rows.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const isEventCreator = eventResult.rows[0].created_by_id === currentUserId
    const isRemovingSelf = currentUserId.toString() === params.userId

    if (!isRemovingSelf && !isEventCreator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Remove attendee
    const query = `
      DELETE FROM event_attendees
      WHERE event_id = $1 AND user_id = $2
      RETURNING *
    `

    const result = await pool.query(query, [params.id, params.userId])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Attendee not found for this event" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error leaving event:", error)
    return NextResponse.json(
      { error: "Failed to leave event" },
      { status: 500 }
    )
  }
}
