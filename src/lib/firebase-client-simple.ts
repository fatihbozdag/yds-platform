// Simple Firebase client that mimics basic Supabase API
import { auth, db } from './firebase'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore'

interface SupabaseCompatibleResponse<T> {
  data: T | null
  error: any
}

// Demo data for missing collections
const DEMO_DATA = {
  'tutor_questions': [
    {
      id: '1',
      student_id: '8SL2Eq5KcvZQnhmJxeI8rhD9Epv1',
      question_text: 'Reading comprehension konusunda zorlanıyorum. Hangi stratejileri önerirsiniz?',
      category: 'reading',
      status: 'pending',
      created_at: new Date('2025-09-20').toISOString(),
      updated_at: new Date('2025-09-20').toISOString(),
      profiles: {
        id: '8SL2Eq5KcvZQnhmJxeI8rhD9Epv1',
        full_name: 'Fatih Bozdag',
        email: 'fbozdag1989@gmail.com'
      }
    },
    {
      id: '2', 
      student_id: 'student-123',
      question_text: 'Grammar konularında hangi kaynaklardan çalışabilirim?',
      category: 'grammar',
      status: 'answered',
      created_at: new Date('2025-09-18').toISOString(),
      updated_at: new Date('2025-09-19').toISOString(),
      admin_response: 'Grammar konuları için önerilen kaynaklar...',
      responded_at: new Date('2025-09-19').toISOString(),
      profiles: {
        id: 'student-123',
        full_name: 'Demo Student',
        email: 'student@demo.com'
      }
    }
  ],
  'questions': [
    {
      id: '1',
      question_text: 'What is the main idea of the passage?',
      options: ['A) Option A', 'B) Option B', 'C) Option C', 'D) Option D'],
      correct_answer: 'A',
      category: 'reading',
      difficulty: 'medium',
      created_at: new Date().toISOString(),
      created_by: '8SL2Eq5KcvZQnhmJxeI8rhD9Epv1'
    }
  ],
  'exams': [
    {
      id: '1',
      title: 'YDS Deneme Sınavı 1',
      description: 'Reading ve Grammar sorularından oluşan deneme sınavı',
      question_count: 80,
      duration_minutes: 180,
      is_active: true,
      created_at: new Date().toISOString(),
      created_by: '8SL2Eq5KcvZQnhmJxeI8rhD9Epv1'
    }
  ],
  'topics': [
    {
      id: '1',
      title: 'Reading Comprehension',
      description: 'Okuma anlama stratejileri ve teknikleri',
      category: 'reading',
      order: 1,
      is_active: true,
      created_at: new Date().toISOString()
    }
  ]
}

// Simple query builder
class FirebaseQueryBuilder {
  private collectionName: string
  private orderField: string | null = null
  private orderDirection: 'asc' | 'desc' = 'desc'
  private whereConstraints: Array<{field: string, value: any}> = []
  
  constructor(collectionName: string) {
    this.collectionName = collectionName
  }

  select(columns: string = '*') {
    // Ignore complex selects with joins for now, Firebase doesn't support them
    return this
  }

  eq(column: string, value: any) {
    this.whereConstraints.push({field: column, value})
    return this
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderField = column
    this.orderDirection = options?.ascending ? 'asc' : 'desc'
    return this
  }

  limit(count: number) {
    // Store limit for later use
    return this
  }

  async single(): Promise<SupabaseCompatibleResponse<any>> {
    console.log(`🔍 FirebaseQueryBuilder.single() for ${this.collectionName}`)
    
    try {
      // Check for demo data first
      if (DEMO_DATA[this.collectionName]) {
        console.log(`📦 Using demo data for ${this.collectionName}`)
        const data = DEMO_DATA[this.collectionName]
        return { data: data[0] || null, error: null }
      }

      // Try Firebase query
      console.log(`🔥 Querying Firebase collection: ${this.collectionName}`)
      const constraints = this.whereConstraints.map(w => where(w.field, '==', w.value))
      if (this.orderField) {
        constraints.push(orderBy(this.orderField, this.orderDirection))
      }
      
      const q = query(collection(db, this.collectionName), ...constraints)
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        console.log(`📭 No documents found in ${this.collectionName}`)
        return { data: null, error: null }
      }
      
      const doc = querySnapshot.docs[0]
      const result = { id: doc.id, ...doc.data() }
      console.log(`✅ Found document in ${this.collectionName}:`, result)
      return { data: result, error: null }
      
    } catch (error) {
      console.error(`❌ Error in single() for ${this.collectionName}:`, error)
      return { data: null, error }
    }
  }

  // This is the key method that was hanging!
  then(callback?: (result: SupabaseCompatibleResponse<any[]>) => void): Promise<SupabaseCompatibleResponse<any[]>> {
    console.log(`🔍 FirebaseQueryBuilder.then() for ${this.collectionName}`)
    
    return new Promise(async (resolve) => {
      try {
        // Check for demo data first
        if (DEMO_DATA[this.collectionName]) {
          console.log(`📦 Using demo data for ${this.collectionName}`)
          let data = [...DEMO_DATA[this.collectionName]]
          
          // Apply ordering to demo data
          if (this.orderField === 'created_at') {
            data.sort((a, b) => {
              const dateA = new Date(a.created_at).getTime()
              const dateB = new Date(b.created_at).getTime()
              return this.orderDirection === 'desc' ? dateB - dateA : dateA - dateB
            })
          }
          
          const result = { data, error: null }
          console.log(`✅ Returning demo data for ${this.collectionName}:`, result)
          
          if (callback) callback(result)
          resolve(result)
          return
        }

        // Try Firebase query
        console.log(`🔥 Querying Firebase collection: ${this.collectionName}`)
        const constraints = this.whereConstraints.map(w => where(w.field, '==', w.value))
        if (this.orderField) {
          constraints.push(orderBy(this.orderField, this.orderDirection))
        }
        
        const q = constraints.length > 0 
          ? query(collection(db, this.collectionName), ...constraints)
          : collection(db, this.collectionName)
        
        const querySnapshot = await getDocs(q)
        
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        const result = { data: docs, error: null }
        console.log(`✅ Firebase query result for ${this.collectionName}:`, result)
        
        if (callback) callback(result)
        resolve(result)
        
      } catch (error) {
        console.error(`❌ Error in then() for ${this.collectionName}:`, error)
        const result = { data: [], error }
        if (callback) callback(result)
        resolve(result)
      }
    })
  }
}

// Simple Firebase client that provides Supabase-like interface
export const firebase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string, password: string }): Promise<SupabaseCompatibleResponse<any>> => {
      try {
        const result = await signInWithEmailAndPassword(auth, email, password)
        return {
          data: {
            user: {
              id: result.user.uid,
              email: result.user.email,
              user_metadata: { full_name: result.user.displayName }
            },
            session: { access_token: await result.user.getIdToken() }
          },
          error: null
        }
      } catch (error) {
        return { data: null, error }
      }
    },

    signUp: async ({ email, password, options }: { email: string, password: string, options?: any }): Promise<SupabaseCompatibleResponse<any>> => {
      try {
        const result = await createUserWithEmailAndPassword(auth, email, password)
        
        // Create user profile in Firestore
        if (options?.data) {
          await addDoc(collection(db, 'profiles'), {
            id: result.user.uid,
            ...options.data,
            created_at: serverTimestamp()
          })
        }

        return {
          data: {
            user: {
              id: result.user.uid,
              email: result.user.email,
              user_metadata: options?.data || {}
            }
          },
          error: null
        }
      } catch (error) {
        return { data: null, error }
      }
    },

    signOut: async (): Promise<{ error: any }> => {
      try {
        await signOut(auth)
        return { error: null }
      } catch (error) {
        return { error }
      }
    },

    getUser: async (): Promise<SupabaseCompatibleResponse<any>> => {
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe()
          if (user) {
            resolve({
              data: {
                user: {
                  id: user.uid,
                  email: user.email,
                  user_metadata: { full_name: user.displayName }
                }
              },
              error: null
            })
          } else {
            resolve({ data: { user: null }, error: null })
          }
        })
      })
    }
  },

  from: (table: string) => {
    console.log(`🏗️ Creating query builder for table: ${table}`)
    return new FirebaseQueryBuilder(table)
  }
}
