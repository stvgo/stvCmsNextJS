import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.API_URL || 'http://localhost:8080'

export async function POST(req: NextRequest) {
  const { text_ai } = await req.json()

  if (!text_ai) {
    return NextResponse.json({ error: 'text_ai is required' }, { status: 400 })
  }

  const url = new URL(`${BACKEND_URL}/post/genTextAI`)

  const backendRes = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text_ai }),
  })

  if (!backendRes.ok) {
    return NextResponse.json({ error: 'Backend error' }, { status: backendRes.status })
  }

  const text = await backendRes.text()
  return new NextResponse(text, { status: 200 })
}
