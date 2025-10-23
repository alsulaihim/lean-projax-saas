'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TrendingUp, AlertCircle, Clock, Activity } from 'lucide-react'
import { ParetoChart } from '@/components/charts/pareto-chart'
import { calculatePareto, getParetoInsights } from '@/lib/calculations/pareto'
import { formatDuration } from '@/lib/calculations/vsm-metrics'
import type { Prisma } from '@prisma/client'

type ProcessWithVSM = Prisma.ProcessGetPayload<{
  include: { vsmSteps: true }
}>

interface ParetoSectionProps {
  assignmentId: string
  processes: ProcessWithVSM[]
}

export function ParetoSection({ assignmentId: _assignmentId, processes }: ParetoSectionProps) {
  const [selectedProcessId, setSelectedProcessId] = useState<string>('all')

  // Filter processes based on selection
  const filteredProcesses = useMemo(() => {
    if (selectedProcessId === 'all') {
      return processes
    }
    return processes.filter(p => p.id === selectedProcessId)
  }, [processes, selectedProcessId])

  // Aggregate VSM steps from selected processes
  const paretoAnalysis = useMemo(() => {
    const allSteps = filteredProcesses.flatMap(process =>
      process.vsmSteps.map(step => {
        // Support both new and legacy field names
        const processTime = step.processTime ?? step.durationMinutes ?? 0
        const waitingTime = step.waitingTime ?? step.waitTimeMinutes ?? 0
        const isValueAdded =
          step.valueMeasure === 'VALUE_ADDED' ||
          step.valueMeasure === 'ESSENTIAL_NON_VALUE' ||
          step.valueAdded === true

        return {
          id: step.id,
          name:
            selectedProcessId === 'all'
              ? `${process.processName}: ${step.stepName}`
              : step.stepName,
          value: processTime + waitingTime,
          category: isValueAdded ? 'Value-Added' : 'Non-Value-Added',
          processName: process.processName,
          stepName: step.stepName,
          durationMinutes: processTime,
          waitTimeMinutes: waitingTime,
          valueAdded: isValueAdded,
        }
      })
    )

    return calculatePareto(allSteps)
  }, [filteredProcesses, selectedProcessId])

  const chartData = useMemo(() => {
    return paretoAnalysis.items.map(item => ({
      name: item.name.split(': ')[1] || item.name, // Show just the step name in chart
      value: item.value,
      cumulative: item.cumulativePercentage,
      isVitalFew: item.isVitalFew,
    }))
  }, [paretoAnalysis])

  const insights = useMemo(() => getParetoInsights(paretoAnalysis), [paretoAnalysis])

  // Calculate summary statistics
  const { vitalFewCount, totalValue, items } = paretoAnalysis
  const trivialManyCount = items.length - vitalFewCount

  // Check if we have any VSM data
  const hasData = processes.some(p => p.vsmSteps.length > 0)

  if (!hasData) {
    return (
      <Card className="border-2 border-black">
        <CardHeader>
          <CardTitle className="text-2xl">Pareto Analysis</CardTitle>
          <CardDescription>80/20 analysis of process steps by cycle time</CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">Please add VSM steps to generate Pareto analysis</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-black">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl md:text-2xl">
                Pareto Analysis - Process Step Optimization
              </CardTitle>
              <CardDescription className="text-sm">
                Identify the vital few process steps that contribute to 80% of the cycle time
              </CardDescription>
            </div>
            {processes.length > 0 && (
              <Select value={selectedProcessId} onValueChange={setSelectedProcessId}>
                <SelectTrigger className="w-full md:w-[250px]">
                  <SelectValue placeholder="Select a process" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Processes</SelectItem>
                  {processes.map(process => (
                    <SelectItem key={process.id} value={process.id}>
                      {process.processName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Card className="border border-gray-300">
              <CardContent className="pt-4 md:pt-6">
                <div className="text-center">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-2 text-gray-600" />
                  <p className="text-xs md:text-sm text-gray-500 mb-1">Total Cycle Time</p>
                  <p className="text-lg md:text-2xl font-bold">{formatDuration(totalValue)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-300">
              <CardContent className="pt-4 md:pt-6">
                <div className="text-center">
                  <Activity className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-2 text-gray-600" />
                  <p className="text-xs md:text-sm text-gray-500 mb-1">Total Steps</p>
                  <p className="text-lg md:text-2xl font-bold">{items.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-red-300 bg-red-50">
              <CardContent className="pt-4 md:pt-6">
                <div className="text-center">
                  <p className="text-xs md:text-sm text-red-700 mb-1 font-medium">
                    Vital Few (80%)
                  </p>
                  <p className="text-lg md:text-2xl font-bold text-red-800">{vitalFewCount}</p>
                  <p className="text-xs text-red-600 mt-1">
                    {items.length > 0 ? ((vitalFewCount / items.length) * 100).toFixed(1) : 0}% of
                    steps
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-blue-300 bg-blue-50">
              <CardContent className="pt-4 md:pt-6">
                <div className="text-center">
                  <p className="text-xs md:text-sm text-blue-700 mb-1 font-medium">
                    Trivial Many (20%)
                  </p>
                  <p className="text-lg md:text-2xl font-bold text-blue-800">{trivialManyCount}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {items.length > 0 ? ((trivialManyCount / items.length) * 100).toFixed(1) : 0}%
                    of steps
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Box */}
          <Card className="border border-blue-300 bg-blue-50">
            <CardContent className="pt-4 md:pt-6">
              <div className="flex gap-2 md:gap-3">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs md:text-sm text-blue-800">
                  <p className="font-medium mb-1">Process Optimization with Pareto Analysis:</p>
                  <p>
                    This analysis shows which process steps consume the most time. Focus improvement
                    efforts on the "vital few" steps to achieve maximum cycle time reduction with
                    minimal resources. Steps are ranked by total time (duration + wait time).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Pareto Chart */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-[320px]">
              <ParetoChart
                data={chartData}
                title="Process Step Cycle Time Distribution"
                height={400}
                className="border-2 border-gray-300"
              />
            </div>
          </div>

          {/* Detailed Table */}
          <div className="border-2 border-black rounded-lg overflow-x-auto">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="w-[60px]">Rank</TableHead>
                    {selectedProcessId === 'all' && <TableHead>Process</TableHead>}
                    <TableHead>Step Name</TableHead>
                    <TableHead className="text-center">Duration</TableHead>
                    <TableHead className="text-center">Wait Time</TableHead>
                    <TableHead className="text-center">Total Time</TableHead>
                    <TableHead className="text-center">% of Total</TableHead>
                    <TableHead className="text-center">Cumulative %</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paretoAnalysis.items.map(item => {
                    // Extract process and step names from the formatted name string
                    const nameParts = item.name.split(': ')
                    const processName = nameParts.length > 1 ? nameParts[0] : ''
                    const stepName = nameParts.length > 1 ? nameParts[1] : item.name

                    // Type assertion: these properties are added in the useMemo above
                    // but not included in ParetoItemWithAnalysis type definition
                    const itemData = item as any

                    return (
                      <TableRow key={item.id} className={item.isVitalFew ? 'bg-red-50' : ''}>
                        <TableCell className="font-bold text-center">{item.rank}</TableCell>
                        {selectedProcessId === 'all' && (
                          <TableCell className="text-sm">{processName}</TableCell>
                        )}
                        <TableCell className="font-medium">{stepName}</TableCell>
                        <TableCell className="text-center">
                          {formatDuration(itemData.durationMinutes || 0)}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatDuration(itemData.waitTimeMinutes || 0)}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {formatDuration(item.value)}
                        </TableCell>
                        <TableCell className="text-center">{item.percentage.toFixed(1)}%</TableCell>
                        <TableCell className="text-center font-bold text-blue-600">
                          {item.cumulativePercentage.toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          {itemData.valueAdded ? (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 border border-green-300 rounded">
                              Value-Added
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 border border-gray-300 rounded">
                              Non-Value
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.isVitalFew ? (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 border border-red-300 rounded">
                              Vital Few
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 border border-blue-300 rounded">
                              Trivial Many
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Insights & Recommendations */}
          <Card className="border border-green-300 bg-green-50">
            <CardContent className="pt-4 md:pt-6">
              <div className="flex gap-2 md:gap-3">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs md:text-sm text-green-900">
                  <p className="font-medium mb-2">Analysis Insights:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    {insights.map((insight, index) => (
                      <li key={index}>{insight}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card className="border border-yellow-300 bg-yellow-50">
            <CardContent className="pt-4 md:pt-6">
              <div className="flex gap-2 md:gap-3">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs md:text-sm text-yellow-900">
                  <p className="font-medium mb-2">Recommended Actions:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>
                      <strong>
                        Focus on the top {vitalFewCount} step{vitalFewCount !== 1 ? 's' : ''}
                      </strong>{' '}
                      - these represent the "vital few" that contribute to 80% of your total cycle
                      time
                    </li>
                    <li>Prioritize automation or process redesign for high-duration steps</li>
                    <li>Investigate and reduce wait times in the vital few steps</li>
                    <li>Consider parallel processing for sequential steps where possible</li>
                    <li>Eliminate or combine non-value-added steps in the vital few category</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
