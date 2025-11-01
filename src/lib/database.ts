import { db } from './firebase'
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

// Generic database operations
export const createDocument = async (collectionName: string, data: any) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return { id: docRef.id, error: null }
  } catch (error) {
    return { id: null, error }
  }
}

export const getDocument = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() }, error: null }
    } else {
      return { data: null, error: new Error('Document not found') }
    }
  } catch (error) {
    return { data: null, error }
  }
}

export const updateDocument = async (collectionName: string, id: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, id)
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
    return { error: null }
  } catch (error) {
    return { error }
  }
}

export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    await deleteDoc(doc(db, collectionName, id))
    return { error: null }
  } catch (error) {
    return { error }
  }
}

export const getCollection = async (collectionName: string, constraints?: any[]) => {
  try {
    const collectionRef = collection(db, collectionName)
    const q = constraints ? query(collectionRef, ...constraints) : collectionRef
    const querySnapshot = await getDocs(q)
    
    const docs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return { data: docs, error: null }
  } catch (error) {
    return { data: [], error }
  }
}

// Specific operations for YDS Platform
export const createUserProfile = async (userId: string, profileData: any) => {
  return createDocument('profiles', {
    id: userId,
    ...profileData
  })
}

export const getUserProfile = async (userId: string) => {
  return getDocument('profiles', userId)
}

export const updateUserProfile = async (userId: string, profileData: any) => {
  return updateDocument('profiles', userId, profileData)
}

export const getQuestions = async (category?: string) => {
  const constraints = []
  if (category) {
    constraints.push(where('category', '==', category))
  }
  constraints.push(orderBy('createdAt', 'desc'))
  
  return getCollection('questions', constraints)
}

export const createTestAttempt = async (attemptData: any) => {
  return createDocument('test_attempts', attemptData)
}

export const getTestAttempts = async (userId: string) => {
  const constraints = [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  ]
  
  return getCollection('test_attempts', constraints)
}
