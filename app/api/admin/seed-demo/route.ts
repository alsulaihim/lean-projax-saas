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

    // Check if demo assignment already exists
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        createdById: demoUser.id,
        isDemo: true,
      },
    })

    if (existingAssignment) {
      console.log('✅ Demo assignment already exists')
      return NextResponse.json({
        success: true,
        message: 'Demo user and assignment already exist',
        demoUser: {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
        },
      })
    }

    // Create demo assignment with basic data
    const demoAssignment = await prisma.assignment.create({
      data: {
        title: 'Customer Service Response Time Improvement',
        objective:
          'Reduce average customer service response time from 48 hours to under 24 hours while maintaining quality standards.',
        status: 'COMPLETED',
        isDemo: true,
        createdById: demoUser.id,
        completedAt: new Date(),
      },
    })

    console.log('✅ Demo assignment created')

    // Create charter
    await prisma.assignmentCharter.create({
      data: {
        assignmentId: demoAssignment.id,
        assignmentName: 'Customer Service Response Time Improvement',
        programSponsor: 'Sarah Johnson - VP of Customer Success',
        processOwner: 'Michael Chen - Director of Customer Support',
        programManagement: 'Emily Rodriguez - Program Manager',
        projectTeam: 'Alex Kim (Data Analyst), Maria Santos (CS Lead), John Park (QA Specialist)',
        strategicAlignment:
          'Aligns with company goal to become industry leader in customer satisfaction by 2026.',
        problemStatement:
          'Current average response time of 48 hours results in customer dissatisfaction scores of 6.2/10 and contributes to 15% monthly churn rate.',
        businessCase:
          'Reducing response time will improve NPS by 20 points, reduce churn by 7%, and increase customer lifetime value by $125K annually.',
        goalMetric: 'Reduce average response time from 48 hours to <24 hours',
        expectedDeliverables:
          'Updated support workflow, automated triage system, staff training materials, performance monitoring dashboard.',
        inScope:
          'Email and chat support channels, tier 1 and tier 2 support teams, support ticket routing system.',
        outOfScope:
          'Phone support (different process), enterprise customer escalations (handled separately), weekend support hours.',
        drivers:
          'Customer complaints about slow responses, competitive pressure (competitors average 18 hours), revenue impact from churn.',
        nonFinancialBenefits:
          'Improved employee morale, better customer relationships, enhanced brand reputation, reduced stress on support team.',
        existingLeverage: 'Existing CRM system, trained support staff, established knowledge base.',
        futureLeverage:
          'Process improvements can be applied to phone support, model for other operational improvements, case study for sales.',
        risks:
          'Staff burnout from increased pressure, quality degradation if rushed, technology implementation delays.',
        constraints:
          'No additional headcount, must use existing CRM platform, 90-day implementation timeline.',
        assumptions:
          'Current ticket volume remains stable, automation tools integrate smoothly, team adoption of new processes.',
        businessStakeholders:
          'Customer Success Team, Product Team, IT Department, Executive Leadership.',
      },
    })

    console.log('✅ Demo charter and initial data created')

    return NextResponse.json({
      success: true,
      message: 'Demo user and assignment created successfully! You can now log in with demo@leanprojax.com / demo123',
      demoUser: {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        isDemo: demoUser.isDemo,
      },
      assignment: {
        id: demoAssignment.id,
        title: demoAssignment.title,
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
