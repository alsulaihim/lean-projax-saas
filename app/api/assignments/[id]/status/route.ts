import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth-check'
import { AssignmentStatus } from '@prisma/client'
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
    const { status } = await request.json()

    // Verify assignment access and get full data for progress calculation
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        processes: {
          include: {
            sipocEntries: true,
            vsmSteps: true,
            fishboneCategories: {
              include: {
                causes: true
              }
            },
            fmeaEntries: true
          }
        },
        vocStatements: {
          include: {
            ctqRequirements: true
          }
        },
        recommendations: true
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    if (assignment.createdById !== user.id && user.role !== 'EXECUTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // If trying to mark as COMPLETED, validate 100% progress
    if (status === 'COMPLETED') {
      // Calculate completion status based on the same criteria as assignment-tabs
      const counts = {
        voc: assignment.vocStatements.length,
        ctq: assignment.vocStatements.reduce((acc, voc) => acc + voc.ctqRequirements.length, 0),
        sipoc: assignment.processes.reduce((acc, p) => acc + p.sipocEntries.length, 0),
        vsm: assignment.processes.reduce((acc, p) => acc + p.vsmSteps.length, 0),
        fishbone: assignment.processes.reduce((acc, p) =>
          acc + p.fishboneCategories.reduce((sum, cat) => sum + cat.causes.length, 0), 0
        ),
        fmea: assignment.processes.reduce((acc, p) => acc + p.fmeaEntries.length, 0),
        recommendations: assignment.recommendations.length
      }

      const sectionStatus = {
        voc: counts.voc >= 3 && counts.ctq >= counts.voc * 2,
        sipoc: counts.sipoc >= 5 && assignment.processes.length > 0 &&
               assignment.processes.every(p => p.sipocEntries.length >= 5),
        vsm: counts.vsm >= 5 && assignment.processes.every(p => p.vsmSteps.length >= 5),
        fishbone: assignment.processes.length > 0 &&
                 assignment.processes.every(p =>
                   p.fishboneCategories.length >= 6 &&
                   p.fishboneCategories.every(cat => cat.causes.length >= 3)
                 ),
        fmea: counts.fmea >= 5 && assignment.processes.every(p => p.fmeaEntries.length >= 5),
        recommendations: counts.recommendations >= 5
      }

      const requiredSections = ['voc', 'sipoc', 'vsm', 'fishbone', 'fmea', 'recommendations']
      const completedCount = requiredSections.filter(section => sectionStatus[section as keyof typeof sectionStatus]).length
      const progressPercentage = Math.round((completedCount / requiredSections.length) * 100)

      if (progressPercentage < 100) {
        return NextResponse.json(
          {
            error: `Cannot mark assignment as completed. Progress is ${progressPercentage}%. All required sections must be completed (100%).`,
            progress: progressPercentage,
            incompleteSections: requiredSections.filter(section => !sectionStatus[section as keyof typeof sectionStatus])
          },
          { status: 400 }
        )
      }
    }

    // Update assignment status
    const updateData: {
      status: AssignmentStatus
      completedAt?: Date | null
    } = {
      status: status as AssignmentStatus
    }

    // Set completedAt timestamp if completing
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date()
    } else if (status === 'REOPENED') {
      updateData.completedAt = null
    }

    // Update assignment status and create audit log atomically
    const updatedAssignment = await prisma.$transaction(async (tx) => {
      const updated = await tx.assignment.update({
        where: { id },
        data: updateData
      })

      // Log the status change
      await tx.auditLog.create({
        data: {
          userId: user.id,
          assignmentId: id,
          action: 'UPDATED',
          entityType: 'Assignment',
          entityId: id,
          changeDetails: {
            status,
            completedAt: updateData.completedAt
          }
        }
      })

      return updated
    })

    return NextResponse.json(updatedAssignment)
  } catch (error) {
    console.error('Failed to update assignment status:', error)
    return NextResponse.json(
      { error: 'Failed to update assignment status' },
      { status: 500 }
    )
  }
}