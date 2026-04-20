import http from 'node:http'
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.API_URL || 'http://localhost:8080'

export async function POST(req: NextRequest) {
  const { text_ai } = await req.json()

  if (!text_ai) {
    return NextResponse.json({ error: 'text_ai is required' }, { status: 400 })
  }

  const body = JSON.stringify({ text_ai })
  const url = new URL(`${BACKEND_URL}/post/genTextAI`)

  const text = await new Promise<string>((resolve, reject) => {
    const options: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }

    const clientReq = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => resolve(data))
    })

    clientReq.on('error', reject)
    clientReq.write(body)
    clientReq.end()
  })

  return new NextResponse(text, { status: 200 })
}
