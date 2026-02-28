"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth-middleware"
import { db } from "@/lib/db"
import { AuthenticationError } from "@/lib/errors"

async function getCurrentUserId(): Promise<string | null> {
  try {
    const auth = await requireAuth()
    return auth.userId
  } catch (error) {
    if (error instanceof AuthenticationError) return null
    throw error
  }
}

/** Resolve Firebase UID → Postgres UUID, creating user row if needed */
async function resolveUser(firebaseUid: string, email?: string): Promise<string> {
  return db.resolveOrCreateUserId(firebaseUid, email || undefined)
}

// ─── Get all groups (with optional filtering) ──────────────────────────────────

export async function getGroups(filters?: {
  type?: string
  isPrivate?: boolean
  search?: string
  philosophy?: string
  ageGroup?: string
  city?: string
  isAccepting?: boolean
}) {
  try {
    const rows = await db.getGroupsByFilters({
      search: filters?.search,
      philosophy: filters?.philosophy,
      ageGroup: filters?.ageGroup,
      city: filters?.city,
      isAccepting: filters?.isAccepting,
      groupType: filters?.type,
    })

    const groups = rows.map(rowToGroupProfile)
    return { success: true, groups }
  } catch (error) {
    console.error("[v0] Error getting groups:", error)
    return { success: false, error: "Failed to load groups", groups: [] }
  }
}

// ─── Create a new group ─────────────────────────────────────────────────────────

export async function createGroup(formData: FormData) {
  const firebaseUid = await getCurrentUserId()
  if (!firebaseUid) redirect("/sign-in")

  const name = formData.get("name") as string
  const groupType = formData.get("type") as string

  if (!name || !groupType) {
    return { success: false, error: "Name and type are required" }
  }

  try {
    const auth = await requireAuth()
    const pgUserId = await resolveUser(auth.userId, auth.email || undefined)

    const ageGroupsRaw = formData.get("ageGroups") as string
    const subjectsRaw = formData.get("subjectsOffered") as string

    const group = await db.createGroupFull(pgUserId, {
      name,
      description: (formData.get("description") as string) || undefined,
      groupType,
      location: (formData.get("location") as string) || undefined,
      stateAbbreviation: (formData.get("stateAbbreviation") as string) || undefined,
      maxMembers: formData.get("maxMembers") ? Number(formData.get("maxMembers")) : undefined,
      isPrivate: formData.get("isPrivate") === "true",
      philosophy: (formData.get("philosophy") as string) || undefined,
      ageGroups: ageGroupsRaw ? ageGroupsRaw.split(",").filter(Boolean) : undefined,
      subjectsOffered: subjectsRaw ? subjectsRaw.split(",").filter(Boolean) : undefined,
      meetingFrequency: (formData.get("meetingFrequency") as string) || undefined,
      meetingSchedule: (formData.get("meetingSchedule") as string) || undefined,
      latitude: formData.get("latitude") ? Number(formData.get("latitude")) : undefined,
      longitude: formData.get("longitude") ? Number(formData.get("longitude")) : undefined,
      city: (formData.get("city") as string) || undefined,
      zipCode: (formData.get("zipCode") as string) || undefined,
      schedule: formData.get("schedule") ? JSON.parse(formData.get("schedule") as string) : undefined,
    })

    revalidatePath("/community")
    return { success: true, id: group.id }
  } catch (error) {
    console.error("[v0] Error creating group:", error)
    return { success: false, error: "Failed to create group" }
  }
}

// ─── Update a group ─────────────────────────────────────────────────────────────

export async function updateGroup(groupId: string, formData: FormData) {
  const firebaseUid = await getCurrentUserId()
  if (!firebaseUid) redirect("/sign-in")

  try {
    const auth = await requireAuth()
    const pgUserId = await resolveUser(auth.userId, auth.email || undefined)

    const isAdmin = await db.isGroupAdmin(groupId, pgUserId)
    if (!isAdmin) {
      return { success: false, error: "You don't have permission to update this group" }
    }

    const ageGroupsRaw = formData.get("ageGroups") as string
    const subjectsRaw = formData.get("subjectsOffered") as string

    const updates: Record<string, any> = {}
    const fields = ["name", "description", "group_type", "location", "state_abbreviation", "meeting_schedule", "meeting_frequency", "philosophy", "city", "zip_code"]
    for (const field of fields) {
      const camelKey = field.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
      const value = formData.get(camelKey) as string
      if (value !== null && value !== undefined) updates[field] = value
    }
    if (formData.get("maxMembers")) updates.max_members = Number(formData.get("maxMembers"))
    if (formData.get("isPrivate") !== null) updates.is_private = formData.get("isPrivate") === "true"
    if (formData.get("isAcceptingMembers") !== null) updates.is_accepting_members = formData.get("isAcceptingMembers") === "true"
    if (ageGroupsRaw) updates.age_groups = ageGroupsRaw.split(",").filter(Boolean)
    if (subjectsRaw) updates.subjects_offered = subjectsRaw.split(",").filter(Boolean)
    if (formData.get("latitude")) updates.latitude = Number(formData.get("latitude"))
    if (formData.get("longitude")) updates.longitude = Number(formData.get("longitude"))
    if (formData.get("schedule")) updates.schedule = JSON.parse(formData.get("schedule") as string)

    await db.updateGroupProfile(groupId, updates)

    revalidatePath("/community")
    revalidatePath(`/community/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    console.error("[v0] Error updating group:", error)
    return { success: false, error: "Failed to update group" }
  }
}

// ─── Delete a group ─────────────────────────────────────────────────────────────

export async function deleteGroup(groupId: string) {
  const firebaseUid = await getCurrentUserId()
  if (!firebaseUid) redirect("/sign-in")

  try {
    const auth = await requireAuth()
    const pgUserId = await resolveUser(auth.userId, auth.email || undefined)

    const group = await db.getGroupById(groupId)
    if (!group) return { success: false, error: "Group not found" }
    if (group.created_by_id !== pgUserId) {
      return { success: false, error: "Only the group creator can delete this group" }
    }

    // CASCADE deletes handle group_members, shared_packets, etc.
    const { sql: sqlFn } = await import("@/lib/db")
    await sqlFn`DELETE FROM groups WHERE id = ${groupId}`

    revalidatePath("/community")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting group:", error)
    return { success: false, error: "Failed to delete group" }
  }
}

// ─── Join a group ───────────────────────────────────────────────────────────────

export async function joinGroup(groupId: string) {
  const firebaseUid = await getCurrentUserId()
  if (!firebaseUid) redirect("/sign-in")

  try {
    const auth = await requireAuth()
    const pgUserId = await resolveUser(auth.userId, auth.email || undefined)

    const group = await db.getGroupById(groupId)
    if (!group) return { success: false, error: "Group not found" }

    if (!group.is_accepting_members) {
      return { success: false, error: "This group is not accepting new members" }
    }

    const isMember = await db.isGroupMember(groupId, pgUserId)
    if (isMember) return { success: false, error: "You are already a member of this group" }

    if (group.max_members && group.member_count >= group.max_members) {
      return { success: false, error: "This group is full" }
    }

    await db.addGroupMember(groupId, pgUserId, "member")

    revalidatePath("/community")
    revalidatePath(`/community/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    console.error("[v0] Error joining group:", error)
    return { success: false, error: "Failed to join group" }
  }
}

// ─── Leave a group ──────────────────────────────────────────────────────────────

export async function leaveGroup(groupId: string) {
  const firebaseUid = await getCurrentUserId()
  if (!firebaseUid) redirect("/sign-in")

  try {
    const auth = await requireAuth()
    const pgUserId = await resolveUser(auth.userId, auth.email || undefined)

    const group = await db.getGroupById(groupId)
    if (!group) return { success: false, error: "Group not found" }

    if (group.created_by_id === pgUserId) {
      return { success: false, error: "Group creators cannot leave their group. Delete it instead." }
    }

    await db.removeGroupMember(groupId, pgUserId)

    revalidatePath("/community")
    revalidatePath(`/community/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    console.error("[v0] Error leaving group:", error)
    return { success: false, error: "Failed to leave group" }
  }
}

// ─── Get group details ──────────────────────────────────────────────────────────

export async function getGroupDetails(groupId: string) {
  try {
    const group = await db.getGroupById(groupId)
    if (!group) return { success: false, error: "Group not found" }

    const members = await db.getGroupMembers(groupId)

    return {
      success: true,
      group: rowToGroupProfile(group),
      members: members.map((m: any) => ({
        id: m.id,
        userId: m.user_id,
        displayName: m.display_name || "Anonymous",
        email: m.email,
        photoUrl: m.photo_url,
        role: m.role,
        joinedAt: m.joined_at?.toISOString?.() || m.joined_at,
      })),
    }
  } catch (error) {
    console.error("[v0] Error getting group details:", error)
    return { success: false, error: "Failed to load group details" }
  }
}

// ─── Get current user's role in a group ─────────────────────────────────────────

export async function getUserGroupRole(groupId: string) {
  try {
    const auth = await requireAuth()
    const pgUserId = await resolveUser(auth.userId, auth.email || undefined)
    const role = await db.getGroupMemberRole(groupId, pgUserId)
    return { success: true, role }
  } catch (error) {
    return { success: true, role: null }
  }
}

// ─── Get user's groups (for sharing, etc.) ──────────────────────────────────────

export async function getUserGroups() {
  try {
    const auth = await requireAuth()
    const pgUserId = await resolveUser(auth.userId, auth.email || undefined)
    const groups = await db.getUserGroupsList(pgUserId)
    return {
      success: true,
      groups: groups.map((g: any) => ({
        id: g.id,
        name: g.name,
        imageUrl: g.image_url,
        role: g.role,
      })),
    }
  } catch (error) {
    return { success: false, error: "Failed to load your groups", groups: [] }
  }
}

// ─── Helper: map DB row to GroupProfile ─────────────────────────────────────────

function rowToGroupProfile(row: any) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    location: row.location || "",
    groupType: row.group_type || "co-op",
    stateAbbreviation: row.state_abbreviation,
    maxMembers: row.max_members,
    isPrivate: row.is_private || false,
    imageUrl: row.image_url,
    createdById: row.created_by_id,
    creatorName: row.creator_name,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
    updatedAt: row.updated_at?.toISOString?.() || row.updated_at,
    philosophy: row.philosophy,
    ageGroups: row.age_groups || [],
    subjectsOffered: row.subjects_offered || [],
    schedule: row.schedule,
    meetingFrequency: row.meeting_frequency,
    meetingSchedule: row.meeting_schedule,
    latitude: row.latitude,
    longitude: row.longitude,
    city: row.city,
    zipCode: row.zip_code,
    isAcceptingMembers: row.is_accepting_members ?? true,
    memberCount: row.member_count || 0,
  }
}
