import { NextRequest, NextResponse } from "next/server"
import { collection, docToData, nowIso } from "@/lib/firestore-helpers"
import { requireAuth } from "@/lib/auth-service"

// GET all curricula for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const snapshot = await collection("curricula")
      .where("userId", "==", user.userId)
      .orderBy("createdAt", "desc")
      .get()

    return NextResponse.json(snapshot.docs.map(docToData))
  } catch (error: any) {
    if (error?.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
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
    const user = await requireAuth()

    const body = await request.json()
    const { title, description, gradeLevel, stateAbbreviation } = body

    if (!title) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      )
    }

    const timestamp = nowIso()
    const docRef = await collection("curricula").add({
      userId: user.userId,
      title,
      description: description || "",
      gradeLevel: gradeLevel || "",
      stateAbbreviation: stateAbbreviation || "",
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    const created = await docRef.get()

    return NextResponse.json(docToData(created), { status: 201 })
  } catch (error: any) {
    if (error?.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error('Failed to create curriculum:', error)
    return NextResponse.json(
      { error: 'Failed to create curriculum' },
      { status: 500 }
    )
  }
}
