import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth-check'
import { checkDemoMode } from '@/lib/demo-check'

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
    const body = await request.json()
    const {
      processName,
      processOwner,
      lowerSpecLimit,
      upperSpecLimit,
      targetValue,
      sampleMean,
      sampleStdDev,
      userId,
      assignmentId
    } = body

    const oldProcess = await prisma.process.findUnique({
      where: { id },
      include: {
        assignment: {
          select: { createdById: true }
        }
      }
    })

    if (!oldProcess) {
      return NextResponse.json({ error: 'Process not found' }, { status: 404 })
    }

    // Verify assignment access
    if (oldProcess.assignment.createdById !== user.id && user.role !== 'EXECUTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Build update data dynamically based on what's provided
    const updateData: {
      processName?: string
      processOwner?: string | null
      lowerSpecLimit?: number | null
      upperSpecLimit?: number | null
      targetValue?: number | null
      sampleMean?: number | null
      sampleStdDev?: number | null
    } = {}
    if (processName !== undefined) updateData.processName = processName
    if (processOwner !== undefined) updateData.processOwner = processOwner
    if (lowerSpecLimit !== undefined) updateData.lowerSpecLimit = lowerSpecLimit
    if (upperSpecLimit !== undefined) updateData.upperSpecLimit = upperSpecLimit
    if (targetValue !== undefined) updateData.targetValue = targetValue
    if (sampleMean !== undefined) updateData.sampleMean = sampleMean
    if (sampleStdDev !== undefined) updateData.sampleStdDev = sampleStdDev

    // Update process and create audit log atomically
    const process = await prisma.$transaction(async (tx) => {
      const updatedProcess = await tx.process.update({
        where: { id },
        data: updateData
      })

      // Log the action
      if (assignmentId && userId) {
        const changes = []
        if (processName !== undefined && processName !== oldProcess?.processName) {
          changes.push(`name: ${processName}`)
        }
        if (processOwner !== undefined && processOwner !== oldProcess?.processOwner) {
          changes.push(`owner: ${processOwner || 'removed'}`)
        }
        if (lowerSpecLimit !== undefined || upperSpecLimit !== undefined) {
          changes.push('capability data updated')
        }

        await tx.auditLog.create({
          data: {
            userId,
            assignmentId,
            action: 'UPDATED',
            entityType: 'Process',
            entityId: updatedProcess.id,
            changeDetails: { changes: changes.join(', ') }
          }
        })
      }

      return updatedProcess
    })

    return NextResponse.json(process)
  } catch (error) {
    console.error('Failed to update process:', error)
    return NextResponse.json(
      { error: 'Failed to update process' },
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
    const body = await request.json()
    const { userId, assignmentId } = body

    // Get process name before deletion
    const process = await prisma.process.findUnique({
      where: { id },
      include: {
        assignment: {
          select: { createdById: true }
        }
      }
    })

    if (!process) {
      return NextResponse.json({ error: 'Process not found' }, { status: 404 })
    }

    // Verify assignment access
    if (process.assignment.createdById !== user.id && user.role !== 'EXECUTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete process and create audit log atomically
    await prisma.$transaction(async (tx) => {
      // Delete the process (cascade will handle related records)
      await tx.process.delete({
        where: { id }
      })

      // Log the action
      if (assignmentId && userId) {
        await tx.auditLog.create({
          data: {
            userId,
            assignmentId,
            action: 'DELETED',
            entityType: 'Process',
            entityId: id,
            changeDetails: { message: `Deleted process: ${process.processName}` }
          }
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete process:', error)
    return NextResponse.json(
      { error: 'Failed to delete process' },
      { status: 500 }
    )
  }
}