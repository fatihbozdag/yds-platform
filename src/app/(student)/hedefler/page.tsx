'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { firebase } from '@/lib/firebase-client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

interface Goal {
  id: string
  title: string
  description: string
  target_type: 'exam_score' | 'exam_count' | 'study_days' | 'questions_count'
  target_value: number
  current_value: number
  deadline: string
  status: 'active' | 'completed' | 'paused'
  created_at: string
  updated_at: string
}

const goalSchema = z.object({
  title: z.string().min(3, 'Hedef başlığı en az 3 karakter olmalıdır').max(100, 'Hedef başlığı en fazla 100 karakter olabilir'),
  description: z.string().max(500, 'Açıklama en fazla 500 karakter olabilir').optional(),
  target_type: z.enum(['exam_score', 'exam_count', 'study_days', 'questions_count']),
  target_value: z.number().min(1, 'Hedef değeri en az 1 olmalıdır').max(10000, 'Hedef değeri çok yüksek'),
  deadline: z.string().min(1, 'Son tarih seçilmelidir')
})

type GoalFormData = z.infer<typeof goalSchema>

export default function GoalsPage() {
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema)
  })

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await firebase
        .from('student_goals')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Calculate current values for each goal
      const goalsWithProgress = await Promise.all(
        (data || []).map(async (goal) => {
          const currentValue = await calculateCurrentValue(goal.target_type, user.id)
          return { ...goal, current_value: currentValue }
        })
      )

      setGoals(goalsWithProgress)
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateCurrentValue = async (targetType: string, userId: string): Promise<number> => {
    try {
      switch (targetType) {
        case 'exam_score': {
          const { data } = await firebase
            .from('exam_results')
            .select('score')
            .eq('student_id', userId)
            .order('score', { ascending: false })
            .limit(1)
          return data?.[0]?.score || 0
        }
        case 'exam_count': {
          const { count } = await firebase
            .from('exam_results')
            .select('id', { count: 'exact' })
            .eq('student_id', userId)
          return count || 0
        }
        case 'study_days': {
          const { data } = await firebase
            .from('exam_results')
            .select('completed_at')
            .eq('student_id', userId)
          
          if (!data) return 0
          
          const uniqueDays = new Set(
            data.map(result => new Date(result.completed_at).toDateString())
          )
          return uniqueDays.size
        }
        case 'questions_count': {
          const { data } = await firebase
            .from('exam_results')
            .select('correct_count, wrong_count')
            .eq('student_id', userId)
          
          if (!data) return 0
          
          return data.reduce((total, result) => 
            total + result.correct_count + result.wrong_count, 0
          )
        }
        default:
          return 0
      }
    } catch (error) {
      console.error('Error calculating current value:', error)
      return 0
    }
  }

  const onSubmit = async (data: GoalFormData) => {
    try {
      const { data: { user } } = await firebase.auth.getUser()
      if (!user) return

      const goalData = {
        student_id: user.id,
        title: data.title,
        description: data.description || '',
        target_type: data.target_type,
        target_value: data.target_value,
        deadline: data.deadline,
        status: 'active' as const
      }

      if (editingGoal) {
        const { error } = await firebase
          .from('student_goals')
          .update(goalData)
          .eq('id', editingGoal.id)

        if (error) throw error
        alert('Hedef başarıyla güncellendi!')
      } else {
        const { error } = await firebase
          .from('student_goals')
          .insert(goalData)

        if (error) throw error
        alert('Yeni hedef başarıyla oluşturuldu!')
      }

      setShowForm(false)
      setEditingGoal(null)
      reset()
      fetchGoals()
    } catch (error) {
      console.error('Error saving goal:', error)
      alert('Hedef kaydedilirken bir hata oluştu')
    }
  }

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Bu hedefi silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await firebase
        .from('student_goals')
        .delete()
        .eq('id', goalId)

      if (error) throw error
      
      alert('Hedef başarıyla silindi')
      fetchGoals()
    } catch (error) {
      console.error('Error deleting goal:', error)
      alert('Hedef silinirken bir hata oluştu')
    }
  }

  const updateGoalStatus = async (goalId: string, status: 'active' | 'completed' | 'paused') => {
    try {
      const { error } = await firebase
        .from('student_goals')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', goalId)

      if (error) throw error
      
      fetchGoals()
    } catch (error) {
      console.error('Error updating goal status:', error)
      alert('Hedef durumu güncellenirken bir hata oluştu')
    }
  }

  const getTargetTypeLabel = (type: string) => {
    const labels = {
      exam_score: 'En Yüksek Sınav Puanı',
      exam_count: 'Toplam Sınav Sayısı', 
      study_days: 'Çalışma Günü Sayısı',
      questions_count: 'Çözülen Soru Sayısı'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100)
  }

  const editGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setValue('title', goal.title)
    setValue('description', goal.description)
    setValue('target_type', goal.target_type)
    setValue('target_value', goal.target_value)
    setValue('deadline', goal.deadline.split('T')[0])
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Hedefleriniz yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hedeflerim</h1>
          <p className="text-slate-600">Çalışma hedeflerinizi belirleyin ve ilerlemenizi takip edin</p>
        </div>
        <button
          onClick={() => {
            setEditingGoal(null)
            reset()
            setShowForm(true)
          }}
          className="btn-primary"
        >
          ➕ Yeni Hedef Ekle
        </button>
      </div>

      {/* Goal Creation/Edit Form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {editingGoal ? 'Hedef Düzenle' : 'Yeni Hedef Oluştur'}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Hedef Başlığı
              </label>
              <input
                {...register('title')}
                type="text"
                placeholder="Örn: Bu ay 10 deneme sınavı çözmek"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Açıklama (Opsiyonel)
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Hedefiniz hakkında ek açıklama..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Hedef Türü
                </label>
                <select
                  {...register('target_type')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Hedef türünü seçin</option>
                  <option value="exam_score">En Yüksek Sınav Puanı (%)</option>
                  <option value="exam_count">Toplam Sınav Sayısı</option>
                  <option value="study_days">Çalışma Günü Sayısı</option>
                  <option value="questions_count">Çözülen Soru Sayısı</option>
                </select>
                {errors.target_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.target_type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Hedef Değer
                </label>
                <input
                  {...register('target_value', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  placeholder="Örn: 85"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.target_value && (
                  <p className="mt-1 text-sm text-red-600">{errors.target_value.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Son Tarih
              </label>
              <input
                {...register('deadline')}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.deadline && (
                <p className="mt-1 text-sm text-red-600">{errors.deadline.message}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="btn-primary"
              >
                {editingGoal ? 'Hedefi Güncelle' : 'Hedef Oluştur'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingGoal(null)
                  reset()
                }}
                className="btn-secondary"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      {goals.length > 0 ? (
        <div className="space-y-4">
          {goals.map((goal) => {
            const progressPercentage = getProgressPercentage(goal.current_value, goal.target_value)
            const isCompleted = progressPercentage >= 100
            const isOverdue = new Date(goal.deadline) < new Date() && !isCompleted
            
            return (
              <div key={goal.id} className={`card p-6 ${isCompleted ? 'border-green-200 bg-green-50' : isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{goal.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                        goal.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {goal.status === 'completed' ? '✅ Tamamlandı' :
                         goal.status === 'paused' ? '⏸️ Duraklatıldı' :
                         '🎯 Aktif'}
                      </span>
                    </div>
                    
                    {goal.description && (
                      <p className="text-slate-600 text-sm mb-3">{goal.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-slate-700">Hedef Türü:</span>
                        <span className="ml-2 text-slate-600">{getTargetTypeLabel(goal.target_type)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">İlerleme:</span>
                        <span className="ml-2 text-slate-600">{goal.current_value} / {goal.target_value}</span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">Son Tarih:</span>
                        <span className={`ml-2 ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                          {new Date(goal.deadline).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => editGoal(goal)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                    {goal.status === 'active' && progressPercentage >= 100 && (
                      <button
                        onClick={() => updateGoalStatus(goal.id, 'completed')}
                        className="text-green-600 hover:text-green-800 text-sm"
                        title="Tamamlandı olarak işaretle"
                      >
                        ✅
                      </button>
                    )}
                    <button
                      onClick={() => updateGoalStatus(goal.id, goal.status === 'paused' ? 'active' : 'paused')}
                      className="text-yellow-600 hover:text-yellow-800 text-sm"
                      title={goal.status === 'paused' ? 'Aktifleştir' : 'Durakla'}
                    >
                      {goal.status === 'paused' ? '▶️' : '⏸️'}
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      title="Sil"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">İlerleme</span>
                    <span className={`text-sm font-bold ${
                      progressPercentage >= 100 ? 'text-green-600' :
                      progressPercentage >= 70 ? 'text-blue-600' :
                      progressPercentage >= 40 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      %{progressPercentage}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        progressPercentage >= 100 ? 'bg-green-500' :
                        progressPercentage >= 70 ? 'bg-blue-500' :
                        progressPercentage >= 40 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {isCompleted && goal.status !== 'completed' && (
                  <div className="mt-3 p-3 bg-green-100 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm font-medium">
                      🎉 Tebrikler! Bu hedefi başarıyla tamamladınız. &quot;Tamamlandı&quot; olarak işaretlemek ister misiniz?
                    </p>
                  </div>
                )}

                {isOverdue && (
                  <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm font-medium">
                      ⚠️ Bu hedefin son tarihi geçmiş. Hedefi güncellemek veya yeni bir tarih belirlemek isteyebilirsiniz.
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Henüz hedef belirlemdiniz</h2>
          <p className="text-slate-600 mb-6">
            Çalışma motivasyonunuzu artırmak için hedefler belirleyin ve ilerlemenizi takip edin.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            İlk Hedefinizi Oluşturun
          </button>
        </div>
      )}
    </div>
  )
}