import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "./firebase"

// Interface for tracking login attempts
interface LoginAttempts {
  count: number
  firstAttempt: Date
  lastAttempt: Date
}

// Map to store login attempts in memory (IP-based)
const loginAttemptsMap = new Map<string, LoginAttempts>()

// Check if user is being rate limited
export async function checkRateLimit(identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): Promise<boolean> {
  // Get current attempts
  const now = new Date()
  const attempts = loginAttemptsMap.get(identifier) || { count: 0, firstAttempt: now, lastAttempt: now }

  // Check if window has expired
  if (now.getTime() - attempts.firstAttempt.getTime() > windowMs) {
    // Reset if window expired
    loginAttemptsMap.set(identifier, { count: 1, firstAttempt: now, lastAttempt: now })
    return false
  }

  // Increment attempts
  attempts.count++
  attempts.lastAttempt = now
  loginAttemptsMap.set(identifier, attempts)

  // Check if rate limited
  return attempts.count > maxAttempts
}

// Track failed login for a user
export async function trackFailedLogin(userId: string): Promise<number> {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      const userData = userDoc.data()
      const failedAttempts = (userData.failedLoginAttempts || 0) + 1

      await setDoc(
        userRef,
        {
          failedLoginAttempts: failedAttempts,
          lastFailedLogin: serverTimestamp(),
        },
        { merge: true },
      )

      return failedAttempts
    }

    return 0
  } catch (error) {
    console.error("Error tracking failed login:", error)
    return 0
  }
}

// Reset failed login count
export async function resetFailedLogins(userId: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)
    await setDoc(
      userRef,
      {
        failedLoginAttempts: 0,
      },
      { merge: true },
    )
  } catch (error) {
    console.error("Error resetting failed logins:", error)
  }
}

// Check if account should be temporarily locked
export async function isAccountLocked(userId: string): Promise<boolean> {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      const userData = userDoc.data()
      const failedAttempts = userData.failedLoginAttempts || 0
      const lastFailedLogin = userData.lastFailedLogin?.toDate() || new Date(0)

      // Lock account after 5 failed attempts for 15 minutes
      if (failedAttempts >= 5) {
        const lockoutDuration = 15 * 60 * 1000 // 15 minutes
        const now = new Date()

        if (now.getTime() - lastFailedLogin.getTime() < lockoutDuration) {
          return true
        } else {
          // Reset counter if lockout period has passed
          await resetFailedLogins(userId)
          return false
        }
      }
    }

    return false
  } catch (error) {
    console.error("Error checking account lock:", error)
    return false
  }
}
