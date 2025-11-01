'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { firebase } from '@/lib/firebase-client'
import { Topic } from '@/types'

interface TopicWithProgress extends Topic {
  progress?: {
    completed_lessons: number
    last_accessed: string
  }
}

export default function StudentTopicsPage() {
  const [topics, setTopics] = useState<TopicWithProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopicsWithProgress()
  }, [])

  const fetchTopicsWithProgress = async () => {
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) return

      // Load curriculum content from hierarchical structure
      const response = await fetch('/curriculum-hierarchical.json')
      if (!response.ok) {
        console.error('Failed to load curriculum')
        setTopics([])
        setLoading(false)
        return
      }

      const hierarchicalData = await response.json()

      // Flatten hierarchical structure to get all level-3 topics (actual topics)
      const allTopics: any[] = []
      hierarchicalData.forEach((majorSection: any) => {
        majorSection.children?.forEach((subSection: any) => {
          subSection.children?.forEach((topic: any, index: number) => {
            allTopics.push({
              id: topic.id,
              title: topic.name,
              slug: topic.id.replace(/\./g, '-'),
              content: topic.content || 'İçerik hazırlanıyor...',
              order_index: parseFloat(topic.id),
              examples: topic.examples || [],
              exercises: topic.exercises || []
            })
          })
        })
      })

      // Sort by order_index
      allTopics.sort((a, b) => a.order_index - b.order_index)

      // Get user's progress for each topic from localStorage
      const progressKey = `topic_progress_${user.id}`
      const storedProgress = localStorage.getItem(progressKey)
      const progressData = storedProgress ? JSON.parse(storedProgress) : {}

      // Combine topics with progress
      const topicsWithProgress = allTopics.map(topic => ({
        ...topic,
        progress: progressData[topic.id] ? {
          completed_lessons: progressData[topic.id].completed_lessons || 0,
          last_accessed: progressData[topic.id].last_accessed || new Date().toISOString()
        } : undefined
      }))

      setTopics(topicsWithProgress)
    } catch (error) {
      console.error('Error fetching topics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressPercentage = (topic: TopicWithProgress) => {
    // Simple calculation based on completed lessons (assuming 10 lessons per topic for demo)
    const totalLessons = 10
    const completed = topic.progress?.completed_lessons || 0
    return Math.min((completed / totalLessons) * 100, 100)
  }


  const getProgressTextColor = (percentage: number) => {
    if (percentage === 0) return 'text-gray-600'
    if (percentage < 30) return 'text-red-600'
    if (percentage < 70) return 'text-yellow-600'
    return 'text-green-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Konular yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">📚</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">YDS Konuları</h1>
              <p className="text-lg text-slate-600">
                YDS sınavında başarılı olmak için gereken tüm konuları sırasıyla öğrenebilirsiniz.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg mb-8 border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Genel İlerlemeniz</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200/50">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {topics.filter(t => t.progress?.completed_lessons).length}
              </div>
              <div className="text-sm font-semibold text-slate-700 mb-1">Başladığınız Konular</div>
              <div className="text-xs text-slate-500">Aktif öğrenme</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200/50">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {topics.filter(t => getProgressPercentage(t) === 100).length}
              </div>
              <div className="text-sm font-semibold text-slate-700 mb-1">Tamamlanan Konular</div>
              <div className="text-xs text-slate-500">Başarıyla bitirilen</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200/50">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {Math.round(topics.reduce((acc, topic) => acc + getProgressPercentage(topic), 0) / topics.length) || 0}%
              </div>
              <div className="text-sm font-semibold text-slate-700 mb-1">Toplam İlerleme</div>
              <div className="text-xs text-slate-500">Genel başarı oranı</div>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="space-y-6">
          {topics.length === 0 ? (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
              <div className="text-slate-400 text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Henüz konu eklenmemiş</h3>
              <p className="text-slate-600">Yakında konular eklenecek. Lütfen daha sonra tekrar kontrol edin.</p>
            </div>
          ) : (
            topics.map((topic, index) => {
              const progressPercentage = getProgressPercentage(topic)
              const isAccessible = index === 0 || topics[index - 1] && getProgressPercentage(topics[index - 1]) >= 70

              return (
                <div key={topic.id} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
                            Konu {topic.order_index}
                          </span>
                          {progressPercentage === 100 && (
                            <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                              <span>✅</span>
                              Tamamlandı
                            </span>
                          )}
                          {!isAccessible && (
                            <span className="bg-gradient-to-r from-gray-400 to-gray-500 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                              <span>🔒</span>
                              Kilitli
                            </span>
                          )}
                        </div>
                        
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">{topic.title}</h2>
                        
                        <p className="text-slate-600 mb-6 leading-relaxed line-clamp-3">
                          {topic.content.length > 200 
                            ? topic.content.substring(0, 200) + '...'
                            : topic.content
                          }
                        </p>

                        {/* Enhanced Progress Bar */}
                        <div className="mb-6">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-semibold text-slate-700">İlerleme Durumu</span>
                            <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                              progressPercentage === 0 ? 'bg-gray-100 text-gray-600' :
                              progressPercentage < 30 ? 'bg-red-100 text-red-600' :
                              progressPercentage < 70 ? 'bg-yellow-100 text-yellow-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {Math.round(progressPercentage)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                              className={`h-3 rounded-full transition-all duration-500 ease-out ${
                                progressPercentage === 0 ? 'bg-gray-300' :
                                progressPercentage < 30 ? 'bg-gradient-to-r from-red-400 to-red-500' :
                                progressPercentage < 70 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                                'bg-gradient-to-r from-green-400 to-green-500'
                              }`}
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-slate-500 mt-2">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                          </div>
                        </div>

                        {topic.progress?.last_accessed && (
                          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Son erişim: {new Date(topic.progress.last_accessed).toLocaleDateString('tr-TR')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      {isAccessible ? (
                        <Link
                          href={`/konular/${topic.slug}`}
                          className="btn-primary hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl"
                        >
                          <span className="flex items-center gap-2">
                            {progressPercentage > 0 ? 'Devam Et' : 'Başla'}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </span>
                        </Link>
                      ) : (
                        <button 
                          disabled 
                          className="btn-primary opacity-50 cursor-not-allowed"
                          title="Bu konuya erişmek için önceki konuyu en az %70 tamamlamanız gerekir"
                        >
                          <span className="flex items-center gap-2">
                            <span>🔒</span>
                            Kilitli
                          </span>
                        </button>
                      )}
                      
                      {topic.progress?.completed_lessons && topic.progress.completed_lessons > 0 && (
                        <Link
                          href={`/konular/${topic.slug}/test`}
                          className="btn-secondary hover:scale-105 transition-transform duration-200"
                        >
                          <span className="flex items-center gap-2">
                            <span>📝</span>
                            Konu Testi
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Study Tips */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl shadow-lg mt-8 border border-indigo-200/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">📚</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Çalışma Önerileri</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-white/60 rounded-lg">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <span className="text-sm text-slate-600">Konuları sırasıyla öğrenmek daha etkili olacaktır</span>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white/60 rounded-lg">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <span className="text-sm text-slate-600">Her konu sonunda test çözerek bilgilerinizi pekiştirin</span>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white/60 rounded-lg">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <span className="text-sm text-slate-600">Anlamadığınız konular için "Eğitmene Sor" bölümünü kullanabilirsiniz</span>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white/60 rounded-lg">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">4</span>
              </div>
              <span className="text-sm text-slate-600">Düzenli çalışmak başarının anahtarıdır</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}