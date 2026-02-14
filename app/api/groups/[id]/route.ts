import { NextRequest, NextResponse } from "next/server"
import { collection, docToData, nowIso } from "@/lib/firestore-helpers"
import { requireAuth } from "@/lib/auth-service"

// GET a specific group
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doc = await collection("groups").doc(params.id).get()

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(docToData(doc))
  } catch (error) {
    console.error('Failed to fetch group:', error)
    return NextResponse.json(
      { error: 'Failed to fetch group' },
      { status: 500 }
    )
  }
}

// PUT update a group
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const body = await request.json()
    const { name, description, location, groupType, stateAbbreviation, maxMembers, isPrivate, imageUrl } = body

    const docRef = collection("groups").doc(params.id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    const groupData = doc.data()
    if (groupData?.createdById !== user.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to update this group' },
        { status: 403 }
      )
    }

    const payload = {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(location !== undefined ? { location } : {}),
      ...(groupType !== undefined ? { groupType } : {}),
      ...(stateAbbreviation !== undefined ? { stateAbbreviation } : {}),
      ...(maxMembers !== undefined ? { maxMembers } : {}),
      ...(isPrivate !== undefined ? { isPrivate } : {}),
      ...(imageUrl !== undefined ? { imageUrl } : {}),
      updatedAt: nowIso(),
    }

    await docRef.set(payload, { merge: true })
    const updated = await docRef.get()
    return NextResponse.json(docToData(updated))
  } catch (error: any) {
    if (error?.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error('Failed to update group:', error)
    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    )
  }
}

// DELETE a group
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const docRef = collection("groups").doc(params.id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    const groupData = doc.data()
    if (groupData?.createdById !== user.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this group' },
        { status: 403 }
      )
    }

    await docRef.delete()
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error('Failed to delete group:', error)
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    )
  }
}
