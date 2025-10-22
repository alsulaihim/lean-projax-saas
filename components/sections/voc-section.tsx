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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import type { Prisma } from '@prisma/client'

type VOCWithCTQ = Prisma.VOCStatementGetPayload<{
  include: { ctqRequirements: true }
}>

interface VOCSectionProps {
  assignmentId: string
  vocStatements: VOCWithCTQ[]
  canEdit: boolean
  userId: string
}

export function VOCSection({ assignmentId, vocStatements, canEdit, userId: _userId }: VOCSectionProps) {
  const router = useRouter()
  const [isAddingVOC, setIsAddingVOC] = useState(false)
  const [expandedVOCs, setExpandedVOCs] = useState<Set<string>>(new Set())
  const [_editingVOC, _setEditingVOC] = useState<string | null>(null)
  const [addingCTQ, setAddingCTQ] = useState<string | null>(null)

  // Form states
  const [vocForm, setVOCForm] = useState({
    statement: '',
    type: 'CUSTOMER_NEED' as 'CUSTOMER_NEED' | 'PAIN_POINT' | 'EXPECTATION',
    source: '',
    priority: 3
  })

  const [ctqForm, setCTQForm] = useState({
    requirement: '',
    unit: '',
    lowerSpec: '',
    targetSpec: '',
    upperSpec: ''
  })

  const handleAddVOC = async () => {
    try {
      const response = await fetch('/api/voc-statements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerSegment: vocForm.source || 'General', // Map source to customerSegment
          voiceStatement: vocForm.statement, // Map statement to voiceStatement
          assignmentId,
          userId
        })
      })

      if (response.ok) {
        setIsAddingVOC(false)
        setVOCForm({
          statement: '',
          type: 'CUSTOMER_NEED',
          source: '',
          priority: 3
        })
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to add VOC:', error)
    }
  }

  const handleDeleteVOC = async (vocId: string) => {
    if (!confirm('Are you sure you want to delete this VOC statement and all its CTQ requirements?')) {
      return
    }

    try {
      const response = await fetch(`/api/voc-statements/${vocId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, assignmentId })
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to delete VOC:', error)
    }
  }

  const handleAddCTQ = async (vocId: string) => {
    try {
      const response = await fetch('/api/ctq-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ctqForm,
          vocId,
          lowerSpec: ctqForm.lowerSpec ? parseFloat(ctqForm.lowerSpec) : null,
          targetSpec: ctqForm.targetSpec ? parseFloat(ctqForm.targetSpec) : null,
          upperSpec: ctqForm.upperSpec ? parseFloat(ctqForm.upperSpec) : null,
          userId,
          assignmentId
        })
      })

      if (response.ok) {
        setAddingCTQ(null)
        setCTQForm({
          requirement: '',
          unit: '',
          lowerSpec: '',
          targetSpec: '',
          upperSpec: ''
        })
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to add CTQ:', error)
    }
  }

  const handleDeleteCTQ = async (ctqId: string) => {
    if (!confirm('Are you sure you want to delete this CTQ requirement?')) {
      return
    }

    try {
      const response = await fetch(`/api/ctq-requirements/${ctqId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, assignmentId })
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to delete CTQ:', error)
    }
  }

  const toggleVOCExpansion = (vocId: string) => {
    const newExpanded = new Set(expandedVOCs)
    if (newExpanded.has(vocId)) {
      newExpanded.delete(vocId)
    } else {
      newExpanded.add(vocId)
    }
    setExpandedVOCs(newExpanded)
  }

  const _priorityColors = {
    1: 'bg-red-100 text-red-800 border-red-300',
    2: 'bg-orange-100 text-orange-800 border-orange-300',
    3: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    4: 'bg-blue-100 text-blue-800 border-blue-300',
    5: 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const _typeLabels = {
    CUSTOMER_NEED: 'Customer Need',
    PAIN_POINT: 'Pain Point',
    EXPECTATION: 'Expectation'
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-black">
        <CardHeader>
          <CardTitle className="text-2xl">Voice of Customer (VOC) & Critical to Quality (CTQ)</CardTitle>
          <CardDescription>
            Capture customer requirements and translate them into measurable specifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* VOC List */}
          <div className="space-y-4">
            {vocStatements.map((voc) => (
              <Card key={voc.id} className="border border-gray-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-500">
                          Customer Segment: {voc.customerSegment}
                        </span>
                      </div>
                      <p className="font-medium">{voc.voiceStatement}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVOCExpansion(voc.id)}
                      >
                        {expandedVOCs.has(voc.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        <span className="ml-1">CTQ ({voc.ctqRequirements.length})</span>
                      </Button>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVOC(voc.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {/* CTQ Requirements */}
                {expandedVOCs.has(voc.id) && (
                  <CardContent className="pt-0">
                    <div className="bg-gray-50 -mx-6 px-6 py-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">CTQ Requirements</h4>
                        {canEdit && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setAddingCTQ(voc.id)}
                            className="border-black hover:bg-gray-100"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add CTQ
                          </Button>
                        )}
                      </div>

                      {addingCTQ === voc.id && (
                        <Card className="mb-4 border-black">
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <Input
                                placeholder="CTQ Requirement"
                                value={ctqForm.requirement}
                                onChange={(e) => setCTQForm({ ...ctqForm, requirement: e.target.value })}
                              />
                              <div className="grid grid-cols-4 gap-2">
                                <Input
                                  placeholder="Unit"
                                  value={ctqForm.unit}
                                  onChange={(e) => setCTQForm({ ...ctqForm, unit: e.target.value })}
                                />
                                <Input
                                  type="number"
                                  placeholder="Lower Spec"
                                  value={ctqForm.lowerSpec}
                                  onChange={(e) => setCTQForm({ ...ctqForm, lowerSpec: e.target.value })}
                                />
                                <Input
                                  type="number"
                                  placeholder="Target"
                                  value={ctqForm.targetSpec}
                                  onChange={(e) => setCTQForm({ ...ctqForm, targetSpec: e.target.value })}
                                />
                                <Input
                                  type="number"
                                  placeholder="Upper Spec"
                                  value={ctqForm.upperSpec}
                                  onChange={(e) => setCTQForm({ ...ctqForm, upperSpec: e.target.value })}
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setAddingCTQ(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleAddCTQ(voc.id)}
                                  className="bg-black text-white hover:bg-gray-800"
                                >
                                  Add CTQ
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {voc.ctqRequirements.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Requirement</TableHead>
                              <TableHead>Unit</TableHead>
                              <TableHead>Lower Spec</TableHead>
                              <TableHead>Target</TableHead>
                              <TableHead>Upper Spec</TableHead>
                              {canEdit && <TableHead className="w-[50px]"></TableHead>}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {voc.ctqRequirements.map((ctq) => {
                              // Parse measurement criteria to extract values
                              // Format: "LSL: 10, Target: 15, USL: 20 minutes"
                              const criteria = ctq.measurementCriteria || ''
                              const lslMatch = criteria.match(/LSL:\s*([\d.]+)/)
                              const targetMatch = criteria.match(/Target:\s*([\d.]+)/)
                              const uslMatch = criteria.match(/USL:\s*([\d.]+)/)
                              // Extract unit (everything after the numbers)
                              const unitMatch = criteria.match(/\d\s+(.+)$/)
                              
                              const lowerSpec = lslMatch ? lslMatch[1] : '-'
                              const target = targetMatch ? targetMatch[1] : '-'
                              const upperSpec = uslMatch ? uslMatch[1] : '-'
                              const unit = unitMatch ? unitMatch[1] : '-'
                              
                              return (
                                <TableRow key={ctq.id}>
                                  <TableCell className="font-medium">{ctq.ctqDescription}</TableCell>
                                  <TableCell>{unit}</TableCell>
                                  <TableCell className="text-center">{lowerSpec}</TableCell>
                                  <TableCell className="text-center font-medium">{target}</TableCell>
                                  <TableCell className="text-center">{upperSpec}</TableCell>
                                  {canEdit && (
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteCTQ(ctq.id)}
                                        className="text-red-600 hover:text-red-800"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  )}
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-sm text-gray-500">No CTQ requirements defined</p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}

            {/* Add VOC Form */}
            {canEdit && (
              <>
                {!isAddingVOC ? (
                  <Button
                    onClick={() => setIsAddingVOC(true)}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add VOC Statement
                  </Button>
                ) : (
                  <Card className="border-2 border-black">
                    <CardHeader>
                      <CardTitle>New VOC Statement</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        placeholder="Voice of Customer statement..."
                        value={vocForm.statement}
                        onChange={(e) => setVOCForm({ ...vocForm, statement: e.target.value })}
                        className="min-h-[100px]"
                      />

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Type</label>
                          <Select
                            value={vocForm.type}
                            onValueChange={(value) => setVOCForm({ ...vocForm, type: value as typeof vocForm.type })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CUSTOMER_NEED">Customer Need</SelectItem>
                              <SelectItem value="PAIN_POINT">Pain Point</SelectItem>
                              <SelectItem value="EXPECTATION">Expectation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Source</label>
                          <Input
                            placeholder="e.g., Survey, Interview"
                            value={vocForm.source}
                            onChange={(e) => setVOCForm({ ...vocForm, source: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Priority</label>
                          <Select
                            value={vocForm.priority.toString()}
                            onValueChange={(value) => setVOCForm({ ...vocForm, priority: parseInt(value) })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">P1 - Critical</SelectItem>
                              <SelectItem value="2">P2 - High</SelectItem>
                              <SelectItem value="3">P3 - Medium</SelectItem>
                              <SelectItem value="4">P4 - Low</SelectItem>
                              <SelectItem value="5">P5 - Nice to Have</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsAddingVOC(false)
                            setVOCForm({
                              statement: '',
                              type: 'CUSTOMER_NEED',
                              source: '',
                              priority: 3
                            })
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddVOC}
                          disabled={!vocForm.statement || !vocForm.source}
                          className="bg-black text-white hover:bg-gray-800"
                        >
                          Add VOC
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {vocStatements.length === 0 && !isAddingVOC && (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500 mb-4">No VOC statements captured yet</p>
                  {canEdit && (
                    <Button
                      onClick={() => setIsAddingVOC(true)}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First VOC Statement
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}