// Firebase services test functions
import { auth, db } from './firebase'
import { createDocument, getCollection } from './database'

export const testFirebaseAuth = () => {
  console.log('🔥 Firebase Auth Status:', auth.currentUser ? 'Authenticated' : 'Not authenticated')
  return auth.currentUser !== null
}

export const testFirestoreConnection = async () => {
  try {
    // Try to create a test document
    const result = await createDocument('test_collection', {
      message: 'Firebase connection test',
      timestamp: new Date().toISOString()
    })
    
    if (result.error) {
      console.error('❌ Firestore test failed:', result.error)
      return false
    }
    
    console.log('✅ Firestore test successful, document ID:', result.id)
    return true
  } catch (error) {
    console.error('❌ Firestore connection error:', error)
    return false
  }
}

export const testFirebaseServices = async () => {
  console.log('🔥 Testing Firebase services...')
  
  // Test Auth
  const authStatus = testFirebaseAuth()
  console.log('Auth Status:', authStatus ? '✅ Working' : '⚠️ No user authenticated')
  
  // Test Firestore
  const firestoreStatus = await testFirestoreConnection()
  console.log('Firestore Status:', firestoreStatus ? '✅ Working' : '❌ Failed')
  
  // Check environment variables
  const envStatus = !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  )
  console.log('Environment Status:', envStatus ? '✅ Configured' : '❌ Missing vars')
  
  return {
    auth: authStatus,
    firestore: firestoreStatus,
    environment: envStatus,
    overall: firestoreStatus && envStatus
  }
}
