import { type NextRequest, NextResponse } from "next/server"
import { rateLimiter, createRateLimitResponse } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const { limited } = rateLimiter(request, { limit: 5, windowMs: 60 * 1000 })

  if (limited) {
    return createRateLimitResponse()
  }

  try {
    const token = process.env.MAPBOX_ACCESS_TOKEN

    if (!token) {
      console.error("Mapbox token not found in environment variables")
      return NextResponse.json({ error: "Mapbox configuration is missing" }, { status: 500 })
    }

    // Only return a partial token for security
    // This is just for display purposes, not for actual API calls
    const partialToken = `${token.substring(0, 8)}...${token.substring(token.length - 4)}`

    return NextResponse.json({ partialToken })
  } catch (error) {
    console.error("Error in Mapbox token API route:", error)
    return NextResponse.json({ error: "Failed to get Mapbox configuration" }, { status: 500 })
  }
}
