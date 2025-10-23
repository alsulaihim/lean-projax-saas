'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

export function DemoWelcomeModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('demo-welcome-seen')
    if (!hasSeenWelcome) {
      setOpen(true)
    }
  }, [])

  const handleClose = () => {
    sessionStorage.setItem('demo-welcome-seen', 'true')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to Lean Projax Demo!</DialogTitle>
          <DialogDescription>
            You&apos;re viewing a completed Six Sigma assignment that showcases all platform
            features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <p className="font-semibold text-gray-900">What you can do:</p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Explore all sections and features</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>View charts, diagrams, and analysis tools</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>See how a complete assignment looks</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-gray-900">Demo limitations:</p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">•</span>
                <span>Read-only mode - you cannot modify this assignment</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">•</span>
                <span>Cannot create new assignments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">•</span>
                <span>Cannot export to PDF</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900">
              To create your own assignments and unlock all features,{' '}
              <a href="/signup" className="underline font-bold hover:text-blue-700">
                start your free 14-day trial
              </a>
              .
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={handleClose}>Got it, let&apos;s explore!</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
