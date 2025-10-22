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
  TableFooter,
} from '@/components/ui/table'
import { Plus, Trash2, Edit2, Clock, Timer, Calculator } from 'lucide-react'
import type { Prisma } from '@prisma/client'

type ProcessWithVSM = Prisma.ProcessGetPayload<{
  include: { vsmSteps: true }
}>

interface VSMSectionProps {
  assignmentId: string
  processes: ProcessWithVSM[]
  canEdit: boolean
  userId: string
}

const WASTE_TYPES = [
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'INVENTORY', label: 'Inventory' },
  { value: 'MOTION', label: 'Motion' },
  { value: 'WAITING', label: 'Waiting' },
  { value: 'OVER_PRODUCTION', label: 'Over Production' },
  { value: 'OVER_PROCESSING', label: 'Over Processing' },
  { value: 'DEFECTS', label: 'Defects' },
  { value: 'SKILLS', label: 'Skills' },
] as const

const VALUE_MEASURES = [
  { value: 'VALUE_ADDED', label: 'Value Added', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'ESSENTIAL_NON_VALUE', label: 'Essential Non-Value Added', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'NON_VALUE_ADDED', label: 'Non-Value Added', color: 'bg-red-100 text-red-800 border-red-300' },
] as const

export function VSMSection({ assignmentId, processes, canEdit, userId }: VSMSectionProps) {
  const router = useRouter()
  const [selectedProcess, setSelectedProcess] = useState<string>(processes[0]?.id || '')
  const [isAdding, setIsAdding] = useState(false)
  const [editingStep, setEditingStep] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [stepForm, setStepForm] = useState({
    stepName: '',
    processTime: '',
    waitingTime: '',
    valueMeasure: 'NON_VALUE_ADDED' as 'VALUE_ADDED' | 'NON_VALUE_ADDED',
    stakeholder: '',
    wasteType: '',
    remarks: ''
  })

  const [editForm, setEditForm] = useState({
    stepName: '',
    processTime: '',
    waitingTime: '',
    valueMeasure: 'NON_VALUE_ADDED' as 'VALUE_ADDED' | 'NON_VALUE_ADDED',
    stakeholder: '',
    wasteType: '',
    remarks: ''
  })

  const currentProcess = processes.find(p => p.id === selectedProcess)
  const vsmSteps = currentProcess?.vsmSteps.sort((a, b) => a.stepNumber - b.stepNumber) || []

  // Calculate totals and percentages
  const totals = vsmSteps.reduce((acc, step) => {
    const processTime = step.processTime || step.durationMinutes || 0
    const waitingTime = step.waitingTime || step.waitTimeMinutes || 0
    const cycleTime = processTime + waitingTime

    acc.processTime += processTime
    acc.waitingTime += waitingTime
    acc.cycleTime += cycleTime

    // Count by value measure
    const measure = step.valueMeasure || (step.valueAdded ? 'VALUE_ADDED' : 'NON_VALUE_ADDED')
    if (measure === 'VALUE_ADDED') {
      acc.valueAddedTime += processTime
      acc.valueAddedSteps++
    } else if (measure === 'ESSENTIAL_NON_VALUE') {
      acc.essentialNonValueTime += processTime
      acc.essentialNonValueSteps++
    } else {
      acc.nonValueAddedTime += processTime
      acc.nonValueAddedSteps++
    }

    return acc
  }, {
    processTime: 0,
    waitingTime: 0,
    cycleTime: 0,
    valueAddedTime: 0,
    essentialNonValueTime: 0,
    nonValueAddedTime: 0,
    valueAddedSteps: 0,
    essentialNonValueSteps: 0,
    nonValueAddedSteps: 0
  })

  // Calculate percentages
  const percentages = {
    valueAdded: totals.processTime > 0 ? (totals.valueAddedTime / totals.processTime * 100).toFixed(1) : '0',
    essentialNonValue: totals.processTime > 0 ? (totals.essentialNonValueTime / totals.processTime * 100).toFixed(1) : '0',
    nonValueAdded: totals.processTime > 0 ? (totals.nonValueAddedTime / totals.processTime * 100).toFixed(1) : '0'
  }

  const handleAddStep = async () => {
    if (!currentProcess) return

    setLoading(true)
    try {
      const response = await fetch('/api/vsm-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          processId: currentProcess.id,
          assignmentId,
          userId,
          stepNumber: vsmSteps.length + 1,
          stepName: stepForm.stepName,
          processTime: parseFloat(stepForm.processTime) || 0,
          waitingTime: parseFloat(stepForm.waitingTime) || 0,
          valueMeasure: stepForm.valueMeasure,
          stakeholder: stepForm.stakeholder || null,
          wasteType: stepForm.wasteType || null,
          remarks: stepForm.remarks || null,
          // Legacy fields for compatibility
          durationMinutes: parseFloat(stepForm.processTime) || 0,
          waitTimeMinutes: parseFloat(stepForm.waitingTime) || 0,
          valueAdded: stepForm.valueMeasure === 'VALUE_ADDED'
        })
      })

      if (response.ok) {
        setIsAdding(false)
        setStepForm({
          stepName: '',
          processTime: '',
          waitingTime: '',
          valueMeasure: 'NON_VALUE_ADDED',
          stakeholder: '',
          wasteType: '',
          remarks: ''
        })
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to add VSM step:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStep = async (stepId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/vsm-steps/${stepId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepName: editForm.stepName,
          processTime: parseFloat(editForm.processTime) || 0,
          waitingTime: parseFloat(editForm.waitingTime) || 0,
          valueMeasure: editForm.valueMeasure,
          stakeholder: editForm.stakeholder || null,
          wasteType: editForm.wasteType || null,
          remarks: editForm.remarks || null,
          // Legacy fields for compatibility
          durationMinutes: parseFloat(editForm.processTime) || 0,
          waitTimeMinutes: parseFloat(editForm.waitingTime) || 0,
          valueAdded: editForm.valueMeasure === 'VALUE_ADDED',
          userId,
          assignmentId
        })
      })

      if (response.ok) {
        setEditingStep(null)
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to update VSM step:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('Are you sure you want to delete this step?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/vsm-steps/${stepId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, assignmentId })
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to delete step:', error)
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (step: typeof vsmSteps[0]) => {
    setEditingStep(step.id)
    setEditForm({
      stepName: step.stepName,
      processTime: (step.processTime || step.durationMinutes || 0).toString(),
      waitingTime: (step.waitingTime || step.waitTimeMinutes || 0).toString(),
      valueMeasure: step.valueMeasure || (step.valueAdded ? 'VALUE_ADDED' : 'NON_VALUE_ADDED'),
      stakeholder: step.stakeholder || '',
      wasteType: step.wasteType || '',
      remarks: step.remarks || step.notes || ''
    })
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes.toFixed(1)} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins.toFixed(0)}m`
  }

  if (processes.length === 0) {
    return (
      <Card className="border-2 border-black">
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">Please add at least one process before creating a Value Stream Map</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-black">
        <CardHeader>
          <CardTitle className="text-2xl">Value Stream Mapping (VSM)</CardTitle>
          <CardDescription>
            Visualize the flow of materials and information through your process
          </CardDescription>
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

          {/* Metrics Summary */}
          {vsmSteps.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <Card className="border border-gray-300">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Clock className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm text-gray-500 mb-1">Total Process Time</p>
                    <p className="text-2xl font-bold">{formatDuration(totals.processTime)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-gray-300">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Timer className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm text-gray-500 mb-1">Total Waiting Time</p>
                    <p className="text-2xl font-bold">{formatDuration(totals.waitingTime)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-blue-300 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Calculator className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm text-blue-700 mb-1">Total Cycle Time</p>
                    <p className="text-2xl font-bold text-blue-800">{formatDuration(totals.cycleTime)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Value Distribution */}
          {vsmSteps.length > 0 && (
            <Card className="border border-gray-300">
              <CardContent className="pt-6">
                <p className="text-sm font-medium mb-4">Value Distribution</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Value Added</p>
                    <p className="text-2xl font-bold text-green-600">{percentages.valueAdded}%</p>
                    <p className="text-xs text-gray-500">{totals.valueAddedSteps} steps</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Essential Non-Value</p>
                    <p className="text-2xl font-bold text-yellow-600">{percentages.essentialNonValue}%</p>
                    <p className="text-xs text-gray-500">{totals.essentialNonValueSteps} steps</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Non-Value Added</p>
                    <p className="text-2xl font-bold text-red-600">{percentages.nonValueAdded}%</p>
                    <p className="text-xs text-gray-500">{totals.nonValueAddedSteps} steps</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* VSM Steps Table */}
          {vsmSteps.length > 0 ? (
            <div className="border-2 border-black rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="w-[40px] text-center sticky left-0 bg-gray-100 z-10 font-bold">#</TableHead>
                    <TableHead className="w-[18%] font-bold">Process Step</TableHead>
                    <TableHead className="text-center w-[90px] font-bold">Process Time</TableHead>
                    <TableHead className="text-center w-[90px] font-bold">Waiting Time</TableHead>
                    <TableHead className="text-center w-[90px] font-bold">Cycle Time</TableHead>
                    <TableHead className="text-center w-[12%] font-bold">Value Measure</TableHead>
                    <TableHead className="w-[12%] font-bold">Stakeholder</TableHead>
                    <TableHead className="w-[12%] font-bold">Waste Type</TableHead>
                    <TableHead className="w-[15%] font-bold">Remarks</TableHead>
                    {canEdit && <TableHead className="w-[90px] sticky right-0 bg-gray-100 font-bold shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)]"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vsmSteps.map((step, index) => {
                    const processTime = step.processTime || step.durationMinutes || 0
                    const waitingTime = step.waitingTime || step.waitTimeMinutes || 0
                    const cycleTime = processTime + waitingTime
                    const valueMeasure = step.valueMeasure || (step.valueAdded ? 'VALUE_ADDED' : 'NON_VALUE_ADDED')
                    const measureConfig = VALUE_MEASURES.find(m => m.value === valueMeasure)

                    return (
                      <TableRow key={step.id}>
                        {editingStep === step.id ? (
                          <>
                            <TableCell className="font-medium text-center">{step.stepNumber}</TableCell>
                            <TableCell>
                              <Input
                                value={editForm.stepName}
                                onChange={(e) => setEditForm({ ...editForm, stepName: e.target.value })}
                                className="text-sm min-w-[150px]"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                value={editForm.processTime}
                                onChange={(e) => setEditForm({ ...editForm, processTime: e.target.value })}
                                className="text-sm text-center w-24"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                value={editForm.waitingTime}
                                onChange={(e) => setEditForm({ ...editForm, waitingTime: e.target.value })}
                                className="text-sm text-center w-24"
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              {((parseFloat(editForm.processTime) || 0) + (parseFloat(editForm.waitingTime) || 0)).toFixed(1)}
                            </TableCell>
                            <TableCell>
                              <Select value={editForm.valueMeasure} onValueChange={(value) => setEditForm({ ...editForm, valueMeasure: value })}>
                                <SelectTrigger className="text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {VALUE_MEASURES.map(measure => (
                                    <SelectItem key={measure.value} value={measure.value}>
                                      {measure.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                value={editForm.stakeholder}
                                onChange={(e) => setEditForm({ ...editForm, stakeholder: e.target.value })}
                                placeholder="Stakeholder"
                                className="text-sm min-w-[100px]"
                              />
                            </TableCell>
                            <TableCell>
                              <Select value={editForm.wasteType || 'none'} onValueChange={(value) => setEditForm({ ...editForm, wasteType: value === 'none' ? '' : value })}>
                                <SelectTrigger className="text-sm">
                                  <SelectValue placeholder="None" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  {WASTE_TYPES.map(type => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                value={editForm.remarks}
                                onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                                placeholder="Remarks"
                                className="text-sm min-w-[100px]"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdateStep(step.id)}
                                  disabled={loading}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingStep(null)}
                                  disabled={loading}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="font-medium text-center">{step.stepNumber}</TableCell>
                            <TableCell className="font-medium align-top">
                              <div className="break-words whitespace-normal">{step.stepName}</div>
                            </TableCell>
                            <TableCell className="text-center">{processTime.toFixed(1)}</TableCell>
                            <TableCell className="text-center">{waitingTime.toFixed(1)}</TableCell>
                            <TableCell className="text-center font-medium">{cycleTime.toFixed(1)}</TableCell>
                            <TableCell className="text-center">
                              <span className={`px-2 py-1 text-xs border rounded ${measureConfig?.color}`}>
                                {measureConfig?.label.split(' ')[0]}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm align-top">
                              <div className="break-words whitespace-normal">{step.stakeholder || '-'}</div>
                            </TableCell>
                            <TableCell className="text-sm align-top">
                              <div className="break-words whitespace-normal">
                                {step.wasteType ? WASTE_TYPES.find(t => t.value === step.wasteType)?.label : '-'}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600 align-top">
                              <div className="break-words whitespace-normal">{step.remarks || step.notes || '-'}</div>
                            </TableCell>
                            {canEdit && (
                              <TableCell className="sticky right-0 bg-white shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)]">
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startEditing(step)}
                                    disabled={loading}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteStep(step.id)}
                                    disabled={loading}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </>
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
                {vsmSteps.length > 0 && (
                  <TableFooter>
                    <TableRow className="bg-gray-50 font-medium">
                      <TableCell colSpan={2} className="text-right">Totals:</TableCell>
                      <TableCell className="text-center">{totals.processTime.toFixed(1)}</TableCell>
                      <TableCell className="text-center">{totals.waitingTime.toFixed(1)}</TableCell>
                      <TableCell className="text-center">{totals.cycleTime.toFixed(1)}</TableCell>
                      <TableCell colSpan={canEdit ? 5 : 4} className="text-center text-sm">
                        VA: {percentages.valueAdded}% | Essential: {percentages.essentialNonValue}% | NVA: {percentages.nonValueAdded}%
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </div>
          ) : (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 mb-4">No process steps defined yet</p>
              </CardContent>
            </Card>
          )}

          {/* Add Step Form */}
          {canEdit && (
            <>
              {!isAdding ? (
                <Button
                  onClick={() => setIsAdding(true)}
                  className="bg-black text-white hover:bg-gray-800"
                  disabled={loading || !currentProcess}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Process Step
                </Button>
              ) : (
                <Card className="border-2 border-black">
                  <CardHeader>
                    <CardTitle className="text-lg">Add Process Step</CardTitle>
                    <CardDescription>
                      Fill in all fields for the new process step. Cycle time will be calculated automatically.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-sm font-medium mb-2 block">Process Step Name *</label>
                        <Input
                          placeholder="e.g., Review Application"
                          value={stepForm.stepName}
                          onChange={(e) => setStepForm({ ...stepForm, stepName: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Process Time (minutes) *</label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="10.0"
                          value={stepForm.processTime}
                          onChange={(e) => setStepForm({ ...stepForm, processTime: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Waiting Time (minutes)</label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="5.0"
                          value={stepForm.waitingTime}
                          onChange={(e) => setStepForm({ ...stepForm, waitingTime: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Value Measure *</label>
                        <Select value={stepForm.valueMeasure} onValueChange={(value) => setStepForm({ ...stepForm, valueMeasure: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {VALUE_MEASURES.map(measure => (
                              <SelectItem key={measure.value} value={measure.value}>
                                {measure.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Stakeholder</label>
                        <Input
                          placeholder="e.g., Customer Service Team"
                          value={stepForm.stakeholder}
                          onChange={(e) => setStepForm({ ...stepForm, stakeholder: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Waste Type</label>
                        <Select value={stepForm.wasteType || 'none'} onValueChange={(value) => setStepForm({ ...stepForm, wasteType: value === 'none' ? '' : value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select waste type (if any)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {WASTE_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-2">
                        <label className="text-sm font-medium mb-2 block">Remarks</label>
                        <Textarea
                          placeholder="Additional notes or observations..."
                          value={stepForm.remarks}
                          onChange={(e) => setStepForm({ ...stepForm, remarks: e.target.value })}
                          className="min-h-[60px]"
                        />
                      </div>

                      {/* Calculated Cycle Time Display */}
                      <div className="col-span-2 p-4 bg-blue-50 border border-blue-200 rounded">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Calculated Cycle Time:</span>
                          <span className="text-lg font-bold text-blue-700">
                            {((parseFloat(stepForm.processTime) || 0) + (parseFloat(stepForm.waitingTime) || 0)).toFixed(1)} minutes
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAdding(false)
                          setStepForm({
                            stepName: '',
                            processTime: '',
                            waitingTime: '',
                            valueMeasure: 'NON_VALUE_ADDED',
                            stakeholder: '',
                            wasteType: '',
                            remarks: ''
                          })
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddStep}
                        disabled={!stepForm.stepName || !stepForm.processTime || loading}
                        className="bg-black text-white hover:bg-gray-800"
                      >
                        Add Step
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