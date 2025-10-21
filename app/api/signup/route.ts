import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

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
    const body = await request.json()
    const { email, name, password, companyName } = body

    // Validate required fields
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
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

    // Create new user with default settings
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        passwordHash,
        companyName: companyName?.trim() || null,
        role: 'BPI_TEAM', // Default role for new users
        subscriptionTier: 'FREE', // Start with free tier
        subscriptionStatus: 'TRIAL', // 14-day trial
        trialEndsAt
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
      trialEnds: user.trialEndsAt
    })

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

