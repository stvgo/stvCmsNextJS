import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isAuthenticated = !!req.auth
  const isLoginPage = nextUrl.pathname === "/login"
  const isAuthRoute = nextUrl.pathname.startsWith("/api/auth")

  // Allow Auth.js internal routes unconditionally
  if (isAuthRoute) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated && !isLoginPage) {
    const loginUrl = new URL("/login", nextUrl.origin)
    // Preserve the original URL so user can be redirected back after login
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
})

export const config = {
  // Match all paths except static assets, API routes, images, and favicon
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)"],
}
