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
  type User 
} from "firebase/auth"
import { auth, isFirebaseAvailable } from "@/lib/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

import { Loader2 } from "lucide-react"

// --- Configuration ---
// Set this to true to bypass Firebase auth and use a mock user for development.
const DEV_MODE_BYPASS_AUTH = true

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
  // Required User methods (can be stubs)
  delete: () => Promise.resolve(),
  getIdToken: () => Promise.resolve("mock-token"),
  getIdTokenResult: () => Promise.resolve({ token: "mock-token" } as any),
  reload: () => Promise.resolve(),
  toJSON: () => ({}),
  providerId: "password",
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
    // In dev mode, simulate successful signup
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

      // Update the user's display name
      await updateProfile(user, { displayName: name })

      // Create user document in Firestore
      if (db) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: name,
          emailVerified: user.emailVerified,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        })
      }
    } catch (error: any) {
      console.error("Sign up error:", error)
      throw error
    }
  }

  const signIn = async (email: string, password: string, rememberMe = false) => {
    // In dev mode, simulate successful signin
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
      // Set persistence based on remember me
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update last login time
      if (db) {
        await setDoc(doc(db, "users", user.uid), {
          lastLoginAt: serverTimestamp(),
        }, { merge: true })
      }
    } catch (error: any) {
      console.error("Sign in error:", error)
      throw error
    }
  }

  const signInWithGoogle = async (rememberMe = false) => {
    // In dev mode, simulate successful Google signin
    if (DEV_MODE_BYPASS_AUTH) {
      console.log("Dev mode: Simulating successful Google signin")
      return
    }

    if (!isFirebaseAvailable() || !auth) {
      throw new Error("Firebase is not available. Please check your configuration.")
    }

    try {
      // Set persistence based on remember me
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
      
      const provider = new GoogleAuthProvider()
      provider.addScope('email')
      provider.addScope('profile')
      
      const userCredential = await signInWithPopup(auth, provider)
      const user = userCredential.user

      // Create or update user document in Firestore
      if (db) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          lastLoginAt: serverTimestamp(),
        }, { merge: true })
      }
    } catch (error: any) {
      console.error("Google sign in error:", error)
      throw error
    }
  }

  const signOut = async () => {
    // In dev mode, simulate successful signout
    if (DEV_MODE_BYPASS_AUTH) {
      console.log("Dev mode: Simulating successful signout")
      return
    }

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
    // In dev mode, simulate successful password reset
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
    // In dev mode, simulate successful profile update
    if (DEV_MODE_BYPASS_AUTH) {
      console.log("Dev mode: Simulating successful profile update", updates)
      return
    }

    if (!isFirebaseAvailable() || !auth || !auth.currentUser) {
      throw new Error("No authenticated user found.")
    }

    try {
      await updateProfile(auth.currentUser, updates)
      
      // Update user document in Firestore
      if (db) {
        await setDoc(doc(db, "users", auth.currentUser.uid), updates, { merge: true })
      }
    } catch (error: any) {
      console.error("Profile update error:", error)
      throw error
    }
  }

  useEffect(() => {
    // Skip useEffect entirely in dev mode since we set initial state
    if (DEV_MODE_BYPASS_AUTH) {
      console.log("Dev mode: Skipping Firebase auth setup")
      return
    }

    // If auth service is not available, stop loading and proceed without a user.
    if (!isFirebaseAvailable() || !auth) {
      console.warn("Firebase auth not available, proceeding without authentication")
      setLoading(false)
      return
    }

    // Additional safety check - ensure auth is not null before calling onAuthStateChanged
    if (auth === null) {
      console.warn("Auth object is null, cannot set up auth state listener")
      setLoading(false)
      return
    }

    // Listen for real authentication state changes
    try {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser)
        setLoading(false)
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

  // Display a full-page loader while checking auth state
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
