'use client'

import { useState, useEffect, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle2, Clock, Circle } from 'lucide-react'
import { VOCSection } from '@/components/sections/voc-section'
import { SIPOCSection } from '@/components/sections/sipoc-section'
import { VSMSection } from '@/components/sections/vsm-section'
import { FishboneSectionEnhanced } from '@/components/sections/fishbone-section-enhanced'
import { FMEASection } from '@/components/sections/fmea-section'
import { RecommendationsSection } from '@/components/sections/recommendations-section'
import { ProcessCapabilitySection } from '@/components/sections/process-capability-section'
import { ParetoSection } from '@/components/sections/pareto-section'
import { AuditLogSection } from '@/components/sections/audit-log-section'
import { ProcessManager } from '@/components/sections/process-manager'
import { AIAnalysisSection } from '@/components/sections/ai-analysis-section'
import { CharterSection } from '@/components/sections/charter-section'
import type { Prisma } from '@prisma/client'

type AssignmentWithRelations = Prisma.AssignmentGetPayload<{
  include: {
    createdBy: true
    charter: {
      include: {
        scheduleItems: true
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

interface AssignmentTabsProps {
  assignment: AssignmentWithRelations
  canEdit: boolean
  userId: string
  onProgressCalculated?: (percentage: number) => void
}

export function AssignmentTabs({ assignment, canEdit, userId, onProgressCalculated }: AssignmentTabsProps) {
  const [activeTab, setActiveTab] = useState('charter')

  // Count items for tab badges
  const counts = {
    voc: assignment.vocStatements.length,
    ctq: assignment.vocStatements.reduce((acc, voc) => acc + voc.ctqRequirements.length, 0),
    sipoc: assignment.processes.reduce((acc, p) => acc + p.sipocEntries.length, 0),
    vsm: assignment.processes.reduce((acc, p) => acc + p.vsmSteps.length, 0),
    fishbone: assignment.processes.reduce((acc, p) =>
      acc + p.fishboneCategories.reduce((sum, cat) => sum + cat.causes.length, 0), 0
    ),
    fmea: assignment.processes.reduce((acc, p) => acc + p.fmeaEntries.length, 0),
    recommendations: assignment.recommendations.length
  }

  // Calculate completion status for progress navigation - stricter criteria
  const sectionStatus = {
    voc: {
      completed: counts.voc >= 3 && counts.ctq >= counts.voc * 2,
      hasData: counts.voc > 0
    },
    sipoc: {
      completed: counts.sipoc >= 5 && assignment.processes.length > 0 &&
                 assignment.processes.every(p => p.sipocEntries.length >= 5), // All SIPOC elements
      hasData: counts.sipoc > 0
    },
    vsm: {
      completed: counts.vsm >= 5 && assignment.processes.every(p => p.vsmSteps.length >= 5),
      hasData: counts.vsm > 0
    },
    fishbone: {
      completed: assignment.processes.length > 0 &&
                 assignment.processes.every(p =>
                   p.fishboneCategories.length >= 6 &&
                   p.fishboneCategories.every(cat => cat.causes.length >= 3)
                 ), // Each process has 6 categories with 3+ causes each
      hasData: counts.fishbone > 0
    },
    fmea: {
      completed: counts.fmea >= 5 && assignment.processes.every(p => p.fmeaEntries.length >= 5),
      hasData: counts.fmea > 0
    },
    pareto: {
      completed: counts.vsm >= 5, // Optional but needs VSM data
      hasData: counts.vsm > 0
    },
    capability: {
      completed: assignment.processes.length > 0 &&
                 assignment.processes.every(p =>
                   p.lowerSpecLimit !== null &&
                   p.upperSpecLimit !== null &&
                   p.sampleMean !== null &&
                   p.sampleStdDev !== null
                 ), // Optional but needs all data if used
      hasData: assignment.processes.some(p => p.sampleMean !== null)
    },
    recommendations: {
      completed: counts.recommendations >= 5,
      hasData: counts.recommendations > 0
    }
  }

  // Map tab values to section IDs for progress navigation
  const tabToSection: Record<string, string> = {
    'voc-ctq': 'voc',
    'sipoc': 'sipoc',
    'vsm': 'vsm',
    'fishbone': 'fishbone',
    'fmea': 'fmea',
    'pareto': 'pareto',
    'process-capability': 'capability',
    'recommendations': 'recommendations'
  }

  const currentSection = tabToSection[activeTab]

  // Calculate overall progress percentage
  const progressPercentage = useMemo(() => {
    const requiredSections = ['voc', 'sipoc', 'vsm', 'fishbone', 'fmea', 'recommendations']
    const completedCount = requiredSections.filter(section =>
      sectionStatus[section as keyof typeof sectionStatus]?.completed
    ).length

    return requiredSections.length > 0
      ? Math.round((completedCount / requiredSections.length) * 100)
      : 0
  }, [sectionStatus])

  // Report progress to parent component
  useEffect(() => {
    if (onProgressCalculated) {
      onProgressCalculated(progressPercentage)
    }
  }, [progressPercentage, onProgressCalculated])

  return (
    <div className="w-full">
      {/* Horizontal Progress Bar */}
      <div className="mb-6 bg-white border-2 border-gray-300 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg">Assignment Progress</h3>
            <p className="text-sm text-gray-600 mt-1">
              Complete all required sections to finalize the assignment
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{progressPercentage}%</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-blue-600 to-green-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Section Status Indicators */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-4">
          {[
            { key: 'voc', label: 'VOC/CTQ' },
            { key: 'sipoc', label: 'SIPOC' },
            { key: 'vsm', label: 'VSM' },
            { key: 'fishbone', label: 'Fishbone' },
            { key: 'fmea', label: 'FMEA' },
            { key: 'recommendations', label: 'Recommendations' }
          ].map(({ key, label }) => {
            const status = sectionStatus[key as keyof typeof sectionStatus]
            const isComplete = status?.completed
            const hasData = status?.hasData
            
            return (
              <div 
                key={key}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                  isComplete 
                    ? 'bg-green-50 border-green-500' 
                    : hasData 
                    ? 'bg-blue-50 border-blue-400' 
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                ) : hasData ? (
                  <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
                <span className={`text-xs font-medium ${
                  isComplete ? 'text-green-700' : hasData ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full justify-start border-b-2 border-black bg-white h-auto flex-wrap">
        <TabsTrigger
          value="charter"
          className="data-[state=active]:bg-black data-[state=active]:text-white"
        >
          Charter
        </TabsTrigger>

        <TabsTrigger
          value="voc-ctq"
          className="data-[state=active]:bg-black data-[state=active]:text-white"
        >
          VOC/CTQ
          {counts.voc > 0 && (
            <span className="ml-2 text-xs">({counts.voc}/{counts.ctq})</span>
          )}
        </TabsTrigger>

        <TabsTrigger
          value="sipoc"
          className="data-[state=active]:bg-black data-[state=active]:text-white"
        >
          SIPOC
          {counts.sipoc > 0 && (
            <span className="ml-2 text-xs">({counts.sipoc})</span>
          )}
        </TabsTrigger>

        <TabsTrigger
          value="vsm"
          className="data-[state=active]:bg-black data-[state=active]:text-white"
        >
          VSM
          {counts.vsm > 0 && (
            <span className="ml-2 text-xs">({counts.vsm})</span>
          )}
        </TabsTrigger>

        <TabsTrigger
          value="pareto"
          className="data-[state=active]:bg-black data-[state=active]:text-white"
        >
          Pareto
        </TabsTrigger>

        <TabsTrigger
          value="fishbone"
          className="data-[state=active]:bg-black data-[state=active]:text-white"
        >
          Fishbone
          {counts.fishbone > 0 && (
            <span className="ml-2 text-xs">({counts.fishbone})</span>
          )}
        </TabsTrigger>

        <TabsTrigger
          value="fmea"
          className="data-[state=active]:bg-black data-[state=active]:text-white"
        >
          FMEA
          {counts.fmea > 0 && (
            <span className="ml-2 text-xs">({counts.fmea})</span>
          )}
        </TabsTrigger>

        <TabsTrigger
          value="process-capability"
          className="data-[state=active]:bg-black data-[state=active]:text-white"
        >
          Process Capability
        </TabsTrigger>

        <TabsTrigger
          value="recommendations"
          className="data-[state=active]:bg-black data-[state=active]:text-white"
        >
          Recommendations
          {counts.recommendations > 0 && (
            <span className="ml-2 text-xs">({counts.recommendations})</span>
          )}
        </TabsTrigger>

        {assignment.status === 'COMPLETED' && (
          <TabsTrigger
            value="ai-analysis"
            className="data-[state=active]:bg-black data-[state=active]:text-white"
          >
            AI Analysis
          </TabsTrigger>
        )}

        <TabsTrigger
          value="audit-log"
          className="data-[state=active]:bg-black data-[state=active]:text-white"
        >
          Audit Log
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="charter" className="space-y-4">
          <CharterSection
            assignmentId={assignment.id}
            charter={assignment.charter}
            canEdit={canEdit}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="voc-ctq" className="space-y-4">
          <VOCSection
            assignmentId={assignment.id}
            vocStatements={assignment.vocStatements}
            canEdit={canEdit}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="sipoc" className="space-y-4">
          <ProcessManager
            assignmentId={assignment.id}
            processes={assignment.processes}
            canEdit={canEdit}
            userId={userId}
          />
          <SIPOCSection
            assignmentId={assignment.id}
            processes={assignment.processes}
            canEdit={canEdit}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="vsm" className="space-y-4">
          <VSMSection
            assignmentId={assignment.id}
            processes={assignment.processes}
            canEdit={canEdit}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="pareto" className="space-y-4">
          <ParetoSection
            assignmentId={assignment.id}
            processes={assignment.processes}
          />
        </TabsContent>

        <TabsContent value="fishbone" className="space-y-4">
          <FishboneSectionEnhanced
            assignmentId={assignment.id}
            processes={assignment.processes}
            canEdit={canEdit}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="fmea" className="space-y-4">
          <FMEASection
            assignmentId={assignment.id}
            fmeaEntries={assignment.processes.flatMap(p => p.fmeaEntries)}
            canEdit={canEdit}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="process-capability" className="space-y-4">
          <ProcessCapabilitySection
            assignmentId={assignment.id}
            processes={assignment.processes}
            canEdit={canEdit}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <RecommendationsSection
            assignmentId={assignment.id}
            recommendations={assignment.recommendations}
            fmeaEntries={assignment.processes.flatMap(p => p.fmeaEntries)}
            processes={assignment.processes}
            canEdit={canEdit}
            userId={userId}
          />
        </TabsContent>

        {assignment.status === 'COMPLETED' && (
          <TabsContent value="ai-analysis" className="space-y-4">
            <AIAnalysisSection assignment={assignment} />
          </TabsContent>
        )}

        <TabsContent value="audit-log" className="space-y-4">
          <AuditLogSection assignmentId={assignment.id} auditLogs={assignment.auditLogs} />
        </TabsContent>
      </div>
    </Tabs>
      </div>
    </div>
  )
}