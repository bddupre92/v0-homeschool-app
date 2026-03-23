/**
 * Simple AI-specific rate limiter.
 * Separate from the general rate limiter to allow different limits per AI route.
 */

const counters = new Map<string, { count: number; resetTime: number }>()

interface AIRateLimitResult {
  limited: boolean
  remaining: number
  message?: string
}

/**
 * Check rate limit for AI routes.
 * @param key - Unique key (e.g., IP or user ID)
 * @param limit - Max requests per window
 * @param windowMs - Window duration in ms (default: 60s)
 */
export function checkAIRateLimit(
  key: string,
  limit: number = 15,
  windowMs: number = 60_000,
): AIRateLimitResult {
  const now = Date.now()
  const entry = counters.get(key)

  if (!entry || entry.resetTime < now) {
    counters.set(key, { count: 1, resetTime: now + windowMs })
    return { limited: false, remaining: limit - 1 }
  }

  if (entry.count < limit) {
    entry.count++
    return { limited: false, remaining: limit - entry.count }
  }

  const waitSeconds = Math.ceil((entry.resetTime - now) / 1000)
  return {
    limited: true,
    remaining: 0,
    message: `You're sending messages too quickly. Please wait ${waitSeconds} seconds.`,
  }
}

/**
 * Extract a rate limit key from a Request.
 * Uses x-forwarded-for header, falling back to "anonymous".
 */
export function getRateLimitKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  return forwarded?.split(",")[0]?.trim() || "anonymous"
}
