import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { Fields, Files } from 'formidable'
import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'

export const config = {
  api: {
    bodyParser: false,
  },
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const allowedExtensions = ['.mp3', '.wav', '.m4a', '.ogg']
const allowedFormats = ['json', 'text', 'srt', 'verbose_json', 'vtt'] as const
type AudioFormat = typeof allowedFormats[number]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const uploadDir = path.join(process.cwd(), 'uploads')
  fs.mkdirSync(uploadDir, { recursive: true })

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024,
    multiples: false,
  })

  const { fields, files } = await new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })

  const file = Array.isArray(files.file) ? files.file[0] : files.file
  if(!file) return ;
  
  const ext = path.extname(file.originalFilename || file.newFilename || '').toLowerCase()

  if (!allowedExtensions.includes(ext)) {
    try { fs.unlinkSync(file.filepath) } catch (_) {}
    return res.status(400).json({ error: 'Unsupported file format' })
  }

  const language = fields.language?.toString() || 'nl'
  const prompt = fields.prompt?.toString() || ''
  const model = fields.model?.toString() || 'gpt-4o-mini-transcribe'
  const format = fields.format?.toString() || 'text'
  const response_format: AudioFormat = allowedFormats.includes(format as AudioFormat)
    ? (format as AudioFormat)
    : 'text'

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(file.filepath),
      model,
      language,
      prompt,
      response_format,
    })

    try { fs.unlinkSync(file.filepath) } catch (_) {}

    return res.status(200).json({ result: transcription })
  } catch (err: unknown) {
    console.error(err)
    return res.status(500).json({ error: 'Transcription failed' })
  }
}
