import { cookies, headers } from "next/headers"
import { adminAuth } from "./firebase-admin-safe"

export interface AuthUser {
  userId: string
  email?: string
  emailVerified?: boolean
}

/**
 * Sanitize error for logging - avoid exposing sensitive details
 */
function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    // Only log error name and a generic message, not full stack trace
    return `${error.name}: ${error.message.substring(0, 100)}`
  }
  return "Unknown error occurred"
}

/**
 * Log auth event for audit trail (structured logging)
 */
function logAuthEvent(event: string, details: Record<string, string | boolean | undefined>) {
  const timestamp = new Date().toISOString()
  const sanitizedDetails = Object.fromEntries(
    Object.entries(details).filter(([_, v]) => v !== undefined)
  )
  console.log(JSON.stringify({
    type: "AUTH_EVENT",
    event,
    timestamp,
    ...sanitizedDetails,
  }))
}

/**
 * Check if dev mode auth bypass is allowed
 * Only enable in development AND when explicitly allowed via env var
 */
function isDevAuthBypassAllowed(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.ALLOW_DEV_AUTH_BYPASS === "true" &&
    !process.env.VERCEL_ENV // Never allow on Vercel (including preview)
  )
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
          logAuthEvent("SESSION_VERIFIED", { userId: decodedCookie.uid, success: true })
          return {
            userId: decodedCookie.uid,
            email: decodedCookie.email,
            emailVerified: decodedCookie.email_verified,
          }
        }
      } catch (error) {
        logAuthEvent("SESSION_VERIFICATION_FAILED", { 
          success: false, 
          error: sanitizeError(error) 
        })
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
          logAuthEvent("TOKEN_VERIFIED", { userId: decodedToken.uid, success: true })
          return {
            userId: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
          }
        }
      } catch (error) {
        logAuthEvent("TOKEN_VERIFICATION_FAILED", { 
          success: false, 
          error: sanitizeError(error) 
        })
      }
    }

    // Dev mode auth bypass - only when explicitly allowed and not on Vercel
    if (isDevAuthBypassAllowed()) {
      logAuthEvent("DEV_AUTH_BYPASS", { userId: "dev-user-id", success: true })
      return {
        userId: "dev-user-id",
        email: "dev@example.com",
        emailVerified: true,
      }
    }

    logAuthEvent("NO_AUTH_FOUND", { success: false })
    return null
  } catch (error) {
    logAuthEvent("AUTH_ERROR", { success: false, error: sanitizeError(error) })
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
