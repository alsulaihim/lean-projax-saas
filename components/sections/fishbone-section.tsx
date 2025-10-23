'use client'

import { useState } from 'react'
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
import { Plus, Trash2, Edit2, Eye, EyeOff } from 'lucide-react'
import { FishboneDiagram } from '@/components/charts/fishbone-diagram'
import type { Prisma } from '@prisma/client'

type ProcessWithFishbone = Prisma.ProcessGetPayload<{
  include: {
    fishboneCategories: {
      include: { causes: true }
    }
  }
}>

interface FishboneSectionProps {
  assignmentId: string
  processes: ProcessWithFishbone[]
  canEdit: boolean
  userId: string
}

type CategoryType = 'PEOPLE' | 'PROCESS' | 'EQUIPMENT' | 'MATERIALS' | 'ENVIRONMENT' | 'MANAGEMENT'

export function FishboneSection({ assignmentId, processes, canEdit, userId }: FishboneSectionProps) {
  const router = useRouter()
  const [selectedProcess, setSelectedProcess] = useState<string>(processes[0]?.id || '')
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
    PEOPLE: 'People (Manpower)',
    PROCESS: 'Process (Method)',
    EQUIPMENT: 'Equipment (Machine)',
    MATERIALS: 'Materials',
    ENVIRONMENT: 'Environment',
    MANAGEMENT: 'Management (Measurement)'
  }

  const categoryIcons: Record<CategoryType, string> = {
    PEOPLE: '👥',
    PROCESS: '⚙️',
    EQUIPMENT: '🔧',
    MATERIALS: '📦',
    ENVIRONMENT: '🌍',
    MANAGEMENT: '📊'
  }

  // Get or create category for each type
  const getCategoryData = (categoryType: CategoryType) => {
    const category = currentProcess?.fishboneCategories.find(c => c.category === categoryType)
    return category
  }

  const handleAddCause = async () => {
    if (!currentProcess) return

    setLoading(true)
    try {
      // First, ensure category exists
      let category = getCategoryData(causeForm.category)

      if (!category) {
        const categoryResponse = await fetch('/api/fishbone-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            processId: currentProcess.id,
            assignmentId,
            userId,
            category: causeForm.category,
            order: categories.indexOf(causeForm.category) + 1
          })
        })

        if (!categoryResponse.ok) {
          throw new Error('Failed to create category')
        }

        category = await categoryResponse.json()
      }

      // Then add the cause
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

  return (
    <div className="space-y-6">
      <Card className="border-2 border-black">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Fishbone Diagram (Ishikawa)</CardTitle>
              <CardDescription className="mt-1">
                Root cause analysis using 6M categories - Identify potential causes of problems
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
              <Select value={selectedProcess} onValueChange={setSelectedProcess}>
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

          {/* Visual Fishbone Diagram */}
          {showVisualization && currentProcess && (
            <FishboneDiagram
              problemStatement={currentProcess.processName}
              categories={currentProcess.fishboneCategories.map(cat => ({
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
          <div className="grid grid-cols-2 gap-4">
            {categories.map(categoryType => {
              const category = getCategoryData(categoryType)
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
                                <span className="text-sm flex-1">{cause.causeDescription}</span>
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
                        No causes identified
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Add Cause Form */}
          {canEdit && (
            <>
              {!isAddingCause ? (
                <Button
                  onClick={() => setIsAddingCause(true)}
                  className="bg-black text-white hover:bg-gray-800"
                  disabled={loading || !currentProcess}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Root Cause
                </Button>
              ) : (
                <Card className="border-2 border-black">
                  <CardHeader>
                    <CardTitle className="text-lg">Add Root Cause</CardTitle>
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
                        placeholder="Describe the potential root cause..."
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