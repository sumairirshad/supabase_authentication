'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail,  Lock } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Checkbox } from '@/app/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/components/ui/form'
import { AccountLinkingModal } from './AccountLinkingModal'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { SocialLogin } from './SocialLogin'
import { useUser } from '../context/UserContext'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

const signUpSchema = signInSchema

type SignInData = z.infer<typeof signInSchema>
type SignUpData = z.infer<typeof signUpSchema>

interface AuthFormProps {
  onForgotPassword: () => void
}

export function AuthForm({ onForgotPassword }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [conflictEmail, setConflictEmail] = useState<string | null>(null)
  const [conflictProvider, setConflictProvider] = useState<string | null>(null)
  const [showConflictModal, setShowConflictModal] = useState(false)
  const {setUserId, setProfile} = useUser();

  const form = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

const onSubmit = async  (data: SignInData) => {
  setIsLoading(true)

  const { email, password } = data
  try {
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success("Sign up successful! Check your email to verify.")
      }

    } else {
      const { data: loginData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message === "Invalid login credentials") {
          toast.error('Invalid email or password')
        } else if (error.message === "Email not confirmed") {
          toast.error('Please verify your email.')
          return
        } else {
          toast.error(error.message)
        }
      } else {
        const user = loginData?.user
        if (!user?.email_confirmed_at) {
          toast.error('Please verify your email.')
          return
        }

        if (loginData?.user?.id) {
           const user = loginData.user
            setUserId(user.id)

            setProfile({
              name: user.user_metadata.full_name ||  user.email?.split('@')[0] || 'Anonymous',
              avatar: user.user_metadata.avatar_url || '/assets/icons8-user-50.png',
              provider: user.app_metadata?.provider || 'email',
              email: user.email || ''
            })
        }
        toast.success("Logged in successfully!")
        window.location.href = '/dashboard'
      }
    }
  }  catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Something went wrong'

    if (
      errorMessage.includes('email_exists') ||
      errorMessage.includes('identity_already_exists')
    ) {
      const matchedProvider = errorMessage.match(/google|facebook|twitter/i)?.[0]
      setConflictProvider(matchedProvider ?? 'google')
      setConflictEmail(email)
      setShowConflictModal(true)
    } else {
      toast.error("Something went wrong!")
      console.error('Auth error:', err)
    }
  } finally {
    setIsLoading(false)
  }
}

  const toggleMode = () => {
    setIsSignUp((prev) => !prev)
    form.reset()
  }

return (
  <div className="mx-auto md:w-[850px] rounded-2xl overflow-hidden shadow-xl border border-zinc-200 bg-white flex flex-col md:flex-row min-h-[600px]">
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex flex-col justify-center items-center p-10 w-full md:w-1/2">
      <div className="text-4xl font-extrabold mb-4">
        {isSignUp ? 'Join Us Today!' : 'Welcome Back!'}
      </div>
      <p className="text-lg text-indigo-100 text-center mb-6 px-4">
        {isSignUp
          ? 'Sign up to unlock exclusive features and content.'
          : 'Login to continue exploring.'}
      </p>
      <Lock className="h-24 w-24 text-white/30" />
    </div>

    <div className="flex-1 bg-white p-8 md:p-12 flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold text-zinc-800 mb-2">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                      />
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-zinc-400"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isSignUp && (
              <div className="flex items-center justify-between text-sm text-zinc-600">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                          id="remember"
                        />
                      </FormControl>
                      <FormLabel htmlFor="remember" className="text-sm font-medium">
                        Remember me
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="cursor-pointer text-indigo-500 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                <>{isSignUp ? 'Create Account' : 'Sign In'}</>
              )}
            </Button>
          </form>
        </Form>

        <p className="text-sm text-center text-zinc-600 mt-4">
          {isSignUp ? 'Already have an account?' : 'Don’t have an account?'}{' '}
          <button
            type="button"
            onClick={toggleMode}
            className="cursor-pointer text-indigo-600 font-medium hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>

      <SocialLogin
        // onAccountConflict={(provider, email) => {
        //   setConflictProvider(provider)
        //   setConflictEmail(email)
        //   setShowConflictModal(true)
        // }}
      />
    </div>

    {/* Account Conflict Modal */}
    {showConflictModal && conflictEmail && conflictProvider && (
      <AccountLinkingModal
        open={showConflictModal}
        onClose={() => setShowConflictModal(false)}
        provider={conflictProvider}
        email={conflictEmail}
      />
    )}
  </div>
)



}
