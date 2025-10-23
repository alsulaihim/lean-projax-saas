import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth-check'
import { checkDemoMode } from '@/lib/demo-check'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
      stepName,
      processTime,
      waitingTime,
      valueMeasure,
      stakeholder,
      wasteType,
      remarks,
      assignmentId,
    } = await request.json()

    // Input validation
    if (!assignmentId) {
      return NextResponse.json({ error: 'Missing required field: assignmentId' }, { status: 400 })
    }

    // Check if entity exists
    const oldStep = await prisma.vSMStep.findUnique({
      where: { id },
      include: {
        process: {
          include: {
            assignment: {
              select: { createdById: true },
            },
          },
        },
      },
    })

    if (!oldStep) {
      return NextResponse.json({ error: 'VSM step not found' }, { status: 404 })
    }

    // Verify nested relations exist
    if (!oldStep.process?.assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Verify assignment access
    if (oldStep.process.assignment.createdById !== user.id && user.role !== 'EXECUTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update VSM step and create audit log atomically
    const step = await prisma.$transaction(async tx => {
      const updatedStep = await tx.vSMStep.update({
        where: { id },
        data: {
          stepName,
          processTime: processTime ? parseFloat(processTime) : undefined,
          waitingTime: waitingTime ? parseFloat(waitingTime) : undefined,
          valueMeasure,
          stakeholder,
          wasteType,
          remarks,
        },
      })

      await tx.auditLog.create({
        data: {
          userId: user.id,
          assignmentId,
          action: 'UPDATED',
          entityType: 'VSMStep',
          entityId: updatedStep.id,
          changeDetails: {
            before: {
              stepName: oldStep.stepName,
              processTime: oldStep.processTime,
              waitingTime: oldStep.waitingTime,
              valueMeasure: oldStep.valueMeasure,
            },
            after: {
              stepName,
              processTime,
              waitingTime,
              valueMeasure,
            },
          },
        },
      })

      return updatedStep
    })

    return NextResponse.json(step)
  } catch (error) {
    console.error('Failed to update VSM step:', error)
    return NextResponse.json({ error: 'Failed to update VSM step' }, { status: 500 })
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
    const step = await prisma.vSMStep.findUnique({
      where: { id },
      include: {
        process: {
          include: {
            assignment: {
              select: { createdById: true },
            },
          },
        },
      },
    })

    if (!step) {
      return NextResponse.json({ error: 'VSM step not found' }, { status: 404 })
    }

    // Verify nested relations exist
    if (!step.process?.assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Verify assignment access
    if (step.process.assignment.createdById !== user.id && user.role !== 'EXECUTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete VSM step and create audit log atomically
    await prisma.$transaction(async tx => {
      await tx.vSMStep.delete({
        where: { id },
      })

      await tx.auditLog.create({
        data: {
          userId: user.id,
          assignmentId,
          action: 'DELETED',
          entityType: 'VSMStep',
          entityId: id,
          changeDetails: {
            stepName: step.stepName,
            durationMinutes: step.durationMinutes,
          },
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete VSM step:', error)
    return NextResponse.json({ error: 'Failed to delete VSM step' }, { status: 500 })
  }
}
