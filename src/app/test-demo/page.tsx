'use client'

import { useState } from 'react'
import { firebase } from '@/lib/firebase-client'
import { isDemoMode } from '@/lib/firebase-demo'

export default function TestDemoPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    try {
      console.log('Testing demo login...')
      const result = await firebase.auth.signInWithPassword({
        email: 'student@demo.com',
        password: 'demo123'
      })
      console.log('Login result:', result)
      setResult(result)
    } catch (error) {
      console.error('Login error:', error)
      setResult({ error: error })
    } finally {
      setLoading(false)
    }
  }

  const testGetUser = async () => {
    setLoading(true)
    try {
      console.log('Testing get user...')
      const result = await firebase.auth.getUser()
      console.log('Get user result:', result)
      setResult(result)
    } catch (error) {
      console.error('Get user error:', error)
      setResult({ error: error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Demo Client Test</h1>
      
      <div className="mb-4">
        <p>Demo Mode: {isDemoMode() ? '✅ Active' : '❌ Inactive'}</p>
      </div>

      <div className="space-x-4 mb-6">
        <button 
          onClick={testLogin}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Testing...' : 'Test Login'}
        </button>
        
        <button 
          onClick={testGetUser}
          disabled={loading}
          className="btn-secondary"
        >
          {loading ? 'Testing...' : 'Test Get User'}
        </button>
      </div>

      {result && (
        <div className="card p-6">
          <h3 className="font-semibold mb-2">Result:</h3>
          <pre className="bg-slate-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}