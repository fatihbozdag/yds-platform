'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { firebase } from '@/lib/firebase-client'
import { DemoDataStore } from '@/lib/demo-data'
import Link from 'next/link'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DetailedResult {
  examTitle: string
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  emptyAnswers: number
  score: number
  timeSpent: number
  questionAnalysis: Array<{
    questionId: string
    questionText: string
    userAnswer: string
    correctAnswer: string
    isCorrect: boolean
    explanation: string
    category: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
  }>
  categoryBreakdown: Array<{
    category: string
    correct: number
    total: number
    percentage: number
  }>
  recommendations: string[]
}

export default function ExamAnalysisPage() {
  const params = useParams()
  const examId = params.examId as string
  const [analysis, setAnalysis] = useState<DetailedResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDetailedAnalysis()
  }, [])

  const fetchDetailedAnalysis = async () => {
    const { data: { user } } = await firebase.auth.getUser()
    if (!user) return

    try {
      // Get the most recent exam result for this exam
      const { data: examResult } = await firebase
        .from('exam_results')
        .select('*')
        .eq('student_id', user.id)
        .eq('exam_id', examId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single()

      if (!examResult) return

      // Get exam details
      const { data: exam } = await firebase
        .from('exams')
        .select('title')
        .eq('id', examId)
        .single()

      // Get questions
      const { data: questions } = await firebase
        .from('questions')
        .select('*')
        .eq('exam_id', examId)
        .order('order_index')

      if (!questions || !exam) return

      // Analyze answers
      const questionAnalysis = questions.map(question => {
        const userAnswer = examResult.answers[question.id] || ''
        const isCorrect = userAnswer === question.correct_answer
        
        return {
          questionId: question.id,
          questionText: question.question_text,
          userAnswer,
          correctAnswer: question.correct_answer,
          isCorrect,
          explanation: question.explanation,
          category: getCategoryFromQuestion(question.question_text),
          difficulty: getDifficultyFromQuestion(question.question_text)
        }
      })

      // Category breakdown
      const categoryMap = new Map()
      questionAnalysis.forEach(qa => {
        if (!categoryMap.has(qa.category)) {
          categoryMap.set(qa.category, { correct: 0, total: 0 })
        }
        const cat = categoryMap.get(qa.category)
        cat.total++
        if (qa.isCorrect) cat.correct++
      })

      const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, stats]) => ({
        category,
        correct: stats.correct,
        total: stats.total,
        percentage: Math.round((stats.correct / stats.total) * 100)
      }))

      // Generate recommendations
      const recommendations = generateRecommendations(questionAnalysis, categoryBreakdown)

      setAnalysis({
        examTitle: exam.title,
        totalQuestions: questions.length,
        correctAnswers: examResult.correct_count,
        wrongAnswers: examResult.wrong_count,
        emptyAnswers: examResult.empty_count,
        score: examResult.score,
        timeSpent: 150, // Demo data
        questionAnalysis,
        categoryBreakdown,
        recommendations
      })
    } catch (error) {
      console.error('Error fetching analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryFromQuestion = (questionText: string): string => {
    if (questionText.includes('tense') || questionText.includes('time')) return 'Grammar - Tenses'
    if (questionText.includes('synonym') || questionText.includes('meaning')) return 'Vocabulary'
    if (questionText.includes('passage') || questionText.includes('Read')) return 'Reading Comprehension'
    if (questionText.includes('conditional') || questionText.includes('wish')) return 'Grammar - Conditionals'
    return 'General Grammar'
  }

  const getDifficultyFromQuestion = (questionText: string): 'Easy' | 'Medium' | 'Hard' => {
    if (questionText.includes('comprehensive') || questionText.includes('passage')) return 'Hard'
    if (questionText.includes('conditional') || questionText.includes('perfect')) return 'Medium'
    return 'Easy'
  }

  const generateRecommendations = (questionAnalysis: any[], categoryBreakdown: any[]): string[] => {
    const recommendations = []
    
    // Category-based recommendations
    const weakCategories = categoryBreakdown.filter(cat => cat.percentage < 70)
    weakCategories.forEach(cat => {
      switch (cat.category) {
        case 'Grammar - Tenses':
          recommendations.push('Present ve Past tense konularını tekrar edin. Özellikle Perfect tense yapılarına odaklanın.')
          break
        case 'Vocabulary':
          recommendations.push('Kelime dağarcığınızı geliştirin. Günlük 50 yeni kelime öğrenmeye çalışın.')
          break
        case 'Reading Comprehension':
          recommendations.push('Okuduğunu anlama becerilerinizi geliştirin. Akademik metinler okumaya başlayın.')
          break
        case 'Grammar - Conditionals':
          recommendations.push('If clauses ve wish yapılarını pratik edin.')
          break
      }
    })

    // Score-based recommendations
    if (analysis?.score && analysis.score < 50) {
      recommendations.push('Temel grammar konularına geri dönün. Günlük pratik yapın.')
    } else if (analysis?.score && analysis.score < 70) {
      recommendations.push('İyi bir seviyedesiniz! Zayıf olduğunuz konulara odaklanın.')
    } else if (analysis?.score && analysis.score < 90) {
      recommendations.push('Çok iyi! Detay konularına ve ileri seviye sorulara odaklanın.')
    } else {
      recommendations.push('Mükemmel! Bu seviyeyi korumak için düzenli pratik yapmaya devam edin.')
    }

    return recommendations
  }

  const COLORS = ['#10B981', '#EF4444', '#F59E0B']

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Analiz hazırlanıyor...</p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <p>Analiz bulunamadı.</p>
        <Link href="/sinavlar" className="btn-primary mt-4">
          Sınavlara Dön
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Sınav Analizi</h1>
          <p className="text-slate-600">{analysis.examTitle}</p>
        </div>
        <Link href={`/sinavlar/${examId}/sonuclar`} className="btn-secondary">
          ← Sonuçlara Dön
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-blue-500 mb-2">{analysis.score}%</div>
          <div className="text-sm text-slate-600">Genel Başarı</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-green-500 mb-2">{analysis.correctAnswers}</div>
          <div className="text-sm text-slate-600">Doğru Cevap</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-red-500 mb-2">{analysis.wrongAnswers}</div>
          <div className="text-sm text-slate-600">Yanlış Cevap</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-slate-500 mb-2">{analysis.timeSpent} dk</div>
          <div className="text-sm text-slate-600">Süre</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Score Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Cevap Dağılımı</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Doğru', value: analysis.correctAnswers, color: '#10B981' },
                    { name: 'Yanlış', value: analysis.wrongAnswers, color: '#EF4444' },
                    { name: 'Boş', value: analysis.emptyAnswers, color: '#F59E0B' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[{ color: '#10B981' }, { color: '#EF4444' }, { color: '#F59E0B' }].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Performance */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Konu Bazlı Performans</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysis.categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Başarı Oranı']} />
                <Bar dataKey="percentage" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">📚 Kişiselleştirilmiş Öneriler</h3>
        <div className="space-y-3">
          {analysis.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-500 font-bold">{index + 1}.</span>
              <p className="text-blue-800">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Question Analysis */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-6">Soru Bazlı Detaylı Analiz</h3>
        <div className="space-y-6">
          {analysis.questionAnalysis.map((qa, index) => (
            <div key={qa.questionId} className="border-l-4 border-slate-200 pl-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-600">Soru {index + 1}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    qa.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {qa.isCorrect ? 'Doğru' : 'Yanlış'}
                  </span>
                  <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                    {qa.category}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    qa.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                    qa.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {qa.difficulty}
                  </span>
                </div>
              </div>

              <p className="text-slate-700 mb-3 text-sm leading-relaxed">
                {qa.questionText.length > 150 
                  ? qa.questionText.substring(0, 150) + '...'
                  : qa.questionText
                }
              </p>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Sizin Cevabınız: </span>
                  <span className={qa.isCorrect ? 'text-green-600' : 'text-red-600'}>
                    {qa.userAnswer || 'Boş'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Doğru Cevap: </span>
                  <span className="text-green-600">{qa.correctAnswer}</span>
                </div>
              </div>

              {!qa.isCorrect && (
                <div className="mt-3 p-3 bg-slate-50 rounded">
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">Açıklama: </span>
                    {qa.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <Link href={`/sinavlar/${examId}/coz`} className="btn-primary">
          🔄 Sınavı Tekrar Çöz
        </Link>
        <Link href="/konular" className="btn-secondary">
          📚 Konuları İncele
        </Link>
        <Link href="/egitmene-sor" className="btn-secondary">
          💬 Eğitmene Sor
        </Link>
      </div>
    </div>
  )
}