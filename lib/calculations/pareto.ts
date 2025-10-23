/**
 * Pareto Analysis Calculation Module
 * Implements 80/20 rule analysis for process optimization
 */

export interface ParetoItem {
  id: string
  name: string
  value: number
  category?: string
}

export interface ParetoResult {
  items: ParetoItemWithAnalysis[]
  totalValue: number
  vitalFewCount: number // Number of items contributing to 80%
  vitalFewPercentage: number // Percentage of items that are vital few
}

export interface ParetoItemWithAnalysis extends ParetoItem {
  percentage: number
  cumulativePercentage: number
  rank: number
  isVitalFew: boolean // Part of the 80% contributors
}

/**
 * Performs Pareto analysis on a set of items
 * @param items Array of items with values to analyze
 * @param targetPercentage Target cumulative percentage (default 80%)
 * @returns Sorted items with Pareto analysis metrics
 */
export function calculatePareto(items: ParetoItem[], targetPercentage: number = 80): ParetoResult {
  if (!items || items.length === 0) {
    return {
      items: [],
      totalValue: 0,
      vitalFewCount: 0,
      vitalFewPercentage: 0,
    }
  }

  // Calculate total value
  const totalValue = items.reduce((sum, item) => sum + Math.abs(item.value), 0)

  if (totalValue === 0) {
    return {
      items: items.map((item, index) => ({
        ...item,
        percentage: 0,
        cumulativePercentage: 0,
        rank: index + 1,
        isVitalFew: false,
      })),
      totalValue: 0,
      vitalFewCount: 0,
      vitalFewPercentage: 0,
    }
  }

  // Sort items by value (descending)
  const sortedItems = [...items].sort((a, b) => b.value - a.value)

  // Calculate percentages and cumulative percentages
  let cumulativePercentage = 0
  let vitalFewCount = 0
  const analyzedItems: ParetoItemWithAnalysis[] = sortedItems.map((item, index) => {
    const percentage = (Math.abs(item.value) / totalValue) * 100
    cumulativePercentage += percentage

    const isVitalFew = cumulativePercentage <= targetPercentage || index === 0
    if (isVitalFew) {
      vitalFewCount++
    }

    return {
      ...item,
      percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      cumulativePercentage: Math.round(cumulativePercentage * 100) / 100,
      rank: index + 1,
      isVitalFew,
    }
  })

  return {
    items: analyzedItems,
    totalValue,
    vitalFewCount,
    vitalFewPercentage: (vitalFewCount / items.length) * 100,
  }
}

/**
 * Generate Pareto chart data for visualization
 * @param result Pareto analysis result
 * @returns Data formatted for Recharts
 */
export function formatParetoChartData(result: ParetoResult) {
  return result.items.map(item => ({
    name: item.name,
    value: item.value,
    percentage: item.percentage,
    cumulative: item.cumulativePercentage,
    isVitalFew: item.isVitalFew,
  }))
}

/**
 * Calculate Pareto efficiency ratio
 * Shows how concentrated the problems/values are
 * Lower ratio = more concentrated = better for focused improvement
 */
export function calculateParetoEfficiency(result: ParetoResult): number {
  if (result.items.length === 0) return 0

  // Efficiency = (vital few count / total count) * 100
  return Math.round(result.vitalFewPercentage * 100) / 100
}

/**
 * Get Pareto insights and recommendations
 */
export function getParetoInsights(result: ParetoResult): string[] {
  const insights: string[] = []

  if (result.vitalFewCount === 0) {
    insights.push('No data available for analysis')
    return insights
  }

  const efficiency = calculateParetoEfficiency(result)

  // Add primary insight
  insights.push(
    `${result.vitalFewCount} out of ${result.items.length} items (${efficiency}%) ` +
      `contribute to 80% of the total impact`
  )

  // Add efficiency interpretation
  if (efficiency <= 20) {
    insights.push('Highly concentrated - Focus on these few critical items for maximum impact')
  } else if (efficiency <= 40) {
    insights.push('Moderately concentrated - Good opportunity for targeted improvements')
  } else {
    insights.push(
      'Widely distributed - Consider systemic improvements rather than item-specific fixes'
    )
  }

  // Add top contributor insight
  if (result.items.length > 0) {
    const topItem = result.items[0]
    insights.push(`Top contributor: "${topItem.name}" accounts for ${topItem.percentage}% of total`)
  }

  return insights
}
