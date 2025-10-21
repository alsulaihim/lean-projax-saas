/**
 * Value Stream Mapping (VSM) Metrics Calculation Module
 * Calculates cycle time, value-added time, and efficiency metrics
 */

export interface VSMStep {
  id: string
  stepName: string
  durationMinutes: number
  waitTimeMinutes: number | null
  valueAdded: boolean
}

export interface VSMMetrics {
  totalCycleTime: number // Total time from start to finish
  totalProcessTime: number // Sum of all step durations
  totalWaitTime: number // Sum of all wait times
  valueAddedTime: number // Sum of value-added step durations
  nonValueAddedTime: number // Sum of non-value-added times
  efficiencyRatio: number // (Value-added time / Total cycle time) * 100
  processEfficiency: number // (Value-added time / Total process time) * 100
  stepCount: number
  valueAddedSteps: number
  nonValueAddedSteps: number
}

export interface VSMStepAnalysis extends VSMStep {
  cumulativeTime: number
  percentageOfTotal: number
  waitTimeRatio: number // Wait time as percentage of step total time
}

/**
 * Calculate comprehensive VSM metrics from process steps
 */
export function calculateVSMMetrics(steps: VSMStep[]): VSMMetrics {
  if (!steps || steps.length === 0) {
    return {
      totalCycleTime: 0,
      totalProcessTime: 0,
      totalWaitTime: 0,
      valueAddedTime: 0,
      nonValueAddedTime: 0,
      efficiencyRatio: 0,
      processEfficiency: 0,
      stepCount: 0,
      valueAddedSteps: 0,
      nonValueAddedSteps: 0
    }
  }

  let totalProcessTime = 0
  let totalWaitTime = 0
  let valueAddedTime = 0
  let valueAddedSteps = 0

  steps.forEach(step => {
    const stepDuration = Math.abs(step.durationMinutes)
    const stepWaitTime = step.waitTimeMinutes ? Math.abs(step.waitTimeMinutes) : 0

    totalProcessTime += stepDuration
    totalWaitTime += stepWaitTime

    if (step.valueAdded) {
      valueAddedTime += stepDuration
      valueAddedSteps++
    }
  })

  const totalCycleTime = totalProcessTime + totalWaitTime
  const nonValueAddedTime = totalCycleTime - valueAddedTime
  const nonValueAddedSteps = steps.length - valueAddedSteps

  // Calculate efficiency ratios (avoid division by zero)
  const efficiencyRatio = totalCycleTime > 0
    ? Math.round((valueAddedTime / totalCycleTime) * 10000) / 100
    : 0

  const processEfficiency = totalProcessTime > 0
    ? Math.round((valueAddedTime / totalProcessTime) * 10000) / 100
    : 0

  return {
    totalCycleTime,
    totalProcessTime,
    totalWaitTime,
    valueAddedTime,
    nonValueAddedTime,
    efficiencyRatio,
    processEfficiency,
    stepCount: steps.length,
    valueAddedSteps,
    nonValueAddedSteps
  }
}

/**
 * Analyze individual steps with cumulative metrics
 */
export function analyzeVSMSteps(steps: VSMStep[]): VSMStepAnalysis[] {
  const metrics = calculateVSMMetrics(steps)

  if (metrics.totalCycleTime === 0) {
    return steps.map(step => ({
      ...step,
      cumulativeTime: 0,
      percentageOfTotal: 0,
      waitTimeRatio: 0
    }))
  }

  let cumulativeTime = 0
  return steps.map(step => {
    const stepDuration = Math.abs(step.durationMinutes)
    const stepWaitTime = step.waitTimeMinutes ? Math.abs(step.waitTimeMinutes) : 0
    const stepTotalTime = stepDuration + stepWaitTime

    cumulativeTime += stepTotalTime

    const percentageOfTotal = (stepTotalTime / metrics.totalCycleTime) * 100
    const waitTimeRatio = stepTotalTime > 0
      ? (stepWaitTime / stepTotalTime) * 100
      : 0

    return {
      ...step,
      cumulativeTime,
      percentageOfTotal: Math.round(percentageOfTotal * 100) / 100,
      waitTimeRatio: Math.round(waitTimeRatio * 100) / 100
    }
  })
}

/**
 * Format time duration for display
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours < 24) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24

  if (remainingHours === 0) {
    return `${days}d`
  }

  return `${days}d ${remainingHours}h`
}

/**
 * Get efficiency rating based on ratio
 */
export function getEfficiencyRating(ratio: number): {
  label: string
  color: string
  recommendation: string
} {
  if (ratio >= 50) {
    return {
      label: 'Excellent',
      color: 'text-green-600 bg-green-100',
      recommendation: 'Process is highly efficient - maintain current performance'
    }
  }
  if (ratio >= 30) {
    return {
      label: 'Good',
      color: 'text-blue-600 bg-blue-100',
      recommendation: 'Good efficiency - look for minor improvements'
    }
  }
  if (ratio >= 15) {
    return {
      label: 'Fair',
      color: 'text-yellow-600 bg-yellow-100',
      recommendation: 'Significant improvement opportunity exists'
    }
  }
  if (ratio >= 5) {
    return {
      label: 'Poor',
      color: 'text-orange-600 bg-orange-100',
      recommendation: 'Major process redesign recommended'
    }
  }
  return {
    label: 'Critical',
    color: 'text-red-600 bg-red-100',
    recommendation: 'Urgent process transformation required'
  }
}

/**
 * Identify bottlenecks in the process
 */
export function identifyBottlenecks(steps: VSMStepAnalysis[]): string[] {
  const insights: string[] = []

  if (steps.length === 0) return insights

  // Find steps with highest duration
  const sortedByDuration = [...steps].sort((a, b) =>
    b.durationMinutes - a.durationMinutes
  )

  const longestStep = sortedByDuration[0]
  if (longestStep.percentageOfTotal > 30) {
    insights.push(
      `Bottleneck: "${longestStep.stepName}" accounts for ${longestStep.percentageOfTotal}% of total cycle time`
    )
  }

  // Find steps with highest wait time
  const stepsWithWait = steps.filter(s => s.waitTimeMinutes && s.waitTimeMinutes > 0)
  if (stepsWithWait.length > 0) {
    const sortedByWait = [...stepsWithWait].sort((a, b) =>
      (b.waitTimeMinutes || 0) - (a.waitTimeMinutes || 0)
    )
    const highestWait = sortedByWait[0]

    if (highestWait.waitTimeRatio > 50) {
      insights.push(
        `Major delay: "${highestWait.stepName}" has ${highestWait.waitTimeRatio}% wait time`
      )
    }
  }

  // Identify non-value-added steps
  const nonValueSteps = steps.filter(s => !s.valueAdded)
  if (nonValueSteps.length > 0) {
    const totalNonValueTime = nonValueSteps.reduce(
      (sum, step) => sum + step.durationMinutes + (step.waitTimeMinutes || 0),
      0
    )
    const metrics = calculateVSMMetrics(steps)
    const nonValuePercentage = (totalNonValueTime / metrics.totalCycleTime) * 100

    if (nonValuePercentage > 50) {
      insights.push(
        `${nonValueSteps.length} non-value-added steps consume ${Math.round(nonValuePercentage)}% of cycle time`
      )
    }
  }

  return insights
}

/**
 * Get VSM improvement recommendations
 */
export function getVSMRecommendations(metrics: VSMMetrics): string[] {
  const recommendations: string[] = []

  // Efficiency-based recommendations
  if (metrics.efficiencyRatio < 10) {
    recommendations.push('Critical: Less than 10% value-added time - major process redesign needed')
  } else if (metrics.efficiencyRatio < 30) {
    recommendations.push('Eliminate or reduce non-value-added activities')
  }

  // Wait time recommendations
  if (metrics.totalWaitTime > metrics.totalProcessTime) {
    recommendations.push('Excessive wait time detected - investigate queuing and handoffs')
  }

  // Process balance
  if (metrics.nonValueAddedSteps > metrics.valueAddedSteps) {
    recommendations.push('More non-value steps than value steps - consolidate or eliminate steps')
  }

  // Cycle time recommendations
  if (metrics.totalCycleTime > 1440) { // More than 24 hours
    const days = Math.floor(metrics.totalCycleTime / 1440)
    recommendations.push(`Process takes ${days}+ days - consider parallel processing or automation`)
  }

  return recommendations
}

/**
 * Generate formula explanations for tooltips
 */
export function getVSMFormulas(): Record<string, string> {
  return {
    cycleTime: 'Cycle Time = Process Time + Wait Time',
    efficiencyRatio: 'Efficiency = (Value-Added Time ÷ Total Cycle Time) × 100',
    processEfficiency: 'Process Efficiency = (Value-Added Time ÷ Total Process Time) × 100',
    valueAddedTime: 'Sum of durations for all value-added steps',
    nonValueAddedTime: 'Total Cycle Time - Value-Added Time'
  }
}