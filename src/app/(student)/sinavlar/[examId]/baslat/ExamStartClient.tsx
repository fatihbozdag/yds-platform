'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { firebase } from '@/lib/firebase-client'
import { Exam, Topic } from '@/types'

interface ExamWithDetails extends Exam {
  topics?: Topic | null
  previousAttempts?: number
  bestScore?: number
  lastAttempt?: string
}

// SVG Icons
const Icons = {
  back: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  scroll: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
      <path d="M12 6.5v11M8 10.5l4-4 4 4" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="4" y="3" width="16" height="18" rx="2" strokeLinecap="round"/>
    </svg>
  ),
  questions: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
      <path d="M9 12h6M9 16h4" strokeLinecap="round"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v5l2 2" strokeLinecap="round"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <path d="M12 9v4M12 17h.01" strokeLinecap="round"/>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 16v-4M12 8h.01" strokeLinecap="round"/>
    </svg>
  ),
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="12" cy="12" r="9"/>
      <circle cx="12" cy="12" r="5"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
    </svg>
  ),
  play: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36a1 1 0 00-1.5.86z"/>
    </svg>
  ),
  award: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="12" cy="8" r="5"/>
      <path d="M8.5 13.5L7 21l5-3 5 3-1.5-7.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function ExamStartPage() {
  const params = useParams()
  const router = useRouter()
  const [exam, setExam] = useState<ExamWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    if (params.examId) {
      fetchExamDetails(params.examId as string)
    }
  }, [params.examId])

  const fetchExamDetails = async (examId: string) => {
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const response = await fetch('/exams-data.json')
      if (!response.ok) {
        router.push('/sinavlar')
        return
      }

      const examsMap = await response.json()
      const examData = examsMap[examId]

      if (!examData) {
        router.push('/sinavlar')
        return
      }

      const resultsKey = `exam_results_${user.id}`
      const storedResults = localStorage.getItem(resultsKey)
      const attemptsData = storedResults ? JSON.parse(storedResults).filter((r: { exam_id: string }) => r.exam_id === examId) : []

      const previousAttempts = attemptsData.length
      const bestScore = previousAttempts > 0 ? Math.max(...attemptsData.map((a: { score: number }) => a.score)) : undefined
      const lastAttempt = previousAttempts > 0 ? attemptsData[0].completed_at : undefined

      setExam({ ...examData, previousAttempts, bestScore, lastAttempt })
    } catch (error) {
      console.error('Error fetching exam details:', error)
      router.push('/sinavlar')
    } finally {
      setLoading(false)
    }
  }

  const startExam = async () => {
    if (!exam || !agreed) return
    setStarting(true)
    router.push(`/sinavlar/${exam.id}/coz`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center paper-texture">
        <div className="text-center luxury-fade-up">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 border-2 border-[var(--burnished-gold)] border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-2 border-2 border-[var(--antique-bronze)] border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="font-body text-[var(--muted-slate)] tracking-wide">Sınav hazırlanıyor...</p>
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center paper-texture">
        <div className="text-center luxury-fade-up">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--warm-ivory)] flex items-center justify-center text-[var(--burnished-gold)]">
            {Icons.scroll}
          </div>
          <h1 className="font-display text-2xl text-[var(--rich-navy)] mb-4">Sınav bulunamadı</h1>
          <Link href="/sinavlar" className="luxury-btn inline-flex items-center gap-2">
            {Icons.back}
            <span>Sınavlara Dön</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen paper-texture">
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Back Link */}
        <Link
          href="/sinavlar"
          className="inline-flex items-center gap-2 text-[var(--muted-slate)] hover:text-[var(--burnished-gold)] font-body mb-8 transition-colors duration-300 luxury-fade-up"
        >
          {Icons.back}
          <span>Sınavlara Dön</span>
        </Link>

        {/* Main Card */}
        <div className="luxury-card overflow-hidden luxury-scale-reveal stagger-1">

          {/* Header */}
          <div className="bg-gradient-to-br from-[var(--rich-navy)] to-[#2a3a5c] text-white p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--burnished-gold)] opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--burnished-gold)] opacity-5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative flex items-center gap-6">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-[var(--burnished-gold)] border border-white/10">
                {Icons.scroll}
              </div>
              <div className="flex-1">
                <h1 className="font-display text-4xl font-semibold tracking-tight mb-2">{exam.title}</h1>
                {exam.description && (
                  <p className="font-body text-white/70 text-lg">{exam.description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-10">

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6 mb-10 luxury-fade-up stagger-2">
              {[
                { label: 'Toplam Soru', value: exam.total_questions, icon: Icons.questions, color: 'var(--rich-navy)' },
                { label: 'Süre (Dakika)', value: exam.duration_minutes, icon: Icons.clock, color: 'var(--forest-sage)' },
                { label: 'Önceki Deneme', value: exam.previousAttempts || 0, icon: Icons.history, color: 'var(--burnished-gold)' }
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-6 bg-[var(--warm-ivory)] rounded-xl border border-[rgba(184,134,11,0.1)]"
                >
                  <div
                    className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `color-mix(in srgb, ${stat.color} 10%, transparent)`, color: stat.color }}
                  >
                    {stat.icon}
                  </div>
                  <div className="font-accent text-3xl font-bold text-[var(--rich-navy)] mb-1">{stat.value}</div>
                  <div className="font-body text-sm text-[var(--muted-slate)]">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Previous Performance */}
            {exam.previousAttempts && exam.previousAttempts > 0 && (
              <div className="mb-10 p-6 bg-gradient-to-r from-[rgba(74,103,65,0.05)] to-transparent rounded-xl border border-[rgba(74,103,65,0.15)] luxury-fade-up stagger-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(74,103,65,0.1)] flex items-center justify-center text-[var(--forest-sage)]">
                    {Icons.award}
                  </div>
                  <h3 className="font-display text-xl text-[var(--rich-navy)]">Önceki Performansınız</h3>
                </div>
                <div className="grid grid-cols-3 gap-6 font-body text-sm">
                  <div>
                    <span className="block text-[var(--muted-slate)] mb-1">Deneme Sayısı</span>
                    <span className="font-accent font-semibold text-[var(--rich-navy)]">{exam.previousAttempts}</span>
                  </div>
                  {exam.bestScore && (
                    <div>
                      <span className="block text-[var(--muted-slate)] mb-1">En İyi Puan</span>
                      <span className="font-accent font-semibold text-[var(--forest-sage)]">{exam.bestScore}%</span>
                    </div>
                  )}
                  {exam.lastAttempt && (
                    <div>
                      <span className="block text-[var(--muted-slate)] mb-1">Son Deneme</span>
                      <span className="font-accent text-[var(--rich-navy)]">
                        {new Date(exam.lastAttempt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rules Section */}
            <div className="mb-10 luxury-fade-up stagger-4">
              <h3 className="font-display text-xl text-[var(--rich-navy)] mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[rgba(184,134,11,0.1)] flex items-center justify-center text-[var(--burnished-gold)]">
                  {Icons.info}
                </span>
                Sınav Kuralları
              </h3>
              <div className="space-y-4 font-body text-[var(--muted-slate)]">
                {[
                  { icon: 'check', text: `Sınav ${exam.duration_minutes} dakika sürecek ve otomatik sonlandırılacaktır.`, type: 'success' },
                  { icon: 'check', text: 'Her soru için 5 seçenek (A, B, C, D, E) bulunmaktadır.', type: 'success' },
                  { icon: 'check', text: 'Sorular arasında serbestçe gezinebilir ve cevaplarınızı değiştirebilirsiniz.', type: 'success' },
                  { icon: 'check', text: 'Kalan süreyi ekranın üst kısmında görebilirsiniz.', type: 'success' },
                  { icon: 'warning', text: 'Sınav sırasında sayfa yenilemeyin veya tarayıcıyı kapatmayın.', type: 'warning' },
                  { icon: 'info', text: 'Yanlış cevap ile boş cevap aynı değerde işlenir (puan kırılmaz).', type: 'info' }
                ].map((rule, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                      ${rule.type === 'success' ? 'bg-[rgba(74,103,65,0.1)] text-[var(--forest-sage)]' : ''}
                      ${rule.type === 'warning' ? 'bg-[rgba(184,134,11,0.1)] text-[var(--burnished-gold)]' : ''}
                      ${rule.type === 'info' ? 'bg-[rgba(26,39,68,0.1)] text-[var(--rich-navy)]' : ''}
                    `}>
                      {rule.icon === 'check' && Icons.check}
                      {rule.icon === 'warning' && Icons.warning}
                      {rule.icon === 'info' && Icons.info}
                    </div>
                    <span>{rule.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scoring System */}
            <div className="mb-10 p-6 bg-gradient-to-r from-[rgba(184,134,11,0.05)] to-transparent rounded-xl border border-[rgba(184,134,11,0.15)] luxury-fade-up stagger-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[rgba(184,134,11,0.1)] flex items-center justify-center text-[var(--burnished-gold)]">
                  {Icons.target}
                </div>
                <h3 className="font-display text-xl text-[var(--rich-navy)]">Puanlama Sistemi</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-body text-sm">
                {[
                  { label: 'Doğru Cevap', value: '+4 puan', color: 'var(--forest-sage)' },
                  { label: 'Yanlış/Boş', value: '0 puan', color: 'var(--muted-slate)' },
                  { label: 'Maksimum', value: `${exam.total_questions * 4} puan`, color: 'var(--burnished-gold)' },
                  { label: 'Başarı Kriteri', value: '%60+', color: 'var(--rich-navy)' }
                ].map((item, index) => (
                  <div key={index} className="text-center p-3 bg-white/50 rounded-lg">
                    <div className="text-[var(--muted-slate)] mb-1">{item.label}</div>
                    <div className="font-accent font-semibold" style={{ color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="mb-8 luxury-fade-up stagger-6">
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative flex-shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`
                    w-6 h-6 rounded-lg border-2 transition-all duration-300
                    ${agreed
                      ? 'bg-[var(--rich-navy)] border-[var(--rich-navy)]'
                      : 'border-[var(--antique-bronze)] group-hover:border-[var(--burnished-gold)]'
                    }
                  `}>
                    {agreed && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-full h-full p-1">
                        <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
                <span className="font-body text-[var(--muted-slate)] leading-relaxed">
                  Sınav kurallarını okudum ve anladım. Sınavı dürüst bir şekilde, hiçbir yardım almadan
                  çözeceğimi kabul ediyor ve sınava başlamak istiyorum.
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 luxury-fade-up stagger-7">
              <button
                onClick={startExam}
                disabled={!agreed || starting}
                className={`
                  luxury-btn flex-1 flex items-center justify-center gap-3 text-lg
                  ${(!agreed || starting) ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {starting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Başlatılıyor...</span>
                  </>
                ) : (
                  <>
                    {Icons.play}
                    <span>Sınava Başla</span>
                  </>
                )}
              </button>

              <Link
                href="/sinavlar"
                className="px-8 py-4 rounded-xl border border-[rgba(184,134,11,0.2)] text-[var(--rich-navy)] hover:border-[var(--burnished-gold)] hover:text-[var(--burnished-gold)] transition-all duration-300 font-accent font-medium"
              >
                İptal
              </Link>
            </div>

            {!agreed && (
              <p className="text-center mt-4 font-body text-sm text-[var(--deep-burgundy)] luxury-fade-up">
                Sınava başlamak için kuralları kabul etmeniz gerekir.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
