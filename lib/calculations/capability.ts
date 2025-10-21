/**
 * Process Capability Calculation Module
 * Implements Cp, Cpk, and Sigma Level calculations for Six Sigma analysis
 */

export interface ProcessCapabilityInput {
  lowerSpecLimit: number | null
  upperSpecLimit: number | null
  targetValue?: number | null
  mean: number | null
  stdDev: number | null
}

export interface ProcessCapabilityResult {
  cp: number | null
  cpk: number | null
  cpu: number | null // Upper capability index
  cpl: number | null // Lower capability index
  sigmaLevel: number | null
  ppm: number | null // Parts per million defective
  rating: CapabilityRating
  isCapable: boolean
}

export type CapabilityRating =
  | 'not-calculated'
  | 'poor'
  | 'marginal'
  | 'adequate'
  | 'good'
  | 'excellent'

/**
 * Calculate Cp (Process Capability Index)
 * Measures potential capability if process is centered
 * Formula: Cp = (USL - LSL) / (6 * σ)
 */
export function calculateCp(
  lsl: number | null,
  usl: number | null,
  stdDev: number | null
): number | null {
  if (lsl === null || usl === null || stdDev === null || stdDev === 0) {
    return null
  }

  const cp = (usl - lsl) / (6 * stdDev)
  return Math.round(cp * 1000) / 1000 // Round to 3 decimal places
}

/**
 * Calculate Cpk (Process Capability Index - Adjusted for centering)
 * Measures actual capability accounting for process centering
 * Formula: Cpk = min[(Mean - LSL) / (3σ), (USL - Mean) / (3σ)]
 */
export function calculateCpk(
  lsl: number | null,
  usl: number | null,
  mean: number | null,
  stdDev: number | null
): number | null {
  if (lsl === null || usl === null || mean === null || stdDev === null || stdDev === 0) {
    return null
  }

  const cpl = (mean - lsl) / (3 * stdDev)
  const cpu = (usl - mean) / (3 * stdDev)
  const cpk = Math.min(cpl, cpu)

  return Math.round(cpk * 1000) / 1000
}

/**
 * Calculate Cpu (Upper Process Capability Index)
 * Formula: Cpu = (USL - Mean) / (3σ)
 */
export function calculateCpu(
  usl: number | null,
  mean: number | null,
  stdDev: number | null
): number | null {
  if (usl === null || mean === null || stdDev === null || stdDev === 0) {
    return null
  }

  const cpu = (usl - mean) / (3 * stdDev)
  return Math.round(cpu * 1000) / 1000
}

/**
 * Calculate Cpl (Lower Process Capability Index)
 * Formula: Cpl = (Mean - LSL) / (3σ)
 */
export function calculateCpl(
  lsl: number | null,
  mean: number | null,
  stdDev: number | null
): number | null {
  if (lsl === null || mean === null || stdDev === null || stdDev === 0) {
    return null
  }

  const cpl = (mean - lsl) / (3 * stdDev)
  return Math.round(cpl * 1000) / 1000
}

/**
 * Error function approximation for normal CDF calculation
 */
function erf(x: number): number {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = x < 0 ? -1 : 1
  const absX = Math.abs(x)

  const t = 1.0 / (1.0 + p * absX)
  const t2 = t * t
  const t3 = t2 * t
  const t4 = t3 * t
  const t5 = t4 * t

  const y = 1.0 - (((((a5 * t5 + a4 * t4) + a3 * t3) + a2 * t2) + a1 * t) * Math.exp(-absX * absX))

  return sign * y
}

/**
 * Calculate cumulative distribution function for normal distribution
 */
function normalCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.sqrt(2)))
}

/**
 * Calculate DPMO from Cpk using normal distribution
 */
function cpkToDPMO(cpk: number): number {
  // Calculate Z-score for the specification limits
  // Cpk represents the minimum of (USL-mean)/(3σ) and (mean-LSL)/(3σ)
  // This means the closest spec limit is at Cpk * 3 standard deviations from mean
  const zScore = cpk * 3

  // Calculate probability of defects on the closer side
  // Using one-tail probability
  const defectProbability = 1 - normalCDF(zScore)

  // Convert to DPMO (defects per million opportunities)
  // Multiply by 2 for both tails (assuming symmetrical)
  const dpmo = defectProbability * 2 * 1000000

  return dpmo
}

/**
 * Convert DPMO to Sigma Level
 * Uses the actual relationship without double-counting the shift
 */
function dpmoToSigmaLevel(dpmo: number): number {
  // For practical Six Sigma calculations:
  // The relationship between Cpk and Sigma Level is approximately:
  // Sigma Level = 3 * Cpk (for short-term capability)
  // This is the process capability without the 1.5 sigma shift

  // However, if we're given DPMO, we need to convert back to Z-score
  // and then to Sigma Level

  // Standard Six Sigma DPMO table (WITH 1.5 sigma shift built in)
  // These DPMO values correspond to the long-term performance
  const sigmaTable = [
    { dpmo: 691462, sigma: 1.0 },  // 1 sigma process (long-term)
    { dpmo: 308537, sigma: 2.0 },  // 2 sigma process
    { dpmo: 66807, sigma: 3.0 },   // 3 sigma process
    { dpmo: 6210, sigma: 4.0 },    // 4 sigma process
    { dpmo: 233, sigma: 5.0 },     // 5 sigma process
    { dpmo: 3.4, sigma: 6.0 }      // 6 sigma process
  ]

  // Handle edge cases
  if (dpmo >= 691462) return 1.0
  if (dpmo <= 3.4) return 6.0

  // Find the appropriate range and interpolate
  for (let i = 0; i < sigmaTable.length - 1; i++) {
    if (dpmo <= sigmaTable[i].dpmo && dpmo > sigmaTable[i + 1].dpmo) {
      // Log interpolation for better accuracy
      const x1 = Math.log(sigmaTable[i].dpmo)
      const x2 = Math.log(sigmaTable[i + 1].dpmo)
      const y1 = sigmaTable[i].sigma
      const y2 = sigmaTable[i + 1].sigma
      const x = Math.log(dpmo)

      return y1 + (y2 - y1) * (x - x1) / (x2 - x1)
    }
  }

  return 3.0 // Default
}

/**
 * Calculate Sigma Level from Cpk
 * Direct relationship: Sigma Level = Cpk * 3
 * This gives the actual process capability in terms of sigma
 */
export function calculateSigmaLevel(cpk: number | null): number | null {
  if (cpk === null) return null

  // Direct conversion: Sigma Level = Cpk * 3
  //
  // Cpk measures how many times 3σ fits between the mean and the closest spec limit
  // So the sigma level is simply Cpk * 3
  //
  // Standard relationships:
  // Cpk = 2.0 → 6σ process
  // Cpk = 1.67 → 5σ process
  // Cpk = 1.33 → 4σ process
  // Cpk = 1.0 → 3σ process
  // Cpk = 0.99 → 2.97σ process
  // Cpk = 0.67 → 2σ process
  // Cpk = 0.33 → 1σ process

  const sigmaLevel = cpk * 3

  return sigmaLevel
}

/**
 * Calculate PPM (Parts Per Million) defective from Cpk
 * Uses normal distribution for accurate calculation
 */
export function calculatePPM(cpk: number | null): number | null {
  if (cpk === null) return null

  // Calculate DPMO which is essentially PPM for defects
  const dpmo = cpkToDPMO(cpk)

  // Round to integer for display
  return Math.round(dpmo)
}

/**
 * Get capability rating based on Cpk value
 */
export function getCapabilityRating(cpk: number | null): CapabilityRating {
  if (cpk === null) return 'not-calculated'
  if (cpk >= 2.0) return 'excellent' // 6 Sigma
  if (cpk >= 1.67) return 'good' // 5 Sigma
  if (cpk >= 1.33) return 'adequate' // 4 Sigma (industry standard)
  if (cpk >= 1.0) return 'marginal' // 3 Sigma
  return 'poor' // Below 3 Sigma
}

/**
 * Get rating color for UI display
 */
export function getCapabilityColor(rating: CapabilityRating): string {
  switch (rating) {
    case 'excellent':
      return 'text-green-600 bg-green-100 border-green-300'
    case 'good':
      return 'text-blue-600 bg-blue-100 border-blue-300'
    case 'adequate':
      return 'text-indigo-600 bg-indigo-100 border-indigo-300'
    case 'marginal':
      return 'text-yellow-600 bg-yellow-100 border-yellow-300'
    case 'poor':
      return 'text-red-600 bg-red-100 border-red-300'
    default:
      return 'text-gray-600 bg-gray-100 border-gray-300'
  }
}

/**
 * Perform complete process capability analysis
 */
export function analyzeProcessCapability(
  input: ProcessCapabilityInput
): ProcessCapabilityResult {
  const { lowerSpecLimit, upperSpecLimit, mean, stdDev } = input

  const cp = calculateCp(lowerSpecLimit, upperSpecLimit, stdDev)
  const cpk = calculateCpk(lowerSpecLimit, upperSpecLimit, mean, stdDev)
  const cpu = calculateCpu(upperSpecLimit, mean, stdDev)
  const cpl = calculateCpl(lowerSpecLimit, mean, stdDev)
  const sigmaLevel = calculateSigmaLevel(cpk)
  const ppm = calculatePPM(cpk)
  const rating = getCapabilityRating(cpk)
  const isCapable = cpk !== null && cpk >= 1.33 // Industry standard

  return {
    cp,
    cpk,
    cpu,
    cpl,
    sigmaLevel,
    ppm,
    rating,
    isCapable
  }
}

/**
 * Format capability value for display
 */
export function formatCapabilityValue(value: number | null, decimals: number = 2): string {
  if (value === null) return '-'
  return value.toFixed(decimals)
}

/**
 * Get capability insights and recommendations
 */
export function getCapabilityInsights(result: ProcessCapabilityResult): string[] {
  const insights: string[] = []

  if (result.cpk === null) {
    insights.push('Insufficient data to calculate process capability')
    return insights
  }

  // Primary assessment
  if (result.isCapable) {
    insights.push(`Process is capable (Cpk = ${formatCapabilityValue(result.cpk)})`)
  } else {
    insights.push(`Process is not capable (Cpk = ${formatCapabilityValue(result.cpk)} < 1.33)`)
  }

  // Sigma level insight
  if (result.sigmaLevel !== null) {
    insights.push(`Operating at ${result.sigmaLevel} Sigma level`)
  }

  // PPM insight
  if (result.ppm !== null) {
    insights.push(`Expected ${result.ppm} defects per million opportunities`)
  }

  // Centering insight (compare Cp and Cpk)
  if (result.cp !== null && result.cpk !== null) {
    const centeringLoss = result.cp - result.cpk
    if (centeringLoss > 0.5) {
      insights.push('Process is significantly off-center - consider mean adjustment')
    } else if (centeringLoss > 0.2) {
      insights.push('Process is slightly off-center - minor adjustment may improve capability')
    } else {
      insights.push('Process is well-centered')
    }
  }

  // Recommendations based on rating
  switch (result.rating) {
    case 'poor':
      insights.push('Immediate action required: Reduce variation and/or adjust process mean')
      break
    case 'marginal':
      insights.push('Process improvement needed to meet quality standards')
      break
    case 'adequate':
      insights.push('Process meets minimum requirements but has room for improvement')
      break
    case 'good':
      insights.push('Process performing well - maintain current controls')
      break
    case 'excellent':
      insights.push('World-class performance - consider benchmarking for other processes')
      break
  }

  return insights
}

/**
 * Generate formula explanations for tooltips
 */
export function getCapabilityFormulas(): Record<string, string> {
  return {
    cp: 'Cp = (USL - LSL) / (6 × σ)',
    cpk: 'Cpk = min[(x̄ - LSL) / (3 × σ), (USL - x̄) / (3 × σ)]',
    cpu: 'Cpu = (USL - x̄) / (3 × σ)',
    cpl: 'Cpl = (x̄ - LSL) / (3 × σ)',
    sigmaLevel: 'Sigma Level ≈ 3 × Cpk',
    ppm: 'PPM = f(Cpk) using normal distribution'
  }
}