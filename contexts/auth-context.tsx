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
  sendEmailVerification as firebaseSendEmailVerification,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence as firebaseSetPersistence,
  type User,
  type UserCredential,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "../lib/firebase"

// --- DEVELOPMENT TOGGLE ---
// Set this to `false` to enable real Firebase authentication.
// When `true`, all auth checks are bypassed with a mock user.
const DEV_MODE_BYPASS_AUTH = true

interface AuthContextProps {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<UserCredential>
  signUp: (email: string, password: string, displayName: string) => Promise<UserCredential>
  signOut: () => Promise<void>
  signInWithGoogle: (rememberMe?: boolean) => Promise<UserCredential>
  resetPassword: (email: string) => Promise<void>
  updateUserEmail: (email: string) => Promise<void>
  updateUserPassword: (password: string) => Promise<void>
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>
  sendEmailVerification: () => Promise<void>
  isAdmin: () => boolean
  isModerator: () => boolean
  refreshToken: () => Promise<string | undefined>
  isEmailVerified: () => boolean
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
  failedLoginAttempts?: number
  lastFailedLogin?: any
}

// Mock user for development mode
const mockUser: User = {
  uid: "dev-user-uid",
  email: "dev@atozfamily.org",
  displayName: "Dev User",
  emailVerified: true,
  photoURL: null,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  providerId: "password",
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => "mock-token",
  getIdTokenResult: async () => ({
    token: "mock-token",
    claims: {},
    authTime: "",
    issuedAtTime: "",
    signInProvider: null,
    signInSecondFactor: null,
    expirationTime: "",
  }),
  reload: async () => {},
  toJSON: () => ({}),
}

const mockUserProfile: UserProfile = {
  uid: "dev-user-uid",
  displayName: "Dev User",
  email: "dev@atozfamily.org",
  photoURL: null,
  role: "admin", // Give admin role for full access during development
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(DEV_MODE_BYPASS_AUTH ? mockUser : null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(DEV_MODE_BYPASS_AUTH ? mockUserProfile : null)
  const [loading, setLoading] = useState(DEV_MODE_BYPASS_AUTH ? false : true)

  // Add a function to check if user has admin role
  const isAdmin = () => {
    if (DEV_MODE_BYPASS_AUTH) return true
    return userProfile?.role === "admin"
  }

  // Add a function to check if user has moderator role
  const isModerator = () => {
    if (DEV_MODE_BYPASS_AUTH) return true
    return userProfile?.role === "admin" || userProfile?.role === "moderator"
  }

  // Add a function to check if email is verified
  const isEmailVerified = () => {
    if (DEV_MODE_BYPASS_AUTH) return true
    return user?.emailVerified ?? false
  }

  // Add token refresh function
  const refreshToken = async () => {
    if (DEV_MODE_BYPASS_AUTH) return "mock-token"
    try {
      if (user) {
        return await user.getIdToken(true)
      }
    } catch (error) {
      console.error("Error refreshing token:", error)
    }
    return undefined
  }

  // Set up token refresh interval
  useEffect(() => {
    if (DEV_MODE_BYPASS_AUTH) return

    const tokenRefreshInterval = setInterval(
      async () => {
        await refreshToken()
      },
      10 * 60 * 1000,
    ) // Refresh every 10 minutes

    return () => clearInterval(tokenRefreshInterval)
  }, [user])

  useEffect(() => {
    if (DEV_MODE_BYPASS_AUTH) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        document.cookie = "firebase-auth-token=true; path=/; max-age=3600; SameSite=Strict"
        try {
          const userDocRef = doc(db, "users", user.uid)
          const userDoc = await getDoc(userDocRef)

          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile)
          } else {
            const newUserProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              failedLoginAttempts: 0,
            }
            await setDoc(userDocRef, newUserProfile)
            setUserProfile(newUserProfile)
          }
          await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true })
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      } else {
        document.cookie = "firebase-auth-token=; path=/; max-age=0; SameSite=Strict"
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth, db])

  const signIn = async (email: string, password: string, rememberMe = false) => {
    const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence
    await firebaseSetPersistence(auth, persistenceType)
    return signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(userCredential.user, { displayName })
    await firebaseSendEmailVerification(userCredential.user)
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
    document.cookie = "firebase-auth-token=; path=/; max-age=0; SameSite=Strict"
    return firebaseSignOut(auth)
  }

  const signInWithGoogle = async (rememberMe = false) => {
    const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence
    await firebaseSetPersistence(auth, persistenceType)
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }

  const resetPassword = async (email: string) => {
    return sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/sign-in`,
      handleCodeInApp: false,
    })
  }

  const sendEmailVerification = async () => {
    if (!user) throw new Error("No user logged in")
    return firebaseSendEmailVerification(user, {
      url: `${window.location.origin}/dashboard`,
      handleCodeInApp: false,
    })
  }

  const updateUserEmail = async (email: string) => {
    if (!user) throw new Error("No user logged in")
    await updateEmail(user, email)
    const userDocRef = doc(db, "users", user.uid)
    await setDoc(userDocRef, { email }, { merge: true })
  }

  const updateUserPassword = async (password: string) => {
    if (!user) throw new Error("No user logged in")
    return updatePassword(user, password)
  }

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error("No user logged in")
    if (data.displayName || data.photoURL) {
      await updateProfile(user, {
        displayName: data.displayName || user.displayName,
        photoURL: data.photoURL || user.photoURL,
      })
    }
    const userDocRef = doc(db, "users", user.uid)
    await setDoc(userDocRef, { ...data, updatedAt: serverTimestamp() }, { merge: true })
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
    sendEmailVerification,
    isAdmin,
    isModerator,
    refreshToken,
    isEmailVerified,
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
