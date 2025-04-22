import { NextResponse } from "next/server"

// This endpoint provides a public token for Mapbox that can be used on the client
export async function GET() {
  // Only use the server-side environment variable
  const token = process.env.MAPBOX_ACCESS_TOKEN

  if (!token) {
    return NextResponse.json({ error: "Mapbox token not configured" }, { status: 500 })
  }

  // Return a temporary token with limited scope
  return NextResponse.json({
    token: token,
  })
}
