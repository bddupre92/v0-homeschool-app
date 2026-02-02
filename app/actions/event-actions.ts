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

// Get all events (public, sorted by date)
export async function getEvents(filters?: { upcoming?: boolean; type?: string }) {
  try {
    let query = adminDb.collection("events").orderBy("date", "asc")

    // Filter for upcoming events only
    if (filters?.upcoming) {
      query = query.where("date", ">=", new Date()) as any
    }

    // Filter by event type
    if (filters?.type) {
      query = query.where("tags", "array-contains", filters.type) as any
    }

    const eventsSnapshot = await query.get()

    const events = eventsSnapshot.docs.map((doc: any) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate?.()?.toISOString() || data.date,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      }
    })

    return { success: true, events }
  } catch (error) {
    console.error("[v0] Error getting events:", error)
    return { success: false, error: "Failed to load events", events: [] }
  }
}

// Create a new event
export async function createEvent(formData: FormData) {
  const userId = await getCurrentUser()

  if (!userId) {
    redirect("/sign-in")
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const date = formData.get("date") as string
  const time = formData.get("time") as string
  const location = formData.get("location") as string

  if (!title || !date || !location) {
    return { success: false, error: "Title, date, and location are required" }
  }

  try {
    // Combine date and time
    const dateTime = time ? new Date(`${date}T${time}`) : new Date(date)

    const eventRef = adminDb.collection("events").doc()

    await eventRef.set({
      title,
      description: description || "",
      date: dateTime,
      time: time || "",
      location,
      isVirtual: formData.get("isVirtual") === "true",
      tags: formData.get("tags") ? (formData.get("tags") as string).split(",").map((tag) => tag.trim()) : [],
      image: (formData.get("image") as string) || null,
      organizer: {
        id: userId,
        name: (formData.get("organizerName") as string) || "Anonymous",
        avatar: (formData.get("organizerAvatar") as string) || null,
      },
      attendees: [userId],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    revalidatePath("/community")
    return { success: true, id: eventRef.id }
  } catch (error) {
    console.error("Error creating event:", error)
    return { success: false, error: "Failed to create event" }
  }
}

// Update an event
export async function updateEvent(eventId: string, formData: FormData) {
  const userId = await getCurrentUser()

  if (!userId) {
    redirect("/sign-in")
  }

  try {
    // First, verify the user is the organizer
    const eventDoc = await adminDb.collection("events").doc(eventId).get()

    if (!eventDoc.exists) {
      return { success: false, error: "Event not found" }
    }

    const eventData = eventDoc.data()

    if (eventData?.organizer?.id !== userId) {
      return { success: false, error: "You don't have permission to update this event" }
    }

    // Combine date and time if provided
    let dateTime = eventData.date

    const date = formData.get("date") as string
    const time = formData.get("time") as string

    if (date) {
      dateTime = time ? new Date(`${date}T${time}`) : new Date(date)
    }

    // Update the event
    await adminDb
      .collection("events")
      .doc(eventId)
      .update({
        title: (formData.get("title") as string) || eventData.title,
        description: (formData.get("description") as string) || eventData.description,
        date: dateTime,
        time: time || eventData.time,
        location: (formData.get("location") as string) || eventData.location,
        isVirtual: formData.get("isVirtual") === "true",
        tags: formData.get("tags")
          ? (formData.get("tags") as string).split(",").map((tag) => tag.trim())
          : eventData.tags,
        image: (formData.get("image") as string) || eventData.image,
        updatedAt: new Date(),
      })

    revalidatePath("/community")
    return { success: true }
  } catch (error) {
    console.error("Error updating event:", error)
    return { success: false, error: "Failed to update event" }
  }
}

// Delete an event
export async function deleteEvent(eventId: string) {
  const userId = await getCurrentUser()

  if (!userId) {
    redirect("/sign-in")
  }

  try {
    // First, verify the user is the organizer
    const eventDoc = await adminDb.collection("events").doc(eventId).get()

    if (!eventDoc.exists) {
      return { success: false, error: "Event not found" }
    }

    const eventData = eventDoc.data()

    if (eventData?.organizer?.id !== userId) {
      return { success: false, error: "You don't have permission to delete this event" }
    }

    // Delete the event
    await adminDb.collection("events").doc(eventId).delete()

    revalidatePath("/community")
    return { success: true }
  } catch (error) {
    console.error("Error deleting event:", error)
    return { success: false, error: "Failed to delete event" }
  }
}

// RSVP to an event
export async function rsvpToEvent(eventId: string, attending: boolean) {
  const userId = await getCurrentUser()

  if (!userId) {
    redirect("/sign-in")
  }

  try {
    const eventRef = adminDb.collection("events").doc(eventId)

    if (attending) {
      // Add user to attendees
      await eventRef.update({
        attendees: adminDb.FieldValue.arrayUnion(userId),
      })
    } else {
      // Remove user from attendees
      await eventRef.update({
        attendees: adminDb.FieldValue.arrayRemove(userId),
      })
    }

    revalidatePath("/community")
    return { success: true, attending }
  } catch (error) {
    console.error("Error updating RSVP:", error)
    return { success: false, error: "Failed to update RSVP" }
  }
}
