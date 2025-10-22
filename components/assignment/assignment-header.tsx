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
  BarChart3
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
import { UserRole } from '@prisma/client'
import type { Assignment, User } from '@prisma/client'
import { useToast } from '@/lib/hooks/useToast'

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
      <div className="max-w-[1600px] mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/assignments')}
            className="hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Assignments
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/assignments/${assignment.id}/summary`)}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Summary Dashboard
            </Button>

            <Button
              variant="outline"
              onClick={handleExportPDF}
              className="border-black hover:bg-gray-100"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export PDF
            </Button>

            {canEdit && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50"
                    disabled={isDeleting}
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
        </div>

        <div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{assignment.title}</h1>
              <p className="text-gray-600 mb-2">{assignment.objective}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Created by: {assignment.createdBy.name}</span>
                <span>•</span>
                <span>Created: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                {assignment.completedAt && (
                  <>
                    <span>•</span>
                    <span>Completed: {new Date(assignment.completedAt).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>

            <Badge
              variant="outline"
              className={`${statusColors[assignment.status]} border px-3 py-1`}
            >
              {statusLabels[assignment.status]}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}