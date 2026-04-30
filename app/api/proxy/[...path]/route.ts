import { NextRequest, NextResponse } from "next/server"

const backendUrl = process.env.API_URL || "http://localhost:8080"

async function proxy(request: NextRequest, method: string) {
  const path = request.nextUrl.pathname.replace("/api/proxy", "")
  const url = new URL(`${backendUrl}${path}`)

  // Forward query params
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value)
  })

  // Build headers to forward to backend
  const headers = new Headers()
  request.headers.forEach((value, key) => {
    // Skip host and cookie; forward everything else (including Authorization)
    if (key !== "host" && key.toLowerCase() !== "cookie") {
      headers.set(key, value)
    }
  })

  const body =
    method !== "GET" && method !== "HEAD"
      ? await request.arrayBuffer()
      : undefined

  const response = await fetch(url.toString(), {
    method,
    headers,
    body,
  })

  const responseHeaders = new Headers(response.headers)
  // Remove content-encoding to avoid double-compression issues
  responseHeaders.delete("content-encoding")
  responseHeaders.delete("transfer-encoding")

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
}

export async function GET(request: NextRequest) {
  return proxy(request, "GET")
}

export async function POST(request: NextRequest) {
  return proxy(request, "POST")
}

export async function PUT(request: NextRequest) {
  return proxy(request, "PUT")
}

export async function DELETE(request: NextRequest) {
  return proxy(request, "DELETE")
}

export async function PATCH(request: NextRequest) {
  return proxy(request, "PATCH")
}
