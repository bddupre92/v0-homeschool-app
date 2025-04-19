"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    // If authentication is required and user is not authenticated
    if (requireAuth && status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
    }
    
    // If user is authenticated but on auth pages (login/register)
    if (!requireAuth && status === "authenticated" && (pathname === "/login" || pathname === "/register")) {
      router.push("/dashboard")
    }
  }, [requireAuth, status, router, pathname])

  // Show loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If authentication is required and user is not authenticated, don't render children
  if (requireAuth && status === "unauthenticated") {
    return null
  }

  // If user is authenticated but on auth pages, don't render children
  if (!requireAuth && status === "authenticated" && (pathname === "/login" || pathname === "/register")) {
    return null
  }

  // Otherwise, render children
  return <>{children}</>
}
