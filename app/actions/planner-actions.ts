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

// Create a new lesson
export async function createLesson(formData: FormData) {
  const userId = await getCurrentUser()

  if (!userId) {
    redirect("/sign-in")
  }

  const title = formData.get("title") as string
  const subject = formData.get("subject") as string
  const date = formData.get("date") as string
  const time = formData.get("time") as string

  if (!title || !subject || !date) {
    return { success: false, error: "Title, subject, and date are required" }
  }

  try {
    // Combine date and time
    const dateTime = time ? new Date(`${date}T${time}`) : new Date(date)

    const lessonRef = adminDb.collection("lessons").doc()

    await lessonRef.set({
      title,
      subject,
      date: dateTime,
      duration: Number.parseInt(formData.get("duration") as string) || 60,
      description: (formData.get("description") as string) || "",
      materials: formData.get("materials") ? (formData.get("materials") as string).split("\n") : [],
      completed: false,
      userId,
      createdAt: new Date(),
    })

    revalidatePath("/planner")
    return { success: true, id: lessonRef.id }
  } catch (error) {
    console.error("Error creating lesson:", error)
    return { success: false, error: "Failed to create lesson" }
  }
}

// Update a lesson
export async function updateLesson(lessonId: string, formData: FormData) {
  const userId = await getCurrentUser()

  if (!userId) {
    redirect("/sign-in")
  }

  try {
    // First, verify the user owns this lesson
    const lessonDoc = await adminDb.collection("lessons").doc(lessonId).get()

    if (!lessonDoc.exists) {
      return { success: false, error: "Lesson not found" }
    }

    const lessonData = lessonDoc.data()

    if (lessonData?.userId !== userId) {
      return { success: false, error: "You don't have permission to update this lesson" }
    }

    // Combine date and time if provided
    let dateTime = lessonData.date

    const date = formData.get("date") as string
    const time = formData.get("time") as string

    if (date) {
      dateTime = time ? new Date(`${date}T${time}`) : new Date(date)
    }

    // Update the lesson
    await adminDb
      .collection("lessons")
      .doc(lessonId)
      .update({
        title: (formData.get("title") as string) || lessonData.title,
        subject: (formData.get("subject") as string) || lessonData.subject,
        date: dateTime,
        duration: Number.parseInt(formData.get("duration") as string) || lessonData.duration,
        description: (formData.get("description") as string) || lessonData.description,
        materials: formData.get("materials") ? (formData.get("materials") as string).split("\n") : lessonData.materials,
        completed: formData.get("completed") === "true" || lessonData.completed,
        updatedAt: new Date(),
      })

    revalidatePath("/planner")
    return { success: true }
  } catch (error) {
    console.error("Error updating lesson:", error)
    return { success: false, error: "Failed to update lesson" }
  }
}

// Delete a lesson
export async function deleteLesson(lessonId: string) {
  const userId = await getCurrentUser()

  if (!userId) {
    redirect("/sign-in")
  }

  try {
    // First, verify the user owns this lesson
    const lessonDoc = await adminDb.collection("lessons").doc(lessonId).get()

    if (!lessonDoc.exists) {
      return { success: false, error: "Lesson not found" }
    }

    const lessonData = lessonDoc.data()

    if (lessonData?.userId !== userId) {
      return { success: false, error: "You don't have permission to delete this lesson" }
    }

    // Delete the lesson
    await adminDb.collection("lessons").doc(lessonId).delete()

    revalidatePath("/planner")
    return { success: true }
  } catch (error) {
    console.error("Error deleting lesson:", error)
    return { success: false, error: "Failed to delete lesson" }
  }
}

// Toggle lesson completion status
export async function toggleLessonCompletion(lessonId: string) {
  const userId = await getCurrentUser()

  if (!userId) {
    redirect("/sign-in")
  }

  try {
    // First, verify the user owns this lesson
    const lessonDoc = await adminDb.collection("lessons").doc(lessonId).get()

    if (!lessonDoc.exists) {
      return { success: false, error: "Lesson not found" }
    }

    const lessonData = lessonDoc.data()

    if (lessonData?.userId !== userId) {
      return { success: false, error: "You don't have permission to update this lesson" }
    }

    // Toggle completion status
    await adminDb.collection("lessons").doc(lessonId).update({
      completed: !lessonData.completed,
      updatedAt: new Date(),
    })

    revalidatePath("/planner")
    return { success: true, completed: !lessonData.completed }
  } catch (error) {
    console.error("Error toggling lesson completion:", error)
    return { success: false, error: "Failed to update lesson" }
  }
}
