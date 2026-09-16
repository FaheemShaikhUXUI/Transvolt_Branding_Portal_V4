import { NextResponse } from "next/server"
import type { NextRequest } from "next/request"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Allow internal Next.js assets, API routes, static public files, and login page
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/logos") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/cat-peek") ||
    pathname === "/login" ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // 2. Check for active transvolt_session cookie
  const sessionCookie = request.cookies.get("transvolt_session")?.value

  // 3. If unauthenticated, immediately redirect to /login
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
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
     * - public assets with extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|pptx)).*)",
  ],
}
