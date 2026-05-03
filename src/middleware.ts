import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_PATHS = ["/", "/about"]
const PUBLIC_PREFIXES = ["/post/"]

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    const subPath = pathname.slice("/post/".length)
    if (subPath.startsWith("create") || subPath.includes("/edit")) return false
    return true
  }
  return false
}

export function middleware(req: NextRequest) {
  const { nextUrl } = req
  const token = req.cookies.get("stv_token")?.value
  const isAuthenticated = !!token
  const isLoginPage = nextUrl.pathname === "/login"

  if (isPublicPath(nextUrl.pathname) && !isLoginPage) {
    if (isAuthenticated && isLoginPage) {
      const callbackUrl = nextUrl.searchParams.get("callbackUrl")
      return NextResponse.redirect(new URL(callbackUrl || "/", nextUrl.origin))
    }
    return NextResponse.next()
  }

  if (!isAuthenticated && !isLoginPage) {
    const loginUrl = new URL("/login", nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname + nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthenticated && isLoginPage) {
    const callbackUrl = nextUrl.searchParams.get("callbackUrl")
    return NextResponse.redirect(new URL(callbackUrl || "/", nextUrl.origin))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)"],
}