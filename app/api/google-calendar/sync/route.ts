import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-service"
import { adminDb } from "@/lib/firebase-admin-safe"
import { getGoogleCalendarClient } from "@/lib/google-calendar"

const plannerEventsCollection = () => adminDb.collection("plannerEvents")

const buildDateRange = () => {
  const now = new Date()
  const past = new Date(now)
  past.setMonth(now.getMonth() - 1)
  const future = new Date(now)
  future.setMonth(now.getMonth() + 3)
  return { timeMin: past.toISOString(), timeMax: future.toISOString() }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const { direction } = await request.json()

    if (!direction || !["pull", "push"].includes(direction)) {
      return NextResponse.json({ error: "Invalid sync direction." }, { status: 400 })
    }

    const { calendar, calendarId } = await getGoogleCalendarClient(request.url, user.userId)

    if (direction === "pull") {
      const range = buildDateRange()
      const response = await calendar.events.list({
        calendarId,
        timeMin: range.timeMin,
        timeMax: range.timeMax,
        singleEvents: true,
        orderBy: "startTime",
      })

      const events = response.data.items ?? []
      const batch = adminDb.batch()
      let upserted = 0

      events.forEach((event) => {
        if (!event.id) return
        const docRef = plannerEventsCollection().doc(`${user.userId}_${event.id}`)
        batch.set(
          docRef,
          {
            userId: user.userId,
            googleEventId: event.id,
            title: event.summary ?? "Untitled Event",
            description: event.description ?? "",
            start: event.start?.dateTime ?? event.start?.date ?? null,
            end: event.end?.dateTime ?? event.end?.date ?? null,
            source: "google",
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        )
        upserted += 1
      })

      if (upserted > 0) {
        await batch.commit()
      }

      return NextResponse.json({ synced: upserted, direction })
    }

    const snapshot = await plannerEventsCollection()
      .where("userId", "==", user.userId)
      .where("source", "==", "planner")
      .get()

    let pushed = 0
    for (const doc of snapshot.docs) {
      const data = doc.data()
      const start = data.start ? new Date(data.start) : new Date()
      const end = data.end ? new Date(data.end) : new Date(start.getTime() + 60 * 60 * 1000)

      const created = await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: data.title,
          description: data.description ?? "",
          start: { dateTime: start.toISOString() },
          end: { dateTime: end.toISOString() },
        },
      })

      if (created.data.id) {
        await doc.ref.set(
          {
            googleEventId: created.data.id,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        )
      }

      pushed += 1
    }

    return NextResponse.json({ synced: pushed, direction })
  } catch (error) {
    console.error("Failed to sync Google Calendar:", error)
    return NextResponse.json({ error: "Unable to sync Google Calendar." }, { status: 500 })
  }
}
