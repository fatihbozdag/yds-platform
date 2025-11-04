// Firebase client wrapper that mimics Supabase API structure
import { 
  auth, 
  db, 
  storage 
} from './firebase-config'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendEmailVerification
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
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage'

// Types for compatibility with existing code
export interface FirebaseResponse<T> {
  data: T | null
  error: Error | null
}

export interface FirebaseQueryBuilder {
  select(columns?: string): FirebaseQueryBuilder
  eq(column: string, value: string | number | boolean): FirebaseQueryBuilder
  order(column: string, options?: { ascending?: boolean }): FirebaseQueryBuilder
  limit(count: number): FirebaseQueryBuilder
  single(): Promise<FirebaseResponse<Record<string, unknown>>>
  then(callback: (result: FirebaseResponse<Record<string, unknown>[]>) => void): Promise<FirebaseResponse<Record<string, unknown>[]>>
}

// Firebase client that mimics Supabase API
export class FirebaseClient {
  auth = {
    getUser: async (): Promise<FirebaseResponse<{ user: Record<string, unknown> | null }>> => {
      try {
        return new Promise((resolve) => {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe()
            resolve({
              data: { user: user ? this.formatUser(user) : null },
              error: null
            })
          })
        })
      } catch (error) {
        return { data: { user: null }, error }
      }
    },

    signInWithPassword: async ({ 
      email, 
      password 
    }: { 
      email: string
      password: string 
    }): Promise<FirebaseResponse<{ user: any, session: any }>> => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error('Email not confirmed')
        }

        return {
          data: {
            user: this.formatUser(user),
            session: {
              access_token: await user.getIdToken(),
              user: this.formatUser(user)
            }
          },
          error: null
        }
      } catch (error) {
        return { data: { user: null, session: null }, error }
      }
    },

    signUp: async ({ 
      email, 
      password, 
      options 
    }: { 
      email: string
      password: string
      options?: { data?: { full_name?: string } }
    }): Promise<FirebaseResponse<{ user: any }>> => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Update profile with full name if provided
        if (options?.data?.full_name) {
          await updateProfile(user, { displayName: options.data.full_name })
        }

        // Send email verification
        await sendEmailVerification(user, {
          url: 'https://yds-yokdil.netlify.app/login',
          handleCodeInApp: false
        })

        // Create user profile in Firestore
        await addDoc(collection(db, 'profiles'), {
          id: user.uid,
          email: user.email,
          full_name: options?.data?.full_name || user.email,
          role: 'student',
          created_at: serverTimestamp()
        })

        return {
          data: { user: this.formatUser(user) },
          error: null
        }
      } catch (error) {
        return { data: { user: null }, error }
      }
    },

    signOut: async (): Promise<{ error: any }> => {
      try {
        await signOut(auth)
        return { error: null }
      } catch (error) {
        return { error }
      }
    }
  }

  from = (table: string) => {
    return {
      select: (columns: string = '*'): FirebaseQueryBuilder => {
        const collectionRef = collection(db, table)
        
        return {
          select: () => this,
          eq: (column: string, value: any): FirebaseQueryBuilder => {
            const q = query(collectionRef, where(column, '==', value))
            
            return {
              select: () => this,
              eq: () => this,
              order: () => this,
              limit: () => this,
              single: async (): Promise<FirebaseResponse<any>> => {
                try {
                  const querySnapshot = await getDocs(q)
                  if (querySnapshot.empty) {
                    return { data: null, error: null }
                  }
                  const doc = querySnapshot.docs[0]
                  return { data: { id: doc.id, ...doc.data() }, error: null }
                } catch (error) {
                  return { data: null, error }
                }
              },
              order: (orderColumn: string, options?: { ascending?: boolean }): FirebaseQueryBuilder => {
                const orderedQuery = query(q, orderBy(orderColumn, options?.ascending ? 'asc' : 'desc'))
                
                return {
                  select: () => this,
                  eq: () => this,
                  order: () => this,
                  limit: () => this,
                  single: async () => ({ data: null, error: null }),
                  then: async (callback: (result: FirebaseResponse<any[]>) => void): Promise<FirebaseResponse<any[]>> => {
                    try {
                      const querySnapshot = await getDocs(orderedQuery)
                      const data = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                      }))
                      const result = { data, error: null }
                      callback(result)
                      return result
                    } catch (error) {
                      const result = { data: [], error }
                      callback(result)
                      return result
                    }
                  }
                }
              },
              limit: (count: number): FirebaseQueryBuilder => {
                const limitedQuery = query(q, limit(count))
                
                return {
                  select: () => this,
                  eq: () => this,
                  order: () => this,
                  limit: () => this,
                  single: async () => ({ data: null, error: null }),
                  then: async (callback: (result: FirebaseResponse<any[]>) => void): Promise<FirebaseResponse<any[]>> => {
                    try {
                      const querySnapshot = await getDocs(limitedQuery)
                      const data = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                      }))
                      const result = { data, error: null }
                      callback(result)
                      return result
                    } catch (error) {
                      const result = { data: [], error }
                      callback(result)
                      return result
                    }
                  }
                }
              },
              then: async (callback: (result: FirebaseResponse<any[]>) => void): Promise<FirebaseResponse<any[]>> => {
                try {
                  const querySnapshot = await getDocs(q)
                  const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                  }))
                  const result = { data, error: null }
                  callback(result)
                  return result
                } catch (error) {
                  const result = { data: [], error }
                  callback(result)
                  return result
                }
              }
            }
          },
          order: (column: string, options?: { ascending?: boolean }): FirebaseQueryBuilder => {
            const q = query(collectionRef, orderBy(column, options?.ascending ? 'asc' : 'desc'))
            
            return {
              select: () => this,
              eq: () => this,
              order: () => this,
              limit: () => this,
              single: async () => ({ data: null, error: null }),
              then: async (callback: (result: FirebaseResponse<any[]>) => void): Promise<FirebaseResponse<any[]>> => {
                try {
                  const querySnapshot = await getDocs(q)
                  const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                  }))
                  const result = { data, error: null }
                  callback(result)
                  return result
                } catch (error) {
                  const result = { data: [], error }
                  callback(result)
                  return result
                }
              }
            }
          },
          limit: (count: number): FirebaseQueryBuilder => {
            const q = query(collectionRef, limit(count))
            
            return {
              select: () => this,
              eq: () => this,
              order: () => this,
              limit: () => this,
              single: async () => ({ data: null, error: null }),
              then: async (callback: (result: FirebaseResponse<any[]>) => void): Promise<FirebaseResponse<any[]>> => {
                try {
                  const querySnapshot = await getDocs(q)
                  const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                  }))
                  const result = { data, error: null }
                  callback(result)
                  return result
                } catch (error) {
                  const result = { data: [], error }
                  callback(result)
                  return result
                }
              }
            }
          },
          single: async (): Promise<FirebaseResponse<any>> => {
            try {
              const querySnapshot = await getDocs(collectionRef)
              if (querySnapshot.empty) {
                return { data: null, error: null }
              }
              const doc = querySnapshot.docs[0]
              return { data: { id: doc.id, ...doc.data() }, error: null }
            } catch (error) {
              return { data: null, error }
            }
          },
          then: async (callback: (result: FirebaseResponse<any[]>) => void): Promise<FirebaseResponse<any[]>> => {
            try {
              const querySnapshot = await getDocs(collectionRef)
              const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }))
              const result = { data, error: null }
              callback(result)
              return result
            } catch (error) {
              const result = { data: [], error }
              callback(result)
              return result
            }
          }
        }
      },

      insert: (values: any) => ({
        select: () => ({
          single: async (): Promise<FirebaseResponse<any>> => {
            try {
              const docRef = await addDoc(collection(db, table), {
                ...values,
                created_at: serverTimestamp()
              })
              return { data: { id: docRef.id, ...values }, error: null }
            } catch (error) {
              return { data: null, error }
            }
          }
        }),
        then: async (callback: (result: FirebaseResponse<any>) => void): Promise<FirebaseResponse<any>> => {
          try {
            const docRef = await addDoc(collection(db, table), {
              ...values,
              created_at: serverTimestamp()
            })
            const result = { data: { id: docRef.id, ...values }, error: null }
            callback(result)
            return result
          } catch (error) {
            const result = { data: null, error }
            callback(result)
            return result
          }
        }
      }),

      update: (values: any) => ({
        eq: (column: string, value: any) => ({
          then: async (callback?: (result: FirebaseResponse<any>) => void): Promise<FirebaseResponse<any>> => {
            try {
              const q = query(collection(db, table), where(column, '==', value))
              const querySnapshot = await getDocs(q)
              
              if (querySnapshot.empty) {
                const result = { data: null, error: { message: 'Document not found' } }
                if (callback) callback(result)
                return result
              }

              const docRef = doc(db, table, querySnapshot.docs[0].id)
              await updateDoc(docRef, {
                ...values,
                updated_at: serverTimestamp()
              })

              const result = { data: { id: querySnapshot.docs[0].id, ...values }, error: null }
              if (callback) callback(result)
              return result
            } catch (error) {
              const result = { data: null, error }
              if (callback) callback(result)
              return result
            }
          }
        })
      }),

      delete: () => ({
        eq: (column: string, value: any) => ({
          then: async (callback?: (result: FirebaseResponse<any>) => void): Promise<FirebaseResponse<any>> => {
            try {
              const q = query(collection(db, table), where(column, '==', value))
              const querySnapshot = await getDocs(q)
              
              if (querySnapshot.empty) {
                const result = { data: null, error: { message: 'Document not found' } }
                if (callback) callback(result)
                return result
              }

              await deleteDoc(doc(db, table, querySnapshot.docs[0].id))

              const result = { data: null, error: null }
              if (callback) callback(result)
              return result
            } catch (error) {
              const result = { data: null, error }
              if (callback) callback(result)
              return result
            }
          }
        })
      })
    }
  }

  storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: File): Promise<FirebaseResponse<{ path: string }>> => {
        try {
          const storageRef = ref(storage, `${bucket}/${path}`)
          await uploadBytes(storageRef, file)
          return { data: { path }, error: null }
        } catch (error) {
          return { data: null, error }
        }
      },
      getPublicUrl: (path: string): { data: { publicUrl: string } } => {
        const storageRef = ref(storage, `${bucket}/${path}`)
        return { data: { publicUrl: `gs://${storageRef.bucket}/${storageRef.fullPath}` } }
      }
    })
  }

  private formatUser(user: FirebaseUser) {
    return {
      id: user.uid,
      email: user.email,
      user_metadata: {
        full_name: user.displayName || user.email
      }
    }
  }
}

// Export Firebase client instance
let firebaseClient: any

if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  firebaseClient = require('./firebase-demo').firebase
} else {
  firebaseClient = new FirebaseClient()
}

export const firebase = firebaseClient
