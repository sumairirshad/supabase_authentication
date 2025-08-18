'use client'

import { useState, useRef} from 'react'
import { Input } from '../components/ui/input'
import Header from '../components/Header'
import { useCredits } from '../context/CreditsContext'

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const dropRef = useRef<HTMLDivElement>(null)
  const { deductCredits, credits } = useCredits()

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return
    setFile(selectedFile)
    setTranscript('')
    setError('')
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    handleFileSelect(droppedFile)
    if (dropRef.current) dropRef.current.style.borderColor = '#3b82f6'
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (dropRef.current) dropRef.current.style.borderColor = '#3b82f6'
  }

  const handleDragLeave = () => {
    if (dropRef.current) dropRef.current.style.borderColor = '#4b5563'
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an audio file first.')
      return
    }

    setLoading(true)
    setTranscript('')
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('language', 'nl')
      formData.append('format', 'text')
      formData.append('prompt', '')
      formData.append('model', 'gpt-4o-mini-transcribe')

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        const out =
          typeof data.result === 'string'
            ? data.result
            : data.result?.text ?? JSON.stringify(data.result, null, 2)
        setTranscript(out)

        await deductCredits(10)
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (err: any) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <> <Header />
    <div className="min-h-screen bg-gray-900 text-white p-6">
     
      <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">🎙 Whisper Transcriber</h1>
        <p className="mb-4 text-gray-300">
          Default language: <strong>Dutch (nl)</strong>. Supported formats:
          <code> .wav</code>, <code>.mp3</code>, <code>.m4a</code>,{' '}
          <code>.ogg</code> (≤50MB)
        </p>

        <div
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('fileInput')?.click()}
          className="border-2 border-dashed border-gray-600 hover:border-blue-500 p-8 rounded-lg text-center cursor-pointer transition-colors duration-200 mb-4 bg-gray-700"
        >
          {file ? (
            <p className="text-blue-300 font-medium">📂 {file.name}</p>
          ) : (
            <p className="text-gray-400">
              Drag & Drop your audio file here or <span className="text-blue-400 underline">click to browse</span>
            </p>
          )}
        </div>

        <Input
          id="fileInput"
          type="file"
          accept=".mp3,.wav,.m4a,.ogg"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
        />

        <div className="flex gap-4 items-center mb-4">
          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded"
          >
            {loading ? 'Transcribing...' : 'Transcribe'}
          </button>
          <button
            onClick={() => {
              setFile(null)
              setTranscript('')
              setError('')
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            Clear
          </button>
        </div>

        <div className="mb-6">
          <strong className="block mb-2">🎧 Try Sample Files:</strong>
          <div className="flex flex-wrap gap-4 items-center">
            <audio controls className="w-48" src="/samples/sample1.wav" />
            <audio controls className="w-48" src="/samples/sample2.wav" />
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
              onClick={() =>
                fetch('/samples/sample1.wav')
                  .then((r) => r.blob())
                  .then((b) => {
                    const f = new File([b], 'sample1.wav')
                    handleFileSelect(f)
                  })
              }
            >
              Use Sample 1
            </button>
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
              onClick={() =>
                fetch('/samples/sample2.wav')
                  .then((r) => r.blob())
                  .then((b) => {
                    const f = new File([b], 'sample2.wav')
                    handleFileSelect(f)
                  })
              }
            >
              Use Sample 2
            </button>
          </div>
        </div>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        {transcript && (
          <div>
            <h2 className="text-lg font-semibold mb-2">📝 Transcript</h2>
            <pre className="bg-gray-700 text-gray-100 p-4 rounded overflow-y-auto max-h-[400px] whitespace-pre-wrap">
              {transcript}
            </pre>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
