import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-service"
import { collection, docToData, nowIso } from "@/lib/firestore-helpers"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type")
    const location = searchParams.get("location")
    const limit = Number(searchParams.get("limit") || "50")
    const now = new Date().toISOString()

    let query = collection("events")
      .where("date", ">=", now)
      .orderBy("date", "asc")

    if (type) {
      query = query.where("type", "==", type)
    }

    const snapshot = await query.limit(limit).get()
    let events = snapshot.docs.map(docToData)

    if (location) {
      const locationLower = location.toLowerCase()
      events = events.filter((event) =>
        (event.location as string | undefined)?.toLowerCase().includes(locationLower)
      )
    }

    return NextResponse.json({
      events,
      count: events.length,
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

    await collection("users").doc(user.userId).set(
      {
        email: user.email || "",
        displayName: "User",
        updatedAt: nowIso(),
      },
      { merge: true }
    )

    const timestamp = nowIso()
    const docRef = await collection("events").add({
      title,
      description: description || "",
      date: eventDateTime,
      location,
      address: address || "",
      type,
      createdById: user.userId,
      maxAttendees: maxAttendees ?? null,
      ageGroups: ageGroups || [],
      tags: tags || [],
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    const created = await docRef.get()
    return NextResponse.json(docToData(created), { status: 201 })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    )
  }
}
