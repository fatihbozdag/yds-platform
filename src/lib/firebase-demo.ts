// Demo mode Firebase client wrapper
import { DemoDataStore } from './demo-data'
import type { Profile } from '@/types'

// Check if we're in demo mode (when using demo mode flag)
export const isDemoMode = () => {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
}

// Demo Firebase client that mimics the real API
export class DemoFirebaseClient {
  private demoStore = DemoDataStore.getInstance()

  auth = {
    getUser: async () => {
      const user = this.demoStore.getCurrentUser()
      return {
        data: {
          user: user ? {
            id: user.id,
            email: user.email,
            user_metadata: { full_name: user.full_name }
          } : null
        },
        error: null
      }
    },

    signInWithPassword: async ({ email, password }: { email: string, password: string }) => {
      // Demo credentials
      console.log('Demo login attempt:', email, password)
      
      if ((email === 'student@demo.com' && password === 'demo123') ||
          (email === 'admin@demo.com' && password === 'admin123')) {
        const user = await this.demoStore.signIn(email)
        console.log('Demo login successful for user:', user)
        
        return {
          data: {
            user: user ? {
              id: user.id,
              email: user.email,
              user_metadata: { full_name: user.full_name }
            } : null,
            session: {
              access_token: 'demo-token',
              user: {
                id: user?.id,
                email: user?.email,
                user_metadata: { full_name: user?.full_name }
              }
            }
          },
          error: null
        }
      }
      
      console.log('Demo login failed - invalid credentials')
      return {
        data: { user: null, session: null },
        error: { message: 'Invalid credentials. Use student@demo.com/demo123 or admin@demo.com/admin123' }
      }
    },

    signUp: async ({ email, password, options }: any) => {
      // For demo, just create a temporary user
      const newUser = {
        id: `user-${Date.now()}`,
        email: email,
        full_name: options?.data?.full_name || email,
        role: 'student' as const,
        created_at: new Date().toISOString()
      }
      
      await this.demoStore.signIn(email)
      
      return {
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            user_metadata: { full_name: newUser.full_name }
          }
        },
        error: null
      }
    },

    signOut: async () => {
      await this.demoStore.signOut()
      return { error: null }
    }
  }

  from = (table: string) => {
    const demoStore = this.demoStore
    const currentUser = demoStore.getCurrentUser()

    return {
      select: (columns: string = '*') => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            switch (table) {
              case 'profiles':
                if (column === 'id') {
                  console.log('Looking for profile with id:', value, 'currentUser:', currentUser)
                  const user = currentUser?.id === value ? currentUser : null
                  return { data: user, error: null }
                }
                break
              case 'topics':
                if (column === 'slug') {
                  const topic = demoStore.getTopicBySlug(value)
                  return { data: topic, error: null }
                }
                break
              case 'exams':
                if (column === 'id') {
                  const exam = demoStore.getExamById(value)
                  return { data: exam, error: null }
                }
                break
            }
            return { data: null, error: null }
          },
          order: (orderColumn: string, options?: any) => {
            const buildData = (): any[] => {
              let data: any[] = []
              switch (table) {
                case 'topics':
                  data = demoStore.getTopics()
                  break
                case 'exams':
                  data = demoStore.getExams()
                  break
                case 'questions':
                  if (orderColumn === 'order_index') {
                    data = demoStore.getQuestionsByExamId(value)
                  }
                  break
                case 'exam_results':
                  if (currentUser) {
                    data = demoStore.getExamResults(currentUser.id)
                  }
                  break
                case 'tutor_questions':
                  if (currentUser) {
                    data = demoStore.getTutorQuestions(currentUser.id)
                  }
                  break
                case 'bookmarked_topics':
                  if (currentUser) {
                    data = demoStore.getBookmarkedTopics(currentUser.id)
                  }
                  break
                case 'study_goals':
                  if (currentUser) {
                    data = demoStore.getStudyGoals(currentUser.id)
                  }
                  break
                case 'study_reminders':
                  if (currentUser) {
                    data = demoStore.getStudyReminders(currentUser.id)
                  }
                  break
              }
              // Basic ordering support by date-like field
              if (orderColumn && Array.isArray(data)) {
                const ascending = options?.ascending ?? false
                data = [...data].sort((a, b) => {
                  const av = new Date(a[orderColumn] ?? 0).getTime()
                  const bv = new Date(b[orderColumn] ?? 0).getTime()
                  return ascending ? av - bv : bv - av
                })
              }
              return data
            }

            const thenable = {
              then: async (resolve: any) => {
                const data = buildData()
                resolve({ data, error: null })
              },
              catch: (handler: any) => Promise.resolve({ data: [], error: null }).catch(handler),
              limit: (count: number) => ({
                then: async (resolve: any) => {
                  const data = buildData().slice(0, count)
                  resolve({ data, error: null })
                },
                catch: (handler: any) => Promise.resolve({ data: [], error: null }).catch(handler),
              }),
            }
            return thenable
          }
        }),
        order: (column: string, options?: any) => {
          return Promise.resolve().then(async () => {
            let data: any[] = []
            switch (table) {
              case 'topics':
                data = demoStore.getTopics()
                break
              case 'exams':
                data = demoStore.getExams()
                break
              case 'questions':
                data = demoStore.getQuestionsByExamId('exam-1') // Default to first exam
                break
              case 'exam_results':
                if (currentUser) {
                  data = demoStore.getExamResults(currentUser.id)
                }
                break
              case 'tutor_questions':
                if (currentUser) {
                  data = demoStore.getTutorQuestions(currentUser.id)
                }
                break
              case 'bookmarked_topics':
                if (currentUser) {
                  data = demoStore.getBookmarkedTopics(currentUser.id)
                }
                break
              case 'study_goals':
                if (currentUser) {
                  data = demoStore.getStudyGoals(currentUser.id)
                }
                break
              case 'study_reminders':
                if (currentUser) {
                  data = demoStore.getStudyReminders(currentUser.id)
                }
                break
            }
            return { data, error: null }
          })
        }
      }),

      insert: (values: any) => ({
        select: () => ({
          single: async () => {
            switch (table) {
              case 'exam_results':
                const result = await demoStore.createExamResult(values)
                return { data: result, error: null }
              case 'tutor_questions':
                const question = await demoStore.createTutorQuestion(values)
                return { data: question, error: null }
              case 'bookmarked_topics':
                const bookmark = await demoStore.createBookmark(values)
                return { data: bookmark, error: null }
              case 'study_goals':
                const goal = await demoStore.createStudyGoal(values)
                return { data: goal, error: null }
              case 'study_reminders':
                const reminder = await demoStore.createStudyReminder(values)
                return { data: reminder, error: null }
              default:
                return { data: values, error: null }
            }
          }
        }),
        then: async (resolve: any) => {
          resolve({ data: null, error: null })
        }
      }),

      update: () => ({
        eq: () => ({
          then: async (resolve: any) => {
            resolve({ data: null, error: null })
          }
        })
      }),

      delete: () => ({
        eq: (column: string, value: any) => ({
          then: async (resolve: any) => {
            if (table === 'bookmarked_topics' && column === 'student_id') {
              // This is a complex query, we'll handle it differently
              resolve({ data: null, error: null })
            }
            resolve({ data: null, error: null })
          }
        })
      })
    }
  }

  storage = {
    from: () => ({
      upload: async () => ({ data: { path: 'demo-image.jpg' }, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '/demo-image.jpg' } })
    })
  }
}

// Export the appropriate client based on demo mode
let firebaseClient: any

if (isDemoMode()) {
  console.log('🎯 Running in DEMO MODE - Using demo data instead of Firebase')
  firebaseClient = new DemoFirebaseClient()
} else {
  // Use Firebase client
  console.log('🔥 Running with FIREBASE - Using Firebase client')
  const { firebase } = require('./firebase-client-simple')
  firebaseClient = firebase
}

export const firebase = firebaseClient