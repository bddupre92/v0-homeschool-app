import { NextRequest, NextResponse } from "next/server"
import { collection, docToData, nowIso } from "@/lib/firestore-helpers"

// GET all public groups or groups by state
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stateAbbr = searchParams.get('state')
    const userGroups = searchParams.get('userGroups')
    const userId = searchParams.get('userId')

    if (userGroups === "true" && userId) {
      const memberships = await collection("groupMembers")
        .where("userId", "==", userId)
        .get()
      const groupDocs = await Promise.all(
        memberships.docs.map((doc) =>
          collection("groups").doc(doc.data().groupId).get()
        )
      )
      return NextResponse.json(groupDocs.filter((doc) => doc.exists).map(docToData))
    }

    if (stateAbbr) {
      const snapshot = await collection("groups")
        .where("isPrivate", "==", false)
        .where("stateAbbreviation", "==", stateAbbr)
        .orderBy("createdAt", "desc")
        .get()
      return NextResponse.json(snapshot.docs.map(docToData))
    }

    const snapshot = await collection("groups")
      .where("isPrivate", "==", false)
      .orderBy("createdAt", "desc")
      .get()
    return NextResponse.json(snapshot.docs.map(docToData))
  } catch (error) {
    console.error('Failed to fetch groups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    )
  }
}

// POST create a new group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      createdById,
      name,
      description,
      location,
      groupType,
      stateAbbreviation,
      maxMembers,
      isPrivate,
      imageUrl,
    } = body

    if (!createdById || !name) {
      return NextResponse.json(
        { error: 'createdById and name are required' },
        { status: 400 }
      )
    }

    const timestamp = nowIso()
    const groupRef = await collection("groups").add({
      createdById,
      name,
      description: description || "",
      location: location || "",
      groupType: groupType || "coop",
      stateAbbreviation: stateAbbreviation || "",
      maxMembers: maxMembers ?? null,
      isPrivate: isPrivate || false,
      imageUrl: imageUrl || "",
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    await collection("groupMembers").add({
      groupId: groupRef.id,
      userId: createdById,
      role: "admin",
      joinedAt: timestamp,
    })

    const created = await groupRef.get()
    return NextResponse.json(docToData(created), { status: 201 })
  } catch (error) {
    console.error('Failed to create group:', error)
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    )
  }
}
