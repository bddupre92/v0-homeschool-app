import { cookies, headers } from "next/headers"
import { adminAuth } from "./firebase-admin-safe"

export interface AuthUser {
  userId: string
  email?: string
  emailVerified?: boolean
}

/**
 * Get the current user from the request
 * Checks both session cookie and Authorization header
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    // Check for session cookie first
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")?.value

    if (sessionCookie) {
      try {
        if (adminAuth && typeof adminAuth.verifySessionCookie === "function") {
          const decodedCookie = await adminAuth.verifySessionCookie(sessionCookie, true)
          return {
            userId: decodedCookie.uid,
            email: decodedCookie.email,
            emailVerified: decodedCookie.email_verified,
          }
        }
      } catch (error) {
        console.error("Session cookie verification failed:", error)
      }
    }

    // Check for Authorization header (Bearer token)
    const headersList = await headers()
    const authHeader = headersList.get("authorization")
    
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      try {
        if (adminAuth && typeof adminAuth.verifyIdToken === "function") {
          const decodedToken = await adminAuth.verifyIdToken(token)
          return {
            userId: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
          }
        }
      } catch (error) {
        console.error("ID token verification failed:", error)
      }
    }

    // In development mode, return a dev user if no auth is present
    if (process.env.NODE_ENV === "development") {
      return {
        userId: "dev-user-id",
        email: "dev@example.com",
        emailVerified: true,
      }
    }

    return null
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error("Authentication required")
  }
  
  return user
}
