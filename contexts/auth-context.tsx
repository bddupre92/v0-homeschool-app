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
  type Auth,
} from "firebase/auth"
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  type Firestore,
} from "firebase/firestore"
import { getFirebaseAuth, getFirebaseDb } from "../lib/firebase"

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

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Hold service instances in state
  const [auth, setAuth] = useState<Auth | null>(null)
  const [db, setDb] = useState<Firestore | null>(null)

  useEffect(() => {
    // Get service instances and set them to state
    setAuth(getFirebaseAuth())
    setDb(getFirebaseDb())
  }, [])

  const isAdmin = () => userProfile?.role === "admin"
  const isModerator = () => userProfile?.role === "admin" || userProfile?.role === "moderator"
  const isEmailVerified = () => user?.emailVerified ?? false

  const refreshToken = async () => {
    try {
      if (user) return await user.getIdToken(true)
    } catch (error) {
      console.error("Error refreshing token:", error)
    }
    return undefined
  }

  useEffect(() => {
    if (!user) return
    const tokenRefreshInterval = setInterval(refreshToken, 10 * 60 * 1000) // Refresh every 10 minutes
    return () => clearInterval(tokenRefreshInterval)
  }, [user])

  useEffect(() => {
    if (!auth || !db) {
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
    if (!auth || !db) throw new Error("Firebase not initialized")
    const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence
    await firebaseSetPersistence(auth, persistenceType)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      if (userCredential.user) {
        const userDocRef = doc(db, "users", userCredential.user.uid)
        await setDoc(userDocRef, { failedLoginAttempts: 0, lastLogin: serverTimestamp() }, { merge: true })
      }
      return userCredential
    } catch (error) {
      if (email) {
        try {
          const q = query(collection(db, "users"), where("email", "==", email))
          const snapshot = await getDocs(q)
          if (!snapshot.empty) {
            const userDoc = snapshot.docs[0]
            const attempts = (userDoc.data().failedLoginAttempts || 0) + 1
            await setDoc(
              doc(db, "users", userDoc.id),
              { failedLoginAttempts: attempts, lastFailedLogin: serverTimestamp() },
              { merge: true },
            )
          }
        } catch (err) {
          console.error("Error tracking failed login:", err)
        }
      }
      throw error
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!auth || !db) throw new Error("Firebase not initialized")
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
      failedLoginAttempts: 0,
    })
    return userCredential
  }

  const signOut = async () => {
    if (!auth) throw new Error("Firebase not initialized")
    document.cookie = "firebase-auth-token=; path=/; max-age=0; SameSite=Strict"
    return firebaseSignOut(auth)
  }

  const signInWithGoogle = async (rememberMe = false) => {
    if (!auth) throw new Error("Firebase not initialized")
    const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence
    await firebaseSetPersistence(auth, persistenceType)
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error("Firebase not initialized")
    return sendPasswordResetEmail(auth, email, { url: `${window.location.origin}/sign-in`, handleCodeInApp: false })
  }

  const sendEmailVerification = async () => {
    if (!user) throw new Error("No user logged in")
    return firebaseSendEmailVerification(user, { url: `${window.location.origin}/dashboard`, handleCodeInApp: false })
  }

  const updateUserEmail = async (email: string) => {
    if (!user || !db) throw new Error("User or DB not available")
    await updateEmail(user, email)
    const userDocRef = doc(db, "users", user.uid)
    await setDoc(userDocRef, { email }, { merge: true })
  }

  const updateUserPassword = async (password: string) => {
    if (!user) throw new Error("No user logged in")
    return updatePassword(user, password)
  }

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user || !db) throw new Error("User or DB not available")
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
