'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Section {
  heading: string
  content: string
}

interface CommonError {
  error: string
  correction: string
  explanation: string
}

interface Example {
  sentence: string
  explanation: string
}

interface PracticeQuestion {
  id: string
  type: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface LessonContent {
  introduction: string
  sections: Section[]
  keyRules: string[]
  commonErrors: CommonError[]
  examples: Example[]
}

interface Lesson {
  id: number
  title: string
  slug: string
  level: string
  estimatedTime: number
  description: string
  objectives: string[]
  content: LessonContent
  practice: PracticeQuestion[]
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'content' | 'practice'>('content')
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, number>>({})
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    fetchLesson()
  }, [slug])

  const fetchLesson = async () => {
    try {
      const response = await fetch('/grammar-lessons.json')
      if (!response.ok) {
        console.error('Failed to load grammar lessons')
        setLoading(false)
        return
      }

      const lessonsMap = await response.json()
      const lessonsArray = Object.values(lessonsMap) as Lesson[]

      const foundLesson = lessonsArray.find(l => l.slug === slug)

      if (!foundLesson) {
        router.push('/lessons')
        return
      }

      setLesson(foundLesson)
    } catch (error) {
      console.error('Error fetching lesson:', error)
      router.push('/lessons')
    } finally {
      setLoading(false)
    }
  }

  const handlePracticeAnswer = (questionId: string, answerIndex: number) => {
    setPracticeAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const checkAnswers = () => {
    setShowResults(true)
  }

  const resetPractice = () => {
    setPracticeAnswers({})
    setShowResults(false)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-blue-100 text-blue-800'
      case 'advanced': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Ders yükleniyor...</p>
      </div>
    )
  }

  if (!lesson) {
    return null
  }

  const correctAnswersCount = lesson.practice.filter(
    q => practiceAnswers[q.id] === q.correctAnswer
  ).length

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/lessons" className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4">
          ← Derslere Dön
        </Link>

        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{lesson.title}</h1>
            <p className="text-slate-600">{lesson.description}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(lesson.level)}`}>
            {lesson.level}
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm text-slate-600 mb-6">
          <span className="flex items-center gap-1">
            <span>⏱️</span>
            <span>{lesson.estimatedTime} dakika</span>
          </span>
          <span className="flex items-center gap-1">
            <span>🎯</span>
            <span>{lesson.objectives.length} öğrenme hedefi</span>
          </span>
          <span className="flex items-center gap-1">
            <span>📝</span>
            <span>{lesson.practice.length} alıştırma sorusu</span>
          </span>
        </div>

        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-slate-900 mb-3">Öğrenme Hedefleri</h3>
          <ul className="space-y-2">
            {lesson.objectives.map((objective, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">✓</span>
                <span className="text-slate-700">{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'content'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📖 Ders İçeriği
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'practice'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✍️ Alıştırmalar ({lesson.practice.length})
          </button>
        </div>
      </div>

      {activeTab === 'content' ? (
        <div className="space-y-8">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Giriş</h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{lesson.content.introduction}</p>
          </div>

          {lesson.content.sections.map((section, idx) => (
            <div key={idx} className="card p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">{section.heading}</h2>
              <div className="text-slate-700 leading-relaxed whitespace-pre-line">{section.content}</div>
            </div>
          ))}

          <div className="card p-6 bg-blue-50">
            <h2 className="text-xl font-bold text-slate-900 mb-4">🔑 Anahtar Kurallar</h2>
            <ul className="space-y-2">
              {lesson.content.keyRules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">{idx + 1}.</span>
                  <span className="text-slate-800">{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6 bg-red-50">
            <h2 className="text-xl font-bold text-slate-900 mb-4">❌ Sık Yapılan Hatalar</h2>
            <div className="space-y-4">
              {lesson.content.commonErrors.map((error, idx) => (
                <div key={idx} className="border-l-4 border-red-400 pl-4">
                  <div className="text-red-700 font-mono mb-1">{error.error}</div>
                  <div className="text-green-700 font-mono mb-2">✓ {error.correction}</div>
                  <div className="text-slate-700 text-sm">{error.explanation}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 bg-green-50">
            <h2 className="text-xl font-bold text-slate-900 mb-4">💡 Örnek Cümleler</h2>
            <div className="space-y-4">
              {lesson.content.examples.map((example, idx) => (
                <div key={idx} className="border-l-4 border-green-400 pl-4">
                  <div className="text-slate-900 font-medium mb-2 italic">"{example.sentence}"</div>
                  <div className="text-slate-700 text-sm">{example.explanation}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {!showResults && (
            <div className="card p-6 bg-blue-50">
              <p className="text-slate-700">
                Bu bölümde öğrendiklerinizi test edin. Tüm soruları cevapladıktan sonra "Cevapları Kontrol Et" butonuna tıklayın.
              </p>
            </div>
          )}

          {showResults && (
            <div className="card p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Sonuçlar</h3>
                  <p className="text-blue-100">
                    {correctAnswersCount} / {lesson.practice.length} doğru cevap
                  </p>
                </div>
                <div className="text-5xl font-bold">
                  {Math.round((correctAnswersCount / lesson.practice.length) * 100)}%
                </div>
              </div>
              <button
                onClick={resetPractice}
                className="mt-4 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          )}

          {lesson.practice.map((question, idx) => {
            const userAnswer = practiceAnswers[question.id]
            const isCorrect = userAnswer === question.correctAnswer
            const isAnswered = userAnswer !== undefined

            return (
              <div key={question.id} className="card p-6">
                <div className="mb-4">
                  <span className="text-sm font-medium text-slate-500">Soru {idx + 1}</span>
                  <h3 className="text-lg font-medium text-slate-900 mt-2 whitespace-pre-line">
                    {question.question}
                  </h3>
                </div>

                <div className="space-y-2 mb-4">
                  {question.options.map((option, optionIdx) => {
                    const isSelected = userAnswer === optionIdx
                    const isCorrectOption = question.correctAnswer === optionIdx

                    let optionClass = 'border-slate-200 hover:border-blue-300'
                    if (showResults && isSelected) {
                      optionClass = isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                    } else if (showResults && isCorrectOption) {
                      optionClass = 'border-green-500 bg-green-50'
                    } else if (isSelected) {
                      optionClass = 'border-blue-500 bg-blue-50'
                    }

                    return (
                      <button
                        key={optionIdx}
                        onClick={() => !showResults && handlePracticeAnswer(question.id, optionIdx)}
                        disabled={showResults}
                        className={`w-full text-left p-4 border-2 rounded-lg transition-colors ${optionClass} ${
                          showResults ? 'cursor-default' : 'cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-600">
                            {String.fromCharCode(65 + optionIdx)})
                          </span>
                          <span className="text-slate-900">{option}</span>
                          {showResults && isCorrectOption && (
                            <span className="ml-auto text-green-600">✓</span>
                          )}
                          {showResults && isSelected && !isCorrect && (
                            <span className="ml-auto text-red-600">✗</span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {showResults && (
                  <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className={`font-medium mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {isCorrect ? '✓ Doğru!' : '✗ Yanlış'}
                    </div>
                    <div className="text-slate-700 text-sm">{question.explanation}</div>
                  </div>
                )}
              </div>
            )
          })}

          {!showResults && (
            <div className="flex justify-center">
              <button
                onClick={checkAnswers}
                disabled={Object.keys(practiceAnswers).length !== lesson.practice.length}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3"
              >
                Cevapları Kontrol Et ({Object.keys(practiceAnswers).length}/{lesson.practice.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
