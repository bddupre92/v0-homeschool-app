"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { adminDb } from "@/lib/firebase-admin-safe"
import { requireAuth } from "@/lib/auth-middleware"
import {
  AuthenticationError,
  NotFoundError,
  AuthorizationError,
  ConflictError,
  formatErrorResponse,
} from "@/lib/errors"

// Get the current user
async function getCurrentUser() {
  try {
    const auth = await requireAuth()
    return auth.userId
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return null
    }
    throw error
  }
}

// Get all groups (with optional filtering)
export async function getGroups(filters?: { type?: string; isPrivate?: boolean }) {
  try {
    let query = adminDb.collection("groups").orderBy("createdAt", "desc")

    // Filter by group type
    if (filters?.type) {
      query = query.where("type", "==", filters.type) as any
    }

    // Filter by privacy
    if (filters?.isPrivate !== undefined) {
      query = query.where("isPrivate", "==", filters.isPrivate) as any
    }

    const groupsSnapshot = await query.get()

    const groups = groupsSnapshot.docs.map((doc: any) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      }
    })

    return { success: true, groups }
  } catch (error) {
    console.error("[v0] Error getting groups:", error)
    return { success: false, error: "Failed to load groups", groups: [] }
  }
}

// Create a new group
export async function createGroup(formData: FormData) {
  const userId = await getCurrentUser()

  if (!userId) {
    redirect("/sign-in")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const type = formData.get("type") as string
  const location = formData.get("location") as string

  if (!name || !type) {
    return { success: false, error: "Name and type are required" }
  }

  try {
    const groupRef = adminDb.collection("groups").doc()

    await groupRef.set({
      name,
      description: description || "",
      type,
      location: location || "",
      meetingSchedule: (formData.get("meetingSchedule") as string) || "",
      maxMembers: formData.get("maxMembers") ? Number.parseInt(formData.get("maxMembers") as string) : null,
      isPrivate: formData.get("isPrivate") === "true",
      image: (formData.get("image") as string) || null,
      createdById: userId,
      members: [userId],
      memberRoles: {
        [userId]: "admin",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    revalidatePath("/community/groups")
    return { success: true, id: groupRef.id }
  } catch (error) {
    console.error("[v0] Error creating group:", error)
    return { success: false, error: "Failed to create group" }
  }
}

// Update a group
export async function updateGroup(groupId: string, formData: FormData) {
  const userId = await getCurrentUser()

  if (!userId) {
    redirect("/sign-in")
  }

  try {
    const groupDoc = await adminDb.collection("groups").doc(groupId).get()

    if (!groupDoc.exists) {
      return { success: false, error: "Group not found" }
    }

    const groupData = groupDoc.data()

    // Check if user is admin
    if (groupData?.memberRoles?.[userId] !== "admin") {
      return { success: false, error: "You don't have permission to update this group" }
    }

    await adminDb
      .collection("groups")
      .doc(groupId)
      .update({
        name: (formData.get("name") as string) || groupData.name,
        description: (formData.get("description") as string) || groupData.description,
        type: (formData.get("type") as string) || groupData.type,
        location: (formData.get("location") as string) || groupData.location,
        meetingSchedule: (formData.get("meetingSchedule") as string) || groupData.meetingSchedule,
        maxMembers: formData.get("maxMembers") ? Number.parseInt(formData.get("maxMembers") as string) : groupData.maxMembers,
        isPrivate: formData.get("isPrivate") === "true",
        image: (formData.get("image") as string) || groupData.image,
        updatedAt: new Date(),
      })

    revalidatePath("/community/groups")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error updating group:", error)
    return { success: false, error: "Failed to update group" }
  }
}

// Delete a group
export async function deleteGroup(groupId: string) {
  const userId = await getCurrentUser()

  if (!userId) {
    redirect("/sign-in")
  }

  try {
    const groupDoc = await adminDb.collection("groups").doc(groupId).get()

    if (!groupDoc.exists) {
      return { success: false, error: "Group not found" }
    }

    const groupData = groupDoc.data()

    // Only the creator can delete the group
    if (groupData?.createdById !== userId) {
      return { success: false, error: "Only the group creator can delete this group" }
    }

    await adminDb.collection("groups").doc(groupId).delete()

    revalidatePath("/community/groups")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting group:", error)
    return { success: false, error: "Failed to delete group" }
  }
}

// Join a group
export async function joinGroup(groupId: string) {
  const userId = await getCurrentUser()

  if (!userId) {
    redirect("/sign-in")
  }

  try {
    const groupDoc = await adminDb.collection("groups").doc(groupId).get()

    if (!groupDoc.exists) {
      return { success: false, error: "Group not found" }
    }

    const groupData = groupDoc.data()

    // Check if already a member
    if (groupData?.members?.includes(userId)) {
      return { success: false, error: "You are already a member of this group" }
    }

    // Check max members limit
    if (groupData?.maxMembers && groupData.members?.length >= groupData.maxMembers) {
      return { success: false, error: "This group is full" }
    }

    // Add user to members
    await adminDb
      .collection("groups")
      .doc(groupId)
      .update({
        members: adminDb.FieldValue.arrayUnion(userId),
        [`memberRoles.${userId}`]: "member",
        updatedAt: new Date(),
      })

    revalidatePath("/community/groups")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error joining group:", error)
    return { success: false, error: "Failed to join group" }
  }
}

// Leave a group
export async function leaveGroup(groupId: string) {
  const userId = await getCurrentUser()

  if (!userId) {
    redirect("/sign-in")
  }

  try {
    const groupDoc = await adminDb.collection("groups").doc(groupId).get()

    if (!groupDoc.exists) {
      return { success: false, error: "Group not found" }
    }

    const groupData = groupDoc.data()

    // Can't leave if you're the creator
    if (groupData?.createdById === userId) {
      return { success: false, error: "Group creators cannot leave their group. Delete it instead." }
    }

    // Remove user from members
    await adminDb
      .collection("groups")
      .doc(groupId)
      .update({
        members: adminDb.FieldValue.arrayRemove(userId),
        [`memberRoles.${userId}`]: adminDb.FieldValue.delete(),
        updatedAt: new Date(),
      })

    revalidatePath("/community/groups")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error leaving group:", error)
    return { success: false, error: "Failed to leave group" }
  }
}
