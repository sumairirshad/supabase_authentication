import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { FaGoogle,  FaTwitter } from 'react-icons/fa'
import { supabase } from '../lib/supabase'


export function SocialLogin() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
 
  
  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'twitter') => {
    setLoadingProvider(provider)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/dashboard`,
        scopes: provider === 'facebook' ? 'email,public_profile' : undefined },
      })
      if (error) throw error
    } catch (err) {
      console.error(`OAuth error (${provider}):`, err)
    } finally {
      setLoadingProvider(null)
    }
  }

  const socialProviders = [
    {
      name: 'google',
      label: 'Google',
      icon: FaGoogle,
      color: 'text-red-500',
      provider: 'google' as const,
    },
    // {
    //   name: 'facebook',
    //   label: 'Facebook',
    //   icon: FaFacebook,
    //   color: 'text-blue-600',
    //   provider: 'facebook' as const,
    // },
    {
      name: 'twitter',
      label: 'Twitter',
      icon: FaTwitter,
      color: 'text-blue-400',
      provider: 'twitter' as const,
    },
  ]

  return (
    <div className="space-y-6 mt-8">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-zinc-700" />
        </div>
        <div className="relative flex justify-center text-sm text-gray-500 dark:text-gray-400 bg-white px-2">
          Or continue with
        </div>
      </div>

      <div className="flex justify-center gap-6">
        {socialProviders.map((social) => {
          const Icon = social.icon
          const isLoading = loadingProvider === social.name

          return (
            <div key={social.name} className="flex flex-col items-center space-y-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin(social.provider)}
                disabled={isLoading}
                className="cursor-pointer h-12 w-12 p-0 rounded-full flex items-center justify-center border border-gray-300 dark:border-zinc-700 hover:bg-black dark:hover:bg-zinc-800 transition-all"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                ) : (
                  <Icon className={`h-5 w-5 ${social.color}`} />
                )}
              </Button>
              <span className="text-xs text-black">{social.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
