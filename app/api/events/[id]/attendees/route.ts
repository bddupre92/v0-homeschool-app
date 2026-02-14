import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-service"
import { collection, docToData, nowIso } from "@/lib/firestore-helpers"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const attendeesSnapshot = await collection("eventAttendees")
      .where("eventId", "==", params.id)
      .orderBy("createdAt", "asc")
      .get()

    const attendees = await Promise.all(
      attendeesSnapshot.docs.map(async (doc) => {
        const data = docToData(doc)
        const userDoc = await collection("users").doc(data.userId as string).get()
        return {
          ...data,
          display_name: userDoc.exists ? userDoc.data()?.displayName ?? "" : "",
          email: userDoc.exists ? userDoc.data()?.email ?? "" : "",
        }
      })
    )

    return NextResponse.json({
      attendees,
      count: attendees.length,
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

    await collection("users").doc(user.userId).set(
      {
        email: user.email || "",
        displayName: "User",
        updatedAt: nowIso(),
      },
      { merge: true }
    )

    // Check if already attending
    const existingResult = await collection("eventAttendees")
      .where("eventId", "==", params.id)
      .where("userId", "==", user.userId)
      .get()

    if (!existingResult.empty) {
      return NextResponse.json(
        { error: "Already attending this event" },
        { status: 400 }
      )
    }

    // Check event capacity
    const eventDoc = await collection("events").doc(params.id).get()

    if (!eventDoc.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const maxAttendees = eventDoc.data()?.maxAttendees as number | null | undefined
    if (maxAttendees) {
      const attendeesSnapshot = await collection("eventAttendees")
        .where("eventId", "==", params.id)
        .get()
      if (attendeesSnapshot.size >= maxAttendees) {
        return NextResponse.json(
          { error: "Event is at full capacity" },
          { status: 400 }
        )
      }
    }

    const timestamp = nowIso()
    const attendeeRef = await collection("eventAttendees").add({
      eventId: params.id,
      userId: user.userId,
      createdAt: timestamp,
    })

    const created = await attendeeRef.get()
    return NextResponse.json(docToData(created), { status: 201 })
  } catch (error) {
    console.error("Error joining event:", error)
    return NextResponse.json(
      { error: "Failed to join event" },
      { status: 500 }
    )
  }
}
