import { NextResponse } from "next/server"

// This route handler will only be executed at runtime, not during build
export async function GET() {
  // In production, this would fetch from Firebase
  // For now, return mock data
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
}

export async function POST() {
  // In production, this would create a backup in Firebase
  // For now, just return a success response
  return NextResponse.json({ success: true })
}
