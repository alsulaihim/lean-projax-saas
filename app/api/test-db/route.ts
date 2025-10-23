import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  // CRITICAL: Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    )
  }

  try {
    // Test database connection
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
      },
    })

    // Test bcrypt comparison with analyst user
    const analystUser = users.find(u => u.email === 'analyst@example.com')
    let passwordTest = null

    if (analystUser) {
      const isValid = await bcrypt.compare('password123', analystUser.passwordHash)
      passwordTest = {
        email: analystUser.email,
        hashExists: !!analystUser.passwordHash,
        hashLength: analystUser.passwordHash.length,
        passwordValid: isValid,
      }
    }

    return NextResponse.json({
      success: true,
      userCount: users.length,
      users: users.map(u => ({
        email: u.email,
        name: u.name,
        role: u.role,
        hasHash: !!u.passwordHash,
      })),
      passwordTest,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorCode =
      error && typeof error === 'object' && 'code' in error ? String(error.code) : undefined
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: errorCode,
      },
      { status: 500 }
    )
  }
}
