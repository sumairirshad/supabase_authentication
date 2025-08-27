import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'

export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const response = await openai.audio.transcriptions.create({
      file: new File([buffer], file.name, { type: file.type }),
      model: 'whisper-1',
    })

    return NextResponse.json({ transcript: response.text })
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message)
    } else {
      console.error('An unknown error occurred', err)
    }
  }
}
