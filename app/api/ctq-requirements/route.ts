import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth-check'

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { vocStatementId, ctqDescription, measurementCriteria, targetValue, assignmentId } = await request.json()

    // Input validation
    if (!vocStatementId || !assignmentId) {
      return NextResponse.json({ error: 'Missing required fields: vocStatementId and assignmentId' }, { status: 400 })
    }

    // Create CTQ requirement and audit log atomically
    const ctq = await prisma.$transaction(async (tx) => {
      const newCtq = await tx.cTQRequirement.create({
        data: {
          vocStatementId,
          assignmentId,
          ctqDescription,
          measurementCriteria,
          targetValue
        }
      })

      // Log the action
      await tx.auditLog.create({
        data: {
          userId: user.id,
          assignmentId,
          action: 'CREATED',
          entityType: 'CTQRequirement',
          entityId: newCtq.id,
          changeDetails: {
            ctqDescription,
            measurementCriteria,
            targetValue
          }
        }
      })

      return newCtq
    })

    return NextResponse.json(ctq)
  } catch (error) {
    console.error('Failed to create CTQ requirement:', error)
    return NextResponse.json(
      { error: 'Failed to create CTQ requirement' },
      { status: 500 }
    )
  }
}