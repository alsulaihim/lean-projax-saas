'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  Circle,
  Clock,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Lock,
  Unlock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationStep {
  id: string
  title: string
  description: string
  path: string
  status: 'completed' | 'in-progress' | 'pending' | 'locked'
  dependencies?: string[]
  completionCriteria?: string[]
  isOptional?: boolean
}

interface ProgressNavigationProps {
  assignmentId: string
  sections: {
    voc: { completed: boolean; hasData: boolean }
    sipoc: { completed: boolean; hasData: boolean }
    vsm: { completed: boolean; hasData: boolean }
    fishbone: { completed: boolean; hasData: boolean }
    fmea: { completed: boolean; hasData: boolean }
    pareto: { completed: boolean; hasData: boolean }
    capability: { completed: boolean; hasData: boolean }
    recommendations: { completed: boolean; hasData: boolean }
  }
  currentSection?: string
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function ProgressNavigation({
  assignmentId,
  sections,
  currentSection,
  isCollapsed = false,
  onToggleCollapse
}: ProgressNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [expandedSection, setExpandedSection] = useState<string | null>(currentSection || 'voc')

  // Define the workflow steps with dependencies
  const steps: NavigationStep[] = [
    {
      id: 'voc',
      title: 'Voice of Customer (VOC)',
      description: 'Define customer needs and translate them into CTQ requirements',
      path: `/assignments/${assignmentId}#voc`,
      status: sections.voc.completed ? 'completed' : sections.voc.hasData ? 'in-progress' : 'pending',
      completionCriteria: [
        'At least 3 VOC statements',
        'Each VOC has at least 2 CTQ requirements'
      ]
    },
    {
      id: 'sipoc',
      title: 'SIPOC Analysis',
      description: 'Map suppliers, inputs, processes, outputs, and customers',
      path: `/assignments/${assignmentId}#sipoc`,
      status: sections.sipoc.completed ? 'completed' : sections.sipoc.hasData ? 'in-progress' : sections.voc.completed ? 'pending' : 'locked',
      dependencies: ['voc'],
      completionCriteria: [
        'All SIPOC elements defined',
        'Process boundaries clearly established'
      ]
    },
    {
      id: 'vsm',
      title: 'Value Stream Mapping',
      description: 'Visualize the flow of materials and information',
      path: `/assignments/${assignmentId}#vsm`,
      status: sections.vsm.completed ? 'completed' : sections.vsm.hasData ? 'in-progress' : sections.sipoc.completed ? 'pending' : 'locked',
      dependencies: ['sipoc'],
      completionCriteria: [
        'All process steps mapped',
        'Cycle times and wait times recorded',
        'Value-add vs non-value-add identified'
      ]
    },
    {
      id: 'fishbone',
      title: 'Fishbone Diagram',
      description: 'Identify root causes using 6M categories',
      path: `/assignments/${assignmentId}#fishbone`,
      status: sections.fishbone.completed ? 'completed' : sections.fishbone.hasData ? 'in-progress' : sections.vsm.completed ? 'pending' : 'locked',
      dependencies: ['vsm'],
      completionCriteria: [
        'At least 3 causes per category',
        'All 6M categories addressed'
      ]
    },
    {
      id: 'fmea',
      title: 'FMEA Analysis',
      description: 'Assess failure modes and calculate risk priority numbers',
      path: `/assignments/${assignmentId}#fmea`,
      status: sections.fmea.completed ? 'completed' : sections.fmea.hasData ? 'in-progress' : sections.fishbone.completed ? 'pending' : 'locked',
      dependencies: ['fishbone'],
      completionCriteria: [
        'All failure modes identified',
        'Severity, occurrence, detection rated',
        'RPN calculated for each mode'
      ]
    },
    {
      id: 'pareto',
      title: 'Pareto Analysis',
      description: 'Identify the vital few factors contributing to 80% of issues',
      path: `/assignments/${assignmentId}#pareto`,
      status: sections.pareto.completed ? 'completed' : sections.pareto.hasData ? 'in-progress' : sections.vsm.hasData ? 'pending' : 'locked',
      dependencies: ['vsm'],
      completionCriteria: [
        'Data analyzed for 80/20 rule',
        'Vital few factors identified'
      ],
      isOptional: true
    },
    {
      id: 'capability',
      title: 'Process Capability',
      description: 'Calculate Cp and Cpk to measure process performance',
      path: `/assignments/${assignmentId}#capability`,
      status: sections.capability.completed ? 'completed' : sections.capability.hasData ? 'in-progress' : sections.vsm.completed ? 'pending' : 'locked',
      dependencies: ['vsm'],
      completionCriteria: [
        'Specification limits defined',
        'Sample data collected',
        'Cp and Cpk calculated'
      ],
      isOptional: true
    },
    {
      id: 'recommendations',
      title: 'Recommendations',
      description: 'Provide improvement recommendations based on analysis',
      path: `/assignments/${assignmentId}#recommendations`,
      status: sections.recommendations.completed ? 'completed' : sections.recommendations.hasData ? 'in-progress' : sections.fmea.completed ? 'pending' : 'locked',
      dependencies: ['fmea'],
      completionCriteria: [
        'At least 5 recommendations',
        'Priority and impact defined',
        'Implementation timeline suggested'
      ]
    }
  ]

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
      case 'locked':
        return <Lock className="h-4 w-4 text-gray-400" />
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStepBadge = (step: NavigationStep) => {
    if (step.isOptional) {
      return <Badge variant="outline" className="text-xs">Optional</Badge>
    }
    if (step.status === 'locked') {
      return <Badge variant="outline" className="text-xs">Locked</Badge>
    }
    return null
  }

  const navigateToStep = (step: NavigationStep) => {
    if (step.status !== 'locked') {
      router.push(step.path)
    }
  }

  // Only count required (non-optional) completed sections for progress
  const completedCount = steps.filter(s => !s.isOptional && s.status === 'completed').length
  const totalRequired = steps.filter(s => !s.isOptional).length
  const progressPercentage = totalRequired > 0 ? Math.round((completedCount / totalRequired) * 100) : 0

  if (isCollapsed) {
    return (
      <div className="sticky top-4">
        <Button
          onClick={onToggleCollapse}
          variant="outline"
          size="sm"
          className="w-full flex items-center justify-center gap-2 py-6 bg-white hover:bg-gray-50 border-2 border-gray-300 shadow-sm transition-all duration-200"
          title="Expand sidebar"
        >
          <ChevronRight className="h-5 w-5" />
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-blue-600">{progressPercentage}%</span>
            <span className="text-xs text-gray-500">Progress</span>
          </div>
        </Button>
      </div>
    )
  }

  return (
    <Card className="border-2 border-gray-300 sticky top-4 max-w-full transition-all duration-300">
      <CardContent className="p-4 overflow-x-hidden overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-lg break-all whitespace-normal">Assignment Progress</h3>
            <p className="text-sm text-gray-600 mt-1 break-all whitespace-normal">
              {completedCount} of {totalRequired} required steps completed
            </p>
          </div>
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="ml-2 flex-shrink-0 hover:bg-gray-100"
              title="Collapse sidebar"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1 text-center">{progressPercentage}% Complete</p>
        </div>

        {/* Navigation Steps */}
        <div className="space-y-2">
          {steps.map((step, index) => {
            const isActive = currentSection === step.id
            const canNavigate = step.status !== 'locked'

            return (
              <div key={step.id} className="relative">
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start text-left p-3 h-auto',
                    !canNavigate && 'opacity-50 cursor-not-allowed',
                    isActive && 'border-2 border-black'
                  )}
                  onClick={() => {
                    if (canNavigate) {
                      navigateToStep(step)
                      setExpandedSection(expandedSection === step.id ? null : step.id)
                    }
                  }}
                >
                  <div className="flex items-start w-full gap-2">
                    <div className="mt-0.5 flex-shrink-0">
                      {getStepIcon(step.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "font-medium text-sm leading-tight break-all whitespace-normal",
                            isActive && "text-white"
                          )}>{step.title}</div>
                          <div className={cn(
                            "text-xs mt-0.5 leading-tight break-all whitespace-normal",
                            isActive ? "text-gray-300" : "text-gray-600"
                          )}>
                            {step.description}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {getStepBadge(step)}
                          <div className={isActive ? "text-white" : ""}>
                            {expandedSection === step.id ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Button>

                {/* Expanded Completion Criteria */}
                {expandedSection === step.id && step.completionCriteria && (
                  <div className="mt-2 ml-8 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Completion Requirements:</p>
                    <ul className="space-y-1">
                      {step.completionCriteria.map((criteria, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                          <span className="text-gray-400 mt-0.5">•</span>
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="ml-7 border-l-2 border-gray-300 h-2" />
                )}
              </div>
            )
          })}
        </div>

        {/* Next Step Suggestion */}
        {(() => {
          const nextStep = steps.find(s => s.status === 'pending' || s.status === 'in-progress')
          if (nextStep && nextStep.status !== 'locked') {
            return (
              <Card className="mt-4 border border-blue-300 bg-blue-50 overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-blue-900">Next Step</p>
                      <p className="text-xs text-blue-800 mt-1 break-all whitespace-normal">
                        Continue with: {nextStep.title}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 text-xs"
                        onClick={() => navigateToStep(nextStep)}
                      >
                        <span className="break-all whitespace-normal">Go to {nextStep.title}</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          }
          return null
        })()}
      </CardContent>
    </Card>
  )
}