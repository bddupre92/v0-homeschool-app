import type React from "react"
import { redirect } from "next/navigation"
import { adminDb } from "@/lib/firebase-admin-safe"
import { getOptionalUser } from "@/lib/auth-middleware"

import { Sidebar } from "@/components/admin/sidebar"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get the current user
  const auth = await getOptionalUser()

  // If not logged in, redirect to sign in
  if (!auth) {
    redirect("/sign-in")
  }

  // Check if user is admin
  try {
    const userDoc = await adminDb.collection("users").doc(auth.userId).get()
    const userData = userDoc.data()

    if (!userData || userData.role !== "admin") {
      redirect("/dashboard")
    }
  } catch (error) {
    console.error("Error checking admin status:", error)
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  )
}
