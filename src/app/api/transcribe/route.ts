import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import formidable from 'formidable'
import OpenAI from 'openai'

export const config = {
  api: {
    bodyParser: false,
  },
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const allowedExtensions = [".mp3", ".wav", ".m4a", ".ogg"]

function parseForm(req: NextRequest): Promise<{ fields: any; files: any }> {
  const uploadDir = path.join(process.cwd(), 'uploads')
  fs.mkdirSync(uploadDir, { recursive: true })

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024,
    multiples: false,
  })

  return new Promise((resolve, reject) => {
    form.parse(req as any, (err:any, fields:any, files:any) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })
}

export async function POST(req: NextRequest) {
  try {
    const { fields, files } = await parseForm(req)

    if (!files.file) {
      return NextResponse.json({ error: 'No audio file uploaded' }, { status: 400 })
    }

    const file = files.file
    const ext = path.extname(file.originalFilename || file.newFilename || '').toLowerCase()
    if (!allowedExtensions.includes(ext)) {
      try { fs.unlinkSync(file.filepath) } catch (e) {}
      return NextResponse.json({ error: 'Unsupported file format' }, { status: 400 })
    }

    const language = fields.language || 'nl'
    const format = fields.format || 'text'
    const prompt = fields.prompt || ''
    const model = fields.model || 'gpt-4o-mini-transcribe'

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(file.filepath),
      model,
      language,
      prompt: prompt || undefined,
      response_format: format === 'json' ? 'verbose_json' : format,
    })

    try { fs.unlinkSync(file.filepath) } catch (e) {}

    return NextResponse.json({ result: transcription })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
