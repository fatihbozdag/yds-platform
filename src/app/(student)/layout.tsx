'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { firebase } from '@/lib/firebase-client'
import StudentNavigation from '@/components/navigation/StudentNavigation'
import { Profile } from '@/types'
import { User as FirebaseUser } from 'firebase/auth'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailVerified, setEmailVerified] = useState(true)
  const [showBanner, setShowBanner] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [router])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await firebase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Check email verification status
      setEmailVerified(user.emailVerified || false)

      const { data: profileData, error } = await firebase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Profile fetch error:', error)
      } else {
        setProfile(profileData)

        // Check if user is admin trying to access student pages
        if (profileData.role === 'admin') {
          router.push('/admin')
          return
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user || !user.email) return

      // Send verification email using Firebase directly
      const { sendEmailVerification } = await import('firebase/auth')
      const { auth } = await import('@/lib/firebase-config')
      const currentUser = auth.currentUser

      if (currentUser) {
        await sendEmailVerification(currentUser, {
          url: 'https://yds-yokdil.netlify.app/login',
          handleCodeInApp: false
        })
        alert('Doğrulama e-postası gönderildi! Lütfen gelen kutunuzu kontrol edin.')
      }
    } catch (error) {
      console.error('Resend verification error:', error)
      alert('E-posta gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.')
    }
  }

  const handleLogout = () => {
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Erişim Hatası</h1>
          <p className="text-slate-600 mb-6">
            Profil bilgileriniz yüklenemedi. Lütfen tekrar giriş yapmayı deneyin.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="btn-primary"
          >
            Giriş Sayfasına Dön
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <StudentNavigation
        userProfile={profile}
        onLogout={handleLogout}
      />

      {/* Email Verification Banner */}
      {!emailVerified && showBanner && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    E-posta adresiniz henüz doğrulanmadı.
                  </p>
                  <p className="text-sm text-amber-700">
                    Hesabınızın tüm özelliklerine erişmek için lütfen e-posta adresinizi doğrulayın.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResendVerification}
                  className="text-sm font-medium text-amber-900 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-lg transition-colors"
                >
                  Yeniden Gönder
                </button>
                <button
                  onClick={() => setShowBanner(false)}
                  className="text-amber-600 hover:text-amber-800 p-1"
                  aria-label="Kapat"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="pb-8">
        {children}
      </main>
    </div>
  )
}