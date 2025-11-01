'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { firebase } from '@/lib/firebase-client'
import { Exam, Topic } from '@/types'

interface ExamWithDetails extends Exam {
  topics?: Topic | null
  previousAttempts?: number
  bestScore?: number
  lastAttempt?: string
}

export default function ExamStartPage() {
  const params = useParams()
  const router = useRouter()
  const [exam, setExam] = useState<ExamWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    if (params.examId) {
      fetchExamDetails(params.examId as string)
    }
  }, [params.examId])

  const fetchExamDetails = async (examId: string) => {
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Load exam metadata from public JSON
      const response = await fetch('/exams-data.json')
      if (!response.ok) {
        console.error('Failed to load exams data')
        router.push('/sinavlar')
        return
      }

      const examsMap = await response.json()
      const examData = examsMap[examId]

      if (!examData) {
        console.error('Exam not found')
        router.push('/sinavlar')
        return
      }

      // Get user's previous attempts from localStorage
      const resultsKey = `exam_results_${user.id}`
      const storedResults = localStorage.getItem(resultsKey)
      const attemptsData = storedResults ? JSON.parse(storedResults).filter((r: any) => r.exam_id === examId) : []

      const previousAttempts = attemptsData.length
      const bestScore = previousAttempts > 0 ? Math.max(...attemptsData.map((a: any) => a.score)) : undefined
      const lastAttempt = previousAttempts > 0 ? attemptsData[0].completed_at : undefined

      setExam({
        ...examData,
        previousAttempts,
        bestScore,
        lastAttempt
      })
    } catch (error) {
      console.error('Error fetching exam details:', error)
      alert('Sınav bilgileri yüklenirken bir hata oluştu')
      router.push('/sinavlar')
    } finally {
      setLoading(false)
    }
  }

  const startExam = async () => {
    if (!exam || !agreed) return

    setStarting(true)
    try {
      // Navigate to exam taking page
      router.push(`/sinavlar/${exam.id}/coz`)
    } catch (error) {
      console.error('Error starting exam:', error)
      alert('Sınav başlatılırken bir hata oluştu')
      setStarting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Sınav bilgileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Sınav bulunamadı</h1>
        <Link href="/sinavlar" className="btn-primary">Sınavlara Dön</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/sinavlar" className="text-blue-600 hover:text-blue-800 font-medium">
          ← Sınavlara Dön
        </Link>
      </div>

      <div className="card overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-3xl">📝</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">{exam.title}</h1>
              {exam.topics && (
                <p className="text-blue-100 mt-1">
                  Konu: {exam.topics.title}
                </p>
              )}
            </div>
          </div>
          
          {exam.description && (
            <p className="text-blue-100 text-lg">{exam.description}</p>
          )}
        </div>

        <div className="p-8">
          {/* Exam Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-slate-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">{exam.total_questions}</div>
              <div className="text-slate-600">Toplam Soru</div>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">{exam.duration_minutes}</div>
              <div className="text-slate-600">Süre (Dakika)</div>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {exam.previousAttempts || 0}
              </div>
              <div className="text-slate-600">Önceki Deneme</div>
            </div>
          </div>

          {/* Previous Attempts */}
          {exam.previousAttempts && exam.previousAttempts > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-3">📊 Önceki Performansınız</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Deneme Sayısı:</span>
                  <span className="ml-2 font-medium">{exam.previousAttempts}</span>
                </div>
                {exam.bestScore && (
                  <div>
                    <span className="text-blue-700">En İyi Puan:</span>
                    <span className="ml-2 font-semibold text-green-600">{exam.bestScore}</span>
                  </div>
                )}
                {exam.lastAttempt && (
                  <div className="col-span-2">
                    <span className="text-blue-700">Son Deneme:</span>
                    <span className="ml-2">{new Date(exam.lastAttempt).toLocaleString('tr-TR')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">📋 Sınav Kuralları</h3>
            <div className="space-y-3 text-slate-700">
              <div className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span>Sınav {exam.duration_minutes} dakika sürecektir ve otomatik olarak sonlandırılacaktır.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span>Her soru için 5 seçenek (A, B, C, D, E) bulunmaktadır.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span>Sorular arasında serbestçe gezinebilir ve cevaplarınızı değiştirebilirsiniz.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span>Kalan süreyi ekranın üst kısmında görebilirsiniz.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-500 font-bold">⚠</span>
                <span>Sınav sırasında sayfa yenilemeyin veya tarayıcıyı kapatmayın.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-500 font-bold">⨯</span>
                <span>Yanlış cevap ile boş cevap aynı değerde işlenir (puan kırılmaz).</span>
              </div>
            </div>
          </div>

          {/* Scoring System */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-yellow-900 mb-3">🎯 Puanlama Sistemi</h3>
            <div className="text-sm text-yellow-800 space-y-2">
              <div>• <strong>Doğru Cevap:</strong> +4 puan</div>
              <div>• <strong>Yanlış/Boş Cevap:</strong> 0 puan</div>
              <div>• <strong>Maksimum Puan:</strong> {exam.total_questions * 4} puan</div>
              <div>• <strong>Başarı Kriteri:</strong> Minimum %60 (240+ puan önerilir)</div>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="mb-8">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-slate-700">
                Sınav kurallarını okudum ve anladım. Sınavı dürüst bir şekilde, hiçbir yardım almadan 
                çözeceğimi kabul ediyor ve sınava başlamak istiyorum.
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={startExam}
              disabled={!agreed || starting}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {starting ? 'Başlatılıyor...' : 'Sınava Başla'}
            </button>
            
            <Link href="/sinavlar" className="btn-secondary">
              İptal Et
            </Link>
          </div>

          {!agreed && (
            <p className="text-red-600 text-sm mt-3 text-center">
              Sınava başlamak için kuralları kabul etmeniz gerekir.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}