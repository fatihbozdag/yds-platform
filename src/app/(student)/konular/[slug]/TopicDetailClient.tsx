'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { firebase } from '@/lib/firebase-client'
import { Topic } from '@/types'

interface TopicProgress {
  completed_lessons: number
  last_accessed: string
}

export default function TopicDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [topic, setTopic] = useState<Topic | null>(null)
  const [progress, setProgress] = useState<TopicProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentLesson, setCurrentLesson] = useState(1)
  const [totalLessons] = useState(10) // Demo: assuming 10 lessons per topic
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)

  useEffect(() => {
    if (params.slug) {
      fetchTopicAndProgress(params.slug as string)
    }
  }, [params.slug])

  const fetchTopicAndProgress = async (slug: string) => {
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Load curriculum content from public file
      const response = await fetch('/curriculum-content.json')
      if (!response.ok) {
        console.error('Failed to load curriculum')
        router.push('/konular')
        return
      }

      const contentMap = await response.json()

      // Convert slug back to ID (e.g., "1-1-1" → "1.1.1")
      const topicId = slug.replace(/-/g, '.')
      const topicContent = contentMap[topicId]

      if (!topicContent) {
        console.error('Topic not found:', topicId)
        router.push('/konular')
        return
      }

      // Create topic object
      const topicData = {
        id: topicId,
        title: topicContent.name,
        slug: slug,
        content: topicContent.content || 'İçerik hazırlanıyor...',
        order_index: parseFloat(topicId),
        examples: topicContent.examples || [],
        exercises: topicContent.exercises || []
      }

      setTopic(topicData)

      // Get user's progress from localStorage
      const progressKey = `topic_progress_${user.id}`
      const storedProgress = localStorage.getItem(progressKey)
      const progressData = storedProgress ? JSON.parse(storedProgress) : {}

      if (progressData[topicId]) {
        const userProgress = {
          completed_lessons: progressData[topicId].completed_lessons || 0,
          last_accessed: progressData[topicId].last_accessed || new Date().toISOString()
        }
        setProgress(userProgress)
        setCurrentLesson(Math.min(userProgress.completed_lessons + 1, totalLessons))
      }

      // Update last accessed time in localStorage
      const updatedProgress = {
        ...progressData,
        [topicId]: {
          completed_lessons: progressData[topicId]?.completed_lessons || 0,
          last_accessed: new Date().toISOString()
        }
      }
      localStorage.setItem(progressKey, JSON.stringify(updatedProgress))

      // Check if topic is bookmarked (from localStorage)
      const bookmarksKey = `bookmarked_topics_${user.id}`
      const storedBookmarks = localStorage.getItem(bookmarksKey)
      const bookmarks = storedBookmarks ? JSON.parse(storedBookmarks) : []
      setIsBookmarked(bookmarks.includes(topicId))

    } catch (error) {
      console.error('Error fetching topic:', error)
      alert('Konu yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async (studentId: string, topicId: string, completedLessons: number) => {
    try {
      const progressKey = `topic_progress_${studentId}`
      const storedProgress = localStorage.getItem(progressKey)
      const progressData = storedProgress ? JSON.parse(storedProgress) : {}

      progressData[topicId] = {
        completed_lessons: completedLessons,
        last_accessed: new Date().toISOString()
      }

      localStorage.setItem(progressKey, JSON.stringify(progressData))
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const completeLesson = async () => {
    if (!topic) return

    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) return

      const newCompletedLessons = Math.max(currentLesson, progress?.completed_lessons || 0)
      
      await updateProgress(user.id, topic.id, newCompletedLessons)
      
      setProgress(() => ({
        completed_lessons: newCompletedLessons,
        last_accessed: new Date().toISOString()
      }))

      if (currentLesson < totalLessons) {
        setCurrentLesson(currentLesson + 1)
        alert('Ders tamamlandı! Bir sonraki derse geçebilirsiniz.')
      } else {
        alert('Tebrikler! Konuyu tamamladınız!')
      }
    } catch (error) {
      console.error('Error completing lesson:', error)
      alert('Ders tamamlanırken bir hata oluştu')
    }
  }

  const toggleBookmark = async () => {
    if (!topic || bookmarkLoading) return

    setBookmarkLoading(true)
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) return

      const bookmarksKey = `bookmarked_topics_${user.id}`
      const storedBookmarks = localStorage.getItem(bookmarksKey)
      let bookmarks = storedBookmarks ? JSON.parse(storedBookmarks) : []

      if (isBookmarked) {
        // Remove bookmark
        bookmarks = bookmarks.filter((id: string) => id !== topic.id)
        setIsBookmarked(false)
      } else {
        // Add bookmark
        if (!bookmarks.includes(topic.id)) {
          bookmarks.push(topic.id)
        }
        setIsBookmarked(true)
      }

      localStorage.setItem(bookmarksKey, JSON.stringify(bookmarks))
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      alert('Favori işlemi sırasında bir hata oluştu')
    } finally {
      setBookmarkLoading(false)
    }
  }

  const getLessonContent = (lessonNumber: number) => {
    // Demo content - in real app, this would come from database
    const lessonContents = [
      "Bu derste konunun temellerini öğreneceğiz. YDS sınavında bu konu çok önemli bir yere sahiptir.",
      "Şimdi konunun daha detaylarına geçelim. Pratik örneklerle pekiştirelim.",
      "Bu bölümde yaygın hataları ve bunlardan nasıl kaçınabileceğimizi göreceğiz.",
      "Konunun farklı kullanım alanlarını inceleyelim.",
      "Practice makes perfect! Alıştırmalarla konuyu pekiştirelim.",
      "Bu derste konunun advanced seviyesindeki kullanımlarını göreceğiz.",
      "Real-world örnekleriyle konuyu hayata uygulayalım.",
      "YDS sorularında bu konu nasıl çıkıyor? Sınav stratejileri.",
      "Konunun diğer grammar konularıyla ilişkisini inceleyelim.",
      "Final review - konuyu baştan sona tekrar edelim."
    ]
    
    return lessonContents[lessonNumber - 1] || "Bu dersin içeriği henüz hazır değil."
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Konu yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Konu bulunamadı</h1>
        <Link href="/konular" className="btn-primary">Konulara Dön</Link>
      </div>
    )
  }

  const progressPercentage = ((progress?.completed_lessons || 0) / totalLessons) * 100

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <Link href="/konular" className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block">
          ← Konulara Dön
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{topic.title}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>Konu {topic.order_index}</span>
              <span>•</span>
              <span>{totalLessons} Ders</span>
              <span>•</span>
              <span>{Math.round(progressPercentage)}% Tamamlandı</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleBookmark}
              disabled={bookmarkLoading}
              className={`p-2 rounded-full transition-colors ${
                isBookmarked
                  ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                  : 'text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-slate-600'
              } ${bookmarkLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isBookmarked ? 'Favorilerden kaldır' : 'Favorilere ekle'}
            >
              {bookmarkLoading ? '⏳' : isBookmarked ? '⭐' : '☆'}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-600">İlerlemeniz</span>
            <span className="text-sm font-medium text-blue-600">
              {progress?.completed_lessons || 0} / {totalLessons} ders
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="h-3 bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Lesson Navigation */}
        <div className="lg:col-span-1">
          <div className="card p-4 sticky top-4">
            <h3 className="font-semibold mb-4">Dersler</h3>
            <div className="space-y-2">
              {Array.from({ length: totalLessons }, (_, i) => i + 1).map(lessonNum => {
                const isCompleted = (progress?.completed_lessons || 0) >= lessonNum
                const isCurrent = lessonNum === currentLesson
                const isAccessible = lessonNum <= (progress?.completed_lessons || 0) + 1

                return (
                  <button
                    key={lessonNum}
                    onClick={() => isAccessible && setCurrentLesson(lessonNum)}
                    disabled={!isAccessible}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                      isCurrent 
                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                        : isCompleted
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : isAccessible
                            ? 'bg-gray-50 hover:bg-gray-100'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {isCompleted ? '✅' : isAccessible ? '📖' : '🔒'}
                      </span>
                      <span>Ders {lessonNum}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="card p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Ders {currentLesson}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  (progress?.completed_lessons || 0) >= currentLesson
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {(progress?.completed_lessons || 0) >= currentLesson ? 'Tamamlandı' : 'Devam Ediyor'}
                </span>
              </div>
            </div>

            {/* Lesson Content */}
            <div className="prose max-w-none mb-8">
              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Konu Açıklaması</h3>
                <p className="text-blue-800">{topic.content}</p>
              </div>

              <div className="bg-white p-6 border rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Ders İçeriği</h3>
                <p className="text-slate-700 leading-relaxed">
                  {getLessonContent(currentLesson)}
                </p>

                {/* Demo content sections */}
                <div className="mt-6 space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">💡 Önemli Not</h4>
                    <p className="text-green-700 text-sm">
                      Bu konu YDS sınavında sıkça karşılaşacağınız konulardan biridir. Örnekleri dikkatli inceleyin.
                    </p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">⚠️ Dikkat</h4>
                    <p className="text-yellow-700 text-sm">
                      Bu kuralın istisnalarını da iyi öğrenmeyi unutmayın. Sınavda istisna sorular sıkça çıkar.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {(progress?.completed_lessons || 0) < currentLesson && (
                <button
                  onClick={completeLesson}
                  className="btn-primary"
                >
                  ✅ Dersi Tamamla
                </button>
              )}
              
              {currentLesson < totalLessons && (progress?.completed_lessons || 0) >= currentLesson && (
                <button
                  onClick={() => setCurrentLesson(currentLesson + 1)}
                  className="btn-primary"
                >
                  Sonraki Ders →
                </button>
              )}

              {currentLesson > 1 && (
                <button
                  onClick={() => setCurrentLesson(currentLesson - 1)}
                  className="btn-secondary"
                >
                  ← Önceki Ders
                </button>
              )}

              {progressPercentage >= 70 && (
                <Link
                  href={`/konular/${topic.slug}/test`}
                  className="btn-secondary"
                >
                  📝 Konu Testi
                </Link>
              )}
            </div>

            {/* Next Topic Suggestion */}
            {progressPercentage === 100 && (
              <div className="mt-8 p-6 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">🎉 Tebrikler!</h3>
                <p className="text-green-700 mb-4">
                  Bu konuyu başarıyla tamamladınız. Bir sonraki konuya geçmeye hazırsınız!
                </p>
                <Link href="/konular" className="btn-primary">
                  Sonraki Konuya Geç
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}