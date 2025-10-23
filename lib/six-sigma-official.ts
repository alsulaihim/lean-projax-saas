/**
 * Official Six Sigma Calculations
 * Based on industry standard formulas and tables
 */

/**
 * Error function for normal CDF calculation
 */
function erf(x: number): number {
  // Abramowitz and Stegun approximation
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = x < 0 ? -1 : 1
  const absX = Math.abs(x)

  const t = 1.0 / (1.0 + p * absX)
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX)

  return sign * y
}

/**
 * Normal cumulative distribution function
 */
function normalCDF(z: number): number {
  return 0.5 * (1 + erf(z / Math.sqrt(2)))
}

/**
 * Inverse normal CDF (probit function)
 * Returns the Z-score for a given probability
 */
function inverseNormalCDF(p: number): number {
  // Coefficients for Hastings approximation
  const a = [
    2.506628277459239, -30.66479806614716, 138.357751867269, -275.9285104469687, 220.9460984245205,
    -39.69683028665376,
  ]
  const b = [
    -13.28068155288572, 66.80131188771972, -155.6989798598866, 161.5858368580409,
    -54.47609879822406,
  ]
  const c = [
    2.938163982698783, 4.374664141464968, -2.549732539343734, -2.400758277161838,
    -0.3223964580411365, -0.007784894002430293,
  ]
  const d = [1, 3.754408661907416]

  const q = p < 0.5 ? p : 1 - p
  const r = Math.sqrt(-Math.log(q))

  let z: number
  if (r < 2.5) {
    const t = r - 1.6
    z =
      (((((a[5] * t + a[4]) * t + a[3]) * t + a[2]) * t + a[1]) * t + a[0]) /
      (((((b[4] * t + b[3]) * t + b[2]) * t + b[1]) * t + b[0]) * t + 1)
  } else {
    const t = r - 2.5
    z =
      (((((c[5] * t + c[4]) * t + c[3]) * t + c[2]) * t + c[1]) * t + c[0]) /
      ((d[1] * t + d[0]) * t + 1)
  }

  return p < 0.5 ? -z : z
}

/**
 * Calculate DPMO from Cpk value
 * This is the official Six Sigma calculation
 */
export function cpkToDPMO(cpk: number): number {
  // Z-score for the closest specification limit
  const zScore = cpk * 3

  // Probability of defects beyond the specification limit
  const defectProbability = 1 - normalCDF(zScore)

  // Convert to DPMO (assuming two-sided specification)
  // We multiply by 2 for both tails if the process is centered
  const dpmo = defectProbability * 2 * 1000000

  return dpmo
}

/**
 * Official Six Sigma Level calculation from DPMO
 * Uses the standard conversion WITH 1.5 sigma shift
 */
export function dpmoToSigmaLevel(dpmo: number): number {
  // Convert DPMO to defect probability
  const defectProbability = dpmo / 1000000

  // For two-sided specifications, divide by 2 to get one-tail probability
  const oneTailProbability = defectProbability / 2

  // Find the Z-score that corresponds to this defect rate
  // We want the Z-score where P(Z > z) = oneTailProbability
  // Which means P(Z <= z) = 1 - oneTailProbability
  const zScore = inverseNormalCDF(1 - oneTailProbability)

  // Add the 1.5 sigma shift to get the Six Sigma Level
  // This is the industry standard: Sigma Level = Z-score + 1.5
  const sigmaLevel = zScore + 1.5

  return sigmaLevel
}

/**
 * Alternative: Use official Six Sigma conversion table
 * This table already includes the 1.5 sigma shift
 */
export function dpmoToSigmaLevelTable(dpmo: number): number {
  // Official Six Sigma conversion table
  const conversionTable = [
    { minDPMO: 500000, sigmaLevel: 1.5 },
    { minDPMO: 308537, sigmaLevel: 2.0 },
    { minDPMO: 158655, sigmaLevel: 2.5 },
    { minDPMO: 66807, sigmaLevel: 3.0 },
    { minDPMO: 22750, sigmaLevel: 3.5 },
    { minDPMO: 6210, sigmaLevel: 4.0 },
    { minDPMO: 1350, sigmaLevel: 4.5 },
    { minDPMO: 233, sigmaLevel: 5.0 },
    { minDPMO: 32, sigmaLevel: 5.5 },
    { minDPMO: 3.4, sigmaLevel: 6.0 },
  ]

  // Find the appropriate sigma level
  for (let i = 0; i < conversionTable.length; i++) {
    if (dpmo >= conversionTable[i].minDPMO) {
      if (i === 0) {
        // Below 1.5 sigma
        return conversionTable[i].sigmaLevel
      }
      // Interpolate between levels
      const prev = conversionTable[i - 1]
      const curr = conversionTable[i]

      // Log interpolation for better accuracy
      const logDPMO = Math.log(dpmo)
      const logPrev = Math.log(prev.minDPMO)
      const logCurr = Math.log(curr.minDPMO)

      const ratio = (logDPMO - logCurr) / (logPrev - logCurr)
      return curr.sigmaLevel + ratio * (prev.sigmaLevel - curr.sigmaLevel)
    }
  }

  // Better than 6 sigma
  return 6.0
}

/**
 * Calculate Sigma Level directly from Cpk
 * Official Six Sigma formula
 */
export function cpkToSigmaLevel(cpk: number): number {
  // Method 1: Direct calculation
  // Z-score = Cpk * 3
  const zScore = cpk * 3

  // Sigma Level = Z-score + 1.5 (including the standard shift)
  const sigmaLevel = zScore + 1.5

  return sigmaLevel
}

/**
 * Calculate expected PPM defects from Cpk
 */
export function cpkToPPM(cpk: number): number {
  return cpkToDPMO(cpk)
}

/**
 * Validate calculations by comparing methods
 */
export function validateCalculations(cpk: number) {
  const dpmo = cpkToDPMO(cpk)
  const sigmaMethod1 = cpkToSigmaLevel(cpk)
  const sigmaMethod2 = dpmoToSigmaLevel(dpmo)
  const sigmaMethod3 = dpmoToSigmaLevelTable(dpmo)

  return {
    cpk,
    dpmo: Math.round(dpmo),
    sigmaDirectCalc: sigmaMethod1,
    sigmaFromDPMO: sigmaMethod2,
    sigmaFromTable: sigmaMethod3,
  }
}
