import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-service"
import { collection, docToData, nowIso } from "@/lib/firestore-helpers"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventDoc = await collection("events").doc(params.id).get()

    if (!eventDoc.exists) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    const event = docToData(eventDoc)
    const creatorDoc = await collection("users").doc(event.createdById as string).get()
    const attendeesSnapshot = await collection("eventAttendees")
      .where("eventId", "==", params.id)
      .get()

    return NextResponse.json({
      ...event,
      created_by_name: creatorDoc.exists ? creatorDoc.data()?.displayName ?? "" : "",
      created_by_email: creatorDoc.exists ? creatorDoc.data()?.email ?? "" : "",
      attendee_count: attendeesSnapshot.size,
    })
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

    const docRef = collection("events").doc(params.id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (doc.data()?.createdById !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const eventDateTime = time ? `${date}T${time}` : `${date}T00:00:00`

    const payload = {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(eventDateTime !== undefined ? { date: eventDateTime } : {}),
      ...(location !== undefined ? { location } : {}),
      ...(address !== undefined ? { address } : {}),
      ...(type !== undefined ? { type } : {}),
      ...(maxAttendees !== undefined ? { maxAttendees } : {}),
      ...(ageGroups !== undefined ? { ageGroups } : {}),
      ...(tags !== undefined ? { tags } : {}),
      updatedAt: nowIso(),
    }

    await docRef.set(payload, { merge: true })
    const updated = await docRef.get()
    return NextResponse.json(docToData(updated))
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

    const docRef = collection("events").doc(params.id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (doc.data()?.createdById !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await docRef.delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    )
  }
}
