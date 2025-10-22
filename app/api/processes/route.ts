import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth-check'
import { checkDemoMode } from '@/lib/demo-check'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  // Prevent demo users from modifying data
  const demoCheck = checkDemoMode(user)
  if (demoCheck) return demoCheck

    const body = await request.json()
    const { assignmentId, processName, processOwner, order } = body

    // Input validation
    if (!assignmentId || !processName) {
      return NextResponse.json(
        { error: 'Missing required fields: assignmentId and processName' },
        { status: 400 }
      )
    }

    // Create the new process and audit log atomically
    const process = await prisma.$transaction(async (tx) => {
      const newProcess = await tx.process.create({
        data: {
          assignmentId,
          processName,
          processOwner: processOwner || null,
          order: order || 1,
        }
      })

      await tx.auditLog.create({
        data: {
          assignmentId,
          userId: user.id, // Use authenticated user's ID
          action: 'CREATED',
          entityType: 'Process',
          entityId: newProcess.id
        }
      })

      return newProcess
    })

    return NextResponse.json(process, { status: 201 })
  } catch (error) {
    console.error('Error creating process:', error)
    return NextResponse.json(
      { error: 'Failed to create process' },
      { status: 500 }
    )
  }
}