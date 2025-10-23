import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth-check'
import { checkDemoMode } from '@/lib/demo-check'
import { checkDemoUser, demoUserResponse } from '@/lib/demo-guard'

export async function DELETE(
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

  // Block demo users from deleting assignments
  if (await checkDemoUser(user.id)) {
    return demoUserResponse()
  }

  const { id } = await params

  try {
    // Check if assignment exists and user has permission
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      select: {
        id: true,
        createdById: true,
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Only allow deletion by the creator or manager role
    if (assignment.createdById !== user.id && user.role !== 'TEAM_LEAD') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete assignment and all related data (cascade delete)
    await prisma.assignment.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Assignment deleted successfully' })
  } catch (error) {
    console.error('Failed to delete assignment:', error)
    return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    // Get pagination parameters from query string
    const { searchParams } = new URL(request.url)
    const auditLogsPage = parseInt(searchParams.get('auditLogsPage') || '1', 10)
    const auditLogsLimit = parseInt(searchParams.get('auditLogsLimit') || '50', 10)

    // Validate pagination parameters
    const page = Math.max(1, auditLogsPage)
    const limit = Math.min(Math.max(1, auditLogsLimit), 100) // Max 100 items per page
    const skip = (page - 1) * limit

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        createdBy: true,
        processes: {
          include: {
            sipocEntries: true,
            vsmSteps: true,
            fishboneCategories: {
              include: {
                causes: true,
              },
            },
            fmeaEntries: true,
          },
        },
        vocStatements: {
          include: {
            ctqRequirements: true,
          },
        },
        recommendations: true,
        auditLogs: {
          include: {
            user: true,
          },
          orderBy: {
            timestamp: 'desc',
          },
          take: limit,
          skip: skip,
        },
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Get total count of audit logs for pagination metadata
    const totalAuditLogs = await prisma.auditLog.count({
      where: { assignmentId: id },
    })

    return NextResponse.json({
      ...assignment,
      auditLogsPagination: {
        page,
        limit,
        total: totalAuditLogs,
        totalPages: Math.ceil(totalAuditLogs / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch assignment:', error)
    return NextResponse.json({ error: 'Failed to fetch assignment' }, { status: 500 })
  }
}
