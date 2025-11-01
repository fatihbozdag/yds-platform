'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { firebase } from '@/lib/firebase-client'
import { Exam, Topic } from '@/types'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ExamWithTopic extends Exam {
  topics?: Topic | null
  attempts?: number
  bestScore?: number
  lastAttempt?: string
}

export default function StudentExamsPage() {
  const [exams, setExams] = useState<ExamWithTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'attempted' | 'not-attempted'>('all')

  useEffect(() => {
    fetchExamsWithAttempts()
  }, [])

  const fetchExamsWithAttempts = async () => {
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) return

      // Load exams from public JSON file
      const response = await fetch('/exams-data.json')
      if (!response.ok) {
        console.error('Failed to load exams data')
        setLoading(false)
        return
      }

      const examsMap = await response.json()
      const demoExams = Object.values(examsMap)

      // Get user's exam results from localStorage
      const resultsKey = `exam_results_${user.id}`
      const storedResults = localStorage.getItem(resultsKey)
      const resultsData = storedResults ? JSON.parse(storedResults) : []

      // Combine exams with attempt data
      const examsWithAttempts = demoExams.map(exam => {
        const examResults = resultsData.filter((result: any) => result.exam_id === exam.id)
        const attempts = examResults.length
        const bestScore = attempts > 0 ? Math.max(...examResults.map((r: any) => r.score)) : undefined
        const lastAttempt = attempts > 0
          ? examResults.sort((a: any, b: any) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0].completed_at
          : undefined

        return {
          ...exam,
          attempts,
          bestScore,
          lastAttempt
        }
      })

      setExams(examsWithAttempts)
    } catch (error) {
      console.error('Error fetching exams:', error)
      alert('Sınavlar yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const getFilteredExams = () => {
    switch (filter) {
      case 'attempted':
        return exams.filter(exam => exam.attempts && exam.attempts > 0)
      case 'not-attempted':
        return exams.filter(exam => !exam.attempts || exam.attempts === 0)
      default:
        return exams
    }
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-slate-500'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score?: number) => {
    if (!score) return null
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-blue-100 text-blue-800'
    if (score >= 40) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const filteredExams = getFilteredExams()
  const attemptedCount = exams.filter(e => e.attempts && e.attempts > 0).length
  const notAttemptedCount = exams.filter(e => !e.attempts || e.attempts === 0).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Sınavlar yükleniyor..." />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-3xl">📝</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">YDS Deneme Sınavları</h1>
          <p className="text-lg text-slate-600">
            Gerçek YDS formatında hazırlanmış deneme sınavları ile kendinizi test edin.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card variant="glass" padding="md" hover className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-3xl font-bold text-blue-600 mb-2">{exams.length}</h3>
          <p className="text-sm text-slate-600">Toplam Sınav</p>
        </Card>

        <Card variant="glass" padding="md" hover className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">✅</span>
          </div>
          <h3 className="text-3xl font-bold text-green-600 mb-2">{attemptedCount}</h3>
          <p className="text-sm text-slate-600">Çözülmüş</p>
        </Card>

        <Card variant="glass" padding="md" hover className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">⏳</span>
          </div>
          <h3 className="text-3xl font-bold text-orange-600 mb-2">{notAttemptedCount}</h3>
          <p className="text-sm text-slate-600">Çözülmemiş</p>
        </Card>

        <Card variant="glass" padding="md" hover className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-3xl font-bold text-purple-600 mb-2">
            {attemptedCount > 0 
              ? Math.round(exams.reduce((acc, exam) => acc + (exam.bestScore || 0), 0) / attemptedCount)
              : 0
            }
          </h3>
          <p className="text-sm text-slate-600">Ortalama Puan</p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 mb-8 shadow-lg border border-white/20">
        <nav className="flex space-x-2">
          {[
            { id: 'all', label: 'Tümü', count: exams.length, icon: '📋' },
            { id: 'not-attempted', label: 'Çözülmemiş', count: notAttemptedCount, icon: '⏳' },
            { id: 'attempted', label: 'Çözülmüş', count: attemptedCount, icon: '✅' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as 'all' | 'attempted' | 'not-attempted')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                filter === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
              <Badge variant="secondary" size="sm">
                {tab.count}
              </Badge>
            </button>
          ))}
        </nav>
      </div>

      {/* Exams Grid */}
      {filteredExams.length === 0 ? (
        <Card variant="glass" padding="lg" className="text-center">
          <div className="text-slate-400 text-8xl mb-6">📝</div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            {filter === 'all' ? 'Henüz sınav eklenmemiş' : 
             filter === 'attempted' ? 'Henüz sınav çözmediniz' : 'Tüm sınavları çözmüşsünüz'}
          </h3>
          <p className="text-lg text-slate-600 mb-6">
            {filter === 'all' ? 'Yakında sınavlar eklenecek.' : 
             filter === 'attempted' ? 'İlk sınavınızı çözmek için bir sınav seçin.' : 'Tebrikler! Tüm mevcut sınavları tamamladınız.'}
          </p>
          {filter !== 'all' && (
            <Button
              variant="primary"
              onClick={() => setFilter('all')}
              icon={<span>📋</span>}
            >
              Tüm Sınavları Görüntüle
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredExams.map((exam) => (
            <Card key={exam.id} variant="glass" padding="lg" hover className="group">
              <CardHeader
                title={exam.title}
                subtitle={exam.description}
                action={
                  <div className="flex items-center gap-2">
                    {exam.attempts && exam.attempts > 0 && (
                      <Badge variant="success" size="sm">
                        En İyi: {exam.bestScore}
                      </Badge>
                    )}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                      <span className="text-2xl">📝</span>
                    </div>
                  </div>
                }
              />
              
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-slate-600 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📝</span>
                    <span className="font-semibold">{exam.total_questions} Soru</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⏱️</span>
                    <span className="font-semibold">{exam.duration_minutes} Dakika</span>
                  </div>
                  {exam.topics && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📚</span>
                      <span className="font-semibold">{exam.topics.title}</span>
                    </div>
                  )}
                </div>

                {exam.attempts && exam.attempts > 0 && (
                  <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 rounded-xl mb-6 border border-slate-200">
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <span>📊</span>
                      Sınav Geçmişi
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Deneme Sayısı:</span>
                        <span className="font-semibold text-slate-900">{exam.attempts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">En İyi Puan:</span>
                        <span className={`font-bold ${getScoreColor(exam.bestScore)}`}>
                          {exam.bestScore}
                        </span>
                      </div>
                      {exam.lastAttempt && (
                        <div className="col-span-2 flex justify-between">
                          <span className="text-slate-600">Son Deneme:</span>
                          <span className="text-slate-700 font-medium">
                            {new Date(exam.lastAttempt).toLocaleString('tr-TR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Link href={`/sinavlar/${exam.id}/baslat`} className="flex-1">
                    <Button variant="primary" fullWidth>
                      <span className="flex items-center gap-2">
                        {exam.attempts && exam.attempts > 0 ? '🔄' : '▶️'}
                        {exam.attempts && exam.attempts > 0 ? 'Tekrar Çöz' : 'Sınava Başla'}
                      </span>
                    </Button>
                  </Link>
                  
                  {exam.attempts && exam.attempts > 0 && (
                    <Link href={`/sinavlar/${exam.id}/sonuclar`}>
                      <Button variant="secondary">
                        <span className="flex items-center gap-2">
                          <span>📊</span>
                          Sonuçlar
                        </span>
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Study Tips */}
      <Card variant="glass" padding="lg" className="mt-8">
        <CardHeader
          title="💡 Sınav İpuçları"
          subtitle="Başarılı olmak için bu ipuçlarını takip edin"
        />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-xs">1</span>
              </div>
              <span>Sınavdan önce konuları gözden geçirin</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-xs">2</span>
              </div>
              <span>Zaman yönetiminizi iyi yapın</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-xs">3</span>
              </div>
              <span>Önce kolay soruları çözün</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-xs">4</span>
              </div>
              <span>Cevaplarınızı kontrol etmeyi unutmayın</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}