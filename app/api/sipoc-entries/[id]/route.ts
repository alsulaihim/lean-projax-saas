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
    const { value, assignmentId } = await request.json()

    // Input validation
    if (!value || !assignmentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const oldEntry = await prisma.sIPOCEntry.findUnique({
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

    if (!oldEntry) {
      return NextResponse.json({ error: 'SIPOC entry not found' }, { status: 404 })
    }

    // Verify nested relations exist
    if (!oldEntry.process?.assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Verify assignment access
    if (oldEntry.process.assignment.createdById !== user.id && user.role !== 'EXECUTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update SIPOC entry and create audit log atomically
    const entry = await prisma.$transaction(async tx => {
      const updatedEntry = await tx.sIPOCEntry.update({
        where: { id },
        data: { value },
      })

      await tx.auditLog.create({
        data: {
          userId: user.id, // Use authenticated user's ID
          assignmentId,
          action: 'UPDATED',
          entityType: 'SIPOCEntry',
          entityId: updatedEntry.id,
          changeDetails: {
            before: { value: oldEntry.value },
            after: { value },
          },
        },
      })

      return updatedEntry
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Failed to update SIPOC entry:', error)
    return NextResponse.json({ error: 'Failed to update SIPOC entry' }, { status: 500 })
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
      return NextResponse.json({ error: 'Missing assignmentId' }, { status: 400 })
    }

    const entry = await prisma.sIPOCEntry.findUnique({
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

    if (!entry) {
      return NextResponse.json({ error: 'SIPOC entry not found' }, { status: 404 })
    }

    // Verify nested relations exist
    if (!entry.process?.assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Verify assignment access
    if (entry.process.assignment.createdById !== user.id && user.role !== 'EXECUTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete SIPOC entry and create audit log atomically
    await prisma.$transaction(async tx => {
      await tx.sIPOCEntry.delete({
        where: { id },
      })

      await tx.auditLog.create({
        data: {
          userId: user.id, // Use authenticated user's ID
          assignmentId,
          action: 'DELETED',
          entityType: 'SIPOCEntry',
          entityId: id,
          changeDetails: {
            column: entry.column,
            value: entry.value,
          },
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete SIPOC entry:', error)
    return NextResponse.json({ error: 'Failed to delete SIPOC entry' }, { status: 500 })
  }
}
