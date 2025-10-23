import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth-check'
import { checkDemoMode } from '@/lib/demo-check'

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Prevent demo users from modifying data
  const demoCheck = checkDemoMode(user)
  if (demoCheck) return demoCheck

  try {
    const { categoryId, assignmentId, causeDescription, order } = await request.json()

    // Input validation
    if (!categoryId || !assignmentId || !causeDescription) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create fishbone cause and audit log atomically
    const cause = await prisma.$transaction(async tx => {
      const newCause = await tx.fishboneCause.create({
        data: {
          categoryId,
          causeDescription,
          order: order || 0,
        },
      })

      await tx.auditLog.create({
        data: {
          userId: user.id, // Use authenticated user's ID
          assignmentId,
          action: 'CREATED',
          entityType: 'FishboneCause',
          entityId: newCause.id,
          changeDetails: {
            causeDescription,
            order: order || 0,
          },
        },
      })

      return newCause
    })

    return NextResponse.json(cause)
  } catch (error) {
    console.error('Failed to create fishbone cause:', error)
    return NextResponse.json({ error: 'Failed to create fishbone cause' }, { status: 500 })
  }
}
