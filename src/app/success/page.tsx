'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCredits } from '@/app/context/CreditsContext'
import { useUser } from '../context/UserContext'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const { addCreditsAfterPurchase } = useCredits()
  const router = useRouter()
  const [done, setDone] = useState(false)
  const {userId} = useUser();

  useEffect(() => {
    if (!userId) return

    const grantCredits = async () => {
      const credits = parseInt(searchParams.get('credits') || '0', 10)

      if (!done && credits > 0) {
        await addCreditsAfterPurchase(userId!, credits)
        setDone(true)
      }

      setTimeout(() => router.push('/dashboard'), 4000)
    }

    grantCredits()
  }, [userId])

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <div className="bg-white p-8 rounded shadow-lg max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-green-700 mb-4">✅ Payment Successful!</h1>
        <p className="text-green-600 mb-2">Your credits have been added.</p>
        <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
      </div>
    </div>
  )
}
