'use client'

import { useState, useEffect } from 'react'

export default function DebugPage() {
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function runTests() {
      const results: any = {}
      
      console.log('🔍 Starting Firebase client tests...')
      
      try {
        // Test 1: Import client
        console.log('Test 1: Importing firebase client...')
        const { firebase } = await import('@/lib/firebase-client')
        results.clientImport = '✅ Success'
        console.log('✅ Client imported successfully')
        
        // Test 2: Basic auth check
        console.log('Test 2: Checking auth...')
        const authResult = await firebase.auth.getUser()
        results.auth = authResult.data?.user ? '✅ Authenticated' : '❌ Not authenticated'
        console.log('Auth result:', authResult)
        
        // Test 3: Test simple query
        console.log('Test 3: Testing profiles query...')
        const profileQuery = firebase.from('profiles').select('*')
        const profileResult = await profileQuery.then()
        results.profileQuery = profileResult.error ? `❌ Error: ${profileResult.error.message}` : `✅ Success (${profileResult.data?.length} items)`
        console.log('Profile query result:', profileResult)
        
        // Test 4: Test demo collection
        console.log('Test 4: Testing demo collection...')
        const demoQuery = firebase.from('tutor_questions').select('*')
        const demoResult = await demoQuery.then()
        results.demoQuery = demoResult.error ? `❌ Error: ${demoResult.error.message}` : `✅ Success (${demoResult.data?.length} items)`
        console.log('Demo query result:', demoResult)
        
        // Test 5: Test complex query (like admin page)
        console.log('Test 5: Testing complex query...')
        const complexQuery = firebase
          .from('tutor_questions')
          .select(`
            *,
            profiles (
              id,
              full_name,
              email
            )
          `)
          .order('created_at', { ascending: false })
        
        const complexResult = await complexQuery.then()
        results.complexQuery = complexResult.error ? `❌ Error: ${complexResult.error.message}` : `✅ Success (${complexResult.data?.length} items)`
        console.log('Complex query result:', complexResult)
        
      } catch (error) {
        console.error('❌ Test failed:', error)
        results.error = `❌ ${error.message}`
      }
      
      setTestResults(results)
      setLoading(false)
    }
    
    runTests()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">🔧 Firebase Debug</h1>
        <p>⏳ Running tests...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">🔧 Firebase Debug Results</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Test Results:</h2>
        <div className="space-y-2">
          {Object.entries(testResults).map(([test, result]) => (
            <div key={test} className="flex justify-between">
              <span className="font-medium">{test}:</span>
              <span>{result}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Browser Console:</h3>
        <p className="text-sm text-gray-600">
          Chrome: F12 → Console tab<br/>
          Safari: Cmd+Option+I → Console tab<br/>
          Firefox: F12 → Console tab
        </p>
        <p className="text-sm mt-2">Console loglarında Firebase client test sonuçlarını görebilirsin.</p>
      </div>
      
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Quick Links:</h3>
        <div className="space-y-1">
          <p><a href="/admin/sorular" className="text-blue-600 hover:underline">→ Admin Sorular</a></p>
          <p><a href="/admin/konular" className="text-blue-600 hover:underline">→ Admin Konular</a></p>
          <p><a href="/admin" className="text-blue-600 hover:underline">→ Admin Ana Sayfa</a></p>
        </div>
      </div>
    </div>
  )
}
