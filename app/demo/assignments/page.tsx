import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth-check'
import { prisma } from '@/lib/prisma'
import { AssignmentList } from '@/components/assignment/assignment-list'
import { UserRole } from '@prisma/client'

export default async function DemoAssignmentsPage() {
  const user = await getUser()

  // Only allow demo users on this page
  if (!user) {
    redirect('/demo-login')
  }

  // Redirect non-demo users to regular assignments page
  if (!user.isDemo) {
    redirect('/assignments')
  }

  // Get the demo user
  const demoUser = await prisma.user.findFirst({
    where: { email: 'demo@leanprojax.com' },
  })

  if (!demoUser) {
    return <div>Demo user not found</div>
  }

  // Get all demo assignments (typically just one)
  const assignments = await prisma.assignment.findMany({
    where: {
      createdById: demoUser.id,
      isDemo: true,
    },
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

  // Demo users cannot create new assignments
  const canCreateAssignment = false

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Assignments</h1>
        <p className="text-sm md:text-base text-gray-600">
          Manage and track Six Sigma improvement assignments
        </p>
      </div>

      <AssignmentList
        assignments={assignments}
        canCreateAssignment={canCreateAssignment}
        userRole={user.role}
        userId={user.id}
        isDemo={true}
      />
    </div>
  )
}
