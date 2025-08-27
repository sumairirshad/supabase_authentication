'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useUser } from './UserContext'

interface CreditsContextType {
  credits: number
  deductCredits: (amount: number) => Promise<void>
  fetchCredits: () => Promise<void>
  loading: boolean
  addCreditsAfterPurchase: (userId: string, credits: number) => Promise<void>
  checkAvailableCredits: () => Promise<number>
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined)

export const CreditsProvider = ({ children }: { children: React.ReactNode }) => {
  const [credits, setCredits] = useState<number>(0)
  const { userId } = useUser()
  const [loading, setLoading] = useState<boolean>(true)

  const fetchCredits = useCallback(async () => {
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
  }, [userId])

  useEffect(() => {
    if (!userId) return

    const initializeCredits = async (uid: string) => {
      const { data, error: selectError } = await supabase
        .from('credits_ledger')
        .select('id')
        .eq('userId', uid)

      if (selectError && selectError.code !== 'PGRST116') return

      if (!data || data.length === 0) {
        await supabase.from('credits_ledger').insert({ userId: uid, credits: 100 })
      }

      fetchCredits()
    }

    initializeCredits(userId)
  }, [userId, fetchCredits])

  const deductCredits = async (amount: number) => {
    if (!userId) return

    try {
      const { error } = await supabase.from('credits_ledger').insert({
        userId,
        credits: -amount,
        created_at: new Date(),
      })

      if (error) {
        console.error('Failed to deduct credits:', error)
        return
      }

      fetchCredits()
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Unexpected error deducting credits:', err.message)
      } else {
        console.error('Unexpected non-error thrown:', err)
      }
    }
  }

  const addCreditsAfterPurchase = async (userId: string, amount: number) => {
    if (!userId) return

    await supabase.from('credits_ledger').insert({
      userId,
      credits: amount,
    })

    fetchCredits()
  }

  const checkAvailableCredits = async (): Promise<number> => {
    if (!userId) return 0

    setLoading(true)

    const { data, error } = await supabase
      .from('credits_ledger')
      .select('credits')
      .eq('userId', userId)

    setLoading(false)

    if (error) {
      console.error('Error fetching credits:', error)
      return 0
    }

    const totalCredits = data?.reduce((sum, entry) => sum + entry.credits, 0) || 0
    return totalCredits
  }

  return (
    <CreditsContext.Provider
      value={{
        credits,
        deductCredits,
        fetchCredits,
        loading,
        addCreditsAfterPurchase,
        checkAvailableCredits,
      }}
    >
      {children}
    </CreditsContext.Provider>
  )
}

export const useCredits = () => {
  const context = useContext(CreditsContext)
  if (!context) throw new Error('useCredits must be used inside CreditsProvider')
  return context
}
