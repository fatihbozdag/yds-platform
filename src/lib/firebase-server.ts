// Firebase Admin SDK for server-side operations
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  if (getApps().length === 0) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }

    return initializeApp({
      credential: cert(serviceAccount),
    })
  }
  return getApps()[0]
}

// Initialize Firebase Admin
const app = initializeFirebaseAdmin()

// Export Firebase Admin services
export const adminAuth = getAuth(app)
export const adminDb = getFirestore(app)

// Server-side authentication utilities
export const createServerSupabase = async () => {
  // This function mimics Supabase's server client for compatibility
  // In Firebase, we use the Admin SDK directly
  return {
    auth: {
      getUser: async (token: string) => {
        try {
          const decodedToken = await adminAuth.verifyIdToken(token)
          return {
            data: { user: decodedToken },
            error: null
          }
        } catch (error) {
          return {
            data: { user: null },
            error
          }
        }
      }
    },
    from: (collection: string) => ({
      select: () => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            try {
              const snapshot = await adminDb.collection(collection)
                .where(column, '==', value)
                .limit(1)
                .get()
              
              if (snapshot.empty) {
                return { data: null, error: null }
              }
              
              const doc = snapshot.docs[0]
              return {
                data: { id: doc.id, ...doc.data() },
                error: null
              }
            } catch (error) {
              return { data: null, error }
            }
          }
        })
      })
    })
  }
}

// Service account client for admin operations
export const getServiceSupabase = () => {
  return {
    auth: adminAuth,
    db: adminDb,
    from: (collection: string) => ({
      select: () => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            try {
              const snapshot = await adminDb.collection(collection)
                .where(column, '==', value)
                .limit(1)
                .get()
              
              if (snapshot.empty) {
                return { data: null, error: null }
              }
              
              const doc = snapshot.docs[0]
              return {
                data: { id: doc.id, ...doc.data() },
                error: null
              }
            } catch (error) {
              return { data: null, error }
            }
          }
        })
      })
    })
  }
}
