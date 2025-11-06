'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { firebase } from '@/lib/firebase-client'
import { useRouter } from 'next/navigation'
import DarkModeToggle from '@/components/ui/DarkModeToggle'

export default function Home() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await firebase.auth.getUser()
    if (user) {
      // User is logged in, check their role
      const { data: profile } = await firebase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } else {
      setChecking(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-base">YDS</span>
            </div>
            <span className="text-xl font-bold text-slate-900">
              YDS Platform
            </span>
          </div>
          <div className="flex items-center gap-4">
            <DarkModeToggle />
            <Link href="/login" className="text-slate-600 hover:text-slate-900 font-medium transition-colors text-sm">
              Giriş Yap
            </Link>
            <Link href="/register" className="btn-primary text-sm px-5 py-2.5">
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full mb-6 text-sm text-indigo-700 font-medium">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
            YDS Hazırlık Platformu
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            YDS Sınavına{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Profesyonel
            </span>{' '}
            Hazırlık
          </h1>

          <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Kapsamlı konu anlatımları, deneme sınavları ve detaylı analiz araçlarıyla YDS hedefinize ulaşın.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/register" className="btn-primary text-base px-7 py-3.5">
              <span className="flex items-center gap-2">
                Hemen Başla
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <Link href="/login" className="btn-secondary text-base px-7 py-3.5">
              <span className="flex items-center gap-2">
                Platforma Giriş
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-1">10,000+</div>
              <div className="text-sm text-slate-600">Soru Bankası</div>
            </div>
            <div className="text-center border-x border-slate-200">
              <div className="text-3xl font-bold text-indigo-600 mb-1">50+</div>
              <div className="text-sm text-slate-600">Deneme Sınavı</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-1">100+</div>
              <div className="text-sm text-slate-600">Konu Anlatımı</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Neden <span className="text-indigo-600">YDS Platform?</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Başarınız için tasarlanmış özelliklerle YDS yolculuğunuzda yanınızdayız
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              icon: '📚',
              title: 'Kapsamlı Konu Anlatımları',
              description: 'YDS müfredatını kapsayan detaylı konu anlatımları ve örnekler',
              color: 'from-blue-500 to-blue-600'
            },
            {
              icon: '📊',
              title: 'Deneme Sınavları',
              description: 'Gerçek sınav formatında hazırlanmış deneme sınavları',
              color: 'from-indigo-500 to-indigo-600'
            },
            {
              icon: '🎯',
              title: 'Kişiselleştirilmiş Öğrenme',
              description: 'Detaylı analiz ile zayıf yönlerinize odaklanın',
              color: 'from-purple-500 to-purple-600'
            },
            {
              icon: '📈',
              title: 'Detaylı İlerleme Takibi',
              description: 'Performansınızı grafikler ve raporlarla takip edin',
              color: 'from-emerald-500 to-emerald-600'
            },
            {
              icon: '🏆',
              title: 'Hedef Belirleme',
              description: 'Kişisel hedefler belirleyin ve motivasyonunuzu artırın',
              color: 'from-amber-500 to-orange-500'
            },
            {
              icon: '💬',
              title: 'Uzman Desteği',
              description: 'Takıldığınız konularda eğitmenlere soru sorun',
              color: 'from-red-500 to-pink-500'
            }
          ].map((feature, index) => (
            <div key={index} className="group bg-white p-6 rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all duration-200">
              <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center text-white shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            YDS Hedefinize Bugün Başlayın
          </h2>
          <p className="text-lg mb-8 text-indigo-100">
            Binlerce öğrencinin tercih ettiği platform ile siz de başarıya ulaşın.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors shadow-lg text-base">
              Ücretsiz Hesap Oluştur
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-indigo-100">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Kredi kartı gerekmez
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Anında erişim
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              İstediğinizde iptal
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-base mb-4">YDS Platform</h3>
              <p className="text-sm text-slate-400">
                YDS sınavına hazırlık için en kapsamlı online platform.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-white transition-colors">Giriş Yap</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Kayıt Ol</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Destek</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Yardım Merkezi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">İletişim</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Yasal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Gizlilik Politikası</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kullanım Şartları</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2025 YDS Platform. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
