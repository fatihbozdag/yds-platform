'use client'

import { useState, useEffect } from 'react'
import { onAuthStateChange, signIn, signUp, logOut, AuthUser } from '../lib/auth'

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    const { user, error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setUser({
        id: user!.uid,
        email: user!.email,
        displayName: user!.displayName
      })
      setLoading(false)
    }
  }

  const handleSignUp = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    const { user, error } = await signUp(email, password)
    
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setUser({
        id: user!.uid,
        email: user!.email,
        displayName: user!.displayName
      })
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    const { error } = await logOut()
    
    if (error) {
      setError(error.message)
    } else {
      setUser(null)
    }
    setLoading(false)
  }

  return {
    user,
    loading,
    error,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut
  }
}
