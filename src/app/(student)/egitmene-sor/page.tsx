'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { firebase } from '@/lib/firebase-client'
import { TutorQuestion, Profile } from '@/types'

const questionSchema = z.object({
  question_text: z.string().min(10, 'Soru en az 10 karakter olmalıdır').max(1000, 'Soru en fazla 1000 karakter olabilir'),
  category: z.enum(['grammar', 'vocabulary', 'reading', 'exam_strategy', 'other']).optional()
})

type QuestionForm = z.infer<typeof questionSchema>

interface TutorQuestionWithProfile extends TutorQuestion {
  profiles?: Profile
}

export default function StudentAskInstructorPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<TutorQuestionWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const form = useForm<QuestionForm>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      category: 'other'
    }
  })

  useEffect(() => {
    fetchMyQuestions()
  }, [])

  const fetchMyQuestions = async () => {
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
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setQuestions(data || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
      alert('Sorularınız yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Lütfen sadece resim dosyası seçin')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Resim boyutu 5MB\'dan küçük olmalıdır')
      return
    }

    setSelectedImage(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleSubmitQuestion = async (data: QuestionForm) => {
    setSubmitting(true)
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) return

      let imageUrl = null

      // Upload image if selected
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await firebase.storage
          .from('question-images')
          .upload(fileName, selectedImage)

        if (uploadError) {
          console.error('Image upload error:', uploadError)
          alert('Resim yüklenirken bir hata oluştu')
          return
        }

        const { data: { publicUrl } } = firebase.storage
          .from('question-images')
          .getPublicUrl(fileName)
        
        imageUrl = publicUrl
      }

      // Submit question
      const { error } = await firebase
        .from('tutor_questions')
        .insert({
          student_id: user.id,
          question_text: data.question_text,
          image_url: imageUrl,
          status: 'pending'
        })

      if (error) throw error

      // Reset form and refresh questions
      form.reset()
      setSelectedImage(null)
      setImagePreview(null)
      setShowForm(false)
      await fetchMyQuestions()

      alert('✅ Sorunuz başarıyla gönderildi! En kısa sürede cevaplanacaktır.')
    } catch (error: unknown) {
      console.error('Error submitting question:', error)
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
      alert('❌ Soru gönderilirken bir hata oluştu: ' + errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: 'Bekliyor', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      answered: { label: 'Cevaplandı', class: 'bg-green-100 text-green-800 border-green-200' },
      closed: { label: 'Kapatıldı', class: 'bg-gray-100 text-gray-800 border-gray-200' }
    }
    const badge = badges[status as keyof typeof badges] || badges.pending
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${badge.class}`}>
        {badge.label}
      </span>
    )
  }

  const getCategoryLabel = (category: string) => {
    const categories = {
      grammar: 'Gramer',
      vocabulary: 'Kelime',
      reading: 'Okuma',
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
          <p className="mt-4">Sorularınız yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Eğitmene Sor</h1>
        <p className="text-slate-600">
          YDS konularında takıldığınız yerler için uzman eğitmenlerimizden yardım alabilirsiniz.
        </p>
      </div>

      {/* Info Card */}
      <div className="card p-6 mb-8 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">💡</span>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Nasıl Çalışır?</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Anlamadığınız konuları detaylıca açıklayın</li>
              <li>• Gerekirse soru fotoğrafı ekleyebilirsiniz</li>
              <li>• Uzman eğitmenlerimiz 24 saat içinde cevaplar</li>
              <li>• Her soru için ücret: <strong>10 TL</strong></li>
            </ul>
          </div>
        </div>
      </div>

      {/* New Question Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? '❌ İptal Et' : '➕ Yeni Soru Sor'}
        </button>
      </div>

      {/* Question Form */}
      {showForm && (
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Yeni Soru</h2>
          
          <form onSubmit={form.handleSubmit(handleSubmitQuestion)} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Konu Kategorisi
              </label>
              <select
                {...form.register('category')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="grammar">Gramer</option>
                <option value="vocabulary">Kelime Bilgisi</option>
                <option value="reading">Okuma Anlama</option>
                <option value="exam_strategy">Sınav Stratejisi</option>
                <option value="other">Diğer</option>
              </select>
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sorunuz <span className="text-red-500">*</span>
              </label>
              <textarea
                {...form.register('question_text')}
                rows={6}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Sorunuzu detaylıca açıklayın. Ne konuda zorlandığınızı, hangi kısmını anlamadığınızı belirtin..."
              />
              {form.formState.errors.question_text && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.question_text.message}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                {form.watch('question_text')?.length || 0} / 1000 karakter
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Görsel Ekle (Opsiyonel)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
                {imagePreview ? (
                  <div className="text-center">
                    <img src={imagePreview} alt="Preview" className="max-w-xs max-h-48 mx-auto rounded" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm"
                    >
                      🗑️ Resmi Kaldır
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <label className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-800 font-medium">
                        Resim seçmek için tıklayın
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-slate-500 mt-1">
                      PNG, JPG, GIF - Max 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-600">💰</span>
                <span className="font-medium text-yellow-800">Ücretlendirme Bilgisi</span>
              </div>
              <p className="text-yellow-700 text-sm">
                Bu soru için <strong>10 TL</strong> ücret alınacaktır. 
                Sorunuz gönderildikten sonra ödeme sayfasına yönlendirileceksiniz.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '⏳ Gönderiliyor...' : '📤 Soruyu Gönder (10 TL)'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  form.reset()
                  removeImage()
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
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Sorularınız ({questions.length})</h2>
        </div>

        <div className="divide-y divide-slate-200">
          {questions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">❓</div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Henüz soru sormadınız</h3>
              <p className="text-slate-600 mb-4">
                YDS konularında takıldığınız yerler için ilk sorunuzu sorun!
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                İlk Sorunuzu Sorun
              </button>
            </div>
          ) : (
            questions.map((question) => (
              <div key={question.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(question.status)}
                    <span className="text-sm text-slate-500">
                      {new Date(question.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <Link
                    href={`/egitmene-sor/${question.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Detayları Görüntüle →
                  </Link>
                </div>

                <div className="mb-4">
                  <p className="text-slate-900 leading-relaxed">
                    {question.question_text.length > 200 
                      ? question.question_text.substring(0, 200) + '...'
                      : question.question_text
                    }
                  </p>
                </div>

                {question.image_url && (
                  <div className="mb-4">
                    <img 
                      src={question.image_url} 
                      alt="Soru görseli" 
                      className="max-w-xs rounded border shadow-sm"
                    />
                  </div>
                )}

                {question.admin_response && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-600">✅</span>
                      <span className="font-medium text-green-800">Eğitmen Yanıtı:</span>
                    </div>
                    <p className="text-green-700 text-sm">
                      {question.admin_response.length > 150 
                        ? question.admin_response.substring(0, 150) + '...'
                        : question.admin_response
                      }
                    </p>
                    {question.admin_response.length > 150 && (
                      <Link
                        href={`/egitmene-sor/${question.id}`}
                        className="text-green-600 hover:text-green-800 text-sm font-medium mt-1 inline-block"
                      >
                        Tam yanıtı görüntüle →
                      </Link>
                    )}
                  </div>
                )}

                {question.status === 'pending' && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-700 text-sm">
                      ⏳ Sorunuz inceleniyor. En geç 24 saat içinde cevaplanacaktır.
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="card p-6 mt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">❓ Sık Sorulan Sorular</h3>
        <div className="space-y-4 text-sm">
          <div>
            <div className="font-medium text-slate-900">Sorularım ne kadar sürede cevaplanır?</div>
            <div className="text-slate-600 mt-1">Sorularınız genellikle 2-4 saat içinde, en geç 24 saat içinde cevaplanır.</div>
          </div>
          <div>
            <div className="font-medium text-slate-900">Hangi konularda soru sorabilirim?</div>
            <div className="text-slate-600 mt-1">YDS ile ilgili tüm konularda (gramer, kelime, okuma anlama, sınav stratejisi) soru sorabilirsiniz.</div>
          </div>
          <div>
            <div className="font-medium text-slate-900">Ödeme nasıl yapılır?</div>
            <div className="text-slate-600 mt-1">Sorunuzu gönderdikten sonra güvenli ödeme sayfasına yönlendirilirsiniz. Kredi kartı veya havale ile ödeme yapabilirsiniz.</div>
          </div>
        </div>
      </div>
    </div>
  )
}