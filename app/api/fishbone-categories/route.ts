import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth-check'

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Prevent demo users from modifying data
  const demoCheck = checkDemoMode(user)
  if (demoCheck) return demoCheck

  try {
    const { processId, assignmentId, category, order } = await request.json()

    // Input validation
    if (!processId || !assignmentId || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if category already exists to prevent race condition
    const existingCategory = await prisma.fishboneCategory.findFirst({
      where: {
        processId,
        category
      }
    })

    if (existingCategory) {
      return NextResponse.json(existingCategory, { status: 200 })
    }

    // Create fishbone category and audit log atomically
    const fishboneCategory = await prisma.$transaction(async (tx) => {
      const newCategory = await tx.fishboneCategory.create({
        data: {
          processId,
          category,
          order: order || 0
        },
        include: {
          causes: true
        }
      })

      await tx.auditLog.create({
        data: {
          userId: user.id, // Use authenticated user's ID
          assignmentId,
          action: 'CREATED',
          entityType: 'FishboneCategory',
          entityId: newCategory.id,
          changeDetails: {
            category,
            order: order || 0
          }
        }
      })

      return newCategory
    })

    return NextResponse.json(fishboneCategory)
  } catch (error) {
    console.error('Failed to create fishbone category:', error)
    return NextResponse.json(
      { error: 'Failed to create fishbone category' },
      { status: 500 }
    )
  }
}