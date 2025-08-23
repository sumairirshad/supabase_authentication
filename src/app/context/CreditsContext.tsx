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

  useEffect(() => {
    if(!userId) return;
    
    const initializeCredits = async (uid: string) => {
      const { data, error: selectError } = await supabase
        .from('credits_ledger')
        .select('id')
        .eq('userId', uid)
        .single()

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Select error:', selectError)
        return
      }

      if (!data) {
        const { error: insertError } = await supabase
          .from('credits_ledger')
          .insert({ userId: uid, credits: 100 })

        if (insertError) {
          console.error('Insert error:', insertError)
          return
        }
      }

      fetchCredits()
    }

    if (userId) {
      initializeCredits(userId)
    }
  }, [userId])

  const deductCredits = async (amount: number) => {
    if (!userId) return

    try {
      const { error } = await supabase.from('credits_ledger').insert({
        userId,
        credits: -amount,
        created_at: new Date()
      })

      if (error) {
        console.error('Failed to deduct credits:', error)
        return
      }

      fetchCredits()
    } catch (err: any) {
      console.error('Unexpected error deducting credits:', err)
    }
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
