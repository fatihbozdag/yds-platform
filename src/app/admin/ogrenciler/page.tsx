'use client'

import { useState, useEffect } from 'react'
import { firebase } from '@/lib/firebase-client'
import { Profile } from '@/types'

interface StudentStats {
  student: Profile
  totalExams: number
  averageScore: number
  highestScore: number
  lowestScore: number
  totalTime: number
  lastExamDate: string | null
}

interface ExamStats {
  examId: string
  examTitle: string
  totalAttempts: number
  averageScore: number
  highestScore: number
  lowestScore: number
}

interface TopicProgressRecord {
  id: string
  student_id: string
  topic_id: string
  completed_lessons: number
  last_accessed: string
  topics: {
    id: string
    title: string
  } | null
  profiles: {
    id: string
    full_name: string
  } | null
}

export default function AdminStudentsPage() {
  const [studentStats, setStudentStats] = useState<StudentStats[]>([])
  const [examStats, setExamStats] = useState<ExamStats[]>([])
  const [topicProgress, setTopicProgress] = useState<TopicProgressRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'students' | 'exams' | 'topics'>('students')
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null)
  const [studentDetails, setStudentDetails] = useState<any>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    fetchAllStats()
  }, [])

  const fetchAllStats = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchStudentStats(),
        fetchExamStats(),
        fetchTopicProgress()
      ])
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentStats = async () => {
    try {
      // Get all students
      const { data: students, error: studentsError } = await firebase
        .from('profiles')
        .select('*')
        .eq('role', 'student')

      if (studentsError) throw studentsError

      // Remove duplicate students by ID
      const uniqueStudents = Array.from(
        new Map(students.map(student => [student.id, student])).values()
      )

      // Get exam results for each student
      const studentStatsPromises = uniqueStudents.map(async (student) => {
        const { data: results, error } = await firebase
          .from('exam_results')
          .select('score, completed_at')
          .eq('student_id', student.id)

        if (error) throw error

        const totalExams = results.length
        const scores = results.map(r => r.score)
        const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
        const highestScore = scores.length > 0 ? Math.max(...scores) : 0
        const lowestScore = scores.length > 0 ? Math.min(...scores) : 0
        const lastExamDate = results.length > 0 
          ? results.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0].completed_at
          : null

        return {
          student,
          totalExams,
          averageScore,
          highestScore,
          lowestScore,
          totalTime: 0, // TODO: Calculate based on exam duration
          lastExamDate
        }
      })

      const stats = await Promise.all(studentStatsPromises)
      setStudentStats(stats)
    } catch (error) {
      console.error('Error fetching student stats:', error)
    }
  }

  const fetchExamStats = async () => {
    try {
      const { data: exams, error: examsError } = await firebase
        .from('exams')
        .select('id, title')

      if (examsError) throw examsError

      const examStatsPromises = exams.map(async (exam) => {
        const { data: results, error } = await firebase
          .from('exam_results')
          .select('score')
          .eq('exam_id', exam.id)

        if (error) throw error

        const totalAttempts = results.length
        const scores = results.map(r => r.score)
        const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
        const highestScore = scores.length > 0 ? Math.max(...scores) : 0
        const lowestScore = scores.length > 0 ? Math.min(...scores) : 0

        return {
          examId: exam.id,
          examTitle: exam.title,
          totalAttempts,
          averageScore,
          highestScore,
          lowestScore
        }
      })

      const stats = await Promise.all(examStatsPromises)
      setExamStats(stats.filter(stat => stat.totalAttempts > 0))
    } catch (error) {
      console.error('Error fetching exam stats:', error)
    }
  }

  const fetchTopicProgress = async () => {
    try {
      const { data, error } = await firebase
        .from('topic_progress')
        .select(`
          *,
          topics (
            id,
            title
          ),
          profiles (
            id,
            full_name
          )
        `)

      if (error) throw error
      setTopicProgress(data || [])
    } catch (error) {
      console.error('Error fetching topic progress:', error)
    }
  }

  const viewStudentDetails = async (student: Profile) => {
    setSelectedStudent(student)
    setLoadingDetails(true)

    try {
      // Fetch exam results
      const { data: examResults, error: examError } = await firebase
        .from('exam_results')
        .select('*')
        .eq('student_id', student.id)
        .order('completed_at', { ascending: false })

      if (examError) throw examError

      // Fetch topic progress from localStorage (since we're using JSON files now)
      const progressKey = `topic_progress_${student.id}`
      const storedProgress = localStorage.getItem(progressKey)
      const topicProgressData = storedProgress ? JSON.parse(storedProgress) : {}

      setStudentDetails({
        examResults: examResults || [],
        topicProgress: topicProgressData
      })
    } catch (error) {
      console.error('Error fetching student details:', error)
      setStudentDetails({ examResults: [], topicProgress: {} })
    } finally {
      setLoadingDetails(false)
    }
  }

  const closeStudentDetails = () => {
    setSelectedStudent(null)
    setStudentDetails(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">İstatistikler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Öğrenci İstatistikleri</h1>
        <button
          onClick={fetchAllStats}
          className="btn-secondary"
        >
          🔄 Yenile
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'students', label: 'Öğrenci İstatistikleri' },
            { id: 'exams', label: 'Sınav İstatistikleri' },
            { id: 'topics', label: 'Konu İlerlemesi' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'students' | 'exams' | 'topics')}
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

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="card">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Öğrenci Performans Raporu ({studentStats.length} öğrenci)
            </h2>

            {studentStats.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Henüz öğrenci kaydı yok.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-2 font-medium text-slate-700">Öğrenci</th>
                      <th className="text-center py-3 px-2 font-medium text-slate-700">Sınav Sayısı</th>
                      <th className="text-center py-3 px-2 font-medium text-slate-700">Ortalama</th>
                      <th className="text-center py-3 px-2 font-medium text-slate-700">En Yüksek</th>
                      <th className="text-center py-3 px-2 font-medium text-slate-700">En Düşük</th>
                      <th className="text-center py-3 px-2 font-medium text-slate-700">Son Sınav</th>
                      <th className="text-center py-3 px-2 font-medium text-slate-700">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentStats
                      .sort((a, b) => b.averageScore - a.averageScore)
                      .map((stat) => (
                        <tr key={stat.student.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-2">
                            <div>
                              <div className="font-medium text-slate-900">{stat.student.full_name}</div>
                              <div className="text-sm text-slate-500">{stat.student.email}</div>
                            </div>
                          </td>
                          <td className="text-center py-3 px-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {stat.totalExams}
                            </span>
                          </td>
                          <td className="text-center py-3 px-2">
                            <span className={`font-semibold ${
                              stat.averageScore >= 70 ? 'text-green-600' : 
                              stat.averageScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {stat.averageScore}
                            </span>
                          </td>
                          <td className="text-center py-3 px-2 text-green-600 font-medium">
                            {stat.highestScore}
                          </td>
                          <td className="text-center py-3 px-2 text-red-600 font-medium">
                            {stat.lowestScore > 0 ? stat.lowestScore : '-'}
                          </td>
                          <td className="text-center py-3 px-2 text-sm text-slate-500">
                            {stat.lastExamDate
                              ? new Date(stat.lastExamDate).toLocaleDateString('tr-TR')
                              : 'Hiç sınav olmamış'
                            }
                          </td>
                          <td className="text-center py-3 px-2">
                            <button
                              onClick={() => viewStudentDetails(stat.student)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                              👁️ Detay
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exams Tab */}
      {activeTab === 'exams' && (
        <div className="card">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Sınav Performans Raporu ({examStats.length} sınav)
            </h2>

            {examStats.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Henüz sınav sonucu yok.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-2 font-medium text-slate-700">Sınav</th>
                      <th className="text-center py-3 px-2 font-medium text-slate-700">Deneme Sayısı</th>
                      <th className="text-center py-3 px-2 font-medium text-slate-700">Ortalama Puan</th>
                      <th className="text-center py-3 px-2 font-medium text-slate-700">En Yüksek</th>
                      <th className="text-center py-3 px-2 font-medium text-slate-700">En Düşük</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examStats
                      .sort((a, b) => b.totalAttempts - a.totalAttempts)
                      .map((stat) => (
                        <tr key={stat.examId} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-2">
                            <div className="font-medium text-slate-900">{stat.examTitle}</div>
                          </td>
                          <td className="text-center py-3 px-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {stat.totalAttempts}
                            </span>
                          </td>
                          <td className="text-center py-3 px-2">
                            <span className={`font-semibold ${
                              stat.averageScore >= 70 ? 'text-green-600' : 
                              stat.averageScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {stat.averageScore}
                            </span>
                          </td>
                          <td className="text-center py-3 px-2 text-green-600 font-medium">
                            {stat.highestScore}
                          </td>
                          <td className="text-center py-3 px-2 text-red-600 font-medium">
                            {stat.lowestScore}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Topics Tab */}
      {activeTab === 'topics' && (
        <div className="card">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Konu İlerleme Raporu ({topicProgress.length} kayıt)
            </h2>

            {topicProgress.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Henüz konu ilerlemesi yok.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-2 font-medium text-slate-700">Öğrenci</th>
                      <th className="text-left py-3 px-2 font-medium text-slate-700">Konu</th>
                      <th className="text-center py-3 px-2 font-medium text-slate-700">Tamamlanan Dersler</th>
                      <th className="text-center py-3 px-2 font-medium text-slate-700">Son Erişim</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topicProgress
                      .sort((a, b) => new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime())
                      .map((progress) => (
                        <tr key={`${progress.student_id}-${progress.topic_id}`} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-2">
                            <div className="font-medium text-slate-900">
                              {progress.profiles?.full_name || 'Bilinmeyen Öğrenci'}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="font-medium text-slate-900">
                              {progress.topics?.title || 'Bilinmeyen Konu'}
                            </div>
                          </td>
                          <td className="text-center py-3 px-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {progress.completed_lessons}
                            </span>
                          </td>
                          <td className="text-center py-3 px-2 text-sm text-slate-500">
                            {new Date(progress.last_accessed).toLocaleDateString('tr-TR')}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900">{selectedStudent.full_name}</h2>
                <p className="text-slate-600">{selectedStudent.email}</p>
                <a
                  href={`/dashboard?view_as=${selectedStudent.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  👁️ Öğrenci Olarak Görüntüle
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
              <button
                onClick={closeStudentDetails}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ✕
              </button>
            </div>

            {loadingDetails ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-slate-600">Detaylar yükleniyor...</p>
              </div>
            ) : studentDetails ? (
              <div className="space-y-6">
                {/* Exam Results Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">📊 Sınav Sonuçları ({studentDetails.examResults.length})</h3>
                  {studentDetails.examResults.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">Henüz sınav sonucu yok.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-2 px-3 text-sm font-medium text-slate-700">Sınav ID</th>
                            <th className="text-center py-2 px-3 text-sm font-medium text-slate-700">Puan</th>
                            <th className="text-center py-2 px-3 text-sm font-medium text-slate-700">Doğru</th>
                            <th className="text-center py-2 px-3 text-sm font-medium text-slate-700">Yanlış</th>
                            <th className="text-center py-2 px-3 text-sm font-medium text-slate-700">Boş</th>
                            <th className="text-center py-2 px-3 text-sm font-medium text-slate-700">Tarih</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentDetails.examResults.map((result: any, index: number) => (
                            <tr key={result.id || index} className="border-b border-slate-100">
                              <td className="py-2 px-3 text-sm">{result.exam_id}</td>
                              <td className="text-center py-2 px-3">
                                <span className={`font-semibold ${
                                  result.score >= 70 ? 'text-green-600' :
                                  result.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {result.score}
                                </span>
                              </td>
                              <td className="text-center py-2 px-3 text-green-600">{result.correct_answers}</td>
                              <td className="text-center py-2 px-3 text-red-600">{result.wrong_answers}</td>
                              <td className="text-center py-2 px-3 text-slate-500">{result.blank_answers}</td>
                              <td className="text-center py-2 px-3 text-sm text-slate-500">
                                {new Date(result.completed_at).toLocaleDateString('tr-TR', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Topic Progress Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">📚 Konu İlerlemeleri</h3>
                  {Object.keys(studentDetails.topicProgress).length === 0 ? (
                    <p className="text-slate-500 text-center py-8">Henüz konu ilerlemesi yok.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(studentDetails.topicProgress).map(([topicId, progress]: [string, any]) => (
                        <div key={topicId} className="border border-slate-200 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-sm text-slate-900">Konu {topicId}</div>
                            <span className="text-xs text-slate-500">
                              {new Date(progress.last_accessed).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-100 rounded-full h-2">
                              <div
                                className="bg-blue-500 rounded-full h-2 transition-all"
                                style={{ width: `${Math.min((progress.completed_lessons / 10) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-600">
                              {progress.completed_lessons}/10
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}