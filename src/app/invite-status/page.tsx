
'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { decodeEmail } from '@/app/utils/encodeEmail'
import { supabase } from '../lib/supabase'

export default function InviteStatusPage() {
  const router = useRouter()
  const params = useSearchParams()
  
   useEffect(() => {
    const checkStatus = async () => {
      const encodedEmail = params.get('token')
      const roleId = params.get('role')

      if (!encodedEmail || !roleId) return

      const email = decodeEmail(encodedEmail)
      const { data: { user } } = await supabase.auth.getUser()

      if (user && user.email === email) {
        await supabase.from('user_roles').update({
          status: 'confirmed',
        }).eq('user_id', user.id)

        router.push(`/set-password?email=${encodedEmail}`)
      }
    }

    checkStatus()
  }, [params, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded shadow-lg max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-4">Verifying Invitation...</h1>
        <p className="text-gray-300">Please wait while we confirm your invite.</p>
      </div>
    </div>
  )
}
