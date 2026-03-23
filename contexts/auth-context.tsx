"use client"

import React, { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  getIdToken,
  type User
} from "firebase/auth"
import { auth, isFirebaseAvailable } from "@/lib/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

import { Loader2 } from "lucide-react"

// --- Configuration ---
// Set this to false to enable real Firebase authentication.
const DEV_MODE_BYPASS_AUTH = false

const mockUser: User = {
  uid: "dev-user-uid",
  email: "dev@atozfamily.org",
  displayName: "Developer User",
  emailVerified: true,
  isAnonymous: false,
  photoURL: `https://api.dicebear.com/8.x/initials/svg?seed=Developer`,
  providerData: [],
  metadata: {},
  refreshToken: "mock-refresh-token",
  tenantId: null,
  phoneNumber: null,
  delete: () => Promise.resolve(),
  getIdToken: () => Promise.resolve("mock-token"),
  getIdTokenResult: () => Promise.resolve({ token: "mock-token" } as any),
  reload: () => Promise.resolve(),
  toJSON: () => ({}),
  providerId: "password",
}

/**
 * Creates a server-side session cookie by sending the Firebase ID token
 * to our session API route.
 */
async function createSessionCookie(user: User): Promise<void> {
  try {
    const idToken = await getIdToken(user, true)
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    })
    if (!response.ok) {
      console.error("Failed to create session cookie:", response.status)
    }
  } catch (error) {
    console.error("Error creating session cookie:", error)
  }
}

/**
 * Clears the server-side session cookie.
 */
async function clearSessionCookie(): Promise<void> {
  try {
    await fetch("/api/auth/session", { method: "DELETE" })
  } catch (error) {
    console.error("Error clearing session cookie:", error)
  }
}

// --- Context Definition ---
interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  signInWithGoogle: (rememberMe?: boolean) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updateUserProfile: async () => {},
})

// --- Provider Component ---
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(DEV_MODE_BYPASS_AUTH ? mockUser : null)
  const [loading, setLoading] = useState(!DEV_MODE_BYPASS_AUTH)

  // Authentication methods
  const signUp = async (email: string, password: string, name: string) => {
    if (DEV_MODE_BYPASS_AUTH) {
      console.log("Dev mode: Simulating successful signup for", email)
      return
    }

    if (!isFirebaseAvailable() || !auth || auth === null) {
      throw new Error("Firebase is not available. Please check your configuration.")
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await updateProfile(user, { displayName: name })

      // Fire-and-forget: session cookie and Firestore write should not block sign-up
      createSessionCookie(user).catch(err => console.error("Session cookie error:", err))

      if (db) {
        setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: name,
          emailVerified: user.emailVerified,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        }).catch(err => console.error("Firestore user doc error:", err))
      }
    } catch (error: any) {
      console.error("Sign up error:", error)
      throw error
    }
  }

  const signIn = async (email: string, password: string, rememberMe = false) => {
    if (DEV_MODE_BYPASS_AUTH) {
      console.log("Dev mode: Simulating successful signin for", email)
      return
    }

    if (!isFirebaseAvailable() || !auth) {
      throw new Error("Firebase is not available. Please check your configuration.")
    }

    if (auth === null) {
      throw new Error("Authentication service is not initialized.")
    }

    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Fire-and-forget: don't block sign-in on session cookie or Firestore
      createSessionCookie(user).catch(err => console.error("Session cookie error:", err))

      if (db) {
        setDoc(doc(db, "users", user.uid), {
          lastLoginAt: serverTimestamp(),
        }, { merge: true }).catch(err => console.error("Firestore update error:", err))
      }
    } catch (error: any) {
      console.error("Sign in error:", error)
      throw error
    }
  }

  const signInWithGoogle = async (rememberMe = false) => {
    if (DEV_MODE_BYPASS_AUTH) {
      console.log("Dev mode: Simulating successful Google signin")
      return
    }

    if (!isFirebaseAvailable() || !auth) {
      throw new Error("Firebase is not available. Please check your configuration.")
    }

    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)

      const provider = new GoogleAuthProvider()
      provider.addScope('email')
      provider.addScope('profile')

      const userCredential = await signInWithPopup(auth, provider)
      const user = userCredential.user

      // Fire-and-forget: don't block sign-in on session cookie or Firestore
      createSessionCookie(user).catch(err => console.error("Session cookie error:", err))

      if (db) {
        setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          lastLoginAt: serverTimestamp(),
        }, { merge: true }).catch(err => console.error("Firestore update error:", err))
      }
    } catch (error: any) {
      console.error("Google sign in error:", error)
      throw error
    }
  }

  const signOut = async () => {
    if (DEV_MODE_BYPASS_AUTH) {
      console.log("Dev mode: Simulating successful signout")
      return
    }

    // Clear session cookie first
    await clearSessionCookie()

    if (!isFirebaseAvailable() || !auth) {
      return
    }

    try {
      await firebaseSignOut(auth)
    } catch (error: any) {
      console.error("Sign out error:", error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    if (DEV_MODE_BYPASS_AUTH) {
      console.log("Dev mode: Simulating successful password reset for", email)
      return
    }

    if (!isFirebaseAvailable() || !auth) {
      throw new Error("Firebase is not available. Please check your configuration.")
    }

    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      console.error("Password reset error:", error)
      throw error
    }
  }

  const updateUserProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    if (DEV_MODE_BYPASS_AUTH) {
      console.log("Dev mode: Simulating successful profile update", updates)
      return
    }

    if (!isFirebaseAvailable() || !auth || !auth.currentUser) {
      throw new Error("No authenticated user found.")
    }

    try {
      await updateProfile(auth.currentUser, updates)

      if (db) {
        await setDoc(doc(db, "users", auth.currentUser.uid), updates, { merge: true })
      }
    } catch (error: any) {
      console.error("Profile update error:", error)
      throw error
    }
  }

  useEffect(() => {
    if (DEV_MODE_BYPASS_AUTH) {
      console.log("Dev mode: Skipping Firebase auth setup")
      return
    }

    if (!isFirebaseAvailable() || !auth) {
      console.warn("Firebase auth not available, proceeding without authentication")
      setLoading(false)
      return
    }

    if (auth === null) {
      console.warn("Auth object is null, cannot set up auth state listener")
      setLoading(false)
      return
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser)
        setLoading(false)

        // When auth state changes (e.g. page refresh with persisted session),
        // ensure the session cookie is up to date
        if (firebaseUser) {
          await createSessionCookie(firebaseUser)
        }
      })

      return () => unsubscribe()
    } catch (error) {
      console.error("Error setting up auth state listener:", error)
      setLoading(false)
    }
  }, [])

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateUserProfile
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// --- Hook for consuming context ---
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
