import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { rateLimitSignup } from '@/lib/rate-limit'
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email'
import { signupSchema, formatZodError } from '@/lib/validations/auth'

/**
 * User Signup API Route
 * 
 * Purpose: Handle new user registration
 * 
 * Request Body:
 * - email: string (required, unique)
 * - name: string (required)
 * - password: string (required, min 8 chars)
 * - companyName: string (optional)
 * 
 * Process:
 * 1. Validate input data
 * 2. Check if email already exists
 * 3. Hash password using bcrypt
 * 4. Create user with default settings:
 *    - Role: BPI_TEAM
 *    - Subscription: FREE tier
 *    - Status: TRIAL
 *    - Trial: 14 days from now
 * 5. Return success or error
 * 
 * Security:
 * - Password hashed with bcrypt (10 rounds)
 * - Email uniqueness enforced by database
 * - Input validation on server side
 * 
 * Error Codes:
 * - 400: Invalid input
 * - 409: Email already exists
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 signups per hour per IP
    const isAllowed = await rateLimitSignup(request)
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    
    // Validate input with Zod schema (type-safe validation)
    const validation = signupSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input data',
          details: formatZodError(validation.error)
        },
        { status: 400 }
      )
    }

    const { email, name, password, companyName } = validation.data

    // Check if user already exists (email already lowercased and trimmed by Zod)
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password with bcrypt (10 rounds for security/performance balance)
    const passwordHash = await bcrypt.hash(password, 10)

    // Calculate trial end date (14 days from now)
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 14)

    // Generate email verification token
    const verificationToken = generateVerificationToken()
    const verificationExpiry = new Date()
    verificationExpiry.setHours(verificationExpiry.getHours() + 24) // Expires in 24 hours

    // Create new user with default settings (email and name already processed by Zod)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        companyName,
        role: 'BPI_TEAM', // Default role for new users
        subscriptionTier: 'FREE', // Start with free tier
        subscriptionStatus: 'TRIAL', // 14-day trial
        trialEndsAt,
        emailVerified: false, // Must verify email before login
        verificationToken,
        verificationExpiry
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        createdAt: true
      }
    })

    console.log('✅ New user created:', {
      id: user.id,
      email: user.email,
      tier: user.subscriptionTier,
      trialEnds: user.trialEndsAt,
      emailVerified: user.emailVerified
    })

    // Send verification email
    const emailSent = await sendVerificationEmail(user.email, user.name, verificationToken)
    
    if (!emailSent) {
      console.warn('⚠️  Failed to send verification email, but user was created')
    }

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    
    // Handle Prisma unique constraint violation (shouldn't happen due to check above)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}

