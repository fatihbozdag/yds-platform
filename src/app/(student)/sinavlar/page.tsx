'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { firebase } from '@/lib/firebase-client'
import { Exam, Topic } from '@/types'

interface ExamWithTopic extends Exam {
  topics?: Topic | null
  attempts?: number
  bestScore?: number
  lastAttempt?: string
}

// Animated counter hook
function useCountUp(end: number, duration = 1500, startOnView = true) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(!startOnView)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!startOnView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [startOnView, hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOut * end))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [end, duration, hasStarted])

  return { count, ref }
}

// SVG Icons
const Icons = {
  scroll: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
      <path d="M12 6.5v11M8 10.5l4-4 4 4" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="4" y="3" width="16" height="18" rx="2" strokeLinecap="round"/>
    </svg>
  ),
  checkCircle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <circle cx="12" cy="12" r="9"/>
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  award: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <circle cx="12" cy="8" r="5"/>
      <path d="M8.5 13.5L7 21l5-3 5 3-1.5-7.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <circle cx="12" cy="12" r="9"/>
      <circle cx="12" cy="12" r="5"/>
      <circle cx="12" cy="12" r="1"/>
    </svg>
  ),
  questions: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
      <path d="M9 12h6M9 16h4" strokeLinecap="round"/>
    </svg>
  ),
  timer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="12" cy="13" r="8"/>
      <path d="M12 9v4l2 2M10 2h4M12 2v2" strokeLinecap="round"/>
    </svg>
  ),
  play: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36a1 1 0 00-1.5.86z"/>
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M4 12a8 8 0 018-8 8 8 0 017.4 5M20 12a8 8 0 01-8 8 8 8 0 01-7.4-5" strokeLinecap="round"/>
      <path d="M19 4v5h-5M5 20v-5h5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M4 20h16M6 16v-4M10 16V8M14 16v-6M18 16V6" strokeLinecap="round"/>
    </svg>
  ),
  quote: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 opacity-20">
      <path d="M11 7H7a4 4 0 00-4 4v1a3 3 0 003 3h1a2 2 0 012 2v1a4 4 0 01-4 4H4m16-15h-4a4 4 0 00-4 4v1a3 3 0 003 3h1a2 2 0 012 2v1a4 4 0 01-4 4h-1"/>
    </svg>
  )
}

export default function StudentExamsPage() {
  const [exams, setExams] = useState<ExamWithTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'attempted' | 'not-attempted'>('all')

  useEffect(() => {
    fetchExamsWithAttempts()
  }, [])

  const fetchExamsWithAttempts = async () => {
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) return

      const response = await fetch('/exams-data.json')
      if (!response.ok) {
        console.error('Failed to load exams data')
        setLoading(false)
        return
      }

      const examsMap = await response.json()
      const demoExams = Object.values(examsMap) as Exam[]

      const resultsKey = `exam_results_${user.id}`
      const storedResults = localStorage.getItem(resultsKey)
      const resultsData = storedResults ? JSON.parse(storedResults) : []

      const examsWithAttempts = demoExams.map(exam => {
        const examResults = resultsData.filter((result: { exam_id: string }) => result.exam_id === exam.id)
        const attempts = examResults.length
        const bestScore = attempts > 0 ? Math.max(...examResults.map((r: { score: number }) => r.score)) : undefined
        const lastAttempt = attempts > 0
          ? examResults.sort((a: { completed_at: string }, b: { completed_at: string }) =>
              new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
            )[0].completed_at
          : undefined

        return { ...exam, attempts, bestScore, lastAttempt }
      })

      setExams(examsWithAttempts)
    } catch (error) {
      console.error('Error fetching exams:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredExams = () => {
    switch (filter) {
      case 'attempted':
        return exams.filter(exam => exam.attempts && exam.attempts > 0)
      case 'not-attempted':
        return exams.filter(exam => !exam.attempts || exam.attempts === 0)
      default:
        return exams
    }
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-[var(--muted-slate)]'
    if (score >= 80) return 'text-[var(--forest-sage)]'
    if (score >= 60) return 'text-[var(--burnished-gold)]'
    if (score >= 40) return 'text-[var(--antique-bronze)]'
    return 'text-[var(--deep-burgundy)]'
  }

  const filteredExams = getFilteredExams()
  const attemptedCount = exams.filter(e => e.attempts && e.attempts > 0).length
  const notAttemptedCount = exams.filter(e => !e.attempts || e.attempts === 0).length
  const averageScore = attemptedCount > 0
    ? Math.round(exams.reduce((acc, exam) => acc + (exam.bestScore || 0), 0) / attemptedCount)
    : 0

  // Animated counters
  const totalCounter = useCountUp(exams.length, 1200)
  const attemptedCounter = useCountUp(attemptedCount, 1200)
  const pendingCounter = useCountUp(notAttemptedCount, 1200)
  const avgCounter = useCountUp(averageScore, 1500)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center paper-texture">
        <div className="text-center luxury-fade-up">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 border-2 border-[var(--burnished-gold)] border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-2 border-2 border-[var(--antique-bronze)] border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="font-body text-[var(--muted-slate)] tracking-wide">Sınavlar hazırlanıyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen paper-texture">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <header className="mb-16 luxury-fade-up">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--rich-navy)] to-[#2a3a5c] flex items-center justify-center text-[var(--burnished-gold)] shadow-lg">
              {Icons.scroll}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-5xl font-semibold text-[var(--rich-navy)] tracking-tight mb-3 line-draw">
                Deneme Sınavları
              </h1>
              <p className="font-body text-lg text-[var(--muted-slate)] max-w-xl leading-relaxed">
                Gerçek YDS formatında hazırlanmış kapsamlı deneme sınavları ile başarıya giden yolda emin adımlarla ilerleyin.
              </p>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Toplam Sınav', counter: totalCounter, icon: Icons.scroll, accent: 'var(--rich-navy)' },
            { label: 'Tamamlanan', counter: attemptedCounter, icon: Icons.checkCircle, accent: 'var(--forest-sage)' },
            { label: 'Bekleyen', counter: pendingCounter, icon: Icons.clock, accent: 'var(--burnished-gold)' },
            { label: 'Ortalama Puan', counter: avgCounter, icon: Icons.target, accent: 'var(--antique-bronze)', suffix: '%' },
          ].map((stat, index) => (
            <div
              key={stat.label}
              ref={stat.counter.ref}
              className={`luxury-card p-6 text-center luxury-scale-reveal stagger-${index + 1}`}
            >
              <div
                className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `color-mix(in srgb, ${stat.accent} 10%, transparent)`, color: stat.accent }}
              >
                {stat.icon}
              </div>
              <div className="stats-number luxury-count-up" style={{ animationDelay: `${(index + 1) * 150 + 300}ms` }}>
                {stat.counter.count}{stat.suffix || ''}
              </div>
              <p className="font-body text-sm text-[var(--muted-slate)] mt-2 tracking-wide uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="mb-10 luxury-slide-in stagger-5">
          <div className="inline-flex bg-[var(--warm-ivory)] rounded-xl p-1.5 border border-[rgba(184,134,11,0.1)] shadow-sm">
            {[
              { id: 'all', label: 'Tümü', count: exams.length },
              { id: 'not-attempted', label: 'Bekleyen', count: notAttemptedCount },
              { id: 'attempted', label: 'Tamamlanan', count: attemptedCount }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as 'all' | 'attempted' | 'not-attempted')}
                className={`
                  relative px-6 py-3 rounded-lg font-accent text-sm font-medium tracking-wide
                  transition-all duration-300 ease-out
                  ${filter === tab.id
                    ? 'bg-[var(--rich-navy)] text-[var(--luxury-cream)] shadow-md'
                    : 'text-[var(--muted-slate)] hover:text-[var(--rich-navy)] hover:bg-white/50'
                  }
                `}
              >
                <span>{tab.label}</span>
                <span className={`
                  ml-2 px-2 py-0.5 rounded-full text-xs
                  ${filter === tab.id
                    ? 'bg-[rgba(184,134,11,0.2)] text-[var(--burnished-gold)]'
                    : 'bg-[var(--warm-ivory)] text-[var(--muted-slate)]'
                  }
                `}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Exams Grid */}
        {filteredExams.length === 0 ? (
          <div className="luxury-card p-16 text-center luxury-fade-up stagger-6">
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-[var(--warm-ivory)] flex items-center justify-center text-[var(--burnished-gold)]">
              {Icons.scroll}
            </div>
            <h3 className="font-display text-2xl text-[var(--rich-navy)] mb-3">
              {filter === 'all' ? 'Henüz sınav eklenmemiş' :
               filter === 'attempted' ? 'Henüz sınav tamamlamadınız' : 'Tüm sınavları tamamladınız'}
            </h3>
            <p className="font-body text-[var(--muted-slate)] mb-8 max-w-md mx-auto">
              {filter === 'all' ? 'Yakında yeni sınavlar eklenecektir.' :
               filter === 'attempted' ? 'İlk sınavınıza başlamak için aşağıdan bir sınav seçin.' :
               'Tebrikler! Mevcut tüm sınavları başarıyla tamamladınız.'}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="luxury-btn inline-flex items-center gap-2"
              >
                Tüm Sınavları Görüntüle
              </button>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {filteredExams.map((exam, index) => (
              <article
                key={exam.id}
                className={`luxury-card group luxury-scale-reveal stagger-${Math.min(index + 6, 12)}`}
              >
                {/* Card Header */}
                <div className="p-6 pb-0">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="font-display text-2xl font-semibold text-[var(--rich-navy)] mb-2 group-hover:text-[var(--burnished-gold)] transition-colors duration-300">
                        {exam.title}
                      </h3>
                      {exam.description && (
                        <p className="font-body text-[var(--muted-slate)] text-sm line-clamp-2">
                          {exam.description}
                        </p>
                      )}
                    </div>
                    {exam.attempts && exam.attempts > 0 && exam.bestScore && (
                      <div className="flex-shrink-0">
                        <div className={`luxury-badge-success flex items-center gap-1.5`}>
                          {Icons.award}
                          <span className="font-semibold">{exam.bestScore}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Exam Meta */}
                  <div className="flex items-center gap-6 text-sm text-[var(--muted-slate)] font-body">
                    <span className="flex items-center gap-2">
                      {Icons.questions}
                      <span className="font-medium">{exam.total_questions} Soru</span>
                    </span>
                    <span className="flex items-center gap-2">
                      {Icons.timer}
                      <span className="font-medium">{exam.duration_minutes} Dakika</span>
                    </span>
                  </div>
                </div>

                <hr className="luxury-divider mx-6" />

                {/* Previous Attempts (if any) */}
                {exam.attempts && exam.attempts > 0 && (
                  <div className="px-6 pb-4">
                    <div className="bg-gradient-to-r from-[var(--warm-ivory)] to-transparent p-4 rounded-xl">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="block text-[var(--muted-slate)] font-body mb-1">Deneme</span>
                          <span className="font-accent font-semibold text-[var(--rich-navy)]">{exam.attempts}x</span>
                        </div>
                        <div>
                          <span className="block text-[var(--muted-slate)] font-body mb-1">En İyi</span>
                          <span className={`font-accent font-semibold ${getScoreColor(exam.bestScore)}`}>
                            {exam.bestScore}%
                          </span>
                        </div>
                        {exam.lastAttempt && (
                          <div>
                            <span className="block text-[var(--muted-slate)] font-body mb-1">Son</span>
                            <span className="font-accent text-[var(--rich-navy)] text-xs">
                              {new Date(exam.lastAttempt).toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="p-6 pt-2 flex gap-3">
                  <Link href={`/sinavlar/${exam.id}/baslat`} className="flex-1">
                    <button className="luxury-btn w-full flex items-center justify-center gap-2">
                      {exam.attempts && exam.attempts > 0 ? Icons.refresh : Icons.play}
                      <span>{exam.attempts && exam.attempts > 0 ? 'Tekrar Çöz' : 'Sınava Başla'}</span>
                    </button>
                  </Link>

                  {exam.attempts && exam.attempts > 0 && (
                    <Link href={`/sinavlar/${exam.id}/sonuclar`}>
                      <button className="h-full px-5 rounded-xl border border-[rgba(184,134,11,0.2)] text-[var(--rich-navy)] hover:border-[var(--burnished-gold)] hover:text-[var(--burnished-gold)] transition-all duration-300 flex items-center gap-2">
                        {Icons.chart}
                      </button>
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Study Tips */}
        <section className="mt-16 luxury-fade-up stagger-10">
          <div className="luxury-card p-8 relative overflow-hidden">
            <div className="absolute top-6 left-6 text-[var(--burnished-gold)]">
              {Icons.quote}
            </div>
            <div className="relative">
              <h3 className="font-display text-2xl text-[var(--rich-navy)] mb-6 pl-12">
                Başarı İpuçları
              </h3>
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-4 pl-12">
                {[
                  'Sınavdan önce konuları gözden geçirin',
                  'Zaman yönetimine dikkat edin',
                  'Önce kolay sorularla başlayın',
                  'Cevaplarınızı mutlaka kontrol edin'
                ].map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--burnished-gold)] to-[var(--antique-bronze)] text-white text-xs font-accent font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="font-body text-[var(--muted-slate)]">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
