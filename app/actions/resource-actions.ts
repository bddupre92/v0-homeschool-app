"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { adminDb, adminAuth } from "@/lib/firebase-admin-safe"

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
