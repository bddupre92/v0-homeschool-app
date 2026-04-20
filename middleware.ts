import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Already-authenticated users land at /today when they hit an auth page.
const authPaths = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"]

// Deleted legacy routes: redirect to the surviving calm room so bookmarks
// and external links still resolve.
const LEGACY_REDIRECTS: Record<string, string> = {
  "/dashboard": "/today",
  "/planner": "/teach",
  "/plan": "/today",
  "/resources": "/library",
  "/portfolio": "/family/calm",
  "/advisor": "/today",
  "/boards": "/library",
  "/scroll": "/library",
  "/search": "/library",
  "/about": "/",
  "/community": "/people",
  "/settings/modules": "/settings",
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Legacy-route redirects. Match exact path or a path whose prefix is a
  // deleted directory (e.g. /community/events/123 → /people).
  for (const [from, to] of Object.entries(LEGACY_REDIRECTS)) {
    if (pathname === from || pathname.startsWith(from + "/")) {
      return NextResponse.redirect(new URL(to, request.url), 308)
    }
  }

  const isAuthPath = authPaths.some((path) => pathname === path)
  const session = request.cookies.get("session")?.value
  const isValidSession = session && session.split(".").length === 3 && session.length > 100

  if (isAuthPath && isValidSession) {
    return NextResponse.redirect(new URL("/today", request.url))
  }

  if (isAuthPath && session && !isValidSession) {
    const response = NextResponse.next()
    response.cookies.set("session", "", { maxAge: 0, path: "/" })
    return addSecurityHeaders(response)
  }

  const response = NextResponse.next()
  return addSecurityHeaders(response)
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy. Allow dicebear for the mock avatar fallback.
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-insights.com https://*.firebaseio.com https://*.googleapis.com; " +
      "connect-src 'self' https://*.vercel-insights.com https://*.firebaseio.com https://*.googleapis.com https://api.dicebear.com; " +
      "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://api.dicebear.com; " +
      "style-src 'self' 'unsafe-inline'; " +
      "font-src 'self' data:; " +
      "frame-src https://*.firebaseapp.com;",
  )

  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)")

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files (e.g. robots.txt)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|.*\\..*|api).*)",
  ],
}
