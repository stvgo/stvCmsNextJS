import { NextResponse } from "next/server"

export function GET() {
  return NextResponse.json(
    { error: "GitHub authentication is not enabled yet" },
    { status: 404 }
  )
}

export function POST() {
  return NextResponse.json(
    { error: "GitHub authentication is not enabled yet" },
    { status: 404 }
  )
}
