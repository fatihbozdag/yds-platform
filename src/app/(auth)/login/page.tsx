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


const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır')
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResendForm, setShowResendForm] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState<string | null>(null)
  const [resendError, setResendError] = useState<string | null>(null)

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

    try {
      const { data: authData, error: authError } = await firebase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        throw authError
      }

      if (authData.user) {
        const { data: profile, error: profileError } = await firebase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single()

        if (profileError) {
          console.error('Profile fetch error:', profileError)
          router.push('/dashboard')
          return
        }

        if (profile.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error: unknown) {
      console.error('Login error:', error)
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

  const handleResendVerification = async (data: LoginForm) => {
    setResendLoading(true)
    setResendError(null)
    setResendSuccess(null)

    try {
      const { error: resendError } = await firebase.auth.resendVerificationEmail({
        email: data.email,
        password: data.password
      })

      if (resendError) {
        throw resendError
      }

      setResendSuccess('Doğrulama e-postası gönderildi! Gelen kutunuzu kontrol edin.')
      setTimeout(() => {
        setShowResendForm(false)
        setResendSuccess(null)
      }, 3000)
    } catch (error: unknown) {
      console.error('Resend verification error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (errorMessage.includes('Invalid login credentials')) {
        setResendError('E-posta veya şifre hatalı')
      } else if (errorMessage.includes('Email already verified')) {
        setResendError('E-posta zaten doğrulanmış. Giriş yapabilirsiniz.')
      } else {
        setResendError('E-posta gönderilirken bir hata oluştu. Lütfen tekrar deneyiniz.')
      }
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/30 flex items-center justify-center p-4">
      {/* Modern Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <span className="text-white font-bold text-lg">YDS</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
              Platform
            </span>
          </Link>
          <DarkModeToggle />
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Hoş Geldiniz</h1>
              <p className="text-slate-600">Hesabınıza giriş yapın</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(handleLogin)} className="space-y-5">
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
                className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700"
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
                  className="border-2 border-slate-200 hover:border-cyan-300"
                >
                  Demo olarak giriş yap
                </Button>
              )}
            </form>

            {/* Demo Credentials */}
            {isDemoMode() && (
              <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🎯</span>
                  <h3 className="text-sm font-semibold text-cyan-800">Demo Mode - Test Accounts</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-cyan-700">👨‍🎓 Student:</span>
                    <code className="bg-white px-2 py-1 rounded text-cyan-800 font-mono">student@demo.com / demo123</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-cyan-700">👨‍💼 Admin:</span>
                    <code className="bg-white px-2 py-1 rounded text-cyan-800 font-mono">admin@demo.com / admin123</code>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="text-center space-y-3">
                <p className="text-sm text-slate-600">
                  Hesabınız yok mu?{' '}
                  <Link href="/register" className="text-cyan-600 hover:text-cyan-700 font-semibold transition-colors">
                    Kayıt Ol
                  </Link>
                </p>
                <button
                  type="button"
                  onClick={() => setShowResendForm(!showResendForm)}
                  className="text-sm text-cyan-600 hover:text-cyan-700 transition-colors underline"
                >
                  Doğrulama e-postası almadınız mı?
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Resend Verification Form */}
        {showResendForm && (
          <div className="mt-4 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Doğrulama E-postası Gönder</h2>
              <p className="text-sm text-slate-600">E-posta ve şifrenizi girerek yeni bir doğrulama e-postası alabilirsiniz</p>
            </div>

            {resendSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-700 text-sm font-medium">{resendSuccess}</p>
                </div>
              </div>
            )}

            {resendError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">{resendError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(handleResendVerification)} className="space-y-5">
              <Input
                {...register('email')}
                type="email"
                label="E-posta Adresi"
                placeholder="ornek@email.com"
                error={errors.email?.message}
              />

              <Input
                {...register('password')}
                type="password"
                label="Şifre"
                placeholder="Şifrenizi giriniz"
                error={errors.password?.message}
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={() => setShowResendForm(false)}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={resendLoading}
                  className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700"
                >
                  {resendLoading ? 'Gönderiliyor...' : 'E-posta Gönder'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
