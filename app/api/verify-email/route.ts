import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyEmailSchema, formatZodError } from '@/lib/validations/auth'
import { sanitizeLog } from '@/lib/api-error-handler'

/**
 * Email Verification API Route
 *
 * Purpose: Verify user's email address using token from verification email
 *
 * Process:
 * 1. Receive verification token
 * 2. Find user with matching token
 * 3. Check token hasn't expired (24 hours)
 * 4. Mark email as verified
 * 5. Clear verification token
 *
 * Security:
 * - Token is cryptographically secure (32 bytes)
 * - Token expires after 24 hours
 * - Token can only be used once
 * - No rate limiting needed (tokens are unique and expire)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input with Zod schema
    const validation = verifyEmailSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid verification token',
          details: formatZodError(validation.error),
        },
        { status: 400 }
      )
    }

    const { token } = validation.data

    // Find user with this verification token
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        verificationExpiry: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid verification token. The link may be incorrect or already used.' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email already verified. You can sign in.' },
        { status: 200 }
      )
    }

    // Check if token has expired
    if (user.verificationExpiry && new Date() > user.verificationExpiry) {
      return NextResponse.json(
        {
          error:
            'Verification link has expired. Please sign up again or request a new verification email.',
        },
        { status: 410 } // 410 Gone - resource no longer available
      )
    }

    // Mark email as verified and clear verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null, // Clear token (can only be used once)
        verificationExpiry: null,
      },
    })

    // Log email verification without exposing PII
    sanitizeLog({ userId: user.id, email: user.email }, 'Email verified')

    return NextResponse.json(
      {
        message: 'Email verified successfully!',
        user: {
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify email. Please try again.' },
      { status: 500 }
    )
  }
}
