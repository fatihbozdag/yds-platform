'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { firebase } from '@/lib/firebase-client'
import { Exam, ExamResult } from '@/types'

// Custom SVG Icons for Scholarly Elegance
const Icons = {
  back: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M23 4v6h-6M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 1012 0V2z" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" />
    </svg>
  ),
  trendUp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  trendDown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  minus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" strokeLinecap="round" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  lightbulb: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M9 18h6M10 22h4M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  scroll: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
  play: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
}

interface ExamHistoryItem extends ExamResult {
  exam: Exam
}

export default function ExamHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const [history, setHistory] = useState<ExamHistoryItem[]>([])
  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.examId) {
      fetchExamHistory(params.examId as string)
    }
  }, [params.examId])

  const fetchExamHistory = async (examId: string) => {
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get exam details
      const { data: examData, error: examError } = await firebase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .single()

      if (examError) {
        console.error('Exam fetch error:', examError)
        router.push('/sinavlar')
        return
      }

      setExam(examData)

      // Get all exam results for this user and exam
      const { data: resultsData, error: resultsError } = await firebase
        .from('exam_results')
        .select('*')
        .eq('student_id', user.id)
        .eq('exam_id', examId)
        .order('completed_at', { ascending: false })

      if (resultsError) throw resultsError

      const historyWithExam = resultsData.map(result => ({
        ...result,
        exam: examData
      }))

      setHistory(historyWithExam)

    } catch (error) {
      console.error('Error fetching exam history:', error)
      alert('Sınav geçmişi yüklenirken bir hata oluştu')
      router.push('/sinavlar')
    } finally {
      setLoading(false)
    }
  }

  const getScoreLevel = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return { color: 'var(--luxury-sage)', level: 'excellent' }
    if (percentage >= 60) return { color: 'var(--luxury-gold)', level: 'good' }
    if (percentage >= 40) return { color: 'var(--luxury-navy)', level: 'average' }
    return { color: 'var(--luxury-burgundy)', level: 'needs-work' }
  }

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()
    return Math.round((end - start) / 1000 / 60) // minutes
  }

  const getStats = () => {
    if (history.length === 0) return null

    const scores = history.map(h => h.score)
    const maxScore = exam ? exam.total_questions * 4 : 0

    return {
      attempts: history.length,
      bestScore: Math.max(...scores),
      worstScore: Math.min(...scores),
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      maxScore,
      improvement: history.length > 1 ? history[0].score - history[history.length - 1].score : 0
    }
  }

  const stats = getStats()

  // Luxury Loading State
  if (loading) {
    return (
      <div className="min-h-screen paper-texture flex items-center justify-center">
        <div className="text-center luxury-fade-up">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-[var(--luxury-gold)]/30 animate-spin" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-2 rounded-full border-2 border-t-[var(--luxury-gold)] border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.5s' }} />
            <div className="absolute inset-0 flex items-center justify-center text-[var(--luxury-gold)]">
              {Icons.scroll}
            </div>
          </div>
          <p className="font-body text-[var(--luxury-charcoal)]/70 text-lg">
            Sınav geçmişi yükleniyor...
          </p>
        </div>
      </div>
    )
  }

  // Empty State
  if (!exam || history.length === 0) {
    return (
      <div className="min-h-screen paper-texture py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 luxury-fade-up">
            <Link
              href="/sinavlar"
              className="inline-flex items-center gap-2 font-accent text-[var(--luxury-charcoal)]/70 hover:text-[var(--luxury-gold)] transition-colors"
            >
              {Icons.back}
              <span>Sınavlara Dön</span>
            </Link>
          </div>

          <div className="luxury-card p-12 text-center luxury-fade-up stagger-1">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--luxury-navy)]/10 flex items-center justify-center">
              <span className="text-[var(--luxury-navy)]">{Icons.chart}</span>
            </div>
            <h1 className="font-display text-3xl text-[var(--luxury-navy)] mb-4">
              {exam ? `${exam.title}` : 'Sınav Geçmişi'}
            </h1>
            <p className="font-body text-[var(--luxury-charcoal)]/70 mb-8 max-w-md mx-auto">
              Bu sınavı henüz çözmediniz. İlk denemenizi yaparak performans takibine başlayın.
            </p>
            {exam && (
              <Link href={`/sinavlar/${exam.id}/baslat`} className="luxury-btn inline-flex items-center gap-2">
                {Icons.play}
                <span>İlk Denemenizi Yapın</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen paper-texture py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <div className="mb-8 luxury-fade-up">
          <Link
            href="/sinavlar"
            className="inline-flex items-center gap-2 font-accent text-[var(--luxury-charcoal)]/70 hover:text-[var(--luxury-gold)] transition-colors"
          >
            {Icons.back}
            <span>Sınavlara Dön</span>
          </Link>
        </div>

        {/* Header Card */}
        <div className="luxury-card overflow-hidden mb-8 luxury-fade-up stagger-1">
          <div className="relative bg-gradient-to-br from-[var(--luxury-navy)] via-[var(--luxury-navy)] to-[var(--luxury-charcoal)] text-white p-8 overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--luxury-gold)]/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="font-display text-3xl mb-2">{exam.title}</h1>
                <p className="font-body text-white/70">Sınav Geçmişi ve Performans Analizi</p>
              </div>
              <Link
                href={`/sinavlar/${exam.id}/baslat`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-accent font-medium bg-[var(--luxury-gold)] text-[var(--luxury-navy)] hover:bg-[var(--luxury-gold)]/90 transition-all duration-300"
              >
                {Icons.refresh}
                <span>Tekrar Çöz</span>
              </Link>
            </div>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-5 rounded-xl bg-[var(--luxury-navy)]/5 border border-[var(--luxury-navy)]/10 luxury-fade-up stagger-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--luxury-navy)]/10 mx-auto mb-3">
                    <span className="text-[var(--luxury-navy)]">{Icons.calendar}</span>
                  </div>
                  <div className="font-display text-3xl text-[var(--luxury-navy)]">{stats.attempts}</div>
                  <div className="font-body text-sm text-[var(--luxury-charcoal)]/70">Toplam Deneme</div>
                </div>

                <div className="text-center p-5 rounded-xl bg-[var(--luxury-sage)]/10 border border-[var(--luxury-sage)]/20 luxury-fade-up stagger-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--luxury-sage)]/20 mx-auto mb-3">
                    <span className="text-[var(--luxury-sage)]">{Icons.trophy}</span>
                  </div>
                  <div className="font-display text-3xl" style={{ color: getScoreLevel(stats.bestScore, stats.maxScore).color }}>
                    {stats.bestScore}
                  </div>
                  <div className="font-body text-sm text-[var(--luxury-charcoal)]/70">En İyi Puan</div>
                </div>

                <div className="text-center p-5 rounded-xl bg-[var(--luxury-gold)]/10 border border-[var(--luxury-gold)]/20 luxury-fade-up stagger-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--luxury-gold)]/20 mx-auto mb-3">
                    <span className="text-[var(--luxury-gold)]">{Icons.star}</span>
                  </div>
                  <div className="font-display text-3xl" style={{ color: getScoreLevel(stats.averageScore, stats.maxScore).color }}>
                    {stats.averageScore}
                  </div>
                  <div className="font-body text-sm text-[var(--luxury-charcoal)]/70">Ortalama</div>
                </div>

                <div className="text-center p-5 rounded-xl bg-[var(--luxury-charcoal)]/5 border border-[var(--luxury-charcoal)]/10 luxury-fade-up stagger-5">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--luxury-charcoal)]/10 mx-auto mb-3">
                    <span className="text-[var(--luxury-charcoal)]/50">{Icons.minus}</span>
                  </div>
                  <div className="font-display text-3xl" style={{ color: getScoreLevel(stats.worstScore, stats.maxScore).color }}>
                    {stats.worstScore}
                  </div>
                  <div className="font-body text-sm text-[var(--luxury-charcoal)]/70">En Düşük</div>
                </div>

                <div className={`text-center p-5 rounded-xl border luxury-fade-up stagger-6 ${
                  stats.improvement >= 0
                    ? 'bg-[var(--luxury-sage)]/10 border-[var(--luxury-sage)]/20'
                    : 'bg-[var(--luxury-burgundy)]/10 border-[var(--luxury-burgundy)]/20'
                }`}>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full mx-auto mb-3 ${
                    stats.improvement >= 0
                      ? 'bg-[var(--luxury-sage)]/20'
                      : 'bg-[var(--luxury-burgundy)]/20'
                  }`}>
                    <span className={stats.improvement >= 0 ? 'text-[var(--luxury-sage)]' : 'text-[var(--luxury-burgundy)]'}>
                      {stats.improvement >= 0 ? Icons.trendUp : Icons.trendDown}
                    </span>
                  </div>
                  <div className={`font-display text-3xl ${
                    stats.improvement >= 0 ? 'text-[var(--luxury-sage)]' : 'text-[var(--luxury-burgundy)]'
                  }`}>
                    {stats.improvement >= 0 ? '+' : ''}{stats.improvement}
                  </div>
                  <div className="font-body text-sm text-[var(--luxury-charcoal)]/70">Gelişim</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Performance Chart */}
        <div className="luxury-card p-8 mb-8 luxury-fade-up stagger-7">
          <div className="flex items-center gap-3 mb-8">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--luxury-gold)]/10 text-[var(--luxury-gold)]">
              {Icons.chart}
            </span>
            <h3 className="font-display text-xl text-[var(--luxury-navy)]">Performans Grafiği</h3>
          </div>

          <div className="relative">
            <div className="flex items-end justify-between h-56 border-b-2 border-l-2 border-[var(--luxury-charcoal)]/10 p-4 gap-2">
              {history.slice().reverse().map((result, index) => {
                const height = (result.score / (stats?.maxScore || 1)) * 180
                const scoreLevel = getScoreLevel(result.score, stats?.maxScore || 1)

                return (
                  <div key={result.id} className="flex flex-col items-center flex-1 max-w-16 group">
                    <div className="relative w-full">
                      <div
                        className="w-full rounded-t-lg transition-all duration-500 ease-out group-hover:opacity-80"
                        style={{
                          height: `${height}px`,
                          backgroundColor: scoreLevel.color,
                          minHeight: '20px'
                        }}
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="px-3 py-2 rounded-lg bg-[var(--luxury-navy)] text-white text-sm font-accent whitespace-nowrap">
                          <div className="font-semibold">{result.score} puan</div>
                          <div className="text-white/70 text-xs">Deneme {index + 1}</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 font-accent text-sm text-[var(--luxury-charcoal)]/70">
                      {index + 1}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-4 px-4">
              <span className="font-body text-sm text-[var(--luxury-charcoal)]/50">Deneme Sırası</span>
              <span className="font-body text-sm text-[var(--luxury-charcoal)]/50">Maks: {stats?.maxScore} puan</span>
            </div>
          </div>
        </div>

        {/* Detailed History */}
        <div className="luxury-card overflow-hidden mb-8 luxury-fade-up stagger-8">
          <div className="p-6 border-b border-[var(--luxury-gold)]/10 flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--luxury-navy)]/10 text-[var(--luxury-navy)]">
              {Icons.scroll}
            </span>
            <h3 className="font-display text-xl text-[var(--luxury-navy)]">Detaylı Geçmiş</h3>
          </div>

          <div className="divide-y divide-[var(--luxury-gold)]/10">
            {history.map((result, index) => {
              const scoreLevel = getScoreLevel(result.score, stats?.maxScore || 1)

              return (
                <div key={result.id} className="p-6 hover:bg-[var(--luxury-ivory)]/50 transition-colors luxury-fade-up" style={{ animationDelay: `${(index + 8) * 50}ms` }}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center font-display text-lg text-white"
                        style={{ backgroundColor: scoreLevel.color }}
                      >
                        #{history.length - index}
                      </div>
                      <div>
                        <div className="font-display text-lg text-[var(--luxury-navy)]">
                          Deneme {history.length - index}
                        </div>
                        <div className="flex items-center gap-2 font-body text-sm text-[var(--luxury-charcoal)]/70">
                          <span className="text-[var(--luxury-gold)]">{Icons.calendar}</span>
                          {new Date(result.completed_at).toLocaleString('tr-TR')}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-display text-3xl" style={{ color: scoreLevel.color }}>
                        {result.score}
                      </div>
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-accent font-medium text-white"
                        style={{ backgroundColor: scoreLevel.color }}
                      >
                        %{Math.round((result.score / (stats?.maxScore || 1)) * 100)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 rounded-xl bg-[var(--luxury-sage)]/10">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--luxury-sage)]/20 mx-auto mb-2">
                        <span className="text-[var(--luxury-sage)] scale-75">{Icons.check}</span>
                      </div>
                      <div className="font-display text-xl text-[var(--luxury-sage)]">{result.correct_count}</div>
                      <div className="font-body text-xs text-[var(--luxury-charcoal)]/70">Doğru</div>
                    </div>

                    <div className="text-center p-4 rounded-xl bg-[var(--luxury-burgundy)]/10">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--luxury-burgundy)]/20 mx-auto mb-2">
                        <span className="text-[var(--luxury-burgundy)] scale-75">{Icons.x}</span>
                      </div>
                      <div className="font-display text-xl text-[var(--luxury-burgundy)]">{result.wrong_count}</div>
                      <div className="font-body text-xs text-[var(--luxury-charcoal)]/70">Yanlış</div>
                    </div>

                    <div className="text-center p-4 rounded-xl bg-[var(--luxury-charcoal)]/5">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--luxury-charcoal)]/10 mx-auto mb-2">
                        <span className="text-[var(--luxury-charcoal)]/50 scale-75">{Icons.minus}</span>
                      </div>
                      <div className="font-display text-xl text-[var(--luxury-charcoal)]">{result.empty_count}</div>
                      <div className="font-body text-xs text-[var(--luxury-charcoal)]/70">Boş</div>
                    </div>

                    <div className="text-center p-4 rounded-xl bg-[var(--luxury-gold)]/10">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--luxury-gold)]/20 mx-auto mb-2">
                        <span className="text-[var(--luxury-gold)] scale-75">{Icons.clock}</span>
                      </div>
                      <div className="font-display text-xl text-[var(--luxury-gold)]">
                        {calculateDuration(result.started_at, result.completed_at)}
                      </div>
                      <div className="font-body text-xs text-[var(--luxury-charcoal)]/70">Dakika</div>
                    </div>
                  </div>

                  <Link
                    href={`/sinavlar/${exam.id}/sonuc`}
                    className="inline-flex items-center gap-2 font-accent text-[var(--luxury-gold)] hover:text-[var(--luxury-gold)]/80 transition-colors"
                  >
                    {Icons.eye}
                    <span>Detaylı Sonuçları Görüntüle</span>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recommendations */}
        <div className="luxury-card p-8 luxury-fade-up stagger-9">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--luxury-gold)]/10 text-[var(--luxury-gold)]">
              {Icons.lightbulb}
            </span>
            <h3 className="font-display text-xl text-[var(--luxury-navy)]">Analiz ve Öneriler</h3>
          </div>

          <div className="space-y-4">
            {stats && stats.improvement > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--luxury-sage)]/10">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[var(--luxury-sage)]/20 text-[var(--luxury-sage)]">
                  {Icons.trendUp}
                </span>
                <span className="font-body text-[var(--luxury-charcoal)]">
                  Harika! Son denemenizde ilk denemenize göre <strong>{stats.improvement} puan</strong> gelişim gösterdiniz.
                </span>
              </div>
            )}

            {stats && stats.improvement < 0 && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--luxury-burgundy)]/10">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[var(--luxury-burgundy)]/20 text-[var(--luxury-burgundy)]">
                  {Icons.trendDown}
                </span>
                <span className="font-body text-[var(--luxury-charcoal)]">
                  Son denemenizde performansınız düştü. Konuları tekrar gözden geçirmenizi öneririz.
                </span>
              </div>
            )}

            {stats && stats.bestScore < stats.maxScore * 0.6 && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--luxury-gold)]/10">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[var(--luxury-gold)]/20 text-[var(--luxury-gold)]">
                  {Icons.target}
                </span>
                <span className="font-body text-[var(--luxury-charcoal)]">
                  Hedeflenen %60 seviyesine ulaşmak için daha fazla çalışma yapmanız önerilir.
                </span>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--luxury-navy)]/5">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[var(--luxury-navy)]/10 text-[var(--luxury-navy)]">
                {Icons.lightbulb}
              </span>
              <span className="font-body text-[var(--luxury-charcoal)]">
                Düzenli olarak sınav çözmeye devam edin. Pratik yapmak başarının anahtarıdır.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
