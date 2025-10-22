'use client'

import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function DemoBanner() {
  return (
    <Alert className="mb-4 border-blue-500 bg-blue-50">
      <AlertCircle className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <strong>Demo Mode:</strong> You are viewing a read-only demo assignment. This showcases the
        platform&apos;s features. To create your own assignments,{' '}
        <a href="/signup" className="underline font-semibold hover:text-blue-900">
          sign up for a free trial
        </a>
        .
      </AlertDescription>
    </Alert>
  )
}
