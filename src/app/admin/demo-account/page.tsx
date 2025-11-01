'use client'

import { useState } from 'react'
import { firebase } from '@/lib/firebase-client'
import { useRouter } from 'next/navigation'

export default function DemoAccountPage() {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [status, setStatus] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<{email: string, password: string} | null>(null)

  const addStatus = (message: string) => {
    setStatus(prev => [...prev, message])
  }

  const createDemoAccount = async () => {
    setCreating(true)
    setError(null)
    setStatus([])
    setCredentials(null)

    try {
      addStatus('🚀 Creating demo student account...')

      // Demo account credentials
      const demoEmail = 'demo@yds-platform.com'
      const demoPassword = 'demo123456'
      const demoName = 'Demo Öğrenci'

      addStatus('📧 Checking if demo account already exists...')

      // Check if account already exists
      const { data: existingUser } = await firebase
        .from('profiles')
        .select('*')
        .eq('email', demoEmail)
        .single()

      if (existingUser) {
        addStatus('⚠️ Demo account already exists!')
        addStatus(`📧 Email: ${demoEmail}`)
        addStatus(`🔑 Password: ${demoPassword}`)
        setCredentials({ email: demoEmail, password: demoPassword })
        return
      }

      addStatus('✓ No existing demo account found')
      addStatus('📝 Creating new user in Firebase Auth...')

      // Create user in Firebase Auth
      const { data: authData, error: authError } = await firebase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
        options: {
          data: {
            full_name: demoName
          }
        }
      })

      if (authError) {
        throw new Error(`Auth error: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('User creation failed - no user returned')
      }

      addStatus(`✓ User created with ID: ${authData.user.id}`)
      addStatus('👤 Creating student profile...')

      // Create profile
      const { error: profileError } = await firebase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: demoEmail,
          full_name: demoName,
          role: 'student'
        })

      if (profileError) {
        throw new Error(`Profile error: ${profileError.message}`)
      }

      addStatus('✓ Student profile created')
      addStatus('\n✅ Demo account successfully created!')
      addStatus('\n📋 Demo Account Credentials:')
      addStatus(`📧 Email: ${demoEmail}`)
      addStatus(`🔑 Password: ${demoPassword}`)

      setCredentials({ email: demoEmail, password: demoPassword })

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      addStatus(`\n✗ Error: ${errorMsg}`)
    } finally {
      setCreating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    addStatus(`📋 Copied: ${text}`)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Demo Öğrenci Hesabı Oluştur</h1>
        <p className="text-slate-600">
          Platform için demo öğrenci hesabı oluşturun
        </p>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Demo Hesap Bilgileri</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold w-24">Email:</span>
            <code className="bg-slate-100 px-3 py-1 rounded">demo@yds-platform.com</code>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold w-24">Password:</span>
            <code className="bg-slate-100 px-3 py-1 rounded">demo123456</code>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold w-24">Rol:</span>
            <span className="badge bg-green-100 text-green-800">Student</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold w-24">Ad Soyad:</span>
            <span>Demo Öğrenci</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-semibold">❌ Hata</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {credentials && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 font-semibold mb-3">✅ Demo Hesap Hazır!</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <code className="bg-white px-3 py-2 rounded flex-1 text-sm">
                {credentials.email}
              </code>
              <button
                onClick={() => copyToClipboard(credentials.email)}
                className="btn-secondary btn-sm"
              >
                📋 Kopyala
              </button>
            </div>
            <div className="flex items-center gap-2">
              <code className="bg-white px-3 py-2 rounded flex-1 text-sm">
                {credentials.password}
              </code>
              <button
                onClick={() => copyToClipboard(credentials.password)}
                className="btn-secondary btn-sm"
              >
                📋 Kopyala
              </button>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <a
              href="/login"
              className="btn-primary w-full text-center inline-block"
            >
              🔐 Giriş Sayfasına Git
            </a>
          </div>
        </div>
      )}

      {status.length > 0 && (
        <div className="card p-4 mb-6">
          <h3 className="font-semibold mb-2">İşlem Durumu:</h3>
          <div className="bg-slate-900 text-green-400 p-4 rounded font-mono text-xs max-h-96 overflow-y-auto">
            {status.map((msg, idx) => (
              <div key={idx}>{msg}</div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={createDemoAccount}
          disabled={creating}
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? '⏳ Oluşturuluyor...' : '🎓 Demo Hesap Oluştur'}
        </button>
        <button
          onClick={() => router.push('/admin')}
          className="btn-secondary"
        >
          ← Admin Paneline Dön
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Not:</strong> Bu işlem Firebase Auth ve profiles tablosunda demo öğrenci hesabı oluşturacaktır.
          Hesap zaten mevcutsa bilgiler gösterilecektir.
        </p>
      </div>
    </div>
  )
}
