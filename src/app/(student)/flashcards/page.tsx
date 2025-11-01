'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface FlashcardSet {
  setId: string
  title: string
  description: string
  category: string
  difficulty: string
  totalCards: number
  estimatedTime: number
  cards: any[]
}

export default function FlashcardsPage() {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchFlashcards()
  }, [])

  const fetchFlashcards = async () => {
    try {
      const response = await fetch('/flashcards.json')
      if (!response.ok) {
        console.error('Failed to load flashcards')
        setLoading(false)
        return
      }

      const flashcardsMap = await response.json()
      const flashcardsArray = Object.values(flashcardsMap) as FlashcardSet[]

      setFlashcardSets(flashcardsArray)
    } catch (error) {
      console.error('Error fetching flashcards:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', label: 'Tümü', icon: '📚' },
    { id: 'vocabulary', label: 'Vocabulary', icon: '📖' },
    { id: 'academic', label: 'Academic', icon: '🎓' },
    { id: 'thematic', label: 'Thematic', icon: '🌐' }
  ]

  const getFilteredSets = () => {
    return flashcardSets.filter(set => {
      if (selectedCategory === 'all') return true
      return set.category === selectedCategory || set.setId.includes(selectedCategory)
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty.includes('beginner') || difficulty.includes('basic')) {
      return 'bg-green-100 text-green-800'
    }
    if (difficulty.includes('intermediate')) {
      return 'bg-blue-100 text-blue-800'
    }
    if (difficulty.includes('advanced')) {
      return 'bg-purple-100 text-purple-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  const getCategoryIcon = (setId: string, category: string) => {
    if (setId.includes('academic') || category === 'academic') return '🎓'
    if (setId.includes('scientific')) return '🔬'
    if (setId.includes('thematic')) return '🌐'
    return '📖'
  }

  const filteredSets = getFilteredSets()
  const totalCards = flashcardSets.reduce((sum, set) => sum + (set.totalCards || set.cards?.length || 0), 0)
  const academicCount = flashcardSets.filter(s => s.setId.includes('academic') || s.category === 'academic').length
  const vocabularyCount = flashcardSets.filter(s => s.category === 'vocabulary').length

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Flashcard'lar yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Vocabulary Flashcards</h1>
        <p className="text-slate-600">
          YDS/YÖKDİL kelime bilginizi geliştirmek için hazırlanmış flashcard setleri.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{flashcardSets.length}</div>
          <div className="text-sm text-slate-600">Toplam Set</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{totalCards}</div>
          <div className="text-sm text-slate-600">Toplam Kelime</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">
            {Math.round(flashcardSets.reduce((sum, set) => sum + (set.estimatedTime || 30), 0) / flashcardSets.length)}
          </div>
          <div className="text-sm text-slate-600">Ort. Süre (dk)</div>
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

      {filteredSets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Flashcard seti bulunamadı</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSets.map((set) => (
            <div key={set.setId} className="card hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{getCategoryIcon(set.setId, set.category)}</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(set.difficulty)}`}>
                    {set.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 mb-2">{set.title}</h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-3">{set.description}</p>

                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <span>📇 {set.totalCards || set.cards?.length || 0} Kart</span>
                  <span>⏱️ {set.estimatedTime || 30} dk</span>
                </div>

                <Link
                  href={`/flashcards/${set.setId}`}
                  className="btn-primary w-full text-center block"
                >
                  Çalışmaya Başla
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
