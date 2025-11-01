'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { firebase } from '@/lib/firebase-client'

interface DashboardStats {
  totalExams: number
  averageScore: number
  studyDays: number
  totalQuestions: number
  recentExams: {
    id: string
    score: number
    correct_count: number
    wrong_count: number
    empty_count: number
    completed_at: string
    exams?: { title: string }
  }[]
}

export default function StudentDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalExams: 0,
    averageScore: 0,
    studyDays: 0,
    totalQuestions: 0,
    recentExams: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) return

      // Fetch exam results
      const { data: examResults } = await firebase
        .from('exam_results')
        .select(`
          *,
          exams (title)
        `)
        .eq('student_id', user.id)
        .order('completed_at', { ascending: false })

      if (examResults) {
        const totalScore = examResults.reduce((sum, result) => sum + result.score, 0)
        const totalQuestions = examResults.reduce((sum, result) => 
          sum + result.correct_count + result.wrong_count + result.empty_count, 0)

        const uniqueDays = new Set(
          examResults.map(result => new Date(result.completed_at).toDateString())
        ).size

        setStats({
          totalExams: examResults.length,
          averageScore: examResults.length > 0 ? Math.round(totalScore / examResults.length) : 0,
          studyDays: uniqueDays,
          totalQuestions: totalQuestions,
          recentExams: examResults.slice(0, 5)
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Dashboard yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto py-8 px-4">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🎉</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Hoş Geldiniz!
              </h1>
              <p className="text-lg text-slate-600">
                YDS hazırlık yolculuğunuzda bugüne kadar kaydettiğiniz ilerleme
              </p>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📝</span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">{stats.totalExams}</p>
                <p className="text-xs text-slate-500">Toplam</p>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Çözülen Sınav</h3>
            <p className="text-xs text-slate-500">Deneme sınavları</p>
          </div>
          
          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📊</span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">%{stats.averageScore}</p>
                <p className="text-xs text-slate-500">Ortalama</p>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Ortalama Puan</h3>
            <p className="text-xs text-slate-500">Genel başarı</p>
          </div>
          
          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📅</span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-purple-600">{stats.studyDays}</p>
                <p className="text-xs text-slate-500">Gün</p>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Çalışma Günü</h3>
            <p className="text-xs text-slate-500">Aktif günler</p>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">✅</span>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-orange-600">{stats.totalQuestions}</p>
                <p className="text-xs text-slate-500">Soru</p>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Çözülen Soru</h3>
            <p className="text-xs text-slate-500">Toplam soru sayısı</p>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/konular" className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20">
            <div className="flex items-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">YDS Konuları</h3>
                <p className="text-sm text-slate-600">Konuları sırasıyla öğren</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Grammar, vocabulary ve diğer YDS konularını detaylı şekilde öğrenin.
            </p>
          </Link>

          <Link href="/sinavlar" className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20">
            <div className="flex items-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Deneme Sınavları</h3>
                <p className="text-sm text-slate-600">Pratik yap, başarını ölç</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Gerçek YDS formatında deneme sınavları çözerek kendinizi test edin.
            </p>
          </Link>

          <Link href="/ilerleme" className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20">
            <div className="flex items-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">İlerleme Takibi</h3>
                <p className="text-sm text-slate-600">Başarını görselleştir</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Çalışma istatistiklerinizi ve gelişiminizi takip edin.
            </p>
          </Link>

          <Link href="/hedefler" className="group bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-blue-200/50">
            <div className="flex items-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl text-white">🎯</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Hedeflerim</h3>
                <p className="text-sm text-slate-600">Çalışma hedeflerin</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Kişisel hedefler belirleyerek motivasyonunuzu artırın ve ilerlemenizi takip edin.
            </p>
          </Link>

          <Link href="/bildirimler" className="group bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-yellow-200/50">
            <div className="flex items-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl text-white">🔔</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Bildirimler</h3>
                <p className="text-sm text-slate-600">Sistem bildirimleri</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Önemli güncellemeler, hatırlatmalar ve başarım bildirimlerinizi görün.
            </p>
          </Link>

          <Link href="/egitmene-sor" className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20">
            <div className="flex items-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">❓</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Eğitmene Sor</h3>
                <p className="text-sm text-slate-600">Uzman desteği al</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Anlamadığınız konular hakkında eğitmenlerden yardım alın.
            </p>
          </Link>
        </div>

        {/* Recent Exam Results */}
        {stats.recentExams.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg mb-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">📈</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Son Sınav Sonuçları</h3>
            </div>
            <div className="space-y-4">
              {stats.recentExams.map((exam) => (
                <div key={exam.id} className="group p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl hover:shadow-md transition-all duration-200 border border-slate-200/50">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 mb-1">
                        {exam.exams?.title || 'Sınav'}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Doğru: {exam.correct_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          Yanlış: {exam.wrong_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                          Boş: {exam.empty_count}
                        </span>
                        <span className="text-slate-500">
                          {new Date(exam.completed_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${
                      exam.score >= 70 ? 'bg-green-100 text-green-700' :
                      exam.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      %{exam.score}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200">
              <Link href="/ilerleme" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors">
                Tüm sonuçları görüntüle
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* Study Tips & Recommendations */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-lg border border-blue-200/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">💡</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Başarı İpuçları</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span>Düzenli çalışma programı oluşturun ve buna sadık kalın</span>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span>Kişisel hedefler belirleyerek motivasyonunuzu artırın</span>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span>Her konu sonunda mutlaka test çözerek pekiştirin</span>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span>Bildirimleri etkinleştirerek hiçbir fırsatı kaçırmayın</span>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span>Anlamadığınız yerleri not alın ve eğitmene sorun</span>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span>İlerleme raporlarınızı düzenli olarak kontrol edin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}