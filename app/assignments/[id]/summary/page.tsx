import { notFound, redirect } from 'next/navigation'
import { getUser } from '@/lib/auth-check'
import prisma from '@/lib/prisma'
import { calculatePareto } from '@/lib/calculations/pareto'
import { calculateVSMMetrics } from '@/lib/calculations/vsm-metrics'
import { analyzeProcessCapability } from '@/lib/calculations/capability'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  FileDown,
  AlertTriangle,
  CheckCircle2,
  Users,
  Activity,
  Target,
  ArrowLeft,
  Layers,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { ParetoChart } from '@/components/charts/pareto-chart'
import { ProcessCapabilityChart } from '@/components/charts/process-capability-chart'
import { FishboneAnalysisViewer } from '@/components/fishbone-analysis-viewer'

export default async function ComprehensiveSummaryPage({
  params
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
            orderBy: { stepNumber: 'asc' }
          },
          fmeaEntries: {
            orderBy: { rpn: 'desc' }
          },
          fishboneCategories: {
            include: {
              causes: true
            }
          },
          sipocEntries: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      },
      vocStatements: {
        include: {
          ctqRequirements: true
        }
      },
      recommendations: {
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  if (!assignment) {
    notFound()
  }

  // Calculate key metrics
  const totalVOC = assignment.vocStatements.length
  const totalCTQ = assignment.vocStatements.reduce((sum, voc) => sum + voc.ctqRequirements.length, 0)

  // Helper to convert VSM steps to the format expected by calculateVSMMetrics
  const convertVSMSteps = (steps: Array<{
    id: string
    stepName: string
    processTime?: number | null
    durationMinutes?: number | null
    waitingTime?: number | null
    waitTimeMinutes?: number | null
    valueMeasure?: string | null
    valueAdded?: boolean | null
  }>) => {
    return steps.map(step => ({
      id: step.id,
      stepName: step.stepName,
      durationMinutes: step.processTime || step.durationMinutes || 0,
      waitTimeMinutes: step.waitingTime || step.waitTimeMinutes || 0,
      valueAdded: step.valueMeasure === 'VALUE_ADDED'
    }))
  }

  // VSM Metrics for all processes
  const allVSMSteps = assignment.processes.flatMap(p => p.vsmSteps)
  const vsmMetrics = calculateVSMMetrics(convertVSMSteps(allVSMSteps))

  // FMEA Metrics
  const allFMEA = assignment.processes.flatMap(p => p.fmeaEntries)
  const highRiskFMEA = allFMEA.filter(f => f.rpn >= 200)
  const mediumRiskFMEA = allFMEA.filter(f => f.rpn >= 100 && f.rpn < 200)

  // Process-specific metrics
  const processMetrics = assignment.processes.map(process => {
    const vsmSteps = process.vsmSteps
    const processVSMMetrics = calculateVSMMetrics(convertVSMSteps(vsmSteps))

    // Pareto for this process
    const paretoData = calculatePareto(
      vsmSteps.map(step => ({
        id: step.id,
        name: step.stepName,
        value: (step.processTime || step.durationMinutes || 0) + (step.waitingTime || step.waitTimeMinutes || 0)
      }))
    )

    // Process capability
    let capabilityData = null
    if (process.lowerSpecLimit && process.upperSpecLimit && process.sampleMean && process.sampleStdDev) {
      capabilityData = analyzeProcessCapability({
        lowerSpecLimit: process.lowerSpecLimit,
        upperSpecLimit: process.upperSpecLimit,
        targetValue: process.targetValue,
        mean: process.sampleMean,
        stdDev: process.sampleStdDev
      })
    }

    // FMEA summary
    const processHighRisk = process.fmeaEntries.filter(f => f.rpn >= 200)
    const processMediumRisk = process.fmeaEntries.filter(f => f.rpn >= 100 && f.rpn < 200)

    // Fishbone categories
    const totalCauses = process.fishboneCategories.reduce((sum, cat) => sum + cat.causes.length, 0)

    // Calculate SIPOC Steps (rows) - max count across all columns
    const sipocSteps = Math.max(
      process.sipocEntries.filter(e => e.column === 'SUPPLIER').length,
      process.sipocEntries.filter(e => e.column === 'INPUT').length,
      process.sipocEntries.filter(e => e.column === 'PROCESS').length,
      process.sipocEntries.filter(e => e.column === 'OUTPUT').length,
      process.sipocEntries.filter(e => e.column === 'CUSTOMER').length,
      0
    )

    return {
      name: process.processName,
      vsmMetrics: processVSMMetrics,
      paretoData: paretoData,
      capabilityData: capabilityData,
      fmeaStats: {
        total: process.fmeaEntries.length,
        high: processHighRisk.length,
        medium: processMediumRisk.length,
        low: process.fmeaEntries.length - processHighRisk.length - processMediumRisk.length,
        topRisks: process.fmeaEntries.slice(0, 3)
      },
      sipocSteps: sipocSteps,
      fishboneStats: {
        categories: process.fishboneCategories.length,
        totalCauses: totalCauses
      }
    }
  })

  // Status color helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-300'
      case 'REOPENED': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getValueMeasureColor = (measure: string) => {
    switch (measure) {
      case 'VALUE_ADDED': return 'bg-green-100 text-green-800'
      case 'ESSENTIAL_NON_VALUE': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-red-100 text-red-800'
    }
  }

  return (
    <div className="max-w-[1800px] mx-auto py-6 px-4">
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
            <p className="text-gray-600 mt-1">Comprehensive Summary Dashboard</p>
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

      {/* Assignment Overview Card */}
      <Card className="mb-6 border-2 border-black">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">Assignment Overview</CardTitle>
              <CardDescription className="mt-2">
                {assignment.objective}
              </CardDescription>
            </div>
            <span className={`px-3 py-1 text-sm font-medium border rounded-full ${getStatusColor(assignment.status)}`}>
              {assignment.status}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-500">Created By</p>
              <p className="font-medium">{assignment.createdBy.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created Date</p>
              <p className="font-medium">{new Date(assignment.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Processes</p>
              <p className="font-medium">{assignment.processes.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">VOC/CTQ</p>
              <p className="font-medium">{totalVOC}/{totalCTQ}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Completion</p>
              <p className="font-medium">
                {assignment.completedAt ? new Date(assignment.completedAt).toLocaleDateString() : 'In Progress'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Metrics Dashboard */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <Card className="border border-gray-300">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <p className="text-xs text-gray-500">VOC Statements</p>
              <p className="text-2xl font-bold">{totalVOC}</p>
              <p className="text-xs text-gray-400 mt-1">{totalCTQ} CTQs</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-300">
          <CardContent className="pt-6">
            <div className="text-center">
              <Activity className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <p className="text-xs text-gray-500">Overall Efficiency</p>
              <p className="text-2xl font-bold">{vsmMetrics.efficiencyRatio.toFixed(1)}%</p>
              <p className="text-xs text-gray-400 mt-1">VA Ratio</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <p className="text-xs text-red-700">High Risk</p>
              <p className="text-2xl font-bold text-red-800">{highRiskFMEA.length}</p>
              <p className="text-xs text-red-600 mt-1">RPN ≥ 200</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-yellow-300 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
              <p className="text-xs text-yellow-700">Medium Risk</p>
              <p className="text-2xl font-bold text-yellow-800">{mediumRiskFMEA.length}</p>
              <p className="text-xs text-yellow-600 mt-1">RPN 100-199</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-green-300 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-xs text-green-700">Recommendations</p>
              <p className="text-2xl font-bold text-green-800">{assignment.recommendations.length}</p>
              <p className="text-xs text-green-600 mt-1">Total</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-blue-300 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <Layers className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-xs text-blue-700">Processes</p>
              <p className="text-2xl font-bold text-blue-800">{assignment.processes.length}</p>
              <p className="text-xs text-blue-600 mt-1">Analyzed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Process-by-Process Analysis */}
      <Tabs defaultValue={assignment.processes[0]?.id || "overview"} className="space-y-4">
        <TabsList className="w-full justify-start bg-white border-2 border-black h-auto flex-wrap">
          <TabsTrigger value="overview" className="data-[state=active]:bg-black data-[state=active]:text-white">
            Overall Summary
          </TabsTrigger>
          {assignment.processes.map(process => (
            <TabsTrigger
              key={process.id}
              value={process.id}
              className="data-[state=active]:bg-black data-[state=active]:text-white"
            >
              {process.processName}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overall Summary Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* VOC and CTQ Section */}
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle>Voice of Customer (VOC) & Critical to Quality (CTQ)</CardTitle>
              <CardDescription>Customer requirements and quality specifications</CardDescription>
            </CardHeader>
            <CardContent>
              {assignment.vocStatements.length > 0 ? (
                <div className="space-y-6">
                  {/* VOC Summary */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <Card className="border border-blue-300 bg-blue-50">
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                          <p className="text-sm text-blue-700">Total VOC</p>
                          <p className="text-3xl font-bold text-blue-800">{totalVOC}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border border-purple-300 bg-purple-50">
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                          <p className="text-sm text-purple-700">Total CTQ</p>
                          <p className="text-3xl font-bold text-purple-800">{totalCTQ}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border border-green-300 bg-green-50">
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <Activity className="h-6 w-6 mx-auto mb-2 text-green-600" />
                          <p className="text-sm text-green-700">CTQ per VOC</p>
                          <p className="text-3xl font-bold text-green-800">
                            {totalVOC > 0 ? (totalCTQ / totalVOC).toFixed(1) : '0'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* VOC/CTQ Details Table */}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100">
                          <TableHead className="w-[40%]">VOC Statement</TableHead>
                          <TableHead>Customer Segment</TableHead>
                          <TableHead className="text-center">CTQ Count</TableHead>
                          <TableHead className="w-[30%]">CTQ Requirements</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignment.vocStatements.map((voc) => (
                          <TableRow key={voc.id}>
                            <TableCell className="font-medium">{voc.voiceStatement}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-blue-500 text-blue-700">
                                {voc.customerSegment}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className={
                                voc.ctqRequirements.length > 0 ? 'border-green-500 text-green-700' : 'border-gray-300'
                              }>
                                {voc.ctqRequirements.length}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {voc.ctqRequirements.length > 0 ? (
                                <ul className="text-sm space-y-1">
                                  {voc.ctqRequirements.map((ctq, idx) => (
                                    <li key={ctq.id} className="text-gray-700">
                                      {idx + 1}. {ctq.ctqDescription}
                                      {ctq.measurementCriteria && (
                                        <span className="text-gray-500 ml-1">
                                          ({ctq.measurementCriteria})
                                        </span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-sm text-gray-400">No CTQ defined</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No VOC statements captured yet</p>
              )}
            </CardContent>
          </Card>

          {/* Combined Pareto Analysis */}
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle>Combined Pareto Analysis - All Processes</CardTitle>
              <CardDescription>80/20 analysis across all process steps</CardDescription>
            </CardHeader>
            <CardContent>
              <ParetoChart
                data={calculatePareto(
                  allVSMSteps.map(step => ({
                    id: step.id,
                    name: step.stepName,
                    value: (step.processTime || step.durationMinutes || 0) +
                           (step.waitingTime || step.waitTimeMinutes || 0)
                  }))
                ).items.slice(0, 10).map(item => ({
                  name: item.name,
                  value: item.value,
                  cumulative: item.cumulativePercentage,
                  isVitalFew: item.isVitalFew
                }))}
                height={500}
                showExport={false}
              />
            </CardContent>
          </Card>

          {/* Process Comparison Table */}
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle>Process Performance Comparison</CardTitle>
              <CardDescription>Key metrics across all processes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead>Process Name</TableHead>
                      <TableHead className="text-center">VSM Steps</TableHead>
                      <TableHead className="text-center">Efficiency %</TableHead>
                      <TableHead className="text-center">Cycle Time</TableHead>
                      <TableHead className="text-center">High Risks</TableHead>
                      <TableHead className="text-center">SIPOC Steps</TableHead>
                      <TableHead className="text-center">Fishbone Causes</TableHead>
                      <TableHead className="text-center">Process Capability</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processMetrics.map((metric) => (
                      <TableRow key={metric.name}>
                        <TableCell className="font-medium">{metric.name}</TableCell>
                        <TableCell className="text-center">{metric.vsmMetrics.stepCount}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={
                            metric.vsmMetrics.efficiencyRatio >= 50 ? 'border-green-500 text-green-700' :
                            metric.vsmMetrics.efficiencyRatio >= 30 ? 'border-yellow-500 text-yellow-700' :
                            'border-red-500 text-red-700'
                          }>
                            {metric.vsmMetrics.efficiencyRatio.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{metric.vsmMetrics.totalCycleTime} min</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={
                            metric.fmeaStats.high > 0 ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-300'
                          }>
                            {metric.fmeaStats.high}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{metric.sipocSteps}</TableCell>
                        <TableCell className="text-center">{metric.fishboneStats.totalCauses}</TableCell>
                        <TableCell className="text-center">
                          {metric.capabilityData && metric.capabilityData.cpk !== null ? (
                            <Badge variant="outline" className={
                              metric.capabilityData.isCapable ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'
                            }>
                              Cpk: {metric.capabilityData.cpk.toFixed(3)}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* All FMEA High Risks */}
          <Card className="border-2 border-red-500">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-800">Critical Risk Items - All Processes</CardTitle>
              <CardDescription className="text-red-600">
                Failure modes requiring immediate attention (RPN ≥ 200)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {highRiskFMEA.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Process</TableHead>
                        <TableHead>Failure Mode</TableHead>
                        <TableHead>Effects</TableHead>
                        <TableHead className="text-center">SEV</TableHead>
                        <TableHead className="text-center">OCC</TableHead>
                        <TableHead className="text-center">DET</TableHead>
                        <TableHead className="text-center">RPN</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {highRiskFMEA.map(fmea => {
                        const process = assignment.processes.find(p =>
                          p.fmeaEntries.some(f => f.id === fmea.id)
                        )
                        return (
                          <TableRow key={fmea.id}>
                            <TableCell className="font-medium">{process?.processName || 'Unknown'}</TableCell>
                            <TableCell>{fmea.failureMode}</TableCell>
                            <TableCell className="max-w-[300px]">{fmea.effectsOfFailure}</TableCell>
                            <TableCell className="text-center font-bold">{fmea.severity}</TableCell>
                            <TableCell className="text-center font-bold">{fmea.occurrence}</TableCell>
                            <TableCell className="text-center font-bold">{fmea.detection}</TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-red-600 text-white">
                                {fmea.rpn}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No high-risk items identified</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Process Tabs */}
        {assignment.processes.map(process => {
          const metric = processMetrics.find(m => m.name === process.processName)!

          return (
            <TabsContent key={process.id} value={process.id} className="space-y-6">
              {/* Process Header */}
              <Card className="border-2 border-blue-500">
                <CardHeader>
                  <CardTitle className="text-2xl">{process.processName}</CardTitle>
                  <CardDescription>Detailed analysis and visualizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-6 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">VSM Steps</p>
                      <p className="text-xl font-bold">{metric.vsmMetrics.stepCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Efficiency</p>
                      <p className="text-xl font-bold">{metric.vsmMetrics.efficiencyRatio.toFixed(1)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Cycle Time</p>
                      <p className="text-xl font-bold">{metric.vsmMetrics.totalCycleTime} min</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">FMEA Risks</p>
                      <p className="text-xl font-bold">{metric.fmeaStats.total}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">SIPOC Steps</p>
                      <p className="text-xl font-bold">{metric.sipocSteps}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Root Causes</p>
                      <p className="text-xl font-bold">{metric.fishboneStats.totalCauses}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 1. SIPOC Summary */}
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle>SIPOC Analysis</CardTitle>
                  <CardDescription>Suppliers, Inputs, Process, Outputs, Customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100">
                          <TableHead className="text-center font-semibold">SUPPLIER</TableHead>
                          <TableHead className="text-center font-semibold">INPUT</TableHead>
                          <TableHead className="text-center font-semibold">PROCESS</TableHead>
                          <TableHead className="text-center font-semibold">OUTPUT</TableHead>
                          <TableHead className="text-center font-semibold">CUSTOMER</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          // Group SIPOC entries by row (using the actual schema fields: column and value)
                          const suppliers = process.sipocEntries.filter(e => e.column === 'SUPPLIER').sort((a, b) => a.order - b.order)
                          const inputs = process.sipocEntries.filter(e => e.column === 'INPUT').sort((a, b) => a.order - b.order)
                          const processes = process.sipocEntries.filter(e => e.column === 'PROCESS').sort((a, b) => a.order - b.order)
                          const outputs = process.sipocEntries.filter(e => e.column === 'OUTPUT').sort((a, b) => a.order - b.order)
                          const customers = process.sipocEntries.filter(e => e.column === 'CUSTOMER').sort((a, b) => a.order - b.order)

                          const maxRows = Math.max(
                            suppliers.length,
                            inputs.length,
                            processes.length,
                            outputs.length,
                            customers.length,
                            1 // At least one row
                          )

                          const rows = []
                          for (let i = 0; i < maxRows; i++) {
                            rows.push(
                              <TableRow key={i}>
                                <TableCell className="text-sm">
                                  {suppliers[i] ? suppliers[i].value : <span className="text-gray-400 italic">-</span>}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {inputs[i] ? inputs[i].value : <span className="text-gray-400 italic">-</span>}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {processes[i] ? processes[i].value : <span className="text-gray-400 italic">-</span>}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {outputs[i] ? outputs[i].value : <span className="text-gray-400 italic">-</span>}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {customers[i] ? customers[i].value : <span className="text-gray-400 italic">-</span>}
                                </TableCell>
                              </TableRow>
                            )
                          }

                          if (rows.length === 0) {
                            rows.push(
                              <TableRow key="empty">
                                <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                                  No SIPOC data available
                                </TableCell>
                              </TableRow>
                            )
                          }

                          return rows
                        })()}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* 2. VSM Analysis */}
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle>Value Stream Mapping (VSM)</CardTitle>
                  <CardDescription>Process flow and time analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100">
                          <TableHead className="w-[50px]">#</TableHead>
                          <TableHead>Step Name</TableHead>
                          <TableHead className="text-center">Process Time</TableHead>
                          <TableHead className="text-center">Waiting Time</TableHead>
                          <TableHead className="text-center">Cycle Time</TableHead>
                          <TableHead>Value Measure</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {process.vsmSteps.map((step, index) => {
                          const processTime = step.processTime || step.durationMinutes || 0
                          const waitingTime = step.waitingTime || step.waitTimeMinutes || 0
                          const cycleTime = processTime + waitingTime

                          return (
                            <TableRow key={step.id}>
                              <TableCell className="text-center font-bold">{index + 1}</TableCell>
                              <TableCell className="font-medium">{step.stepName}</TableCell>
                              <TableCell className="text-center">{processTime} min</TableCell>
                              <TableCell className="text-center">{waitingTime} min</TableCell>
                              <TableCell className="text-center font-bold">{cycleTime} min</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={getValueMeasureColor(step.valueMeasure)}>
                                  {step.valueMeasure.replace(/_/g, ' ')}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-500">Total Process Time</p>
                        <p className="text-lg font-bold">{metric.vsmMetrics.totalProcessTime} min</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Wait Time</p>
                        <p className="text-lg font-bold">{metric.vsmMetrics.totalWaitTime} min</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Value-Added Time</p>
                        <p className="text-lg font-bold text-green-600">{metric.vsmMetrics.valueAddedTime} min</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Non-Value-Added Time</p>
                        <p className="text-lg font-bold text-red-600">{metric.vsmMetrics.nonValueAddedTime} min</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3. Pareto Chart for this Process */}
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle>Pareto Analysis</CardTitle>
                  <CardDescription>80/20 analysis of process steps by cycle time</CardDescription>
                </CardHeader>
                <CardContent>
                  {metric.paretoData.items.length > 0 ? (
                    <ParetoChart
                      data={metric.paretoData.items.slice(0, 10).map(item => ({
                        name: item.name,
                        value: item.value,
                        cumulative: item.cumulativePercentage,
                        isVitalFew: item.isVitalFew
                      }))}
                      height={450}
                      showExport={false}
                    />
                  ) : (
                    <p className="text-center text-gray-500 py-8">No VSM data available for Pareto analysis</p>
                  )}
                </CardContent>
              </Card>

              {/* 4. Fishbone Summary */}
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle>Fishbone (Ishikawa) Analysis</CardTitle>
                  <CardDescription>Root cause analysis for vital few steps (Pareto ≤80%)</CardDescription>
                </CardHeader>
                <CardContent>
                  <FishboneAnalysisViewer
                    categories={process.fishboneCategories}
                    paretoSteps={metric.paretoData.items.filter(item => item.isVitalFew)}
                    totalCycleTime={metric.vsmMetrics.totalCycleTime}
                  />
                </CardContent>
              </Card>

              {/* 5. FMEA Summary for this Process */}
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle>FMEA Risk Analysis</CardTitle>
                  <CardDescription>Failure modes and risk assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <Card className={`border ${metric.fmeaStats.high > 0 ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">High Risk</p>
                          <p className="text-2xl font-bold">{metric.fmeaStats.high}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className={`border ${metric.fmeaStats.medium > 0 ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'}`}>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Medium Risk</p>
                          <p className="text-2xl font-bold">{metric.fmeaStats.medium}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border border-green-500 bg-green-50">
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Low Risk</p>
                          <p className="text-2xl font-bold">{metric.fmeaStats.low}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {metric.fmeaStats.topRisks.length > 0 && (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-100">
                            <TableHead>Failure Mode</TableHead>
                            <TableHead>Effects</TableHead>
                            <TableHead className="text-center">RPN</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {metric.fmeaStats.topRisks.map(fmea => (
                            <TableRow key={fmea.id}>
                              <TableCell className="font-medium">{fmea.failureMode}</TableCell>
                              <TableCell>{fmea.effectsOfFailure}</TableCell>
                              <TableCell className="text-center">
                                <Badge className={
                                  fmea.rpn >= 200 ? 'bg-red-600 text-white' :
                                  fmea.rpn >= 100 ? 'bg-yellow-600 text-white' :
                                  'bg-green-600 text-white'
                                }>
                                  {fmea.rpn}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 6. Process Capability */}
              {metric.capabilityData && (
                <Card className="border-2 border-black">
                  <CardHeader>
                    <CardTitle>Process Capability Analysis</CardTitle>
                    <CardDescription>Statistical process control metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <ProcessCapabilityChart
                          lowerSpec={process.lowerSpecLimit!}
                          upperSpec={process.upperSpecLimit!}
                          target={process.targetValue}
                          mean={process.sampleMean!}
                          stdDev={process.sampleStdDev!}
                          height={250}
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Cp (Potential)</p>
                            <p className="text-xl font-bold">{metric.capabilityData.cp?.toFixed(3) || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Cpk (Actual)</p>
                            <p className="text-xl font-bold">{metric.capabilityData.cpk?.toFixed(3) || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Sigma Level</p>
                            <p className="text-xl font-bold">{metric.capabilityData.sigmaLevel?.toFixed(3) || '-'}σ</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">PPM</p>
                            <p className="text-xl font-bold">{metric.capabilityData.ppm?.toFixed(0) || '-'}</p>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                          <p className="text-sm font-medium mb-1">Process Status</p>
                          <Badge className={
                            metric.capabilityData.isCapable ? 'bg-green-600' : 'bg-red-600'
                          }>
                            {metric.capabilityData.isCapable ? 'CAPABLE' : 'NOT CAPABLE'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )
        })}
      </Tabs>

      {/* Recommendations Section */}
      <Card className="mt-6 border-2 border-green-500">
        <CardHeader className="bg-green-50">
          <CardTitle className="text-green-800">Recommendations</CardTitle>
          <CardDescription className="text-green-600">
            Improvement actions and implementation status (sorted by difficulty: low to high)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {assignment.recommendations.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="w-[200px]">Title</TableHead>
                    <TableHead className="w-[250px]">Description</TableHead>
                    <TableHead className="w-[200px]">Expected Impact</TableHead>
                    <TableHead className="w-[150px]">Implementation Difficulty</TableHead>
                    <TableHead className="w-[120px]">Est. Savings</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...assignment.recommendations]
                    .sort((a, b) => {
                      const difficultyOrder: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 }
                      return difficultyOrder[a.implementationDifficulty] - difficultyOrder[b.implementationDifficulty]
                    })
                    .map(rec => (
                      <TableRow key={rec.id}>
                        <TableCell className="font-medium align-top">
                          <div className="whitespace-normal break-words">{rec.recommendationTitle}</div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="whitespace-normal break-words text-sm">{rec.description}</div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="whitespace-normal break-words text-sm">{rec.expectedImpact}</div>
                        </TableCell>
                        <TableCell className="align-top">
                          <Badge className={
                            rec.implementationDifficulty === 'HIGH' ? 'bg-red-600 text-white' :
                            rec.implementationDifficulty === 'MEDIUM' ? 'bg-yellow-600 text-white' :
                            'bg-green-600 text-white'
                          }>
                            {rec.implementationDifficulty}
                          </Badge>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="whitespace-normal break-words text-sm">{rec.estimatedCostSavings || '-'}</div>
                        </TableCell>
                        <TableCell className="align-top">
                          <Badge variant="outline" className={
                            rec.status === 'IMPLEMENTED' ? 'border-green-500 text-green-700' :
                            rec.status === 'APPROVED' ? 'border-yellow-500 text-yellow-700' :
                            'border-gray-500 text-gray-700'
                          }>
                            {rec.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No recommendations available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}