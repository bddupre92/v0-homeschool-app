import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-service"
import { collection } from "@/lib/firestore-helpers"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const eventDoc = await collection("events").doc(params.id).get()

    if (!eventDoc.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const isEventCreator = eventDoc.data()?.createdById === user.userId
    const isRemovingSelf = user.userId === params.userId

    if (!isRemovingSelf && !isEventCreator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const snapshot = await collection("eventAttendees")
      .where("eventId", "==", params.id)
      .where("userId", "==", params.userId)
      .get()

    if (snapshot.empty) {
      return NextResponse.json(
        { error: "Attendee not found for this event" },
        { status: 404 }
      )
    }

    await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error leaving event:", error)
    return NextResponse.json(
      { error: "Failed to leave event" },
      { status: 500 }
    )
  }
}
