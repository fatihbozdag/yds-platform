'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { firebase } from '@/lib/firebase-client'
import { Profile } from '@/types'
import Button from '@/components/ui/Button'
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
    { name: 'Dashboard', href: '/admin', icon: '🏠', description: 'Genel bakış' },
    { name: 'Konu Yönetimi', href: '/admin/konular', icon: '📚', description: 'İçerik yönet' },
    { name: 'Sınav Yönetimi', href: '/admin/sinavlar', icon: '📝', description: 'Sınavları düzenle' },
    { name: 'Öğrenci İstatistikleri', href: '/admin/ogrenciler', icon: '👥', description: 'Performans takibi' },
    { name: 'Eğitmene Sor', href: '/admin/sorular', icon: '❓', description: 'Soruları yanıtla' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Yetki kontrol ediliyor..." />
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-base">A</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">YDS Admin Panel</h1>
                <p className="text-xs text-slate-500">Yönetim Paneli</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DarkModeToggle />
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  {profile.full_name}
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
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white min-h-screen border-r border-slate-200">
          <nav className="p-5">
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-1">Yönetim Menüsü</h2>
              <p className="text-xs text-slate-600">Platform yönetimi</p>
            </div>
            <ul className="space-y-1.5">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`text-base mr-3 transition-transform duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}>
                        {item.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.name}</div>
                        <div className={`text-xs truncate ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
