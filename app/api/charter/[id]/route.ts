import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth-check'
import { checkDemoMode } from '@/lib/demo-check'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  // Prevent demo users from modifying data
  const demoCheck = checkDemoMode(user)
  if (demoCheck) return demoCheck

    const { id: assignmentId } = await params
    const body = await request.json()
    const { scheduleItems, ...charterData } = body

    // Verify assignment exists and user has access
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { charter: true }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Verify user has access to create charter
    if (assignment.createdById !== user.id && user.role !== 'EXECUTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (assignment.charter) {
      return NextResponse.json({ error: 'Charter already exists' }, { status: 400 })
    }

    // Create charter with schedule items
    const charter = await prisma.assignmentCharter.create({
      data: {
        assignmentId,
        ...charterData,
        scheduleItems: {
          create: scheduleItems.map((item: { milestone: string; startDate: string; endDate: string }, index: number) => ({
            milestone: item.milestone,
            startDate: item.startDate,
            endDate: item.endDate,
            order: index + 1
          }))
        }
      },
      include: {
        scheduleItems: {
          orderBy: { order: 'asc' }
        }
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        assignmentId,
        userId: user.id,
        action: 'CREATED',
        entityType: 'CHARTER',
        entityId: charter.id,
        changeDetails: {
          action: 'created_charter',
          charterName: charterData.assignmentName
        }
      }
    })

    return NextResponse.json(charter)
  } catch (error) {
    console.error('Charter creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create charter' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: assignmentId } = await params
    const body = await request.json()
    const { scheduleItems, ...charterData } = body

    // Verify assignment exists and user has access
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { charter: true }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Verify user has access to update charter
    if (assignment.createdById !== user.id && user.role !== 'EXECUTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (!assignment.charter) {
      return NextResponse.json({ error: 'Charter not found' }, { status: 404 })
    }

    // Update charter and replace schedule items atomically
    const charter = await prisma.$transaction(async (tx) => {
      // Delete existing schedule items
      await tx.charterScheduleItem.deleteMany({
        where: { charterId: assignment.charter!.id }
      })

      // Update charter with new schedule items
      return await tx.assignmentCharter.update({
        where: { id: assignment.charter!.id },
        data: {
          ...charterData,
          scheduleItems: {
            create: scheduleItems.map((item: { milestone: string; startDate: string; endDate: string }, index: number) => ({
              milestone: item.milestone,
              startDate: item.startDate,
              endDate: item.endDate,
              order: index + 1
            }))
          }
        },
        include: {
          scheduleItems: {
            orderBy: { order: 'asc' }
          }
        }
      })
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        assignmentId,
        userId: user.id,
        action: 'UPDATED',
        entityType: 'CHARTER',
        entityId: charter.id,
        changeDetails: {
          action: 'updated_charter',
          charterName: charterData.assignmentName
        }
      }
    })

    return NextResponse.json(charter)
  } catch (error) {
    console.error('Charter update error:', error)
    return NextResponse.json(
      { error: 'Failed to update charter' },
      { status: 500 }
    )
  }
}
