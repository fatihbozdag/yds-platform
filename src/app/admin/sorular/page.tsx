'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { firebase } from '@/lib/firebase-client'
import { TutorQuestion, Profile } from '@/types'

const responseSchema = z.object({
  admin_response: z.string().min(10, 'Yanıt en az 10 karakter olmalıdır')
})

type ResponseForm = z.infer<typeof responseSchema>

export default function AdminTutorQuestionsPage() {
  const [questions, setQuestions] = useState<(TutorQuestion & { profiles: Profile })[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuestion, setSelectedQuestion] = useState<(TutorQuestion & { profiles: Profile }) | null>(null)
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'answered' | 'closed'>('all')

  const responseForm = useForm<ResponseForm>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      admin_response: ''
    }
  })

  useEffect(() => {
    fetchQuestions()
  }, [statusFilter])

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      let query = firebase
        .from('tutor_questions')
        .select(`
          *,
          profiles (
            id,
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setQuestions(data || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
      alert('Sorular yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async (data: ResponseForm) => {
    if (!selectedQuestion) return

    setSubmitting(true)
    try {
      const { error } = await firebase
        .from('tutor_questions')
        .update({
          admin_response: data.admin_response,
          status: 'answered',
          answered_at: new Date().toISOString()
        })
        .eq('id', selectedQuestion.id)

      if (error) throw error

      await fetchQuestions()
      setShowResponseForm(false)
      setSelectedQuestion(null)
      responseForm.reset()
      alert('Yanıt başarıyla gönderildi')
    } catch (error: unknown) {
      console.error('Error responding to question:', error)
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
      alert('Yanıt gönderilirken bir hata oluştu: ' + errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const startResponding = (question: (TutorQuestion & { profiles: Profile })) => {
    setSelectedQuestion(question)
    if (question.admin_response) {
      responseForm.setValue('admin_response', question.admin_response)
    } else {
      responseForm.reset({ admin_response: '' })
    }
    setShowResponseForm(true)
  }

  const updateQuestionStatus = async (questionId: string, newStatus: 'pending' | 'answered' | 'closed') => {
    try {
      const { error } = await firebase
        .from('tutor_questions')
        .update({ 
          status: newStatus,
          ...(newStatus === 'closed' ? { answered_at: new Date().toISOString() } : {})
        })
        .eq('id', questionId)

      if (error) throw error

      await fetchQuestions()
      alert('Durum başarıyla güncellendi')
    } catch (error: unknown) {
      console.error('Error updating status:', error)
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
      alert('Durum güncellenirken bir hata oluştu: ' + errorMessage)
    }
  }

  const deleteQuestion = async (question: TutorQuestion & { profiles: Profile }) => {
    if (!confirm(`${question.profiles.full_name} tarafından gönderilen soruyu silmek istediğinizden emin misiniz?`)) {
      return
    }

    try {
      const { error } = await firebase
        .from('tutor_questions')
        .delete()
        .eq('id', question.id)

      if (error) throw error

      await fetchQuestions()
      alert('Soru başarıyla silindi')
    } catch (error: unknown) {
      console.error('Error deleting question:', error)
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
      alert('Soru silinirken bir hata oluştu: ' + errorMessage)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Bekliyor</span>
      case 'answered':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Yanıtlandı</span>
      case 'closed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Kapatıldı</span>
      default:
        return null
    }
  }

  const pendingCount = questions.filter(q => q.status === 'pending').length
  const answeredCount = questions.filter(q => q.status === 'answered').length
  const closedCount = questions.filter(q => q.status === 'closed').length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Sorular yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Eğitmene Sor</h1>
        <button
          onClick={fetchQuestions}
          className="btn-secondary"
        >
          🔄 Yenile
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">📝</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-500">Toplam Soru</p>
              <p className="text-2xl font-semibold text-slate-900">{questions.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-xl">⏳</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-500">Bekleyen</p>
              <p className="text-2xl font-semibold text-slate-900">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-500">Yanıtlandı</p>
              <p className="text-2xl font-semibold text-slate-900">{answeredCount}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <span className="text-gray-600 text-xl">📁</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-500">Kapatıldı</p>
              <p className="text-2xl font-semibold text-slate-900">{closedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'all', label: 'Tümü', count: questions.length },
            { id: 'pending', label: 'Bekleyen', count: pendingCount },
            { id: 'answered', label: 'Yanıtlandı', count: answeredCount },
            { id: 'closed', label: 'Kapatıldı', count: closedCount }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as 'all' | 'pending' | 'answered' | 'closed')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                statusFilter === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Response Form Modal */}
      {showResponseForm && selectedQuestion && (
        <div className="card p-6 mb-6 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-semibold mb-4">
            {selectedQuestion.admin_response ? 'Yanıtı Güncelle' : 'Soruya Yanıt Ver'}
          </h2>
          
          <div className="mb-4 p-4 bg-white rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-slate-900">{selectedQuestion.profiles.full_name}</h3>
                <p className="text-sm text-slate-500">{selectedQuestion.profiles.email}</p>
              </div>
              <span className="text-xs text-slate-400">
                {new Date(selectedQuestion.created_at).toLocaleString('tr-TR')}
              </span>
            </div>
            
            <p className="text-slate-700 mb-3">{selectedQuestion.question_text}</p>
            
            {selectedQuestion.image_url && (
              <div className="mb-3">
                <img 
                  src={selectedQuestion.image_url} 
                  alt="Soru görseli" 
                  className="max-w-sm rounded border"
                />
              </div>
            )}
          </div>
          
          <form onSubmit={responseForm.handleSubmit(handleRespond)} className="space-y-4">
            <div>
              <label htmlFor="admin_response" className="block text-sm font-medium text-slate-700 mb-2">
                Yanıtınız *
              </label>
              <textarea
                {...responseForm.register('admin_response')}
                id="admin_response"
                rows={6}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detaylı yanıtınızı buraya yazın..."
              />
              {responseForm.formState.errors.admin_response && (
                <p className="mt-1 text-sm text-red-600">{responseForm.formState.errors.admin_response.message}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Gönderiliyor...' : selectedQuestion.admin_response ? 'Yanıtı Güncelle' : 'Yanıtı Gönder'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResponseForm(false)
                  setSelectedQuestion(null)
                  responseForm.reset()
                }}
                className="btn-secondary"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Questions List */}
      <div className="card">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            Sorular ({questions.length})
          </h2>
          
          {questions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {statusFilter === 'all' ? 'Henüz soru gönderilmemiş.' : `${statusFilter === 'pending' ? 'Bekleyen' : statusFilter === 'answered' ? 'Yanıtlanmış' : 'Kapatılmış'} soru yok.`}
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="border border-slate-200 rounded-lg">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-slate-900">{question.profiles.full_name}</h3>
                          {getStatusBadge(question.status)}
                          <span className="text-xs text-slate-400">
                            {new Date(question.created_at).toLocaleString('tr-TR')}
                          </span>
                        </div>
                        
                        <p className="text-slate-700 mb-3">{question.question_text}</p>
                        
                        {question.image_url && (
                          <div className="mb-3">
                            <img 
                              src={question.image_url} 
                              alt="Soru görseli" 
                              className="max-w-xs rounded border cursor-pointer hover:opacity-80"
                              onClick={() => window.open(question.image_url, '_blank')}
                            />
                          </div>
                        )}
                        
                        {question.admin_response && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-sm font-medium text-green-800">Eğitmen Yanıtı:</h4>
                              {question.answered_at && (
                                <span className="text-xs text-green-600">
                                  {new Date(question.answered_at).toLocaleString('tr-TR')}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-green-700">{question.admin_response}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1 ml-4">
                        <button
                          onClick={() => startResponding(question)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded"
                          title={question.admin_response ? 'Yanıtı Düzenle' : 'Yanıtla'}
                        >
                          {question.admin_response ? '✏️' : '💬'}
                        </button>
                        
                        {question.status === 'pending' && (
                          <button
                            onClick={() => updateQuestionStatus(question.id, 'closed')}
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium px-2 py-1 rounded"
                            title="Kapat"
                          >
                            📁
                          </button>
                        )}
                        
                        {question.status === 'closed' && (
                          <button
                            onClick={() => updateQuestionStatus(question.id, 'pending')}
                            className="text-yellow-600 hover:text-yellow-800 text-sm font-medium px-2 py-1 rounded"
                            title="Yeniden Aç"
                          >
                            🔄
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteQuestion(question)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded"
                          title="Sil"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}