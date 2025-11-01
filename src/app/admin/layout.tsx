'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { firebase } from '@/lib/firebase-client'
import { Profile } from '@/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import DarkModeToggle from '@/components/ui/DarkModeToggle'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
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

      if (error || !profileData || profileData.role !== 'admin') {
        console.error('Admin access denied:', error)
        router.push('/dashboard')
        return
      }

      setProfile(profileData)
    } catch (error) {
      console.error('Admin access check error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const { error } = await firebase.auth.signOut()
    if (error) {
      console.error('Logout error:', error)
    } else {
      router.push('/login')
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '🏠', description: 'Genel bakış ve istatistikler' },
    { name: 'Konu Yönetimi', href: '/admin/konular', icon: '📚', description: 'Eğitim içeriklerini yönet' },
    { name: 'Sınav Yönetimi', href: '/admin/sinavlar', icon: '📝', description: 'Sınavları oluştur ve düzenle' },
    { name: 'Öğrenci İstatistikleri', href: '/admin/ogrenciler', icon: '👥', description: 'Öğrenci performansını takip et' },
    { name: 'Eğitmene Sor', href: '/admin/sorular', icon: '❓', description: 'Öğrenci sorularını yanıtla' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Yetki kontrol ediliyor..." />
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Top Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-slate-200/50 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">YDS Admin Panel</h1>
                <p className="text-sm text-slate-500">Yönetim Paneli</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <DarkModeToggle />
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  Merhaba, {profile.full_name}!
                </p>
                <p className="text-xs text-slate-500">Admin</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                }
              >
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 bg-white/80 backdrop-blur-sm min-h-screen border-r border-slate-200/50 shadow-lg">
          <nav className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Yönetim Menüsü</h2>
              <p className="text-sm text-slate-600">Platform yönetimi için araçlar</p>
            </div>
            <ul className="space-y-3">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`group flex items-center px-4 py-4 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                          : 'text-slate-700 hover:bg-slate-100 hover:shadow-md'
                      }`}
                    >
                      <span className={`text-xl mr-4 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {item.icon}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold">{item.name}</div>
                        <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                          {item.description}
                        </div>
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}