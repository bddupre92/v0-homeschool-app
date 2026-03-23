"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth-middleware"
import { db } from "@/lib/db"

/** Resolve Firebase UID → Postgres UUID */
async function resolveUser(): Promise<string> {
  const auth = await requireAuth()
  return db.resolveOrCreateUserId(auth.userId, auth.email || undefined)
}

// ─── Shared Packets ─────────────────────────────────────────────────────────────

export async function sharePacketToGroup(packetId: string, groupId: string, notes?: string) {
  try {
    const pgUserId = await resolveUser()

    // Verify user is a group member
    const isMember = await db.isGroupMember(groupId, pgUserId)
    if (!isMember) return { success: false, error: "You must be a group member to share packets" }

    // Verify user owns the packet
    const packet = await db.getPacketById(packetId)
    if (!packet) return { success: false, error: "Packet not found" }

    const result = await db.sharePacketToGroup(groupId, packetId, pgUserId, notes)
    if (!result) return { success: false, error: "This packet is already shared to this group" }

    revalidatePath(`/community/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    console.error("[v0] Error sharing packet:", error)
    return { success: false, error: "Failed to share packet" }
  }
}

export async function getGroupSharedPackets(groupId: string, page = 1) {
  try {
    const pgUserId = await resolveUser()

    const isMember = await db.isGroupMember(groupId, pgUserId)
    if (!isMember) return { success: false, error: "You must be a group member to view shared packets", packets: [] }

    const rows = await db.getGroupSharedPackets(groupId, page)
    const packets = rows.map((r: any) => ({
      id: r.id,
      groupId: r.group_id,
      packetId: r.packet_id,
      sharedByUserId: r.shared_by_user_id,
      sharedByName: r.shared_by_name || "Anonymous",
      notes: r.notes,
      sharedAt: r.shared_at?.toISOString?.() || r.shared_at,
      packetTitle: r.packet_title,
      packetSubject: r.packet_subject,
      packetGrade: r.packet_grade,
      packetChildName: r.packet_child_name,
      packetTopic: r.packet_topic,
    }))

    return { success: true, packets }
  } catch (error) {
    console.error("[v0] Error getting shared packets:", error)
    return { success: false, error: "Failed to load shared packets", packets: [] }
  }
}

export async function removeSharedPacket(sharedPacketId: string, groupId: string) {
  try {
    const pgUserId = await resolveUser()

    // Admin or the original sharer can remove
    const isAdmin = await db.isGroupAdmin(groupId, pgUserId)
    if (!isAdmin) {
      // TODO: check if the user is the sharer — for now only admins
      return { success: false, error: "Only group admins can remove shared packets" }
    }

    await db.removeSharedPacket(sharedPacketId)
    revalidatePath(`/community/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    console.error("[v0] Error removing shared packet:", error)
    return { success: false, error: "Failed to remove shared packet" }
  }
}

// ─── Announcements ──────────────────────────────────────────────────────────────

export async function createAnnouncement(groupId: string, title: string, content: string) {
  try {
    const pgUserId = await resolveUser()

    const role = await db.getGroupMemberRole(groupId, pgUserId)
    if (!role || (role !== "admin" && role !== "moderator")) {
      return { success: false, error: "Only admins and moderators can create announcements" }
    }

    await db.createAnnouncement(groupId, pgUserId, title, content)
    revalidatePath(`/community/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    console.error("[v0] Error creating announcement:", error)
    return { success: false, error: "Failed to create announcement" }
  }
}

export async function getGroupAnnouncements(groupId: string, page = 1) {
  try {
    const pgUserId = await resolveUser()

    const isMember = await db.isGroupMember(groupId, pgUserId)
    if (!isMember) return { success: false, error: "You must be a member to view announcements", announcements: [] }

    const rows = await db.getGroupAnnouncements(groupId, page)
    const announcements = rows.map((r: any) => ({
      id: r.id,
      groupId: r.group_id,
      authorUserId: r.author_user_id,
      authorName: r.author_name || "Anonymous",
      authorPhotoUrl: r.author_photo_url,
      title: r.title,
      content: r.content,
      isPinned: r.is_pinned,
      createdAt: r.created_at?.toISOString?.() || r.created_at,
      updatedAt: r.updated_at?.toISOString?.() || r.updated_at,
    }))

    return { success: true, announcements }
  } catch (error) {
    console.error("[v0] Error getting announcements:", error)
    return { success: false, error: "Failed to load announcements", announcements: [] }
  }
}

export async function updateAnnouncement(announcementId: string, groupId: string, data: { title?: string; content?: string; isPinned?: boolean }) {
  try {
    const pgUserId = await resolveUser()

    const isAdmin = await db.isGroupAdmin(groupId, pgUserId)
    if (!isAdmin) return { success: false, error: "Only admins can update announcements" }

    await db.updateAnnouncement(announcementId, data)
    revalidatePath(`/community/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    console.error("[v0] Error updating announcement:", error)
    return { success: false, error: "Failed to update announcement" }
  }
}

export async function deleteAnnouncement(announcementId: string, groupId: string) {
  try {
    const pgUserId = await resolveUser()

    const isAdmin = await db.isGroupAdmin(groupId, pgUserId)
    if (!isAdmin) {
      // Also allow the author to delete their own announcement
      const ann = await db.getAnnouncementById(announcementId)
      if (!ann || ann.author_user_id !== pgUserId) {
        return { success: false, error: "You don't have permission to delete this announcement" }
      }
    }

    await db.deleteAnnouncement(announcementId)
    revalidatePath(`/community/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting announcement:", error)
    return { success: false, error: "Failed to delete announcement" }
  }
}

// ─── Teaching Rotations ─────────────────────────────────────────────────────────

export async function addTeachingRotation(
  groupId: string,
  teacherUserId: string,
  subject: string,
  dayOfWeek: string,
  startTime?: string,
  endTime?: string,
  notes?: string
) {
  try {
    const pgUserId = await resolveUser()

    const isAdmin = await db.isGroupAdmin(groupId, pgUserId)
    if (!isAdmin) return { success: false, error: "Only admins can manage teaching rotations" }

    await db.createTeachingRotation(groupId, teacherUserId, subject, dayOfWeek, startTime, endTime, notes)
    revalidatePath(`/community/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    console.error("[v0] Error adding rotation:", error)
    return { success: false, error: "Failed to add teaching rotation" }
  }
}

export async function getTeachingRotations(groupId: string) {
  try {
    const pgUserId = await resolveUser()

    const isMember = await db.isGroupMember(groupId, pgUserId)
    if (!isMember) return { success: false, error: "You must be a member to view the schedule", rotations: [] }

    const rows = await db.getTeachingRotations(groupId)
    const rotations = rows.map((r: any) => ({
      id: r.id,
      groupId: r.group_id,
      teacherUserId: r.teacher_user_id,
      teacherName: r.teacher_name || "TBD",
      subject: r.subject,
      dayOfWeek: r.day_of_week,
      startTime: r.start_time,
      endTime: r.end_time,
      notes: r.notes,
      createdAt: r.created_at?.toISOString?.() || r.created_at,
    }))

    return { success: true, rotations }
  } catch (error) {
    console.error("[v0] Error getting rotations:", error)
    return { success: false, error: "Failed to load teaching rotations", rotations: [] }
  }
}

export async function removeTeachingRotation(rotationId: string, groupId: string) {
  try {
    const pgUserId = await resolveUser()

    const isAdmin = await db.isGroupAdmin(groupId, pgUserId)
    if (!isAdmin) return { success: false, error: "Only admins can remove teaching rotations" }

    await db.deleteTeachingRotation(rotationId)
    revalidatePath(`/community/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    console.error("[v0] Error removing rotation:", error)
    return { success: false, error: "Failed to remove teaching rotation" }
  }
}

// ─── Field Trips ────────────────────────────────────────────────────────────────

export async function createFieldTrip(
  groupId: string,
  data: {
    title: string
    description?: string
    location: string
    latitude?: number
    longitude?: number
    tripDate: string
    maxAttendees?: number
    costPerFamily?: number
    relatedPacketId?: string
  }
) {
  try {
    const pgUserId = await resolveUser()

    const role = await db.getGroupMemberRole(groupId, pgUserId)
    if (!role || (role !== "admin" && role !== "moderator")) {
      return { success: false, error: "Only admins and moderators can create field trips" }
    }

    await db.createFieldTrip(groupId, pgUserId, data)
    revalidatePath(`/community/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    console.error("[v0] Error creating field trip:", error)
    return { success: false, error: "Failed to create field trip" }
  }
}

export async function getGroupFieldTrips(groupId: string) {
  try {
    const pgUserId = await resolveUser()

    const isMember = await db.isGroupMember(groupId, pgUserId)
    if (!isMember) return { success: false, error: "You must be a member to view field trips", trips: [] }

    const rows = await db.getGroupFieldTrips(groupId)

    // Get user's RSVP status for each trip
    const trips = await Promise.all(
      rows.map(async (r: any) => {
        const userRsvp = await db.getUserFieldTripRSVP(r.id, pgUserId)
        return {
          id: r.id,
          groupId: r.group_id,
          organizerUserId: r.organizer_user_id,
          organizerName: r.organizer_name || "Anonymous",
          title: r.title,
          description: r.description,
          location: r.location,
          latitude: r.latitude,
          longitude: r.longitude,
          tripDate: r.trip_date?.toISOString?.() || r.trip_date,
          maxAttendees: r.max_attendees,
          costPerFamily: r.cost_per_family ? Number(r.cost_per_family) : undefined,
          relatedPacketId: r.related_packet_id,
          rsvpCount: r.rsvp_count,
          userRsvpStatus: userRsvp?.status || null,
          createdAt: r.created_at?.toISOString?.() || r.created_at,
          updatedAt: r.updated_at?.toISOString?.() || r.updated_at,
        }
      })
    )

    return { success: true, trips }
  } catch (error) {
    console.error("[v0] Error getting field trips:", error)
    return { success: false, error: "Failed to load field trips", trips: [] }
  }
}

export async function rsvpToFieldTrip(fieldTripId: string, numChildren: number, status: "going" | "maybe" | "not_going") {
  try {
    const pgUserId = await resolveUser()

    // Verify field trip exists and get group ID
    const trip = await db.getFieldTripById(fieldTripId)
    if (!trip) return { success: false, error: "Field trip not found" }

    const isMember = await db.isGroupMember(trip.group_id, pgUserId)
    if (!isMember) return { success: false, error: "You must be a group member to RSVP" }

    if (status === "not_going") {
      await db.cancelFieldTripRSVP(fieldTripId, pgUserId)
    } else {
      await db.rsvpFieldTrip(fieldTripId, pgUserId, numChildren, status)
    }

    revalidatePath(`/community/groups/${trip.group_id}`)
    return { success: true }
  } catch (error) {
    console.error("[v0] Error RSVPing:", error)
    return { success: false, error: "Failed to RSVP" }
  }
}

export async function getFieldTripDetails(fieldTripId: string) {
  try {
    const pgUserId = await resolveUser()

    const trip = await db.getFieldTripById(fieldTripId)
    if (!trip) return { success: false, error: "Field trip not found" }

    const isMember = await db.isGroupMember(trip.group_id, pgUserId)
    if (!isMember) return { success: false, error: "You must be a member to view this trip" }

    const rsvps = await db.getFieldTripRSVPs(fieldTripId)

    return {
      success: true,
      trip: {
        id: trip.id,
        groupId: trip.group_id,
        organizerUserId: trip.organizer_user_id,
        organizerName: trip.organizer_name,
        title: trip.title,
        description: trip.description,
        location: trip.location,
        latitude: trip.latitude,
        longitude: trip.longitude,
        tripDate: trip.trip_date?.toISOString?.() || trip.trip_date,
        maxAttendees: trip.max_attendees,
        costPerFamily: trip.cost_per_family ? Number(trip.cost_per_family) : undefined,
        relatedPacketId: trip.related_packet_id,
        createdAt: trip.created_at?.toISOString?.() || trip.created_at,
      },
      rsvps: rsvps.map((r: any) => ({
        id: r.id,
        fieldTripId: r.field_trip_id,
        userId: r.user_id,
        userName: r.user_name || "Anonymous",
        numChildren: r.num_children,
        status: r.status,
        createdAt: r.created_at?.toISOString?.() || r.created_at,
      })),
    }
  } catch (error) {
    console.error("[v0] Error getting field trip details:", error)
    return { success: false, error: "Failed to load field trip details" }
  }
}
