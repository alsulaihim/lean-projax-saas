import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth-check'
import prisma from '@/lib/prisma'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  TrendingUp,
  Eye,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import type { Prisma } from '@prisma/client'

// Type for assignment with all relations
type AssignmentWithRelations = Prisma.AssignmentGetPayload<{
  include: {
    createdBy: true
    vocStatements: {
      include: {
        ctqRequirements: true
      }
    }
    processes: {
      include: {
        sipocEntries: true
        vsmSteps: true
        fishboneCategories: {
          include: {
            causes: true
          }
        }
        fmeaEntries: true
      }
    }
    recommendations: true
    _count: {
      select: {
        auditLogs: true
      }
    }
  }
}>

// Helper function to calculate completion percentage
function calculateCompletionPercentage(assignment: AssignmentWithRelations): number {
  const sections = [
    assignment.vocStatements.length > 0,
    assignment.vocStatements.some(v => v.ctqRequirements.length > 0),
    assignment.processes.length > 0,
    assignment.processes.some(p => p.sipocEntries.length > 0),
    assignment.processes.some(p => p.vsmSteps.length > 0),
    assignment.processes.some(p => p.fishboneCategories.length > 0),
    assignment.processes.some(p => p.fmeaEntries.length > 0),
    assignment.recommendations.length > 0
  ]

  const completed = sections.filter(Boolean).length
  return Math.round((completed / sections.length) * 100)
}

// Helper function to detect validation issues
function getValidationIssues(assignment: AssignmentWithRelations): string[] {
  const issues: string[] = []

  if (assignment.vocStatements.length === 0) {
    issues.push('No VOC statements defined')
  }

  if (!assignment.vocStatements.some(v => v.ctqRequirements.length > 0)) {
    issues.push('No CTQ requirements defined')
  }

  if (assignment.processes.length === 0) {
    issues.push('No processes defined')
  }

  const hasHighRisk = assignment.processes.some(p =>
    p.fmeaEntries.some(f => f.rpn >= 200)
  )
  if (hasHighRisk && assignment.recommendations.length === 0) {
    issues.push('High risk items without recommendations')
  }

  return issues
}

export default async function TeamLeadDashboard() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  // Only Team Leads and BPI Team can access this dashboard
  if (user.role !== 'TEAM_LEAD' && user.role !== 'BPI_TEAM') {
    redirect('/')
  }

  // Fetch all assignments with detailed data
  const assignments = await prisma.assignment.findMany({
    include: {
      createdBy: true,
      vocStatements: {
        include: {
          ctqRequirements: true
        }
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
      recommendations: true,
      _count: {
        select: {
          auditLogs: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Calculate statistics
  const totalAssignments = assignments.length
  const draftAssignments = assignments.filter(a => a.status === 'DRAFT').length
  const completedAssignments = assignments.filter(a => a.status === 'COMPLETED').length
  const reopenedAssignments = assignments.filter(a => a.status === 'REOPENED').length

  const assignmentsNeedingReview = assignments.filter(a => {
    const issues = getValidationIssues(a)
    return a.status === 'DRAFT' && issues.length > 0
  })

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Team Lead Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor assignment progress and quality across your team</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <Card className="border border-gray-300">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Assignments</p>
                <p className="text-3xl font-bold">{totalAssignments}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-blue-300 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-blue-700 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-blue-800">{draftAssignments}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-green-300 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-800">{completedAssignments}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-yellow-300 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-yellow-700 mb-1">Reopened</p>
                <p className="text-3xl font-bold text-yellow-800">{reopenedAssignments}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-red-700 mb-1">Need Review</p>
                <p className="text-3xl font-bold text-red-800">{assignmentsNeedingReview.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Table */}
      <Card className="border-2 border-black mb-8">
        <CardHeader>
          <CardTitle>All Assignments</CardTitle>
          <CardDescription>Click on any assignment to view details or provide feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Progress</TableHead>
                <TableHead className="text-center">Validation</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map(assignment => {
                const completion = calculateCompletionPercentage(assignment)
                const issues = getValidationIssues(assignment)
                const hasHighRisk = assignment.processes.some(p =>
                  p.fmeaEntries.some(f => f.rpn >= 200)
                )

                return (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{assignment.title}</p>
                        {hasHighRisk && (
                          <Badge className="mt-1 bg-red-100 text-red-800 text-xs">
                            High Risk Items
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{assignment.createdBy.name}</p>
                        <p className="text-xs text-gray-500">{assignment.createdBy.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          assignment.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : assignment.status === 'REOPENED'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {assignment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-lg">{completion}%</span>
                        <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                          <div
                            className={`h-full rounded-full ${
                              completion === 100
                                ? 'bg-green-500'
                                : completion >= 75
                                ? 'bg-blue-500'
                                : completion >= 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${completion}%` } as React.CSSProperties}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {issues.length === 0 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <div className="flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-1" />
                          <span className="text-sm text-yellow-700">{issues.length}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(assignment.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-center">
                        <Link href={`/assignments/${assignment.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/assignments/${assignment.id}/summary`}>
                          <Button size="sm" variant="outline">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Summary
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {assignments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No assignments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Validation Issues Section */}
      {assignmentsNeedingReview.length > 0 && (
        <Card className="border-2 border-yellow-500 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Assignments Requiring Attention
            </CardTitle>
            <CardDescription>These assignments have validation issues that should be addressed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignmentsNeedingReview.map(assignment => {
                const issues = getValidationIssues(assignment)
                return (
                  <div key={assignment.id} className="border border-yellow-300 rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{assignment.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">By {assignment.createdBy.name}</p>
                        <ul className="mt-2 space-y-1">
                          {issues.map((issue, idx) => (
                            <li key={idx} className="text-sm text-yellow-700 flex items-center gap-1">
                              <span className="text-yellow-600">•</span> {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Link href={`/assignments/${assignment.id}`}>
                        <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                          Review
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}