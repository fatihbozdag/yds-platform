'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { firebase } from '@/lib/firebase-client'
import { Exam, Question, ExamResult } from '@/types'

// Custom SVG Icons for Scholarly Elegance
const Icons = {
  back: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 1012 0V2z" />
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
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" />
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M23 4v6h-6M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  ),
  list: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  eyeOff: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  lightbulb: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M9 18h6M10 22h4M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14" />
    </svg>
  ),
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" className="w-6 h-6">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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
}

interface DetailedResult extends ExamResult {
  exam: Exam
  questions: (Question & { userAnswer?: string; isCorrect: boolean })[]
}

export default function ExamResultPage() {
  const params = useParams()
  const router = useRouter()
  const [result, setResult] = useState<DetailedResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (params.examId) {
      fetchLatestResult(params.examId as string)
    }
  }, [params.examId])

  const fetchLatestResult = async (examId: string) => {
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get the latest exam result for this user and exam
      const { data: resultData, error: resultError } = await firebase
        .from('exam_results')
        .select('*')
        .eq('student_id', user.id)
        .eq('exam_id', examId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single()

      if (resultError) {
        console.error('Result fetch error:', resultError)
        router.push('/sinavlar')
        return
      }

      // Get exam details
      const { data: examData, error: examError } = await firebase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .single()

      if (examError) throw examError

      // Get questions with user answers
      const { data: questionsData, error: questionsError } = await firebase
        .from('questions')
        .select('*')
        .eq('exam_id', examId)
        .order('order_index', { ascending: true })

      if (questionsError) throw questionsError

      // Combine questions with user answers
      const questionsWithAnswers = questionsData.map(question => {
        const userAnswer = resultData.answers[question.id] || null
        const isCorrect = userAnswer === question.correct_answer

        return {
          ...question,
          userAnswer,
          isCorrect
        }
      })

      setResult({
        ...resultData,
        exam: examData,
        questions: questionsWithAnswers
      })

    } catch (error) {
      console.error('Error fetching exam result:', error)
      alert('Sınav sonucu yüklenirken bir hata oluştu')
      router.push('/sinavlar')
    } finally {
      setLoading(false)
    }
  }

  const getScoreLevel = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return 'excellent'
    if (percentage >= 60) return 'good'
    if (percentage >= 40) return 'average'
    return 'needs-work'
  }

  const getPerformanceData = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return {
      message: 'Mükemmel! Çok başarılı bir performans sergileydiniz.',
      color: 'var(--luxury-sage)',
      bgColor: 'var(--luxury-sage)',
      icon: Icons.trophy
    }
    if (percentage >= 60) return {
      message: 'İyi iş! Hedeflenen seviyeye ulaştınız.',
      color: 'var(--luxury-gold)',
      bgColor: 'var(--luxury-gold)',
      icon: Icons.star
    }
    if (percentage >= 40) return {
      message: 'Fena değil, biraz daha çalışma ile daha iyi olabilir.',
      color: 'var(--luxury-navy)',
      bgColor: 'var(--luxury-navy)',
      icon: Icons.target
    }
    return {
      message: 'Daha fazla çalışma gerekiyor. Pes etmeyin!',
      color: 'var(--luxury-burgundy)',
      bgColor: 'var(--luxury-burgundy)',
      icon: Icons.lightbulb
    }
  }

  const calculateExamDuration = () => {
    if (!result) return 0
    const startTime = new Date(result.started_at).getTime()
    const endTime = new Date(result.completed_at).getTime()
    return Math.round((endTime - startTime) / 1000 / 60) // minutes
  }

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
            Sonuçlar yükleniyor...
          </p>
        </div>
      </div>
    )
  }

  // Not Found State
  if (!result) {
    return (
      <div className="min-h-screen paper-texture flex items-center justify-center">
        <div className="text-center luxury-fade-up max-w-md mx-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--luxury-burgundy)]/10 flex items-center justify-center">
            <span className="text-[var(--luxury-burgundy)]">{Icons.x}</span>
          </div>
          <h1 className="font-display text-3xl text-[var(--luxury-navy)] mb-4">
            Sonuç Bulunamadı
          </h1>
          <p className="font-body text-[var(--luxury-charcoal)]/70 mb-8">
            Bu sınav için henüz bir sonuç bulunmuyor.
          </p>
          <Link href="/sinavlar" className="luxury-btn inline-flex items-center gap-2">
            {Icons.back}
            <span>Sınavlara Dön</span>
          </Link>
        </div>
      </div>
    )
  }

  const maxScore = result.exam.total_questions * 4
  const percentage = Math.round((result.score / maxScore) * 100)
  const performanceData = getPerformanceData(result.score, maxScore)
  const scoreLevel = getScoreLevel(result.score, maxScore)

  return (
    <div className="min-h-screen paper-texture py-8 px-4">
      <div className="max-w-4xl mx-auto">
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

        {/* Main Result Card */}
        <div className="luxury-card overflow-hidden mb-8 luxury-fade-up stagger-1">
          {/* Header with Gradient */}
          <div className="relative bg-gradient-to-br from-[var(--luxury-navy)] via-[var(--luxury-navy)] to-[var(--luxury-charcoal)] text-white p-10 overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--luxury-gold)]/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--luxury-sage)]/10 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2" />

            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-6 text-[var(--luxury-gold)]">
                {performanceData.icon}
              </div>
              <h1 className="font-display text-4xl mb-3">Sınav Tamamlandı!</h1>
              <p className="font-body text-white/70 text-lg">{result.exam.title}</p>
            </div>
          </div>

          {/* Score Section */}
          <div className="p-10">
            {/* Main Score Display */}
            <div className="text-center mb-10">
              <div className="relative inline-block">
                {/* Circular Progress */}
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke="var(--luxury-charcoal)"
                    strokeWidth="8"
                    opacity="0.1"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke={performanceData.bgColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${percentage * 5.53} 553`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-5xl" style={{ color: performanceData.color }}>
                    {result.score}
                  </span>
                  <span className="font-body text-[var(--luxury-charcoal)]/50 text-lg">/ {maxScore}</span>
                </div>
              </div>

              <div className="mt-6">
                <span
                  className="inline-flex items-center px-6 py-2 rounded-full font-accent font-semibold text-lg text-white"
                  style={{ backgroundColor: performanceData.bgColor }}
                >
                  %{percentage}
                </span>
              </div>

              <p className="font-body text-[var(--luxury-charcoal)] text-lg mt-4 max-w-md mx-auto">
                {performanceData.message}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="text-center p-5 rounded-xl bg-[var(--luxury-sage)]/10 border border-[var(--luxury-sage)]/20 luxury-fade-up stagger-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--luxury-sage)]/20 mx-auto mb-3">
                  <span className="text-[var(--luxury-sage)]">{Icons.check}</span>
                </div>
                <div className="font-display text-3xl text-[var(--luxury-sage)]">{result.correct_count}</div>
                <div className="font-body text-sm text-[var(--luxury-charcoal)]/70">Doğru</div>
              </div>

              <div className="text-center p-5 rounded-xl bg-[var(--luxury-burgundy)]/10 border border-[var(--luxury-burgundy)]/20 luxury-fade-up stagger-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--luxury-burgundy)]/20 mx-auto mb-3">
                  <span className="text-[var(--luxury-burgundy)]">{Icons.x}</span>
                </div>
                <div className="font-display text-3xl text-[var(--luxury-burgundy)]">{result.wrong_count}</div>
                <div className="font-body text-sm text-[var(--luxury-charcoal)]/70">Yanlış</div>
              </div>

              <div className="text-center p-5 rounded-xl bg-[var(--luxury-charcoal)]/5 border border-[var(--luxury-charcoal)]/10 luxury-fade-up stagger-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--luxury-charcoal)]/10 mx-auto mb-3">
                  <span className="text-[var(--luxury-charcoal)]/50">{Icons.minus}</span>
                </div>
                <div className="font-display text-3xl text-[var(--luxury-charcoal)]">{result.empty_count}</div>
                <div className="font-body text-sm text-[var(--luxury-charcoal)]/70">Boş</div>
              </div>

              <div className="text-center p-5 rounded-xl bg-[var(--luxury-gold)]/10 border border-[var(--luxury-gold)]/20 luxury-fade-up stagger-5">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--luxury-gold)]/20 mx-auto mb-3">
                  <span className="text-[var(--luxury-gold)]">{Icons.clock}</span>
                </div>
                <div className="font-display text-3xl text-[var(--luxury-gold)]">{calculateExamDuration()}</div>
                <div className="font-body text-sm text-[var(--luxury-charcoal)]/70">Dakika</div>
              </div>
            </div>

            {/* Performance Analysis */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-[var(--luxury-ivory)] to-[var(--luxury-cream)] border border-[var(--luxury-gold)]/10 mb-8 luxury-fade-up stagger-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--luxury-navy)]/10 text-[var(--luxury-navy)]">
                  {Icons.chart}
                </span>
                <h3 className="font-display text-xl text-[var(--luxury-navy)]">Performans Analizi</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/50">
                  <span className="font-body text-[var(--luxury-charcoal)]/70">Doğru Yüzdesi</span>
                  <span className="font-accent font-semibold text-[var(--luxury-sage)]">
                    %{Math.round((result.correct_count / result.exam.total_questions) * 100)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/50">
                  <span className="font-body text-[var(--luxury-charcoal)]/70">Tamamlama Süresi</span>
                  <span className="font-accent font-semibold text-[var(--luxury-navy)]">
                    {calculateExamDuration()} / {result.exam.duration_minutes} dk
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/50">
                  <span className="font-body text-[var(--luxury-charcoal)]/70">Soru Başı Ort. Süre</span>
                  <span className="font-accent font-semibold text-[var(--luxury-gold)]">
                    {Math.round(calculateExamDuration() / result.exam.total_questions * 10) / 10} dk
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/50">
                  <span className="font-body text-[var(--luxury-charcoal)]/70">Tamamlama Tarihi</span>
                  <span className="font-accent font-semibold text-[var(--luxury-charcoal)]">
                    {new Date(result.completed_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center luxury-fade-up stagger-7">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-accent font-medium border border-[var(--luxury-charcoal)]/20 text-[var(--luxury-charcoal)] hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)] transition-all duration-300"
              >
                {showDetails ? Icons.eyeOff : Icons.eye}
                <span>{showDetails ? 'Detayları Gizle' : 'Detaylı Sonuçlar'}</span>
              </button>

              <Link
                href={`/sinavlar/${result.exam.id}/analiz`}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-accent font-medium bg-[var(--luxury-navy)] text-white hover:bg-[var(--luxury-navy)]/90 transition-all duration-300"
              >
                {Icons.chart}
                <span>Detaylı Analiz</span>
              </Link>

              <Link
                href={`/sinavlar/${result.exam.id}/baslat`}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-accent font-medium border border-[var(--luxury-sage)] text-[var(--luxury-sage)] hover:bg-[var(--luxury-sage)] hover:text-white transition-all duration-300"
              >
                {Icons.refresh}
                <span>Tekrar Çöz</span>
              </Link>

              <Link
                href="/sinavlar"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-accent font-medium border border-[var(--luxury-charcoal)]/20 text-[var(--luxury-charcoal)] hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)] transition-all duration-300"
              >
                {Icons.list}
                <span>Diğer Sınavlar</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        {showDetails && (
          <div className="luxury-card p-8 mb-8 luxury-fade-up">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[var(--luxury-gold)]/10">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--luxury-navy)]/10 text-[var(--luxury-navy)]">
                {Icons.scroll}
              </span>
              <h3 className="font-display text-2xl text-[var(--luxury-navy)]">Detaylı Sonuçlar</h3>
            </div>

            <div className="space-y-6">
              {result.questions.map((question, index) => (
                <div
                  key={question.id}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 luxury-fade-up ${
                    question.isCorrect
                      ? 'border-[var(--luxury-sage)]/30 bg-[var(--luxury-sage)]/5'
                      : question.userAnswer
                        ? 'border-[var(--luxury-burgundy)]/30 bg-[var(--luxury-burgundy)]/5'
                        : 'border-[var(--luxury-charcoal)]/10 bg-[var(--luxury-charcoal)]/5'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center justify-center w-10 h-10 rounded-full font-display text-lg text-white ${
                        question.isCorrect
                          ? 'bg-[var(--luxury-sage)]'
                          : question.userAnswer
                            ? 'bg-[var(--luxury-burgundy)]'
                            : 'bg-[var(--luxury-charcoal)]'
                      }`}>
                        {index + 1}
                      </span>
                      <span className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        question.isCorrect
                          ? 'bg-[var(--luxury-sage)]/20 text-[var(--luxury-sage)]'
                          : question.userAnswer
                            ? 'bg-[var(--luxury-burgundy)]/20 text-[var(--luxury-burgundy)]'
                            : 'bg-[var(--luxury-charcoal)]/10 text-[var(--luxury-charcoal)]'
                      }`}>
                        {question.isCorrect ? Icons.check : question.userAnswer ? Icons.x : Icons.minus}
                      </span>
                    </div>

                    <span className={`font-accent font-semibold ${
                      question.isCorrect
                        ? 'text-[var(--luxury-sage)]'
                        : 'text-[var(--luxury-charcoal)]/50'
                    }`}>
                      {question.isCorrect ? '+4 puan' : '0 puan'}
                    </span>
                  </div>

                  {/* Question Text */}
                  <div className="mb-6">
                    <p className="font-body text-[var(--luxury-charcoal)] leading-relaxed">
                      {question.question_text}
                    </p>
                  </div>

                  {/* Answer Options */}
                  <div className="space-y-2 mb-6">
                    {(['A', 'B', 'C', 'D', 'E'] as const).map(option => {
                      const optionText = question[`option_${option.toLowerCase()}` as keyof Question] as string
                      if (!optionText) return null

                      const isCorrect = option === question.correct_answer
                      const isUserAnswer = option === question.userAnswer

                      return (
                        <div
                          key={option}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            isCorrect && isUserAnswer
                              ? 'bg-[var(--luxury-sage)]/20 border-[var(--luxury-sage)]'
                              : isCorrect
                                ? 'bg-[var(--luxury-sage)]/20 border-[var(--luxury-sage)]'
                                : isUserAnswer
                                  ? 'bg-[var(--luxury-burgundy)]/10 border-[var(--luxury-burgundy)]'
                                  : 'bg-white/50 border-[var(--luxury-charcoal)]/10'
                          }`}
                        >
                          <span className={`flex items-center justify-center w-8 h-8 rounded-full font-display text-sm ${
                            isCorrect
                              ? 'bg-[var(--luxury-sage)] text-white'
                              : isUserAnswer
                                ? 'bg-[var(--luxury-burgundy)] text-white'
                                : 'bg-[var(--luxury-charcoal)]/10 text-[var(--luxury-charcoal)]'
                          }`}>
                            {option}
                          </span>
                          <span className="font-body text-[var(--luxury-charcoal)] flex-1">{optionText}</span>
                          {isCorrect && (
                            <span className="flex items-center gap-1 text-[var(--luxury-sage)] font-accent text-sm font-medium">
                              {Icons.check}
                              <span>Doğru</span>
                            </span>
                          )}
                          {isUserAnswer && !isCorrect && (
                            <span className="flex items-center gap-1 text-[var(--luxury-burgundy)] font-accent text-sm font-medium">
                              {Icons.x}
                              <span>Seçiminiz</span>
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--luxury-gold)]/10 to-[var(--luxury-sage)]/5 border border-[var(--luxury-gold)]/20">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[var(--luxury-gold)]">{Icons.lightbulb}</span>
                        <span className="font-accent font-medium text-[var(--luxury-navy)]">Açıklama</span>
                      </div>
                      <p className="font-body text-sm text-[var(--luxury-charcoal)]/80 pl-7">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="luxury-card p-8 luxury-fade-up stagger-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--luxury-gold)]/10 text-[var(--luxury-gold)]">
              {Icons.target}
            </span>
            <h3 className="font-display text-xl text-[var(--luxury-navy)]">Öneriler</h3>
          </div>

          <div className="space-y-4">
            {percentage >= 80 ? (
              <>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--luxury-sage)]/10">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[var(--luxury-sage)]/20 text-[var(--luxury-sage)]">
                    {Icons.check}
                  </span>
                  <span className="font-body text-[var(--luxury-charcoal)]">
                    Mükemmel performans! Bu seviyeyi koruyun.
                  </span>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--luxury-sage)]/10">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[var(--luxury-sage)]/20 text-[var(--luxury-sage)]">
                    {Icons.check}
                  </span>
                  <span className="font-body text-[var(--luxury-charcoal)]">
                    Diğer konulardaki sınavlarda da aynı başarıyı göstermeye çalışın.
                  </span>
                </div>
              </>
            ) : percentage >= 60 ? (
              <>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--luxury-gold)]/10">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[var(--luxury-gold)]/20 text-[var(--luxury-gold)]">
                    {Icons.lightbulb}
                  </span>
                  <span className="font-body text-[var(--luxury-charcoal)]">
                    İyi bir performans sergileydiniz. Yanlış yaptığınız konuları tekrar edin.
                  </span>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--luxury-gold)]/10">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[var(--luxury-gold)]/20 text-[var(--luxury-gold)]">
                    {Icons.target}
                  </span>
                  <span className="font-body text-[var(--luxury-charcoal)]">
                    Daha fazla pratik yaparak %80+ hedefleyebilirsiniz.
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--luxury-burgundy)]/10">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[var(--luxury-burgundy)]/20 text-[var(--luxury-burgundy)]">
                    {Icons.lightbulb}
                  </span>
                  <span className="font-body text-[var(--luxury-charcoal)]">
                    Konuları tekrar etmenizi öneririz. Detaylı sonuçları inceleyin.
                  </span>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--luxury-burgundy)]/10">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[var(--luxury-burgundy)]/20 text-[var(--luxury-burgundy)]">
                    {Icons.target}
                  </span>
                  <span className="font-body text-[var(--luxury-charcoal)]">
                    Zayıf olduğunuz konular için ek çalışma yapın.
                  </span>
                </div>
              </>
            )}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--luxury-navy)]/5">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[var(--luxury-navy)]/10 text-[var(--luxury-navy)]">
                {Icons.lightbulb}
              </span>
              <span className="font-body text-[var(--luxury-charcoal)]">
                Sorularınız varsa &quot;Eğitmene Sor&quot; bölümünü kullanabilirsiniz.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
