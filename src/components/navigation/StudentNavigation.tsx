'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { firebase } from '@/lib/firebase-client'
import DarkModeToggle from '@/components/ui/DarkModeToggle'

interface NotificationBadgeProps {
  count: number
}

const NotificationBadge = ({ count }: NotificationBadgeProps) => {
  if (count === 0) return null
  
  return (
    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[18px] h-[18px] shadow-lg">
      {count > 99 ? '99+' : count}
    </span>
  )
}

interface StudentNavigationProps {
  userProfile?: {
    id: string
    full_name: string
    email: string
    role: string
  }
  onLogout?: () => void
}

export default function StudentNavigation({ userProfile, onLogout }: StudentNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [incompleteGoals, setIncompleteGoals] = useState(0)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    if (userProfile?.id) {
      fetchNotificationCounts()
    }
  }, [userProfile?.id])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu])

  const fetchNotificationCounts = async () => {
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) return

      const notificationsKey = `notifications_${user.id}`
      const storedNotifications = localStorage.getItem(notificationsKey)
      const notifications = storedNotifications ? JSON.parse(storedNotifications) : []
      const unreadCount = notifications.filter((n: any) => !n.is_read).length
      setUnreadNotifications(unreadCount)

      const goalsKey = `student_goals_${user.id}`
      const storedGoals = localStorage.getItem(goalsKey)
      const goals = storedGoals ? JSON.parse(storedGoals) : []
      const activeGoalsCount = goals.filter((g: any) => g.status === 'active').length
      setIncompleteGoals(activeGoalsCount)
    } catch (error) {
      console.error('Error fetching notification counts:', error)
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await firebase.auth.signOut()
      if (error) throw error
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      if (onLogout) {
        onLogout()
      }
    }
  }

  const navigationItems = [
    {
      href: '/dashboard',
      label: 'Ana Sayfa',
      icon: '🏠',
      description: 'Dashboard ve genel bakış'
    },
    {
      href: '/konular',
      label: 'Konular',
      icon: '📚',
      description: 'YDS konularını öğren'
    },
    {
      href: '/sinavlar',
      label: 'Sınavlar',
      icon: '📝',
      description: 'Deneme sınavları çöz'
    },
    {
      href: '/favoriler',
      label: 'Favorilerim',
      icon: '⭐',
      description: 'Favori konularım'
    },
    {
      href: '/ilerleme',
      label: 'İlerleme',
      icon: '📊',
      description: 'Performans takibi'
    },
    {
      href: '/analitik',
      label: 'Analitik',
      icon: '📈',
      description: 'Detaylı öğrenme analitiği'
    },
    {
      href: '/hedefler',
      label: 'Hedeflerim',
      icon: '🎯',
      description: 'Çalışma hedeflerin',
      badge: incompleteGoals > 0 ? incompleteGoals : undefined,
      badgeColor: 'bg-cyan-500'
    },
    {
      href: '/bildirimler',
      label: 'Bildirimler',
      icon: '🔔',
      description: 'Sistem bildirimleri',
      badge: unreadNotifications,
      badgeColor: 'bg-red-500'
    },
    {
      href: '/egitmene-sor',
      label: 'Eğitmene Sor',
      icon: '💬',
      description: 'Uzman desteği al'
    }
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                <span className="text-white font-bold text-lg">YDS</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">YDS Platform</h1>
                <p className="text-xs text-slate-500">Hazırlık Platformu</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              <DarkModeToggle className="hidden sm:block" />
              
              {/* Quick Actions */}
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/bildirimler"
                  className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-cyan-50 rounded-xl transition-all duration-200 border border-transparent hover:border-cyan-200"
                  title="Bildirimler"
                >
                  <span className="text-xl">🔔</span>
                  <NotificationBadge count={unreadNotifications} />
                </Link>
                
                <Link
                  href="/hedefler"
                  className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-purple-50 rounded-xl transition-all duration-200 border border-transparent hover:border-purple-200"
                  title="Hedeflerim"
                >
                  <span className="text-xl">🎯</span>
                  {incompleteGoals > 0 && (
                    <NotificationBadge count={incompleteGoals} />
                  )}
                </Link>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">
                    {userProfile?.full_name || 'Öğrenci'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {userProfile?.email}
                  </p>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {userProfile?.full_name?.charAt(0) || 'Ö'}
                    </div>
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                      <Link
                        href="/profil"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-cyan-50 transition-colors"
                      >
                        <span className="text-lg">👤</span>
                        Profil Ayarları
                      </Link>
                      <Link
                        href="/ayarlar"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-cyan-50 transition-colors"
                      >
                        <span className="text-lg">⚙️</span>
                        Ayarlar
                      </Link>
                      <div className="border-t border-slate-200 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <span className="text-lg">🚪</span>
                        Çıkış Yap
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modern Navigation Tabs */}
      <nav className="sticky top-16 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide -mb-px">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-2.5 px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200 ${
                  isActive(item.href)
                    ? 'border-cyan-500 text-cyan-600 bg-gradient-to-t from-cyan-50/50 to-transparent'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <span className={`text-lg transition-transform duration-200 ${isActive(item.href) ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className={`inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white rounded-full min-w-[18px] h-[18px] shadow-md ${item.badgeColor || 'bg-red-500'}`}>
                    {item.badge}
                  </span>
                )}
                {isActive(item.href) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full"></div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  )
}
