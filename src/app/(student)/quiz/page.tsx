'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Quiz {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  timeLimit: number
  passingScore: number
  questions: any[]
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/quizzes-data.json')
      if (!response.ok) {
        console.error('Failed to load quizzes')
        setLoading(false)
        return
      }

      const quizzesMap = await response.json()
      const quizzesArray = Object.entries(quizzesMap).map(([id, quiz]: [string, any]) => ({
        id,
        ...quiz,
        questions: quiz.questions || []
      }))

      setQuizzes(quizzesArray)
    } catch (error) {
      console.error('Error fetching quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', label: 'Tümü', icon: '📚' },
    { id: 'grammar', label: 'Grammar', icon: '📝' },
    { id: 'vocabulary', label: 'Vocabulary', icon: '📖' },
    { id: 'reading', label: 'Reading', icon: '📰' }
  ]

  const getFilteredQuizzes = () => {
    return quizzes.filter(quiz => {
      return selectedCategory === 'all' || quiz.category === selectedCategory
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-blue-100 text-blue-800'
      case 'advanced': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'grammar': return '📝'
      case 'vocabulary': return '📖'
      case 'reading': return '📰'
      default: return '📚'
    }
  }

  const filteredQuizzes = getFilteredQuizzes()
  const grammarCount = quizzes.filter(q => q.category === 'grammar').length
  const vocabularyCount = quizzes.filter(q => q.category === 'vocabulary').length
  const readingCount = quizzes.filter(q => q.category === 'reading').length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Quiz'ler yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Mini Quiz'ler</h1>
        <p className="text-slate-600">
          Belirli konularda kendinizi test edin. Her quiz 10-20 dakika sürer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{quizzes.length}</div>
          <div className="text-sm text-slate-600">Toplam Quiz</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{grammarCount}</div>
          <div className="text-sm text-slate-600">Grammar</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{vocabularyCount}</div>
          <div className="text-sm text-slate-600">Vocabulary</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-orange-600">{readingCount}</div>
          <div className="text-sm text-slate-600">Reading</div>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-3">Kategori</label>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {category.icon} {category.label}
            </button>
          ))}
        </div>
      </div>

      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Quiz bulunamadı</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="card hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{getCategoryIcon(quiz.category)}</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 mb-2">{quiz.title}</h3>
                <p className="text-sm text-slate-600 mb-4">{quiz.description}</p>

                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <span>📝 {quiz.questions?.length || 15} Soru</span>
                  <span>⏱️ {quiz.timeLimit || 20} dk</span>
                </div>

                <Link href={`/quiz/${quiz.id}/baslat`} className="btn-primary w-full text-center">
                  Quiz'e Başla
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
