import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_ADMIN_PATHS = ["/admin/login"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin/* routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  // Allow public admin paths
  if (PUBLIC_ADMIN_PATHS.some((p) => pathname === p)) {
    return NextResponse.next()
  }

  // Allow API routes to handle their own auth
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  const adminPassword = process.env.ADMIN_PASSWORD
  const sessionCookie = request.cookies.get("fs_admin")

  // If no ADMIN_PASSWORD is set, allow access but add header for UI warning
  if (!adminPassword) {
    const response = NextResponse.next()
    response.headers.set("x-admin-unprotected", "true")
    return response
  }

  // Check session cookie
  if (!sessionCookie?.value) {
    const loginUrl = new URL("/admin/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Validate session (simple token check)
  // In production, use a proper JWT or session store
  const expectedToken = Buffer.from(`${adminPassword}:fs-admin-session`).toString("base64")
  if (sessionCookie.value !== expectedToken) {
    const loginUrl = new URL("/admin/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
