import { notFound, redirect } from 'next/navigation'
import { getUser } from '@/lib/auth-check'
import { prisma } from '@/lib/prisma'
import { AssignmentWrapper } from '@/components/assignment/assignment-wrapper'
import { UserRole } from '@prisma/client'

interface AssignmentPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AssignmentPage({ params }: AssignmentPageProps) {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  // Redirect demo users to demo-specific page
  if (user.isDemo) {
    redirect('/demo/assignments')
  }

  const { id } = await params

  // Multi-tenancy: Only allow users to access their own assignments
  const assignment = await prisma.assignment.findFirst({
    where: {
      id,
      createdById: user.id, // Users can only access their own assignments
    },
    include: {
      createdBy: true,
      charter: {
        include: {
          scheduleItems: {
            orderBy: { order: 'asc' },
          },
        },
      },
      processes: {
        include: {
          sipocEntries: true,
          vsmSteps: {
            orderBy: { stepNumber: 'asc' },
          },
          fishboneCategories: {
            include: {
              causes: true,
            },
          },
          fmeaEntries: true,
        },
        orderBy: { order: 'asc' },
      },
      vocStatements: {
        include: {
          ctqRequirements: true,
        },
        orderBy: { createdAt: 'asc' },
      },
      recommendations: {
        orderBy: { createdAt: 'asc' },
      },
      auditLogs: {
        include: {
          user: true,
        },
        orderBy: { timestamp: 'desc' },
        take: 50,
      },
    },
  })

  if (!assignment) {
    notFound()
  }

  // Check access permissions - allow editing even for completed assignments
  const canEdit =
    user.role === UserRole.BPI_TEAM ||
    user.role === UserRole.TEAM_LEAD ||
    (user.role === UserRole.PROCESS_OWNER && assignment.createdById === user.id)

  return (
    <AssignmentWrapper
      assignment={assignment}
      canEdit={canEdit}
      userRole={user.role as UserRole}
      userId={user.id}
    />
  )
}
