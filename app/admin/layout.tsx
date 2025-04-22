import type React from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/firebase-admin"

import { Sidebar } from "@/components/admin/sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get the session
  const session = await getServerSession(authOptions)

  // If not logged in, redirect to sign in
  if (!session) {
    redirect("/sign-in")
  }

  // Check if user is admin
  const userDoc = await db.collection("users").doc(session.user.id).get()
  const userData = userDoc.data()

  if (!userData || userData.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  )
}
