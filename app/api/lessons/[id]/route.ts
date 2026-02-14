import { NextRequest, NextResponse } from "next/server"
import { collection, docToData, nowIso } from "@/lib/firestore-helpers"

// GET a specific lesson
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doc = await collection("lessons").doc(params.id).get()

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(docToData(doc))
  } catch (error) {
    console.error('Failed to fetch lesson:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lesson' },
      { status: 500 }
    )
  }
}

// PUT update a lesson
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, description, subject, weekNumber, dayOfWeek, durationMinutes, resources } = body

    const docRef = collection("lessons").doc(params.id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    const payload = {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(subject !== undefined ? { subject } : {}),
      ...(weekNumber !== undefined ? { weekNumber } : {}),
      ...(dayOfWeek !== undefined ? { dayOfWeek } : {}),
      ...(durationMinutes !== undefined ? { durationMinutes } : {}),
      ...(resources !== undefined ? { resources } : {}),
      updatedAt: nowIso(),
    }

    await docRef.set(payload, { merge: true })
    const updated = await docRef.get()
    return NextResponse.json(docToData(updated))
  } catch (error) {
    console.error('Failed to update lesson:', error)
    return NextResponse.json(
      { error: 'Failed to update lesson' },
      { status: 500 }
    )
  }
}

// DELETE a lesson
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = collection("lessons").doc(params.id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    await docRef.delete()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete lesson:', error)
    return NextResponse.json(
      { error: 'Failed to delete lesson' },
      { status: 500 }
    )
  }
}
