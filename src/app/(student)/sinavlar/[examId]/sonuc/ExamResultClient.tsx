'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { firebase } from '@/lib/firebase-client'
import { Exam, Question, ExamResult } from '@/types'

interface DetailedResult extends ExamResult {
  exam: Exam
  questions: (Question & { userAnswer?: string; isCorrect: boolean })[]
}

export default function ExamResultPage() {
  const params = useParams()
  const router = useRouter()
  const [result, setResult] = useState<DetailedResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (params.examId) {
      fetchLatestResult(params.examId as string)
    }
  }, [params.examId])

  const fetchLatestResult = async (examId: string) => {
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get the latest exam result for this user and exam
      const { data: resultData, error: resultError } = await firebase
        .from('exam_results')
        .select('*')
        .eq('student_id', user.id)
        .eq('exam_id', examId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single()

      if (resultError) {
        console.error('Result fetch error:', resultError)
        router.push('/sinavlar')
        return
      }

      // Get exam details
      const { data: examData, error: examError } = await firebase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .single()

      if (examError) throw examError

      // Get questions with user answers
      const { data: questionsData, error: questionsError } = await firebase
        .from('questions')
        .select('*')
        .eq('exam_id', examId)
        .order('order_index', { ascending: true })

      if (questionsError) throw questionsError

      // Combine questions with user answers
      const questionsWithAnswers = questionsData.map(question => {
        const userAnswer = resultData.answers[question.id] || null
        const isCorrect = userAnswer === question.correct_answer
        
        return {
          ...question,
          userAnswer,
          isCorrect
        }
      })

      setResult({
        ...resultData,
        exam: examData,
        questions: questionsWithAnswers
      })

    } catch (error) {
      console.error('Error fetching exam result:', error)
      alert('Sınav sonucu yüklenirken bir hata oluştu')
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

  const getPerformanceMessage = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return { message: 'Mükemmel! Çok başarılı bir performans sergileydiniz.', emoji: '🎉' }
    if (percentage >= 60) return { message: 'İyi iş! Hedeflenen seviyeye ulaştınız.', emoji: '👏' }
    if (percentage >= 40) return { message: 'Fena değil, biraz daha çalışma ile daha iyi olabilir.', emoji: '💪' }
    return { message: 'Daha fazla çalışma gerekiyor. Pes etmeyin!', emoji: '📚' }
  }

  const calculateExamDuration = () => {
    if (!result) return 0
    const startTime = new Date(result.started_at).getTime()
    const endTime = new Date(result.completed_at).getTime()
    return Math.round((endTime - startTime) / 1000 / 60) // minutes
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Sonuçlar yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Sonuç bulunamadı</h1>
        <Link href="/sinavlar" className="btn-primary">Sınavlara Dön</Link>
      </div>
    )
  }

  const maxScore = result.exam.total_questions * 4
  const percentage = (result.score / maxScore) * 100
  const performanceData = getPerformanceMessage(result.score, maxScore)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/sinavlar" className="text-blue-600 hover:text-blue-800 font-medium">
          ← Sınavlara Dön
        </Link>
      </div>

      {/* Header Card */}
      <div className="card overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">{performanceData.emoji}</div>
            <h1 className="text-3xl font-bold mb-2">Sınav Tamamlandı!</h1>
            <p className="text-blue-100">{result.exam.title}</p>
          </div>
        </div>

        <div className="p-8">
          {/* Score Display */}
          <div className="text-center mb-8">
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(result.score, maxScore)}`}>
              {result.score}
            </div>
            <div className="text-slate-600 mb-4">/ {maxScore} puan</div>
            
            <div className={`inline-flex items-center px-6 py-2 rounded-full border text-lg font-semibold ${getScoreBadge(result.score, maxScore)}`}>
              %{Math.round(percentage)}
            </div>
            
            <p className="text-slate-700 mt-4 text-lg">{performanceData.message}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{result.correct_count}</div>
              <div className="text-sm text-green-800">Doğru</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{result.wrong_count}</div>
              <div className="text-sm text-red-800">Yanlış</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{result.empty_count}</div>
              <div className="text-sm text-gray-800">Boş</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{calculateExamDuration()}</div>
              <div className="text-sm text-blue-800">Dakika</div>
            </div>
          </div>

          {/* Performance Analysis */}
          <div className="bg-slate-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">📊 Performans Analizi</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Doğru Yüzdesi:</span>
                <span className="font-medium text-green-600">
                  %{Math.round((result.correct_count / result.exam.total_questions) * 100)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tamamlama Süresi:</span>
                <span className="font-medium">{calculateExamDuration()} / {result.exam.duration_minutes} dakika</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Soru Başına Ortalama Süre:</span>
                <span className="font-medium">{Math.round(calculateExamDuration() / result.exam.total_questions * 10) / 10} dakika</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tamamlama Tarihi:</span>
                <span className="font-medium">{new Date(result.completed_at).toLocaleString('tr-TR')}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="btn-secondary"
            >
              {showDetails ? 'Detayları Gizle' : 'Detaylı Sonuçları Göster'}
            </button>
            
            <Link href={`/sinavlar/${result.exam.id}/analiz`} className="btn-primary">
              📊 Detaylı Analiz
            </Link>
            
            <Link href={`/sinavlar/${result.exam.id}/baslat`} className="btn-secondary">
              🔄 Tekrar Çöz
            </Link>
            
            <Link href="/sinavlar" className="btn-secondary">
              Diğer Sınavlar
            </Link>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      {showDetails && (
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-6">📋 Detaylı Sonuçlar</h3>
          
          <div className="space-y-6">
            {result.questions.map((question, index) => (
              <div
                key={question.id}
                className={`p-4 rounded-lg border-2 ${
                  question.isCorrect
                    ? 'border-green-200 bg-green-50'
                    : question.userAnswer
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      question.isCorrect
                        ? 'bg-green-500 text-white'
                        : question.userAnswer
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-500 text-white'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-lg font-medium">
                      {question.isCorrect ? '✅' : question.userAnswer ? '❌' : '⭕'}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      question.isCorrect ? 'text-green-700' : question.userAnswer ? 'text-red-700' : 'text-gray-700'
                    }`}>
                      {question.isCorrect ? '+4 puan' : '0 puan'}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-slate-900 mb-3">{question.question_text}</p>
                </div>

                <div className="grid grid-cols-1 gap-2 mb-4">
                  {(['A', 'B', 'C', 'D', 'E'] as const).map(option => {
                    const isCorrect = option === question.correct_answer
                    const isUserAnswer = option === question.userAnswer
                    
                    return (
                      <div
                        key={option}
                        className={`p-2 rounded flex items-center gap-2 ${
                          isCorrect && isUserAnswer
                            ? 'bg-green-100 border border-green-300'
                            : isCorrect
                              ? 'bg-green-100 border border-green-300'
                              : isUserAnswer
                                ? 'bg-red-100 border border-red-300'
                                : 'bg-white border border-gray-200'
                        }`}
                      >
                        <span className="font-semibold">{option})</span>
                        <span>{question[`option_${option.toLowerCase()}` as keyof Question]}</span>
                        {isCorrect && <span className="ml-auto text-green-600 font-bold">✓ Doğru</span>}
                        {isUserAnswer && !isCorrect && <span className="ml-auto text-red-600 font-bold">✗ Seçtiğiniz</span>}
                      </div>
                    )
                  })}
                </div>

                {/* Explanation */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="font-medium text-blue-900 mb-1">💡 Açıklama:</div>
                  <div className="text-blue-800 text-sm">{question.explanation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="card p-6 mt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">🎯 Öneriler</h3>
        <div className="space-y-3 text-sm text-slate-700">
          {percentage >= 80 ? (
            <>
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Mükemmel performans! Bu seviyeyi koruyun.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Diğer konulardaki sınavlarda da aynı başarıyı göstermeye çalışın.</span>
              </div>
            </>
          ) : percentage >= 60 ? (
            <>
              <div className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>İyi bir performans sergileydiniz. Yanlış yaptığınız konuları tekrar edin.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Daha fazla pratik yaparak %80+ hedefleyebilirsiniz.</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2">
                <span className="text-yellow-500">⚠</span>
                <span>Konuları tekrar etmenizi öneririz. Detaylı sonuçları inceleyin.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-500">⚠</span>
                <span>Zayıf olduğunuz konular için ek çalışma yapın.</span>
              </div>
            </>
          )}
          <div className="flex items-start gap-2">
            <span className="text-purple-500">💡</span>
            <span>Sorularınız varsa &quot;Eğitmene Sor&quot; bölümünü kullanabilirsiniz.</span>
          </div>
        </div>
      </div>
    </div>
  )
}