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
    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[20px] h-[20px]">
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

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const fetchNotificationCounts = async () => {
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) return

      // Fetch unread notifications from localStorage
      const notificationsKey = `notifications_${user.id}`
      const storedNotifications = localStorage.getItem(notificationsKey)
      const notifications = storedNotifications ? JSON.parse(storedNotifications) : []
      const unreadCount = notifications.filter((n: any) => !n.is_read).length
      setUnreadNotifications(unreadCount)

      // Fetch incomplete goals from localStorage
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
      badgeColor: 'bg-blue-500'
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
      icon: '❓',
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
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-slate-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold text-lg">YDS</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">YDS Platform</h1>
                <p className="text-xs text-slate-500">Hazırlık Platformu</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              {/* Dark Mode Toggle */}
              <DarkModeToggle className="hidden sm:block" />
              
              {/* Quick Actions */}
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/bildirimler"
                  className="group relative p-3 text-slate-600 hover:text-slate-900 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200"
                  title="Bildirimler"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform duration-200">🔔</span>
                  <NotificationBadge count={unreadNotifications} />
                </Link>
                
                <Link
                  href="/hedefler"
                  className="group relative p-3 text-slate-600 hover:text-slate-900 hover:bg-purple-50 rounded-xl transition-all duration-200 border border-transparent hover:border-purple-200"
                  title="Hedeflerim"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform duration-200">🎯</span>
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
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                      {userProfile?.full_name?.charAt(0) || 'Ö'}
                    </div>
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                      <Link
                        href="/profil"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <span className="text-lg">👤</span>
                        Profil Ayarları
                      </Link>
                      <Link
                        href="/ayarlar"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <span className="text-lg">⚙️</span>
                        Ayarlar
                      </Link>
                      <div className="border-t border-slate-200 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
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

      {/* Navigation Tabs */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/50 sticky top-[73px] z-30 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-3 transition-all duration-200 ${
                  isActive(item.href)
                    ? 'border-blue-500 text-blue-600 bg-gradient-to-t from-blue-50 to-transparent'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className={`text-lg transition-transform duration-200 ${isActive(item.href) ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white rounded-full min-w-[20px] h-[20px] shadow-lg ${item.badgeColor || 'bg-red-500'}`}>
                    {item.badge}
                  </span>
                )}
                {isActive(item.href) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  )
}