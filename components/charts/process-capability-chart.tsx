'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts'
import { Card } from '@/components/ui/card'

interface ProcessCapabilityChartProps {
  lowerSpec: number
  upperSpec: number
  target?: number | null
  mean: number
  stdDev: number
  height?: number
  showDistribution?: boolean
}

export function ProcessCapabilityChart({
  lowerSpec,
  upperSpec,
  target,
  mean,
  stdDev,
  height = 300,
  showDistribution = true
}: ProcessCapabilityChartProps) {
  // Generate normal distribution curve data
  const generateNormalDistribution = () => {
    const points = []
    const range = 6 * stdDev // Show ±3 sigma
    const start = mean - range / 2
    const end = mean + range / 2
    const step = range / 200 // Increased from 100 to 200 for smoother curve

    for (let x = start; x <= end; x += step) {
      const z = (x - mean) / stdDev
      const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
                Math.exp(-0.5 * z * z) * 100 // Scale for visibility
      points.push({
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(4)),
        inSpec: x >= lowerSpec && x <= upperSpec
      })
    }
    return points
  }

  const distributionData = showDistribution ? generateNormalDistribution() : []

  // Calculate sigma lines
  const sigmaLines = [
    { value: mean - 3 * stdDev, label: '-3σ', color: '#ef4444' },
    { value: mean - 2 * stdDev, label: '-2σ', color: '#f59e0b' },
    { value: mean - stdDev, label: '-1σ', color: '#3b82f6' },
    { value: mean, label: 'μ', color: '#10b981' },
    { value: mean + stdDev, label: '+1σ', color: '#3b82f6' },
    { value: mean + 2 * stdDev, label: '+2σ', color: '#f59e0b' },
    { value: mean + 3 * stdDev, label: '+3σ', color: '#ef4444' }
  ]

  interface TooltipPayload {
    value?: number
    payload?: {
      inSpec?: boolean
    }
  }

  interface CustomTooltipProps {
    active?: boolean
    payload?: TooltipPayload[]
    label?: string | number
  }

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
          <p className="text-sm font-medium">Value: {label}</p>
          <p className="text-sm text-gray-600">
            Probability: {(payload[0]?.value || 0).toFixed(4)}
          </p>
          <p className="text-sm text-gray-600">
            {payload[0]?.payload?.inSpec ? (
              <span className="text-green-600">✓ Within Spec</span>
            ) : (
              <span className="text-red-600">✗ Out of Spec</span>
            )}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={distributionData}
          margin={{ top: 40, right: 40, left: 50, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="x"
            domain={['dataMin', 'dataMax']}
            type="number"
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => value.toFixed(1)}
          />

          <YAxis
            tick={{ fontSize: 11 }}
            label={{
              value: 'Probability Density',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 11 }
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Specification limits */}
          <ReferenceLine
            x={lowerSpec}
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{
              value: `LSL: ${lowerSpec}`,
              position: 'topLeft',
              offset: 10,
              style: { fill: '#ef4444', fontSize: 11 }
            }}
          />

          <ReferenceLine
            x={upperSpec}
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{
              value: `USL: ${upperSpec}`,
              position: 'topRight',
              offset: 10,
              style: { fill: '#ef4444', fontSize: 11 }
            }}
          />

          {/* Target value if provided */}
          {target && (
            <ReferenceLine
              x={target}
              stroke="#10b981"
              strokeWidth={2}
              label={{
                value: `Target: ${target}`,
                position: 'top',
                offset: 10,
                style: { fill: '#10b981', fontSize: 11 }
              }}
            />
          )}

          {/* Mean line */}
          <ReferenceLine
            x={mean}
            stroke="#3b82f6"
            strokeWidth={2}
            label={{
              value: `Mean: ${mean.toFixed(2)}`,
              position: 'insideTopRight',
              offset: 25,
              style: { fill: '#3b82f6', fontSize: 11 }
            }}
          />

          {/* Sigma reference lines */}
          {sigmaLines.map((line, index) => {
            // Only show lines within reasonable range
            if (line.value >= lowerSpec - 2 * stdDev && line.value <= upperSpec + 2 * stdDev) {
              return (
                <ReferenceLine
                  key={index}
                  x={line.value}
                  stroke={line.color}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  opacity={0.5}
                />
              )
            }
            return null
          })}

          {/* Distribution curve */}
          <Area
            type="monotone"
            dataKey="y"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="#3b82f6"
            fillOpacity={0.2}
            dot={false}
          />

          {/* Highlight in-spec region */}
          {distributionData.length > 0 && (
            <Area
              type="monotone"
              dataKey={(item: { inSpec?: boolean; y: number }) => item.inSpec ? item.y : null}
              stroke="#10b981"
              strokeWidth={0}
              fill="#10b981"
              fillOpacity={0.3}
              dot={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <span>Normal Distribution</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded opacity-30" />
          <span>Within Spec</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-8 h-0 border-t-2 border-red-500 border-dashed" />
          <span>Spec Limits</span>
        </div>
        {target && (
          <div className="flex items-center gap-1">
            <div className="w-8 h-0 border-t-2 border-green-500" />
            <span>Target</span>
          </div>
        )}
      </div>
    </div>
  )
}