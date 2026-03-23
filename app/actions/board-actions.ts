"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { adminDb } from "@/lib/firebase-admin-safe"
import { requireAuth, getOptionalUser } from "@/lib/auth-middleware"
import { AuthenticationError } from "@/lib/errors"

// Get the current user from the auth middleware
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

// Get boards for the current user
export async function getBoards() {
  const userId = await getCurrentUser()
  if (!userId) redirect("/sign-in")

  try {
    const snapshot = await adminDb
      .collection("boards")
      .where("userId", "==", userId)
      .get()

    const boards = snapshot.docs.map((doc: any) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title || "",
        description: data.description || "",
        coverImage: data.coverImage || null,
        isPrivate: data.isPrivate || false,
        itemCount: data.items?.length || 0,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      }
    })

    return { success: true, boards }
  } catch (error) {
    console.error("[v0] Error getting boards:", error)
    return { success: false, error: "Failed to load boards", boards: [] }
  }
}

// Get a single board by ID with its items
export async function getBoardById(boardId: string) {
  const userId = await getCurrentUser()
  if (!userId) redirect("/sign-in")

  try {
    const boardDoc = await adminDb.collection("boards").doc(boardId).get()

    if (!boardDoc.exists) {
      return { success: false, error: "Board not found", board: null }
    }

    const boardData = boardDoc.data()

    if (boardData?.userId !== userId) {
      return { success: false, error: "Access denied", board: null }
    }

    // Fetch board items
    const itemsSnapshot = await adminDb
      .collection("boardItems")
      .where("boardId", "==", boardId)
      .get()

    const items = itemsSnapshot.docs.map((doc: any) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title || "",
        description: data.description || "",
        type: data.type || "",
        tags: data.tags || [],
        thumbnail: data.thumbnail || null,
        source: data.source || "",
        addedAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      }
    })

    return {
      success: true,
      board: {
        id: boardDoc.id,
        title: boardData.title || "",
        description: boardData.description || "",
        coverImage: boardData.coverImage || null,
        isPrivate: boardData.isPrivate || false,
        createdAt: boardData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: boardData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        items,
      },
    }
  } catch (error) {
    console.error("[v0] Error getting board:", error)
    return { success: false, error: "Failed to load board", board: null }
  }
}

// Create a new board
export async function createBoard(formData: FormData) {
  const userId = await getCurrentUser()

  if (!userId) {
    redirect("/sign-in")
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const isPrivate = formData.get("isPrivate") === "true"

  if (!title) {
    return { success: false, error: "Title is required" }
  }

  try {
    const boardRef = adminDb.collection("boards").doc()

    await boardRef.set({
      title,
      description: description || "",
      isPrivate,
      userId,
      coverImage: (formData.get("coverImage") as string) || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    })

    revalidatePath("/boards")
    return { success: true, id: boardRef.id }
  } catch (error) {
    console.error("Error creating board:", error)
    return { success: false, error: "Failed to create board" }
  }
}

// Update an existing board
export async function updateBoard(boardId: string, formData: FormData) {
  const userId = await getCurrentUser()

  if (!userId) {
    redirect("/sign-in")
  }

  try {
    // First, verify the user owns this board
    const boardDoc = await adminDb.collection("boards").doc(boardId).get()

    if (!boardDoc.exists) {
      return { success: false, error: "Board not found" }
    }

    const boardData = boardDoc.data()

    if (boardData?.userId !== userId) {
      return { success: false, error: "You don't have permission to update this board" }
    }

    // Update the board
    await adminDb
      .collection("boards")
      .doc(boardId)
      .update({
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || "",
        isPrivate: formData.get("isPrivate") === "true",
        coverImage: (formData.get("coverImage") as string) || boardData.coverImage,
        updatedAt: new Date(),
      })

    revalidatePath(`/boards/${boardId}`)
    revalidatePath("/boards")
    return { success: true }
  } catch (error) {
    console.error("Error updating board:", error)
    return { success: false, error: "Failed to update board" }
  }
}

// Delete a board
export async function deleteBoard(boardId: string) {
  const userId = await getCurrentUser()

  if (!userId) {
    redirect("/sign-in")
  }

  try {
    // First, verify the user owns this board
    const boardDoc = await adminDb.collection("boards").doc(boardId).get()

    if (!boardDoc.exists) {
      return { success: false, error: "Board not found" }
    }

    const boardData = boardDoc.data()

    if (boardData?.userId !== userId) {
      return { success: false, error: "You don't have permission to delete this board" }
    }

    // Delete the board
    await adminDb.collection("boards").doc(boardId).delete()

    revalidatePath("/boards")
    return { success: true }
  } catch (error) {
    console.error("Error deleting board:", error)
    return { success: false, error: "Failed to delete board" }
  }
}

// Add an item to a board
export async function addItemToBoard(boardId: string, formData: FormData) {
  const userId = await getCurrentUser()

  if (!userId) {
    redirect("/sign-in")
  }

  try {
    // First, verify the user owns this board
    const boardDoc = await adminDb.collection("boards").doc(boardId).get()

    if (!boardDoc.exists) {
      return { success: false, error: "Board not found" }
    }

    const boardData = boardDoc.data()

    if (boardData?.userId !== userId) {
      return { success: false, error: "You don't have permission to update this board" }
    }

    // Create a new item
    const itemRef = adminDb.collection("boardItems").doc()

    await itemRef.set({
      boardId,
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || "",
      type: formData.get("type") as string,
      tags: (formData.get("tags") as string).split(",").map((tag) => tag.trim()),
      source: (formData.get("source") as string) || "",
      thumbnail: (formData.get("thumbnail") as string) || null,
      userId,
      createdAt: new Date(),
    })

    // Update the board with the new item reference
    await adminDb
      .collection("boards")
      .doc(boardId)
      .update({
        items: adminDb.FieldValue.arrayUnion(itemRef.id),
        updatedAt: new Date(),
      })

    revalidatePath(`/boards/${boardId}`)
    return { success: true, id: itemRef.id }
  } catch (error) {
    console.error("Error adding item to board:", error)
    return { success: false, error: "Failed to add item to board" }
  }
}
