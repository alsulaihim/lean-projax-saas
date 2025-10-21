'use client'

import { useState } from 'react'
import { AssignmentHeader } from '@/components/assignment/assignment-header'
import { AssignmentTabs } from '@/components/assignment/assignment-tabs'
import { UserRole } from '@/lib/types'
import type { Prisma } from '@prisma/client'

type AssignmentWithRelations = Prisma.AssignmentGetPayload<{
  include: {
    createdBy: true
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
    vocStatements: {
      include: {
        ctqRequirements: true
      }
    }
    recommendations: true
    auditLogs: {
      include: {
        user: true
      }
    }
  }
}>

interface AssignmentWrapperProps {
  assignment: AssignmentWithRelations
  canEdit: boolean
  userRole: UserRole
  userId: string
}

export function AssignmentWrapper({
  assignment,
  canEdit,
  userRole,
  userId
}: AssignmentWrapperProps) {
  const [progressPercentage, setProgressPercentage] = useState(0)

  return (
    <div className="min-h-screen bg-white">
      <AssignmentHeader
        assignment={assignment}
        canEdit={canEdit}
        userRole={userRole}
        progressPercentage={progressPercentage}
      />

      <div className="w-full px-6 py-6">
        <AssignmentTabs
          assignment={assignment}
          canEdit={canEdit}
          userId={userId}
          onProgressCalculated={setProgressPercentage}
        />
      </div>
    </div>
  )
}