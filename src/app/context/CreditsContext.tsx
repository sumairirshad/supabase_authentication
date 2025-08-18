'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useUser } from './UserContext'

interface CreditsContextType {
  credits: number
  deductCredits: (amount: number) => Promise<void>
  fetchCredits: () => Promise<void>
  loading: boolean,
  addCreditsAfterPurchase: (userId:string ,credits: number) => Promise<void> 
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined)

export const CreditsProvider = ({ children }: { children: React.ReactNode }) => {
  const [credits, setCredits] = useState<number>(0)
  const { userId } = useUser()
  const [loading, setLoading] = useState<boolean>(true)


  useEffect(() => {
    if (userId) {
      initializeCredits(userId)
    }
  }, [userId])

  const initializeCredits = async (uid: string) => {
    const { data, error } = await supabase
      .from('credits_ledger')
      .select('*')
      .eq('userId', uid)

    if (error) {
      console.error('Fetch ledger error:', error)
      return
    }

    if (data.length === 0) {
      await supabase.from('credits_ledger').insert({
        userId: uid,
        credits: 100
      })
    }

    fetchCredits()
  }

  const fetchCredits = async () => {
    if (!userId) return
    setLoading(true)

    const { data, error } = await supabase
        .from('credits_ledger')
        .select('credits')
        .eq('userId', userId)

    if (error) {
        console.error('Error fetching credits:', error)
        setLoading(false)
        return
    }

    const total = data.reduce((sum, record) => sum + record.credits, 0)
    setCredits(total)
    setLoading(false)
}

  const deductCredits = async (amount: number) => {
    if (!userId) return

    await supabase.from('credits_ledger').insert({
      userId,
      credits: -amount
    })

    fetchCredits()
  }

    const addCreditsAfterPurchase = async (userId:string ,amount: number) => {
        if (!userId) return

        await supabase.from('credits_ledger').insert({
            userId,
            credits: amount
        })

        fetchCredits()
    }

  return (
    <CreditsContext.Provider value={{ credits, deductCredits, fetchCredits, loading, addCreditsAfterPurchase }}>
      {children}
    </CreditsContext.Provider>
  )
}

export const useCredits = () => {
  const context = useContext(CreditsContext)
  if (!context) throw new Error('useCredits must be used inside CreditsProvider')
  return context
}
