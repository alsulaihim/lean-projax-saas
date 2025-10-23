import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import prisma from '@/lib/prisma'
import { rateLimitLogin } from '@/lib/rate-limit'
import { loginSchema, formatZodError } from '@/lib/validations/auth'

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

    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      console.error('Failed to parse JSON:', jsonError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Validate input with Zod schema (type-safe validation)
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid input data',
          details: formatZodError(validation.error)
        },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Query user from database using Prisma connection pool
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        emailVerified: true,
        isDemo: true
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

    // IMPORTANT: Demo login page should ONLY allow demo users
    // Normal users must use /login
    if (!user.isDemo) {
      return NextResponse.json(
        {
          error: 'This login page is for demo access only. Please use the regular login page.',
          code: 'NORMAL_USER_BLOCKED'
        },
        { status: 403 }
      )
    }

    // Create JWT token
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isDemo: user.isDemo || false
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
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/' // Ensure cookie is available across all routes
    })

    return response
  } catch (error) {
    console.error('Demo login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
