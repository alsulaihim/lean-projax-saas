'use client'

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ParetoChartProps {
  data: Array<{
    name: string
    value: number
    cumulative: number
    isVitalFew?: boolean
  }>
  title?: string
  height?: number
  showExport?: boolean
  className?: string
}

export function ParetoChart({
  data,
  title = 'Pareto Analysis',
  height = 400,
  showExport = true,
  className = '',
}: ParetoChartProps) {
  // Custom tooltip
  interface TooltipPayload {
    value?: number
    payload?: {
      isVitalFew?: boolean
    }
  }

  interface CustomTooltipProps {
    active?: boolean
    payload?: TooltipPayload[]
    label?: string
  }

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const value = payload[0]?.value
      const cumulative = payload[1]?.value
      const isVitalFew = payload[0]?.payload?.isVitalFew

      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-medium text-sm">{label}</p>
          <p className="text-sm text-gray-600">
            Value: <span className="font-medium">{value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Cumulative: <span className="font-medium">{cumulative?.toFixed(1)}%</span>
          </p>
          {isVitalFew && (
            <p className="text-xs text-green-600 mt-1">✓ Vital Few (80% contributor)</p>
          )}
        </div>
      )
    }
    return null
  }

  // Export chart as image (simplified version)
  const handleExport = () => {
    // In a real implementation, we'd use html2canvas or similar
    // For now, we'll just trigger a print dialog
    window.print()
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">No data available for Pareto analysis</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {showExport && (
          <Button variant="outline" size="sm" onClick={handleExport} className="print:hidden">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        )}
      </CardHeader>
      <CardContent className="px-0 md:px-6">
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fontSize: 12 }}
            />

            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#374151"
              tick={{ fontSize: 12 }}
              label={{
                value: 'Value',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 12 },
              }}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#6b7280"
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              label={{
                value: 'Cumulative %',
                angle: 90,
                position: 'insideRight',
                style: { fontSize: 12 },
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="rect" />

            {/* 80% reference line */}
            <ReferenceLine
              y={80}
              yAxisId="right"
              stroke="#ef4444"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: '80% Threshold',
                position: 'right',
                style: { fill: '#ef4444', fontSize: 12 },
              }}
            />

            {/* Bars for values - colored by vital few status */}
            <Bar dataKey="value" yAxisId="left" name="Value" radius={[4, 4, 0, 0]} fill="#dc2626">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isVitalFew ? '#dc2626' : '#3b82f6'} />
              ))}
            </Bar>

            {/* Line for cumulative percentage */}
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#f97316"
              strokeWidth={3}
              yAxisId="right"
              name="Cumulative %"
              dot={{ fill: '#f97316', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span>Vital Few (80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Trivial Many (20%)</span>
          </div>
        </div>

        {/* Insights section */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Key Insights:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              •{' '}
              <span className="text-red-600 font-medium">
                {data.filter(d => d.isVitalFew).length}
              </span>{' '}
              out of {data.length} items (
              {Math.round((data.filter(d => d.isVitalFew).length / data.length) * 100)}%) contribute
              to 80% of the impact
            </li>
            <li>
              • Top contributor: "{data[0]?.name}" with {data[0]?.value} units
            </li>
            <li>
              • Focus improvements on the{' '}
              <span className="text-red-600 font-medium">vital few</span> items for maximum impact
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
