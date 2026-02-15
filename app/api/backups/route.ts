import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-service"

export async function GET() {
  try {
    await requireAuth()

    // TODO: Implement real backup listing from Firebase Storage
    const mockBackups = [
      {
        name: "backups/backup-2025-04-25.json",
        size: "1024000",
        created: new Date().toISOString(),
      },
      {
        name: "backups/backup-2025-04-24.json",
        size: "985000",
        created: new Date(Date.now() - 86400000).toISOString(),
      },
    ]

    return NextResponse.json(mockBackups)
  } catch (error: any) {
    if (error?.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to list backups" }, { status: 500 })
  }
}

export async function POST() {
  try {
    await requireAuth()

    // TODO: Implement real backup creation in Firebase Storage
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to create backup" }, { status: 500 })
  }
}
