"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/lib/firebase"
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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
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

    // If auth service is not available, stop loading and proceed without a user.
    if (!auth) {
      setLoading(false)
      return
    }

    // Listen for real authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  const value = { user, loading }

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
