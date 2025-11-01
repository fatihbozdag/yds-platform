'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { firebase } from '@/lib/firebase-client'
import { TutorQuestion, Profile } from '@/types'

interface TutorQuestionWithProfile extends TutorQuestion {
  profiles?: Profile
}

export default function QuestionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [question, setQuestion] = useState<TutorQuestionWithProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.questionId) {
      fetchQuestionDetail(params.questionId as string)
    }
  }, [params.questionId])

  const fetchQuestionDetail = async (questionId: string) => {
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await firebase
        .from('tutor_questions')
        .select(`
          *,
          profiles (
            id,
            full_name,
            email
          )
        `)
        .eq('id', questionId)
        .eq('student_id', user.id) // Ensure user can only see their own questions
        .single()

      if (error) {
        console.error('Error fetching question:', error)
        router.push('/egitmene-sor')
        return
      }

      setQuestion(data)
    } catch (error) {
      console.error('Error:', error)
      alert('Soru yüklenirken bir hata oluştu')
      router.push('/egitmene-sor')
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    const statusMap = {
      pending: {
        badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Bekliyor',
        message: 'Sorunuz inceleniyor ve en kısa sürede cevaplanacak.',
        icon: '⏳'
      },
      answered: {
        badge: 'bg-green-100 text-green-800 border-green-200',
        label: 'Cevaplandı',
        message: 'Sorunuz uzman eğitmenimiz tarafından cevaplandı.',
        icon: '✅'
      },
      closed: {
        badge: 'bg-gray-100 text-gray-800 border-gray-200',
        label: 'Kapatıldı',
        message: 'Bu soru kapatılmış durumda.',
        icon: '📁'
      }
    }
    return statusMap[status as keyof typeof statusMap] || statusMap.pending
  }

  const getCategoryLabel = (category: string) => {
    const categories = {
      grammar: 'Gramer',
      vocabulary: 'Kelime Bilgisi',
      reading: 'Okuma Anlama',
      exam_strategy: 'Sınav Stratejisi',
      other: 'Diğer'
    }
    return categories[category as keyof typeof categories] || 'Diğer'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Soru detayları yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="text-6xl mb-4">❓</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Soru bulunamadı</h1>
        <p className="text-slate-600 mb-6">
          Aradığınız soru bulunamadı veya bu soruyu görüntüleme yetkiniz yok.
        </p>
        <Link href="/egitmene-sor" className="btn-primary">
          Sorularınıza Dön
        </Link>
      </div>
    )
  }

  const statusInfo = getStatusInfo(question.status)

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/egitmene-sor" className="text-blue-600 hover:text-blue-800 font-medium">
          ← Tüm Sorularım
        </Link>
      </div>

      {/* Question Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.badge}`}>
                {statusInfo.icon} {statusInfo.label}
              </span>
              <span className="text-sm text-slate-500">
                {new Date(question.created_at).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Soru Detayı</h1>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-600">{statusInfo.icon}</span>
            <span className="font-medium text-blue-800">Durum</span>
          </div>
          <p className="text-blue-700 text-sm">{statusInfo.message}</p>
        </div>
      </div>

      {/* Question Content */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">📝 Sorunuz</h2>
        
        <div className="mb-6">
          <div className="bg-slate-50 rounded-lg p-6">
            <div className="prose max-w-none">
              <p className="text-slate-900 leading-relaxed whitespace-pre-wrap">
                {question.question_text}
              </p>
            </div>
          </div>
        </div>

        {/* Question Image */}
        {question.image_url && (
          <div className="mb-6">
            <h3 className="font-medium text-slate-900 mb-3">📷 Ek Görsel</h3>
            <div className="border rounded-lg p-4 bg-white">
              <img 
                src={question.image_url} 
                alt="Soru görseli" 
                className="max-w-full rounded shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(question.image_url, '_blank')}
              />
              <p className="text-xs text-slate-500 mt-2">
                Resmi büyütmek için tıklayın
              </p>
            </div>
          </div>
        )}

        {/* Question Metadata */}
        <div className="border-t pt-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
            <div>
              <span className="font-medium">Soru ID:</span>
              <span className="ml-2 font-mono">#{question.id.slice(0, 8)}</span>
            </div>
            <div>
              <span className="font-medium">Gönderme Tarihi:</span>
              <span className="ml-2">{new Date(question.created_at).toLocaleString('tr-TR')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Answer Section */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          {question.admin_response ? '💬 Eğitmen Yanıtı' : '⏳ Yanıt Bekleniyor'}
        </h2>

        {question.admin_response ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">E</span>
                </div>
                <div>
                  <div className="font-medium text-green-900">Uzman Eğitmen</div>
                  {question.answered_at && (
                    <div className="text-sm text-green-700">
                      {new Date(question.answered_at).toLocaleString('tr-TR')}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="prose max-w-none">
                <div className="text-green-800 leading-relaxed whitespace-pre-wrap">
                  {question.admin_response}
                </div>
              </div>
            </div>

            {/* Feedback Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">📝 Bu yanıt size yardımcı oldu mu?</h3>
              <p className="text-blue-700 text-sm mb-3">
                Eğitmenimizin yanıtı hakkında geri bildirimde bulunabilirsiniz.
              </p>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm">
                  👍 Çok Yardımcı
                </button>
                <button className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm">
                  👌 Kısmen Yardımcı
                </button>
                <button className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm">
                  👎 Yeterli Değil
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">⏰</div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Yanıt Bekleniyor</h3>
            <p className="text-slate-600 mb-4">
              Uzman eğitmenimiz sorunuzu inceliyor. Genellikle 2-4 saat içinde, 
              en geç 24 saat içinde detaylı yanıt alacaksınız.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-600">⏱️</span>
                <span className="font-medium text-yellow-800">Tahmini Yanıt Süresi</span>
              </div>
              <p className="text-yellow-700 text-sm">
                Soru türüne göre 2-24 saat arasında
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8 justify-center">
        <Link href="/egitmene-sor" className="btn-secondary">
          ← Tüm Sorularım
        </Link>
        <Link href="/egitmene-sor" className="btn-primary">
          ➕ Yeni Soru Sor
        </Link>
      </div>

      {/* Related Questions */}
      {question.admin_response && (
        <div className="card p-6 mt-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">🔗 İlgili Kaynaklar</h3>
          <div className="space-y-3 text-sm">
            <Link href="/konular" className="block p-3 bg-blue-50 rounded hover:bg-blue-100 transition-colors">
              <div className="font-medium text-blue-900">📚 Konu Anlatımları</div>
              <div className="text-blue-700">İlgili konuları detaylı şekilde öğrenin</div>
            </Link>
            <Link href="/sinavlar" className="block p-3 bg-green-50 rounded hover:bg-green-100 transition-colors">
              <div className="font-medium text-green-900">📝 Deneme Sınavları</div>
              <div className="text-green-700">Öğrendiklerinizi test edin</div>
            </Link>
            <Link href="/ilerleme" className="block p-3 bg-purple-50 rounded hover:bg-purple-100 transition-colors">
              <div className="font-medium text-purple-900">📊 İlerleme Takibi</div>
              <div className="text-purple-700">Performansınızı analiz edin</div>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}