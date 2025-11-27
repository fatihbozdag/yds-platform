'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { firebase } from '@/lib/firebase-client'
import { Exam, Question } from '@/types'
import Image from 'next/image'

// Custom SVG Icons for Scholarly Elegance
const Icons = {
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" strokeLinecap="round" />
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
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
  flag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  ),
  flagFilled: (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
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
  chevronLeft: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  chevronRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  lightbulb: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M9 18h6M10 22h4M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  send: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  eraser: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M20 20H7L3 16a1 1 0 010-1.41L13.59 4a2 2 0 012.82 0L21 8.59a2 2 0 010 2.82L10 22" />
      <line x1="18" y1="13" x2="9" y2="4" />
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

interface ExamSession {
  exam: Exam
  questions: Question[]
  answers: Record<string, string>
  timeRemaining: number
  currentQuestion: number
  isSubmitting: boolean
  showExplanations: Record<string, boolean>
  flaggedQuestions: Set<string>
  reviewMode: boolean
}

export default function ExamTakingPage() {
  const params = useParams()
  const router = useRouter()
  const [session, setSession] = useState<ExamSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [showQuestionPalette, setShowQuestionPalette] = useState(false)

  // Initialize exam session
  useEffect(() => {
    if (params.examId) {
      initializeExam(params.examId as string)
    }
  }, [params.examId])

  // Timer countdown
  useEffect(() => {
    if (!session || session.timeRemaining <= 0 || session.reviewMode) return

    const timer = setInterval(() => {
      setSession(prev => {
        if (!prev) return null

        const newTimeRemaining = prev.timeRemaining - 1

        // Auto-submit when time runs out
        if (newTimeRemaining <= 0) {
          submitExam(true) // auto-submit flag
          return { ...prev, timeRemaining: 0 }
        }

        return { ...prev, timeRemaining: newTimeRemaining }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [session])

  const initializeExam = async (examId: string) => {
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Load exam metadata
      const metaResponse = await fetch('/exams-data.json')
      if (!metaResponse.ok) throw new Error('Failed to load exam metadata')

      const examsMap = await metaResponse.json()
      const exam = examsMap[examId]

      if (!exam) {
        console.error('Exam not found')
        router.push('/sinavlar')
        return
      }

      // Load exam questions from content file
      const contentResponse = await fetch(exam.content_file)
      if (!contentResponse.ok) throw new Error('Failed to load exam content')

      const examContent = await contentResponse.json()
      const questions = examContent.questions || []

      // Check localStorage for existing in-progress session
      const sessionKey = `exam_session_${user.id}_${examId}`
      const savedSession = localStorage.getItem(sessionKey)
      let existingAnswers = {}
      let timeRemaining = exam.duration_minutes * 60

      if (savedSession) {
        const parsed = JSON.parse(savedSession)
        existingAnswers = parsed.answers || {}
        timeRemaining = parsed.timeRemaining || timeRemaining
      }

      // Check if exam was already completed
      const resultsKey = `exam_results_${user.id}`
      const storedResults = localStorage.getItem(resultsKey)
      const results = storedResults ? JSON.parse(storedResults) : []
      const completedResult = results.find((r: any) => r.exam_id === examId && r.completed_at)

      if (completedResult) {
        router.push(`/sinavlar/${examId}/sonuclar`)
        return
      }

      setSession({
        exam,
        questions,
        answers: existingAnswers,
        timeRemaining,
        currentQuestion: 0,
        isSubmitting: false,
        showExplanations: {},
        flaggedQuestions: new Set(),
        reviewMode: false
      })
    } catch (error) {
      console.error('Error initializing exam:', error)
      alert('Sınav başlatılırken hata oluştu')
      router.push('/sinavlar')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (questionId: string, answer: string) => {
    if (session?.reviewMode) return

    setSession(prev => {
      if (!prev) return null
      const newAnswers = { ...prev.answers, [questionId]: answer }

      // Save to localStorage
      firebase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          const sessionKey = `exam_session_${user.id}_${prev.exam.id}`
          localStorage.setItem(sessionKey, JSON.stringify({
            answers: newAnswers,
            timeRemaining: prev.timeRemaining,
            lastUpdated: new Date().toISOString()
          }))
        }
      })

      return {
        ...prev,
        answers: newAnswers
      }
    })
  }

  const toggleExplanation = (questionId: string) => {
    setSession(prev => {
      if (!prev) return null
      return {
        ...prev,
        showExplanations: {
          ...prev.showExplanations,
          [questionId]: !prev.showExplanations[questionId]
        }
      }
    })
  }

  const toggleFlag = (questionId: string) => {
    setSession(prev => {
      if (!prev) return null
      const newFlagged = new Set(prev.flaggedQuestions)
      if (newFlagged.has(questionId)) {
        newFlagged.delete(questionId)
      } else {
        newFlagged.add(questionId)
      }
      return { ...prev, flaggedQuestions: newFlagged }
    })
  }

  const goToQuestion = (index: number) => {
    setSession(prev => {
      if (!prev) return null
      return { ...prev, currentQuestion: index }
    })
    setShowQuestionPalette(false)
  }

  const navigateQuestion = (direction: 'prev' | 'next') => {
    setSession(prev => {
      if (!prev) return null

      let newIndex = prev.currentQuestion
      if (direction === 'prev' && newIndex > 0) {
        newIndex -= 1
      } else if (direction === 'next' && newIndex < prev.questions.length - 1) {
        newIndex += 1
      }

      return { ...prev, currentQuestion: newIndex }
    })
  }

  const enterReviewMode = () => {
    setSession(prev => {
      if (!prev) return null
      return { ...prev, reviewMode: true }
    })
  }

  const exitReviewMode = () => {
    setSession(prev => {
      if (!prev) return null
      return { ...prev, reviewMode: false }
    })
  }

  const submitExam = async (autoSubmit = false) => {
    if (!session || session.isSubmitting) return

    if (!autoSubmit && !confirm('Sınavı bitirmek istediğinizden emin misiniz?')) {
      return
    }

    setSession(prev => prev ? { ...prev, isSubmitting: true } : null)

    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) return

      // Calculate results
      let correctCount = 0
      let wrongCount = 0
      let emptyCount = 0

      session.questions.forEach(question => {
        const userAnswer = session.answers[question.id]
        if (!userAnswer) {
          emptyCount++
        } else if (userAnswer === question.correct_answer) {
          correctCount++
        } else {
          wrongCount++
        }
      })

      const totalQuestions = session.questions.length
      const score = Math.round((correctCount / totalQuestions) * 100)
      const timeSpent = session.exam.duration_minutes * 60 - session.timeRemaining

      // Save result to localStorage
      const resultsKey = `exam_results_${user.id}`
      const storedResults = localStorage.getItem(resultsKey)
      const results = storedResults ? JSON.parse(storedResults) : []

      const newResult = {
        id: `result-${Date.now()}`,
        student_id: user.id,
        exam_id: session.exam.id,
        score,
        correct_count: correctCount,
        wrong_count: wrongCount,
        empty_count: emptyCount,
        answers: session.answers,
        time_spent: timeSpent,
        started_at: new Date(Date.now() - (timeSpent * 1000)).toISOString(),
        completed_at: new Date().toISOString()
      }

      results.push(newResult)
      localStorage.setItem(resultsKey, JSON.stringify(results))

      // Clear exam session
      const sessionKey = `exam_session_${user.id}_${session.exam.id}`
      localStorage.removeItem(sessionKey)

      // Redirect to results page
      router.push(`/sinavlar/${session.exam.id}/sonuclar`)

    } catch (error) {
      console.error('Error submitting exam:', error)
      alert('Sınav gönderilirken hata oluştu')
      setSession(prev => prev ? { ...prev, isSubmitting: false } : null)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getQuestionStatus = (questionId: string) => {
    if (session?.answers[questionId]) return 'answered'
    if (session?.flaggedQuestions.has(questionId)) return 'flagged'
    return 'unanswered'
  }

  const getAnsweredCount = () => {
    return Object.keys(session?.answers || {}).length
  }

  const getFlaggedCount = () => {
    return session?.flaggedQuestions.size || 0
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
            Sınav hazırlanıyor...
          </p>
        </div>
      </div>
    )
  }

  // Not Found State
  if (!session) {
    return (
      <div className="min-h-screen paper-texture flex items-center justify-center">
        <div className="text-center luxury-fade-up max-w-md mx-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--luxury-burgundy)]/10 flex items-center justify-center">
            <span className="text-[var(--luxury-burgundy)]">{Icons.warning}</span>
          </div>
          <h1 className="font-display text-3xl text-[var(--luxury-navy)] mb-4">
            Sınav Bulunamadı
          </h1>
          <p className="font-body text-[var(--luxury-charcoal)]/70 mb-8">
            Bu sınav mevcut değil veya erişim yetkiniz bulunmuyor.
          </p>
          <button
            onClick={() => router.push('/sinavlar')}
            className="luxury-btn"
          >
            Sınavlara Dön
          </button>
        </div>
      </div>
    )
  }

  const currentQuestion = session.questions[session.currentQuestion]
  const isLastQuestion = session.currentQuestion === session.questions.length - 1
  const timeWarning = session.timeRemaining <= 300 // 5 minutes warning
  const timeCritical = session.timeRemaining <= 60 // 1 minute critical

  return (
    <div className="min-h-screen paper-texture">
      {/* Elegant Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--luxury-cream)]/95 border-b border-[var(--luxury-gold)]/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Left: Title */}
            <div className="flex items-center gap-4">
              <h1 className="font-display text-xl md:text-2xl text-[var(--luxury-navy)]">
                {session.exam.title}
              </h1>
              {session.reviewMode && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--luxury-sage)]/20 text-[var(--luxury-sage)] font-accent text-sm font-medium">
                  <span className="text-[var(--luxury-sage)]">{Icons.eye}</span>
                  İnceleme Modu
                </span>
              )}
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-3">
              {/* Timer */}
              {!session.reviewMode && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-semibold transition-all duration-300 ${
                  timeCritical
                    ? 'bg-[var(--luxury-burgundy)] text-white animate-pulse'
                    : timeWarning
                    ? 'bg-[var(--luxury-burgundy)]/10 text-[var(--luxury-burgundy)]'
                    : 'bg-[var(--luxury-navy)]/5 text-[var(--luxury-navy)]'
                }`}>
                  <span className={timeCritical ? 'text-white' : timeWarning ? 'text-[var(--luxury-burgundy)]' : 'text-[var(--luxury-gold)]'}>
                    {Icons.clock}
                  </span>
                  <span className="text-lg">{formatTime(session.timeRemaining)}</span>
                </div>
              )}

              {/* Question Palette Toggle */}
              <button
                onClick={() => setShowQuestionPalette(!showQuestionPalette)}
                className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg font-accent text-sm font-medium transition-all duration-300 ${
                  showQuestionPalette
                    ? 'bg-[var(--luxury-gold)] text-white'
                    : 'bg-[var(--luxury-ivory)] text-[var(--luxury-charcoal)] hover:bg-[var(--luxury-gold)]/20'
                }`}
              >
                <span className={showQuestionPalette ? 'text-white' : 'text-[var(--luxury-gold)]'}>{Icons.grid}</span>
                <span>Soru {session.currentQuestion + 1}/{session.questions.length}</span>
              </button>

              {/* Review Mode Toggle */}
              {session.reviewMode ? (
                <button
                  onClick={exitReviewMode}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-accent text-sm font-medium bg-[var(--luxury-sage)] text-white hover:bg-[var(--luxury-sage)]/90 transition-all duration-300"
                >
                  <span>{Icons.eyeOff}</span>
                  <span className="hidden sm:inline">Sınava Dön</span>
                </button>
              ) : (
                <button
                  onClick={enterReviewMode}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-accent text-sm font-medium border border-[var(--luxury-charcoal)]/20 text-[var(--luxury-charcoal)] hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)] transition-all duration-300"
                >
                  <span>{Icons.eye}</span>
                  <span>İnceleme</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm font-body text-[var(--luxury-charcoal)]/70 mb-2">
              <span>İlerleme Durumu</span>
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--luxury-sage)]"></span>
                  Cevaplanan: {getAnsweredCount()}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--luxury-gold)]"></span>
                  İşaretli: {getFlaggedCount()}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--luxury-charcoal)]/20"></span>
                  Kalan: {session.questions.length - getAnsweredCount()}
                </span>
              </span>
            </div>
            <div className="w-full h-2 bg-[var(--luxury-charcoal)]/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--luxury-gold)] to-[var(--luxury-sage)] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(getAnsweredCount() / session.questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Question Palette Dropdown */}
      {showQuestionPalette && (
        <div className="sticky top-[140px] z-30 backdrop-blur-md bg-[var(--luxury-cream)]/98 border-b border-[var(--luxury-gold)]/20 shadow-lg luxury-fade-up">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-lg text-[var(--luxury-navy)]">Soru Paleti</h3>
              <button
                onClick={() => setShowQuestionPalette(false)}
                className="p-2 rounded-lg text-[var(--luxury-charcoal)]/50 hover:text-[var(--luxury-charcoal)] hover:bg-[var(--luxury-charcoal)]/5 transition-all"
              >
                {Icons.close}
              </button>
            </div>

            <div className="grid grid-cols-10 sm:grid-cols-15 lg:grid-cols-20 gap-2">
              {session.questions.map((question, index) => {
                const status = getQuestionStatus(question.id)
                const isCurrent = index === session.currentQuestion
                const isFlagged = session.flaggedQuestions.has(question.id)

                return (
                  <button
                    key={question.id}
                    onClick={() => goToQuestion(index)}
                    className={`relative p-2 text-sm rounded-lg font-accent font-medium transition-all duration-200 ${
                      isCurrent
                        ? 'bg-[var(--luxury-navy)] text-white shadow-lg scale-110'
                        : status === 'answered'
                        ? 'bg-[var(--luxury-sage)]/20 text-[var(--luxury-sage)] hover:bg-[var(--luxury-sage)]/30'
                        : status === 'flagged'
                        ? 'bg-[var(--luxury-gold)]/20 text-[var(--luxury-gold)] hover:bg-[var(--luxury-gold)]/30'
                        : 'bg-[var(--luxury-charcoal)]/5 text-[var(--luxury-charcoal)]/70 hover:bg-[var(--luxury-charcoal)]/10'
                    }`}
                  >
                    {index + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[var(--luxury-gold)] border-2 border-[var(--luxury-cream)]"></span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-[var(--luxury-gold)]/10">
              <div className="flex items-center gap-2 text-sm font-body text-[var(--luxury-charcoal)]/70">
                <div className="w-4 h-4 rounded bg-[var(--luxury-sage)]/20"></div>
                <span>Cevaplandı</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-body text-[var(--luxury-charcoal)]/70">
                <div className="w-4 h-4 rounded bg-[var(--luxury-gold)]/20"></div>
                <span>İşaretli</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-body text-[var(--luxury-charcoal)]/70">
                <div className="w-4 h-4 rounded bg-[var(--luxury-charcoal)]/5"></div>
                <span>Cevapsız</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-body text-[var(--luxury-charcoal)]/70">
                <div className="w-4 h-4 rounded bg-[var(--luxury-navy)]"></div>
                <span>Mevcut Soru</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Question Card */}
        <div className="luxury-card p-8 md:p-10 mb-6 luxury-fade-up">
          {/* Question Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b border-[var(--luxury-gold)]/10">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--luxury-navy)] text-white font-display text-lg">
                {session.currentQuestion + 1}
              </span>
              <div>
                <p className="font-body text-sm text-[var(--luxury-charcoal)]/50">
                  Soru {session.currentQuestion + 1} / {session.questions.length}
                </p>
                <p className="font-accent text-[var(--luxury-charcoal)]">
                  {currentQuestion.category || 'Genel'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Flag Button */}
              <button
                onClick={() => toggleFlag(currentQuestion.id)}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  session.flaggedQuestions.has(currentQuestion.id)
                    ? 'bg-[var(--luxury-gold)] text-white shadow-lg'
                    : 'bg-[var(--luxury-charcoal)]/5 text-[var(--luxury-charcoal)]/50 hover:bg-[var(--luxury-gold)]/20 hover:text-[var(--luxury-gold)]'
                }`}
                title={session.flaggedQuestions.has(currentQuestion.id) ? 'İşareti Kaldır' : 'İşaretle'}
              >
                {session.flaggedQuestions.has(currentQuestion.id) ? Icons.flagFilled : Icons.flag}
              </button>

              {/* Explanation Toggle */}
              <button
                onClick={() => toggleExplanation(currentQuestion.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-accent text-sm font-medium transition-all duration-300 ${
                  session.showExplanations[currentQuestion.id]
                    ? 'bg-[var(--luxury-sage)] text-white'
                    : 'border border-[var(--luxury-charcoal)]/20 text-[var(--luxury-charcoal)] hover:border-[var(--luxury-sage)] hover:text-[var(--luxury-sage)]'
                }`}
              >
                <span>{Icons.lightbulb}</span>
                <span className="hidden sm:inline">
                  {session.showExplanations[currentQuestion.id] ? 'Gizle' : 'Açıklama'}
                </span>
              </button>
            </div>
          </div>

          {/* Question Image */}
          {currentQuestion.image_url && (
            <div className="mb-8 rounded-xl overflow-hidden border border-[var(--luxury-gold)]/20">
              <Image
                src={currentQuestion.image_url}
                alt="Soru görseli"
                width={800}
                height={400}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Question Text */}
          <div className="mb-10">
            <p className="font-body text-lg md:text-xl text-[var(--luxury-charcoal)] leading-relaxed whitespace-pre-wrap">
              {currentQuestion.question_text}
            </p>
          </div>

          {/* Answer Options */}
          <div className="space-y-4 mb-8">
            {(['A', 'B', 'C', 'D', 'E'] as const).map((option, index) => {
              const optionText = currentQuestion[`option_${option.toLowerCase()}` as keyof Question] as string
              if (!optionText) return null

              const isSelected = session.answers[currentQuestion.id] === option
              const isCorrect = currentQuestion.correct_answer === option
              const showResult = session.showExplanations[currentQuestion.id]

              return (
                <label
                  key={option}
                  className={`group block p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 luxury-fade-up ${
                    showResult
                      ? isCorrect
                        ? 'border-[var(--luxury-sage)] bg-[var(--luxury-sage)]/10'
                        : isSelected && !isCorrect
                        ? 'border-[var(--luxury-burgundy)] bg-[var(--luxury-burgundy)]/10'
                        : 'border-[var(--luxury-charcoal)]/10 bg-[var(--luxury-charcoal)]/5'
                      : isSelected
                      ? 'border-[var(--luxury-gold)] bg-[var(--luxury-gold)]/10 shadow-lg'
                      : 'border-[var(--luxury-charcoal)]/10 hover:border-[var(--luxury-gold)]/50 hover:bg-[var(--luxury-gold)]/5'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={isSelected}
                    onChange={() => handleAnswerSelect(currentQuestion.id, option)}
                    disabled={session.reviewMode}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={`flex items-center justify-center w-10 h-10 rounded-full font-display text-lg transition-all duration-300 ${
                        showResult && isCorrect
                          ? 'bg-[var(--luxury-sage)] text-white'
                          : showResult && isSelected && !isCorrect
                          ? 'bg-[var(--luxury-burgundy)] text-white'
                          : isSelected
                          ? 'bg-[var(--luxury-gold)] text-white'
                          : 'bg-[var(--luxury-charcoal)]/10 text-[var(--luxury-charcoal)] group-hover:bg-[var(--luxury-gold)]/20 group-hover:text-[var(--luxury-gold)]'
                      }`}>
                        {option}
                      </span>
                      <span className={`font-body text-base md:text-lg ${
                        showResult && isCorrect ? 'text-[var(--luxury-sage)] font-medium' :
                        showResult && isSelected && !isCorrect ? 'text-[var(--luxury-burgundy)]' :
                        'text-[var(--luxury-charcoal)]'
                      }`}>
                        {optionText}
                      </span>
                    </div>
                    {showResult && (
                      <div className="flex-shrink-0">
                        {isCorrect && (
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--luxury-sage)] text-white">
                            {Icons.check}
                          </span>
                        )}
                        {isSelected && !isCorrect && (
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--luxury-burgundy)] text-white">
                            {Icons.x}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </label>
              )
            })}
          </div>

          {/* Explanation Panel */}
          {session.showExplanations[currentQuestion.id] && (
            <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-[var(--luxury-sage)]/10 to-[var(--luxury-gold)]/5 border border-[var(--luxury-sage)]/20 luxury-fade-up">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--luxury-sage)]/20 text-[var(--luxury-sage)]">
                  {Icons.lightbulb}
                </span>
                <div>
                  <h4 className="font-display text-lg text-[var(--luxury-navy)]">Açıklama ve Çözüm</h4>
                  <p className="font-body text-sm text-[var(--luxury-charcoal)]/70">
                    Doğru Cevap: <span className="font-semibold text-[var(--luxury-sage)]">{currentQuestion.correct_answer}</span>
                  </p>
                </div>
              </div>
              <div className="font-body text-[var(--luxury-charcoal)] leading-relaxed whitespace-pre-wrap pl-[52px]">
                {currentQuestion.explanation || 'Bu soru için henüz açıklama eklenmemiş.'}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 luxury-fade-up" style={{ animationDelay: '200ms' }}>
          <button
            onClick={() => navigateQuestion('prev')}
            disabled={session.currentQuestion === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-accent font-medium transition-all duration-300 ${
              session.currentQuestion === 0
                ? 'bg-[var(--luxury-charcoal)]/5 text-[var(--luxury-charcoal)]/30 cursor-not-allowed'
                : 'bg-[var(--luxury-ivory)] text-[var(--luxury-charcoal)] hover:bg-[var(--luxury-gold)]/20 hover:text-[var(--luxury-gold)] border border-[var(--luxury-charcoal)]/10 hover:border-[var(--luxury-gold)]'
            }`}
          >
            {Icons.chevronLeft}
            <span>Önceki Soru</span>
          </button>

          <div className="flex items-center gap-3">
            {/* Clear Answer */}
            {session.answers[currentQuestion.id] && !session.reviewMode && (
              <button
                onClick={() => handleAnswerSelect(currentQuestion.id, '')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-accent text-sm font-medium border border-[var(--luxury-charcoal)]/20 text-[var(--luxury-charcoal)]/70 hover:border-[var(--luxury-burgundy)] hover:text-[var(--luxury-burgundy)] transition-all duration-300"
              >
                <span>{Icons.eraser}</span>
                <span className="hidden sm:inline">Temizle</span>
              </button>
            )}

            {/* Mobile Question Palette */}
            <button
              onClick={() => setShowQuestionPalette(!showQuestionPalette)}
              className="md:hidden flex items-center gap-2 px-4 py-2 rounded-lg font-accent text-sm font-medium bg-[var(--luxury-ivory)] text-[var(--luxury-charcoal)] border border-[var(--luxury-charcoal)]/10"
            >
              <span className="text-[var(--luxury-gold)]">{Icons.grid}</span>
              <span>{session.currentQuestion + 1}/{session.questions.length}</span>
            </button>

            {/* Submit or Next */}
            {isLastQuestion ? (
              <button
                onClick={() => setShowSubmitConfirm(true)}
                disabled={session.isSubmitting || session.reviewMode}
                className="luxury-btn flex items-center gap-2 px-8"
              >
                <span>{Icons.send}</span>
                <span>{session.isSubmitting ? 'Gönderiliyor...' : 'Sınavı Bitir'}</span>
              </button>
            ) : (
              <button
                onClick={() => navigateQuestion('next')}
                className="luxury-btn flex items-center gap-2 px-8"
              >
                <span>Sonraki Soru</span>
                {Icons.chevronRight}
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-[var(--luxury-navy)]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="luxury-card p-8 max-w-md w-full luxury-scale-reveal">
            {/* Header with decorative element */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--luxury-gold)]/10 flex items-center justify-center">
                <span className="text-[var(--luxury-gold)]">{Icons.send}</span>
              </div>
              <h3 className="font-display text-2xl text-[var(--luxury-navy)]">Sınavı Bitir</h3>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-[var(--luxury-ivory)]">
              <div className="text-center">
                <p className="font-display text-2xl text-[var(--luxury-sage)]">{getAnsweredCount()}</p>
                <p className="font-body text-sm text-[var(--luxury-charcoal)]/70">Cevaplanan</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl text-[var(--luxury-burgundy)]">{session.questions.length - getAnsweredCount()}</p>
                <p className="font-body text-sm text-[var(--luxury-charcoal)]/70">Boş</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl text-[var(--luxury-navy)]">{session.questions.length}</p>
                <p className="font-body text-sm text-[var(--luxury-charcoal)]/70">Toplam Soru</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl text-[var(--luxury-gold)]">{formatTime(session.timeRemaining)}</p>
                <p className="font-body text-sm text-[var(--luxury-charcoal)]/70">Kalan Süre</p>
              </div>
            </div>

            <p className="font-body text-[var(--luxury-charcoal)]/80 text-center mb-8">
              Sınavı bitirmek istediğinizden emin misiniz?<br />
              <span className="text-[var(--luxury-burgundy)] text-sm">Bu işlem geri alınamaz.</span>
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-6 py-3 rounded-xl font-accent font-medium bg-[var(--luxury-ivory)] text-[var(--luxury-charcoal)] hover:bg-[var(--luxury-charcoal)]/10 transition-all duration-300 border border-[var(--luxury-charcoal)]/10"
              >
                İptal
              </button>
              <button
                onClick={() => submitExam()}
                className="flex-1 luxury-btn"
              >
                Evet, Bitir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Warning Toast */}
      {timeWarning && !session.reviewMode && (
        <div className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-2xl luxury-fade-up transition-all duration-500 ${
          timeCritical
            ? 'bg-[var(--luxury-burgundy)] text-white animate-pulse'
            : 'bg-gradient-to-r from-[var(--luxury-burgundy)] to-[var(--luxury-gold)] text-white'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-white/90">{Icons.warning}</span>
            <div>
              <p className="font-accent font-semibold">
                {timeCritical ? 'Son Dakika!' : 'Süre Azalıyor!'}
              </p>
              <p className="font-mono text-lg">{formatTime(session.timeRemaining)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
