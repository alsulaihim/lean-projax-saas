'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Save, Edit2, X, Calendar } from 'lucide-react'
import type { Prisma } from '@prisma/client'

type CharterWithSchedule = Prisma.AssignmentCharterGetPayload<{
  include: { scheduleItems: true }
}>

interface CharterSectionProps {
  assignmentId: string
  charter: CharterWithSchedule | null
  canEdit: boolean
  userId: string
}

const DEFAULT_MILESTONES = [
  'Form project team',
  'Prepare project plan',
  'Define phase',
  'Measure phase',
  'Analysis phase',
  'Report preparation',
  'Recommendation and action plan discussion',
  'Improvement phase',
  'Control phase'
]

export function CharterSection({ assignmentId, charter, canEdit, userId }: CharterSectionProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(!charter)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    assignmentName: charter?.assignmentName || '',
    programSponsor: charter?.programSponsor || '',
    processOwner: charter?.processOwner || '',
    programManagement: charter?.programManagement || '',
    projectTeam: charter?.projectTeam || '',
    strategicAlignment: charter?.strategicAlignment || '',
    problemStatement: charter?.problemStatement || '',
    businessCase: charter?.businessCase || '',
    goalMetric: charter?.goalMetric || '',
    expectedDeliverables: charter?.expectedDeliverables || '',
    inScope: charter?.inScope || '',
    outOfScope: charter?.outOfScope || '',
    drivers: charter?.drivers || '',
    nonFinancialBenefits: charter?.nonFinancialBenefits || '',
    existingLeverage: charter?.existingLeverage || '',
    futureLeverage: charter?.futureLeverage || '',
    risks: charter?.risks || '',
    constraints: charter?.constraints || '',
    assumptions: charter?.assumptions || '',
    businessStakeholders: charter?.businessStakeholders || ''
  })

  const [scheduleItems, setScheduleItems] = useState(
    charter?.scheduleItems.sort((a, b) => a.order - b.order) ||
    DEFAULT_MILESTONES.map((milestone, index) => ({
      milestone,
      startDate: null as Date | null,
      endDate: null as Date | null,
      order: index + 1
    }))
  )

  const handleSave = async () => {
    if (!formData.assignmentName) {
      alert('Assignment Name is required')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/charter/${assignmentId}`, {
        method: charter ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          scheduleItems
        })
      })

      if (response.ok) {
        setIsEditing(false)
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save charter')
      }
    } catch (error) {
      console.error('Failed to save charter:', error)
      alert('Failed to save charter')
    } finally {
      setLoading(false)
    }
  }

  const updateScheduleItem = (index: number, field: 'milestone' | 'startDate' | 'endDate', value: string) => {
    const updated = [...scheduleItems]
    if (field === 'startDate' || field === 'endDate') {
      updated[index][field] = value ? new Date(value) : null
    } else {
      updated[index][field] = value
    }
    setScheduleItems(updated)
  }

  if (!charter && !isEditing) {
    return (
      <Card className="border-2 border-black">
        <CardContent className="py-12 text-center">
          <p className="text-gray-500 mb-4">No charter has been created for this assignment</p>
          {canEdit && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-black text-white hover:bg-gray-800"
            >
              Create Charter
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header Actions */}
      <div className="flex justify-between items-center sticky top-0 bg-white py-4 z-10 border-b-2 border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignment Charter</h1>
          <p className="text-sm text-gray-600 mt-1">Comprehensive project definition and planning document</p>
        </div>
        {canEdit && !isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="border-2 border-black"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Charter
          </Button>
        )}
        {isEditing && (
          <div className="flex gap-2">
            <Button
              onClick={() => {
                if (charter) {
                  setIsEditing(false)
                  router.refresh()
                }
              }}
              variant="outline"
              disabled={loading || !charter}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !formData.assignmentName}
              className="bg-black text-white hover:bg-gray-800"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Charter'}
            </Button>
          </div>
        )}
      </div>

      {/* Assignment Information */}
      <Card className="border-2 border-black shadow-sm">
        <CardHeader className="bg-gray-50 border-b-2 border-black">
          <CardTitle className="text-xl font-bold uppercase tracking-wide">1. Assignment Information</CardTitle>
          <CardDescription className="text-sm mt-1">Core project identification and team structure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div>
            <label className="text-sm font-medium flex items-center gap-1">
              Assignment Name <span className="text-red-500">*</span>
            </label>
            {isEditing ? (
              <Input
                value={formData.assignmentName}
                onChange={(e) => setFormData({ ...formData, assignmentName: e.target.value })}
                placeholder="Enter assignment name"
                className="mt-1"
                required
              />
            ) : (
              <p className="mt-1">{formData.assignmentName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Program Sponsor</label>
              {isEditing ? (
                <Textarea
                  value={formData.programSponsor}
                  onChange={(e) => setFormData({ ...formData, programSponsor: e.target.value })}
                  placeholder="Enter program sponsor"
                  className="mt-1 min-h-[80px]"
                />
              ) : (
                <p className="mt-1 whitespace-pre-wrap">{formData.programSponsor || '-'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Process Owner</label>
              {isEditing ? (
                <Textarea
                  value={formData.processOwner}
                  onChange={(e) => setFormData({ ...formData, processOwner: e.target.value })}
                  placeholder="Enter process owner"
                  className="mt-1 min-h-[80px]"
                />
              ) : (
                <p className="mt-1 whitespace-pre-wrap">{formData.processOwner || '-'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Program Management</label>
              {isEditing ? (
                <Textarea
                  value={formData.programManagement}
                  onChange={(e) => setFormData({ ...formData, programManagement: e.target.value })}
                  placeholder="Enter program management"
                  className="mt-1 min-h-[80px]"
                />
              ) : (
                <p className="mt-1 whitespace-pre-wrap">{formData.programManagement || '-'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Project Team</label>
              {isEditing ? (
                <Textarea
                  value={formData.projectTeam}
                  onChange={(e) => setFormData({ ...formData, projectTeam: e.target.value })}
                  placeholder="Enter project team members"
                  className="mt-1 min-h-[80px]"
                />
              ) : (
                <p className="mt-1 whitespace-pre-wrap">{formData.projectTeam || '-'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Overview & Scope - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Overview */}
        <Card className="border-2 border-black shadow-sm">
          <CardHeader className="bg-gray-50 border-b-2 border-black">
            <CardTitle className="text-xl font-bold uppercase tracking-wide">2. Project Overview</CardTitle>
            <CardDescription className="text-sm mt-1">Strategic context and objectives</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {[
              { key: 'strategicAlignment', label: 'Strategic Alignment' },
              { key: 'problemStatement', label: 'Problem Statement' },
              { key: 'businessCase', label: 'Business Case' },
              { key: 'goalMetric', label: 'Goal & Metric' },
              { key: 'expectedDeliverables', label: 'Expected Deliverables' }
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-sm font-semibold text-gray-700">{label}</label>
                {isEditing ? (
                  <Textarea
                    value={formData[key as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    className="mt-1 min-h-[100px]"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{formData[key as keyof typeof formData] || '-'}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Project Scope */}
        <Card className="border-2 border-black shadow-sm">
          <CardHeader className="bg-gray-50 border-b-2 border-black">
            <CardTitle className="text-xl font-bold uppercase tracking-wide">3. Project Scope</CardTitle>
            <CardDescription className="text-sm mt-1">Boundaries and limitations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <label className="text-sm font-semibold text-gray-700">In Scope</label>
              {isEditing ? (
                <Textarea
                  value={formData.inScope}
                  onChange={(e) => setFormData({ ...formData, inScope: e.target.value })}
                  placeholder="What is included in this project"
                  className="mt-1 min-h-[150px]"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{formData.inScope || '-'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Out of Scope</label>
              {isEditing ? (
                <Textarea
                  value={formData.outOfScope}
                  onChange={(e) => setFormData({ ...formData, outOfScope: e.target.value })}
                  placeholder="What is excluded from this project"
                  className="mt-1 min-h-[150px]"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{formData.outOfScope || '-'}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Schedule */}
      <Card className="border-2 border-black shadow-sm">
        <CardHeader className="bg-gray-50 border-b-2 border-black">
          <CardTitle className="text-xl font-bold uppercase tracking-wide flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            4. Assignment Schedule
          </CardTitle>
          <CardDescription className="text-sm mt-1">Project timeline and key milestones</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="font-bold">Milestone</TableHead>
                <TableHead className="font-bold">Start Date</TableHead>
                <TableHead className="font-bold">End Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduleItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.milestone}</TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => updateScheduleItem(index, 'startDate', e.target.value)}
                      />
                    ) : (
                      item.startDate ? new Date(item.startDate).toLocaleDateString() : '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => updateScheduleItem(index, 'endDate', e.target.value)}
                      />
                    ) : (
                      item.endDate ? new Date(item.endDate).toLocaleDateString() : '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customer Drivers & Leverage - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Drivers & Benefits */}
        <Card className="border-2 border-black shadow-sm">
          <CardHeader className="bg-gray-50 border-b-2 border-black">
            <CardTitle className="text-xl font-bold uppercase tracking-wide">5. Customer Drivers & Benefits</CardTitle>
            <CardDescription className="text-sm mt-1">Key motivators and advantages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <label className="text-sm font-semibold text-gray-700">Drivers</label>
              {isEditing ? (
                <Textarea
                  value={formData.drivers}
                  onChange={(e) => setFormData({ ...formData, drivers: e.target.value })}
                  placeholder="Enter customer drivers"
                  className="mt-1 min-h-[150px]"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{formData.drivers || '-'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Non-Financial Benefits</label>
              {isEditing ? (
                <Textarea
                  value={formData.nonFinancialBenefits}
                  onChange={(e) => setFormData({ ...formData, nonFinancialBenefits: e.target.value })}
                  placeholder="Enter non-financial benefits"
                  className="mt-1 min-h-[150px]"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{formData.nonFinancialBenefits || '-'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Leverage In & Out */}
        <Card className="border-2 border-black shadow-sm">
          <CardHeader className="bg-gray-50 border-b-2 border-black">
            <CardTitle className="text-xl font-bold uppercase tracking-wide">6. Leverage In & Out</CardTitle>
            <CardDescription className="text-sm mt-1">Resource utilization and sharing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <label className="text-sm font-semibold text-gray-700">Existing (In)</label>
              {isEditing ? (
                <Textarea
                  value={formData.existingLeverage}
                  onChange={(e) => setFormData({ ...formData, existingLeverage: e.target.value })}
                  placeholder="What currently exists that can be leveraged"
                  className="mt-1 min-h-[150px]"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{formData.existingLeverage || '-'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Future (Out)</label>
              {isEditing ? (
                <Textarea
                  value={formData.futureLeverage}
                  onChange={(e) => setFormData({ ...formData, futureLeverage: e.target.value })}
                  placeholder="What can be leveraged in the future"
                  className="mt-1 min-h-[150px]"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{formData.futureLeverage || '-'}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Management & Team - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk, Constraints and Assumptions */}
        <Card className="border-2 border-black shadow-sm">
          <CardHeader className="bg-gray-50 border-b-2 border-black">
            <CardTitle className="text-xl font-bold uppercase tracking-wide">7. Risk, Constraints & Assumptions</CardTitle>
            <CardDescription className="text-sm mt-1">Project challenges and considerations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <label className="text-sm font-semibold text-gray-700">Risks</label>
              {isEditing ? (
                <Textarea
                  value={formData.risks}
                  onChange={(e) => setFormData({ ...formData, risks: e.target.value })}
                  placeholder="Enter project risks"
                  className="mt-1 min-h-[100px]"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{formData.risks || '-'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Constraints</label>
              {isEditing ? (
                <Textarea
                  value={formData.constraints}
                  onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                  placeholder="Enter project constraints"
                  className="mt-1 min-h-[100px]"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{formData.constraints || '-'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Assumptions</label>
              {isEditing ? (
                <Textarea
                  value={formData.assumptions}
                  onChange={(e) => setFormData({ ...formData, assumptions: e.target.value })}
                  placeholder="Enter project assumptions"
                  className="mt-1 min-h-[100px]"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{formData.assumptions || '-'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assignment Team */}
        <Card className="border-2 border-black shadow-sm">
          <CardHeader className="bg-gray-50 border-b-2 border-black">
            <CardTitle className="text-xl font-bold uppercase tracking-wide">8. Assignment Team</CardTitle>
            <CardDescription className="text-sm mt-1">Key stakeholders and participants</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div>
              <label className="text-sm font-semibold text-gray-700">Business Stakeholders</label>
              {isEditing ? (
                <Textarea
                  value={formData.businessStakeholders}
                  onChange={(e) => setFormData({ ...formData, businessStakeholders: e.target.value })}
                  placeholder="Enter business stakeholders"
                  className="mt-1 min-h-[350px]"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{formData.businessStakeholders || '-'}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
