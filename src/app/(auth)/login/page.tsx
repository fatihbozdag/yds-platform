'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { firebase } from '@/lib/firebase-client'
import { isDemoMode } from '@/lib/firebase-demo'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card, { CardHeader, CardContent, CardFooter } from '@/components/ui/Card'
import DarkModeToggle from '@/components/ui/DarkModeToggle'

// Avoid stale cached HTML/CSS by forcing dynamic rendering
export const dynamic = 'force-dynamic'

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır')
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })

  const handleLogin = async (data: LoginForm) => {
    setLoading(true)
    setError(null)
    
    console.log('Login form submitted:', data)

    try {
      const { data: authData, error: authError } = await firebase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        throw authError
      }

      if (authData.user) {
        // Get user profile to check role
        const { data: profile, error: profileError } = await firebase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single()

        if (profileError) {
          console.error('Profile fetch error:', profileError)
          // If profile doesn't exist, redirect to student dashboard
          router.push('/dashboard')
          return
        }

        // Redirect based on role
        if (profile.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error: unknown) {
      console.error('Login error:', error)
      
      // Handle different error types
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (errorMessage.includes('Invalid login credentials')) {
        setError('E-posta veya şifre hatalı')
      } else if (errorMessage.includes('Email not confirmed')) {
        setError('E-posta adresinizi onaylamanız gerekiyor')
      } else {
        setError('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyiniz.')
      }
    } finally {
      setLoading(false)
    }
  }

  // (Auto-login via query param removed to avoid prerender issues)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header with dark mode toggle */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
              <span className="text-white font-bold text-lg">YDS</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Platform
            </span>
          </Link>
          <DarkModeToggle />
        </div>

        <Card variant="glass" padding="lg" className="backdrop-blur-sm">
          <CardHeader 
            title="Hoş Geldiniz!"
            subtitle="Hesabınıza giriş yapın"
            className="text-center"
          />

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <CardContent>
            <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
              <Input
                {...register('email')}
                type="email"
                label="E-posta Adresi"
                placeholder="ornek@email.com"
                error={errors.email?.message}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />

              <Input
                {...register('password')}
                type="password"
                label="Şifre"
                placeholder="Şifrenizi giriniz"
                error={errors.password?.message}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                }
              >
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>
              {isDemoMode() && (
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={() => handleLogin({ email: 'student@demo.com', password: 'demo123' })}
                >
                  Demo olarak giriş yap
                </Button>
              )}
            </form>
          </CardContent>

          {/* Demo Credentials */}
          {isDemoMode() && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🎯</span>
                <h3 className="text-sm font-semibold text-blue-800">Demo Mode - Test Accounts</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-blue-700 flex items-center gap-1">
                    <span>👨‍🎓</span>
                    Student:
                  </span>
                  <code className="bg-white px-2 py-1 rounded text-blue-800 font-mono">student@demo.com / demo123</code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-blue-700 flex items-center gap-1">
                    <span>👨‍💼</span>
                    Admin:
                  </span>
                  <code className="bg-white px-2 py-1 rounded text-blue-800 font-mono">admin@demo.com / admin123</code>
                </div>
              </div>
            </div>
          )}

          <CardFooter>
            <div className="text-center w-full">
              <p className="text-sm text-slate-600">
                Hesabınız yok mu?{' '}
                <Link href="/register" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                  Kayıt Ol
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}