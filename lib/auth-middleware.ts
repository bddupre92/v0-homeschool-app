import { cookies, headers } from "next/headers"
import { AuthenticationError, AuthorizationError } from "./errors"
import { adminAuth } from "./firebase-admin-safe"

export interface AuthContext {
  userId: string
  email: string | null
  emailVerified: boolean
}

/**
 * Get the current authenticated user from the request
 * This works for both API routes and server actions
 */
export async function getCurrentUser(): Promise<AuthContext> {
  try {
    // Get the session token from cookies
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")?.value

    if (!sessionCookie) {
      // Also check for Authorization header (for API routes)
      const headersList = await headers()
      const authHeader = headersList.get("authorization")

      if (!authHeader?.startsWith("Bearer ")) {
        throw new AuthenticationError("No authentication token provided")
      }

      const token = authHeader.substring(7)
      return await verifyIdToken(token)
    }

    // Verify the session cookie
    return await verifySessionCookie(sessionCookie)
  } catch (error) {
    console.error("[v0] Auth middleware error:", error)
    if (error instanceof AuthenticationError) {
      throw error
    }
    throw new AuthenticationError("Invalid or expired authentication token")
  }
}

/**
 * Verify Firebase ID token
 */
async function verifyIdToken(token: string): Promise<AuthContext> {
  try {
    if (!adminAuth || typeof adminAuth.verifyIdToken !== "function") {
      // In dev mode without Firebase, return dev user
      if (process.env.NODE_ENV === "development") {
        console.warn("Firebase Admin not available, using dev auth")
        return {
          userId: "dev-user-id",
          email: "dev@example.com",
          emailVerified: true,
        }
      }
      throw new AuthenticationError("Authentication service unavailable")
    }

    const decodedToken = await adminAuth.verifyIdToken(token)

    return {
      userId: decodedToken.uid,
      email: decodedToken.email || null,
      emailVerified: decodedToken.email_verified || false,
    }
  } catch (error) {
    console.error("[v0] Token verification error:", error)
    throw new AuthenticationError("Invalid authentication token")
  }
}

/**
 * Verify Firebase session cookie
 */
async function verifySessionCookie(sessionCookie: string): Promise<AuthContext> {
  try {
    if (!adminAuth || typeof adminAuth.verifySessionCookie !== "function") {
      // In dev mode without Firebase, return dev user
      if (process.env.NODE_ENV === "development") {
        console.warn("Firebase Admin not available, using dev auth")
        return {
          userId: "dev-user-id",
          email: "dev@example.com",
          emailVerified: true,
        }
      }
      throw new AuthenticationError("Authentication service unavailable")
    }

    const decodedCookie = await adminAuth.verifySessionCookie(sessionCookie, true)

    return {
      userId: decodedCookie.uid,
      email: decodedCookie.email || null,
      emailVerified: decodedCookie.email_verified || false,
    }
  } catch (error) {
    console.error("[v0] Session verification error:", error)
    throw new AuthenticationError("Invalid or expired session")
  }
}

/**
 * Require authenticated user - throws if not authenticated
 */
export async function requireAuth(): Promise<AuthContext> {
  return await getCurrentUser()
}

/**
 * Require specific user - throws if not the specified user
 */
export async function requireUser(userId: string): Promise<AuthContext> {
  const currentUser = await getCurrentUser()

  if (currentUser.userId !== userId) {
    throw new AuthorizationError("You can only access your own resources")
  }

  return currentUser
}

/**
 * Optional auth - returns user if authenticated, null otherwise
 */
export async function getOptionalUser(): Promise<AuthContext | null> {
  try {
    return await getCurrentUser()
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return null
    }
    throw error
  }
}
