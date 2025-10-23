'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, MoreHorizontal, Trash2, Eye } from 'lucide-react'
import { UserRole } from '@prisma/client'
import { formatDistanceToNow } from '@/lib/utils/date'
import { useToast } from '@/lib/hooks/useToast'

interface Assignment {
  id: string
  title: string
  status: string
  updatedAt: Date
  createdById?: string
  createdBy: {
    name: string
    email: string
  }
  processes: {
    sipocEntries: { id: string }[]
    vsmSteps: { id: string }[]
    fishboneCategories: {
      causes: { id: string }[]
    }[]
    fmeaEntries: { id: string }[]
  }[]
  vocStatements: {
    ctqRequirements: { id: string }[]
  }[]
  recommendations: { id: string }[]
}

interface AssignmentListProps {
  assignments: Assignment[]
  canCreateAssignment: boolean
  userRole: UserRole
  userId?: string
  isDemo?: boolean
}

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800 border-gray-800',
  COMPLETED: 'bg-black text-white border-black',
  REOPENED: 'bg-gray-400 text-white border-gray-800',
}

export function AssignmentList({
  assignments,
  canCreateAssignment,
  userRole,
  userId,
  isDemo = false,
}: AssignmentListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCreateNew = () => {
    const newPath = isDemo ? '/demo/assignments/new' : '/assignments/new'
    router.push(newPath)
  }

  const handleOpenAssignment = (id: string) => {
    const assignmentPath = isDemo ? `/demo/assignments/${id}` : `/assignments/${id}`
    router.push(assignmentPath)
  }

  const handleDeleteAssignment = async () => {
    if (!assignmentToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/assignments/${assignmentToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          variant: 'success',
          title: 'Success',
          description: 'Assignment deleted successfully',
        })
        router.refresh()
        setDeleteDialogOpen(false)
      } else {
        const error = await response.json()
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.error || 'Failed to delete assignment',
        })
      }
    } catch (error) {
      console.error('Failed to delete assignment:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete assignment',
      })
    } finally {
      setIsDeleting(false)
      setAssignmentToDelete(null)
    }
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
        <p className="text-gray-600 mb-6">
          {canCreateAssignment
            ? 'Create your first assignment to get started'
            : 'No completed assignments available'}
        </p>
        {canCreateAssignment && (
          <Button onClick={handleCreateNew} className="bg-black text-white hover:bg-gray-800">
            <Plus className="mr-2 h-4 w-4" />
            New Assignment
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="text-sm text-gray-600">
          Showing {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
        </div>
        {canCreateAssignment && (
          <Button
            onClick={handleCreateNew}
            className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Assignment
          </Button>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {assignments.map(assignment => {
          // Calculate progress
          const counts = {
            voc: assignment.vocStatements.length,
            ctq: assignment.vocStatements.reduce((acc, voc) => acc + voc.ctqRequirements.length, 0),
            sipoc: assignment.processes.reduce((acc, p) => acc + p.sipocEntries.length, 0),
            vsm: assignment.processes.reduce((acc, p) => acc + p.vsmSteps.length, 0),
            fishbone: assignment.processes.reduce(
              (acc, p) =>
                acc + p.fishboneCategories.reduce((sum, cat) => sum + cat.causes.length, 0),
              0
            ),
            fmea: assignment.processes.reduce((acc, p) => acc + p.fmeaEntries.length, 0),
            recommendations: assignment.recommendations.length,
          }

          const sectionStatus = {
            voc: counts.voc >= 3 && counts.ctq >= counts.voc * 2,
            sipoc:
              counts.sipoc >= 5 &&
              assignment.processes.length > 0 &&
              assignment.processes.every(p => p.sipocEntries.length >= 5),
            vsm: counts.vsm >= 5 && assignment.processes.every(p => p.vsmSteps.length >= 5),
            fishbone:
              assignment.processes.length > 0 &&
              assignment.processes.every(
                p =>
                  p.fishboneCategories.length >= 6 &&
                  p.fishboneCategories.every(cat => cat.causes.length >= 3)
              ),
            fmea: counts.fmea >= 5 && assignment.processes.every(p => p.fmeaEntries.length >= 5),
            recommendations: counts.recommendations >= 5,
          }

          const requiredSections = ['voc', 'sipoc', 'vsm', 'fishbone', 'fmea', 'recommendations']
          const completedCount = requiredSections.filter(
            section => sectionStatus[section as keyof typeof sectionStatus]
          ).length
          const progress = Math.round((completedCount / requiredSections.length) * 100)

          return (
            <div
              key={assignment.id}
              className="border-2 border-gray-200 rounded-lg p-4 hover:border-black transition-colors cursor-pointer"
              onClick={() => handleOpenAssignment(assignment.id)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-semibold text-gray-900 truncate">{assignment.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{assignment.createdBy.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`${statusStyles[assignment.status] || statusStyles.DRAFT} text-xs`}
                  >
                    {assignment.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 hover:bg-gray-100 h-8 w-8 p-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenAssignment(assignment.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Open Assignment
                      </DropdownMenuItem>
                      {(userRole === UserRole.EXECUTIVE ||
                        userRole === UserRole.BPI_TEAM ||
                        userRole === UserRole.TEAM_LEAD ||
                        assignment.createdById === userId) && (
                        <DropdownMenuItem
                          onClick={() => {
                            setAssignmentToDelete(assignment)
                            setDeleteDialogOpen(true)
                          }}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Assignment
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{progress}%</span>
                </div>
                <p className="text-xs text-gray-500">
                  Modified {formatDistanceToNow(new Date(assignment.updatedAt))}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border-2 border-black rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b-2 border-black hover:bg-gray-50">
              <TableHead className="font-semibold text-black">Title</TableHead>
              <TableHead className="font-semibold text-black">Status</TableHead>
              <TableHead className="font-semibold text-black">Progress</TableHead>
              <TableHead className="font-semibold text-black">Modified</TableHead>
              <TableHead className="font-semibold text-black">Owner</TableHead>
              <TableHead className="font-semibold text-black w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map(assignment => {
              // Calculate progress using the same logic as assignment-tabs.tsx
              const counts = {
                voc: assignment.vocStatements.length,
                ctq: assignment.vocStatements.reduce(
                  (acc, voc) => acc + voc.ctqRequirements.length,
                  0
                ),
                sipoc: assignment.processes.reduce((acc, p) => acc + p.sipocEntries.length, 0),
                vsm: assignment.processes.reduce((acc, p) => acc + p.vsmSteps.length, 0),
                fishbone: assignment.processes.reduce(
                  (acc, p) =>
                    acc + p.fishboneCategories.reduce((sum, cat) => sum + cat.causes.length, 0),
                  0
                ),
                fmea: assignment.processes.reduce((acc, p) => acc + p.fmeaEntries.length, 0),
                recommendations: assignment.recommendations.length,
              }

              const sectionStatus = {
                voc: counts.voc >= 3 && counts.ctq >= counts.voc * 2,
                sipoc:
                  counts.sipoc >= 5 &&
                  assignment.processes.length > 0 &&
                  assignment.processes.every(p => p.sipocEntries.length >= 5),
                vsm: counts.vsm >= 5 && assignment.processes.every(p => p.vsmSteps.length >= 5),
                fishbone:
                  assignment.processes.length > 0 &&
                  assignment.processes.every(
                    p =>
                      p.fishboneCategories.length >= 6 &&
                      p.fishboneCategories.every(cat => cat.causes.length >= 3)
                  ),
                fmea:
                  counts.fmea >= 5 && assignment.processes.every(p => p.fmeaEntries.length >= 5),
                recommendations: counts.recommendations >= 5,
              }

              const requiredSections = [
                'voc',
                'sipoc',
                'vsm',
                'fishbone',
                'fmea',
                'recommendations',
              ]
              const completedCount = requiredSections.filter(
                section => sectionStatus[section as keyof typeof sectionStatus]
              ).length
              const progress = Math.round((completedCount / requiredSections.length) * 100)

              return (
                <TableRow
                  key={assignment.id}
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleOpenAssignment(assignment.id)}
                >
                  <TableCell className="font-medium">{assignment.title}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusStyles[assignment.status] || statusStyles.DRAFT}
                    >
                      {assignment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        {/* Inline style intentional: dynamic width based on progress value */}
                        <div
                          className="h-full bg-black transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDistanceToNow(new Date(assignment.updatedAt))}
                  </TableCell>
                  <TableCell className="text-sm">{assignment.createdBy.name}</TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300 hover:bg-gray-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenAssignment(assignment.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Open Assignment
                        </DropdownMenuItem>
                        {(userRole === UserRole.EXECUTIVE ||
                          userRole === UserRole.BPI_TEAM ||
                          userRole === UserRole.TEAM_LEAD ||
                          assignment.createdById === userId) && (
                          <DropdownMenuItem
                            onClick={() => {
                              setAssignmentToDelete(assignment)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Assignment
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the assignment "
              {assignmentToDelete?.title}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAssignment}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Assignment'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
