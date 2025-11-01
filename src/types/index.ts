export interface Profile {
  id: string
  email: string
  full_name: string
  role: 'student' | 'admin'
  created_at: string
}

export interface Topic {
  id: string
  title: string
  slug: string
  content: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface Exam {
  id: string
  title: string
  description?: string
  topic_id?: string
  duration_minutes: number
  total_questions: number
  created_at: string
}

export interface Question {
  id: string
  exam_id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  option_e: string
  correct_answer: 'A' | 'B' | 'C' | 'D' | 'E'
  explanation: string
  order_index: number
  image_url?: string
}

export interface ExamResult {
  id: string
  student_id: string
  exam_id: string
  score: number
  correct_count: number
  wrong_count: number
  empty_count: number
  answers: Record<string, string>
  started_at: string
  completed_at: string
}

export interface TutorQuestion {
  id: string
  student_id: string
  question_text: string
  image_url?: string
  status: 'pending' | 'answered' | 'closed'
  admin_response?: string
  created_at: string
  answered_at?: string
}

export interface BookmarkedTopic {
  id: string
  student_id: string
  topic_id: string
  created_at: string
}

export interface StudyGoal {
  id: string
  student_id: string
  title: string
  description?: string
  target_type: 'daily_time' | 'weekly_exams' | 'weekly_topics' | 'target_score'
  target_value: number
  current_value: number
  deadline?: string
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface StudyReminder {
  id: string
  student_id: string
  title: string
  message: string
  reminder_type: 'daily' | 'weekly' | 'custom'
  reminder_time: string // Format: "HH:MM"
  days_of_week?: number[] // [0-6] Sunday=0, Monday=1, etc.
  is_active: boolean
  created_at: string
}