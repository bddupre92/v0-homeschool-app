import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-service"
import { storeGoogleCalendarTokens } from "@/lib/google-calendar"
import { google } from "googleapis"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code." }, { status: 400 })
  }

  try {
    const user = await requireAuth()
    if (state && state !== user.userId) {
      return NextResponse.json({ error: "Invalid OAuth state." }, { status: 400 })
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CALENDAR_CLIENT_ID,
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      new URL("/api/google-calendar/callback", request.url).toString(),
    )

    const { tokens } = await oauth2Client.getToken(code)
    await storeGoogleCalendarTokens(user.userId, tokens)

    return NextResponse.redirect(new URL("/planner?calendar=connected", request.url))
  } catch (error) {
    console.error("Failed to complete Google Calendar auth:", error)
    return NextResponse.json({ error: "Unable to connect Google Calendar." }, { status: 500 })
  }
}
