"use client"

import type React from "react"

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  // DEV MODE: Authentication check is currently bypassed for development
  // in `contexts/auth-context.tsx`. This component will now always
  // render its children.
  return <>{children}</>
}
