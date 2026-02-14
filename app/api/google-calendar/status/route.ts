import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-service"
import { getGoogleCalendarTokens } from "@/lib/google-calendar"

export async function GET() {
  try {
    const user = await requireAuth()
    const tokens = await getGoogleCalendarTokens(user.userId)
    return NextResponse.json({
      connected: Boolean(tokens?.accessToken || tokens?.refreshToken),
      calendarId: tokens?.calendarId ?? null,
    })
  } catch (error) {
    console.error("Failed to get Google Calendar status:", error)
    return NextResponse.json({ error: "Unable to check calendar status." }, { status: 500 })
  }
}
