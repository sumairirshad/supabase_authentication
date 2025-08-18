'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from './ui/button'
import { useUser } from '../context/UserContext'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function Header() {
    const { setUserId } = useUser()
    const router = useRouter()

    const logout = async () => {
        await supabase.auth.signOut()
        setUserId(null)
        toast.success('You have been logged out');
        router.push('/')
    }
    
  return (
    <header className="flex justify-between items-center px-6 py-4 bg-gray-800 text-white shadow">
      <h1 className="text-xl font-semibold">🎙 Whisper Transcriber</h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-gray-700 px-3 py-1.5 rounded-full">
          <Image
            src="https://img.icons8.com/emoji/48/coin-emoji.png"
            alt="Credits"
            width={24}
            height={24}
          />
          <span className="text-sm font-medium">Your Credits: 200</span>
        </div>

        <Link href="/buy-credits">
          <button className="bg-yellow-500 hover:bg-yellow-600 text-black text-sm font-medium px-4 py-1.5 rounded transition duration-200">
            Buy Credits
          </button>
        </Link>

        <Button onClick={logout} className="cursor-pointer bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-1.5 rounded transition duration-200">
            Logout
        </Button>
      </div>
    </header>
  )
}
