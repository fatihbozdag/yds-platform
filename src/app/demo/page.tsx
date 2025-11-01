'use client'

import Link from 'next/link'

export default function DemoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="card p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Demo Mode Not Available</h1>
        <p className="text-slate-600 mb-4">
          Demo mode is currently disabled. Please login with your account.
        </p>
        <Link href="/login" className="btn-primary">
          Go to Login
        </Link>
      </div>
    </div>
  )
}
