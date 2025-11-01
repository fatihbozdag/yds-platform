'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { firebase } from '@/lib/firebase-client'
import { Exam, ExamResult } from '@/types'

interface ExamHistoryItem extends ExamResult {
  exam: Exam
}

export default function ExamHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const [history, setHistory] = useState<ExamHistoryItem[]>([])
  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.examId) {
      fetchExamHistory(params.examId as string)
    }
  }, [params.examId])

  const fetchExamHistory = async (examId: string) => {
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get exam details
      const { data: examData, error: examError } = await firebase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .single()

      if (examError) {
        console.error('Exam fetch error:', examError)
        router.push('/sinavlar')
        return
      }

      setExam(examData)

      // Get all exam results for this user and exam
      const { data: resultsData, error: resultsError } = await firebase
        .from('exam_results')
        .select('*')
        .eq('student_id', user.id)
        .eq('exam_id', examId)
        .order('completed_at', { ascending: false })

      if (resultsError) throw resultsError

      const historyWithExam = resultsData.map(result => ({
        ...result,
        exam: examData
      }))

      setHistory(historyWithExam)

    } catch (error) {
      console.error('Error fetching exam history:', error)
      alert('Sınav geçmişi yüklenirken bir hata oluştu')
      router.push('/sinavlar')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-blue-600'
    if (percentage >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-200'
    if (percentage >= 60) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (percentage >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()
    return Math.round((end - start) / 1000 / 60) // minutes
  }

  const getStats = () => {
    if (history.length === 0) return null

    const scores = history.map(h => h.score)
    const maxScore = exam ? exam.total_questions * 4 : 0
    
    return {
      attempts: history.length,
      bestScore: Math.max(...scores),
      worstScore: Math.min(...scores),
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      maxScore,
      improvement: history.length > 1 ? history[0].score - history[history.length - 1].score : 0
    }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Sınav geçmişi yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!exam || history.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/sinavlar" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Sınavlara Dön
          </Link>
        </div>
        
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            {exam ? `${exam.title} - Sınav Geçmişi` : 'Sınav Geçmişi'}
          </h1>
          <p className="text-slate-600 mb-6">
            Bu sınavı henüz çözmediniz.
          </p>
          {exam && (
            <Link href={`/sinavlar/${exam.id}/baslat`} className="btn-primary">
              İlk Denemenizi Yapın
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/sinavlar" className="text-blue-600 hover:text-blue-800 font-medium">
          ← Sınavlara Dön
        </Link>
      </div>

      {/* Header */}
      <div className="card p-8 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{exam.title}</h1>
            <p className="text-slate-600">Sınav Geçmişi ve Performans Analizi</p>
          </div>
          <Link href={`/sinavlar/${exam.id}/baslat`} className="btn-primary">
            Tekrar Çöz
          </Link>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.attempts}</div>
              <div className="text-sm text-blue-800">Toplam Deneme</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className={`text-2xl font-bold ${getScoreColor(stats.bestScore, stats.maxScore)}`}>
                {stats.bestScore}
              </div>
              <div className="text-sm text-green-800">En İyi Puan</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className={`text-2xl font-bold ${getScoreColor(stats.averageScore, stats.maxScore)}`}>
                {stats.averageScore}
              </div>
              <div className="text-sm text-purple-800">Ortalama</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className={`text-2xl font-bold ${getScoreColor(stats.worstScore, stats.maxScore)}`}>
                {stats.worstScore}
              </div>
              <div className="text-sm text-slate-800">En Düşük</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className={`text-2xl font-bold ${stats.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.improvement >= 0 ? '+' : ''}{stats.improvement}
              </div>
              <div className="text-sm text-yellow-800">Gelişim</div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Chart */}
      <div className="card p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">📈 Performans Grafiği</h3>
        <div className="relative">
          <div className="flex items-end justify-between h-48 border-b border-l border-slate-200 p-4">
            {history.slice().reverse().map((result, index) => {
              const height = (result.score / (stats?.maxScore || 1)) * 160
              return (
                <div key={result.id} className="flex flex-col items-center">
                  <div
                    className="w-8 bg-blue-500 rounded-t"
                    style={{ height: `${height}px` }}
                    title={`Deneme ${index + 1}: ${result.score} puan`}
                  />
                  <div className="text-xs text-slate-600 mt-2 rotate-45 origin-bottom-left">
                    {index + 1}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex justify-between">
            <span>Deneme Sırası</span>
            <span>Puan: 0 - {stats?.maxScore}</span>
          </div>
        </div>
      </div>

      {/* Detailed History */}
      <div className="card">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">📋 Detaylı Geçmiş</h3>
        </div>
        
        <div className="divide-y divide-slate-200">
          {history.map((result, index) => (
            <div key={result.id} className="p-6 hover:bg-slate-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-blue-600">#{history.length - index}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      Deneme {history.length - index}
                    </div>
                    <div className="text-sm text-slate-600">
                      {new Date(result.completed_at).toLocaleString('tr-TR')}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(result.score, stats?.maxScore || 1)}`}>
                    {result.score}
                  </div>
                  <div className={`inline-flex items-center px-2 py-1 rounded border text-sm ${getScoreBadge(result.score, stats?.maxScore || 1)}`}>
                    %{Math.round((result.score / (stats?.maxScore || 1)) * 100)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-lg font-bold text-green-600">{result.correct_count}</div>
                  <div className="text-xs text-green-800">Doğru</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded">
                  <div className="text-lg font-bold text-red-600">{result.wrong_count}</div>
                  <div className="text-xs text-red-800">Yanlış</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-600">{result.empty_count}</div>
                  <div className="text-xs text-gray-800">Boş</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-lg font-bold text-blue-600">
                    {calculateDuration(result.started_at, result.completed_at)}
                  </div>
                  <div className="text-xs text-blue-800">Dakika</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link 
                  href={`/sinavlar/${exam.id}/sonuc`} 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Detaylı Sonuçları Görüntüle →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="card p-6 mt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">💡 Analiz ve Öneriler</h3>
        <div className="space-y-3 text-sm text-slate-700">
          {stats && stats.improvement > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-green-500">📈</span>
              <span>
                Harika! Son denemenizde ilk denemenize göre {stats.improvement} puan gelişim gösterdiniz.
              </span>
            </div>
          )}
          
          {stats && stats.improvement < 0 && (
            <div className="flex items-start gap-2">
              <span className="text-yellow-500">📉</span>
              <span>
                Son denemenizde performansınız düştü. Konuları tekrar gözden geçirmenizi öneririz.
              </span>
            </div>
          )}

          {stats && stats.bestScore < stats.maxScore * 0.6 && (
            <div className="flex items-start gap-2">
              <span className="text-blue-500">📚</span>
              <span>
                Hedeflenen %60 seviyesine ulaşmak için daha fazla çalışma yapmanız önerilir.
              </span>
            </div>
          )}

          <div className="flex items-start gap-2">
            <span className="text-purple-500">🎯</span>
            <span>
              Düzenli olarak sınav çözmeye devam edin. Pratik yapmak başarının anahtarıdır.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}