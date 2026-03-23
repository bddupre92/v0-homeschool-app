"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth-middleware"
import { db } from "@/lib/db"
import { AuthenticationError } from "@/lib/errors"
import type { LessonPacket, SavedLessonPacket, PacketFilters } from "@/lib/types"

function rowToSavedPacket(row: any): SavedLessonPacket {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    subject: row.subject,
    grade: row.grade,
    childName: row.child_name,
    topic: row.topic,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
    updatedAt: row.updated_at?.toISOString?.() || row.updated_at,
    isFavorite: row.is_favorite,
    tags: row.tags || [],
    timesPrinted: row.times_printed || 0,
    isShared: row.is_shared,
    sharedToGroupId: row.shared_to_group_id,
    // Packet data sections (only present when full row is fetched with packet_data)
    studentLesson: row.packet_data?.studentLesson || ({} as any),
    worksheet: row.packet_data?.worksheet || ({} as any),
    teacherGuide: row.packet_data?.teacherGuide || ({} as any),
    materialsList: row.packet_data?.materialsList || ({} as any),
    experiment: row.packet_data?.experiment || ({} as any),
    localExploration: row.packet_data?.localExploration || ({} as any),
    extensions: row.packet_data?.extensions || ({} as any),
  }
}

export async function savePacket(
  packet: LessonPacket,
  formData: { learningStyle?: string; interests?: string; location?: string }
) {
  try {
    const auth = await requireAuth()

    const packetData = {
      studentLesson: packet.studentLesson,
      worksheet: packet.worksheet,
      teacherGuide: packet.teacherGuide,
      materialsList: packet.materialsList,
      experiment: packet.experiment,
      localExploration: packet.localExploration,
      extensions: packet.extensions,
    }

    const row = await db.createPacket(
      auth.userId,
      packet.title,
      packet.subject,
      packet.grade,
      packet.childName,
      packet.topic,
      packetData,
      formData
    )

    revalidatePath("/planner")
    return { success: true, packet: rowToSavedPacket(row) }
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return { success: false, error: "Authentication required" }
    }
    console.error("[v0] Error saving packet:", error)
    return { success: false, error: "Failed to save packet" }
  }
}

export async function getUserPackets(
  filters?: PacketFilters,
  page: number = 1,
  pageSize: number = 12
) {
  try {
    const auth = await requireAuth()

    const result = await db.getPacketsByUser(auth.userId, {
      subject: filters?.subject,
      grade: filters?.grade,
      childName: filters?.childName,
      isFavorite: filters?.isFavorite,
      search: filters?.search,
      page,
      pageSize,
    })

    // Library listing doesn't include full packet_data (not in SELECT)
    const packets: SavedLessonPacket[] = result.packets.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      subject: row.subject,
      grade: row.grade,
      childName: row.child_name,
      topic: row.topic,
      createdAt: row.created_at?.toISOString?.() || row.created_at,
      updatedAt: row.updated_at?.toISOString?.() || row.updated_at,
      isFavorite: row.is_favorite,
      tags: row.tags || [],
      timesPrinted: row.times_printed || 0,
      isShared: row.is_shared,
      sharedToGroupId: row.shared_to_group_id,
      // Stub sections — not loaded in list view
      studentLesson: {} as any,
      worksheet: {} as any,
      teacherGuide: {} as any,
      materialsList: {} as any,
      experiment: {} as any,
      localExploration: {} as any,
      extensions: {} as any,
    }))

    return {
      success: true,
      packets,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    }
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return { success: false, error: "Authentication required", packets: [], total: 0, page: 1, pageSize: 12 }
    }
    console.error("[v0] Error fetching packets:", error)
    return { success: false, error: "Failed to load packets", packets: [], total: 0, page: 1, pageSize: 12 }
  }
}

export async function getPacketById(packetId: string) {
  try {
    const auth = await requireAuth()
    const row = await db.getPacketById(packetId)

    if (!row) {
      return { success: false, error: "Packet not found" }
    }

    if (row.user_id !== auth.userId) {
      return { success: false, error: "Access denied" }
    }

    return { success: true, packet: rowToSavedPacket(row) }
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return { success: false, error: "Authentication required" }
    }
    console.error("[v0] Error fetching packet:", error)
    return { success: false, error: "Failed to load packet" }
  }
}

export async function toggleFavorite(packetId: string) {
  try {
    const auth = await requireAuth()
    const existing = await db.getPacketById(packetId)

    if (!existing || existing.user_id !== auth.userId) {
      return { success: false, error: "Packet not found" }
    }

    const row = await db.toggleFavorite(packetId)
    revalidatePath("/planner")
    return { success: true, isFavorite: row.is_favorite }
  } catch (error) {
    console.error("[v0] Error toggling favorite:", error)
    return { success: false, error: "Failed to update" }
  }
}

export async function deletePacket(packetId: string) {
  try {
    const auth = await requireAuth()
    const existing = await db.getPacketById(packetId)

    if (!existing || existing.user_id !== auth.userId) {
      return { success: false, error: "Packet not found" }
    }

    await db.deletePacket(packetId)
    revalidatePath("/planner")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting packet:", error)
    return { success: false, error: "Failed to delete" }
  }
}

export async function trackPrint(packetId: string) {
  try {
    const auth = await requireAuth()
    const existing = await db.getPacketById(packetId)

    if (!existing || existing.user_id !== auth.userId) {
      return { success: false }
    }

    await db.incrementPrintCount(packetId)
    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function getChildNames() {
  try {
    const auth = await requireAuth()
    return { success: true, names: await db.getDistinctChildNames(auth.userId) }
  } catch {
    return { success: false, names: [] }
  }
}
