import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory store for rate limiting
// In production, you'd use Redis or another distributed store
const rateLimit = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  limit?: number
  windowMs?: number
}

export function rateLimiter(req: NextRequest, options: RateLimitOptions = {}) {
  const { limit = 10, windowMs = 60 * 1000 } = options

  // Get IP address from request
  const ip = req.ip || "anonymous"

  // Get current timestamp
  const now = Date.now()

  // Get existing rate limit data for this IP
  const rateLimitInfo = rateLimit.get(ip)

  // If no existing data or window has expired, create new entry
  if (!rateLimitInfo || rateLimitInfo.resetTime < now) {
    rateLimit.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    })
    return { limited: false, remaining: limit - 1 }
  }

  // If within window but under limit, increment count
  if (rateLimitInfo.count < limit) {
    rateLimitInfo.count++
    rateLimit.set(ip, rateLimitInfo)
    return { limited: false, remaining: limit - rateLimitInfo.count }
  }

  // Otherwise, rate limit exceeded
  return { limited: true, remaining: 0 }
}

// Helper function to create a rate limited response
export function createRateLimitResponse() {
  return NextResponse.json({ error: "Too many requests, please try again later." }, { status: 429 })
}
