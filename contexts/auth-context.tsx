"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  type AuthError,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useRouter } from "next/navigation"

// Development mode bypass - set to false for production
const DEV_MODE_BYPASS_AUTH = false

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signInWithGoogle: (rememberMe?: boolean) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  updateUserProfile: async () => {},
})

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Google Auth Provider
  const googleProvider = new GoogleAuthProvider()
  googleProvider.addScope("email")
  googleProvider.addScope("profile")

  useEffect(() => {
    if (DEV_MODE_BYPASS_AUTH) {
      // Create a mock user for development
      const mockUser = {
        uid: "dev-user-123",
        email: "dev@example.com",
        displayName: "Dev User",
        photoURL: null,
        emailVerified: true,
      } as User
      setUser(mockUser)
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Create or update user document in Firestore
        await createUserDocument(user)
        setUser(user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const createUserDocument = async (user: User) => {
    try {
      const userRef = doc(db, "users", user.uid)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          preferences: {
            grades: [],
            subjects: [],
            approaches: [],
            interests: [],
          },
          profile: {
            bio: "",
            location: "",
            website: "",
          },
        })
      } else {
        // Update existing user document
        await setDoc(
          userRef,
          {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        )
      }
    } catch (error) {
      console.error("Error creating/updating user document:", error)
    }
  }

  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      // Set persistence based on rememberMe
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)

      const result = await signInWithEmailAndPassword(auth, email, password)
      await createUserDocument(result.user)
    } catch (error) {
      const authError = error as AuthError
      throw new Error(getAuthErrorMessage(authError.code))
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)

      // Update the user's display name
      await updateProfile(result.user, { displayName })

      // Create user document in Firestore
      await createUserDocument(result.user)
    } catch (error) {
      const authError = error as AuthError
      throw new Error(getAuthErrorMessage(authError.code))
    }
  }

  const signInWithGoogle = async (rememberMe = false) => {
    try {
      // Set persistence based on rememberMe
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)

      const result = await signInWithPopup(auth, googleProvider)
      await createUserDocument(result.user)
    } catch (error) {
      const authError = error as AuthError

      // Handle popup blocked error
      if (authError.code === "auth/popup-blocked") {
        throw new Error("Popup was blocked by your browser. Please allow popups for this site and try again.")
      }

      // Handle popup closed error
      if (authError.code === "auth/popup-closed-by-user") {
        throw new Error("Sign-in was cancelled. Please try again.")
      }

      throw new Error(getAuthErrorMessage(authError.code))
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      throw new Error("Failed to sign out. Please try again.")
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      const authError = error as AuthError
      throw new Error(getAuthErrorMessage(authError.code))
    }
  }

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (!user) throw new Error("No user logged in")

    try {
      await updateProfile(user, { displayName, photoURL })

      // Update Firestore document
      const userRef = doc(db, "users", user.uid)
      await setDoc(
        userRef,
        {
          displayName,
          photoURL,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    } catch (error) {
      console.error("Error updating profile:", error)
      throw new Error("Failed to update profile. Please try again.")
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "auth/user-not-found":
      return "No account found with this email address."
    case "auth/wrong-password":
      return "Incorrect password. Please try again."
    case "auth/email-already-in-use":
      return "An account with this email already exists."
    case "auth/weak-password":
      return "Password should be at least 6 characters long."
    case "auth/invalid-email":
      return "Please enter a valid email address."
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support."
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later."
    case "auth/network-request-failed":
      return "Network error. Please check your connection and try again."
    case "auth/popup-blocked":
      return "Popup was blocked. Please allow popups and try again."
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled."
    case "auth/account-exists-with-different-credential":
      return "An account already exists with the same email but different sign-in credentials."
    default:
      return "An error occurred during authentication. Please try again."
  }
}
