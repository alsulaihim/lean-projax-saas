import * as React from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Info, Calculator, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalculationTooltipProps {
  formula: string
  values?: Record<string, number | string | null>
  result?: number | string | null
  children?: React.ReactNode
  icon?: 'info' | 'calculator' | 'help'
  className?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function CalculationTooltip({
  formula,
  values,
  result,
  children,
  icon = 'info',
  className,
  side = 'top'
}: CalculationTooltipProps) {
  const Icon = {
    info: Info,
    calculator: Calculator,
    help: HelpCircle
  }[icon]

  // Format the formula with actual values substituted
  const getFormattedFormula = () => {
    if (!values) return formula

    let formattedFormula = formula
    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        const formattedValue = typeof value === 'number'
          ? value.toLocaleString(undefined, { maximumFractionDigits: 3 })
          : String(value)
        formattedFormula = formattedFormula.replace(
          new RegExp(key, 'g'),
          formattedValue
        )
      }
    })
    return formattedFormula
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className={cn(
            "inline-flex items-center gap-1 cursor-help",
            className
          )}>
            {children}
            <Icon className="h-3 w-3 text-gray-400 hover:text-gray-600" />
          </span>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="max-w-sm p-3 bg-white border-2 border-black shadow-lg"
        >
          <div className="space-y-2 text-sm">
            {/* Formula header */}
            <div className="font-semibold text-gray-900 flex items-center gap-1">
              <Calculator className="h-4 w-4" />
              Calculation Formula
            </div>

            {/* Original formula */}
            <div className="bg-gray-50 px-2 py-1 rounded font-mono text-xs">
              {formula}
            </div>

            {/* Substituted values */}
            {values && Object.keys(values).length > 0 && (
              <>
                <div className="text-xs text-gray-600 font-medium">With values:</div>
                <div className="bg-blue-50 px-2 py-1 rounded font-mono text-xs text-blue-900">
                  {getFormattedFormula()}
                </div>
              </>
            )}

            {/* Result */}
            {result !== null && result !== undefined && (
              <div className="pt-1 border-t border-gray-200">
                <span className="text-xs text-gray-600">Result: </span>
                <span className="font-semibold text-gray-900">
                  {typeof result === 'number'
                    ? result.toLocaleString(undefined, { maximumFractionDigits: 3 })
                    : result}
                </span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Specialized tooltips for common calculations
export function RPNTooltip({
  severity,
  occurrence,
  detection,
  rpn,
  className
}: {
  severity: number
  occurrence: number
  detection: number
  rpn: number
  className?: string
}) {
  return (
    <CalculationTooltip
      formula="RPN = S × O × D"
      values={{
        S: severity,
        O: occurrence,
        D: detection
      }}
      result={rpn}
      icon="calculator"
      className={className}
    >
      <span className="font-bold">{rpn}</span>
    </CalculationTooltip>
  )
}

export function CpTooltip({
  lsl,
  usl,
  stdDev,
  cp,
  className
}: {
  lsl: number | null
  usl: number | null
  stdDev: number | null
  cp: number | null
  className?: string
}) {
  if (cp === null) {
    return <span className={className}>-</span>
  }

  return (
    <CalculationTooltip
      formula="Cp = (USL - LSL) / (6 × σ)"
      values={{
        USL: usl,
        LSL: lsl,
        σ: stdDev
      }}
      result={cp}
      icon="calculator"
      className={className}
    >
      <span className="font-bold">{cp.toFixed(3)}</span>
    </CalculationTooltip>
  )
}

export function CpkTooltip({
  lsl,
  usl,
  mean,
  stdDev,
  cpk,
  className
}: {
  lsl: number | null
  usl: number | null
  mean: number | null
  stdDev: number | null
  cpk: number | null
  className?: string
}) {
  if (cpk === null) {
    return <span className={className}>-</span>
  }

  return (
    <CalculationTooltip
      formula="Cpk = min[(x̄ - LSL)/(3×σ), (USL - x̄)/(3×σ)]"
      values={{
        'x̄': mean,
        USL: usl,
        LSL: lsl,
        σ: stdDev
      }}
      result={cpk}
      icon="calculator"
      className={className}
    >
      <span className="font-bold">{cpk.toFixed(3)}</span>
    </CalculationTooltip>
  )
}

export function EfficiencyRatioTooltip({
  valueAddedTime,
  totalCycleTime,
  ratio,
  className
}: {
  valueAddedTime: number
  totalCycleTime: number
  ratio: number
  className?: string
}) {
  return (
    <CalculationTooltip
      formula="Efficiency = (Value-Added Time / Total Cycle Time) × 100"
      values={{
        'Value-Added Time': valueAddedTime,
        'Total Cycle Time': totalCycleTime
      }}
      result={`${ratio.toFixed(1)}%`}
      icon="calculator"
      className={className}
    >
      <span className="font-bold">{ratio.toFixed(1)}%</span>
    </CalculationTooltip>
  )
}

export function CumulativePercentageTooltip({
  currentValue,
  totalValue,
  percentage,
  cumulative,
  className
}: {
  currentValue: number
  totalValue: number
  percentage: number
  cumulative: number
  className?: string
}) {
  return (
    <CalculationTooltip
      formula="Cumulative % = Σ(item values up to current) / Total × 100"
      values={{
        'Current Item': currentValue,
        'Total': totalValue,
        'Item %': percentage
      }}
      result={`${cumulative.toFixed(1)}%`}
      icon="info"
      className={className}
    >
      <span className="font-bold text-blue-600">{cumulative.toFixed(1)}%</span>
    </CalculationTooltip>
  )
}