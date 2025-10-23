'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Trash2, Edit2, AlertTriangle } from 'lucide-react'
import type { FMEAEntry } from '@prisma/client'

interface FMEASectionProps {
  assignmentId: string
  fmeaEntries: FMEAEntry[]
  canEdit: boolean
  userId: string
}

export function FMEASection({ assignmentId, fmeaEntries, canEdit, userId }: FMEASectionProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [entryForm, setEntryForm] = useState({
    failureMode: '',
    effectsOfFailure: '',
    severity: '5',
    potentialCauses: '',
    occurrence: '5',
    currentControls: '',
    detection: '5',
    recommendedActions: '',
  })

  const [editForm, setEditForm] = useState({
    failureMode: '',
    effectsOfFailure: '',
    severity: '5',
    potentialCauses: '',
    occurrence: '5',
    currentControls: '',
    detection: '5',
    recommendedActions: '',
  })

  const calculateRPN = (severity: number, occurrence: number, detection: number) => {
    return severity * occurrence * detection
  }

  const getRPNColor = (rpn: number) => {
    if (rpn >= 200) return 'bg-red-100 text-red-800 border-red-300'
    if (rpn >= 100) return 'bg-orange-100 text-orange-800 border-orange-300'
    if (rpn >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-green-100 text-green-800 border-green-300'
  }

  const sortedEntries = [...fmeaEntries].sort((a, b) => b.rpn - a.rpn)

  const handleAddEntry = async () => {
    setLoading(true)
    try {
      const severity = parseInt(entryForm.severity)
      const occurrence = parseInt(entryForm.occurrence)
      const detection = parseInt(entryForm.detection)
      const rpn = calculateRPN(severity, occurrence, detection)

      const response = await fetch('/api/fmea-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          userId,
          failureMode: entryForm.failureMode,
          effectsOfFailure: entryForm.effectsOfFailure,
          severity,
          potentialCauses: entryForm.potentialCauses,
          occurrence,
          currentControls: entryForm.currentControls,
          detection,
          rpn,
          recommendedActions: entryForm.recommendedActions || null,
        }),
      })

      if (response.ok) {
        setIsAdding(false)
        setEntryForm({
          failureMode: '',
          effectsOfFailure: '',
          severity: '5',
          potentialCauses: '',
          occurrence: '5',
          currentControls: '',
          detection: '5',
          recommendedActions: '',
        })
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to add FMEA entry:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateEntry = async (entryId: string) => {
    setLoading(true)
    try {
      const severity = parseInt(editForm.severity)
      const occurrence = parseInt(editForm.occurrence)
      const detection = parseInt(editForm.detection)
      const rpn = calculateRPN(severity, occurrence, detection)

      const response = await fetch(`/api/fmea-entries/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          failureMode: editForm.failureMode,
          effectsOfFailure: editForm.effectsOfFailure,
          severity,
          potentialCauses: editForm.potentialCauses,
          occurrence,
          currentControls: editForm.currentControls,
          detection,
          rpn,
          recommendedActions: editForm.recommendedActions || null,
          userId,
          assignmentId,
        }),
      })

      if (response.ok) {
        setEditingEntry(null)
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to update FMEA entry:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this FMEA entry?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/fmea-entries/${entryId}`, {
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

  const startEditing = (entry: FMEAEntry) => {
    setEditingEntry(entry.id)
    setEditForm({
      failureMode: entry.failureMode,
      effectsOfFailure: entry.effectsOfFailure,
      severity: entry.severity.toString(),
      potentialCauses: entry.potentialCauses,
      occurrence: entry.occurrence.toString(),
      currentControls: entry.currentControls,
      detection: entry.detection.toString(),
      recommendedActions: entry.recommendedActions || '',
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-black">
        <CardHeader>
          <CardTitle className="text-2xl">FMEA (Failure Mode and Effects Analysis)</CardTitle>
          <CardDescription>
            Identify and prioritize potential failure modes with auto-calculated Risk Priority
            Number (RPN)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          {sortedEntries.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              <Card className="border border-gray-300">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Total Entries</p>
                    <p className="text-2xl font-bold">{sortedEntries.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-gray-300">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Highest RPN</p>
                    <p className="text-2xl font-bold">{sortedEntries[0]?.rpn || 0}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-gray-300">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Average RPN</p>
                    <p className="text-2xl font-bold">
                      {Math.round(
                        sortedEntries.reduce((sum, e) => sum + e.rpn, 0) / sortedEntries.length
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-gray-300">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">High Risk (RPN≥200)</p>
                    <p className="text-2xl font-bold">
                      {sortedEntries.filter(e => e.rpn >= 200).length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* FMEA Table */}
          {sortedEntries.length > 0 ? (
            <div className="border-2 border-black rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="w-[12%] font-bold">Failure Mode</TableHead>
                    <TableHead className="w-[15%] font-bold">Effects of Failure</TableHead>
                    <TableHead className="text-center w-[50px] font-bold">SEV</TableHead>
                    <TableHead className="w-[12%] font-bold">Potential Causes</TableHead>
                    <TableHead className="text-center w-[50px] font-bold">OCC</TableHead>
                    <TableHead className="w-[12%] font-bold">Current Controls</TableHead>
                    <TableHead className="text-center w-[50px] font-bold">DET</TableHead>
                    <TableHead className="text-center w-[70px] font-bold">RPN</TableHead>
                    <TableHead className="w-[15%] font-bold">Recommended Actions</TableHead>
                    {canEdit && (
                      <TableHead className="w-[90px] sticky right-0 bg-gray-100 font-bold shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)]"></TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEntries.map(entry => (
                    <TableRow key={entry.id}>
                      {editingEntry === entry.id ? (
                        <>
                          <TableCell>
                            <Textarea
                              value={editForm.failureMode}
                              onChange={e =>
                                setEditForm({ ...editForm, failureMode: e.target.value })
                              }
                              className="text-sm min-h-[60px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Textarea
                              value={editForm.effectsOfFailure}
                              onChange={e =>
                                setEditForm({ ...editForm, effectsOfFailure: e.target.value })
                              }
                              className="text-sm min-h-[60px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={editForm.severity}
                              onChange={e => setEditForm({ ...editForm, severity: e.target.value })}
                              className="text-sm text-center w-16"
                            />
                          </TableCell>
                          <TableCell>
                            <Textarea
                              value={editForm.potentialCauses}
                              onChange={e =>
                                setEditForm({ ...editForm, potentialCauses: e.target.value })
                              }
                              className="text-sm min-h-[60px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={editForm.occurrence}
                              onChange={e =>
                                setEditForm({ ...editForm, occurrence: e.target.value })
                              }
                              className="text-sm text-center w-16"
                            />
                          </TableCell>
                          <TableCell>
                            <Textarea
                              value={editForm.currentControls}
                              onChange={e =>
                                setEditForm({ ...editForm, currentControls: e.target.value })
                              }
                              className="text-sm min-h-[60px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={editForm.detection}
                              onChange={e =>
                                setEditForm({ ...editForm, detection: e.target.value })
                              }
                              className="text-sm text-center w-16"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`px-2 py-1 text-sm font-bold border rounded ${getRPNColor(calculateRPN(parseInt(editForm.severity), parseInt(editForm.occurrence), parseInt(editForm.detection)))}`}
                            >
                              {calculateRPN(
                                parseInt(editForm.severity),
                                parseInt(editForm.occurrence),
                                parseInt(editForm.detection)
                              )}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Textarea
                              value={editForm.recommendedActions}
                              onChange={e =>
                                setEditForm({ ...editForm, recommendedActions: e.target.value })
                              }
                              className="text-sm min-h-[60px]"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateEntry(entry.id)}
                                disabled={loading}
                                className="text-green-600 hover:text-green-800"
                              >
                                Save
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingEntry(null)}
                                disabled={loading}
                              >
                                Cancel
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium align-top">
                            <div className="break-words whitespace-normal">{entry.failureMode}</div>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="break-words whitespace-normal">
                              {entry.effectsOfFailure}
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-bold">{entry.severity}</TableCell>
                          <TableCell className="align-top">
                            <div className="break-words whitespace-normal">
                              {entry.potentialCauses}
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            {entry.occurrence}
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="break-words whitespace-normal">
                              {entry.currentControls}
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-bold">{entry.detection}</TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`px-2 py-1 text-sm font-bold border rounded inline-block ${getRPNColor(entry.rpn)}`}
                            >
                              {entry.rpn}
                            </span>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="break-words whitespace-normal">
                              {entry.recommendedActions || '-'}
                            </div>
                          </TableCell>
                          {canEdit && (
                            <TableCell className="sticky right-0 bg-white shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)]">
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditing(entry)}
                                  disabled={loading}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteEntry(entry.id)}
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
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 mb-4">No FMEA entries yet</p>
              </CardContent>
            </Card>
          )}

          {/* Add Entry Form */}
          {canEdit && (
            <>
              {!isAdding ? (
                <Button
                  onClick={() => setIsAdding(true)}
                  className="bg-black text-white hover:bg-gray-800"
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add FMEA Entry
                </Button>
              ) : (
                <Card className="border-2 border-black">
                  <CardHeader>
                    <CardTitle className="text-lg">Add FMEA Entry</CardTitle>
                    <CardDescription>
                      SEV = Severity (1-10), OCC = Occurrence (1-10), DET = Detection (1-10), RPN =
                      SEV × OCC × DET
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Failure Mode</label>
                        <Textarea
                          placeholder="How could the process fail?"
                          value={entryForm.failureMode}
                          onChange={e =>
                            setEntryForm({ ...entryForm, failureMode: e.target.value })
                          }
                          className="min-h-[80px]"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Effects of Failure</label>
                        <Textarea
                          placeholder="What happens when it fails?"
                          value={entryForm.effectsOfFailure}
                          onChange={e =>
                            setEntryForm({ ...entryForm, effectsOfFailure: e.target.value })
                          }
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Severity (1-10)</label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={entryForm.severity}
                        onChange={e => setEntryForm({ ...entryForm, severity: e.target.value })}
                      />
                      <p className="text-xs text-gray-500 mt-1">1 = Minor, 10 = Catastrophic</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Potential Causes</label>
                        <Textarea
                          placeholder="What could cause this failure?"
                          value={entryForm.potentialCauses}
                          onChange={e =>
                            setEntryForm({ ...entryForm, potentialCauses: e.target.value })
                          }
                          className="min-h-[80px]"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Current Controls</label>
                        <Textarea
                          placeholder="What controls are in place?"
                          value={entryForm.currentControls}
                          onChange={e =>
                            setEntryForm({ ...entryForm, currentControls: e.target.value })
                          }
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Occurrence (1-10)</label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={entryForm.occurrence}
                          onChange={e => setEntryForm({ ...entryForm, occurrence: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">1 = Rare, 10 = Very Frequent</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Detection (1-10)</label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={entryForm.detection}
                          onChange={e => setEntryForm({ ...entryForm, detection: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          1 = Easy to Detect, 10 = Cannot Detect
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-300 rounded">
                      <AlertTriangle className="h-8 w-8" />
                      <div>
                        <p className="text-sm font-medium">Calculated RPN</p>
                        <p className="text-3xl font-bold">
                          {calculateRPN(
                            parseInt(entryForm.severity) || 1,
                            parseInt(entryForm.occurrence) || 1,
                            parseInt(entryForm.detection) || 1
                          )}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Recommended Actions (optional)
                      </label>
                      <Textarea
                        placeholder="What should be done to reduce risk?"
                        value={entryForm.recommendedActions}
                        onChange={e =>
                          setEntryForm({ ...entryForm, recommendedActions: e.target.value })
                        }
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAdding(false)
                          setEntryForm({
                            failureMode: '',
                            effectsOfFailure: '',
                            severity: '5',
                            potentialCauses: '',
                            occurrence: '5',
                            currentControls: '',
                            detection: '5',
                            recommendedActions: '',
                          })
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddEntry}
                        disabled={
                          !entryForm.failureMode ||
                          !entryForm.effectsOfFailure ||
                          !entryForm.potentialCauses ||
                          !entryForm.currentControls ||
                          loading
                        }
                        className="bg-black text-white hover:bg-gray-800"
                      >
                        Add Entry
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
