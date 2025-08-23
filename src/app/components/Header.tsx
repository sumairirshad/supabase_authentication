'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useUser } from '../context/UserContext'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useCredits } from '../context/CreditsContext'
import { useEffect, useRef, useState } from 'react'

export default function Header() {
    const { setUserId,name, avatar } = useUser()
    const router = useRouter()
    const { credits, loading } = useCredits()
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
 
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [])

    const logout = async () => {
        await supabase.auth.signOut()
        setUserId(null)
        toast.success('You have been logged out');
        router.push('/')
    }
    
  return (
    <header className="flex justify-between items-center px-6 py-4 bg-gray-900 text-white shadow-2xl">
      <div className="flex-1" />
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        <div className="flex items-center gap-2 bg-gray-700 px-3 py-1.5 rounded-full">
          <Image
            src="https://img.icons8.com/emoji/48/coin-emoji.png"
            alt="Credits"
            width={24}
            height={24}
          />
          <span className="text-sm font-medium">
            {loading ? 'Loading...' : `Your Credits: ${credits}`}
          </span>
        </div>

        <Link
          href="/pricing"
          className="cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-black text-sm font-medium px-4 py-1.5 rounded transition duration-200"
        >
          Buy Credits
        </Link>

        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 cursor-pointer focus:outline-none"
        >
          <Image
            src={avatar || '/assets/icons8-user-50.png'}
            alt="User avatar"
            width={36}
            height={36}
            className="rounded-full"
          />
          <span className="text-sm font-medium">{name}</span>
        </button>

        {open && (
         <div className="absolute top-14 right-0 mt-2 bg-white text-black shadow-xl rounded-md w-52 z-50 overflow-hidden border border-gray-200">
          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-100 text-gray-800 transition"
          >
           <Image src={'/assets/icons8-user-50.png'} width={20} height={20} alt=''></Image> Profile
          </Link>
          <button
            onClick={logout}
            className="cursor-pointer flex items-center w-full gap-2 px-4 py-3 text-sm hover:bg-red-100 text-red-600 transition"
          >
          <Image src={'https://img.icons8.com/color/50/exit.png'} width={20} height={20} alt=''></Image>  Logout
          </button>
        </div>

        )}
      </div>
    </header>
  )
}
