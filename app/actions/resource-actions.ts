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

// Get all resources (public, no auth required)
export async function getResources(filters?: {
  search?: string
  type?: string
  tags?: string[]
  sortBy?: string
}) {
  try {
    let query: any = adminDb.collection("resources")

    if (filters?.type) {
      query = query.where("type", "==", filters.type)
    }

    const snapshot = await query.get()

    const resources = snapshot.docs.map((doc: any) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title || "",
        description: data.description || "",
        type: data.type || "",
        tags: data.tags || [],
        author: data.author || "",
        rating: data.rating || 0,
        ratingCount: data.ratingCount || 0,
        downloads: data.downloads || 0,
        thumbnail: data.thumbnail || null,
        isPremium: data.isPremium || false,
        isFeatured: data.isFeatured || false,
        dateAdded: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      }
    })

    // Client-side search filtering (Firestore doesn't support full-text search)
    let filtered = resources
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      filtered = filtered.filter(
        (r: any) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      )
    }

    // Sort
    if (filters?.sortBy === "newest") {
      filtered.sort((a: any, b: any) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    } else if (filters?.sortBy === "popular") {
      filtered.sort((a: any, b: any) => b.downloads - a.downloads)
    } else if (filters?.sortBy === "rating") {
      filtered.sort((a: any, b: any) => b.rating - a.rating)
    }

    return { success: true, resources: filtered }
  } catch (error) {
    console.error("[v0] Error getting resources:", error)
    return { success: false, error: "Failed to load resources", resources: [] }
  }
}

// Get saved resources for the current user
export async function getSavedResources() {
  try {
    const user = await getOptionalUser()
    if (!user) return { success: true, resources: [] }

    const snapshot = await adminDb
      .collection("savedResources")
      .where("userId", "==", user.userId)
      .get()

    const savedIds = snapshot.docs.map((doc: any) => doc.data().resourceId)
    return { success: true, savedIds }
  } catch (error) {
    console.error("[v0] Error getting saved resources:", error)
    return { success: false, savedIds: [] }
  }
}

// Save/unsave a resource
export async function toggleSaveResource(resourceId: string) {
  const userId = await getCurrentUser()
  if (!userId) redirect("/sign-in")

  try {
    const ref = adminDb.collection("savedResources").doc(`${userId}_${resourceId}`)
    const doc = await ref.get()

    if (doc.exists) {
      await ref.delete()
      return { success: true, saved: false }
    } else {
      await ref.set({ userId, resourceId, savedAt: new Date() })
      return { success: true, saved: true }
    }
  } catch (error) {
    console.error("[v0] Error toggling save:", error)
    return { success: false, error: "Failed to save resource" }
  }
}

// Create a new resource
export async function createResource(formData: FormData) {
  const userId = await getCurrentUser()

  if (!userId) {
    redirect("/sign-in")
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const type = formData.get("type") as string
  const tagsString = formData.get("tags") as string

  if (!title || !type) {
    return { success: false, error: "Title and type are required" }
  }

  try {
    const resourceRef = adminDb.collection("resources").doc()

    await resourceRef.set({
      title,
      description: description || "",
      type,
      tags: tagsString ? tagsString.split(",").map((tag) => tag.trim()) : [],
      author: (formData.get("author") as string) || "",
      thumbnail: (formData.get("thumbnail") as string) || null,
      isPremium: formData.get("isPremium") === "true",
      isFeatured: false, // Only admins can set this
      userId,
      downloads: 0,
      rating: 0,
      ratingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    revalidatePath("/resources")
    return { success: true, id: resourceRef.id }
  } catch (error) {
    console.error("Error creating resource:", error)
    return { success: false, error: "Failed to create resource" }
  }
}

// Update an existing resource
export async function updateResource(resourceId: string, formData: FormData) {
  const userId = await getCurrentUser()

  if (!userId) {
    redirect("/sign-in")
  }

  try {
    // First, verify the user owns this resource
    const resourceDoc = await adminDb.collection("resources").doc(resourceId).get()

    if (!resourceDoc.exists) {
      return { success: false, error: "Resource not found" }
    }

    const resourceData = resourceDoc.data()

    if (resourceData?.userId !== userId) {
      return { success: false, error: "You don't have permission to update this resource" }
    }

    // Update the resource
    await adminDb
      .collection("resources")
      .doc(resourceId)
      .update({
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || resourceData.description,
        type: (formData.get("type") as string) || resourceData.type,
        tags: formData.get("tags")
          ? (formData.get("tags") as string).split(",").map((tag) => tag.trim())
          : resourceData.tags,
        author: (formData.get("author") as string) || resourceData.author,
        thumbnail: (formData.get("thumbnail") as string) || resourceData.thumbnail,
        isPremium: formData.get("isPremium") === "true",
        updatedAt: new Date(),
      })

    revalidatePath(`/resources/${resourceId}`)
    revalidatePath("/resources")
    return { success: true }
  } catch (error) {
    console.error("Error updating resource:", error)
    return { success: false, error: "Failed to update resource" }
  }
}

// Delete a resource
export async function deleteResource(resourceId: string) {
  const userId = await getCurrentUser()

  if (!userId) {
    redirect("/sign-in")
  }

  try {
    // First, verify the user owns this resource
    const resourceDoc = await adminDb.collection("resources").doc(resourceId).get()

    if (!resourceDoc.exists) {
      return { success: false, error: "Resource not found" }
    }

    const resourceData = resourceDoc.data()

    if (resourceData?.userId !== userId) {
      return { success: false, error: "You don't have permission to delete this resource" }
    }

    // Delete the resource
    await adminDb.collection("resources").doc(resourceId).delete()

    revalidatePath("/resources")
    return { success: true }
  } catch (error) {
    console.error("Error deleting resource:", error)
    return { success: false, error: "Failed to delete resource" }
  }
}

// Rate a resource
export async function rateResource(resourceId: string, rating: number) {
  const userId = await getCurrentUser()

  if (!userId) {
    redirect("/sign-in")
  }

  if (rating < 1 || rating > 5) {
    return { success: false, error: "Rating must be between 1 and 5" }
  }

  try {
    // Check if user has already rated this resource
    const ratingRef = adminDb.collection("ratings").doc(`${resourceId}_${userId}`)
    const ratingDoc = await ratingRef.get()

    const resourceRef = adminDb.collection("resources").doc(resourceId)
    const resourceDoc = await resourceRef.get()

    if (!resourceDoc.exists) {
      return { success: false, error: "Resource not found" }
    }

    const resourceData = resourceDoc.data()

    if (ratingDoc.exists) {
      // Update existing rating
      const oldRating = ratingDoc.data()?.rating || 0

      // Update the rating document
      await ratingRef.update({
        rating,
        updatedAt: new Date(),
      })

      // Update the resource's average rating
      const newRatingTotal = resourceData.rating * resourceData.ratingCount - oldRating + rating
      const newRatingAvg = newRatingTotal / resourceData.ratingCount

      await resourceRef.update({
        rating: newRatingAvg,
      })
    } else {
      // Create new rating
      await ratingRef.set({
        userId,
        resourceId,
        rating,
        createdAt: new Date(),
      })

      // Update the resource's average rating
      const newRatingCount = (resourceData.ratingCount || 0) + 1
      const newRatingTotal = (resourceData.rating || 0) * (resourceData.ratingCount || 0) + rating
      const newRatingAvg = newRatingTotal / newRatingCount

      await resourceRef.update({
        rating: newRatingAvg,
        ratingCount: newRatingCount,
      })
    }

    revalidatePath(`/resources/${resourceId}`)
    return { success: true }
  } catch (error) {
    console.error("Error rating resource:", error)
    return { success: false, error: "Failed to rate resource" }
  }
}
