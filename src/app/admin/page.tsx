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

  const handleLogout = async () => {
    const { error } = await firebase.auth.signOut()
    if (error) {
      console.error('Logout error:', error)
    } else {
      router.push('/login')
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
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-3xl">👨‍💼</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Hoş Geldiniz, {profile?.full_name || 'Admin'}!
          </h1>
          <p className="text-lg text-slate-600">
            YDS Platform yönetim paneline hoş geldiniz. Platform yönetimi için araçları kullanabilirsiniz.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card variant="glass" padding="md" hover className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-2xl font-bold text-blue-600 mb-2">150+</h3>
          <p className="text-sm text-slate-600">Toplam Soru</p>
        </Card>

        <Card variant="glass" padding="md" hover className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">25+</h3>
          <p className="text-sm text-slate-600">Aktif Sınav</p>
        </Card>

        <Card variant="glass" padding="md" hover className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">👥</span>
          </div>
          <h3 className="text-2xl font-bold text-purple-600 mb-2">1,250+</h3>
          <p className="text-sm text-slate-600">Kayıtlı Öğrenci</p>
        </Card>

        <Card variant="glass" padding="md" hover className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">📚</span>
          </div>
          <h3 className="text-2xl font-bold text-orange-600 mb-2">50+</h3>
          <p className="text-sm text-slate-600">Konu Anlatımı</p>
        </Card>
      </div>

      {/* Management Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card variant="glass" padding="lg" hover>
          <CardHeader
            title="Sorular"
            subtitle="Sınav sorularını yönetin"
            action={
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📝</span>
              </div>
            }
          />
          <CardContent>
            <p className="text-slate-600 mb-6">Sınav sorularını ekleyin, düzenleyin ve organize edin.</p>
            <Link href="/admin/sorular">
              <Button variant="primary" fullWidth>
                Soruları Yönet
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card variant="glass" padding="lg" hover>
          <CardHeader
            title="Sınavlar"
            subtitle="Sınavları oluşturun ve düzenleyin"
            action={
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
            }
          />
          <CardContent>
            <p className="text-slate-600 mb-6">Yeni sınavlar oluşturun ve mevcut sınavları düzenleyin.</p>
            <Link href="/admin/sinavlar">
              <Button variant="success" fullWidth>
                Sınavları Yönet
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card variant="glass" padding="lg" hover>
          <CardHeader
            title="Konular"
            subtitle="Eğitim içeriklerini düzenleyin"
            action={
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📚</span>
              </div>
            }
          />
          <CardContent>
            <p className="text-slate-600 mb-6">Eğitim içeriklerini ve konu anlatımlarını yönetin.</p>
            <Link href="/admin/konular">
              <Button variant="secondary" fullWidth>
                Konuları Yönet
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card variant="glass" padding="lg" hover>
          <CardHeader
            title="Öğrenciler"
            subtitle="Öğrenci performansını takip edin"
            action={
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">👥</span>
              </div>
            }
          />
          <CardContent>
            <p className="text-slate-600 mb-6">Öğrenci performansını ve istatistiklerini görüntüleyin.</p>
            <Link href="/admin/ogrenciler">
              <Button variant="warning" fullWidth>
                Öğrencileri Görüntüle
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card variant="glass" padding="lg" hover>
          <CardHeader
            title="İçerik Yükle"
            subtitle="Section 1 içeriğini sisteme yükleyin"
            action={
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📥</span>
              </div>
            }
          />
          <CardContent>
            <p className="text-slate-600 mb-6">Hazır içerikleri sisteme toplu olarak yükleyin.</p>
            <Link href="/admin/import-content">
              <Button variant="info" fullWidth>
                İçerik Yükle
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card variant="glass" padding="lg" hover>
          <CardHeader
            title="Demo Hesap"
            subtitle="Demo öğrenci hesabı oluşturun"
            action={
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🎓</span>
              </div>
            }
          />
          <CardContent>
            <p className="text-slate-600 mb-6">Test amaçlı demo öğrenci hesabı oluşturun.</p>
            <Link href="/admin/demo-account">
              <Button variant="ghost" fullWidth>
                Demo Hesap Oluştur
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}