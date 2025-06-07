import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Add paths that should be protected (require authentication)
const protectedPaths = ["/dashboard", "/boards", "/planner", "/profile", "/settings", "/resources/create"]

// Add paths that should be accessible only to non-authenticated users
const authPaths = ["/sign-in", "/sign-up", "/forgot-password"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  // Check if the path is for authentication
  const isAuthPath = authPaths.some((path) => pathname === path)

  // Get the session cookie
  const session = request.cookies.get("session")?.value

  // For client-side auth, we'll let the ProtectedRoute component handle the redirect
  // This prevents the middleware from redirecting authenticated users
  if (isProtectedPath) {
    // Only redirect if we're absolutely sure there's no session
    // This allows client-side auth to work properly
    if (!session && !request.cookies.has("firebase-auth-token")) {
      const signInUrl = new URL("/sign-in", request.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  // If the path is for authentication and there's a session, redirect to dashboard
  if (isAuthPath && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Add security headers
  const response = NextResponse.next()

  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-insights.com https://*.firebaseio.com https://*.googleapis.com; connect-src 'self' https://*.vercel-insights.com https://*.firebaseio.com https://*.googleapis.com https://api.mapbox.com; img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://api.mapbox.com; style-src 'self' 'unsafe-inline' https://api.mapbox.com; font-src 'self' data:; frame-src https://*.firebaseapp.com;",
  )

  // Other security headers
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
