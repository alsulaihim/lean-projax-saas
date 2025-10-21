'use client'

import * as React from 'react'
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
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'

export type DialogType = 'warning' | 'danger' | 'info' | 'success'

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  type?: DialogType
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  loading?: boolean
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  type = 'warning',
  confirmText = 'Continue',
  cancelText = 'Cancel',
  onConfirm,
  loading = false
}: ConfirmationDialogProps) {
  const [isConfirming, setIsConfirming] = React.useState(false)

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsConfirming(false)
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <XCircle className="h-6 w-6 text-red-600" />
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'info':
        return <Info className="h-6 w-6 text-blue-600" />
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />
    }
  }

  const getButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-600'
      case 'success':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-600'
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-600'
      default:
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-600'
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            {getIcon()}
            <div className="flex-1">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription className="mt-2">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isConfirming || loading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isConfirming || loading}
            className={getButtonClass()}
          >
            {isConfirming ? 'Processing...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Specialized dialogs for common use cases
export function StatusChangeDialog({
  open,
  onOpenChange,
  currentStatus,
  newStatus,
  onConfirm
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentStatus: string
  newStatus: string
  onConfirm: () => void | Promise<void>
}) {
  const getDialogContent = () => {
    if (newStatus === 'COMPLETED') {
      return {
        title: 'Mark Assignment as Complete?',
        description: 'This will mark the assignment as completed. Make sure all required sections have been filled out and reviewed. You can reopen the assignment later if needed.',
        type: 'success' as DialogType,
        confirmText: 'Mark as Complete'
      }
    }
    if (newStatus === 'REOPENED') {
      return {
        title: 'Reopen Assignment?',
        description: 'This will reopen the assignment for further editing. The completion date will be cleared and the assignment will return to draft status.',
        type: 'warning' as DialogType,
        confirmText: 'Reopen Assignment'
      }
    }
    return {
      title: 'Change Assignment Status?',
      description: `Are you sure you want to change the status from ${currentStatus} to ${newStatus}?`,
      type: 'info' as DialogType,
      confirmText: 'Change Status'
    }
  }

  const content = getDialogContent()

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={content.title}
      description={content.description}
      type={content.type}
      confirmText={content.confirmText}
      onConfirm={onConfirm}
    />
  )
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  itemType,
  itemName,
  onConfirm
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemType: string
  itemName?: string
  onConfirm: () => void | Promise<void>
}) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${itemType}?`}
      description={
        itemName
          ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
          : `Are you sure you want to delete this ${itemType.toLowerCase()}? This action cannot be undone.`
      }
      type="danger"
      confirmText="Delete"
      cancelText="Keep"
      onConfirm={onConfirm}
    />
  )
}

export function ValidationWarningDialog({
  open,
  onOpenChange,
  warnings,
  onConfirm
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  warnings: string[]
  onConfirm: () => void | Promise<void>
}) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Incomplete Data Warning"
      description={
        <>
          <p>The following sections appear to be incomplete:</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            {warnings.map((warning, index) => (
              <li key={index} className="text-sm">{warning}</li>
            ))}
          </ul>
          <p className="mt-3">Do you want to continue anyway?</p>
        </>
      }
      type="warning"
      confirmText="Continue Anyway"
      onConfirm={onConfirm}
    />
  )
}