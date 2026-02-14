import { NextRequest, NextResponse } from "next/server"
import { collection, docToData, nowIso } from "@/lib/firestore-helpers"

// GET all members of a group
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const membersSnapshot = await collection("groupMembers")
      .where("groupId", "==", params.id)
      .orderBy("joinedAt", "asc")
      .get()

    const members = await Promise.all(
      membersSnapshot.docs.map(async (doc) => {
        const data = docToData(doc)
        const userDoc = await collection("users").doc(data.userId as string).get()
        return {
          ...data,
          display_name: userDoc.exists ? userDoc.data()?.displayName ?? "" : "",
          email: userDoc.exists ? userDoc.data()?.email ?? "" : "",
          photo_url: userDoc.exists ? userDoc.data()?.photoUrl ?? "" : "",
        }
      })
    )

    return NextResponse.json(members)
  } catch (error) {
    console.error('Failed to fetch group members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch group members' },
      { status: 500 }
    )
  }
}

// POST add a member to a group
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { userId, role } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Check if user is already a member
    const existing = await collection("groupMembers")
      .where("groupId", "==", params.id)
      .where("userId", "==", userId)
      .get()

    if (!existing.empty) {
      return NextResponse.json(
        { error: 'User is already a member of this group' },
        { status: 409 }
      )
    }

    // Check if group has reached max members
    const groupDoc = await collection("groups").doc(params.id).get()
    const maxMembers = groupDoc.exists ? (groupDoc.data()?.maxMembers as number | null) : null

    if (maxMembers) {
      const membersSnapshot = await collection("groupMembers")
        .where("groupId", "==", params.id)
        .get()
      if (membersSnapshot.size >= maxMembers) {
        return NextResponse.json(
          { error: 'Group has reached maximum members' },
          { status: 400 }
        )
      }
    }

    const timestamp = nowIso()
    const memberRef = await collection("groupMembers").add({
      groupId: params.id,
      userId,
      role: role || "member",
      joinedAt: timestamp,
    })
    const created = await memberRef.get()

    return NextResponse.json(docToData(created), { status: 201 })
  } catch (error) {
    console.error('Failed to add group member:', error)
    return NextResponse.json(
      { error: 'Failed to add group member' },
      { status: 500 }
    )
  }
}
