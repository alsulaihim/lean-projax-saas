import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import prisma from '@/lib/prisma'
import { rateLimitLogin } from '@/lib/rate-limit'

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET environment variable is required')
}

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 login attempts per hour per IP
    const isAllowed = await rateLimitLogin(request)
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in an hour.' },
        { status: 429 }
      )
    }

    const { email, password } = await request.json()

    // Input validation
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    // Query user from database using Prisma connection pool
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        emailVerified: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { 
          error: 'Please verify your email address before signing in. Check your inbox for the verification link.',
          code: 'EMAIL_NOT_VERIFIED'
        },
        { status: 403 } // 403 Forbidden - authenticated but not authorized
      )
    }

    // Create JWT token
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    // Create response with auth cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}