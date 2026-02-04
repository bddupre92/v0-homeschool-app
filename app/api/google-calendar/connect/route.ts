import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-service"
import { buildGoogleCalendarAuthUrl } from "@/lib/google-calendar"

export async function GET(request: Request) {
  try {
    const user = await requireAuth()
    const authUrl = buildGoogleCalendarAuthUrl(request.url, user.userId)
    return NextResponse.json({ url: authUrl })
  } catch (error) {
    console.error("Failed to start Google Calendar auth:", error)
    return NextResponse.json({ error: "Unable to start calendar connection." }, { status: 500 })
  }
}
