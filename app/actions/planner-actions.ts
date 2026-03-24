"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { adminDb } from "@/lib/firebase-admin-safe"
import { requireAuth } from "@/lib/auth-middleware"
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

// Get lessons for the current user
export async function getLessons() {
  try {
    const userId = await getCurrentUser()

    if (!userId) {
      redirect("/sign-in")
    }

    const lessonsSnapshot = await adminDb
      .collection("lessons")
      .where("userId", "==", userId)
      .orderBy("date", "asc")
      .get()

    const lessons = lessonsSnapshot.docs.map((doc: any) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate?.()?.toISOString() || data.date,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      }
    })

    return { success: true, lessons }
  } catch (error) {
    console.error("[v0] Error getting lessons:", error)
    return { success: false, error: "Failed to load lessons", lessons: [] }
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

// Batch schedule lessons from AI advisor
export async function scheduleLessonsToPlanner(lessons: {
  title: string
  subject: string
  day: string
  time: string
  duration: number
  weekStart: string
  childName: string
  objectiveId?: string
  lessonPacketId?: string
  description?: string
  materials?: string[]
}[]) {
  const userId = await getCurrentUser()
  if (!userId) {
    redirect("/sign-in")
  }

  try {
    const dayMap: Record<string, number> = {
      Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
      Thursday: 4, Friday: 5, Saturday: 6,
    }

    // Map common AI-generated subject names to planner subject IDs
    const subjectMap: Record<string, string> = {
      "math": "math", "mathematics": "math",
      "science": "science", "stem": "science",
      "language arts": "language", "english": "language", "ela": "language", "reading": "language", "writing": "language",
      "history": "history", "social studies": "history",
      "art": "art", "arts": "art", "visual arts": "art",
      "music": "music",
      "physical education": "pe", "p.e.": "pe", "gym": "pe",
      "foreign language": "foreign", "spanish": "foreign", "french": "foreign",
    }
    const normalizeSubject = (s: string) => subjectMap[s.toLowerCase()] || s

    const batch = adminDb.batch()
    let count = 0

    for (const lesson of lessons) {
      // Find the Monday of the target week
      let weekRef = new Date(lesson.weekStart)
      if (isNaN(weekRef.getTime())) {
        // Default to next Monday
        const now = new Date()
        const dayOfWeek = now.getDay()
        const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7
        weekRef = new Date(now)
        weekRef.setDate(now.getDate() + daysUntilMonday)
      }
      weekRef.setHours(0, 0, 0, 0)

      // Normalize to Monday of the given week (so "Monday" always maps correctly)
      const refDay = weekRef.getDay() // 0=Sun ... 6=Sat
      const mondayOffset = refDay === 0 ? -6 : 1 - refDay // shift to Monday
      const monday = new Date(weekRef)
      monday.setDate(weekRef.getDate() + mondayOffset)

      // Calculate lesson date: Monday=0, Tuesday=1, ..., Friday=4, Saturday=5, Sunday=6
      const lessonDayIndex: Record<string, number> = {
        Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3,
        Friday: 4, Saturday: 5, Sunday: 6,
      }
      const lessonDate = new Date(monday)
      lessonDate.setDate(monday.getDate() + (lessonDayIndex[lesson.day] ?? 0))

      // Parse time like "9:00 AM"
      const timeParts = lesson.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
      if (timeParts) {
        let hours = parseInt(timeParts[1])
        const minutes = parseInt(timeParts[2])
        const period = timeParts[3]?.toUpperCase()
        if (period === "PM" && hours < 12) hours += 12
        if (period === "AM" && hours === 12) hours = 0
        lessonDate.setHours(hours, minutes, 0, 0)
      }

      const ref = adminDb.collection("lessons").doc()
      batch.set(ref, {
        title: lesson.title,
        subject: normalizeSubject(lesson.subject),
        date: lessonDate,
        duration: lesson.duration || 45,
        description: lesson.description || "",
        materials: lesson.materials || [],
        completed: false,
        userId,
        childName: lesson.childName,
        objectiveId: lesson.objectiveId || null,
        lessonPacketId: lesson.lessonPacketId || null,
        createdAt: new Date(),
        source: "ai_advisor",
      })
      count++
    }

    await batch.commit()
    revalidatePath("/planner")
    return { success: true, scheduledCount: count }
  } catch (error: any) {
    console.error("Error scheduling lessons:", error)
    const message = error?.message || "Failed to schedule lessons"
    return { success: false, error: message, scheduledCount: 0 }
  }
}

// Save a weekly schedule template
export async function saveScheduleTemplate(slots: {
  subject: string
  dayOfWeek: string
  time: string
  duration: number
}[]) {
  const userId = await getCurrentUser()
  if (!userId) {
    redirect("/sign-in")
  }

  try {
    const templateRef = adminDb.collection("schedule_templates").doc(userId)
    await templateRef.set({
      userId,
      slots,
      updatedAt: new Date(),
    })
    return { success: true }
  } catch (error) {
    console.error("Error saving schedule template:", error)
    return { success: false, error: "Failed to save template" }
  }
}

// Get the user's saved schedule template
export async function getScheduleTemplate() {
  const userId = await getCurrentUser()
  if (!userId) return null

  try {
    const doc = await adminDb.collection("schedule_templates").doc(userId).get()
    if (!doc.exists) return null
    return doc.data()?.slots || null
  } catch {
    return null
  }
}
