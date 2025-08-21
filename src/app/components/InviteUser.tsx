// app/components/InviteUser.tsx
'use client'

import { useState } from 'react'

export default function  InviteUser() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')

  const handleInvite = async () => {
    setStatus('Sending...')
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()
    if (res.ok) {
      setStatus('✅ Invitation sent to ' + email)
    } else {
      setStatus('❌ ' + data.error)
    }
  }

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">User Management</h2>
      <input
        type="email"
        className="w-full p-2 rounded bg-gray-800 border border-gray-700 mb-3"
        placeholder="Enter email to invite"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
        onClick={handleInvite}
      >
        Invite User
      </button>
      {status && <p className="mt-3 text-sm text-gray-300">{status}</p>}
    </div>
  )
}
