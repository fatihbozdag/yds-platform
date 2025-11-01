'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { firebase } from '@/lib/firebase-client'

interface ParsedQuestion {
  id: string
  question_text: string
  options: string[]
  correct_answer: string
  category?: string
  difficulty?: string
}

export default function ExamImportPage() {
  const router = useRouter()
  const [rawText, setRawText] = useState('')
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([])
  const [examTitle, setExamTitle] = useState('')
  const [examDescription, setExamDescription] = useState('')
  const [duration, setDuration] = useState(120)
  const [isPreview, setIsPreview] = useState(false)
  const [saving, setSaving] = useState(false)

  const parseQuestions = (text: string): ParsedQuestion[] => {
    const questions: ParsedQuestion[] = []

    // Split by question numbers (1., 2., etc.)
    const questionBlocks = text.split(/(?=\d+\.\s)/).filter(block => block.trim())

    questionBlocks.forEach((block, index) => {
      const lines = block.trim().split('\n').filter(line => line.trim())
      if (lines.length < 2) return

      // Extract question number and text
      const firstLine = lines[0]
      const questionMatch = firstLine.match(/^\d+\.\s*(.+)/)
      if (!questionMatch) return

      const questionText = questionMatch[1]
      const options: string[] = []
      let correctAnswer = ''

      // Parse options and correct answer
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()

        // Check for options (a), b), c), d)
        const optionMatch = line.match(/^([a-d])\)\s*(.+)/)
        if (optionMatch) {
          const optionLetter = optionMatch[1].toUpperCase()
          const optionText = optionMatch[2]
          options.push(`${optionLetter}) ${optionText}`)
          continue
        }

        // Check for correct answer
        const correctMatch = line.match(/^(?:correct|answer|cevap):\s*([a-d])/i)
        if (correctMatch) {
          correctAnswer = correctMatch[1].toUpperCase()
          continue
        }
      }

      if (questionText && options.length >= 2 && correctAnswer) {
        questions.push({
          id: `temp-${index + 1}`,
          question_text: questionText,
          options,
          correct_answer: correctAnswer,
          category: 'general',
          difficulty: 'medium'
        })
      }
    })

    return questions
  }

  const handleParseText = () => {
    const parsed = parseQuestions(rawText)
    setParsedQuestions(parsed)
    setIsPreview(true)
  }

  const handleSaveExam = async () => {
    if (!examTitle.trim() || parsedQuestions.length === 0) {
      alert('Sınav başlığı ve en az bir soru gereklidir')
      return
    }

    setSaving(true)
    try {
      // Create exam
      const { data: examData, error: examError } = await firebase
        .from('exams')
        .insert({
          title: examTitle,
          description: examDescription,
          duration_minutes: duration,
          question_count: parsedQuestions.length,
          is_active: true,
          created_by: '8SL2Eq5KcvZQnhmJxeI8rhD9Epv1'
        })
        .select()

      if (examError) throw examError

      // Create questions
      const questionsToInsert = parsedQuestions.map(q => ({
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        category: q.category,
        difficulty: q.difficulty,
        created_by: '8SL2Eq5KcvZQnhmJxeI8rhD9Epv1'
      }))

      const { error: questionsError } = await firebase
        .from('questions')
        .insert(questionsToInsert)
        .select()

      if (questionsError) throw questionsError

      alert('Sınav başarıyla oluşturuldu!')
      router.push('/admin/sinavlar')
    } catch (error: any) {
      console.error('Error creating exam:', error)
      alert('Sınav oluşturulurken hata: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const sampleText = `1. What is the main idea of the passage?
a) Technology is harmful
b) Education is important
c) Reading improves vocabulary
d) Students need motivation
Correct: C

2. Which word best completes the sentence: "_____ it was raining, we went out."
a) Although
b) Because
c) Therefore
d) However
Correct: A

3. The author's primary purpose is to:
a) Criticize modern education
b) Explain a scientific process
c) Entertain the reader
d) Persuade readers to take action
Correct: D`

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Toplu Soru İçe Aktarma</h1>
        <button
          onClick={() => router.back()}
          className="btn-secondary"
        >
          ← Geri Dön
        </button>
      </div>

      {!isPreview ? (
        <div className="space-y-6">
          {/* Exam Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Sınav Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sınav Başlığı *
                </label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="YDS Deneme Sınavı"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Süre (dakika)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Açıklama
              </label>
              <textarea
                value={examDescription}
                onChange={(e) => setExamDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Sınav açıklaması..."
              />
            </div>
          </div>

          {/* Question Input */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Soru Metni</h2>
              <button
                onClick={() => setRawText(sampleText)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Örnek Metni Yükle
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              <strong>Format:</strong>
              <br />• Her soru için: "1. Soru metni"
              <br />• Seçenekler: "a) Seçenek metni"
              <br />• Doğru cevap: "Correct: A" veya "Cevap: A"
            </div>

            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={15}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Sorularınızı buraya yapıştırın..."
            />

            <div className="mt-4">
              <button
                onClick={handleParseText}
                disabled={!rawText.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Soruları Ayrıştır ({rawText.trim().split(/(?=\d+\.\s)/).filter(b => b.trim()).length} soru tespit edildi)
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Preview */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Önizleme ({parsedQuestions.length} soru)</h2>
              <div className="space-x-2">
                <button
                  onClick={() => setIsPreview(false)}
                  className="btn-secondary"
                >
                  ← Düzenle
                </button>
                <button
                  onClick={handleSaveExam}
                  disabled={saving}
                  className="btn-primary disabled:opacity-50"
                >
                  {saving ? 'Kaydediliyor...' : 'Sınavı Kaydet'}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {parsedQuestions.map((question, index) => (
                <div key={question.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-slate-900">
                      {index + 1}. {question.question_text}
                    </h3>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Doğru: {question.correct_answer}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-2 rounded border ${
                          option.startsWith(question.correct_answer)
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}