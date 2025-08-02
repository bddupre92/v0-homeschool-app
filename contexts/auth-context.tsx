"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  sendEmailVerification,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Loader2 } from "lucide-react"

// --- Configuration ---
// Set this to false to use real Firebase auth
const DEV_MODE_BYPASS_AUTH = false

const mockUser: User = {
  uid: "dev-user-uid",
  email: "dev@atozfamily.org",
  displayName: "Developer User",
  emailVerified: true,
  isAnonymous: false,
  photoURL: `https://api.dicebear.com/8.x/initials/svg?seed=Developer`,
  providerData: [],
  metadata: {} as any,
  delete: () => Promise.resolve(),
  getIdToken: () => Promise.resolve("mock-token"),
  getIdTokenResult: () => Promise.resolve({ token: "mock-token" } as any),
  reload: () => Promise.resolve(),
  toJSON: () => ({}),
  providerId: "password",
  tenantId: null,
}

// --- Context Definition ---
interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signInWithGoogle: (rememberMe?: boolean) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
})

// --- Provider Component ---
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If dev mode is on, set mock user and finish loading immediately.
    if (DEV_MODE_BYPASS_AUTH) {
      setUser(mockUser)
      setLoading(false)
      return
    }

    // If auth service is not available (e.g., init failed), stop loading.
    if (!auth) {
      console.error("Firebase auth not initialized")
      setLoading(false)
      return
    }

    // Listen for real authentication state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser)
        setLoading(false)
      },
      (error) => {
        console.error("Auth state change error:", error)
        setLoading(false)
      },
    )

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  // Create user profile in Firestore
  const createUserProfile = async (user: User, additionalData?: any) => {
    if (!user) return

    const userRef = doc(db, "users", user.uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      const { displayName, email, photoURL } = user
      const createdAt = new Date()

      try {
        await setDoc(userRef, {
          displayName,
          email,
          photoURL,
          createdAt,
          ...additionalData,
        })
      } catch (error) {
        console.error("Error creating user profile:", error)
        throw error
      }
    }

    return userRef
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      // Set persistence based on rememberMe
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)

      const result = await signInWithEmailAndPassword(auth, email, password)
      await createUserProfile(result.user)
    } catch (error: any) {
      console.error("Sign in error:", error)
      throw error
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)

      // Update the user's display name
      await updateProfile(result.user, {
        displayName: name,
      })

      // Send email verification
      await sendEmailVerification(result.user)

      // Create user profile in Firestore
      await createUserProfile(result.user, {
        displayName: name,
      })
    } catch (error: any) {
      console.error("Sign up error:", error)
      throw error
    }
  }

  // Sign in with Google
  const signInWithGoogle = async (rememberMe = false) => {
    try {
      // Set persistence based on rememberMe
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)

      const provider = new GoogleAuthProvider()

      // Add additional scopes if needed
      provider.addScope("email")
      provider.addScope("profile")

      // Set custom parameters
      provider.setCustomParameters({
        prompt: "select_account",
      })

      const result = await signInWithPopup(auth, provider)

      // Create user profile in Firestore
      await createUserProfile(result.user)

      return result
    } catch (error: any) {
      console.error("Google sign in error:", error)
      throw error
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error: any) {
      console.error("Sign out error:", error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  }

  // Display a full-page loader while checking auth state
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="sr-only">Loading application...</p>
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
