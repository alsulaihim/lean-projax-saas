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
      processId,
      assignmentId,
      stepNumber,
      stepName,
      processTime,
      waitingTime,
      valueMeasure,
      stakeholder,
      wasteType,
      remarks
    } = await request.json()

    // Input validation
    if (!processId || !assignmentId || !stepName) {
      return NextResponse.json(
        { error: 'Missing required fields: processId, assignmentId, and stepName' },
        { status: 400 }
      )
    }

    // Create VSM step and audit log atomically
    const step = await prisma.$transaction(async (tx) => {
      const newStep = await tx.vSMStep.create({
        data: {
          processId,
          stepNumber,
          stepName,
          processTime: parseFloat(processTime) || 0,
          waitingTime: parseFloat(waitingTime) || 0,
          valueMeasure: valueMeasure || 'NON_VALUE_ADDED',
          stakeholder,
          wasteType: wasteType || null,
          remarks
        }
      })

      await tx.auditLog.create({
        data: {
          userId: user.id, // Use authenticated user's ID
          assignmentId,
          action: 'CREATED',
          entityType: 'VSMStep',
          entityId: newStep.id,
          changeDetails: {
            stepNumber,
            stepName,
            processTime,
            waitingTime,
            valueMeasure
          }
        }
      })

      return newStep
    })

    return NextResponse.json(step)
  } catch (error) {
    console.error('Failed to create VSM step:', error)
    return NextResponse.json(
      { error: 'Failed to create VSM step' },
      { status: 500 }
    )
  }
}