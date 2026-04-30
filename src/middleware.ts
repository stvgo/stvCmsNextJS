import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const { nextUrl } = req
  const token = req.cookies.get("stv_token")?.value
  const isAuthenticated = !!token
  const isLoginPage = nextUrl.pathname === "/login"
  const isApiRoute = nextUrl.pathname.startsWith("/api")

  // Allow API routes unconditionally
  if (isApiRoute) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated && !isLoginPage) {
    const loginUrl = new URL("/login", nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname + nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from login page
  if (isAuthenticated && isLoginPage) {
    const callbackUrl = nextUrl.searchParams.get("callbackUrl")
    const redirectUrl = callbackUrl || "/"
    return NextResponse.redirect(new URL(redirectUrl, nextUrl.origin))
  }

  return NextResponse.next()
}

export const config = {
  // Match all paths except static assets, _next internals, images, and favicon
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)"],
}
