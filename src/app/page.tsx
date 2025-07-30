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
  <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200">
          <AuthForm onForgotPassword={() => setShowForgotPassword(true)} />
          
          <div className="mt-6">
            <SocialLogin onAccountConflict={handleAccountConflict} />
          </div>
        </div>
      </div>

      <AccountLinkingModal
        open={!!accountConflict}
        onClose={closeAccountConflict}
        provider={accountConflict?.provider || ''}
        email={accountConflict?.email || ''}
      />

    </div>
  );
}
