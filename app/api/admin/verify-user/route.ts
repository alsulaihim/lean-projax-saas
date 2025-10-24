import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { email, adminSecret } = await req.json()

    // Simple admin secret check
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpiry: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: `User ${user.email} has been verified!`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
    })
  } catch (error) {
    console.error('Error verifying user:', error)
    return NextResponse.json(
      { error: 'Failed to verify user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
