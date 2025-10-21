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
      assignmentId,
      recommendationTitle,
      description,
      expectedImpact,
      implementationDifficulty,
      estimatedCostSavings,
      linkedFMEAIds,
      linkedFishboneCauseIds,
      status
    } = await request.json()

    // Input validation
    if (!assignmentId || !recommendationTitle || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: assignmentId, recommendationTitle, and description' },
        { status: 400 }
      )
    }

    // Create recommendation and audit log atomically
    const recommendation = await prisma.$transaction(async (tx) => {
      const newRecommendation = await tx.recommendation.create({
        data: {
          assignmentId,
          recommendationTitle,
          description,
          expectedImpact,
          implementationDifficulty,
          estimatedCostSavings: estimatedCostSavings || null,
          linkedFMEAIds: linkedFMEAIds || [],
          linkedFishboneCauseIds: linkedFishboneCauseIds || [],
          status: status || 'PROPOSED'
        }
      })

      await tx.auditLog.create({
        data: {
          userId: user.id, // Use authenticated user's ID
          assignmentId,
          action: 'CREATED',
          entityType: 'Recommendation',
          entityId: newRecommendation.id,
          changeDetails: {
            recommendationTitle,
            implementationDifficulty,
            status
          }
        }
      })

      return newRecommendation
    })

    return NextResponse.json(recommendation)
  } catch (error) {
    console.error('Failed to create recommendation:', error)
    return NextResponse.json(
      { error: 'Failed to create recommendation' },
      { status: 500 }
    )
  }
}