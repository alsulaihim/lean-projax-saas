import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth-check'
import { checkDemoMode } from '@/lib/demo-check'

export async function DELETE(
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
    const { assignmentId } = await request.json()

    // Input validation
    if (!assignmentId) {
      return NextResponse.json({ error: 'Missing required field: assignmentId' }, { status: 400 })
    }

    // Check if entity exists
    const ctqRequirement = await prisma.cTQRequirement.findUnique({
      where: { id },
      include: {
        assignment: {
          select: { createdById: true },
        },
      },
    })

    if (!ctqRequirement) {
      return NextResponse.json({ error: 'CTQ requirement not found' }, { status: 404 })
    }

    // Verify nested relations exist
    if (!ctqRequirement.assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Verify assignment access
    if (ctqRequirement.assignment.createdById !== user.id && user.role !== 'EXECUTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete CTQ requirement and create audit log atomically
    await prisma.$transaction(async tx => {
      await tx.cTQRequirement.delete({
        where: { id },
      })

      // Log the action
      await tx.auditLog.create({
        data: {
          userId: user.id,
          assignmentId,
          action: 'DELETED',
          entityType: 'CTQRequirement',
          entityId: id,
          changeDetails: {},
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete CTQ requirement:', error)
    return NextResponse.json({ error: 'Failed to delete CTQ requirement' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const { ctqDescription, measurementCriteria, targetValue, assignmentId } = await request.json()

    // Input validation
    if (!assignmentId) {
      return NextResponse.json({ error: 'Missing required field: assignmentId' }, { status: 400 })
    }

    // Check if entity exists
    const existingCtq = await prisma.cTQRequirement.findUnique({
      where: { id },
      include: {
        assignment: {
          select: { createdById: true },
        },
      },
    })

    if (!existingCtq) {
      return NextResponse.json({ error: 'CTQ requirement not found' }, { status: 404 })
    }

    // Verify nested relations exist
    if (!existingCtq.assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Verify assignment access
    if (existingCtq.assignment.createdById !== user.id && user.role !== 'EXECUTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update CTQ requirement and create audit log atomically
    const ctq = await prisma.$transaction(async tx => {
      const updatedCtq = await tx.cTQRequirement.update({
        where: { id },
        data: {
          ctqDescription,
          measurementCriteria,
          targetValue,
        },
      })

      // Log the action
      await tx.auditLog.create({
        data: {
          userId: user.id,
          assignmentId,
          action: 'UPDATED',
          entityType: 'CTQRequirement',
          entityId: updatedCtq.id,
          changeDetails: {
            before: {
              ctqDescription: existingCtq.ctqDescription,
              measurementCriteria: existingCtq.measurementCriteria,
              targetValue: existingCtq.targetValue,
            },
            after: {
              ctqDescription: updatedCtq.ctqDescription,
              measurementCriteria: updatedCtq.measurementCriteria,
              targetValue: updatedCtq.targetValue,
            },
          },
        },
      })

      return updatedCtq
    })

    return NextResponse.json(ctq)
  } catch (error) {
    console.error('Failed to update CTQ requirement:', error)
    return NextResponse.json({ error: 'Failed to update CTQ requirement' }, { status: 500 })
  }
}
