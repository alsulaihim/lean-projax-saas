import { notFound, redirect } from 'next/navigation'
import { getUser } from '@/lib/auth-check'
import { prisma } from '@/lib/prisma'
import { AssignmentWrapper } from '@/components/assignment/assignment-wrapper'
import { UserRole } from '@/lib/types'

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

  const { id } = await params

  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      createdBy: true,
      charter: {
        include: {
          scheduleItems: {
            orderBy: { order: 'asc' }
          }
        }
      },
      processes: {
        include: {
          sipocEntries: true,
          vsmSteps: {
            orderBy: { stepNumber: 'asc' }
          },
          fishboneCategories: {
            include: {
              causes: true
            }
          },
          fmeaEntries: true
        },
        orderBy: { order: 'asc' }
      },
      vocStatements: {
        include: {
          ctqRequirements: true
        },
        orderBy: { createdAt: 'asc' }
      },
      recommendations: {
        orderBy: { createdAt: 'asc' }
      },
      auditLogs: {
        include: {
          user: true
        },
        orderBy: { timestamp: 'desc' },
        take: 50
      }
    }
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