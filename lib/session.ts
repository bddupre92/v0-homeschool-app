import { auth } from "./firebase"
import { onAuthStateChanged, getIdToken } from "firebase/auth"

// Session timeout in milliseconds (default: 1 hour)
const SESSION_TIMEOUT = 60 * 60 * 1000

// Last activity timestamp
let lastActivity = Date.now()

// Update last activity timestamp
export function updateActivity() {
  lastActivity = Date.now()
}

// Check if session is expired
export function isSessionExpired(): boolean {
  return Date.now() - lastActivity > SESSION_TIMEOUT
}

// Initialize session tracking
export function initSessionTracking() {
  if (typeof window !== "undefined") {
    // Update activity on user interactions
    window.addEventListener("click", updateActivity)
    window.addEventListener("keypress", updateActivity)
    window.addEventListener("scroll", updateActivity)
    window.addEventListener("mousemove", updateActivity)

    // Set initial activity
    updateActivity()

    // Check session status periodically
    setInterval(() => {
      if (isSessionExpired()) {
        // Force token refresh or sign out if session expired
        const user = auth.currentUser
        if (user) {
          getIdToken(user, true).catch(() => {
            // If token refresh fails, sign out
            auth.signOut()
          })
        }
      }
    }, 60 * 1000) // Check every minute
  }
}

// Get current auth token with automatic refresh
export async function getCurrentToken(): Promise<string | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe()
      if (user) {
        try {
          const token = await getIdToken(user, true)
          resolve(token)
        } catch (error) {
          console.error("Error getting token:", error)
          resolve(null)
        }
      } else {
        resolve(null)
      }
    })
  })
}

// Set up auth state persistence
export function setupAuthPersistence() {
  if (typeof window !== "undefined") {
    // Store auth state in session storage
    onAuthStateChanged(auth, (user) => {
      if (user) {
        sessionStorage.setItem(
          "authUser",
          JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified,
          }),
        )
      } else {
        sessionStorage.removeItem("authUser")
      }
    })
  }
}
