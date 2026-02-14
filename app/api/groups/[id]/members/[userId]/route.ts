import { NextRequest, NextResponse } from "next/server"
import { collection, docToData } from "@/lib/firestore-helpers"
import { requireAuth } from "@/lib/auth-service"

// DELETE remove a member from a group
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const user = await requireAuth()

    // Allow self-removal or group owner removal
    const groupDoc = await collection("groups").doc(params.id).get()
    const isOwner = groupDoc.exists && groupDoc.data()?.createdById === user.userId
    const isSelf = params.userId === user.userId

    if (!isOwner && !isSelf) {
      return NextResponse.json(
        { error: 'You do not have permission to remove this member' },
        { status: 403 }
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

    await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()))
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
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
    const user = await requireAuth()

    // Only group owner can change roles
    const groupDoc = await collection("groups").doc(params.id).get()
    if (!groupDoc.exists || groupDoc.data()?.createdById !== user.userId) {
      return NextResponse.json(
        { error: 'Only the group owner can change member roles' },
        { status: 403 }
      )
    }

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
  } catch (error: any) {
    if (error?.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error('Failed to update member role:', error)
    return NextResponse.json(
      { error: 'Failed to update member role' },
      { status: 500 }
    )
  }
}
