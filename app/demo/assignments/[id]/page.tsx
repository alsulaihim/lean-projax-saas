import { notFound, redirect } from 'next/navigation'
import { getUser } from '@/lib/auth-check'
import { prisma } from '@/lib/prisma'
import { AssignmentWrapper } from '@/components/assignment/assignment-wrapper'
import { UserRole } from '@prisma/client'

interface DemoAssignmentPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DemoAssignmentPage({ params }: DemoAssignmentPageProps) {
  const user = await getUser()

  // Only allow demo users on this page
  if (!user) {
    redirect('/demo-login')
  }

  // Redirect non-demo users to regular assignments page
  if (!user.isDemo) {
    redirect('/assignments')
  }

  const { id } = await params

  // Get the demo assignment by ID
  const assignment = await prisma.assignment.findUnique({
    where: {
      id,
      isDemo: true,
    },
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

  // Demo users can "edit" but changes are only client-side (not persisted to DB)
  const canEdit = true

  return (
    <AssignmentWrapper
      assignment={assignment}
      canEdit={canEdit}
      userRole={user.role as UserRole}
      userId={user.id}
    />
  )
}
