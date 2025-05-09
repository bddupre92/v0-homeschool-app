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

  return NextResponse.next()
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
