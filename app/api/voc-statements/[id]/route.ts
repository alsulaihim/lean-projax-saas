import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth-check'

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
    const vocStatement = await prisma.vOCStatement.findUnique({
      where: { id },
      include: {
        assignment: {
          select: { createdById: true }
        }
      }
    })

    if (!vocStatement) {
      return NextResponse.json({ error: 'VOC statement not found' }, { status: 404 })
    }

    // Verify nested relations exist
    if (!vocStatement.assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Verify assignment access
    if (vocStatement.assignment.createdById !== user.id && user.role !== 'EXECUTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete VOC statement and create audit log atomically
    await prisma.$transaction(async (tx) => {
      // Delete VOC statement (cascades to CTQ requirements)
      await tx.vOCStatement.delete({
        where: { id }
      })

      // Log the action
      await tx.auditLog.create({
        data: {
          userId: user.id,
          assignmentId,
          action: 'DELETED',
          entityType: 'VOCStatement',
          entityId: id,
          changeDetails: {}
        }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete VOC statement:', error)
    return NextResponse.json(
      { error: 'Failed to delete VOC statement' },
      { status: 500 }
    )
  }
}

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
    const { customerSegment, voiceStatement, assignmentId } = await request.json()

    // Input validation
    if (!assignmentId) {
      return NextResponse.json({ error: 'Missing required field: assignmentId' }, { status: 400 })
    }

    // Check if entity exists
    const existingVoc = await prisma.vOCStatement.findUnique({
      where: { id },
      include: {
        assignment: {
          select: { createdById: true }
        }
      }
    })

    if (!existingVoc) {
      return NextResponse.json({ error: 'VOC statement not found' }, { status: 404 })
    }

    // Verify nested relations exist
    if (!existingVoc.assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Verify assignment access
    if (existingVoc.assignment.createdById !== user.id && user.role !== 'EXECUTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update VOC statement and create audit log atomically
    const voc = await prisma.$transaction(async (tx) => {
      const updatedVoc = await tx.vOCStatement.update({
        where: { id },
        data: {
          customerSegment,
          voiceStatement
        }
      })

      // Log the action
      await tx.auditLog.create({
        data: {
          userId: user.id,
          assignmentId,
          action: 'UPDATED',
          entityType: 'VOCStatement',
          entityId: updatedVoc.id,
          changeDetails: {
            before: {
              customerSegment: existingVoc.customerSegment,
              voiceStatement: existingVoc.voiceStatement
            },
            after: {
              customerSegment: updatedVoc.customerSegment,
              voiceStatement: updatedVoc.voiceStatement
            }
          }
        }
      })

      return updatedVoc
    })

    return NextResponse.json(voc)
  } catch (error) {
    console.error('Failed to update VOC statement:', error)
    return NextResponse.json(
      { error: 'Failed to update VOC statement' },
      { status: 500 }
    )
  }
}