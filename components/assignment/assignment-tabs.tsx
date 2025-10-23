'use client'

import { useState, useEffect, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle2, Clock, Circle, Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
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
  const [isSheetOpen, setIsSheetOpen] = useState(false)

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

  // Calculate completion status - lenient criteria (1+ entry is enough)
  const sectionStatus = useMemo(() => ({
    voc: {
      completed: counts.voc >= 1 && counts.ctq >= 1, // At least 1 VOC and 1 CTQ
      hasData: counts.voc > 0
    },
    sipoc: {
      completed: counts.sipoc >= 1 && assignment.processes.length > 0, // At least 1 SIPOC entry
      hasData: counts.sipoc > 0
    },
    vsm: {
      completed: counts.vsm >= 1, // At least 1 VSM step
      hasData: counts.vsm > 0
    },
    fishbone: {
      completed: counts.fishbone >= 1, // At least 1 fishbone cause
      hasData: counts.fishbone > 0
    },
    fmea: {
      completed: counts.fmea >= 1, // At least 1 FMEA entry
      hasData: counts.fmea > 0
    },
    pareto: {
      completed: counts.vsm >= 1, // Optional - has VSM data
      hasData: counts.vsm > 0
    },
    capability: {
      completed: assignment.processes.some(p =>
        p.lowerSpecLimit !== null &&
        p.upperSpecLimit !== null &&
        p.sampleMean !== null &&
        p.sampleStdDev !== null
      ), // At least one process has capability data
      hasData: assignment.processes.some(p => p.sampleMean !== null)
    },
    recommendations: {
      completed: counts.recommendations >= 1, // At least 1 recommendation
      hasData: counts.recommendations > 0
    }
  }), [counts.voc, counts.ctq, counts.sipoc, counts.vsm, counts.fishbone, counts.fmea, counts.recommendations, assignment.processes])

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

  const _currentSection = tabToSection[activeTab]

  // Tab configuration with labels and counts
  const tabsConfig = [
    { value: 'charter', label: 'Charter', count: null },
    { value: 'voc-ctq', label: 'VOC/CTQ', count: counts.voc > 0 ? `${counts.voc}/${counts.ctq}` : null },
    { value: 'sipoc', label: 'SIPOC', count: counts.sipoc > 0 ? counts.sipoc : null },
    { value: 'vsm', label: 'VSM', count: counts.vsm > 0 ? counts.vsm : null },
    { value: 'pareto', label: 'Pareto', count: null },
    { value: 'fishbone', label: 'Fishbone', count: counts.fishbone > 0 ? counts.fishbone : null },
    { value: 'fmea', label: 'FMEA', count: counts.fmea > 0 ? counts.fmea : null },
    { value: 'process-capability', label: 'Process Capability', shortLabel: 'Capability', count: null },
    { value: 'recommendations', label: 'Recommendations', count: counts.recommendations > 0 ? counts.recommendations : null },
    ...(assignment.status === 'COMPLETED' ? [{ value: 'ai-analysis', label: 'AI Analysis', count: null }] : []),
    { value: 'audit-log', label: 'Audit Log', count: null }
  ]

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setIsSheetOpen(false)
  }

  const currentTabLabel = tabsConfig.find(t => t.value === activeTab)?.label || 'Charter'

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
      <div className="mb-6 bg-white border-2 border-gray-300 rounded-lg p-4 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-base md:text-lg">Assignment Progress</h3>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              Complete all required sections to finalize the assignment
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-2xl md:text-3xl font-bold text-blue-600">{progressPercentage}%</div>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-3 mt-4">
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
                className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-2 rounded-lg border-2 transition-all ${
                  isComplete
                    ? 'bg-green-50 border-green-500'
                    : hasData
                    ? 'bg-blue-50 border-blue-400'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-600 flex-shrink-0" />
                ) : hasData ? (
                  <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600 flex-shrink-0" />
                ) : (
                  <Circle className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400 flex-shrink-0" />
                )}
                <span className={`text-xs font-medium truncate ${
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
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      {/* Mobile: Burger Menu */}
      <div className="md:hidden mb-4">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-between border-2 border-black">
              <span className="font-medium">{currentTabLabel}</span>
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[320px]">
            <SheetHeader>
              <SheetTitle>Assignment Sections</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-2">
              {tabsConfig.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => handleTabChange(tab.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.value
                      ? 'bg-black text-white font-medium'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{tab.label}</span>
                    {tab.count && (
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        activeTab === tab.value ? 'bg-white text-black' : 'bg-gray-200'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Regular Tabs */}
      <div className="hidden md:block">
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
      </div>

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