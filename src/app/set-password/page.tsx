// app/set-password/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { decodeEmail } from '../utils/encodeEmail'
import { supabase } from '../lib/supabase'

export default function SetPasswordPage() {
  const params = useSearchParams()
  const email = decodeEmail(params.get('email')!)
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSetPassword = async () => {
    if (!password || password.length < 6) {
      return setStatus('❌ Password must be at least 6 characters.')
    }

    setLoading(true)
    setStatus('Setting your password...')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setStatus('❌ ' + error.message)
    } else {
      setStatus('✅ Password set successfully! You can now log in manually.')
      window.location.href = '/'
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Set Your Password</h2>
        <p className="text-gray-300 mb-6">
          You're setting password for: <br />
          <span className="text-blue-400 font-medium">{email}</span>
        </p>

        <input
          type="password"
          placeholder="Enter new password"
          className="w-full mb-4 p-2 rounded bg-gray-700 border border-gray-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSetPassword}
          className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? 'Setting...' : 'Set Password'}
        </button>

        {status && <p className="mt-4 text-sm text-gray-300">{status}</p>}
      </div>
    </div>
  )
}
