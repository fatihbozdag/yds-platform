'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Question {
  id: number | string
  text?: string
  question?: string
  options: string[]
  correctAnswer: number
  correct_answer?: number
  explanation: string
  type?: string
}

interface Passage {
  text: string
  wordCount: number
}

interface Quiz {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  timeLimit: number
  passingScore: number
  questions: Question[]
  passage?: Passage
}

export default function QuizTakePage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quizId as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    fetchQuiz()
  }, [quizId])

  useEffect(() => {
    if (quiz && !showResults && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            submitQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [quiz, showResults, timeRemaining])

  const fetchQuiz = async () => {
    try {
      const response = await fetch('/quizzes-data.json')
      if (!response.ok) {
        console.error('Failed to load quizzes')
        setLoading(false)
        return
      }

      const quizzesMap = await response.json()
      const foundQuiz = quizzesMap[quizId] as Quiz

      if (!foundQuiz) {
        router.push('/quiz')
        return
      }

      setQuiz(foundQuiz)
      setTimeRemaining(foundQuiz.timeLimit * 60) // Convert minutes to seconds
    } catch (error) {
      console.error('Error fetching quiz:', error)
      router.push('/quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId: string | number, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const submitQuiz = () => {
    setShowResults(true)
    // Save results to localStorage
    const userId = localStorage.getItem('userId') || 'guest'
    const results = {
      quizId: quiz?.id,
      answers,
      score: calculateScore(),
      timestamp: new Date().toISOString()
    }
    const storageKey = `quiz_results_${userId}`
    const existingResults = JSON.parse(localStorage.getItem(storageKey) || '[]')
    existingResults.push(results)
    localStorage.setItem(storageKey, JSON.stringify(existingResults))
  }

  const calculateScore = () => {
    if (!quiz) return 0
    let correct = 0
    quiz.questions.forEach(q => {
      const questionId = q.id
      const correctAnswer = q.correctAnswer ?? q.correct_answer ?? 0
      if (answers[questionId] === correctAnswer) {
        correct++
      }
    })
    return Math.round((correct / quiz.questions.length) * 100)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Quiz yükleniyor...</p>
      </div>
    )
  }

  if (!quiz) {
    return null
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const questionId = currentQuestion.id
  const userAnswer = answers[questionId]
  const correctAnswer = currentQuestion.correctAnswer ?? currentQuestion.correct_answer ?? 0
  const questionText = currentQuestion.text || currentQuestion.question || ''

  if (showResults) {
    const score = calculateScore()
    const correctCount = quiz.questions.filter(q => {
      const qId = q.id
      const correct = q.correctAnswer ?? q.correct_answer ?? 0
      return answers[qId] === correct
    }).length

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/quiz" className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
            ← Quiz'lere Dön
          </Link>
        </div>

        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{score >= quiz.passingScore ? '🎉' : '📚'}</div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {score >= quiz.passingScore ? 'Tebrikler!' : 'Biraz Daha Çalışmalısın'}
            </h1>
            <p className="text-slate-600">{quiz.title}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="card p-6 text-center bg-blue-50">
              <div className="text-3xl font-bold text-blue-600">{score}%</div>
              <div className="text-sm text-slate-600">Puan</div>
            </div>
            <div className="card p-6 text-center bg-green-50">
              <div className="text-3xl font-bold text-green-600">{correctCount}/{quiz.questions.length}</div>
              <div className="text-sm text-slate-600">Doğru</div>
            </div>
            <div className="card p-6 text-center bg-red-50">
              <div className="text-3xl font-bold text-red-600">{quiz.questions.length - correctCount}/{quiz.questions.length}</div>
              <div className="text-sm text-slate-600">Yanlış</div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {quiz.questions.map((q, idx) => {
              const qId = q.id
              const qCorrectAnswer = q.correctAnswer ?? q.correct_answer ?? 0
              const isCorrect = answers[qId] === qCorrectAnswer
              const qText = q.text || q.question || ''

              return (
                <div key={qId} className={`card p-4 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-start gap-3">
                    <span className={`text-2xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? '✓' : '✗'}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 mb-2">Soru {idx + 1}: {qText}</p>
                      <p className="text-sm text-slate-700 mb-1">
                        <span className="font-medium">Senin cevabın:</span> {q.options[answers[qId]] || 'Cevaplanmadı'}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-700 mb-1">
                          <span className="font-medium">Doğru cevap:</span> {q.options[qCorrectAnswer]}
                        </p>
                      )}
                      <p className="text-sm text-slate-600 mt-2 italic">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/quiz" className="btn-secondary">
              Diğer Quiz'ler
            </Link>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/quiz" className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4">
          ← Quiz'lere Dön
        </Link>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>
            <p className="text-slate-600">{quiz.description}</p>
          </div>
          <div className={`text-2xl font-bold ${timeRemaining < 60 ? 'text-red-600' : 'text-blue-600'}`}>
            ⏱️ {formatTime(timeRemaining)}
          </div>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {quiz.passage && (
        <div className="card p-6 mb-6 bg-blue-50">
          <h3 className="font-semibold text-slate-900 mb-4">📖 Okuma Parçası</h3>
          <div className="text-slate-800 leading-relaxed whitespace-pre-line">
            {quiz.passage.text}
          </div>
          <div className="text-sm text-slate-500 mt-4">
            {quiz.passage.wordCount} kelime
          </div>
        </div>
      )}

      <div className="card p-8 mb-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500">
              Soru {currentQuestionIndex + 1} / {quiz.questions.length}
            </span>
            {currentQuestion.type && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {currentQuestion.type}
              </span>
            )}
          </div>
          <h2 className="text-xl font-medium text-slate-900 whitespace-pre-line">
            {questionText}
          </h2>
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(questionId, idx)}
              className={`w-full text-left p-4 border-2 rounded-lg transition-colors ${
                userAnswer === idx
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-600">
                  {String.fromCharCode(65 + idx)})
                </span>
                <span className="text-slate-900">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 justify-between">
        <button
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Önceki
        </button>

        <div className="flex gap-4">
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sonraki →
            </button>
          ) : (
            <button
              onClick={submitQuiz}
              disabled={Object.keys(answers).length !== quiz.questions.length}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Quiz'i Bitir ({Object.keys(answers).length}/{quiz.questions.length})
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
