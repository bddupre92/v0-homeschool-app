"use server"

/**
 * Server actions for Phase 7 Community discovery + group lifecycle.
 *
 * Lives separate from `group-coordination-actions.ts` (which handles
 * in-group activity: announcements, rotations, trips, RSVPs) so the
 * discovery surface has a small, focused module to import.
 *
 * All actions:
 *  - Require auth (Firebase session) via `requireAuth`.
 *  - Resolve Firebase UID → Postgres UUID via `db.resolveOrCreateUserId`.
 *  - Soft-fail on missing POSTGRES_URL so the Community room stays calm
 *    during a half-configured deploy.
 *  - Return `{ success: boolean, error?, ... }` shaped objects to match
 *    `group-coordination-actions.ts`.
 */

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth-middleware"
import { db } from "@/lib/db"
import { isPostgresConfigured } from "@/lib/postgres-guard"
import { rankGroups } from "@/lib/group-matching"
import type { GroupMatchResult, GroupProfile, UserGroupPreferences } from "@/lib/types"
import { lookupZip } from "@/lib/zipcodes"

interface CreateGroupInput {
  name: string
  description?: string
  groupType?: string
  philosophy?: string
  ageGroups?: string[]
  subjectsOffered?: string[]
  scheduleDay?: string
  scheduleStartTime?: string
  scheduleEndTime?: string
  meetingFrequency?: string
  zipCode?: string
  isPrivate?: boolean
  externalUrl?: string
}

export async function createGroup(input: CreateGroupInput) {
  if (!isPostgresConfigured()) {
    return {
      success: false,
      error: "Community is not configured. Ask your admin to connect Postgres.",
    }
  }

  if (!input.name?.trim()) {
    return { success: false, error: "Name is required." }
  }

  try {
    const auth = await requireAuth()
    const userId = await db.resolveOrCreateUserId(auth.userId, auth.email || undefined)

    // ZIP → coords (best-effort; group is still created without coords).
    const zip = input.zipCode?.trim()
    const coords = zip ? lookupZip(zip) : null

    const schedule =
      input.scheduleDay || input.scheduleStartTime || input.scheduleEndTime
        ? {
            day: input.scheduleDay ?? null,
            startTime: input.scheduleStartTime ?? null,
            endTime: input.scheduleEndTime ?? null,
            frequency: input.meetingFrequency ?? null,
          }
        : undefined

    const created = await db.createGroupFull(userId, {
      name: input.name.trim(),
      description: input.description?.trim(),
      groupType: input.groupType,
      isPrivate: Boolean(input.isPrivate),
      philosophy: input.philosophy,
      ageGroups: input.ageGroups,
      subjectsOffered: input.subjectsOffered,
      schedule,
      meetingFrequency: input.meetingFrequency,
      latitude: coords?.lat,
      longitude: coords?.lng,
      city: coords?.city,
      zipCode: coords?.zip ?? zip,
      stateAbbreviation: coords?.state,
    })

    revalidatePath("/community")
    return { success: true, groupId: created.id as string }
  } catch (err) {
    console.error("[community] createGroup failed:", err)
    return { success: false, error: "Could not create the group. Try again in a moment." }
  }
}

export async function getMyGroups() {
  if (!isPostgresConfigured()) return { success: true, groups: [] }
  try {
    const auth = await requireAuth()
    const userId = await db.resolveOrCreateUserId(auth.userId, auth.email || undefined)
    const groups = await db.getGroupsByMember(userId)
    return { success: true, groups }
  } catch (err) {
    console.error("[community] getMyGroups failed:", err)
    return { success: true, groups: [] }
  }
}

interface SavePrefsInput {
  zipCode?: string | null
  maxDistanceMiles?: number
  preferredPhilosophy?: string | null
  childAgeGroups?: string[]
  wantedSubjects?: string[]
  preferredDay?: string | null
}

export async function getUserPreferences() {
  if (!isPostgresConfigured()) return { success: true, prefs: null }
  try {
    const auth = await requireAuth()
    const userId = await db.resolveOrCreateUserId(auth.userId, auth.email || undefined)
    const row = await db.getUserGroupPreferences(userId)
    return { success: true, prefs: row }
  } catch (err) {
    console.error("[community] getUserPreferences failed:", err)
    return { success: true, prefs: null }
  }
}

export async function saveUserPreferences(input: SavePrefsInput) {
  if (!isPostgresConfigured()) {
    return { success: false, error: "Community is not configured." }
  }
  try {
    const auth = await requireAuth()
    const userId = await db.resolveOrCreateUserId(auth.userId, auth.email || undefined)
    const zip = input.zipCode?.trim() || null
    const coords = zip ? lookupZip(zip) : null
    await db.upsertUserGroupPreferences(userId, {
      zipCode: coords?.zip ?? zip,
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
      maxDistanceMiles: input.maxDistanceMiles ?? 25,
      preferredPhilosophy: input.preferredPhilosophy ?? null,
      childAgeGroups: input.childAgeGroups ?? [],
      wantedSubjects: input.wantedSubjects ?? [],
      preferredDay: input.preferredDay ?? null,
    })
    revalidatePath("/community")
    revalidatePath("/community/preferences")
    return { success: true }
  } catch (err) {
    console.error("[community] saveUserPreferences failed:", err)
    return { success: false, error: "Could not save preferences. Try again." }
  }
}

/**
 * Discover and rank co-ops near the user's saved ZIP. Returns `needsPrefs`
 * when the user hasn't set a ZIP yet so the UI can route them to the
 * preferences page instead of showing an empty list.
 */
export async function discoverGroups(): Promise<
  | { success: true; needsPrefs?: false; matches: GroupMatchResult[]; centerCity?: string }
  | { success: true; needsPrefs: true; matches: [] }
  | { success: false; error: string; matches: [] }
> {
  if (!isPostgresConfigured()) {
    return { success: false, error: "Community is not configured.", matches: [] }
  }
  try {
    const auth = await requireAuth()
    const userId = await db.resolveOrCreateUserId(auth.userId, auth.email || undefined)
    const prefsRow = await db.getUserGroupPreferences(userId)
    if (!prefsRow?.latitude || !prefsRow?.longitude) {
      return { success: true, needsPrefs: true, matches: [] }
    }

    const maxMiles: number = prefsRow.max_distance_miles ?? 25
    // ~69 mi per latitude degree; longitude scales by cos(lat).
    const latDelta = maxMiles / 69
    const lngDelta = maxMiles / (69 * Math.cos((prefsRow.latitude * Math.PI) / 180))
    const box = {
      minLat: prefsRow.latitude - latDelta,
      maxLat: prefsRow.latitude + latDelta,
      minLng: prefsRow.longitude - lngDelta,
      maxLng: prefsRow.longitude + lngDelta,
    }

    const rows = await db.getNearbyGroups(box)
    const groups: GroupProfile[] = rows.map(rowToGroupProfile)
    const prefs: UserGroupPreferences = {
      latitude: prefsRow.latitude,
      longitude: prefsRow.longitude,
      maxDistanceMiles: maxMiles,
      preferredPhilosophy: prefsRow.preferred_philosophy ?? undefined,
      childAgeGroups: prefsRow.child_age_groups ?? [],
      wantedSubjects: prefsRow.wanted_subjects ?? [],
      preferredDay: prefsRow.preferred_day ?? undefined,
    }
    const matches = rankGroups(prefs, groups).slice(0, 20)
    return { success: true, matches }
  } catch (err) {
    console.error("[community] discoverGroups failed:", err)
    return { success: false, error: "Discovery failed. Try again in a moment.", matches: [] }
  }
}

function rowToGroupProfile(row: any): GroupProfile {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    location: row.location ?? "",
    groupType: row.group_type ?? "",
    stateAbbreviation: row.state_abbreviation ?? undefined,
    maxMembers: row.max_members ?? undefined,
    isPrivate: Boolean(row.is_private),
    imageUrl: row.image_url ?? undefined,
    createdById: row.created_by_id,
    createdAt: row.created_at?.toISOString?.() ?? String(row.created_at ?? ""),
    updatedAt: row.updated_at?.toISOString?.() ?? String(row.updated_at ?? ""),
    philosophy: row.philosophy ?? undefined,
    ageGroups: row.age_groups ?? [],
    subjectsOffered: row.subjects_offered ?? [],
    schedule: row.schedule ?? undefined,
    meetingFrequency: row.meeting_frequency ?? undefined,
    meetingSchedule: row.meeting_schedule ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    city: row.city ?? undefined,
    zipCode: row.zip_code ?? undefined,
    isAcceptingMembers: row.is_accepting_members ?? true,
    memberCount: row.member_count ?? 0,
  }
}

export async function joinGroup(groupId: string) {
  if (!isPostgresConfigured()) {
    return { success: false, error: "Community is not configured." }
  }
  try {
    const auth = await requireAuth()
    const userId = await db.resolveOrCreateUserId(auth.userId, auth.email || undefined)

    const group = await db.getGroupById(groupId)
    if (!group) return { success: false, error: "Group not found." }
    if (group.is_private) {
      return { success: false, error: "This group is invite-only. Ask an admin for an invite." }
    }
    if (group.is_accepting_members === false) {
      return { success: false, error: "This group isn't accepting new members right now." }
    }
    const alreadyMember = await db.isGroupMember(groupId, userId)
    if (alreadyMember) return { success: true, alreadyMember: true }

    await db.addGroupMember(groupId, userId)
    revalidatePath(`/community/groups/${groupId}`)
    revalidatePath("/community")
    return { success: true, alreadyMember: false }
  } catch (err) {
    console.error("[community] joinGroup failed:", err)
    return { success: false, error: "Could not join the group. Try again." }
  }
}

export async function leaveGroup(groupId: string) {
  if (!isPostgresConfigured()) {
    return { success: false, error: "Community is not configured." }
  }
  try {
    const auth = await requireAuth()
    const userId = await db.resolveOrCreateUserId(auth.userId, auth.email || undefined)
    await db.removeGroupMember(groupId, userId)
    revalidatePath(`/community/groups/${groupId}`)
    revalidatePath("/community")
    return { success: true }
  } catch (err) {
    console.error("[community] leaveGroup failed:", err)
    return { success: false, error: "Could not leave the group. Try again." }
  }
}
