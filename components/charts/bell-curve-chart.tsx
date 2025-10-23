'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BellCurveChartProps {
  mean: number
  standardDeviation: number
  lsl?: number // Lower Specification Limit
  usl?: number // Upper Specification Limit
  target?: number
  title?: string
  height?: number
  className?: string
  showStatistics?: boolean
  data?: number[] // Optional actual data points for overlay
}

// Normal distribution probability density function
function normalPDF(x: number, mean: number, std: number): number {
  const variance = std * std
  const numerator = Math.exp(-Math.pow(x - mean, 2) / (2 * variance))
  const denominator = Math.sqrt(2 * Math.PI * variance)
  return numerator / denominator
}

// Calculate cumulative distribution function
function normalCDF(x: number, mean: number, std: number): number {
  const z = (x - mean) / (std * Math.sqrt(2))
  return 0.5 * (1 + erf(z))
}

// Error function approximation
function erf(x: number): number {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = x < 0 ? -1 : 1
  x = Math.abs(x)

  const t = 1.0 / (1.0 + p * x)
  const t2 = t * t
  const t3 = t2 * t
  const t4 = t3 * t
  const t5 = t4 * t

  const y = 1.0 - (a5 * t5 + a4 * t4 + a3 * t3 + a2 * t2 + a1 * t) * Math.exp(-x * x)

  return sign * y
}

// Convert DPMO to Sigma Level using standard Six Sigma table
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function dpmoToSigmaLevel(dpmo: number): number {
  // Standard Six Sigma conversion table (with 1.5 sigma shift already included)
  const sigmaTable = [
    { dpmo: 933200, sigma: 0.0 },
    { dpmo: 691500, sigma: 1.0 },
    { dpmo: 308537, sigma: 2.0 },
    { dpmo: 66807, sigma: 3.0 },
    { dpmo: 6210, sigma: 4.0 },
    { dpmo: 233, sigma: 5.0 },
    { dpmo: 3.4, sigma: 6.0 },
  ]

  // If DPMO is greater than the worst case, return 0
  if (dpmo >= 933200) return 0

  // If DPMO is less than best case, return 6
  if (dpmo <= 3.4) return 6

  // Find the appropriate range and interpolate
  for (let i = 0; i < sigmaTable.length - 1; i++) {
    if (dpmo <= sigmaTable[i].dpmo && dpmo > sigmaTable[i + 1].dpmo) {
      // Linear interpolation between two points
      const x1 = Math.log(sigmaTable[i].dpmo)
      const x2 = Math.log(sigmaTable[i + 1].dpmo)
      const y1 = sigmaTable[i].sigma
      const y2 = sigmaTable[i + 1].sigma
      const x = Math.log(dpmo)

      return y1 + ((y2 - y1) * (x - x1)) / (x2 - x1)
    }
  }

  return 3.0 // Default to 3 sigma if no match found
}

export function BellCurveChart({
  mean,
  standardDeviation,
  lsl,
  usl,
  target,
  title = 'Process Distribution',
  height = 400,
  className,
  showStatistics = true,
  data,
}: BellCurveChartProps) {
  const chartData = useMemo(() => {
    const points = []
    const range = 4 * standardDeviation // Show ±4 sigma
    const min = mean - range
    const max = mean + range
    const step = (max - min) / 200 // 200 points for smooth curve

    for (let x = min; x <= max; x += step) {
      points.push({
        x: parseFloat(x.toFixed(3)),
        y: normalPDF(x, mean, standardDeviation),
        inSpec: lsl && usl ? x >= lsl && x <= usl : true,
      })
    }

    return points
  }, [mean, standardDeviation, lsl, usl])

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!lsl || !usl) return null

    const withinSpecProb =
      normalCDF(usl, mean, standardDeviation) - normalCDF(lsl, mean, standardDeviation)
    const defectRate = 1 - withinSpecProb
    const dpmo = defectRate * 1000000

    // Calculate Cp and Cpk
    const cp = (usl - lsl) / (6 * standardDeviation)
    const cpu = (usl - mean) / (3 * standardDeviation)
    const cpl = (mean - lsl) / (3 * standardDeviation)
    const cpk = Math.min(cpu, cpl)

    // Calculate sigma level directly from Cpk
    // Sigma Level = Cpk * 3
    // This represents the actual process capability
    const sigmaLevel = cpk * 3

    // Validate Cpk calculation consistency
    // According to Six Sigma theory:
    // Cpk ≈ Sigma Level / 3 (without shift)
    // Or more accurately: Cpk ≈ (Sigma Level - 1.5) / 3 (with 1.5 sigma shift)
    // For example:
    // - 6 sigma process (3.4 DPMO) → Cpk ≈ 2.0
    // - 3 sigma process (66,807 DPMO) → Cpk ≈ 1.0
    // - 2 sigma process (308,537 DPMO) → Cpk ≈ 0.67

    return {
      withinSpec: withinSpecProb * 100,
      defectRate: defectRate * 100,
      dpmo: dpmo,
      sigmaLevel: sigmaLevel,
      cp: cp,
      cpk: cpk,
      // Keep formatted versions for display
      withinSpecFormatted: (withinSpecProb * 100).toFixed(3),
      defectRateFormatted: (defectRate * 100).toFixed(3),
      dpmoFormatted: Math.round(dpmo),
      sigmaLevelFormatted: sigmaLevel.toFixed(3),
      cpFormatted: cp.toFixed(3),
      cpkFormatted: cpk.toFixed(3),
    }
  }, [mean, standardDeviation, lsl, usl])

  interface TooltipPayload {
    payload: {
      x: number
      y: number
    }
  }

  interface CustomTooltipProps {
    active?: boolean
    payload?: TooltipPayload[]
  }

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload[0]) {
      const value = payload[0].payload.x
      const probability = payload[0].payload.y
      const zScore = (value - mean) / standardDeviation

      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="text-sm font-medium">Value: {value.toFixed(3)}</p>
          <p className="text-sm">Probability: {(probability * 100).toFixed(4)}%</p>
          <p className="text-sm">Z-Score: {zScore.toFixed(2)}σ</p>
          {lsl && usl && (
            <p className="text-sm font-medium mt-1">
              {value < lsl ? (
                <span className="text-red-600">Below LSL</span>
              ) : value > usl ? (
                <span className="text-red-600">Above USL</span>
              ) : (
                <span className="text-green-600">Within Spec</span>
              )}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {statistics && (
            <Badge variant={statistics.cpk >= 1.33 ? 'default' : 'destructive'}>
              Cpk: {statistics.cpkFormatted}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData} margin={{ top: 40, right: 40, left: 50, bottom: 60 }}>
            <defs>
              <linearGradient id="colorWithinSpec" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="colorOutOfSpec" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="x"
              domain={['dataMin', 'dataMax']}
              type="number"
              tickFormatter={value => value.toFixed(1)}
              label={{ value: 'Measurement Value', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              label={{ value: 'Probability Density', angle: -90, position: 'insideLeft' }}
              tickFormatter={value => (value * 100).toFixed(1) + '%'}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Distribution curve */}
            <Area
              type="monotone"
              dataKey="y"
              stroke="#3b82f6"
              fill="url(#colorWithinSpec)"
              strokeWidth={2}
            />

            {/* Reference lines */}
            {lsl && (
              <ReferenceLine
                x={lsl}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ value: `LSL: ${lsl}`, position: 'top', offset: 10 }}
              />
            )}
            {usl && (
              <ReferenceLine
                x={usl}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ value: `USL: ${usl}`, position: 'top', offset: 10 }}
              />
            )}
            {target && (
              <ReferenceLine
                x={target}
                stroke="#10b981"
                strokeWidth={2}
                label={{ value: `Target: ${target}`, position: 'top', offset: 10 }}
              />
            )}
            <ReferenceLine
              x={mean}
              stroke="#6366f1"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{ value: `Mean: ${mean.toFixed(2)}`, position: 'insideTopRight', offset: 20 }}
            />

            {/* Sigma lines */}
            {[-3, -2, -1, 1, 2, 3].map(sigma => (
              <ReferenceLine
                key={sigma}
                x={mean + sigma * standardDeviation}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="2 2"
                opacity={0.5}
                label={{ value: `${sigma}σ`, position: 'bottom', fontSize: 10 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>

        {/* Statistics Panel */}
        {showStatistics && statistics && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Within Spec</p>
              <p className="text-lg font-semibold text-green-600">
                {statistics.withinSpecFormatted}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Defect Rate</p>
              <p className="text-lg font-semibold text-red-600">
                {statistics.defectRateFormatted}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">DPMO</p>
              <p className="text-lg font-semibold">{statistics.dpmoFormatted}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sigma Level</p>
              <p className="text-lg font-semibold">{statistics.sigmaLevelFormatted}σ</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Process Capability (Cp)</p>
              <p className="text-lg font-semibold">{statistics.cpFormatted}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Process Capability Index (Cpk)</p>
              <p className="text-lg font-semibold">{statistics.cpkFormatted}</p>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 opacity-50 rounded" />
            <span>Within Specification</span>
          </div>
          {lsl && usl && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 opacity-50 rounded" />
              <span>Out of Specification</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">σ = Standard Deviation</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
