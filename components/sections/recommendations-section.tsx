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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Edit2, CheckCircle2, Circle } from 'lucide-react'
import type {
  Recommendation,
  FMEAEntry,
  ImplementationDifficulty,
  RecommendationStatus,
} from '@prisma/client'
import type { Prisma } from '@prisma/client'

type ProcessWithFishbone = Prisma.ProcessGetPayload<{
  include: {
    fishboneCategories: {
      include: { causes: true }
    }
  }
}>

interface RecommendationsSectionProps {
  assignmentId: string
  recommendations: Recommendation[]
  fmeaEntries: FMEAEntry[]
  processes: ProcessWithFishbone[]
  canEdit: boolean
  userId: string
}

export function RecommendationsSection({
  assignmentId,
  recommendations,
  fmeaEntries,
  processes,
  canEdit,
  userId,
}: RecommendationsSectionProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [editingRec, setEditingRec] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [recForm, setRecForm] = useState({
    recommendationTitle: '',
    description: '',
    expectedImpact: '',
    implementationDifficulty: 'MEDIUM' as ImplementationDifficulty,
    estimatedCostSavings: '',
    linkedFMEAIds: [] as string[],
    linkedFishboneCauseIds: [] as string[],
    status: 'PROPOSED' as RecommendationStatus,
  })

  const [editForm, setEditForm] = useState({
    recommendationTitle: '',
    description: '',
    expectedImpact: '',
    implementationDifficulty: 'MEDIUM' as ImplementationDifficulty,
    estimatedCostSavings: '',
    status: 'PROPOSED' as RecommendationStatus,
  })

  // Collect all fishbone causes
  const allFishboneCauses = processes.flatMap(p =>
    p.fishboneCategories.flatMap(cat =>
      cat.causes.map(cause => ({
        id: cause.id,
        description: cause.causeDescription,
        category: cat.category,
        processName: p.processName,
      }))
    )
  )

  const sortedRecs = [...recommendations].sort((a, b) => {
    if (a.status !== b.status) {
      const statusOrder = { PROPOSED: 0, APPROVED: 1, IMPLEMENTED: 2 }
      return statusOrder[a.status] - statusOrder[b.status]
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const difficultyColors = {
    LOW: 'bg-green-100 text-green-800 border-green-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    HIGH: 'bg-red-100 text-red-800 border-red-300',
  }

  const statusIcons = {
    PROPOSED: <Circle className="h-4 w-4 text-gray-500" />,
    APPROVED: <CheckCircle2 className="h-4 w-4 text-blue-500" />,
    IMPLEMENTED: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  }

  const statusLabels = {
    PROPOSED: 'Proposed',
    APPROVED: 'Approved',
    IMPLEMENTED: 'Implemented',
  }

  const handleAddRecommendation = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          userId,
          ...recForm,
        }),
      })

      if (response.ok) {
        setIsAdding(false)
        setRecForm({
          recommendationTitle: '',
          description: '',
          expectedImpact: '',
          implementationDifficulty: 'MEDIUM',
          estimatedCostSavings: '',
          linkedFMEAIds: [],
          linkedFishboneCauseIds: [],
          status: 'PROPOSED',
        })
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to add recommendation:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRecommendation = async (recId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/recommendations/${recId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          userId,
          assignmentId,
        }),
      })

      if (response.ok) {
        setEditingRec(null)
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to update recommendation:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRecommendation = async (recId: string) => {
    if (!confirm('Are you sure you want to delete this recommendation?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/recommendations/${recId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, assignmentId }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to delete recommendation:', error)
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (rec: Recommendation) => {
    setEditingRec(rec.id)
    setEditForm({
      recommendationTitle: rec.recommendationTitle,
      description: rec.description,
      expectedImpact: rec.expectedImpact,
      implementationDifficulty: rec.implementationDifficulty,
      estimatedCostSavings: rec.estimatedCostSavings || '',
      status: rec.status,
    })
  }

  const getLinkedItems = (rec: Recommendation) => {
    const linkedFMEA = fmeaEntries.filter(f => rec.linkedFMEAIds.includes(f.id))
    const linkedCauses = allFishboneCauses.filter(c => rec.linkedFishboneCauseIds.includes(c.id))
    return { linkedFMEA, linkedCauses }
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-black">
        <CardHeader>
          <CardTitle className="text-2xl">Recommendations</CardTitle>
          <CardDescription>
            Actionable recommendations linked to root causes and FMEA entries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          {sortedRecs.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              <Card className="border border-gray-300">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Total</p>
                    <p className="text-2xl font-bold">{sortedRecs.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-gray-300">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Proposed</p>
                    <p className="text-2xl font-bold">
                      {sortedRecs.filter(r => r.status === 'PROPOSED').length}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-gray-300">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Approved</p>
                    <p className="text-2xl font-bold">
                      {sortedRecs.filter(r => r.status === 'APPROVED').length}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-gray-300">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Implemented</p>
                    <p className="text-2xl font-bold">
                      {sortedRecs.filter(r => r.status === 'IMPLEMENTED').length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recommendations Table */}
          {sortedRecs.length > 0 ? (
            <div className="space-y-4">
              {sortedRecs.map(rec => {
                const { linkedFMEA, linkedCauses } = getLinkedItems(rec)
                const isEditing = editingRec === rec.id

                return (
                  <Card key={rec.id} className="border-2 border-gray-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {isEditing ? (
                            <Input
                              value={editForm.recommendationTitle}
                              onChange={e =>
                                setEditForm({ ...editForm, recommendationTitle: e.target.value })
                              }
                              className="text-lg font-bold mb-2"
                            />
                          ) : (
                            <CardTitle className="text-xl">{rec.recommendationTitle}</CardTitle>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="flex items-center gap-1">
                              {statusIcons[rec.status]}
                              <span className="text-sm">{statusLabels[rec.status]}</span>
                            </span>
                            <span
                              className={`px-2 py-1 text-xs border rounded ${difficultyColors[rec.implementationDifficulty]}`}
                            >
                              {rec.implementationDifficulty} Difficulty
                            </span>
                            {rec.estimatedCostSavings && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 border border-blue-300 rounded">
                                {rec.estimatedCostSavings}
                              </span>
                            )}
                          </div>
                        </div>
                        {canEdit && !isEditing && (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(rec)}
                              disabled={loading}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRecommendation(rec.id)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditing ? (
                        <>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Description</label>
                            <Textarea
                              value={editForm.description}
                              onChange={e =>
                                setEditForm({ ...editForm, description: e.target.value })
                              }
                              className="min-h-[80px]"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              Expected Impact
                            </label>
                            <Textarea
                              value={editForm.expectedImpact}
                              onChange={e =>
                                setEditForm({ ...editForm, expectedImpact: e.target.value })
                              }
                              className="min-h-[60px]"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Difficulty</label>
                              <Select
                                value={editForm.implementationDifficulty}
                                onValueChange={(value: ImplementationDifficulty) =>
                                  setEditForm({ ...editForm, implementationDifficulty: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="LOW">Low</SelectItem>
                                  <SelectItem value="MEDIUM">Medium</SelectItem>
                                  <SelectItem value="HIGH">High</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Status</label>
                              <Select
                                value={editForm.status}
                                onValueChange={(value: RecommendationStatus) =>
                                  setEditForm({ ...editForm, status: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PROPOSED">Proposed</SelectItem>
                                  <SelectItem value="APPROVED">Approved</SelectItem>
                                  <SelectItem value="IMPLEMENTED">Implemented</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Est. Cost Savings
                              </label>
                              <Input
                                value={editForm.estimatedCostSavings}
                                onChange={e =>
                                  setEditForm({ ...editForm, estimatedCostSavings: e.target.value })
                                }
                                placeholder="$10,000/year"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setEditingRec(null)}
                              disabled={loading}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleUpdateRecommendation(rec.id)}
                              disabled={loading}
                              className="bg-black text-white hover:bg-gray-800"
                            >
                              Save Changes
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                            <p className="text-sm">{rec.description}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">
                              Expected Impact
                            </p>
                            <p className="text-sm">{rec.expectedImpact}</p>
                          </div>
                          {(linkedFMEA.length > 0 || linkedCauses.length > 0) && (
                            <div className="bg-gray-50 p-4 rounded border border-gray-200">
                              <p className="text-sm font-medium mb-2">Linked to:</p>
                              {linkedFMEA.length > 0 && (
                                <div className="mb-2">
                                  <p className="text-xs font-medium text-gray-500 mb-1">
                                    FMEA Entries:
                                  </p>
                                  <ul className="list-disc list-inside text-xs space-y-1">
                                    {linkedFMEA.map(f => (
                                      <li key={f.id}>
                                        {f.failureMode} (RPN: {f.rpn})
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {linkedCauses.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-gray-500 mb-1">
                                    Root Causes:
                                  </p>
                                  <ul className="list-disc list-inside text-xs space-y-1">
                                    {linkedCauses.map(c => (
                                      <li key={c.id}>
                                        {c.description} ({c.category})
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 mb-4">No recommendations yet</p>
              </CardContent>
            </Card>
          )}

          {/* Add Recommendation Form */}
          {canEdit && (
            <>
              {!isAdding ? (
                <Button
                  onClick={() => setIsAdding(true)}
                  className="bg-black text-white hover:bg-gray-800"
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Recommendation
                </Button>
              ) : (
                <Card className="border-2 border-black">
                  <CardHeader>
                    <CardTitle className="text-lg">Add Recommendation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Title</label>
                      <Input
                        placeholder="Brief title for the recommendation"
                        value={recForm.recommendationTitle}
                        onChange={e =>
                          setRecForm({ ...recForm, recommendationTitle: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Description</label>
                      <Textarea
                        placeholder="Detailed description of the recommendation..."
                        value={recForm.description}
                        onChange={e => setRecForm({ ...recForm, description: e.target.value })}
                        className="min-h-[100px]"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Expected Impact</label>
                      <Textarea
                        placeholder="What impact will this have?"
                        value={recForm.expectedImpact}
                        onChange={e => setRecForm({ ...recForm, expectedImpact: e.target.value })}
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Implementation Difficulty
                        </label>
                        <Select
                          value={recForm.implementationDifficulty}
                          onValueChange={(value: ImplementationDifficulty) =>
                            setRecForm({ ...recForm, implementationDifficulty: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Estimated Cost Savings (optional)
                        </label>
                        <Input
                          placeholder="e.g., $10,000/year"
                          value={recForm.estimatedCostSavings}
                          onChange={e =>
                            setRecForm({ ...recForm, estimatedCostSavings: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAdding(false)
                          setRecForm({
                            recommendationTitle: '',
                            description: '',
                            expectedImpact: '',
                            implementationDifficulty: 'MEDIUM',
                            estimatedCostSavings: '',
                            linkedFMEAIds: [],
                            linkedFishboneCauseIds: [],
                            status: 'PROPOSED',
                          })
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddRecommendation}
                        disabled={
                          !recForm.recommendationTitle ||
                          !recForm.description ||
                          !recForm.expectedImpact ||
                          loading
                        }
                        className="bg-black text-white hover:bg-gray-800"
                      >
                        Add Recommendation
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
