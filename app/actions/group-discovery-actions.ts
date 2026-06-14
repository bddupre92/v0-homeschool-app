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
