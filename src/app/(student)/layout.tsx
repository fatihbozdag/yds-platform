'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { firebase } from '@/lib/firebase-client'
import StudentNavigation from '@/components/navigation/StudentNavigation'
import { Profile } from '@/types'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

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
      
      <main className="pb-8">
        {children}
      </main>
    </div>
  )
}