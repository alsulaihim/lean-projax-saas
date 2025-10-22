'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Edit2, Save, X, AlertCircle, CheckCircle2, TrendingUp, BarChart3 } from 'lucide-react'
import { BellCurveChart } from '@/components/charts/bell-curve-chart'
import type { Process } from '@prisma/client'

interface ProcessCapabilitySectionProps {
  assignmentId: string
  processes: Process[]
  canEdit: boolean
  userId: string
}

export function ProcessCapabilitySection({
  assignmentId,
  processes,
  canEdit,
  userId
}: ProcessCapabilitySectionProps) {
  const router = useRouter()
  const [editingProcess, setEditingProcess] = useState<string | null>(null)
  const [selectedVisualization, setSelectedVisualization] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [editForm, setEditForm] = useState({
    lowerSpecLimit: '',
    upperSpecLimit: '',
    targetValue: '',
    sampleMean: '',
    sampleStdDev: ''
  })

  const calculateCp = (
    lsl: number | null,
    usl: number | null,
    stdDev: number | null
  ): number | null => {
    if (lsl === null || usl === null || stdDev === null || stdDev === 0) {
      return null
    }
    return (usl - lsl) / (6 * stdDev)
  }

  const calculateCpk = (
    lsl: number | null,
    usl: number | null,
    mean: number | null,
    stdDev: number | null
  ): number | null => {
    if (lsl === null || usl === null || mean === null || stdDev === null || stdDev === 0) {
      return null
    }
    const cpkLower = (mean - lsl) / (3 * stdDev)
    const cpkUpper = (usl - mean) / (3 * stdDev)
    return Math.min(cpkLower, cpkUpper)
  }

  const getCapabilityRating = (cpk: number | null): {
    label: string
    color: string
    icon: React.ReactElement
  } => {
    if (cpk === null) {
      return {
        label: 'Not Calculated',
        color: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: <AlertCircle className="h-4 w-4" />
      }
    }
    if (cpk >= 2.0) {
      return {
        label: 'Excellent (6σ)',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: <CheckCircle2 className="h-4 w-4" />
      }
    }
    if (cpk >= 1.33) {
      return {
        label: 'Adequate',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: <CheckCircle2 className="h-4 w-4" />
      }
    }
    if (cpk >= 1.0) {
      return {
        label: 'Marginal',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: <AlertCircle className="h-4 w-4" />
      }
    }
    return {
      label: 'Poor',
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: <AlertCircle className="h-4 w-4" />
    }
  }

  const handleUpdateProcess = async (processId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/processes/${processId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lowerSpecLimit: editForm.lowerSpecLimit ? parseFloat(editForm.lowerSpecLimit) : null,
          upperSpecLimit: editForm.upperSpecLimit ? parseFloat(editForm.upperSpecLimit) : null,
          targetValue: editForm.targetValue ? parseFloat(editForm.targetValue) : null,
          sampleMean: editForm.sampleMean ? parseFloat(editForm.sampleMean) : null,
          sampleStdDev: editForm.sampleStdDev ? parseFloat(editForm.sampleStdDev) : null,
          userId,
          assignmentId
        })
      })

      if (response.ok) {
        setEditingProcess(null)
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to update process:', error)
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (process: Process) => {
    setEditingProcess(process.id)
    setEditForm({
      lowerSpecLimit: process.lowerSpecLimit?.toString() || '',
      upperSpecLimit: process.upperSpecLimit?.toString() || '',
      targetValue: process.targetValue?.toString() || '',
      sampleMean: process.sampleMean?.toString() || '',
      sampleStdDev: process.sampleStdDev?.toString() || ''
    })
  }

  const processesWithCapability = processes.map(p => ({
    ...p,
    cp: calculateCp(p.lowerSpecLimit, p.upperSpecLimit, p.sampleStdDev),
    cpk: calculateCpk(p.lowerSpecLimit, p.upperSpecLimit, p.sampleMean, p.sampleStdDev)
  }))

  if (processes.length === 0) {
    return (
      <Card className="border-2 border-black">
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">Please add at least one process to calculate process capability</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-black">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Process Capability Analysis</CardTitle>
          <CardDescription className="text-sm">
            Calculate Cp and Cpk to measure process performance against specifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Box */}
          <Card className="border border-blue-300 bg-blue-50">
            <CardContent className="pt-4 md:pt-6">
              <div className="flex gap-2 md:gap-3">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs md:text-sm">
                  <p className="font-medium text-blue-900 mb-2">Process Capability Formulas:</p>
                  <ul className="space-y-1 text-blue-800">
                    <li><strong>Cp</strong> = (USL - LSL) / (6 × σ) - Measures potential capability</li>
                    <li><strong>Cpk</strong> = min[(Mean - LSL) / (3 × σ), (USL - Mean) / (3 × σ)] - Measures actual capability</li>
                    <li><strong>Target:</strong> Cpk ≥ 1.33 (Adequate), Cpk ≥ 2.0 (Excellent/6σ)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Process Capability Table */}
          <div className="border-2 border-black rounded-lg overflow-x-auto">
            <div className="min-w-[900px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Process Name</TableHead>
                  <TableHead className="text-center">LSL</TableHead>
                  <TableHead className="text-center">Target</TableHead>
                  <TableHead className="text-center">USL</TableHead>
                  <TableHead className="text-center">Mean (x̄)</TableHead>
                  <TableHead className="text-center">Std Dev (σ)</TableHead>
                  <TableHead className="text-center">Cp</TableHead>
                  <TableHead className="text-center">Cpk</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-center">Visualize</TableHead>
                  {canEdit && <TableHead className="w-[100px]"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {processesWithCapability.map(process => {
                  const isEditing = editingProcess === process.id
                  const rating = getCapabilityRating(process.cpk)

                  return (
                    <TableRow key={process.id}>
                      <TableCell className="font-medium">{process.processName}</TableCell>
                      {isEditing ? (
                        <>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={editForm.lowerSpecLimit}
                              onChange={(e) => setEditForm({ ...editForm, lowerSpecLimit: e.target.value })}
                              className="text-sm text-center w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={editForm.targetValue}
                              onChange={(e) => setEditForm({ ...editForm, targetValue: e.target.value })}
                              className="text-sm text-center w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={editForm.upperSpecLimit}
                              onChange={(e) => setEditForm({ ...editForm, upperSpecLimit: e.target.value })}
                              className="text-sm text-center w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={editForm.sampleMean}
                              onChange={(e) => setEditForm({ ...editForm, sampleMean: e.target.value })}
                              className="text-sm text-center w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={editForm.sampleStdDev}
                              onChange={(e) => setEditForm({ ...editForm, sampleStdDev: e.target.value })}
                              className="text-sm text-center w-20"
                            />
                          </TableCell>
                          <TableCell className="text-center text-gray-400">-</TableCell>
                          <TableCell className="text-center text-gray-400">-</TableCell>
                          <TableCell>
                            <span className="text-xs text-gray-500">Save to calculate</span>
                          </TableCell>
                          <TableCell className="text-center">-</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateProcess(process.id)}
                                disabled={loading}
                                className="text-green-600 hover:text-green-800"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingProcess(null)}
                                disabled={loading}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="text-center">
                            {process.lowerSpecLimit ?? '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            {process.targetValue ?? '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            {process.upperSpecLimit ?? '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            {process.sampleMean ?? '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            {process.sampleStdDev ?? '-'}
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            {process.cp !== null ? process.cp.toFixed(3) : '-'}
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            {process.cpk !== null ? process.cpk.toFixed(3) : '-'}
                          </TableCell>
                          <TableCell>
                            <span className={`flex items-center gap-1 px-2 py-1 text-xs border rounded ${rating.color}`}>
                              {rating.icon}
                              {rating.label}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {process.cpk !== null ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedVisualization(
                                  selectedVisualization === process.id ? null : process.id
                                )}
                                className="text-blue-600"
                              >
                                {selectedVisualization === process.id ? (
                                  <>
                                    <X className="h-4 w-4 mr-1" />
                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <BarChart3 className="h-4 w-4 mr-1" />
                                    View
                                  </>
                                )}
                              </Button>
                            ) : (
                              <span className="text-xs text-gray-400">N/A</span>
                            )}
                          </TableCell>
                          {canEdit && (
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditing(process)}
                                disabled={loading}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            </div>
          </div>

          {/* Bell Curve Visualization */}
          {selectedVisualization && (() => {
            const selectedProcess = processesWithCapability.find(p => p.id === selectedVisualization)
            if (!selectedProcess ||
                selectedProcess.sampleMean === null ||
                selectedProcess.sampleStdDev === null) return null

            return (
              <div className="mt-6 w-full overflow-x-auto">
                <div className="min-w-[320px]">
                  <BellCurveChart
                    mean={selectedProcess.sampleMean}
                    standardDeviation={selectedProcess.sampleStdDev}
                    lsl={selectedProcess.lowerSpecLimit ?? undefined}
                    usl={selectedProcess.upperSpecLimit ?? undefined}
                    target={selectedProcess.targetValue ?? undefined}
                    title={`Process Distribution: ${selectedProcess.processName}`}
                    height={400}
                    showStatistics={true}
                  />
                </div>
              </div>
            )
          })()}

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Card className="border border-gray-300">
              <CardContent className="pt-4 md:pt-6">
                <div className="text-center">
                  <p className="text-xs md:text-sm text-gray-500 mb-1">Processes Analyzed</p>
                  <p className="text-lg md:text-2xl font-bold">
                    {processesWithCapability.filter(p => p.cpk !== null).length} / {processes.length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-300">
              <CardContent className="pt-4 md:pt-6">
                <div className="text-center">
                  <p className="text-xs md:text-sm text-gray-500 mb-1">Excellent (Cpk ≥ 2.0)</p>
                  <p className="text-lg md:text-2xl font-bold text-green-600">
                    {processesWithCapability.filter(p => p.cpk !== null && p.cpk >= 2.0).length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-300">
              <CardContent className="pt-4 md:pt-6">
                <div className="text-center">
                  <p className="text-xs md:text-sm text-gray-500 mb-1">Adequate (Cpk ≥ 1.33)</p>
                  <p className="text-lg md:text-2xl font-bold text-blue-600">
                    {processesWithCapability.filter(p => p.cpk !== null && p.cpk >= 1.33 && p.cpk < 2.0).length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-300">
              <CardContent className="pt-4 md:pt-6">
                <div className="text-center">
                  <p className="text-xs md:text-sm text-gray-500 mb-1">Poor (Cpk &lt; 1.0)</p>
                  <p className="text-lg md:text-2xl font-bold text-red-600">
                    {processesWithCapability.filter(p => p.cpk !== null && p.cpk < 1.0).length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card className="border border-gray-300">
            <CardContent className="pt-4 md:pt-6">
              <h4 className="font-medium mb-2 text-sm md:text-base">How to Use:</h4>
              <ol className="text-xs md:text-sm space-y-1 list-decimal list-inside text-gray-700">
                <li>Define specification limits (LSL, USL) and target value for each process</li>
                <li>Collect sample data and calculate the mean (x̄) and standard deviation (σ)</li>
                <li>Click Edit to enter these values for each process</li>
                <li>Cp and Cpk will be automatically calculated</li>
                <li>Review the capability rating to identify processes needing improvement</li>
              </ol>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}