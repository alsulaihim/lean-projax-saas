import { getUser } from '@/lib/auth-check'
import { prisma } from '@/lib/prisma'
import { AssignmentList } from '@/components/assignment/assignment-list'
import { UserRole } from '@/lib/types'

export default async function AssignmentsPage() {
  const user = await getUser()

  if (!user) {
    return null
  }

  // Filter assignments based on user role
  const whereClause =
    user.role === UserRole.EXECUTIVE ||
    user.role === UserRole.PROCESS_OWNER
      ? { status: 'COMPLETED' as const }
      : {}

  const assignments = await prisma.assignment.findMany({
    where: whereClause,
    include: {
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
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
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  const canCreateAssignment =
    user.role === UserRole.BPI_TEAM ||
    user.role === UserRole.TEAM_LEAD

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Assignments</h1>
        <p className="text-gray-600">
          Manage and track Six Sigma improvement assignments
        </p>
      </div>

      <AssignmentList
        assignments={assignments}
        canCreateAssignment={canCreateAssignment}
        userRole={user.role}
        userId={user.id}
      />
    </div>
  )
}