import { NextRequest, NextResponse } from "next/server"
import { collection, docToData, nowIso } from "@/lib/firestore-helpers"

// GET all curricula for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const snapshot = await collection("curricula")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get()

    return NextResponse.json(snapshot.docs.map(docToData))
  } catch (error) {
    console.error('Failed to fetch curricula:', error)
    return NextResponse.json(
      { error: 'Failed to fetch curricula' },
      { status: 500 }
    )
  }
}

// POST create a new curriculum
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, description, gradeLevel, stateAbbreviation } = body

    if (!userId || !title) {
      return NextResponse.json(
        { error: 'userId and title are required' },
        { status: 400 }
      )
    }

    const timestamp = nowIso()
    const docRef = await collection("curricula").add({
      userId,
      title,
      description: description || "",
      gradeLevel: gradeLevel || "",
      stateAbbreviation: stateAbbreviation || "",
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    const created = await docRef.get()

    return NextResponse.json(docToData(created), { status: 201 })
  } catch (error) {
    console.error('Failed to create curriculum:', error)
    return NextResponse.json(
      { error: 'Failed to create curriculum' },
      { status: 500 }
    )
  }
}
