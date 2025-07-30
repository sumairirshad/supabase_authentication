import { useState } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { Button } from '@/app/components/ui/button'
import { FaGoogle, FaFacebook, FaTwitter } from 'react-icons/fa'

interface SocialLoginProps {
  onAccountConflict: (provider: string, email: string) => void
}

export function SocialLogin({ onAccountConflict }: SocialLoginProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
  const { signInWithProvider } = useAuth()

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'twitter') => {
    setLoadingProvider(provider)
    try {
      const { error } = await signInWithProvider(provider)
      if (error && error.message.includes('already exists')) {
        const email = 'ssam70207@gmail.com'
        onAccountConflict(provider, email)
      }
    } catch (err) {
      console.error('Social login error:', err)
    } finally {
      setLoadingProvider(null)
    }
  }

  const socialProviders = [
    {
      name: 'google',
      label: 'Continue with Google',
      icon: FaGoogle,
      color: 'text-red-500',
      provider: 'google' as const,
    },
    {
      name: 'facebook',
      label: 'Continue with Facebook',
      icon: FaFacebook,
      color: 'text-blue-600',
      provider: 'facebook' as const,
    },
    {
      name: 'twitter',
      label: 'Continue with Twitter',
      icon: FaTwitter,
      color: 'text-blue-400',
      provider: 'twitter' as const,
    },
  ]

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {socialProviders.map((social) => {
          const Icon = social.icon
          const isLoading = loadingProvider === social.name

          return (
            <Button
              key={social.name}
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin(social.provider)}
              disabled={isLoading}
              className="w-full justify-center py-3"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              ) : (
                <span className={`mr-2 h-4 w-4 ${social.color}`}>[icon]</span>
              )}
              <span>{social.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
