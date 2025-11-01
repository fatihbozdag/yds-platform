'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { firebase } from '@/lib/firebase-client'
import { Exam, Topic, Question } from '@/types'
import Image from 'next/image'

const examSchema = z.object({
  title: z.string().min(2, 'Başlık en az 2 karakter olmalıdır'),
  description: z.string().optional(),
  topic_id: z.string().optional(),
  duration_minutes: z.number().min(1, 'Süre en az 1 dakika olmalıdır').max(300, 'Süre en fazla 300 dakika olabilir')
})

const questionSchema = z.object({
  question_text: z.string().min(5, 'Soru metni en az 5 karakter olmalıdır'),
  option_a: z.string().min(1, 'A seçeneği boş bırakılamaz'),
  option_b: z.string().min(1, 'B seçeneği boş bırakılamaz'),
  option_c: z.string().min(1, 'C seçeneği boş bırakılamaz'),
  option_d: z.string().min(1, 'D seçeneği boş bırakılamaz'),
  option_e: z.string().min(1, 'E seçeneği boş bırakılamaz'),
  correct_answer: z.enum(['A', 'B', 'C', 'D', 'E']),
  explanation: z.string().min(5, 'Açıklama en az 5 karakter olmalıdır'),
  order_index: z.number().min(0, 'Sıra numarası 0 veya daha büyük olmalıdır')
})

type ExamForm = z.infer<typeof examSchema>
type QuestionForm = z.infer<typeof questionSchema>

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [topics, setTopics] = useState<Pick<Topic, 'id' | 'title'>[]>([])
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [showExamForm, setShowExamForm] = useState(false)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [questionImage, setQuestionImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [activeTab, setActiveTab] = useState<'exams' | 'questions' | 'preview'>('exams')
  const [previewExam, setPreviewExam] = useState<Exam | null>(null)

  const examForm = useForm<ExamForm>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      duration_minutes: 60
    }
  })

  const questionForm = useForm<QuestionForm>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      order_index: 0
    }
  })

  useEffect(() => {
    fetchExams()
    fetchTopics()
  }, [])

  const fetchExams = async () => {
    try {
      // Load exams from public JSON file
      const response = await fetch('/exams-data.json')
      if (!response.ok) {
        console.error('Failed to load exams data')
        setExams([])
        return
      }

      const examsMap = await response.json()
      const examsArray = Object.values(examsMap) as Exam[]

      // Sort by created_at descending
      examsArray.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setExams(examsArray)
    } catch (error) {
      console.error('Error fetching exams:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTopics = async () => {
    try {
      // Topics are not used in the JSON-based system
      // Set empty array to avoid errors
      setTopics([])
    } catch (error) {
      console.error('Error fetching topics:', error)
    }
  }

  const fetchQuestions = async (examId: string) => {
    try {
      // Find the exam in exams-data.json to get its content_file
      const exam = exams.find(e => e.id === examId)
      if (!exam) {
        console.error('Exam not found:', examId)
        setQuestions([])
        return
      }

      // Load questions from the exam's content file
      const contentFile = (exam as any).content_file
      if (!contentFile) {
        console.error('No content file for exam:', examId)
        setQuestions([])
        return
      }

      const response = await fetch(contentFile)
      if (!response.ok) {
        console.error('Failed to load exam content:', contentFile)
        setQuestions([])
        return
      }

      const examData = await response.json()
      const questionsList = examData.questions || []

      // Convert to Question type format
      const formattedQuestions = questionsList.map((q: any, index: number) => ({
        id: q.id || `q-${index}`,
        exam_id: examId,
        question_text: q.question || q.text || '',
        option_a: q.options?.[0] || q.a || '',
        option_b: q.options?.[1] || q.b || '',
        option_c: q.options?.[2] || q.c || '',
        option_d: q.options?.[3] || q.d || '',
        option_e: q.options?.[4] || q.e || '',
        correct_answer: q.correctAnswer !== undefined
          ? String.fromCharCode(65 + q.correctAnswer)
          : q.correct_answer || 'A',
        explanation: q.explanation || '',
        order_index: index,
        image_url: q.image_url || null
      }))

      setQuestions(formattedQuestions)
    } catch (error) {
      console.error('Error fetching questions:', error)
      setQuestions([])
    }
  }

  const selectExam = (exam: Exam) => {
    setSelectedExam(exam)
    fetchQuestions(exam.id)
    setActiveTab('questions')
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Dosya boyutu 5MB\'dan büyük olamaz')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Sadece resim dosyaları yüklenebilir')
        return
      }

      setQuestionImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadQuestionImage = async (): Promise<string | null> => {
    if (!questionImage) return null

    setUploadingImage(true)
    try {
      const fileExt = questionImage.name.split('.').pop()
      const fileName = `question-${Date.now()}.${fileExt}`

      const { data, error } = await firebase.storage
        .from('question-images')
        .upload(fileName, questionImage)

      if (error) throw error

      const { data: { publicUrl } } = firebase.storage
        .from('question-images')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Resim yüklenirken hata oluştu')
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const onExamSubmit = async (data: ExamForm) => {
    setSubmitting(true)
    try {
      if (editingExam) {
        const { error } = await firebase
          .from('exams')
          .update({
            title: data.title,
            description: data.description || '',
            topic_id: data.topic_id || null,
            duration_minutes: data.duration_minutes
          })
          .eq('id', editingExam.id)

        if (error) throw error
        alert('Sınav başarıyla güncellendi!')
      } else {
        const { error } = await firebase
          .from('exams')
          .insert({
            title: data.title,
            description: data.description || '',
            topic_id: data.topic_id || null,
            duration_minutes: data.duration_minutes,
            total_questions: 0
          })

        if (error) throw error
        alert('Yeni sınav başarıyla oluşturuldu!')
      }

      examForm.reset()
      setShowExamForm(false)
      setEditingExam(null)
      fetchExams()
    } catch (error) {
      console.error('Error saving exam:', error)
      alert('Sınav kaydedilirken hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const onQuestionSubmit = async (data: QuestionForm) => {
    if (!selectedExam) return

    setSubmitting(true)
    try {
      // Upload image if present
      const imageUrl = await uploadQuestionImage()

      if (editingQuestion) {
        const { error } = await firebase
          .from('questions')
          .update({
            question_text: data.question_text,
            option_a: data.option_a,
            option_b: data.option_b,
            option_c: data.option_c,
            option_d: data.option_d,
            option_e: data.option_e,
            correct_answer: data.correct_answer,
            explanation: data.explanation,
            order_index: data.order_index,
            image_url: imageUrl || editingQuestion.image_url
          })
          .eq('id', editingQuestion.id)

        if (error) throw error
        alert('Soru başarıyla güncellendi!')
      } else {
        const { error } = await firebase
          .from('questions')
          .insert({
            exam_id: selectedExam.id,
            question_text: data.question_text,
            option_a: data.option_a,
            option_b: data.option_b,
            option_c: data.option_c,
            option_d: data.option_d,
            option_e: data.option_e,
            correct_answer: data.correct_answer,
            explanation: data.explanation,
            order_index: data.order_index,
            image_url: imageUrl
          })

        if (error) throw error

        // Update exam total questions count
        const { error: updateError } = await firebase
          .from('exams')
          .update({ total_questions: questions.length + 1 })
          .eq('id', selectedExam.id)

        if (updateError) throw updateError

        alert('Yeni soru başarıyla eklendi!')
      }

      questionForm.reset()
      setShowQuestionForm(false)
      setEditingQuestion(null)
      setQuestionImage(null)
      setImagePreview(null)
      fetchQuestions(selectedExam.id)
      fetchExams() // Refresh to update question counts
    } catch (error) {
      console.error('Error saving question:', error)
      alert('Soru kaydedilirken hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteExam = async (examId: string) => {
    if (!confirm('Bu sınavı silmek istediğinizden emin misiniz? Tüm sorular da silinecektir.')) {
      return
    }

    try {
      // First delete all questions
      const { error: questionsError } = await firebase
        .from('questions')
        .delete()
        .eq('exam_id', examId)

      if (questionsError) throw questionsError

      // Then delete the exam
      const { error: examError } = await firebase
        .from('exams')
        .delete()
        .eq('id', examId)

      if (examError) throw examError

      alert('Sınav başarıyla silindi')
      fetchExams()
      if (selectedExam?.id === examId) {
        setSelectedExam(null)
        setQuestions([])
        setActiveTab('exams')
      }
    } catch (error) {
      console.error('Error deleting exam:', error)
      alert('Sınav silinirken hata oluştu')
    }
  }

  const deleteQuestion = async (questionId: string) => {
    if (!confirm('Bu soruyu silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const { error } = await firebase
        .from('questions')
        .delete()
        .eq('id', questionId)

      if (error) throw error

      // Update exam total questions count
      if (selectedExam) {
        const { error: updateError } = await firebase
          .from('exams')
          .update({ total_questions: questions.length - 1 })
          .eq('id', selectedExam.id)

        if (updateError) throw updateError
      }

      alert('Soru başarıyla silindi')
      if (selectedExam) {
        fetchQuestions(selectedExam.id)
      }
      fetchExams() // Refresh to update question counts
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('Soru silinirken hata oluştu')
    }
  }

  const editExam = (exam: Exam) => {
    setEditingExam(exam)
    examForm.setValue('title', exam.title)
    examForm.setValue('description', exam.description || '')
    examForm.setValue('topic_id', exam.topic_id || '')
    examForm.setValue('duration_minutes', exam.duration_minutes)
    setShowExamForm(true)
  }

  const editQuestion = (question: Question) => {
    setEditingQuestion(question)
    questionForm.setValue('question_text', question.question_text)
    questionForm.setValue('option_a', question.option_a)
    questionForm.setValue('option_b', question.option_b)
    questionForm.setValue('option_c', question.option_c)
    questionForm.setValue('option_d', question.option_d)
    questionForm.setValue('option_e', question.option_e)
    questionForm.setValue('correct_answer', question.correct_answer)
    questionForm.setValue('explanation', question.explanation)
    questionForm.setValue('order_index', question.order_index)
    setImagePreview(question.image_url || null)
    setShowQuestionForm(true)
  }

  const startPreview = (exam: Exam) => {
    setPreviewExam(exam)
    fetchQuestions(exam.id)
    setActiveTab('preview')
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours} saat ${mins} dakika`
    }
    return `${mins} dakika`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sınav Yönetimi</h1>
          <p className="text-slate-600">Sınavlar oluşturun ve sorularını yönetin</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('exams')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'exams'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Sınavlar ({exams.length})
          </button>
          {selectedExam && (
            <button
              onClick={() => setActiveTab('questions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'questions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Sorular ({questions.length}) - {selectedExam.title}
            </button>
          )}
          {previewExam && (
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'preview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Önizleme - {previewExam.title}
            </button>
          )}
        </nav>
      </div>

      {/* Exams Tab */}
      {activeTab === 'exams' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setEditingExam(null)
                examForm.reset()
                setShowExamForm(true)
              }}
              className="btn-primary"
            >
              ➕ Yeni Sınav
            </button>
          </div>

          {/* Exams List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam) => (
              <div key={exam.id} className="card p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-slate-900 line-clamp-2">{exam.title}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => editExam(exam)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => startPreview(exam)}
                      className="text-green-600 hover:text-green-800 text-sm"
                      title="Önizleme"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => deleteExam(exam.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      title="Sil"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-600 mb-4">
                  <p><strong>Süre:</strong> {formatTime(exam.duration_minutes)}</p>
                  <p><strong>Soru Sayısı:</strong> {exam.total_questions || 0}</p>
                  {exam.topic_id && (
                    <p><strong>Konu:</strong> {topics.find(t => t.id === exam.topic_id)?.title}</p>
                  )}
                  {exam.description && (
                    <p className="text-xs line-clamp-2">{exam.description}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => selectExam(exam)}
                    className="btn-primary flex-1 text-sm"
                  >
                    Soruları Yönet
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions Tab */}
      {activeTab === 'questions' && selectedExam && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{selectedExam.title}</h2>
              <p className="text-slate-600">{questions.length} soru</p>
            </div>
            <button
              onClick={() => {
                setEditingQuestion(null)
                questionForm.reset()
                questionForm.setValue('order_index', questions.length)
                setQuestionImage(null)
                setImagePreview(null)
                setShowQuestionForm(true)
              }}
              className="btn-primary"
            >
              ➕ Yeni Soru Ekle
            </button>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      Soru {question.order_index + 1}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      Doğru: {question.correct_answer}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editQuestion(question)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteQuestion(question.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      title="Sil"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Question Image */}
                {question.image_url && (
                  <div className="mb-4">
                    <Image
                      src={question.image_url}
                      alt="Soru görseli"
                      width={400}
                      height={200}
                      className="rounded-lg shadow-sm max-w-full h-auto"
                    />
                  </div>
                )}

                {/* Question Text */}
                <div className="mb-4">
                  <p className="text-slate-800 whitespace-pre-wrap">{question.question_text}</p>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 text-sm">
                  <div className={`p-2 rounded ${question.correct_answer === 'A' ? 'bg-green-50 border border-green-200' : 'bg-slate-50'}`}>
                    <strong>A)</strong> {question.option_a}
                  </div>
                  <div className={`p-2 rounded ${question.correct_answer === 'B' ? 'bg-green-50 border border-green-200' : 'bg-slate-50'}`}>
                    <strong>B)</strong> {question.option_b}
                  </div>
                  <div className={`p-2 rounded ${question.correct_answer === 'C' ? 'bg-green-50 border border-green-200' : 'bg-slate-50'}`}>
                    <strong>C)</strong> {question.option_c}
                  </div>
                  <div className={`p-2 rounded ${question.correct_answer === 'D' ? 'bg-green-50 border border-green-200' : 'bg-slate-50'}`}>
                    <strong>D)</strong> {question.option_d}
                  </div>
                  <div className={`p-2 rounded ${question.correct_answer === 'E' ? 'bg-green-50 border border-green-200' : 'bg-slate-50'} md:col-span-2`}>
                    <strong>E)</strong> {question.option_e}
                  </div>
                </div>

                {/* Explanation */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Açıklama:</h4>
                  <p className="text-blue-800 text-sm whitespace-pre-wrap">{question.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && previewExam && (
        <div>
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">Önizleme Modu</h2>
            <p className="text-blue-700">Bu sayfada sınavın öğrenci gözünden nasıl göründüğünü inceleyebilirsiniz.</p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Exam Header */}
            <div className="card p-6 mb-6">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{previewExam.title}</h1>
              <div className="flex gap-6 text-sm text-slate-600">
                <span><strong>Süre:</strong> {formatTime(previewExam.duration_minutes)}</span>
                <span><strong>Soru Sayısı:</strong> {questions.length}</span>
              </div>
              {previewExam.description && (
                <p className="mt-4 text-slate-700">{previewExam.description}</p>
              )}
            </div>

            {/* Questions Preview */}
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className="card p-6">
                  <div className="mb-4">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      Soru {index + 1}
                    </span>
                  </div>

                  {/* Question Image */}
                  {question.image_url && (
                    <div className="mb-4">
                      <Image
                        src={question.image_url}
                        alt="Soru görseli"
                        width={600}
                        height={300}
                        className="rounded-lg shadow-sm max-w-full h-auto"
                      />
                    </div>
                  )}

                  {/* Question Text */}
                  <div className="mb-6">
                    <p className="text-lg text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {question.question_text}
                    </p>
                  </div>

                  {/* Answer Options */}
                  <div className="space-y-3 mb-4">
                    {(['A', 'B', 'C', 'D', 'E'] as const).map((option) => (
                      <div
                        key={option}
                        className="p-4 rounded-lg border-2 border-slate-200"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg text-slate-700">{option})</span>
                          <span className="text-slate-800">
                            {question[`option_${option.toLowerCase()}` as keyof Question] as string}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Show correct answer in preview */}
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">✅</span>
                      <h4 className="font-semibold text-green-900">Doğru Cevap: {question.correct_answer}</h4>
                    </div>
                    <p className="text-green-800 text-sm whitespace-pre-wrap">{question.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Exam Form Modal */}
      {showExamForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-md w-full m-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                {editingExam ? 'Sınavı Düzenle' : 'Yeni Sınav Oluştur'}
              </h2>

              <form onSubmit={examForm.handleSubmit(onExamSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sınav Başlığı
                  </label>
                  <input
                    {...examForm.register('title')}
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="YDS Deneme Sınavı 1"
                  />
                  {examForm.formState.errors.title && (
                    <p className="mt-1 text-sm text-red-600">{examForm.formState.errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Açıklama (Opsiyonel)
                  </label>
                  <textarea
                    {...examForm.register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Sınav hakkında kısa açıklama..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Konu (Opsiyonel)
                  </label>
                  <select
                    {...examForm.register('topic_id')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Konu seçin</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Süre (Dakika)
                  </label>
                  <input
                    {...examForm.register('duration_minutes', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    max="300"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {examForm.formState.errors.duration_minutes && (
                    <p className="mt-1 text-sm text-red-600">{examForm.formState.errors.duration_minutes.message}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary flex-1"
                  >
                    {submitting ? 'Kaydediliyor...' : editingExam ? 'Güncelle' : 'Oluştur'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExamForm(false)
                      setEditingExam(null)
                      examForm.reset()
                    }}
                    className="btn-secondary flex-1"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Question Form Modal */}
      {showQuestionForm && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                {editingQuestion ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}
              </h2>

              <form onSubmit={questionForm.handleSubmit(onQuestionSubmit)} className="space-y-6">
                {/* Question Text */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Soru Metni
                  </label>
                  <textarea
                    {...questionForm.register('question_text')}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Soru metnini buraya yazın..."
                  />
                  {questionForm.formState.errors.question_text && (
                    <p className="mt-1 text-sm text-red-600">{questionForm.formState.errors.question_text.message}</p>
                  )}
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Soru Görseli (Opsiyonel)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-slate-500">Maksimum dosya boyutu: 5MB. Desteklenen formatlar: JPG, PNG, GIF</p>
                  
                  {imagePreview && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-slate-700 mb-2">Görsel Önizleme:</p>
                      <Image
                        src={imagePreview}
                        alt="Görsel önizleme"
                        width={400}
                        height={200}
                        className="rounded-lg shadow-sm max-w-full h-auto border"
                      />
                    </div>
                  )}
                </div>

                {/* Answer Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(['A', 'B', 'C', 'D', 'E'] as const).map((option) => (
                    <div key={option} className={option === 'E' ? 'md:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Seçenek {option}
                      </label>
                      <textarea
                        {...questionForm.register(`option_${option.toLowerCase()}` as keyof QuestionForm)}
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`${option} seçeneği...`}
                      />
                      {questionForm.formState.errors[`option_${option.toLowerCase()}` as keyof QuestionForm] && (
                        <p className="mt-1 text-sm text-red-600">
                          {questionForm.formState.errors[`option_${option.toLowerCase()}` as keyof QuestionForm]?.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Correct Answer */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Doğru Cevap
                    </label>
                    <select
                      {...questionForm.register('correct_answer')}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seçin</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                    </select>
                    {questionForm.formState.errors.correct_answer && (
                      <p className="mt-1 text-sm text-red-600">{questionForm.formState.errors.correct_answer.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Sıra Numarası
                    </label>
                    <input
                      {...questionForm.register('order_index', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {questionForm.formState.errors.order_index && (
                      <p className="mt-1 text-sm text-red-600">{questionForm.formState.errors.order_index.message}</p>
                    )}
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Çözüm ve Açıklama
                  </label>
                  <textarea
                    {...questionForm.register('explanation')}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Sorunun çözümünü ve açıklamasını yazın..."
                  />
                  {questionForm.formState.errors.explanation && (
                    <p className="mt-1 text-sm text-red-600">{questionForm.formState.errors.explanation.message}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting || uploadingImage}
                    className="btn-primary flex-1"
                  >
                    {submitting || uploadingImage ? 'Kaydediliyor...' : editingQuestion ? 'Güncelle' : 'Kaydet'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuestionForm(false)
                      setEditingQuestion(null)
                      setQuestionImage(null)
                      setImagePreview(null)
                      questionForm.reset()
                    }}
                    className="btn-secondary flex-1"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}