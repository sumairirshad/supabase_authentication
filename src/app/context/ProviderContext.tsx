'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface ProviderContextType {
  currentProvider: string
  setProvider: (provider: string) => void
}

const ProviderContext = createContext<ProviderContextType | undefined>(undefined)

export const ProviderProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentProvider, setCurrentProvider] = useState<string>('')

  useEffect(() => {
    const storedProvider = localStorage.getItem('auth_provider')
    if (storedProvider) {
      setCurrentProvider(storedProvider)
    }
  }, [])

  const setProvider = (provider: string) => {
    setCurrentProvider(provider)
    localStorage.setItem('auth_provider', provider)
  }

  return (
    <ProviderContext.Provider value={{ currentProvider, setProvider }}>
      {children}
    </ProviderContext.Provider>
  )
}

export const useProvider = () => {
  const context = useContext(ProviderContext)
  if (!context) {
    throw new Error('useProvider must be used within a ProviderProvider')
  }
  return context
}
