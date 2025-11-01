'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { firebase } from '@/lib/firebase-client'

interface Notification {
  id: string
  student_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'reminder'
  link?: string
  is_read: boolean
  created_at: string
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // For demo mode, create some sample notifications
      const demoNotifications: Notification[] = [
        {
          id: 'notif-1',
          student_id: user.id,
          title: '🎯 Hedef Tamamlandı!',
          message: 'Tebrikler! "Haftada 3 Sınav Çöz" hedefinizi tamamladınız.',
          type: 'success',
          link: '/hedefler',
          is_read: false,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'notif-2',
          student_id: user.id,
          title: '📚 Yeni Konu Eklendi',
          message: 'Modal Verbs konusu platforma eklendi. Hemen öğrenmeye başlayın!',
          type: 'info',
          link: '/konular',
          is_read: false,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'notif-3',
          student_id: user.id,
          title: '⏰ Çalışma Hatırlatması',
          message: 'Bugün henüz çalışmadınız. Günlük hedefinize ulaşmak için başlayın!',
          type: 'reminder',
          is_read: true,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'notif-4',
          student_id: user.id,
          title: '✅ Sorunuz Cevaplandı',
          message: 'Eğitmene sorduğunuz "Passive Voice" sorusu cevaplandı.',
          type: 'success',
          link: '/egitmene-sor',
          is_read: true,
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'notif-5',
          student_id: user.id,
          title: '📊 Haftalık Performans Raporu',
          message: 'Bu hafta 5 sınav çözdünüz ve ortalama %75 başarı elde ettiniz. Harika gidiyorsunuz!',
          type: 'info',
          link: '/ilerleme',
          is_read: false,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'notif-6',
          student_id: user.id,
          title: '⚠️ Hedef Tarihi Yaklaşıyor',
          message: '"YDS Hedef Puan: 85" hedefinizin bitiş tarihine 7 gün kaldı.',
          type: 'warning',
          link: '/hedefler',
          is_read: false,
          created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]

      setNotifications(demoNotifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      // In a real app, this would update the database
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      // In a real app, this would update all notifications in the database
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      // In a real app, this would delete from database
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'reminder': return '⏰'
      default: return 'ℹ️'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'reminder': return 'text-purple-600 bg-purple-50 border-purple-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const notifDate = new Date(date)
    const diffMs = now.getTime() - notifDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} dakika önce`
    if (diffHours < 24) return `${diffHours} saat önce`
    if (diffDays < 7) return `${diffDays} gün önce`
    return notifDate.toLocaleDateString('tr-TR')
  }

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Bildirimler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Bildirimler</h1>
        <p className="text-slate-600">
          Sistem bildirimleri ve hatırlatıcılarınız
        </p>
      </div>

      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tümü ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Okunmamış ({unreadCount})
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ✓ Tümünü Okundu İşaretle
          </button>
        )}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {filter === 'unread' ? 'Okunmamış bildirim yok' : 'Henüz bildirim yok'}
          </h3>
          <p className="text-slate-600">
            Yeni bildirimler burada görünecek
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`card p-4 border-l-4 ${getTypeColor(notification.type)} ${
                !notification.is_read ? 'ring-2 ring-blue-500 ring-opacity-20' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{getTypeIcon(notification.type)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {notification.title}
                        {!notification.is_read && (
                          <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {getTimeAgo(notification.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-slate-700 ml-9">{notification.message}</p>
                  
                  {notification.link && (
                    <Link
                      href={notification.link}
                      className="inline-block mt-3 ml-9 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Detayları Gör →
                    </Link>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-slate-400 hover:text-slate-600"
                      title="Okundu işaretle"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-slate-400 hover:text-red-600"
                    title="Sil"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button (for pagination in real app) */}
      {filteredNotifications.length >= 10 && (
        <div className="text-center mt-6">
          <button className="btn-secondary">
            Daha Fazla Yükle
          </button>
        </div>
      )}
    </div>
  )
}