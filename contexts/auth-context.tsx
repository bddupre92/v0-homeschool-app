"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  type User,
  type UserCredential,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "../lib/firebase"

interface AuthContextProps {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<UserCredential>
  signUp: (email: string, password: string, displayName: string) => Promise<UserCredential>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<UserCredential>
  resetPassword: (email: string) => Promise<void>
  updateUserEmail: (email: string) => Promise<void>
  updateUserPassword: (password: string) => Promise<void>
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>
  isAdmin: () => boolean
  isModerator: () => boolean
}

interface UserProfile {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  bio?: string
  location?: string
  interests?: string[]
  createdAt?: any
  lastLogin?: any
  role?: "user" | "admin" | "moderator"
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Add a function to check if user has admin role
  const isAdmin = () => {
    return userProfile?.role === "admin"
  }

  // Add a function to check if user has moderator role
  const isModerator = () => {
    return userProfile?.role === "admin" || userProfile?.role === "moderator"
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        // Set a cookie to indicate the user is authenticated
        // This helps the middleware detect authentication
        document.cookie = "firebase-auth-token=true; path=/; max-age=3600; SameSite=Strict"

        // Fetch user profile from Firestore
        try {
          const userDocRef = doc(db, "users", user.uid)
          const userDoc = await getDoc(userDocRef)

          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile)
          } else {
            // Create a new user profile if it doesn't exist
            const newUserProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
            }

            await setDoc(userDocRef, newUserProfile)
            setUserProfile(newUserProfile)
          }

          // Update last login time
          await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true })
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      } else {
        // Clear the auth cookie when the user signs out
        document.cookie = "firebase-auth-token=; path=/; max-age=0; SameSite=Strict"
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(userCredential.user, { displayName })

    // Create user profile in Firestore
    const userDocRef = doc(db, "users", userCredential.user.uid)
    await setDoc(userDocRef, {
      uid: userCredential.user.uid,
      displayName,
      email,
      photoURL: null,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    })

    return userCredential
  }

  const signOut = async () => {
    // Clear the auth cookie when the user signs out
    document.cookie = "firebase-auth-token=; path=/; max-age=0; SameSite=Strict"
    return firebaseSignOut(auth)
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }

  const resetPassword = async (email: string) => {
    return sendPasswordResetEmail(auth, email)
  }

  const updateUserEmail = async (email: string) => {
    if (!user) throw new Error("No user logged in")
    await updateEmail(user, email)

    // Update Firestore
    const userDocRef = doc(db, "users", user.uid)
    await setDoc(userDocRef, { email }, { merge: true })
  }

  const updateUserPassword = async (password: string) => {
    if (!user) throw new Error("No user logged in")
    return updatePassword(user, password)
  }

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error("No user logged in")

    // Update Firebase Auth profile if name or photo is changed
    if (data.displayName || data.photoURL) {
      await updateProfile(user, {
        displayName: data.displayName || user.displayName,
        photoURL: data.photoURL || user.photoURL,
      })
    }

    // Update Firestore profile
    const userDocRef = doc(db, "users", user.uid)
    await setDoc(userDocRef, { ...data, updatedAt: serverTimestamp() }, { merge: true })

    // Update local state
    if (userProfile) {
      setUserProfile({ ...userProfile, ...data })
    }
  }

  const value: AuthContextProps = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
    updateUserEmail,
    updateUserPassword,
    updateUserProfile,
    isAdmin,
    isModerator,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
