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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Dashboard yükleniyor...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      icon: '📝',
      value: stats.totalExams,
      label: 'Çözülen Sınav',
      sublabel: 'Toplam deneme',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    {
      icon: '📊',
      value: `%${stats.averageScore}`,
      label: 'Ortalama Puan',
      sublabel: 'Genel başarı',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    {
      icon: '📅',
      value: stats.studyDays,
      label: 'Çalışma Günü',
      sublabel: 'Aktif günler',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50'
    },
    {
      icon: '✅',
      value: stats.totalQuestions,
      label: 'Çözülen Soru',
      sublabel: 'Toplam soru',
      gradient: 'from-orange-500 to-amber-500',
      bgGradient: 'from-orange-50 to-amber-50'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">👋</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-1">
                Hoş Geldiniz!
              </h1>
              <p className="text-lg text-slate-600">
                YDS hazırlık yolculuğunuzda bugüne kadar kaydettiğiniz ilerleme
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((stat, idx) => (
            <div 
              key={idx}
              className={`group bg-gradient-to-br ${stat.bgGradient} p-6 rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-xl">{stat.icon}</span>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{stat.sublabel}</p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-slate-700">{stat.label}</h3>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {[
            {
              href: '/konular',
              icon: '📚',
              title: 'YDS Konuları',
              description: 'Konuları sırasıyla öğren',
              detail: 'Grammar, vocabulary ve diğer YDS konularını detaylı şekilde öğrenin.',
              gradient: 'from-blue-500 to-cyan-500'
            },
            {
              href: '/sinavlar',
              icon: '📝',
              title: 'Deneme Sınavları',
              description: 'Pratik yap, başarını ölç',
              detail: 'Gerçek YDS formatında deneme sınavları çözerek kendinizi test edin.',
              gradient: 'from-green-500 to-emerald-500'
            },
            {
              href: '/ilerleme',
              icon: '📊',
              title: 'İlerleme Takibi',
              description: 'Başarını görselleştir',
              detail: 'Çalışma istatistiklerinizi ve gelişiminizi takip edin.',
              gradient: 'from-purple-500 to-pink-500'
            },
            {
              href: '/hedefler',
              icon: '🎯',
              title: 'Hedeflerim',
              description: 'Çalışma hedeflerin',
              detail: 'Kişisel hedefler belirleyerek motivasyonunuzu artırın.',
              gradient: 'from-cyan-500 to-teal-500'
            },
            {
              href: '/bildirimler',
              icon: '🔔',
              title: 'Bildirimler',
              description: 'Sistem bildirimleri',
              detail: 'Önemli güncellemeler ve hatırlatmalarınızı görün.',
              gradient: 'from-orange-500 to-amber-500'
            },
            {
              href: '/egitmene-sor',
              icon: '💬',
              title: 'Eğitmene Sor',
              description: 'Uzman desteği al',
              detail: 'Anlamadığınız konular hakkında eğitmenlerden yardım alın.',
              gradient: 'from-indigo-500 to-purple-500'
            }
          ].map((action, idx) => (
            <Link 
              key={idx}
              href={action.href}
              className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-cyan-300 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                  <span className="text-2xl">{action.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-cyan-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-2">{action.description}</p>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {action.detail}
              </p>
            </Link>
          ))}
        </div>

        {/* Recent Exam Results */}
        {stats.recentExams.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">📈</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Son Sınav Sonuçları</h3>
                <p className="text-sm text-slate-500">En son çözdüğünüz sınavlar</p>
              </div>
            </div>
            <div className="space-y-3">
              {stats.recentExams.map((exam) => (
                <div 
                  key={exam.id} 
                  className="group p-5 bg-gradient-to-r from-slate-50 to-cyan-50/50 rounded-xl hover:shadow-md transition-all duration-200 border border-slate-200/60 hover:border-cyan-300"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 mb-2 text-lg">
                        {exam.exams?.title || 'Sınav'}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Doğru: <span className="font-semibold text-green-600">{exam.correct_count}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          Yanlış: <span className="font-semibold text-red-600">{exam.wrong_count}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                          Boş: <span className="font-semibold text-slate-600">{exam.empty_count}</span>
                        </span>
                        <span className="text-slate-500">
                          {new Date(exam.completed_at).toLocaleDateString('tr-TR', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                    <div className={`text-3xl font-bold px-4 py-2 rounded-xl shadow-md ${
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
            <div className="mt-6 pt-6 border-t border-slate-200">
              <Link 
                href="/ilerleme" 
                className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-semibold transition-colors"
              >
                Tüm sonuçları görüntüle
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* Study Tips */}
        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-8 border border-cyan-200/60 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl">💡</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Başarı İpuçları</h3>
              <p className="text-sm text-slate-600">Daha iyi sonuçlar için öneriler</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Düzenli çalışma programı oluşturun ve buna sadık kalın',
              'Kişisel hedefler belirleyerek motivasyonunuzu artırın',
              'Her konu sonunda mutlaka test çözerek pekiştirin',
              'Bildirimleri etkinleştirerek hiçbir fırsatı kaçırmayın',
              'Anlamadığınız yerleri not alın ve eğitmene sorun',
              'İlerleme raporlarınızı düzenli olarak kontrol edin'
            ].map((tip, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-white/80 rounded-xl border border-white/60">
                <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-sm text-slate-700 leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
