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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react'
import type { Prisma } from '@prisma/client'

type ProcessWithSIPOC = Prisma.ProcessGetPayload<{
  include: { sipocEntries: true }
}>

interface SIPOCSectionProps {
  assignmentId: string
  processes: ProcessWithSIPOC[]
  canEdit: boolean
  userId: string
}

export function SIPOCSection({ assignmentId, processes, canEdit, userId }: SIPOCSectionProps) {
  const router = useRouter()
  const [selectedProcess, setSelectedProcess] = useState<string>(processes[0]?.id || '')
  const [isAdding, setIsAdding] = useState(false)
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Form for adding a complete row
  const [rowForm, setRowForm] = useState({
    supplier: '',
    input: '',
    process: '',
    output: '',
    customer: '',
  })

  const currentProcess = processes.find(p => p.id === selectedProcess)
  const sipocColumns = ['SUPPLIER', 'INPUT', 'PROCESS', 'OUTPUT', 'CUSTOMER'] as const

  const groupedEntries = sipocColumns.reduce(
    (acc, column) => {
      acc[column] =
        currentProcess?.sipocEntries
          .filter(entry => entry.column === column)
          .sort((a, b) => a.order - b.order) || []
      return acc
    },
    {} as Record<(typeof sipocColumns)[number], any>
  )

  const handleAddRow = async () => {
    if (!currentProcess) return

    setLoading(true)
    try {
      // Get the next order number for each column
      const nextOrder = Math.max(...Object.values(groupedEntries).map(arr => arr.length), 0) + 1

      // Create all 5 entries for the row
      const promises = sipocColumns
        .map(column => {
          const fieldName = column.toLowerCase() as keyof typeof rowForm
          const value = rowForm[fieldName]

          // Only create entry if there's a value
          if (value) {
            return fetch('/api/sipoc-entries', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                processId: currentProcess.id,
                assignmentId,
                userId,
                column,
                value,
                order: nextOrder,
              }),
            })
          }
          return null
        })
        .filter(Boolean)

      await Promise.all(promises)

      setIsAdding(false)
      setRowForm({
        supplier: '',
        input: '',
        process: '',
        output: '',
        customer: '',
      })
      router.refresh()
    } catch (error) {
      console.error('Failed to add SIPOC row:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/sipoc-entries/${entryId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, assignmentId }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to delete entry:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateEntry = async (entryId: string, value: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/sipoc-entries/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, userId, assignmentId }),
      })

      if (response.ok) {
        setEditingEntry(null)
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to update entry:', error)
    } finally {
      setLoading(false)
    }
  }

  const columnLabels = {
    SUPPLIER: 'Suppliers',
    INPUT: 'Inputs',
    PROCESS: 'Process',
    OUTPUT: 'Outputs',
    CUSTOMER: 'Customers',
  }

  if (processes.length === 0) {
    return (
      <Card className="border-2 border-black">
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">
            Please add at least one process before creating a SIPOC diagram
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-black">
        <CardHeader>
          <CardTitle className="text-2xl">SIPOC Diagram</CardTitle>
          <CardDescription>
            Suppliers, Inputs, Process, Outputs, Customers - High-level process map
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

          {/* SIPOC Table */}
          <div className="border-2 border-black rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  {sipocColumns.map(column => (
                    <TableHead
                      key={column}
                      className="text-center font-bold border-r last:border-r-0 border-black"
                    >
                      {columnLabels[column]}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Determine max rows needed */}
                {Array.from({
                  length: Math.max(...Object.values(groupedEntries).map(arr => arr.length), 1),
                }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {sipocColumns.map(column => {
                      const entry = groupedEntries[column][rowIndex]
                      return (
                        <TableCell
                          key={column}
                          className="border-r last:border-r-0 border-gray-300 align-top p-2 max-w-[200px]"
                        >
                          {entry ? (
                            <div className="flex items-start justify-between gap-2 min-h-[40px]">
                              {editingEntry === entry.id ? (
                                <div className="flex-1 flex gap-2">
                                  <Input
                                    defaultValue={entry.value}
                                    onBlur={e => handleUpdateEntry(entry.id, e.target.value)}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        handleUpdateEntry(entry.id, e.currentTarget.value)
                                      } else if (e.key === 'Escape') {
                                        setEditingEntry(null)
                                      }
                                    }}
                                    autoFocus
                                    className="text-sm"
                                  />
                                </div>
                              ) : (
                                <>
                                  <span className="text-sm flex-1 break-words whitespace-normal">
                                    {entry.value}
                                  </span>
                                  {canEdit && (
                                    <div className="flex gap-1 flex-shrink-0">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingEntry(entry.id)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Edit2 className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteEntry(entry.id)}
                                        className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="min-h-[40px]" />
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Add Row Form */}
          {canEdit && (
            <>
              {!isAdding ? (
                <Button
                  onClick={() => setIsAdding(true)}
                  className="bg-black text-white hover:bg-gray-800"
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add SIPOC Row
                </Button>
              ) : (
                <Card className="border-2 border-black">
                  <CardHeader>
                    <CardTitle className="text-lg">Add SIPOC Row</CardTitle>
                    <CardDescription>
                      Fill in the fields for each column. You can leave fields empty if not
                      applicable.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-5 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Supplier</label>
                        <Textarea
                          placeholder="Who provides inputs?"
                          value={rowForm.supplier}
                          onChange={e => setRowForm({ ...rowForm, supplier: e.target.value })}
                          className="min-h-[100px]"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Input</label>
                        <Textarea
                          placeholder="What inputs are provided?"
                          value={rowForm.input}
                          onChange={e => setRowForm({ ...rowForm, input: e.target.value })}
                          className="min-h-[100px]"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Process</label>
                        <Textarea
                          placeholder="What process step?"
                          value={rowForm.process}
                          onChange={e => setRowForm({ ...rowForm, process: e.target.value })}
                          className="min-h-[100px]"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Output</label>
                        <Textarea
                          placeholder="What outputs are produced?"
                          value={rowForm.output}
                          onChange={e => setRowForm({ ...rowForm, output: e.target.value })}
                          className="min-h-[100px]"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Customer</label>
                        <Textarea
                          placeholder="Who receives the outputs?"
                          value={rowForm.customer}
                          onChange={e => setRowForm({ ...rowForm, customer: e.target.value })}
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAdding(false)
                          setRowForm({
                            supplier: '',
                            input: '',
                            process: '',
                            output: '',
                            customer: '',
                          })
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddRow}
                        disabled={
                          loading ||
                          (!rowForm.supplier &&
                            !rowForm.input &&
                            !rowForm.process &&
                            !rowForm.output &&
                            !rowForm.customer)
                        }
                        className="bg-black text-white hover:bg-gray-800"
                      >
                        Add Row
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
