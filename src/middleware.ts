import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Check if we're in demo mode
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  if (isDemoMode) {
    // In demo mode, allow access to all routes
    // Also disable caching for login to avoid stale HTML/CSS during iteration
    if (path.startsWith('/login')) {
      const res = NextResponse.next()
      res.headers.set('Cache-Control', 'no-store')
      return res
    }
    return NextResponse.next()
  }

  // For Firebase, we'll handle authentication on the client side
  // since Firebase Auth tokens are typically handled client-side
  // and server-side verification requires the Admin SDK
  
  // Define route patterns
  const authPaths = ['/login', '/register']
  const protectedPaths = ['/dashboard', '/konular', '/sinavlar', '/ilerleme', '/egitmene-sor', '/hedefler', '/bildirimler', '/favoriler', '/analitik']
  const adminPaths = ['/admin']

  // For now, we'll allow all routes and handle authentication client-side
  // In production, you might want to implement server-side token verification
  
  // If user is logged in and tries to access auth pages, redirect to dashboard
  // This will be handled client-side in the layout components
  
  // If user is not logged in and tries to access protected pages, redirect to login
  // This will be handled client-side in the layout components

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}