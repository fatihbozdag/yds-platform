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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-teal-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
      {/* Modern Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-lg">YDS</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                Platform
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <DarkModeToggle />
              <Link 
                href="/login" 
                className="text-slate-700 hover:text-slate-900 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-slate-100"
              >
                Giriş Yap
              </Link>
              <Link 
                href="/register" 
                className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                Ücretsiz Başla
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 border border-cyan-200 rounded-full text-sm font-medium text-cyan-700 mb-8">
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
              YDS Hazırlık Platformu
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Sınav Başarınız İçin
              <br />
              <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-500 bg-clip-text text-transparent">
                Modern Çözüm
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Kapsamlı konu anlatımları, gerçek sınav formatında denemeler ve kişiselleştirilmiş öğrenme ile YDS hedefinize ulaşın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                href="/register" 
                className="group bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center justify-center gap-2"
              >
                Hemen Başla
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link 
                href="/login" 
                className="bg-white text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-slate-200 hover:border-cyan-300 hover:bg-slate-50 transition-all duration-300 inline-flex items-center justify-center gap-2"
              >
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Neden <span className="text-cyan-600">YDS Platform?</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Başarınız için tasarlanmış özellikler
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '📚',
                title: 'Kapsamlı İçerik',
                description: 'YDS müfredatını kapsayan detaylı konu anlatımları ve örneklerle adım adım öğrenin.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: '📝',
                title: 'Gerçek Sınav Deneyimi',
                description: 'Gerçek sınav formatında hazırlanmış deneme sınavları ile kendinizi test edin.',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: '🎯',
                title: 'Kişiselleştirilmiş Öğrenme',
                description: 'Yapay zeka destekli analiz ile zayıf olduğunuz konulara odaklanın ve hızla gelişin.',
                color: 'from-cyan-500 to-teal-500'
              },
              {
                icon: '📊',
                title: 'Detaylı İlerleme Takibi',
                description: 'Performansınızı grafikler ve raporlarla takip edin, güçlü ve zayıf yönlerinizi keşfedin.',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: '🏆',
                title: 'Hedef Belirleme',
                description: 'Kişisel hedefler belirleyin ve motivasyonunuzu yüksek tutarak hedefinize ilerleyin.',
                color: 'from-orange-500 to-amber-500'
              },
              {
                icon: '💬',
                title: 'Uzman Desteği',
                description: 'Takıldığınız konularda eğitmenlere soru sorun ve anında geri bildirim alın.',
                color: 'from-indigo-500 to-purple-500'
              }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="group relative bg-white p-8 rounded-2xl border border-slate-200 hover:border-cyan-300 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-br from-cyan-500 to-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Binlerce Öğrenciye Güvenilen Platform
            </h2>
            <p className="text-xl text-cyan-100">
              Rakamlarla başarımız
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { number: '10,000+', label: 'Soru Bankası', sublabel: 'Sürekli güncellenen içerik' },
              { number: '50+', label: 'Deneme Sınavı', sublabel: 'Gerçek sınav deneyimi' },
              { number: '100+', label: 'Konu Anlatımı', sublabel: 'Kapsamlı eğitim içeriği' }
            ].map((stat, idx) => (
              <div key={idx} className="group">
                <div className="text-6xl md:text-7xl font-bold text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-xl font-semibold text-white mb-2">{stat.label}</div>
                <div className="text-cyan-100">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-12 shadow-2xl border border-slate-200 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              YDS Hedefinize{' '}
              <span className="bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                Bugün Başlayın
              </span>
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              Binlerce öğrencinin tercih ettiği platform ile siz de başarıya ulaşın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-10 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center justify-center gap-2"
              >
                Ücretsiz Hesap Oluştur
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-8 mt-8 text-sm text-slate-500">
              {['Kredi kartı gerekmez', 'Anında erişim', 'İptal istediğinizde'].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">YDS Platform</h3>
              <p className="text-sm text-slate-400">
                YDS sınavına hazırlık için en kapsamlı online platform.
              </p>
            </div>
            {[
              { title: 'Platform', links: ['Giriş Yap', 'Kayıt Ol', 'Özellikler', 'Fiyatlandırma'] },
              { title: 'Destek', links: ['Yardım Merkezi', 'İletişim', 'SSS', 'Blog'] },
              { title: 'Yasal', links: ['Gizlilik Politikası', 'Kullanım Şartları', 'Çerez Politikası'] }
            ].map((section, idx) => (
              <div key={idx}>
                <h4 className="text-white font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2 text-sm">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <a href="#" className="hover:text-white transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2025 YDS Platform. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
