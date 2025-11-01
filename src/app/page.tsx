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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">YDS</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Platform
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <DarkModeToggle />
            <Link href="/login" className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200">
              Giriş Yap
            </Link>
            <Link href="/login" className="btn-primary hover:scale-105 transition-transform duration-200">
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              YDS Sınavına{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient-x">
                En İyi Şekilde
              </span>{' '}
              Hazırlanın
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Kapsamlı konu anlatımları, deneme sınavları ve yapay zeka destekli kişiselleştirilmiş
              öğrenme deneyimi ile YDS hedefinize ulaşın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/login" className="btn-primary text-lg px-8 py-4 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <span className="flex items-center gap-2">
                  Hemen Başla
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <button className="btn-secondary text-lg px-8 py-4 hover:scale-105 transition-all duration-300 border-2 hover:border-blue-300">
                <span className="flex items-center gap-2">
                  Platformu Keşfet
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
          
          {/* Floating elements */}
          <div className="absolute top-20 left-10 animate-float">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📚</span>
            </div>
          </div>
          <div className="absolute top-32 right-16 animate-float-delayed">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl">🎯</span>
            </div>
          </div>
          <div className="absolute bottom-20 left-20 animate-float-slow">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl">📊</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Neden <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">YDS Platform?</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Başarınız için tasarlanmış özelliklerle YDS yolculuğunuzda yanınızdayız
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-3xl">📚</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Kapsamlı Konu Anlatımları
            </h3>
            <p className="text-slate-600 leading-relaxed">
              YDS müfredatını kapsayan detaylı konu anlatımları ve örneklerle adım adım öğrenin.
            </p>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Deneme Sınavları
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Gerçek sınav formatında hazırlanmış deneme sınavları ile kendinizi test edin.
            </p>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Kişiselleştirilmiş Öğrenme
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Yapay zeka destekli analiz ile zayıf olduğunuz konulara odaklanın ve hızla gelişin.
            </p>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-3xl">📈</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Detaylı İlerleme Takibi
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Performansınızı grafikler ve raporlarla takip edin, güçlü ve zayıf yönlerinizi keşfedin.
            </p>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-3xl">🏆</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Hedef Belirleme
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Kişisel hedefler belirleyin ve motivasyonunuzu yüksek tutarak hedefinize ilerleyin.
            </p>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-3xl">💬</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Uzman Desteği
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Takıldığınız konularda eğitmenlere soru sorun ve anında geri bildirim alın.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Binlerce Öğrenciye Güvenilen Platform
            </h2>
            <p className="text-blue-100 text-lg">
              Rakamlarla YDS Platform'un başarısı
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300">
                10,000+
              </div>
              <div className="text-blue-100 text-xl font-medium">Soru Bankası</div>
              <div className="text-blue-200 text-sm mt-2">Sürekli güncellenen içerik</div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300">
                50+
              </div>
              <div className="text-blue-100 text-xl font-medium">Deneme Sınavı</div>
              <div className="text-blue-200 text-sm mt-2">Gerçek sınav deneyimi</div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300">
                100+
              </div>
              <div className="text-blue-100 text-xl font-medium">Konu Anlatımı</div>
              <div className="text-blue-200 text-sm mt-2">Kapsamlı eğitim içeriği</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24 text-center relative z-10">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-12 border border-white/20">
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              YDS Hedefinize{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Bugün Başlayın
              </span>
            </h2>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Binlerce öğrencinin tercih ettiği platform ile siz de başarıya ulaşın.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/login" className="btn-primary text-lg px-10 py-4 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              <span className="flex items-center gap-2">
                Ücretsiz Hesap Oluştur
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <button className="btn-secondary text-lg px-10 py-4 hover:scale-105 transition-all duration-300 border-2 hover:border-blue-300">
              <span className="flex items-center gap-2">
                Demo İzle
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8a2 2 0 012-2z" />
                </svg>
              </span>
            </button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Kredi kartı gerekmez
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Anında erişim
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              İptal istediğinizde
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">YDS Platform</h3>
              <p className="text-sm text-slate-400">
                YDS sınavına hazırlık için en kapsamlı online platform.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-white">Giriş Yap</Link></li>
                <li><Link href="/login" className="hover:text-white">Kayıt Ol</Link></li>
                <li><a href="#" className="hover:text-white">Özellikler</a></li>
                <li><a href="#" className="hover:text-white">Fiyatlandırma</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Destek</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Yardım Merkezi</a></li>
                <li><a href="#" className="hover:text-white">İletişim</a></li>
                <li><a href="#" className="hover:text-white">SSS</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Yasal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Gizlilik Politikası</a></li>
                <li><a href="#" className="hover:text-white">Kullanım Şartları</a></li>
                <li><a href="#" className="hover:text-white">Çerez Politikası</a></li>
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
