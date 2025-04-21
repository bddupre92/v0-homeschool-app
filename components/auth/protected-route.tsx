"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export default function ProtectedRoute({
  children,
  redirectTo = "/sign-in",
}: {
  children: React.ReactNode
  redirectTo?: string
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated
    // This prevents flickering during initial load
    if (!loading && !user) {
      // Get the current path to pass as a callback URL
      const currentPath = window.location.pathname
      const redirectPath = `${redirectTo}?callbackUrl=${encodeURIComponent(currentPath)}`
      router.push(redirectPath)
    }
  }, [user, loading, router, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg font-medium">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  return user ? <>{children}</> : null
}
