import { NextRequest } from 'next/server'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'
import type { Fields, Files } from 'formidable'
import { Readable } from 'stream'
import { IncomingMessage } from 'http'

// Disable default body parser
export const config = {
  api: {
    bodyParser: false,
  },
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const uploadDir = path.join(process.cwd(), 'uploads')
  fs.mkdirSync(uploadDir, { recursive: true })

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024,
    multiples: false,
  })

  const buffer = await req.arrayBuffer()

    const readableStream = Readable.from(Buffer.from(buffer))
    const fakeReq = Object.assign(readableStream, {
      headers: Object.fromEntries(req.headers),
      method: req.method,
      url: '',
    }) as IncomingMessage

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(buffer))
      controller.close()
    }
  })

  const readable = stream as unknown as NodeJS.ReadableStream

  Object.assign(fakeReq, {
    pipe: readable.pipe.bind(readable),
    on: readable.on.bind(readable),
  })

  const { fields, files }: { fields: Fields; files: Files } = await new Promise((resolve, reject) => {
    form.parse(fakeReq, (err, fields, files) => {
        if (err) reject(err)
        else resolve({ fields, files })
    })
    })

  const file = Array.isArray(files.file) ? files.file[0] : files.file
  if (!file) {
    return new Response(JSON.stringify({ error: 'No file uploaded' }), {
      status: 400,
    })
  }

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(file.filepath),
      model: fields.model?.toString() || 'whisper-1',
      language: fields.language?.toString() || 'en',
      prompt: fields.prompt?.toString() || '',
      response_format: (fields.format?.toString() || 'text') as 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt',
    })

    try {
      fs.unlinkSync(file.filepath)
    } catch {}

    return new Response(JSON.stringify({ result: transcription }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Transcription error:', err)
    return new Response(JSON.stringify({ error: 'Transcription failed' }), {
      status: 500,
    })
  }
}
