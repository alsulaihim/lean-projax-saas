'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert'
import {
  ChevronLeft,
  CheckCircle,
  RefreshCw,
  FileDown,
  AlertCircle,
  Trash2,
  BarChart3,
  MoreHorizontal
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserRole } from '@prisma/client'
import type { Assignment, User } from '@prisma/client'
import { useToast } from '@/lib/hooks/useToast'
import { useDemoMode } from '@/hooks/use-demo-mode'

interface AssignmentHeaderProps {
  assignment: Assignment & {
    createdBy: User
  }
  canEdit: boolean
  userRole: UserRole
  progressPercentage?: number
}

const statusColors = {
  DRAFT: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  COMPLETED: 'bg-green-100 text-green-800 border-green-300',
  REOPENED: 'bg-orange-100 text-orange-800 border-orange-300'
}

const statusLabels = {
  DRAFT: 'Draft',
  COMPLETED: 'Completed',
  REOPENED: 'Reopened'
}

export function AssignmentHeader({
  assignment,
  canEdit,
  userRole,
  progressPercentage = 0
}: AssignmentHeaderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { isDemo } = useDemoMode()
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false)

  const handleStatusChange = async (newStatus: 'COMPLETED' | 'REOPENED') => {
    // Prevent marking complete if progress < 100%
    if (newStatus === 'COMPLETED' && progressPercentage < 100) {
      setShowIncompleteWarning(true)
      setTimeout(() => setShowIncompleteWarning(false), 5000)
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/assignments/${assignment.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportPDF = async () => {
    try {
      const response = await fetch(`/api/assignments/${assignment.id}/export`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${assignment.title.replace(/\s+/g, '_')}_Report.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to export PDF:', error)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/assignments/${assignment.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          variant: 'success',
          title: 'Success',
          description: 'Assignment deleted successfully'
        })
        router.push('/assignments')
      } else {
        const error = await response.json()
        console.error('Failed to delete assignment:', error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.error || 'Failed to delete assignment'
        })
      }
    } catch (error) {
      console.error('Failed to delete assignment:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete assignment'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const summaryPath = isDemo ? `/demo/assignments/${assignment.id}/summary` : `/assignments/${assignment.id}/summary`
  const assignmentsPath = isDemo ? '/demo/assignments' : '/assignments'

  return (
    <div className="border-b-2 border-black bg-white sticky top-0 z-10">
      {showIncompleteWarning && (
        <Alert className="mx-4 mt-4 border-orange-400 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Cannot mark assignment as complete. Progress is {progressPercentage}%.
            Please complete all required sections (100% progress) before marking as complete.
          </AlertDescription>
        </Alert>
      )}
      <div className="max-w-[1600px] mx-auto px-4 py-3 md:py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push(assignmentsPath)}
            className="hover:bg-gray-100 w-fit"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Back to Assignments</span>
            <span className="sm:hidden">Back</span>
          </Button>

          {/* Desktop action buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(summaryPath)}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Summary Dashboard
            </Button>

            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={isDemo}
              className="border-black hover:bg-gray-100"
              title={isDemo ? 'PDF export is not available in demo mode' : ''}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export PDF
            </Button>

            {canEdit && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className={isDemo
                      ? "border-red-300 text-red-300 cursor-not-allowed"
                      : "border-red-600 text-red-600 hover:bg-red-50"
                    }
                    disabled={isDeleting || isDemo}
                    title={isDemo ? 'Delete is not available in demo mode' : ''}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Assignment
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div>
                        <p>
                          This action cannot be undone. This will permanently delete the assignment
                          "{assignment.title}" and all associated data including:
                        </p>
                        <ul className="mt-2 ml-4 list-disc">
                          <li>All VOC statements and CTQ requirements</li>
                          <li>All processes and their SIPOC, VSM, Fishbone, FMEA data</li>
                          <li>All recommendations</li>
                          <li>All audit logs</li>
                        </ul>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete Assignment
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {canEdit && assignment.status === 'DRAFT' && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-gray-300">
                  Progress: {progressPercentage}%
                </Badge>
                <Button
                  onClick={() => handleStatusChange('COMPLETED')}
                  disabled={isSaving || progressPercentage < 100}
                  className={progressPercentage < 100
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                  }
                  title={progressPercentage < 100 ? `Assignment is ${progressPercentage}% complete. Complete all required sections first.` : ''}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Complete
                </Button>
              </div>
            )}

            {userRole === UserRole.TEAM_LEAD && assignment.status === 'COMPLETED' && (
              <Button
                onClick={() => handleStatusChange('REOPENED')}
                disabled={isSaving}
                variant="outline"
                className="border-orange-600 text-orange-600 hover:bg-orange-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reopen
              </Button>
            )}
          </div>

          {/* Mobile action buttons - Compact layout */}
          <div className="flex lg:hidden items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(summaryPath)}
              className="border-blue-600 text-blue-600 hover:bg-blue-50 flex-1 sm:flex-none"
            >
              <BarChart3 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Summary</span>
            </Button>

            {canEdit && assignment.status === 'DRAFT' && (
              <Button
                onClick={() => handleStatusChange('COMPLETED')}
                disabled={isSaving || progressPercentage < 100}
                size="sm"
                className={progressPercentage < 100
                  ? "bg-gray-400 text-white cursor-not-allowed flex-1 sm:flex-none"
                  : "bg-green-600 text-white hover:bg-green-700 flex-1 sm:flex-none"
                }
              >
                <CheckCircle className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Complete</span>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-gray-300">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportPDF} disabled={isDemo}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export PDF
                </DropdownMenuItem>
                {canEdit && (
                  <DropdownMenuItem
                    onClick={() => {
                      if (!isDemo) handleDelete()
                    }}
                    disabled={isDemo || isDeleting}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
                {userRole === UserRole.TEAM_LEAD && assignment.status === 'COMPLETED' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('REOPENED')} disabled={isSaving}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reopen
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold flex-1">{assignment.title}</h1>
                <Badge
                  variant="outline"
                  className={`${statusColors[assignment.status]} border px-2 py-1 text-xs whitespace-nowrap`}
                >
                  {statusLabels[assignment.status]}
                </Badge>
              </div>
              <p className="text-gray-600 mb-2 text-sm md:text-base">{assignment.objective}</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs md:text-sm text-gray-500">
                <span>Created by: {assignment.createdBy.name}</span>
                <span className="hidden sm:inline">•</span>
                <span>Created: {new Date(assignment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                {assignment.completedAt && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span>Completed: {new Date(assignment.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                  </>
                )}
              </div>
              {canEdit && assignment.status === 'DRAFT' && (
                <div className="mt-2 lg:hidden">
                  <Badge variant="outline" className="border-gray-300 text-xs">
                    Progress: {progressPercentage}%
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}