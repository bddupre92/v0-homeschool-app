"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { adminDb, adminAuth } from "@/lib/firebase-admin"

// Get the current user from the session
async function getCurrentUser() {
  const sessionCookie = cookies().get("session")?.value

  if (!sessionCookie) {
    return null
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    return decodedClaims.uid
  } catch (error) {
    console.error("Error verifying session:", error)
    return null
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
