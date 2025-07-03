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
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore"

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
  const [firebaseInitialized, setFirebaseInitialized] = useState(false)

  // Initialize Firebase lazily
  const [auth, setAuth] = useState<any>(null)
  const [db, setDb] = useState<any>(null)

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        const { auth: firebaseAuth, db: firebaseDb } = await import("../lib/firebase")
        setAuth(firebaseAuth)
        setDb(firebaseDb)
        setFirebaseInitialized(true)
      } catch (error) {
        console.error("Failed to initialize Firebase:", error)
        setLoading(false)
      }
    }

    initializeFirebase()
  }, [])

  // Add a function to check if user has admin role
  const isAdmin = () => {
    return userProfile?.role === "admin"
  }

  // Add a function to check if user has moderator role
  const isModerator = () => {
    return userProfile?.role === "admin" || userProfile?.role === "moderator"
  }

  // Add a function to check if email is verified
  const isEmailVerified = () => {
    return user?.emailVerified ?? false
  }

  // Add token refresh function
  const refreshToken = async () => {
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
    if (!user) return

    const tokenRefreshInterval = setInterval(
      async () => {
        await refreshToken()
      },
      10 * 60 * 1000,
    ) // Refresh every 10 minutes

    return () => clearInterval(tokenRefreshInterval)
  }, [user])

  useEffect(() => {
    if (!firebaseInitialized || !auth || !db) return

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
              failedLoginAttempts: 0,
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
  }, [firebaseInitialized, auth, db])

  const signIn = async (email: string, password: string, rememberMe = false) => {
    if (!auth || !db) throw new Error("Firebase not initialized")

    // Set persistence based on remember me option
    const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence
    await firebaseSetPersistence(auth, persistenceType)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      // Reset failed login attempts on successful login
      if (userCredential.user) {
        const userDocRef = doc(db, "users", userCredential.user.uid)
        await setDoc(
          userDocRef,
          {
            failedLoginAttempts: 0,
            lastLogin: serverTimestamp(),
          },
          { merge: true },
        )
      }

      return userCredential
    } catch (error) {
      // Track failed login attempts
      if (email) {
        try {
          // Find user by email
          const usersRef = collection(db, "users")
          const q = query(usersRef, where("email", "==", email))
          const snapshot = await getDocs(q)

          if (!snapshot.empty) {
            const userDoc = snapshot.docs[0]
            const userData = userDoc.data() as UserProfile
            const attempts = (userData.failedLoginAttempts || 0) + 1

            await setDoc(
              doc(db, "users", userDoc.id),
              {
                failedLoginAttempts: attempts,
                lastFailedLogin: serverTimestamp(),
              },
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

    // Send email verification
    await firebaseSendEmailVerification(userCredential.user)

    // Create user profile in Firestore
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

    // Clear the auth cookie when the user signs out
    document.cookie = "firebase-auth-token=; path=/; max-age=0; SameSite=Strict"
    return firebaseSignOut(auth)
  }

  const signInWithGoogle = async (rememberMe = false) => {
    if (!auth) throw new Error("Firebase not initialized")

    // Set persistence based on remember me option
    const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence
    await firebaseSetPersistence(auth, persistenceType)

    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error("Firebase not initialized")

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
    if (!user || !db) throw new Error("No user logged in or Firebase not initialized")
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
    if (!user || !db) throw new Error("No user logged in or Firebase not initialized")

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
