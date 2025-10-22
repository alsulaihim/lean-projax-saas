import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth-check'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  Target,
  Activity
} from 'lucide-react'

export default async function DashboardPage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  // Only executives and team leads can view the dashboard
  if (user.role !== UserRole.EXECUTIVE && user.role !== UserRole.TEAM_LEAD) {
    redirect('/assignments')
  }

  // Get dashboard statistics
  const [
    totalAssignments,
    completedAssignments,
    draftAssignments,
    totalVOCs,
    totalCTQs,
    totalFMEAs,
    highRiskFMEAs,
    totalRecommendations,
    activeUsers
  ] = await Promise.all([
    prisma.assignment.count(),
    prisma.assignment.count({ where: { status: 'COMPLETED' } }),
    prisma.assignment.count({ where: { status: 'DRAFT' } }),
    prisma.vOCStatement.count(),
    prisma.cTQRequirement.count(),
    prisma.fMEAEntry.count(),
    prisma.fMEAEntry.count({ where: { rpn: { gte: 200 } } }),
    prisma.recommendation.count(),
    prisma.user.count()
  ])

  // Get recent assignments
  const recentAssignments = await prisma.assignment.findMany({
    take: 5,
    orderBy: { updatedAt: 'desc' },
    include: {
      createdBy: true,
      _count: {
        select: {
          processes: true,
          vocStatements: true,
          recommendations: true
        }
      }
    }
  })

  // Get top FMEA risks
  const topRisks = await prisma.fMEAEntry.findMany({
    take: 5,
    orderBy: { rpn: 'desc' },
    include: {
      process: {
        include: {
          assignment: true
        }
      }
    }
  })

  const completionRate = totalAssignments > 0
    ? Math.round((completedAssignments / totalAssignments) * 100)
    : 0

  const highRiskRate = totalFMEAs > 0
    ? Math.round((highRiskFMEAs / totalFMEAs) * 100)
    : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Executive Dashboard</h1>
        <p className="text-gray-600">Six Sigma process improvement overview</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssignments}</div>
            <p className="text-xs text-gray-500">
              {draftAssignments} in progress
            </p>
          </CardContent>
        </Card>

        <Card className="border-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-gray-500">
              {completedAssignments} completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Items</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highRiskFMEAs}</div>
            <p className="text-xs text-gray-500">
              {highRiskRate}% of total risks
            </p>
          </CardContent>
        </Card>

        <Card className="border-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-gray-500">
              Across all roles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Process Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VOC Statements</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVOCs}</div>
            <p className="text-xs text-gray-500">Customer requirements captured</p>
          </CardContent>
        </Card>

        <Card className="border-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTQ Requirements</CardTitle>
            <Target className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCTQs}</div>
            <p className="text-xs text-gray-500">Measurable specifications</p>
          </CardContent>
        </Card>

        <Card className="border-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecommendations}</div>
            <p className="text-xs text-gray-500">Improvement actions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Assignments */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {assignment.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {assignment.createdBy.name} • {assignment._count.vocStatements} VOCs • {assignment._count.recommendations} Recs
                    </p>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded border ${
                    assignment.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : assignment.status === 'DRAFT'
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                      : 'bg-orange-100 text-orange-800 border-orange-300'
                  }`}>
                    {assignment.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Risks */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle>Top Risk Items (by RPN)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topRisks.map((risk) => (
                <div key={risk.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {risk.failureMode}
                    </p>
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      risk.rpn >= 200
                        ? 'bg-red-100 text-red-800'
                        : risk.rpn >= 100
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      RPN: {risk.rpn}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {risk.process?.assignment?.title || 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}