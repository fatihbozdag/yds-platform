'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { firebase } from '@/lib/firebase-client'
import { Profile } from '@/types'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardContent } from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function AdminDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

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

        // Check if user is admin
        if (profileData.role !== 'admin') {
          router.push('/dashboard')
          return
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Dashboard yükleniyor..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-slate-900">
            Hoş Geldiniz, {profile?.full_name || 'Admin'}! 👨‍💼
          </h1>
        </div>
        <p className="text-slate-600">
          YDS Platform yönetim paneline hoş geldiniz. Platform yönetimi için araçları kullanabilirsiniz.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">📝</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">150+</p>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Toplam Soru</h3>
          <p className="text-xs text-slate-500">Soru bankasında</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-600">25+</p>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Aktif Sınav</h3>
          <p className="text-xs text-slate-500">Yayınlanmış sınav</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">👥</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600">1,250+</p>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Kayıtlı Öğrenci</h3>
          <p className="text-xs text-slate-500">Toplam kullanıcı</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">📚</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">50+</p>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Konu Anlatımı</h3>
          <p className="text-xs text-slate-500">Eğitim içeriği</p>
        </div>
      </div>

      {/* Management Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">📝</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Sorular</h3>
              <p className="text-xs text-slate-600">Sınav sorularını yönetin</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-4">Sınav sorularını ekleyin, düzenleyin ve organize edin.</p>
          <Link href="/admin/sorular">
            <Button variant="primary" fullWidth size="sm">
              Soruları Yönet
            </Button>
          </Link>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Sınavlar</h3>
              <p className="text-xs text-slate-600">Sınavları oluşturun</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-4">Yeni sınavlar oluşturun ve mevcut sınavları düzenleyin.</p>
          <Link href="/admin/sinavlar">
            <Button variant="success" fullWidth size="sm">
              Sınavları Yönet
            </Button>
          </Link>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">📚</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Konular</h3>
              <p className="text-xs text-slate-600">Eğitim içeriklerini düzenleyin</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-4">Eğitim içeriklerini ve konu anlatımlarını yönetin.</p>
          <Link href="/admin/konular">
            <Button variant="secondary" fullWidth size="sm">
              Konuları Yönet
            </Button>
          </Link>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">👥</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Öğrenciler</h3>
              <p className="text-xs text-slate-600">Performansı takip edin</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-4">Öğrenci performansını ve istatistiklerini görüntüleyin.</p>
          <Link href="/admin/ogrenciler">
            <Button variant="warning" fullWidth size="sm">
              Öğrencileri Görüntüle
            </Button>
          </Link>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">📥</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">İçerik Yükle</h3>
              <p className="text-xs text-slate-600">Toplu içerik yükleyin</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-4">Section 1 içeriğini sisteme yükleyin.</p>
          <Link href="/admin/sinavlar/import">
            <Button variant="primary" fullWidth size="sm">
              İçerik Yükle
            </Button>
          </Link>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">🎓</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Demo Hesap</h3>
              <p className="text-xs text-slate-600">Test hesabı oluşturun</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-4">Test amaçlı demo öğrenci hesabı oluşturun.</p>
          <Link href="/admin/demo-account">
            <Button variant="ghost" fullWidth size="sm">
              Demo Hesap Oluştur
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center">
            <span className="text-lg">⚡</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Hızlı İşlemler</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link href="/admin/sinavlar/import" className="flex items-center gap-2 p-3 bg-white/70 rounded-lg hover:bg-white transition-colors">
            <span className="text-lg">📥</span>
            <span className="text-sm font-medium text-slate-900">Sınav İçe Aktar</span>
          </Link>
          <Link href="/admin/sorular" className="flex items-center gap-2 p-3 bg-white/70 rounded-lg hover:bg-white transition-colors">
            <span className="text-lg">➕</span>
            <span className="text-sm font-medium text-slate-900">Yeni Soru Ekle</span>
          </Link>
          <Link href="/admin/ogrenciler" className="flex items-center gap-2 p-3 bg-white/70 rounded-lg hover:bg-white transition-colors">
            <span className="text-lg">📊</span>
            <span className="text-sm font-medium text-slate-900">İstatistikleri Görüntüle</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
