"use client"
import { useAuth } from "./context/AuthContext";
import { useLocation } from 'wouter'
import { useState } from "react";
import { AuthForm } from "./components/AuthForm";
import { SocialLogin } from "./components/SocialLogin";
import { AccountLinkingModal } from "./components/AccountLinkingModal";


export default function Home() {
  const { user } = useAuth()
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [accountConflict, setAccountConflict] = useState<{
    provider: string
    email: string
  } | null>(null)

  const handleAccountConflict = (provider: string, email: string) => {
    setAccountConflict({ provider, email })
  }

  const closeAccountConflict = () => {
    setAccountConflict(null)
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-6 ">
      <div className="w-fullspace-y-6 bg-white p-8 rounded-xl borderx">
        <AuthForm onForgotPassword={() => setShowForgotPassword(true)} />
      </div>

      <AccountLinkingModal
        open={!!accountConflict}
        onClose={closeAccountConflict}
        provider={accountConflict?.provider || ''}
        email={accountConflict?.email || ''}
      />
    </div>
  )
}
