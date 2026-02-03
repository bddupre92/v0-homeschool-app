import { NextRequest, NextResponse } from "next/server"
import { collection, docToData, nowIso } from "@/lib/firestore-helpers"

// GET all lessons for a curriculum
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const curriculumId = searchParams.get('curriculumId')

    if (!curriculumId) {
      return NextResponse.json(
        { error: 'curriculumId is required' },
        { status: 400 }
      )
    }

    const snapshot = await collection("lessons")
      .where("curriculumId", "==", curriculumId)
      .orderBy("weekNumber", "asc")
      .orderBy("dayOfWeek", "asc")
      .get()

    return NextResponse.json(snapshot.docs.map(docToData))
  } catch (error) {
    console.error('Failed to fetch lessons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    )
  }
}

// POST create a new lesson
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { curriculumId, title, description, subject, weekNumber, dayOfWeek, durationMinutes, resources } = body

    if (!curriculumId || !title) {
      return NextResponse.json(
        { error: 'curriculumId and title are required' },
        { status: 400 }
      )
    }

    const timestamp = nowIso()
    const docRef = await collection("lessons").add({
      curriculumId,
      title,
      description: description || "",
      subject: subject || "",
      weekNumber: weekNumber ?? null,
      dayOfWeek: dayOfWeek || "",
      durationMinutes: durationMinutes ?? null,
      resources: resources || [],
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    const created = await docRef.get()
    return NextResponse.json(docToData(created), { status: 201 })
  } catch (error) {
    console.error('Failed to create lesson:', error)
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    )
  }
}
