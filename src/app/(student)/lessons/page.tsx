'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Lesson {
  id: number
  title: string
  slug: string
  level: string
  estimatedTime: number
  description: string
  objectives: string[]
}

export default function GrammarLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState<string>('all')

  useEffect(() => {
    fetchLessons()
  }, [])

  const fetchLessons = async () => {
    try {
      const response = await fetch('/grammar-lessons.json')
      if (!response.ok) {
        console.error('Failed to load grammar lessons')
        setLoading(false)
        return
      }

      const lessonsMap = await response.json()
      const lessonsArray = Object.values(lessonsMap) as Lesson[]

      // Sort by id
      lessonsArray.sort((a, b) => a.id - b.id)

      setLessons(lessonsArray)
    } catch (error) {
      console.error('Error fetching lessons:', error)
    } finally {
      setLoading(false)
    }
  }

  const levels = [
    { id: 'all', label: 'Tüm Seviyeler', icon: '📚' },
    { id: 'beginner', label: 'Beginner', icon: '🌱' },
    { id: 'intermediate', label: 'Intermediate', icon: '📈' },
    { id: 'advanced', label: 'Advanced', icon: '🎯' }
  ]

  const getFilteredLessons = () => {
    return lessons.filter(lesson => {
      return selectedLevel === 'all' || lesson.level === selectedLevel
    })
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-blue-100 text-blue-800'
      case 'advanced': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'beginner': return '🌱'
      case 'intermediate': return '📈'
      case 'advanced': return '🎯'
      default: return '📚'
    }
  }

  const filteredLessons = getFilteredLessons()
  const beginnerCount = lessons.filter(l => l.level === 'beginner').length
  const intermediateCount = lessons.filter(l => l.level === 'intermediate').length
  const advancedCount = lessons.filter(l => l.level === 'advanced').length

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Dersler yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Grammar Dersleri</h1>
        <p className="text-slate-600">
          YDS/YÖKDİL sınavlarında sık çıkan gramer konularını detaylı örneklerle öğrenin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{lessons.length}</div>
          <div className="text-sm text-slate-600">Toplam Ders</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{beginnerCount}</div>
          <div className="text-sm text-slate-600">Beginner</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{intermediateCount}</div>
          <div className="text-sm text-slate-600">Intermediate</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{advancedCount}</div>
          <div className="text-sm text-slate-600">Advanced</div>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-3">Seviye</label>
        <div className="flex flex-wrap gap-2">
          {levels.map(level => (
            <button
              key={level.id}
              onClick={() => setSelectedLevel(level.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedLevel === level.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {level.icon} {level.label}
            </button>
          ))}
        </div>
      </div>

      {filteredLessons.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Ders bulunamadı</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => (
            <div key={lesson.id} className="card hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{getLevelIcon(lesson.level)}</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(lesson.level)}`}>
                    {lesson.level}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 mb-2">{lesson.title}</h3>
                <p className="text-sm text-slate-600 mb-4">{lesson.description}</p>

                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <span>⏱️ {lesson.estimatedTime} dk</span>
                  <span>🎯 {lesson.objectives.length} Hedef</span>
                </div>

                <Link
                  href={`/lessons/${lesson.slug}`}
                  className="btn-primary w-full text-center block"
                >
                  Derse Başla
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
