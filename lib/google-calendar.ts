import { google } from "googleapis"
import { adminDb } from "@/lib/firebase-admin-safe"

const SCOPES = ["https://www.googleapis.com/auth/calendar"]

const getOAuthClient = (requestUrl: string) => {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Missing Google Calendar OAuth credentials.")
  }

  const redirectUri = new URL("/api/google-calendar/callback", requestUrl).toString()
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

const tokensCollection = () => adminDb.collection("googleCalendarTokens")

export const buildGoogleCalendarAuthUrl = (requestUrl: string, userId: string) => {
  const oauth2Client = getOAuthClient(requestUrl)
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state: userId,
  })
}

export const storeGoogleCalendarTokens = async (userId: string, tokens: {
  access_token?: string | null
  refresh_token?: string | null
  scope?: string | null
  token_type?: string | null
  expiry_date?: number | null
}) => {
  const docRef = tokensCollection().doc(userId)
  const existing = await docRef.get()
  const data = existing.exists ? existing.data() : {}

  await docRef.set(
    {
      accessToken: tokens.access_token ?? data?.accessToken ?? null,
      refreshToken: tokens.refresh_token ?? data?.refreshToken ?? null,
      scope: tokens.scope ?? data?.scope ?? null,
      tokenType: tokens.token_type ?? data?.tokenType ?? null,
      expiryDate: tokens.expiry_date ?? data?.expiryDate ?? null,
      calendarId: data?.calendarId ?? "primary",
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  )
}

export const getGoogleCalendarTokens = async (userId: string) => {
  const snapshot = await tokensCollection().doc(userId).get()
  return snapshot.exists ? snapshot.data() : null
}

export const getGoogleCalendarClient = async (requestUrl: string, userId: string) => {
  const tokens = await getGoogleCalendarTokens(userId)
  if (!tokens?.accessToken && !tokens?.refreshToken) {
    throw new Error("Google Calendar is not connected.")
  }

  const oauth2Client = getOAuthClient(requestUrl)
  oauth2Client.setCredentials({
    access_token: tokens.accessToken ?? undefined,
    refresh_token: tokens.refreshToken ?? undefined,
    expiry_date: tokens.expiryDate ?? undefined,
    scope: tokens.scope ?? undefined,
    token_type: tokens.tokenType ?? undefined,
  })

  return {
    calendar: google.calendar({ version: "v3", auth: oauth2Client }),
    calendarId: tokens.calendarId ?? "primary",
  }
}
