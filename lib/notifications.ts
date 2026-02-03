import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  deleteDoc,
  writeBatch,
} from "firebase/firestore"
import { db } from "./firebase"

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  link?: string
  read: boolean
  createdAt: any
}

// Create a new notification
export async function createNotification(notification: Omit<Notification, "id" | "createdAt" | "read">) {
  if (!db) {
    console.warn("Firestore not available, cannot create notification")
    return { success: false, error: "Database not available" }
  }

  try {
    const docRef = await addDoc(collection(db, "notifications"), {
      ...notification,
      read: false,
      createdAt: serverTimestamp(),
    })

    return { id: docRef.id, success: true }
  } catch (error) {
    console.error("Error creating notification:", error)
    return { success: false, error }
  }
}

// Get all notifications for a user
export async function getUserNotifications(userId: string) {
  if (!db) {
    console.warn("Firestore not available, cannot get notifications")
    return { notifications: [], success: false, error: "Database not available" }
  }

  try {
    const q = query(collection(db, "notifications"), where("userId", "==", userId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)
    const notifications: Notification[] = []

    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
      } as Notification)
    })

    return { notifications, success: true }
  } catch (error) {
    console.error("Error getting notifications:", error)
    return { notifications: [], success: false, error }
  }
}

// Mark a notification as read
export async function markNotificationAsRead(notificationId: string) {
  if (!db) {
    console.warn("Firestore not available, cannot mark notification as read")
    return { success: false, error: "Database not available" }
  }

  try {
    const notificationRef = doc(db, "notifications", notificationId)
    await updateDoc(notificationRef, {
      read: true,
    })

    return { success: true }
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return { success: false, error }
  }
}

// Mark all notifications as read for a user
export async function markAllNotificationsAsRead(userId: string) {
  if (!db) {
    console.warn("Firestore not available, cannot mark all notifications as read")
    return { success: false, error: "Database not available" }
  }

  try {
    const q = query(collection(db, "notifications"), where("userId", "==", userId), where("read", "==", false))

    const querySnapshot = await getDocs(q)
    const batch = writeBatch(db)

    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, { read: true })
    })

    await batch.commit()

    return { success: true }
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return { success: false, error }
  }
}

// Delete a notification
export async function deleteNotification(notificationId: string) {
  if (!db) {
    console.warn("Firestore not available, cannot delete notification")
    return { success: false, error: "Database not available" }
  }

  try {
    await deleteDoc(doc(db, "notifications", notificationId))
    return { success: true }
  } catch (error) {
    console.error("Error deleting notification:", error)
    return { success: false, error }
  }
}

// Delete all notifications for a user
export async function deleteAllNotifications(userId: string) {
  if (!db) {
    console.warn("Firestore not available, cannot delete all notifications")
    return { success: false, error: "Database not available" }
  }

  try {
    const q = query(collection(db, "notifications"), where("userId", "==", userId))

    const querySnapshot = await getDocs(q)
    const batch = writeBatch(db)

    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()

    return { success: true }
  } catch (error) {
    console.error("Error deleting all notifications:", error)
    return { success: false, error }
  }
}
