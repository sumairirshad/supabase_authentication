'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCredits } from '@/app/context/CreditsContext'
import { useUser } from '../context/UserContext'
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'

export default function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { addCreditsAfterPurchase } = useCredits()
  const { userId } = useUser()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const id = searchParams.get('session_id')
    if (id) {
      setSessionId(id)
    } else {
      setError('Missing session ID')
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    if (!userId || !sessionId) return;

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/validate-session?session_id=${sessionId}`)
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Something went wrong.')

        if (data.credits > 0) {
          await addCreditsAfterPurchase(userId, data.credits)
          setSuccess(true)
          setTimeout(() => router.push('/dashboard'), 4000)
        } else {
          setError('No credits were added.')
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Could not verify payment.')
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [userId, sessionId, addCreditsAfterPurchase, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
          <p className="text-sm text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  if (error && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <AlertTriangle className="text-red-500 w-8 h-8 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-red-600">Payment Failed</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full text-center animate-fade-in">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-green-700 mb-2">Payment Successful!</h2>
        <p className="text-gray-700 mb-1">Your credits have been added to your account.</p>
        <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
      </div>
    </div>
    )
  }

  return null
}
