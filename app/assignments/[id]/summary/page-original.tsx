import { notFound, redirect } from 'next/navigation'
import { getUser } from '@/lib/auth-check'
import prisma from '@/lib/prisma'
import { calculatePareto } from '@/lib/calculations/pareto'
import { calculateVSMMetrics } from '@/lib/calculations/vsm-metrics'
import { analyzeProcessCapability } from '@/lib/calculations/capability'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  FileDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Activity,
  BarChart3,
  Target,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import { ParetoChart } from '@/components/charts/pareto-chart'

export default async function ExecutiveSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Fetch assignment with all related data
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      createdBy: true,
      processes: {
        include: {
          vsmSteps: {
            orderBy: { stepNumber: 'asc' },
          },
          fmeaEntries: {
            orderBy: { rpn: 'desc' },
          },
          fishboneCategories: {
            include: {
              causes: true,
            },
          },
          sipocEntries: true,
        },
        orderBy: { order: 'asc' },
      },
      vocStatements: {
        include: {
          ctqRequirements: true,
        },
      },
      recommendations: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!assignment) {
    notFound()
  }

  // Calculate key metrics
  const totalVOC = assignment.vocStatements.length
  const totalCTQ = assignment.vocStatements.reduce(
    (sum, voc) => sum + voc.ctqRequirements.length,
    0
  )

  // VSM Metrics
  const allVSMSteps = assignment.processes.flatMap(p => p.vsmSteps)
  const vsmMetrics = calculateVSMMetrics(allVSMSteps)

  // FMEA Metrics
  const allFMEA = assignment.processes.flatMap(p => p.fmeaEntries)
  const highRiskFMEA = allFMEA.filter(f => f.rpn >= 200)
  const mediumRiskFMEA = allFMEA.filter(f => f.rpn >= 100 && f.rpn < 200)
  const topFMEA = allFMEA.slice(0, 5)

  // Process Capability Metrics
  const processesWithCapability = assignment.processes
    .map(p => {
      if (p.lowerSpecLimit && p.upperSpecLimit && p.sampleMean && p.sampleStdDev) {
        return {
          name: p.processName,
          ...analyzeProcessCapability({
            lowerSpecLimit: p.lowerSpecLimit,
            upperSpecLimit: p.upperSpecLimit,
            targetValue: p.targetValue,
            mean: p.sampleMean,
            stdDev: p.sampleStdDev,
          }),
        }
      }
      return null
    })
    .filter(Boolean)

  const capableProcesses = processesWithCapability.filter(p => p?.isCapable).length
  const excellentProcesses = processesWithCapability.filter(p => p?.rating === 'excellent').length

  // Pareto Analysis for top VSM steps
  const paretoData = calculatePareto(
    allVSMSteps.map(step => ({
      id: step.id,
      name: step.stepName,
      value: step.durationMinutes + (step.waitTimeMinutes || 0),
    }))
  )

  const topParetoSteps = paretoData.items.slice(0, 5).map(item => ({
    name: item.name,
    value: item.value,
    cumulative: item.cumulativePercentage,
    isVitalFew: item.isVitalFew,
  }))

  // Recommendations Summary
  const proposedRecs = assignment.recommendations.filter(r => r.status === 'PROPOSED').length
  const approvedRecs = assignment.recommendations.filter(r => r.status === 'APPROVED').length
  const implementedRecs = assignment.recommendations.filter(r => r.status === 'IMPLEMENTED').length

  // Status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'REOPENED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/assignments/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assignment
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{assignment.title}</h1>
            <p className="text-gray-600 mt-1">Executive Summary</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/api/assignments/${id}/export`}>
            <Button className="bg-black text-white hover:bg-gray-800">
              <FileDown className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </Link>
        </div>
      </div>

      {/* Assignment Info Card */}
      <Card className="mb-6 border-2 border-black">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">Assignment Overview</CardTitle>
              <CardDescription className="mt-2">{assignment.objective}</CardDescription>
            </div>
            <span
              className={`px-3 py-1 text-sm font-medium border rounded-full ${getStatusColor(assignment.status)}`}
            >
              {assignment.status}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Created By</p>
              <p className="font-medium">{assignment.createdBy.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created Date</p>
              <p className="font-medium">{new Date(assignment.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Processes Analyzed</p>
              <p className="font-medium">{assignment.processes.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Completion Date</p>
              <p className="font-medium">
                {assignment.completedAt
                  ? new Date(assignment.completedAt).toLocaleDateString()
                  : 'In Progress'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-300">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">VOC Statements</p>
                <p className="text-3xl font-bold">{totalVOC}</p>
                <p className="text-xs text-gray-500 mt-1">{totalCTQ} CTQ Requirements</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-300">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Process Efficiency</p>
                <p className="text-3xl font-bold">{vsmMetrics.efficiencyRatio.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-1">Value-Added Ratio</p>
              </div>
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-red-700 mb-1">High Risk Items</p>
                <p className="text-3xl font-bold text-red-800">{highRiskFMEA.length}</p>
                <p className="text-xs text-red-600 mt-1">RPN ≥ 200</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-green-300 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">Recommendations</p>
                <p className="text-3xl font-bold text-green-800">
                  {assignment.recommendations.length}
                </p>
                <p className="text-xs text-green-600 mt-1">{implementedRecs} Implemented</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Top Process Steps (Pareto) */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Process Steps by Cycle Time
            </CardTitle>
            <CardDescription>Focus areas for process optimization</CardDescription>
          </CardHeader>
          <CardContent>
            {topParetoSteps.length > 0 ? (
              <div className="space-y-3">
                {topParetoSteps.map((step, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-500 w-6">#{index + 1}</span>
                      <span className="text-sm">{step.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">{step.value} min</span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          step.isVitalFew
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}
                      >
                        {step.cumulative.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No VSM data available</p>
            )}
          </CardContent>
        </Card>

        {/* Top Risks (FMEA) */}
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Top Risk Items (FMEA)
            </CardTitle>
            <CardDescription>Critical failure modes requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {topFMEA.length > 0 ? (
              <div className="space-y-3">
                {topFMEA.map((fmea, index) => (
                  <div key={fmea.id} className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="font-bold text-gray-500 w-6 flex-shrink-0">
                        #{index + 1}
                      </span>
                      <span className="text-sm">{fmea.failureMode}</span>
                    </div>
                    <span
                      className={`text-sm font-bold px-2 py-1 rounded flex-shrink-0 ${
                        fmea.rpn >= 200
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : fmea.rpn >= 100
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                            : 'bg-green-100 text-green-800 border border-green-300'
                      }`}
                    >
                      RPN: {fmea.rpn}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No FMEA entries available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Process Capability Summary */}
      {processesWithCapability.length > 0 && (
        <Card className="mb-6 border-2 border-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Process Capability Summary
            </CardTitle>
            <CardDescription>Statistical process control metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Processes Measured</p>
                <p className="text-2xl font-bold">{processesWithCapability.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Capable (Cpk ≥ 1.33)</p>
                <p className="text-2xl font-bold text-green-600">{capableProcesses}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Excellent (Cpk ≥ 2.0)</p>
                <p className="text-2xl font-bold text-blue-600">{excellentProcesses}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Avg. Cpk</p>
                <p className="text-2xl font-bold">
                  {(
                    processesWithCapability.reduce((sum, p) => sum + (p?.cpk || 0), 0) /
                    processesWithCapability.length
                  ).toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Best Performer</p>
                <p className="text-lg font-bold">
                  {processesWithCapability.sort((a, b) => (b?.cpk || 0) - (a?.cpk || 0))[0]?.name ||
                    'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Summary */}
      <Card className="border-2 border-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recommendations Status
          </CardTitle>
          <CardDescription>Implementation progress and priorities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 border border-gray-300 rounded">
              <p className="text-sm text-gray-500 mb-1">Proposed</p>
              <p className="text-2xl font-bold text-blue-600">{proposedRecs}</p>
            </div>
            <div className="text-center p-4 border border-yellow-300 bg-yellow-50 rounded">
              <p className="text-sm text-yellow-700 mb-1">Approved</p>
              <p className="text-2xl font-bold text-yellow-800">{approvedRecs}</p>
            </div>
            <div className="text-center p-4 border border-green-300 bg-green-50 rounded">
              <p className="text-sm text-green-700 mb-1">Implemented</p>
              <p className="text-2xl font-bold text-green-800">{implementedRecs}</p>
            </div>
          </div>

          {assignment.recommendations.length > 0 && (
            <div className="space-y-2 mt-4">
              <p className="text-sm font-medium mb-2">Recent Recommendations:</p>
              {assignment.recommendations.slice(0, 3).map(rec => (
                <div
                  key={rec.id}
                  className="flex items-start justify-between p-3 border border-gray-200 rounded"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{rec.recommendationTitle}</p>
                    <p className="text-xs text-gray-600 mt-1">{rec.expectedImpact}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded font-medium ${
                      rec.status === 'IMPLEMENTED'
                        ? 'bg-green-100 text-green-800'
                        : rec.status === 'APPROVED'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {rec.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="mt-6 border-2 border-blue-500 bg-blue-50">
        <CardHeader>
          <CardTitle>Key Insights & Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {vsmMetrics.efficiencyRatio < 30 && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                <p>
                  <strong>Process Efficiency Alert:</strong> Current efficiency ratio is{' '}
                  {vsmMetrics.efficiencyRatio.toFixed(1)}%. Significant improvement opportunity
                  exists by reducing wait times and non-value-added activities.
                </p>
              </div>
            )}

            {highRiskFMEA.length > 0 && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <p>
                  <strong>Risk Mitigation Required:</strong> {highRiskFMEA.length} failure modes
                  have critical RPN scores (≥200). Immediate corrective actions should be
                  implemented to reduce risk exposure.
                </p>
              </div>
            )}

            {capableProcesses < processesWithCapability.length &&
              processesWithCapability.length > 0 && (
                <div className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <p>
                    <strong>Capability Improvement Needed:</strong> Only {capableProcesses} out of{' '}
                    {processesWithCapability.length} processes meet the capability threshold (Cpk ≥
                    1.33). Focus on reducing variation in underperforming processes.
                  </p>
                </div>
              )}

            {paretoData.vitalFewCount > 0 && (
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                <p>
                  <strong>Optimization Opportunity:</strong> {paretoData.vitalFewCount} process
                  steps ({((paretoData.vitalFewCount / paretoData.items.length) * 100).toFixed(0)}%
                  of total) contribute to 80% of cycle time. Focusing improvements here will yield
                  maximum impact.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
