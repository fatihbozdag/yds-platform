import { NextResponse } from 'next/server'
import { firebase } from '@/lib/firebase-client'

export async function GET() {
  try {
    const { data, error } = await firebase.auth.signInWithPassword({
      email: 'student@demo.com',
      password: 'demo123',
    })

    if (error) {
      return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
    }

    // Fetch profile like the login page does
    const profileRes = await firebase
      .from('profiles')
      .select('role')
      .eq('id', data?.user?.id)
      .single()

    return NextResponse.json({ ok: true, user: data?.user, profile: profileRes.data })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}


