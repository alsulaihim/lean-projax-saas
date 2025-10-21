'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2, Package, BarChart3, GitBranch, Fish, AlertTriangle, FileText } from 'lucide-react'
import type { Prisma } from '@prisma/client'
import { useToast } from '@/lib/hooks/useToast'

type ProcessWithDetails = Prisma.ProcessGetPayload<{
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
}>

interface ProcessManagerProps {
  assignmentId: string
  processes: ProcessWithDetails[]
  canEdit: boolean
  userId: string
}

export function ProcessManager({ assignmentId, processes = [], canEdit, userId }: ProcessManagerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isAddingProcess, setIsAddingProcess] = useState(false)
  const [editingProcess, setEditingProcess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)


  const [processForm, setProcessForm] = useState({
    processName: '',
    processOwner: ''
  })

  const handleAddProcess = async () => {
    if (!processForm.processName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please enter a process name'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/processes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          processName: processForm.processName,
          processOwner: processForm.processOwner,
          order: processes.length + 1,
          userId
        })
      })

      if (response.ok) {
        toast({
          variant: 'success',
          title: 'Success',
          description: 'Process created successfully'
        })
        setIsAddingProcess(false)
        setProcessForm({ processName: '', processOwner: '' })
        router.refresh()
      } else {
        const errorData = await response.json().catch(() => null)
        console.error('Failed to create process:', response.status, errorData)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: `Failed to create process: ${errorData?.error || response.statusText}`
        })
      }
    } catch (error) {
      console.error('Failed to add process:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create process. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProcess = async (processId: string) => {
    if (!confirm('Are you sure you want to delete this process? This will delete all associated SIPOC, VSM, Fishbone, FMEA, and Process Capability data.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/processes/${processId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, assignmentId })
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to delete process:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProcess = async (processId: string, data: { processName?: string; processOwner?: string }) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/processes/${processId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId, assignmentId })
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

  const getProcessStats = (process: ProcessWithDetails) => {
    return {
      sipoc: process.sipocEntries.length,
      vsm: process.vsmSteps.length,
      fishbone: process.fishboneCategories.reduce((acc, cat) => acc + cat.causes.length, 0),
      fmea: process.fmeaEntries.length,
      capability: process.lowerSpecLimit && process.upperSpecLimit ? 1 : 0
    }
  }

  return (
    <Card className="border-2 border-black mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Process Management</CardTitle>
            <CardDescription>
              Manage multiple processes - Each process has its own SIPOC, VSM, Fishbone, FMEA, and Process Capability
            </CardDescription>
          </div>
          {canEdit ? (
            <Button
              onClick={() => setIsAddingProcess(!isAddingProcess)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isAddingProcess ? 'Cancel' : 'Add New Process'}
            </Button>
          ) : (
            <span className="text-sm text-gray-500">Read-only mode</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Simple form without Dialog for testing */}
        {isAddingProcess && (
          <Card className="mb-6 border-2 border-blue-500">
            <CardHeader>
              <CardTitle>Add New Process</CardTitle>
              <CardDescription>
                Each process will have its own SIPOC, VSM, Fishbone, FMEA, and Process Capability analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Process Name *</label>
                  <Input
                    placeholder="e.g., Order Fulfillment Process"
                    value={processForm.processName}
                    onChange={(e) => setProcessForm({ ...processForm, processName: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Process Owner (Optional)</label>
                  <Input
                    placeholder="e.g., John Smith"
                    value={processForm.processOwner}
                    onChange={(e) => setProcessForm({ ...processForm, processOwner: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingProcess(false)
                      setProcessForm({ processName: '', processOwner: '' })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddProcess}
                    disabled={loading || !processForm.processName.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? 'Adding...' : 'Add Process'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {processes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No processes defined yet</p>
            {canEdit && (
              <Button
                onClick={() => setIsAddingProcess(true)}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Process
              </Button>
            )}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="font-bold">#</TableHead>
                  <TableHead className="font-bold">Process Name</TableHead>
                  <TableHead className="font-bold">Process Owner</TableHead>
                  <TableHead className="text-center font-bold">Analysis Progress</TableHead>
                  {canEdit && <TableHead className="text-center font-bold">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {processes.map((process, index) => {
                  const stats = getProcessStats(process)
                  const isEditing = editingProcess === process.id

                  return (
                    <TableRow key={process.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            defaultValue={process.processName}
                            onBlur={(e) => handleUpdateProcess(process.id, { processName: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateProcess(process.id, { processName: e.currentTarget.value })
                              } else if (e.key === 'Escape') {
                                setEditingProcess(null)
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <div className="font-medium">{process.processName}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            defaultValue={process.processOwner || ''}
                            onBlur={(e) => handleUpdateProcess(process.id, { processOwner: e.target.value })}
                            className="text-sm"
                          />
                        ) : (
                          <div className="text-sm text-gray-600">
                            {process.processOwner || 'No owner assigned'}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <Badge variant={stats.sipoc > 0 ? "default" : "outline"} className="text-xs">
                            <Package className="h-3 w-3 mr-1" />
                            SIPOC ({stats.sipoc})
                          </Badge>
                          <Badge variant={stats.vsm > 0 ? "default" : "outline"} className="text-xs">
                            <GitBranch className="h-3 w-3 mr-1" />
                            VSM ({stats.vsm})
                          </Badge>
                          <Badge variant={stats.fishbone > 0 ? "default" : "outline"} className="text-xs">
                            <Fish className="h-3 w-3 mr-1" />
                            Fishbone ({stats.fishbone})
                          </Badge>
                          <Badge variant={stats.fmea > 0 ? "default" : "outline"} className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            FMEA ({stats.fmea})
                          </Badge>
                          <Badge variant={stats.capability > 0 ? "default" : "outline"} className="text-xs">
                            <BarChart3 className="h-3 w-3 mr-1" />
                            Capability
                          </Badge>
                        </div>
                      </TableCell>
                      {canEdit && (
                        <TableCell className="text-center">
                          <div className="flex gap-1 justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingProcess(process.id)}
                              disabled={loading}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProcess(process.id)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {processes.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">How to use multiple processes:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>Add a new process using the "Add New Process" button above</li>
                  <li>Each process will appear in the dropdowns of SIPOC, VSM, Fishbone, and other sections</li>
                  <li>Select the process you want to work on from the dropdown in each section</li>
                  <li>Pareto analysis will automatically analyze data from the selected process's VSM</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}