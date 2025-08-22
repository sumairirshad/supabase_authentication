// context/UserContext.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

interface UserContextType {
  userId: string | null
  name: string | null
  avatar: string | null
  provider: string | null
  email:string | null
  setUserId: (id: string | null) => void
  setProfile: (info: { name: string; avatar: string; provider: string, email:string }) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [provider, setProvider] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  const setProfile = ({
    name,
    avatar,
    provider,
    email
  }: {
    name: string
    avatar: string
    provider: string
    email: string
  }) => {
    setName(name)
    setAvatar(avatar)
    setProvider(provider)
    setEmail(email)
  }

  useEffect(() => {
    const getSessionUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user

      if (user) {
        setUserId(user.id)
        setName(user.user_metadata.full_name || 'Anonymous')
        setAvatar(user.user_metadata.avatar_url || '/default-avatar.png')
        setProvider(user.app_metadata?.provider || 'email')
        setEmail(user.email || '')
      }
    }

    getSessionUser()

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user
      if (user) {
        console.log(user)
        setUserId(user.id)
        setName(user.user_metadata.full_name || 'Anonymous')
        setAvatar(user.user_metadata.avatar_url || '/assets/icons8-user-50.png')
        setProvider(user.app_metadata?.provider || 'email')
        setEmail(user.email || '')
      } else {
        setUserId(null)
        setName(null)
        setAvatar(null)
        setProvider(null)
        setEmail(null)
      }
    })

    return () => {
      subscription?.subscription.unsubscribe()
    }
  }, [])

  return (
    <UserContext.Provider value={{ userId, name, avatar, provider,email , setUserId, setProfile }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = (): UserContextType => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
