'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { firebase } from '@/lib/firebase-client'

interface ProgressStats {
  totalExams: number
  completedExams: number
  averageScore: number
  bestScore: number
  totalQuestions: number
  correctAnswers: number
  studyDays: number
  studyStreak: number
  topicsStarted: number
  topicsCompleted: number
  questionsAsked: number
}

interface ExamProgress {
  id: string
  examTitle: string
  attempts: number
  bestScore: number
  averageScore: number
  lastAttempt: string
  trend: 'improving' | 'declining' | 'stable'
}

interface TopicProgress {
  id: string
  title: string
  progressPercentage: number
  lessonsCompleted: number
  totalLessons: number
  lastAccessed: string
}

interface StudySession {
  date: string
  examsSolved: number
  questionsAnswered: number
  averageScore: number
}

export default function StudentProgressPage() {
  const router = useRouter()
  const [stats, setStats] = useState<ProgressStats>({
    totalExams: 0,
    completedExams: 0,
    averageScore: 0,
    bestScore: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    studyDays: 0,
    studyStreak: 0,
    topicsStarted: 0,
    topicsCompleted: 0,
    questionsAsked: 0
  })
  const [examProgress, setExamProgress] = useState<ExamProgress[]>([])
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([])
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'exams' | 'topics' | 'analytics'>('overview')

  useEffect(() => {
    fetchProgressData()
  }, [])

  const fetchProgressData = async () => {
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      await Promise.all([
        fetchStats(user.id),
        fetchExamProgress(user.id),
        fetchTopicProgress(user.id),
        fetchStudySessions(user.id)
      ])
    } catch (error) {
      console.error('Error fetching progress data:', error)
      alert('İlerleme verileri yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async (userId: string) => {
    // Get exam results
    const { data: examResults } = await firebase
      .from('exam_results')
      .select('*')
      .eq('student_id', userId)

    // Get topic progress
    const { data: topicProgressData } = await firebase
      .from('topic_progress')
      .select('*')
      .eq('student_id', userId)

    // Get tutor questions
    const { data: tutorQuestions } = await firebase
      .from('tutor_questions')
      .select('id')
      .eq('student_id', userId)

    // Calculate stats
    const totalExams = examResults?.length || 0
    const scores = examResults?.map(r => r.score) || []
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0
    const totalQuestions = examResults?.reduce((sum, r) => sum + r.correct_count + r.wrong_count + r.empty_count, 0) || 0
    const correctAnswers = examResults?.reduce((sum, r) => sum + r.correct_count, 0) || 0

    // Calculate unique study days
    const studyDates = new Set(examResults?.map(r => new Date(r.completed_at).toDateString()) || [])
    const studyDays = studyDates.size

    // Calculate topics
    const topicsStarted = topicProgressData?.length || 0
    const topicsCompleted = topicProgressData?.filter(tp => tp.completed_lessons >= 8).length || 0 // Assuming 8+ lessons is "completed"

    setStats({
      totalExams,
      completedExams: totalExams,
      averageScore,
      bestScore,
      totalQuestions,
      correctAnswers,
      studyDays,
      studyStreak: calculateStudyStreak(examResults || []),
      topicsStarted,
      topicsCompleted,
      questionsAsked: tutorQuestions?.length || 0
    })
  }

  const fetchExamProgress = async (userId: string) => {
    const { data: examResults } = await firebase
      .from('exam_results')
      .select(`
        *,
        exams (
          id,
          title
        )
      `)
      .eq('student_id', userId)
      .order('completed_at', { ascending: false })

    if (!examResults) return

    // Group by exam
    const examMap = new Map()
    examResults.forEach(result => {
      const examId = result.exam_id
      if (!examMap.has(examId)) {
        examMap.set(examId, [])
      }
      examMap.get(examId).push(result)
    })

    // Calculate progress for each exam
    const progress = Array.from(examMap.entries()).map(([examId, results]) => {
      const sortedResults = results.sort((a: {completed_at: string}, b: {completed_at: string}) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime())
      const scores = sortedResults.map((r: {score: number}) => r.score)
      const averageScore = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
      const bestScore = Math.max(...scores)
      
      // Calculate trend
      let trend: 'improving' | 'declining' | 'stable' = 'stable'
      if (scores.length >= 2) {
        const recent = scores.slice(-3).reduce((a: number, b: number) => a + b, 0) / Math.min(3, scores.length)
        const earlier = scores.slice(0, -2).reduce((a: number, b: number) => a + b, 0) / Math.max(1, scores.length - 2)
        if (recent > earlier + 5) trend = 'improving'
        else if (recent < earlier - 5) trend = 'declining'
      }

      return {
        id: examId,
        examTitle: sortedResults[0].exams?.title || 'Bilinmeyen Sınav',
        attempts: results.length,
        bestScore,
        averageScore,
        lastAttempt: sortedResults[sortedResults.length - 1].completed_at,
        trend
      }
    })

    setExamProgress(progress)
  }

  const fetchTopicProgress = async (userId: string) => {
    const { data: topicProgressData } = await firebase
      .from('topic_progress')
      .select(`
        *,
        topics (
          id,
          title
        )
      `)
      .eq('student_id', userId)

    if (!topicProgressData) return

    const progress = topicProgressData.map(tp => ({
      id: tp.topic_id,
      title: tp.topics?.title || 'Bilinmeyen Konu',
      progressPercentage: Math.min((tp.completed_lessons / 10) * 100, 100), // Assuming 10 lessons per topic
      lessonsCompleted: tp.completed_lessons,
      totalLessons: 10,
      lastAccessed: tp.last_accessed
    }))

    setTopicProgress(progress)
  }

  const fetchStudySessions = async (userId: string) => {
    const { data: examResults } = await firebase
      .from('exam_results')
      .select('*')
      .eq('student_id', userId)
      .order('completed_at', { ascending: false })
      .limit(30) // Last 30 sessions

    if (!examResults) return

    // Group by date
    const sessionMap = new Map()
    examResults.forEach(result => {
      const date = new Date(result.completed_at).toDateString()
      if (!sessionMap.has(date)) {
        sessionMap.set(date, [])
      }
      sessionMap.get(date).push(result)
    })

    // Calculate session stats
    const sessions = Array.from(sessionMap.entries()).map(([date, results]) => {
      const scores = results.map((r: {score: number}) => r.score)
      const questionsAnswered = results.reduce((sum: number, r: {correct_count: number, wrong_count: number, empty_count: number}) => sum + r.correct_count + r.wrong_count + r.empty_count, 0)
      
      return {
        date,
        examsSolved: results.length,
        questionsAnswered,
        averageScore: Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
      }
    }).slice(0, 14) // Last 14 days

    setStudySessions(sessions)
  }

  const calculateStudyStreak = (examResults: {completed_at: string}[]) => {
    if (examResults.length === 0) return 0

    const today = new Date()
    let streak = 0
    const currentDate = new Date(today)

    // Get unique study dates
    const studyDates = new Set(examResults.map(r => new Date(r.completed_at).toDateString()))

    // Check consecutive days backwards from today
    while (studyDates.has(currentDate.toDateString())) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    }

    return streak
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈'
      case 'declining': return '📉'
      default: return '➡️'
    }
  }

  const exportProgressData = () => {
    const exportData = {
      generatedAt: new Date().toISOString(),
      student: 'YDS Öğrencisi',
      overview: {
        totalExams: stats.totalExams,
        averageScore: stats.averageScore,
        bestScore: stats.bestScore,
        totalQuestions: stats.totalQuestions,
        correctAnswers: stats.correctAnswers,
        correctRate: stats.totalQuestions > 0 ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) : 0,
        studyDays: stats.studyDays,
        studyStreak: stats.studyStreak,
        topicsStarted: stats.topicsStarted,
        topicsCompleted: stats.topicsCompleted,
        questionsAsked: stats.questionsAsked
      },
      examProgress,
      topicProgress,
      studySessions: studySessions.slice(0, 10)
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `yds-progress-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const exportProgressPDF = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const htmlContent = `
      <html>
        <head>
          <title>YDS İlerleme Raporu</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
            .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 2em; font-weight: bold; color: #3B82F6; }
            .stat-label { color: #666; margin-top: 5px; }
            .section { margin: 30px 0; }
            .section-title { font-size: 1.5em; font-weight: bold; margin-bottom: 15px; color: #1f2937; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f8fafc; font-weight: bold; }
            .progress-bar { background: #e5e7eb; height: 10px; border-radius: 5px; overflow: hidden; }
            .progress-fill { background: #3B82F6; height: 100%; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>YDS İlerleme Raporu</h1>
            <p>Tarih: ${new Date().toLocaleDateString('tr-TR')}</p>
          </div>
          
          <div class="section">
            <h2 class="section-title">📊 Genel İstatistikler</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${stats.averageScore}</div>
                <div class="stat-label">Ortalama Puan</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.bestScore}</div>
                <div class="stat-label">En Yüksek Puan</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.totalExams}</div>
                <div class="stat-label">Çözülen Sınav</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.studyDays}</div>
                <div class="stat-label">Çalışma Günü</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">📝 Sınav Performansları</h2>
            <table>
              <thead>
                <tr>
                  <th>Sınav</th>
                  <th>Deneme Sayısı</th>
                  <th>En İyi Puan</th>
                  <th>Ortalama</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                ${examProgress.map(exam => `
                  <tr>
                    <td>${exam.examTitle}</td>
                    <td>${exam.attempts}</td>
                    <td>${exam.bestScore}</td>
                    <td>${exam.averageScore}</td>
                    <td>${getTrendIcon(exam.trend)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2 class="section-title">📚 Konu İlerlemeleri</h2>
            <table>
              <thead>
                <tr>
                  <th>Konu</th>
                  <th>İlerleme</th>
                  <th>Tamamlanan Ders</th>
                </tr>
              </thead>
              <tbody>
                ${topicProgress.map(topic => `
                  <tr>
                    <td>${topic.title}</td>
                    <td>
                      <div class="progress-bar">
                        <div class="progress-fill" style="width: ${topic.progressPercentage}%"></div>
                      </div>
                      ${Math.round(topic.progressPercentage)}%
                    </td>
                    <td>${topic.lessonsCompleted}/${topic.totalLessons}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2 class="section-title">📈 Son Çalışma Aktiviteleri</h2>
            <table>
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Çözülen Sınav</th>
                  <th>Cevaplanan Soru</th>
                  <th>Ortalama Puan</th>
                </tr>
              </thead>
              <tbody>
                ${studySessions.slice(0, 10).map(session => `
                  <tr>
                    <td>${new Date(session.date).toLocaleDateString('tr-TR')}</td>
                    <td>${session.examsSolved}</td>
                    <td>${session.questionsAnswered}</td>
                    <td>${session.averageScore}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">İlerlemeniz yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">İlerleme Raporu</h1>
            <p className="text-slate-600">
              Detaylı performans analizi ve öğrenme istatistikleriniz
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportProgressData}
              className="btn-secondary text-sm"
              title="JSON formatında indir"
            >
              📊 JSON İndir
            </button>
            <button
              onClick={exportProgressPDF}
              className="btn-secondary text-sm"
              title="PDF olarak yazdır"
            >
              🖨️ PDF Yazdır
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Genel Bakış' },
            { id: 'exams', label: 'Sınav Performansı' },
            { id: 'topics', label: 'Konu İlerlemeleri' },
            { id: 'analytics', label: 'Detaylı Analiz' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'exams' | 'topics' | 'analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.averageScore}</div>
              <div className="text-sm text-slate-600">Ortalama Puan</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.bestScore}</div>
              <div className="text-sm text-slate-600">En Yüksek Puan</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalExams}</div>
              <div className="text-sm text-slate-600">Çözülen Sınav</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{stats.studyDays}</div>
              <div className="text-sm text-slate-600">Çalışma Günü</div>
            </div>
          </div>

          {/* Progress Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">📊 Genel Performans</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Doğru Yüzdesi</span>
                  <span className="font-semibold text-green-600">
                    {stats.totalQuestions > 0 ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Çalışma Sürekliliği</span>
                  <span className="font-semibold text-blue-600">{stats.studyStreak} gün</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Toplam Soru</span>
                  <span className="font-semibold text-slate-900">{stats.totalQuestions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Eğitmene Sorular</span>
                  <span className="font-semibold text-purple-600">{stats.questionsAsked}</span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">📚 Öğrenme İlerlemesi</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">Başlanan Konular</span>
                    <span className="font-semibold text-slate-900">{stats.topicsStarted}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min((stats.topicsStarted / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">Tamamlanan Konular</span>
                    <span className="font-semibold text-green-600">{stats.topicsCompleted}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.min((stats.topicsCompleted / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/konular" className="card p-4 hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-2xl mb-2">📚</div>
                <div className="font-medium text-slate-900">Konulara Devam Et</div>
                <div className="text-sm text-slate-600">Öğrenmeye kaldığınız yerden devam edin</div>
              </div>
            </Link>
            <Link href="/sinavlar" className="card p-4 hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-2xl mb-2">📝</div>
                <div className="font-medium text-slate-900">Yeni Sınav Çöz</div>
                <div className="text-sm text-slate-600">Bilgilerinizi test edin</div>
              </div>
            </Link>
            <Link href="/egitmene-sor" className="card p-4 hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-2xl mb-2">❓</div>
                <div className="font-medium text-slate-900">Soru Sor</div>
                <div className="text-sm text-slate-600">Eğitmenlerden yardım alın</div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Exams Tab */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          <div className="card">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">📝 Sınav Performansı</h3>
            </div>
            <div className="divide-y divide-slate-200">
              {examProgress.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h4 className="text-lg font-medium text-slate-900 mb-2">Henüz sınav çözmediniz</h4>
                  <p className="text-slate-600 mb-4">İlk sınavınızı çözerek performans analizi başlatın!</p>
                  <Link href="/sinavlar" className="btn-primary">
                    İlk Sınavınızı Çözün
                  </Link>
                </div>
              ) : (
                examProgress.map((exam) => (
                  <div key={exam.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-slate-900">{exam.examTitle}</h4>
                        <p className="text-sm text-slate-600">
                          Son deneme: {new Date(exam.lastAttempt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getTrendIcon(exam.trend)}</span>
                          <div>
                            <div className={`text-xl font-bold ${getPerformanceColor(exam.bestScore)}`}>
                              {exam.bestScore}
                            </div>
                            <div className="text-xs text-slate-500">En iyi</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <div className="font-medium">{exam.attempts}</div>
                        <div className="text-slate-600">Deneme</div>
                      </div>
                      <div>
                        <div className={`font-medium ${getPerformanceColor(exam.averageScore)}`}>
                          {exam.averageScore}
                        </div>
                        <div className="text-slate-600">Ortalama</div>
                      </div>
                      <div>
                        <Link 
                          href={`/sinavlar/${exam.id}/sonuclar`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Detaylar →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Topics Tab */}
      {activeTab === 'topics' && (
        <div className="space-y-6">
          <div className="card">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">📚 Konu İlerlemeleri</h3>
            </div>
            <div className="divide-y divide-slate-200">
              {topicProgress.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">📖</div>
                  <h4 className="text-lg font-medium text-slate-900 mb-2">Henüz konu çalışması yapmadınız</h4>
                  <p className="text-slate-600 mb-4">Konuları öğrenmeye başlayın!</p>
                  <Link href="/konular" className="btn-primary">
                    Konulara Başla
                  </Link>
                </div>
              ) : (
                topicProgress.map((topic) => (
                  <div key={topic.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-slate-900">{topic.title}</h4>
                        <p className="text-sm text-slate-600">
                          Son erişim: {new Date(topic.lastAccessed).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">
                          {Math.round(topic.progressPercentage)}%
                        </div>
                        <div className="text-xs text-slate-500">
                          {topic.lessonsCompleted}/{topic.totalLessons} ders
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                      <div 
                        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${topic.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Study Pattern */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">📈 Son 14 Günlük Çalışma Aktivitesi</h3>
            {studySessions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-slate-600">Henüz yeterli veri bulunmuyor</p>
              </div>
            ) : (
              <div className="space-y-3">
                {studySessions.map((session) => (
                  <div key={session.date} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                    <div>
                      <div className="font-medium text-slate-900">
                        {new Date(session.date).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="text-sm text-slate-600">
                        {session.examsSolved} sınav, {session.questionsAnswered} soru
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${getPerformanceColor(session.averageScore)}`}>
                      {session.averageScore}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">💡 Kişiselleştirilmiş Öneriler</h3>
            <div className="space-y-4">
              {stats.averageScore < 60 && (
                <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <div className="font-medium text-yellow-900">Performansınızı artırın</div>
                    <div className="text-yellow-800 text-sm">
                      Ortalama puanınız %60&apos;ın altında. Konu anlatımlarını tekrar gözden geçirmenizi öneriyoruz.
                    </div>
                  </div>
                </div>
              )}

              {stats.studyStreak === 0 && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-2xl">📅</span>
                  <div>
                    <div className="font-medium text-blue-900">Düzenli çalışma alışkanlığı kazanın</div>
                    <div className="text-blue-800 text-sm">
                      Her gün az da olsa çalışarak sürekliliğinizi artırabilirsiniz.
                    </div>
                  </div>
                </div>
              )}

              {stats.topicsCompleted < stats.topicsStarted / 2 && (
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-2xl">📚</span>
                  <div>
                    <div className="font-medium text-green-900">Konuları tamamlayın</div>
                    <div className="text-green-800 text-sm">
                      Başladığınız konuları sonuna kadar tamamlayarak daha etkili öğrenin.
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <span className="text-2xl">🎯</span>
                <div>
                  <div className="font-medium text-purple-900">Hedef belirleyin</div>
                  <div className="text-purple-800 text-sm">
                    YDS&apos;den almanız gereken minimum puanı belirleyerek çalışma planınızı oluşturun.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}