'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Lock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [tokenChecked, setTokenChecked] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data?.session) {
        toast.error('Reset link is invalid or expired.')
        window.location.href = '/'
      }
      setTokenChecked(true)
    }

    checkSession()
  }, [])

  const handleReset = async () => {
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated! Redirecting...')
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
  }

  if (!tokenChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-zinc-600 text-lg">Validating reset link...</p>
      </div>
    )
  }

  return (
    <div className="mt-20 mx-auto md:w-[850px] rounded-2xl overflow-hidden shadow-xl border border-zinc-200 bg-white flex flex-col md:flex-row min-h-[600px]">

      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex flex-col justify-center items-center p-10 w-full md:w-1/2">
        <div className="flex flex-col items-center mb-6">
          <Image
            src="https://img.icons8.com/fluency/48/supabase.png"
            alt="Supabase Logo"
            className="h-10 mb-2"
            width={40}
            height={20}
          />
          <h2 className="text-2xl font-semibold text-white/90">Supabase Authentication</h2>
        </div>

        <div className="text-3xl font-extrabold mb-4 text-center">
          Reset Your Password
        </div>
        <p className="text-indigo-100 text-center text-base mb-6 px-4">
          Enter your new password to regain access to your account.
        </p>
        <Lock className="h-24 w-24 text-white/30" />
      </div>

      <div className="flex-1 bg-white p-8 md:p-12 flex flex-col justify-center">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800 mb-4">
            Set a New Password
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block mb-1 text-sm font-medium text-zinc-700">
                New Password
              </label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-zinc-700">
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button
              onClick={handleReset}
              disabled={loading}
              className="cursor-pointer w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              {loading ? 'Updating...' : 'Reset Password'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
