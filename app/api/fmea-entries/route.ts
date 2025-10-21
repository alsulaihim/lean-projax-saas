import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth-check'

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const {
      assignmentId,
      processId,
      failureMode,
      effectsOfFailure,
      severity,
      potentialCauses,
      occurrence,
      currentControls,
      detection,
      rpn,
      recommendedActions
    } = await request.json()

    // Input validation
    if (!assignmentId || !failureMode || !effectsOfFailure) {
      return NextResponse.json(
        { error: 'Missing required fields: assignmentId, failureMode, and effectsOfFailure' },
        { status: 400 }
      )
    }

    // Create FMEA entry and audit log atomically
    const entry = await prisma.$transaction(async (tx) => {
      const newEntry = await tx.fMEAEntry.create({
        data: {
          assignmentId,
          processId: processId || null,
          failureMode,
          effectsOfFailure,
          severity,
          potentialCauses,
          occurrence,
          currentControls,
          detection,
          rpn,
          recommendedActions
        }
      })

      await tx.auditLog.create({
        data: {
          userId: user.id, // Use authenticated user's ID
          assignmentId,
          action: 'CREATED',
          entityType: 'FMEAEntry',
          entityId: newEntry.id,
          changeDetails: {
            failureMode: newEntry.failureMode,
            severity: newEntry.severity,
            occurrence: newEntry.occurrence,
            detection: newEntry.detection,
            rpn: newEntry.rpn
          }
        }
      })

      return newEntry
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Failed to create FMEA entry:', error)
    return NextResponse.json(
      { error: 'Failed to create FMEA entry' },
      { status: 500 }
    )
  }
}