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
      recommendationTitle,
      description,
      expectedImpact,
      implementationDifficulty,
      estimatedCostSavings,
      status,
      assignmentId,
    } = await request.json()

    // Input validation
    if (!assignmentId) {
      return NextResponse.json({ error: 'Missing required field: assignmentId' }, { status: 400 })
    }

    // Check if entity exists
    const oldRec = await prisma.recommendation.findUnique({
      where: { id },
      include: {
        assignment: {
          select: { createdById: true },
        },
      },
    })

    if (!oldRec) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 })
    }

    // Verify nested relations exist
    if (!oldRec.assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Verify assignment access
    if (oldRec.assignment.createdById !== user.id && user.role !== 'EXECUTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update recommendation and create audit log atomically
    const recommendation = await prisma.$transaction(async tx => {
      const updatedRecommendation = await tx.recommendation.update({
        where: { id },
        data: {
          recommendationTitle,
          description,
          expectedImpact,
          implementationDifficulty,
          estimatedCostSavings: estimatedCostSavings || null,
          status,
        },
      })

      await tx.auditLog.create({
        data: {
          userId: user.id,
          assignmentId,
          action: 'UPDATED',
          entityType: 'Recommendation',
          entityId: updatedRecommendation.id,
          changeDetails: {
            before: {
              recommendationTitle: oldRec.recommendationTitle,
              implementationDifficulty: oldRec.implementationDifficulty,
              status: oldRec.status,
            },
            after: {
              recommendationTitle,
              implementationDifficulty,
              status,
            },
          },
        },
      })

      return updatedRecommendation
    })

    return NextResponse.json(recommendation)
  } catch (error) {
    console.error('Failed to update recommendation:', error)
    return NextResponse.json({ error: 'Failed to update recommendation' }, { status: 500 })
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
    const recommendation = await prisma.recommendation.findUnique({
      where: { id },
      include: {
        assignment: {
          select: { createdById: true },
        },
      },
    })

    if (!recommendation) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 })
    }

    // Verify nested relations exist
    if (!recommendation.assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Verify assignment access
    if (recommendation.assignment.createdById !== user.id && user.role !== 'EXECUTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete recommendation and create audit log atomically
    await prisma.$transaction(async tx => {
      await tx.recommendation.delete({
        where: { id },
      })

      await tx.auditLog.create({
        data: {
          userId: user.id,
          assignmentId,
          action: 'DELETED',
          entityType: 'Recommendation',
          entityId: id,
          changeDetails: {
            recommendationTitle: recommendation.recommendationTitle,
          },
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete recommendation:', error)
    return NextResponse.json({ error: 'Failed to delete recommendation' }, { status: 500 })
  }
}
