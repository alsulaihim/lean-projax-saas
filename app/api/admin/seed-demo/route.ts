import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { adminSecret } = await req.json()

    // Simple admin secret check
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🌱 Seeding demo user and assignment...')

    // Create demo user
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@leanprojax.com' },
      update: {},
      create: {
        email: 'demo@leanprojax.com',
        name: 'Demo User',
        passwordHash: await bcrypt.hash('demo123', 10),
        role: 'BPI_TEAM',
        emailVerified: true,
        isDemo: true,
        subscriptionTier: 'PRO',
        subscriptionStatus: 'ACTIVE',
      },
    })

    console.log('✅ Demo user created:', demoUser.email)

    return NextResponse.json({
      success: true,
      message: 'Demo user created successfully! You can now log in with demo@leanprojax.com / demo123',
      demoUser: {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        isDemo: demoUser.isDemo,
      },
    })
  } catch (error) {
    console.error('Error seeding demo data:', error)
    return NextResponse.json(
      { error: 'Failed to seed demo data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
