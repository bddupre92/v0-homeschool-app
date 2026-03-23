import { NextRequest, NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase-admin-safe"

// Session cookie duration: 5 days
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 5 * 1000

/**
 * POST /api/auth/session
 * Creates a session cookie from a Firebase ID token.
 * Called by the client after successful Firebase authentication.
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid idToken" },
        { status: 400 }
      )
    }

    // Create session cookie using Firebase Admin
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_COOKIE_MAX_AGE,
    })

    // Set the session cookie
    const response = NextResponse.json({ status: "success" })
    response.cookies.set("session", sessionCookie, {
      maxAge: SESSION_COOKIE_MAX_AGE / 1000, // maxAge is in seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    })

    return response
  } catch (error: any) {
    console.error("Session creation error:", error)
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 401 }
    )
  }
}

/**
 * DELETE /api/auth/session
 * Clears the session cookie. Called on sign out.
 */
export async function DELETE() {
  const response = NextResponse.json({ status: "success" })
  response.cookies.set("session", "", {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  })
  return response
}
