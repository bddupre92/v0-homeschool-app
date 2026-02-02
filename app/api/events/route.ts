import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-service"
import { getPool } from "@/lib/db"

const pool = getPool()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type")
    const location = searchParams.get("location")
    const limit = searchParams.get("limit") || "50"

    let query = "SELECT * FROM events WHERE date >= NOW() ORDER BY date ASC LIMIT $1"
    const params: any[] = [parseInt(limit)]

    if (type) {
      query = query.replace(
        "WHERE",
        `WHERE LOWER(type) = LOWER($${params.length + 1}) AND`
      )
      params.push(type)
    }

    if (location) {
      query = query.replace(
        "WHERE",
        `WHERE LOWER(location) ILIKE LOWER($${params.length + 1}) AND`
      )
      params.push(`%${location}%`)
    }

    const result = await pool.query(query, params)

    return NextResponse.json({
      events: result.rows,
      count: result.rows.length,
    })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      date,
      time,
      location,
      address,
      type,
      maxAttendees,
      ageGroups,
      tags,
    } = body

    // Validate required fields
    if (!title || !date || !location || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Combine date and time
    const eventDateTime = time ? `${date}T${time}` : `${date}T00:00:00`

    // First, get or create the user in the database
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

    // Create the event
    const query = `
      INSERT INTO events (
        title,
        description,
        date,
        location,
        address,
        type,
        created_by_id,
        max_attendees,
        age_groups,
        tags
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `

    const result = await pool.query(query, [
      title,
      description || "",
      eventDateTime,
      location,
      address || "",
      type,
      userId,
      maxAttendees || null,
      ageGroups ? JSON.stringify(ageGroups) : JSON.stringify([]),
      tags ? JSON.stringify(tags) : JSON.stringify([]),
    ])

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    )
  }
}
