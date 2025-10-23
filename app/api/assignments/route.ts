import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth-check'
import { checkDemoMode } from '@/lib/demo-check'
import { checkDemoUser, demoUserResponse } from '@/lib/demo-guard'

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Prevent demo users from modifying data
  const demoCheck = checkDemoMode(user)
  if (demoCheck) return demoCheck

  // Block demo users from creating assignments
  if (await checkDemoUser(user.id)) {
    return demoUserResponse()
  }

  try {
    const { title, objective } = await request.json()

    // Input validation
    if (!title || !objective) {
      return NextResponse.json(
        { error: 'Missing required fields: title and objective' },
        { status: 400 }
      )
    }

    // Create assignment, default process, and audit log atomically
    const assignment = await prisma.$transaction(async tx => {
      const newAssignment = await tx.assignment.create({
        data: {
          title,
          objective,
          status: 'DRAFT',
          createdById: user.id,
        },
      })

      // Create default process
      await tx.process.create({
        data: {
          assignmentId: newAssignment.id,
          processName: 'Main Process',
          order: 1,
        },
      })

      // Log the action
      await tx.auditLog.create({
        data: {
          userId: user.id,
          assignmentId: newAssignment.id,
          action: 'CREATED',
          entityType: 'Assignment',
          entityId: newAssignment.id,
          changeDetails: {
            title,
            objective,
          },
        },
      })

      return newAssignment
    })

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Failed to create assignment:', error)
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 })
  }
}
