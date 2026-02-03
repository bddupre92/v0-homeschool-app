import { NextRequest, NextResponse } from "next/server"
import { collection, docToData } from "@/lib/firestore-helpers"

// DELETE remove a member from a group
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const snapshot = await collection("groupMembers")
      .where("groupId", "==", params.id)
      .where("userId", "==", params.userId)
      .get()

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Member not found in this group' },
        { status: 404 }
      )
    }

    await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove group member:', error)
    return NextResponse.json(
      { error: 'Failed to remove group member' },
      { status: 500 }
    )
  }
}

// PUT update member role
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const body = await request.json()
    const { role } = body

    if (!role) {
      return NextResponse.json(
        { error: 'role is required' },
        { status: 400 }
      )
    }

    const snapshot = await collection("groupMembers")
      .where("groupId", "==", params.id)
      .where("userId", "==", params.userId)
      .get()

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Member not found in this group' },
        { status: 404 }
      )
    }

    const docRef = snapshot.docs[0].ref
    await docRef.set({ role }, { merge: true })
    const updated = await docRef.get()
    return NextResponse.json(docToData(updated))
  } catch (error) {
    console.error('Failed to update member role:', error)
    return NextResponse.json(
      { error: 'Failed to update member role' },
      { status: 500 }
    )
  }
}
