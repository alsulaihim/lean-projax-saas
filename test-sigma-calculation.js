// Test Six Sigma calculations to verify correct DPMO to Sigma Level conversion

// Error function for normal CDF calculation
function erf(x) {
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

// Calculate cumulative distribution function
function normalCDF(x) {
  return 0.5 * (1 + erf(x / Math.sqrt(2)))
}

// Calculate DPMO from Cpk
function cpkToDPMO(cpk) {
  // Cpk represents how many times 3σ fits between mean and closest spec limit
  // So the Z-score to the closest spec limit is Cpk * 3
  const zScore = cpk * 3

  // Calculate probability of defects (one tail)
  const defectProbOneSide = 1 - normalCDF(zScore)

  // For two-sided specs, multiply by 2 (assuming symmetrical)
  const totalDefectProb = defectProbOneSide * 2

  // Convert to DPMO
  const dpmo = totalDefectProb * 1000000

  return dpmo
}

// Standard Six Sigma table (includes 1.5σ shift)
const sigmaTable = [
  { dpmo: 691462, sigma: 1.0 },
  { dpmo: 308537, sigma: 2.0 },
  { dpmo: 66807, sigma: 3.0 },
  { dpmo: 6210, sigma: 4.0 },
  { dpmo: 233, sigma: 5.0 },
  { dpmo: 3.4, sigma: 6.0 }
]

// Convert DPMO to Sigma Level using standard table
function dpmoToSigmaLevel(dpmo) {
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

// Alternative calculation: Direct Z-score to Sigma Level
function zScoreToSigmaLevel(zScore) {
  // The sigma level WITH 1.5 sigma shift
  // Sigma Level = Z-score + 1.5 (industry standard includes 1.5σ shift)
  return zScore + 1.5
}

console.log('Six Sigma Calculation Verification')
console.log('=' .repeat(50))

// Test cases
const testCases = [
  { cpk: 2.0, name: 'World Class' },
  { cpk: 1.67, name: 'Very Good' },
  { cpk: 1.33, name: 'Capable' },
  { cpk: 1.0, name: 'Marginal' },
  { cpk: 0.99, name: 'Your Example' },
  { cpk: 0.990, name: 'Exact Value' },
  { cpk: 0.67, name: 'Poor' }
]

console.log('\nCpk → DPMO → Sigma Level Conversion:')
console.log('-'.repeat(50))

testCases.forEach(test => {
  const dpmo = cpkToDPMO(test.cpk)
  const sigmaLevel = dpmoToSigmaLevel(dpmo)
  const zScore = test.cpk * 3
  const altSigmaLevel = zScoreToSigmaLevel(zScore)

  console.log(`Cpk: ${test.cpk.toFixed(3)} (${test.name})`)
  console.log(`  DPMO: ${dpmo.toFixed(0)}`)
  console.log(`  Sigma Level (from table): ${sigmaLevel.toFixed(3)}σ`)
  console.log(`  Sigma Level (Z + 1.5): ${altSigmaLevel.toFixed(3)}σ`)
  console.log('')
})

// Specific test for the reported issue
console.log('=' .repeat(50))
console.log('Specific Issue Check:')
console.log('User reports: Cpk = 0.990, DPMO = 2012')

const cpk = 0.990
const calculatedDPMO = cpkToDPMO(cpk)
const calculatedSigmaLevel = dpmoToSigmaLevel(calculatedDPMO)

console.log(`\nFor Cpk = ${cpk}:`)
console.log(`  Calculated DPMO: ${calculatedDPMO.toFixed(0)}`)
console.log(`  Calculated Sigma Level: ${calculatedSigmaLevel.toFixed(3)}σ`)
console.log(`  Expected: ~3σ (since Cpk ≈ 1.0)`)

// Verify with reverse calculation
console.log('\nVerification - DPMO of 2012 corresponds to:')
const sigmaFor2012 = dpmoToSigmaLevel(2012)
console.log(`  Sigma Level: ${sigmaFor2012.toFixed(3)}σ`)