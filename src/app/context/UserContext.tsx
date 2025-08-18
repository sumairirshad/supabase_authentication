'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

interface UserContextType {
  userId: string | null
  setUserId: (id: string | null) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const getSessionUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const id = session?.user?.id ?? null
      setUserId(id)
    }

    getSessionUser()

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const id = session?.user?.id ?? null
        setUserId(id)
      }
    )

    return () => {
      subscription?.subscription.unsubscribe()
    }
  }, [])

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
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
