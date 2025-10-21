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

  const { id } = await params

  try {
    const { causeDescription, assignmentId } = await request.json()

    // Input validation
    if (!causeDescription || !assignmentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check entity exists
    const oldCause = await prisma.fishboneCause.findUnique({
      where: { id },
      include: {
        category: {
          include: {
            process: {
              include: {
                assignment: {
                  select: { createdById: true }
                }
              }
            }
          }
        }
      }
    })

    if (!oldCause) {
      return NextResponse.json(
        { error: 'Fishbone cause not found' },
        { status: 404 }
      )
    }

    // Verify nested relations exist
    if (!oldCause.category?.process?.assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Verify assignment access
    if (oldCause.category.process.assignment.createdById !== user.id && user.role !== 'EXECUTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update fishbone cause and create audit log atomically
    const cause = await prisma.$transaction(async (tx) => {
      const updatedCause = await tx.fishboneCause.update({
        where: { id },
        data: { causeDescription }
      })

      await tx.auditLog.create({
        data: {
          userId: user.id, // Use authenticated user's ID
          assignmentId,
          action: 'UPDATED',
          entityType: 'FishboneCause',
          entityId: updatedCause.id,
          changeDetails: {
            before: { causeDescription: oldCause.causeDescription },
            after: { causeDescription }
          }
        }
      })

      return updatedCause
    })

    return NextResponse.json(cause)
  } catch (error) {
    console.error('Failed to update fishbone cause:', error)
    return NextResponse.json(
      { error: 'Failed to update fishbone cause' },
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
      return NextResponse.json(
        { error: 'Missing assignmentId' },
        { status: 400 }
      )
    }

    // Check entity exists before deletion
    const cause = await prisma.fishboneCause.findUnique({
      where: { id },
      include: {
        category: {
          include: {
            process: {
              include: {
                assignment: {
                  select: { createdById: true }
                }
              }
            }
          }
        }
      }
    })

    if (!cause) {
      return NextResponse.json(
        { error: 'Fishbone cause not found' },
        { status: 404 }
      )
    }

    // Verify nested relations exist
    if (!cause.category?.process?.assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Verify assignment access
    if (cause.category.process.assignment.createdById !== user.id && user.role !== 'EXECUTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete fishbone cause and create audit log atomically
    await prisma.$transaction(async (tx) => {
      await tx.fishboneCause.delete({
        where: { id }
      })

      await tx.auditLog.create({
        data: {
          userId: user.id, // Use authenticated user's ID
          assignmentId,
          action: 'DELETED',
          entityType: 'FishboneCause',
          entityId: id,
          changeDetails: {
            causeDescription: cause.causeDescription
          }
        }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete fishbone cause:', error)
    return NextResponse.json(
      { error: 'Failed to delete fishbone cause' },
      { status: 500 }
    )
  }
}