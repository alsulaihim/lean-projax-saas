'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Plus, Trash2, Edit2, Eye, EyeOff, ChevronRight, AlertCircle } from 'lucide-react'
import { FishboneDiagram } from '@/components/charts/fishbone-diagram'
import type { Prisma } from '@prisma/client'

type ProcessWithFishboneAndVSM = Prisma.ProcessGetPayload<{
  include: {
    fishboneCategories: {
      include: { causes: true }
    }
    vsmSteps: true
  }
}>

interface FishboneSectionEnhancedProps {
  assignmentId: string
  processes: ProcessWithFishboneAndVSM[]
  canEdit: boolean
  userId: string
}

type CategoryType = 'PEOPLE' | 'PROCESS' | 'EQUIPMENT' | 'MATERIALS' | 'ENVIRONMENT' | 'MANAGEMENT'

// Calculate Pareto analysis for a process
function calculatePareto<T extends {
  processTime?: number | null
  durationMinutes?: number | null
  waitingTime?: number | null
  waitTimeMinutes?: number | null
}>(steps: T[]) {
  // Sort steps by total time (process + waiting) in descending order
  const sortedSteps = steps
    .map(step => ({
      ...step,
      totalTime: (step.processTime || step.durationMinutes || 0) +
                 (step.waitingTime || step.waitTimeMinutes || 0)
    }))
    .sort((a, b) => b.totalTime - a.totalTime)

  // Calculate cumulative percentages
  const total = sortedSteps.reduce((sum, step) => sum + step.totalTime, 0)
  let cumulative = 0

  return sortedSteps.map(step => {
    cumulative += step.totalTime
    const cumulativePercentage = (cumulative / total) * 100
    return {
      ...step,
      percentage: (step.totalTime / total) * 100,
      cumulativePercentage,
      isVitalFew: cumulativePercentage <= 80
    }
  })
}

export function FishboneSectionEnhanced({ assignmentId, processes, canEdit, userId }: FishboneSectionEnhancedProps) {
  const router = useRouter()
  const [selectedProcess, setSelectedProcess] = useState<string>(processes[0]?.id || '')
  const [activeFishbone, setActiveFishbone] = useState(0)
  const [isAddingCause, setIsAddingCause] = useState(false)
  const [editingCause, setEditingCause] = useState<string | null>(null)
  const [showVisualization, setShowVisualization] = useState(true)
  const [loading, setLoading] = useState(false)

  const [causeForm, setCauseForm] = useState({
    category: 'PEOPLE' as CategoryType,
    causeDescription: ''
  })

  const [editForm, setEditForm] = useState({
    causeDescription: ''
  })

  const currentProcess = processes.find(p => p.id === selectedProcess)

  const categories: CategoryType[] = ['PEOPLE', 'PROCESS', 'EQUIPMENT', 'MATERIALS', 'ENVIRONMENT', 'MANAGEMENT']

  const categoryLabels: Record<CategoryType, string> = {
    PEOPLE: 'Manpower (People)',
    PROCESS: 'Method (Process)',
    EQUIPMENT: 'Machine (Equipment)',
    MATERIALS: 'Materials',
    ENVIRONMENT: 'Environment',
    MANAGEMENT: 'Management'
  }

  const categoryIcons: Record<CategoryType, string> = {
    PEOPLE: '👥',
    PROCESS: '⚙️',
    EQUIPMENT: '🔧',
    MATERIALS: '📦',
    ENVIRONMENT: '🌍',
    MANAGEMENT: '📊'
  }

  // Calculate Pareto analysis and vital few steps
  const paretoData = useMemo(() => {
    if (!currentProcess || !currentProcess.vsmSteps || currentProcess.vsmSteps.length === 0) {
      return { vitalSteps: [], totalCycleTime: 0 }
    }

    const paretoAnalysis = calculatePareto(currentProcess.vsmSteps)
    const vitalSteps = paretoAnalysis.filter(step => step.isVitalFew)
    const totalCycleTime = paretoAnalysis.reduce((sum, step) => sum + step.totalTime, 0)

    return {
      vitalSteps,
      totalCycleTime,
      paretoAnalysis
    }
  }, [currentProcess])

  // Group fishbone categories by vital few steps
  const fishbonesByStep = useMemo(() => {
    if (!currentProcess || paretoData.vitalSteps.length === 0) {
      return []
    }

    const categoriesPerStep = 6
    const fishbones = []

    for (let i = 0; i < paretoData.vitalSteps.length; i++) {
      const step = paretoData.vitalSteps[i]
      const startIdx = i * categoriesPerStep
      const endIdx = Math.min(startIdx + categoriesPerStep, currentProcess.fishboneCategories.length)

      // Get categories for this step
      const stepCategories = currentProcess.fishboneCategories
        .sort((a, b) => a.order - b.order)
        .slice(startIdx, endIdx)

      fishbones.push({
        step,
        categories: stepCategories
      })
    }

    return fishbones
  }, [currentProcess, paretoData.vitalSteps])

  const handleAddCause = async () => {
    if (!currentProcess) return

    setLoading(true)
    try {
      // Determine which fishbone we're adding to
      const currentFishboneData = fishbonesByStep[activeFishbone]
      if (!currentFishboneData) return

      // Find the category in the current fishbone
      let category = currentFishboneData.categories.find(c => c.category === causeForm.category)

      if (!category) {
        // Create category for this fishbone
        const baseOrder = activeFishbone * categories.length
        const categoryResponse = await fetch('/api/fishbone-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            processId: currentProcess.id,
            assignmentId,
            userId,
            category: causeForm.category,
            order: baseOrder + categories.indexOf(causeForm.category)
          })
        })

        if (!categoryResponse.ok) {
          throw new Error('Failed to create category')
        }

        category = await categoryResponse.json()
      }

      // Add the cause
      const response = await fetch('/api/fishbone-causes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: category?.id,
          assignmentId,
          userId,
          causeDescription: causeForm.causeDescription,
          order: (category?.causes?.length || 0) + 1
        })
      })

      if (response.ok) {
        setIsAddingCause(false)
        setCauseForm({
          category: 'PEOPLE',
          causeDescription: ''
        })
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to add cause:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCause = async (causeId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/fishbone-causes/${causeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          causeDescription: editForm.causeDescription,
          userId,
          assignmentId
        })
      })

      if (response.ok) {
        setEditingCause(null)
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to update cause:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCause = async (causeId: string) => {
    if (!confirm('Are you sure you want to delete this cause?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/fishbone-causes/${causeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, assignmentId })
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to delete cause:', error)
    } finally {
      setLoading(false)
    }
  }

  if (processes.length === 0) {
    return (
      <Card className="border-2 border-black">
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">Please add at least one process before creating a Fishbone diagram</p>
        </CardContent>
      </Card>
    )
  }

  const currentFishboneData = fishbonesByStep[activeFishbone]

  return (
    <div className="space-y-6">
      <Card className="border-2 border-black">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Fishbone Diagram (Ishikawa)</CardTitle>
              <CardDescription className="mt-1">
                Root cause analysis for vital few steps (Pareto ≤80%) - One fishbone per critical step
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowVisualization(!showVisualization)}
              className="flex items-center gap-2"
            >
              {showVisualization ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Hide Diagram
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Show Diagram
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Process Selector */}
          {processes.length > 1 && (
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Select Process:</label>
              <Select value={selectedProcess} onValueChange={(value) => {
                setSelectedProcess(value)
                setActiveFishbone(0)
              }}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {processes.map(process => (
                    <SelectItem key={process.id} value={process.id}>
                      {process.processName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Vital Few Steps Info */}
          {currentProcess && paretoData.vitalSteps.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">
                    {paretoData.vitalSteps.length} Vital Few Steps Identified (≤80% Cumulative Impact)
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Each vital step has its own fishbone diagram analyzing root causes specific to that step
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Fishbone Navigation */}
          {fishbonesByStep.length > 0 && (
            <>
              {/* Step Tabs */}
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>{fishbonesByStep.length}</strong> fishbone diagram(s) for vital few steps
                </p>
                <div className="flex gap-2 flex-wrap">
                  {fishbonesByStep.map((fishbone, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveFishbone(idx)}
                      className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                        idx === activeFishbone
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {fishbone.step.stepName.length > 20
                        ? `${fishbone.step.stepName.substring(0, 20)}...`
                        : fishbone.step.stepName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              {fishbonesByStep.length > 1 && (
                <div className="flex justify-center gap-2 mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setActiveFishbone(Math.max(0, activeFishbone - 1))}
                    disabled={activeFishbone === 0}
                  >
                    ← Previous Step
                  </Button>
                  <span className="px-4 py-2 text-sm">
                    Step {activeFishbone + 1} of {fishbonesByStep.length}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setActiveFishbone(Math.min(fishbonesByStep.length - 1, activeFishbone + 1))}
                    disabled={activeFishbone === fishbonesByStep.length - 1}
                  >
                    Next Step →
                  </Button>
                </div>
              )}

              {/* Current Step Info */}
              {currentFishboneData && (
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-bold text-xl text-gray-800 mb-1">
                    {currentFishboneData.step.stepName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Cycle Time: {currentFishboneData.step.totalTime.toFixed(1)} min |
                    Contribution: {currentFishboneData.step.percentage.toFixed(1)}% |
                    Cumulative: {currentFishboneData.step.cumulativePercentage.toFixed(1)}%
                  </p>
                </div>
              )}

              {/* Visual Fishbone Diagram */}
              {showVisualization && currentFishboneData && currentProcess && (
                <FishboneDiagram
                  problemStatement={`${currentProcess.processName}: ${currentFishboneData.step.stepName}`}
                  categories={currentFishboneData.categories.map(cat => ({
                    id: cat.id,
                    categoryName: categoryLabels[cat.category as CategoryType] || cat.category,
                    causes: cat.causes.map(cause => ({
                      id: cause.id,
                      causeName: cause.causeDescription,
                      description: null
                    }))
                  }))}
                  height={600}
                  className="mb-6"
                />
              )}

              {/* Categories Grid */}
              {currentFishboneData && (
                <div className="grid grid-cols-2 gap-4">
                  {categories.map(categoryType => {
                    const category = currentFishboneData.categories.find(c => c.category === categoryType)
                    const causes = category?.causes.sort((a, b) => a.order - b.order) || []

                    return (
                      <Card key={categoryType} className="border-2 border-gray-300">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <span className="text-2xl">{categoryIcons[categoryType]}</span>
                            {categoryLabels[categoryType]}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {causes.length > 0 ? (
                            <div className="space-y-2">
                              {causes.map(cause => (
                                <div
                                  key={cause.id}
                                  className="flex items-start justify-between gap-2 p-2 border border-gray-200 rounded hover:bg-gray-50"
                                >
                                  {editingCause === cause.id ? (
                                    <div className="flex-1 flex gap-2">
                                      <Input
                                        value={editForm.causeDescription}
                                        onChange={(e) => setEditForm({ causeDescription: e.target.value })}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleUpdateCause(cause.id)
                                          } else if (e.key === 'Escape') {
                                            setEditingCause(null)
                                          }
                                        }}
                                        autoFocus
                                        className="text-sm"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleUpdateCause(cause.id)}
                                        disabled={loading}
                                        className="text-green-600"
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingCause(null)}
                                        disabled={loading}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  ) : (
                                    <>
                                      <span className="text-sm flex-1">
                                        <ChevronRight className="h-4 w-4 text-blue-500 inline mr-1" />
                                        {cause.causeDescription}
                                      </span>
                                      {canEdit && (
                                        <div className="flex gap-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              setEditingCause(cause.id)
                                              setEditForm({ causeDescription: cause.causeDescription })
                                            }}
                                            className="h-6 w-6 p-0"
                                          >
                                            <Edit2 className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteCause(cause.id)}
                                            className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-4">
                              No causes identified for this category
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* No Vital Steps Message */}
          {currentProcess && paretoData.vitalSteps.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No vital few steps identified for this process.</p>
              <p className="text-sm text-gray-500 mt-1">Add VSM steps with cycle times to enable Pareto analysis.</p>
            </div>
          )}

          {/* Add Cause Form */}
          {canEdit && currentFishboneData && (
            <>
              {!isAddingCause ? (
                <Button
                  onClick={() => setIsAddingCause(true)}
                  className="bg-black text-white hover:bg-gray-800"
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Root Cause for {currentFishboneData.step.stepName}
                </Button>
              ) : (
                <Card className="border-2 border-black">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Add Root Cause for: {currentFishboneData.step.stepName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Category</label>
                      <Select
                        value={causeForm.category}
                        onValueChange={(value: CategoryType) => setCauseForm({ ...causeForm, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>
                              {categoryIcons[cat]} {categoryLabels[cat]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Cause Description</label>
                      <Textarea
                        placeholder={`Describe the potential root cause for "${currentFishboneData.step.stepName}"...`}
                        value={causeForm.causeDescription}
                        onChange={(e) => setCauseForm({ ...causeForm, causeDescription: e.target.value })}
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingCause(false)
                          setCauseForm({
                            category: 'PEOPLE',
                            causeDescription: ''
                          })
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddCause}
                        disabled={!causeForm.causeDescription || loading}
                        className="bg-black text-white hover:bg-gray-800"
                      >
                        Add Cause
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}