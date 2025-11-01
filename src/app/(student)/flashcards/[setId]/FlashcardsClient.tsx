'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Flashcard {
  id: string
  front: string
  back: string
  difficulty: string
  tags: string[]
}

interface FlashcardSet {
  setId: string
  title: string
  description: string
  category: string
  difficulty: string
  totalCards: number
  estimatedTime: number
  cards: Flashcard[]
  studyTips?: string[]
  commonMistakes?: string[]
}

interface CardProgress {
  timesStudied: number
  lastStudied: string
  confidence: 'low' | 'medium' | 'high'
}

export default function FlashcardStudyPage() {
  const params = useParams()
  const router = useRouter()
  const setId = params.setId as string

  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [mode, setMode] = useState<'study' | 'review'>('study')
  const [progress, setProgress] = useState<Record<string, CardProgress>>({})
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    fetchFlashcardSet()
    loadProgress()
  }, [setId])

  const fetchFlashcardSet = async () => {
    try {
      const response = await fetch('/flashcards.json')
      if (!response.ok) {
        console.error('Failed to load flashcards')
        setLoading(false)
        return
      }

      const flashcardsMap = await response.json()
      const foundSet = flashcardsMap[setId] as FlashcardSet

      if (!foundSet) {
        router.push('/flashcards')
        return
      }

      setFlashcardSet(foundSet)
    } catch (error) {
      console.error('Error fetching flashcard set:', error)
      router.push('/flashcards')
    } finally {
      setLoading(false)
    }
  }

  const loadProgress = () => {
    const userId = localStorage.getItem('userId') || 'guest'
    const storageKey = `flashcard_progress_${userId}_${setId}`
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      setProgress(JSON.parse(stored))
    }
  }

  const saveProgress = (newProgress: Record<string, CardProgress>) => {
    const userId = localStorage.getItem('userId') || 'guest'
    const storageKey = `flashcard_progress_${userId}_${setId}`
    localStorage.setItem(storageKey, JSON.stringify(newProgress))
    setProgress(newProgress)
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleConfidence = (confidence: 'low' | 'medium' | 'high') => {
    if (!flashcardSet) return

    const currentCard = flashcardSet.cards[currentIndex]
    const newProgress = {
      ...progress,
      [currentCard.id]: {
        timesStudied: (progress[currentCard.id]?.timesStudied || 0) + 1,
        lastStudied: new Date().toISOString(),
        confidence
      }
    }

    saveProgress(newProgress)

    // Move to next card
    if (currentIndex < flashcardSet.cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    } else {
      setShowResults(true)
    }
  }

  const handleNext = () => {
    if (!flashcardSet) return
    if (currentIndex < flashcardSet.cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const resetStudy = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setShowResults(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty.includes('basic') || difficulty === 'beginner') {
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Flashcard seti yükleniyor...</p>
      </div>
    )
  }

  if (!flashcardSet) {
    return null
  }

  const currentCard = flashcardSet.cards[currentIndex]
  const studiedCount = Object.keys(progress).length
  const confidenceStats = {
    high: Object.values(progress).filter(p => p.confidence === 'high').length,
    medium: Object.values(progress).filter(p => p.confidence === 'medium').length,
    low: Object.values(progress).filter(p => p.confidence === 'low').length
  }

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/flashcards" className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
            ← Flashcard'lara Dön
          </Link>
        </div>

        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Tebrikler!</h1>
            <p className="text-slate-600">
              {flashcardSet.title} setini tamamladınız
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="card p-6 text-center bg-green-50">
              <div className="text-3xl font-bold text-green-600">{confidenceStats.high}</div>
              <div className="text-sm text-slate-600">Yüksek Güven</div>
            </div>
            <div className="card p-6 text-center bg-blue-50">
              <div className="text-3xl font-bold text-blue-600">{confidenceStats.medium}</div>
              <div className="text-sm text-slate-600">Orta Güven</div>
            </div>
            <div className="card p-6 text-center bg-red-50">
              <div className="text-3xl font-bold text-red-600">{confidenceStats.low}</div>
              <div className="text-sm text-slate-600">Düşük Güven</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button onClick={resetStudy} className="btn-primary">
              Tekrar Çalış
            </button>
            <Link href="/flashcards" className="btn-secondary">
              Diğer Setler
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/flashcards" className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4">
          ← Flashcard'lara Dön
        </Link>

        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">{flashcardSet.title}</h1>
            <p className="text-slate-600">{flashcardSet.description}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(flashcardSet.difficulty)}`}>
            {flashcardSet.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm text-slate-600 mb-4">
          <span>📇 {flashcardSet.totalCards} kart</span>
          <span>📊 İlerleme: {currentIndex + 1}/{flashcardSet.cards.length}</span>
          <span>✅ Çalışılan: {studiedCount}</span>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / flashcardSet.cards.length) * 100}%` }}
          />
        </div>
      </div>

      {flashcardSet.studyTips && flashcardSet.studyTips.length > 0 && currentIndex === 0 && (
        <div className="card p-6 bg-blue-50 mb-6">
          <h3 className="font-semibold text-slate-900 mb-3">💡 Çalışma İpuçları</h3>
          <ul className="space-y-2">
            {flashcardSet.studyTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span className="text-slate-700 text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="relative mb-8">
        <div
          onClick={handleFlip}
          className="card p-12 min-h-[400px] flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition-all duration-300"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {!isFlipped ? (
            <div className="text-center">
              <div className="text-sm text-slate-500 mb-4">
                {currentCard.tags && currentCard.tags.length > 0 && (
                  <div className="flex gap-2 justify-center mb-4">
                    {currentCard.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <span className="px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentCard.difficulty)}">
                  {currentCard.difficulty}
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-6">
                {currentCard.front}
              </div>
              <div className="text-slate-500 text-sm">
                Tıklayın veya kartı çevirmek için boşluk tuşuna basın
              </div>
            </div>
          ) : (
            <div
              className="text-center w-full"
              style={{ transform: 'rotateY(180deg)' }}
            >
              <div className="text-lg text-slate-800 leading-relaxed whitespace-pre-line">
                {currentCard.back}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Önceki
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === flashcardSet.cards.length - 1}
          className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Sonraki →
        </button>
      </div>

      {isFlipped && (
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-4 text-center">
            Bu kelimeyi ne kadar iyi biliyorsunuz?
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => handleConfidence('low')}
              className="px-6 py-4 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors font-medium"
            >
              😕 Tekrar Göster
            </button>
            <button
              onClick={() => handleConfidence('medium')}
              className="px-6 py-4 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors font-medium"
            >
              🤔 Orta
            </button>
            <button
              onClick={() => handleConfidence('high')}
              className="px-6 py-4 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors font-medium"
            >
              😊 Biliyorum
            </button>
          </div>
        </div>
      )}

      {flashcardSet.commonMistakes && flashcardSet.commonMistakes.length > 0 && (
        <div className="card p-6 bg-yellow-50 mt-6">
          <h3 className="font-semibold text-slate-900 mb-3">⚠️ Sık Yapılan Hatalar</h3>
          <ul className="space-y-2">
            {flashcardSet.commonMistakes.map((mistake, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span className="text-slate-700 text-sm">{mistake}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
