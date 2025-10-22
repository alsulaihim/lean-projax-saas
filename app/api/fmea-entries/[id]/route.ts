import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth-check'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Prevent demo users from modifying data
  const demoCheck = checkDemoMode(user)
  if (demoCheck) return demoCheck

  const { id } = await params

  try {
    const {
      failureMode,
      effectsOfFailure,
      severity,
      potentialCauses,
      occurrence,
      currentControls,
      detection,
      rpn,
      recommendedActions,
      assignmentId
    } = await request.json()

    // Input validation
    if (!assignmentId) {
      return NextResponse.json({ error: 'Missing required field: assignmentId' }, { status: 400 })
    }

    // Check if entity exists
    const oldEntry = await prisma.fMEAEntry.findUnique({
      where: { id },
      include: {
        assignment: {
          select: { createdById: true }
        }
      }
    })

    if (!oldEntry) {
      return NextResponse.json({ error: 'FMEA entry not found' }, { status: 404 })
    }

    // Verify nested relations exist
    if (!oldEntry.assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Verify assignment access
    if (oldEntry.assignment.createdById !== user.id && user.role !== 'EXECUTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update FMEA entry and create audit log atomically
    const entry = await prisma.$transaction(async (tx) => {
      const updatedEntry = await tx.fMEAEntry.update({
        where: { id },
        data: {
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
          userId: user.id,
          assignmentId,
          action: 'UPDATED',
          entityType: 'FMEAEntry',
          entityId: updatedEntry.id,
          changeDetails: {
            before: {
              failureMode: oldEntry.failureMode,
              severity: oldEntry.severity,
              occurrence: oldEntry.occurrence,
              detection: oldEntry.detection,
              rpn: oldEntry.rpn
            },
            after: {
              failureMode: updatedEntry.failureMode,
              severity: updatedEntry.severity,
              occurrence: updatedEntry.occurrence,
              detection: updatedEntry.detection,
              rpn: updatedEntry.rpn
            }
          }
        }
      })

      return updatedEntry
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Failed to update FMEA entry:', error)
    return NextResponse.json(
      { error: 'Failed to update FMEA entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const { assignmentId } = await request.json()

    // Input validation
    if (!assignmentId) {
      return NextResponse.json({ error: 'Missing required field: assignmentId' }, { status: 400 })
    }

    // Check if entity exists
    const entry = await prisma.fMEAEntry.findUnique({
      where: { id },
      include: {
        assignment: {
          select: { createdById: true }
        }
      }
    })

    if (!entry) {
      return NextResponse.json({ error: 'FMEA entry not found' }, { status: 404 })
    }

    // Verify nested relations exist
    if (!entry.assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Verify assignment access
    if (entry.assignment.createdById !== user.id && user.role !== 'EXECUTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete FMEA entry and create audit log atomically
    await prisma.$transaction(async (tx) => {
      await tx.fMEAEntry.delete({
        where: { id }
      })

      await tx.auditLog.create({
        data: {
          userId: user.id,
          assignmentId,
          action: 'DELETED',
          entityType: 'FMEAEntry',
          entityId: id,
          changeDetails: {
            failureMode: entry.failureMode,
            rpn: entry.rpn
          }
        }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete FMEA entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete FMEA entry' },
      { status: 500 }
    )
  }
}