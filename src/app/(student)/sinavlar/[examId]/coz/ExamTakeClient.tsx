'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { firebase } from '@/lib/firebase-client'
import { Exam, Question } from '@/types'
import Image from 'next/image'

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Sınav hazırlanıyor...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Sınav Bulunamadı</h1>
          <p className="text-slate-600 mb-6">Bu sınav mevcut değil veya erişim yetkiniz bulunmuyor.</p>
          <button
            onClick={() => router.push('/sinavlar')}
            className="btn-primary"
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-slate-900">{session.exam.title}</h1>
              {session.reviewMode && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  İnceleme Modu
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Timer */}
              {!session.reviewMode && (
                <div className={`text-lg font-mono font-bold px-3 py-1 rounded ${
                  timeWarning ? 'text-red-600 bg-red-50' : 'text-slate-700'
                }`}>
                  ⏰ {formatTime(session.timeRemaining)}
                </div>
              )}

              {/* Question Palette Toggle */}
              <button
                onClick={() => setShowQuestionPalette(!showQuestionPalette)}
                className="btn-secondary text-sm"
              >
                Sorular ({session.currentQuestion + 1}/{session.questions.length})
              </button>

              {/* Review Mode Toggle */}
              {session.reviewMode ? (
                <button
                  onClick={exitReviewMode}
                  className="btn-secondary text-sm"
                >
                  Sınava Dön
                </button>
              ) : (
                <button
                  onClick={enterReviewMode}
                  className="btn-outline text-sm"
                >
                  İnceleme Modu
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>İlerleme</span>
              <span>
                Cevaplanan: {getAnsweredCount()} • 
                İşaretlenen: {getFlaggedCount()} • 
                Kalan: {session.questions.length - getAnsweredCount()}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(getAnsweredCount() / session.questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Question Palette */}
      {showQuestionPalette && (
        <div className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-slate-900">Soru Paleti</h3>
              <button
                onClick={() => setShowQuestionPalette(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-10 sm:grid-cols-15 lg:grid-cols-20 gap-2">
              {session.questions.map((question, index) => {
                const status = getQuestionStatus(question.id)
                const isCurrent = index === session.currentQuestion
                
                return (
                  <button
                    key={question.id}
                    onClick={() => goToQuestion(index)}
                    className={`p-2 text-sm rounded font-medium transition-colors ${
                      isCurrent 
                        ? 'bg-blue-500 text-white' 
                        : status === 'answered'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : status === 'flagged'
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {index + 1}
                    {session.flaggedQuestions.has(question.id) && (
                      <span className="block text-xs">🏳️</span>
                    )}
                  </button>
                )
              })}
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-100 rounded"></div>
                <span>Cevaplandı</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-100 rounded"></div>
                <span>İşaretli</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-slate-100 rounded"></div>
                <span>Cevapsız</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Mevcut</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Question Card */}
        <div className="card p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                Soru {session.currentQuestion + 1}
              </span>
              <button
                onClick={() => toggleFlag(currentQuestion.id)}
                className={`p-2 rounded-lg transition-colors ${
                  session.flaggedQuestions.has(currentQuestion.id)
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
                title={session.flaggedQuestions.has(currentQuestion.id) ? 'İşareti Kaldır' : 'İşaretle'}
              >
                🏳️
              </button>
            </div>
            
            {/* Show Explanation Button */}
            <button
              onClick={() => toggleExplanation(currentQuestion.id)}
              className="btn-outline text-sm"
            >
              {session.showExplanations[currentQuestion.id] ? 'Açıklamayı Gizle' : 'Açıklamayı Göster'}
            </button>
          </div>

          {/* Question Image */}
          {currentQuestion.image_url && (
            <div className="mb-6">
              <Image
                src={currentQuestion.image_url}
                alt="Soru görseli"
                width={800}
                height={400}
                className="rounded-lg shadow-sm max-w-full h-auto"
              />
            </div>
          )}

          {/* Question Text */}
          <div className="mb-8">
            <p className="text-lg text-slate-800 leading-relaxed whitespace-pre-wrap">
              {currentQuestion.question_text}
            </p>
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-6">
            {(['A', 'B', 'C', 'D', 'E'] as const).map((option) => {
              const optionText = currentQuestion[`option_${option.toLowerCase()}` as keyof Question] as string
              const isSelected = session.answers[currentQuestion.id] === option
              const isCorrect = currentQuestion.correct_answer === option
              const showResult = session.showExplanations[currentQuestion.id]
              
              return (
                <label
                  key={option}
                  className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    showResult
                      ? isCorrect
                        ? 'border-green-500 bg-green-50'
                        : isSelected && !isCorrect
                        ? 'border-red-500 bg-red-50'
                        : 'border-slate-200 bg-slate-50'
                      : isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
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
                    <div className="flex items-center gap-3">
                      <span className={`font-bold text-lg ${
                        showResult && isCorrect ? 'text-green-600' :
                        showResult && isSelected && !isCorrect ? 'text-red-600' :
                        isSelected ? 'text-blue-600' : 'text-slate-700'
                      }`}>
                        {option})
                      </span>
                      <span className="text-slate-800">{optionText}</span>
                    </div>
                    {showResult && (
                      <div>
                        {isCorrect && <span className="text-green-600 text-xl">✓</span>}
                        {isSelected && !isCorrect && <span className="text-red-600 text-xl">✗</span>}
                      </div>
                    )}
                  </div>
                </label>
              )
            })}
          </div>

          {/* Explanation */}
          {session.showExplanations[currentQuestion.id] && (
            <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">💡</span>
                <h4 className="font-semibold text-blue-900">Açıklama ve Çözüm</h4>
              </div>
              <div className="mb-4">
                <p className="font-medium text-blue-800 mb-2">
                  Doğru Cevap: <span className="font-bold text-lg">{currentQuestion.correct_answer}</span>
                </p>
              </div>
              <div className="text-blue-800 leading-relaxed whitespace-pre-wrap">
                {currentQuestion.explanation || 'Bu soru için henüz açıklama eklenmemiş.'}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigateQuestion('prev')}
            disabled={session.currentQuestion === 0}
            className={`px-6 py-3 rounded-lg font-medium ${
              session.currentQuestion === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'btn-secondary'
            }`}
          >
            ← Önceki Soru
          </button>

          <div className="flex gap-3">
            {/* Clear Answer */}
            {session.answers[currentQuestion.id] && !session.reviewMode && (
              <button
                onClick={() => handleAnswerSelect(currentQuestion.id, '')}
                className="btn-outline text-sm"
              >
                Cevabı Temizle
              </button>
            )}

            {/* Submit or Next */}
            {isLastQuestion ? (
              <button
                onClick={() => setShowSubmitConfirm(true)}
                disabled={session.isSubmitting || session.reviewMode}
                className="btn-primary px-6 py-3"
              >
                {session.isSubmitting ? 'Gönderiliyor...' : 'Sınavı Bitir'}
              </button>
            ) : (
              <button
                onClick={() => navigateQuestion('next')}
                className="btn-primary px-6 py-3"
              >
                Sonraki Soru →
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Sınavı Bitir</h3>
            
            <div className="mb-6 space-y-2 text-sm text-slate-600">
              <p>• Toplam Soru: {session.questions.length}</p>
              <p>• Cevaplanan: {getAnsweredCount()}</p>
              <p>• Boş Bırakılan: {session.questions.length - getAnsweredCount()}</p>
              <p>• Kalan Süre: {formatTime(session.timeRemaining)}</p>
            </div>
            
            <p className="text-slate-700 mb-6">
              Sınavı bitirmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="btn-secondary flex-1"
              >
                İptal
              </button>
              <button
                onClick={() => submitExam()}
                className="btn-primary flex-1"
              >
                Evet, Bitir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Warning */}
      {timeWarning && !session.reviewMode && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-bold">Süre Azalıyor!</p>
              <p className="text-sm">Kalan: {formatTime(session.timeRemaining)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}