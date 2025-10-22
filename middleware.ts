import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get auth token from cookies
  const token = request.cookies.get('auth-token')

  // Check if accessing protected routes
  // IMPORTANT: Check demo routes FIRST to avoid matching /demo/assignments with /assignments
  const isDemoRoute = pathname.startsWith('/demo/assignments') || pathname.startsWith('/demo/dashboard')
  const isProtectedRoute = !isDemoRoute && (pathname.startsWith('/assignments') || pathname.startsWith('/dashboard'))

  // If accessing protected routes, verify authentication
  if (isProtectedRoute || isDemoRoute) {
    if (!token) {
      // No token - redirect to appropriate login page
      const redirectUrl = isDemoRoute ? '/demo-login' : '/login'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    try {
      // Verify JWT token
      const { payload } = await jwtVerify(token.value, JWT_SECRET)
      const isDemo = payload.isDemo === true

      // CRITICAL: Enforce demo/normal user separation
      if (isDemoRoute && !isDemo) {
        // Normal user trying to access demo routes - BLOCK
        return NextResponse.redirect(new URL('/assignments', request.url))
      }

      if (isProtectedRoute && isDemo) {
        // Demo user trying to access normal routes - BLOCK
        return NextResponse.redirect(new URL('/demo/assignments', request.url))
      }
    } catch (error) {
      console.error('JWT verification failed:', error)
      // Invalid token - redirect to appropriate login page
      const redirectUrl = isDemoRoute ? '/demo-login' : '/login'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/assignments/:path*',
    '/dashboard/:path*',
    '/demo/assignments/:path*',
    '/demo/dashboard/:path*',
  ]
}
