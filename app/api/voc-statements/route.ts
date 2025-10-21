import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth-check'

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { assignmentId, customerSegment, voiceStatement } = await request.json()

    // Input validation
    if (!assignmentId) {
      return NextResponse.json({ error: 'Missing required field: assignmentId' }, { status: 400 })
    }

    // Create VOC statement and audit log atomically
    const voc = await prisma.$transaction(async (tx) => {
      const newVoc = await tx.vOCStatement.create({
        data: {
          assignmentId,
          customerSegment,
          voiceStatement
        }
      })

      // Log the action
      await tx.auditLog.create({
        data: {
          userId: user.id,
          assignmentId,
          action: 'CREATED',
          entityType: 'VOCStatement',
          entityId: newVoc.id,
          changeDetails: {
            customerSegment,
            voiceStatement
          }
        }
      })

      return newVoc
    })

    return NextResponse.json(voc)
  } catch (error) {
    console.error('Failed to create VOC statement:', error)
    return NextResponse.json(
      { error: 'Failed to create VOC statement' },
      { status: 500 }
    )
  }
}