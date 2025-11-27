'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { firebase } from '@/lib/firebase-client'
import { DemoDataStore } from '@/lib/demo-data'
import Link from 'next/link'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Custom SVG Icons for Scholarly Elegance
const Icons = {
  back: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" />
    </svg>
  ),
  pieChart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M21.21 15.89A10 10 0 118 2.83M22 12A10 10 0 0012 2v10z" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" strokeLinecap="round" />
    </svg>
  ),
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  lightbulb: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M9 18h6M10 22h4M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z" />
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M23 4v6h-6M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  ),
  messageCircle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  ),
  scroll: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
  award: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  ),
}

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

// Custom chart colors matching Scholarly Elegance theme
const CHART_COLORS = {
  correct: '#4A6741', // luxury-sage
  wrong: '#7D2E2E', // luxury-burgundy
  empty: '#B8860B', // luxury-gold
  bar: '#1A2744', // luxury-navy
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

  // Luxury Loading State
  if (loading) {
    return (
      <div className="min-h-screen paper-texture flex items-center justify-center">
        <div className="text-center luxury-fade-up">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-[var(--luxury-gold)]/30 animate-spin" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-2 rounded-full border-2 border-t-[var(--luxury-gold)] border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.5s' }} />
            <div className="absolute inset-0 flex items-center justify-center text-[var(--luxury-gold)]">
              {Icons.chart}
            </div>
          </div>
          <p className="font-body text-[var(--luxury-charcoal)]/70 text-lg">
            Analiz hazırlanıyor...
          </p>
        </div>
      </div>
    )
  }

  // Not Found State
  if (!analysis) {
    return (
      <div className="min-h-screen paper-texture flex items-center justify-center">
        <div className="text-center luxury-fade-up max-w-md mx-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--luxury-burgundy)]/10 flex items-center justify-center">
            <span className="text-[var(--luxury-burgundy)]">{Icons.x}</span>
          </div>
          <h1 className="font-display text-3xl text-[var(--luxury-navy)] mb-4">
            Analiz Bulunamadı
          </h1>
          <p className="font-body text-[var(--luxury-charcoal)]/70 mb-8">
            Bu sınav için henüz bir analiz bulunmuyor.
          </p>
          <Link href="/sinavlar" className="luxury-btn inline-flex items-center gap-2">
            {Icons.back}
            <span>Sınavlara Dön</span>
          </Link>
        </div>
      </div>
    )
  }

  const pieData = [
    { name: 'Doğru', value: analysis.correctAnswers, color: CHART_COLORS.correct },
    { name: 'Yanlış', value: analysis.wrongAnswers, color: CHART_COLORS.wrong },
    { name: 'Boş', value: analysis.emptyAnswers, color: CHART_COLORS.empty }
  ]

  return (
    <div className="min-h-screen paper-texture py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 luxury-fade-up">
          <div>
            <Link
              href={`/sinavlar/${examId}/sonuclar`}
              className="inline-flex items-center gap-2 font-accent text-[var(--luxury-charcoal)]/70 hover:text-[var(--luxury-gold)] transition-colors mb-4"
            >
              {Icons.back}
              <span>Sonuçlara Dön</span>
            </Link>
            <h1 className="font-display text-3xl md:text-4xl text-[var(--luxury-navy)]">Sınav Analizi</h1>
            <p className="font-body text-[var(--luxury-charcoal)]/70 mt-2">{analysis.examTitle}</p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="luxury-card p-6 text-center luxury-fade-up stagger-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--luxury-gold)]/10 mx-auto mb-4">
              <span className="text-[var(--luxury-gold)]">{Icons.award}</span>
            </div>
            <div className="font-display text-4xl text-[var(--luxury-gold)] mb-1">{analysis.score}%</div>
            <div className="font-body text-sm text-[var(--luxury-charcoal)]/70">Genel Başarı</div>
          </div>

          <div className="luxury-card p-6 text-center luxury-fade-up stagger-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--luxury-sage)]/10 mx-auto mb-4">
              <span className="text-[var(--luxury-sage)]">{Icons.check}</span>
            </div>
            <div className="font-display text-4xl text-[var(--luxury-sage)] mb-1">{analysis.correctAnswers}</div>
            <div className="font-body text-sm text-[var(--luxury-charcoal)]/70">Doğru Cevap</div>
          </div>

          <div className="luxury-card p-6 text-center luxury-fade-up stagger-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--luxury-burgundy)]/10 mx-auto mb-4">
              <span className="text-[var(--luxury-burgundy)]">{Icons.x}</span>
            </div>
            <div className="font-display text-4xl text-[var(--luxury-burgundy)] mb-1">{analysis.wrongAnswers}</div>
            <div className="font-body text-sm text-[var(--luxury-charcoal)]/70">Yanlış Cevap</div>
          </div>

          <div className="luxury-card p-6 text-center luxury-fade-up stagger-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--luxury-navy)]/10 mx-auto mb-4">
              <span className="text-[var(--luxury-navy)]">{Icons.clock}</span>
            </div>
            <div className="font-display text-4xl text-[var(--luxury-navy)] mb-1">{analysis.timeSpent}</div>
            <div className="font-body text-sm text-[var(--luxury-charcoal)]/70">Dakika</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Score Distribution Pie Chart */}
          <div className="luxury-card p-8 luxury-fade-up stagger-5">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--luxury-gold)]/10 text-[var(--luxury-gold)]">
                {Icons.pieChart}
              </span>
              <h3 className="font-display text-xl text-[var(--luxury-navy)]">Cevap Dağılımı</h3>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={2}
                    stroke="var(--luxury-cream)"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--luxury-cream)',
                      border: '1px solid var(--luxury-gold)',
                      borderRadius: '8px',
                      fontFamily: 'var(--font-body)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.correct }}></div>
                <span className="font-body text-sm text-[var(--luxury-charcoal)]">Doğru</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.wrong }}></div>
                <span className="font-body text-sm text-[var(--luxury-charcoal)]">Yanlış</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.empty }}></div>
                <span className="font-body text-sm text-[var(--luxury-charcoal)]">Boş</span>
              </div>
            </div>
          </div>

          {/* Category Performance Bar Chart */}
          <div className="luxury-card p-8 luxury-fade-up stagger-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--luxury-navy)]/10 text-[var(--luxury-navy)]">
                {Icons.chart}
              </span>
              <h3 className="font-display text-xl text-[var(--luxury-navy)]">Konu Bazlı Performans</h3>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.categoryBreakdown} margin={{ bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--luxury-charcoal)" opacity={0.1} />
                  <XAxis
                    dataKey="category"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={11}
                    tick={{ fill: 'var(--luxury-charcoal)' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: 'var(--luxury-charcoal)' }}
                    fontSize={12}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Başarı Oranı']}
                    contentStyle={{
                      backgroundColor: 'var(--luxury-cream)',
                      border: '1px solid var(--luxury-gold)',
                      borderRadius: '8px',
                      fontFamily: 'var(--font-body)'
                    }}
                  />
                  <Bar dataKey="percentage" fill={CHART_COLORS.bar} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="luxury-card p-8 mb-8 luxury-fade-up stagger-7">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--luxury-gold)]/10 text-[var(--luxury-gold)]">
              {Icons.lightbulb}
            </span>
            <h3 className="font-display text-xl text-[var(--luxury-navy)]">Kişiselleştirilmiş Öneriler</h3>
          </div>
          <div className="space-y-4">
            {analysis.recommendations.map((rec, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-[var(--luxury-gold)]/10 to-[var(--luxury-sage)]/5 border border-[var(--luxury-gold)]/20 luxury-fade-up"
                style={{ animationDelay: `${(index + 7) * 50}ms` }}
              >
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--luxury-gold)] text-white font-display text-sm">
                  {index + 1}
                </span>
                <p className="font-body text-[var(--luxury-charcoal)] leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Question Analysis */}
        <div className="luxury-card p-8 mb-8 luxury-fade-up stagger-8">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[var(--luxury-gold)]/10">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--luxury-navy)]/10 text-[var(--luxury-navy)]">
              {Icons.scroll}
            </span>
            <h3 className="font-display text-xl text-[var(--luxury-navy)]">Soru Bazlı Detaylı Analiz</h3>
          </div>

          <div className="space-y-6">
            {analysis.questionAnalysis.map((qa, index) => (
              <div
                key={qa.questionId}
                className={`p-6 rounded-xl border-l-4 transition-all duration-300 ${
                  qa.isCorrect
                    ? 'border-l-[var(--luxury-sage)] bg-[var(--luxury-sage)]/5'
                    : qa.userAnswer
                      ? 'border-l-[var(--luxury-burgundy)] bg-[var(--luxury-burgundy)]/5'
                      : 'border-l-[var(--luxury-gold)] bg-[var(--luxury-gold)]/5'
                }`}
              >
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="font-display text-lg text-[var(--luxury-navy)]">Soru {index + 1}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-accent font-medium text-white ${
                    qa.isCorrect ? 'bg-[var(--luxury-sage)]' : 'bg-[var(--luxury-burgundy)]'
                  }`}>
                    {qa.isCorrect ? 'Doğru' : 'Yanlış'}
                  </span>
                  <span className="px-3 py-1 bg-[var(--luxury-navy)]/10 text-[var(--luxury-navy)] rounded-full text-xs font-accent">
                    {qa.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-accent font-medium ${
                    qa.difficulty === 'Easy'
                      ? 'bg-[var(--luxury-sage)]/20 text-[var(--luxury-sage)]'
                      : qa.difficulty === 'Medium'
                        ? 'bg-[var(--luxury-gold)]/20 text-[var(--luxury-gold)]'
                        : 'bg-[var(--luxury-burgundy)]/20 text-[var(--luxury-burgundy)]'
                  }`}>
                    {qa.difficulty === 'Easy' ? 'Kolay' : qa.difficulty === 'Medium' ? 'Orta' : 'Zor'}
                  </span>
                </div>

                <p className="font-body text-[var(--luxury-charcoal)] mb-4 leading-relaxed">
                  {qa.questionText.length > 200
                    ? qa.questionText.substring(0, 200) + '...'
                    : qa.questionText
                  }
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-white/50">
                    <span className="font-body text-[var(--luxury-charcoal)]/70">Cevabınız:</span>
                    <span className={`font-accent font-semibold ${
                      qa.isCorrect ? 'text-[var(--luxury-sage)]' : 'text-[var(--luxury-burgundy)]'
                    }`}>
                      {qa.userAnswer || 'Boş'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-white/50">
                    <span className="font-body text-[var(--luxury-charcoal)]/70">Doğru Cevap:</span>
                    <span className="font-accent font-semibold text-[var(--luxury-sage)]">{qa.correctAnswer}</span>
                  </div>
                </div>

                {!qa.isCorrect && qa.explanation && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--luxury-gold)]/10 to-[var(--luxury-sage)]/5 border border-[var(--luxury-gold)]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[var(--luxury-gold)]">{Icons.lightbulb}</span>
                      <span className="font-accent font-medium text-[var(--luxury-navy)]">Açıklama</span>
                    </div>
                    <p className="font-body text-sm text-[var(--luxury-charcoal)]/80 pl-7">
                      {qa.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 luxury-fade-up stagger-9">
          <Link
            href={`/sinavlar/${examId}/coz`}
            className="luxury-btn inline-flex items-center gap-2"
          >
            {Icons.refresh}
            <span>Sınavı Tekrar Çöz</span>
          </Link>
          <Link
            href="/konular"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-accent font-medium border border-[var(--luxury-charcoal)]/20 text-[var(--luxury-charcoal)] hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)] transition-all duration-300"
          >
            {Icons.book}
            <span>Konuları İncele</span>
          </Link>
          <Link
            href="/egitmene-sor"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-accent font-medium border border-[var(--luxury-charcoal)]/20 text-[var(--luxury-charcoal)] hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)] transition-all duration-300"
          >
            {Icons.messageCircle}
            <span>Eğitmene Sor</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
