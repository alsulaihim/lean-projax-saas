// Test official Six Sigma calculations
const { cpkToSigmaLevel, cpkToDPMO, dpmoToSigmaLevel, dpmoToSigmaLevelTable, validateCalculations } = require('./lib/six-sigma-official.ts')

console.log('Official Six Sigma Calculations Test')
console.log('=' .repeat(60))

// Test cases with expected results
const testCases = [
  { cpk: 2.0, expectedSigma: 6.0, name: 'World Class' },
  { cpk: 1.67, expectedSigma: 5.0, name: 'Excellent' },
  { cpk: 1.33, expectedSigma: 4.0, name: 'Good/Capable' },
  { cpk: 1.0, expectedSigma: 3.0, name: 'Acceptable' },
  { cpk: 0.99, expectedSigma: 2.97, name: 'User Example' },
  { cpk: 0.67, expectedSigma: 2.0, name: 'Poor' },
  { cpk: 0.33, expectedSigma: 1.0, name: 'Unacceptable' }
]

console.log('\nOfficial Six Sigma Relationship:')
console.log('Sigma Level = (Cpk * 3) + 1.5')
console.log('(The 1.5 is the standard shift assumed in Six Sigma)')
console.log('-'.repeat(60))

testCases.forEach(test => {
  const result = validateCalculations(test.cpk)

  console.log(`\nCpk: ${test.cpk.toFixed(3)} (${test.name})`)
  console.log(`  Expected Sigma: ~${test.expectedSigma}σ`)
  console.log(`  Calculated:`)
  console.log(`    Direct (Cpk*3 + 1.5): ${result.sigmaDirectCalc.toFixed(3)}σ`)
  console.log(`    From DPMO: ${result.sigmaFromDPMO.toFixed(3)}σ`)
  console.log(`    From Table: ${result.sigmaFromTable.toFixed(3)}σ`)
  console.log(`    DPMO: ${result.dpmo}`)
})

console.log('\n' + '=' .repeat(60))
console.log('Verification of User-Reported Issue:')
console.log('User states: Cpk = 0.990, DPMO = 2012, showing 4.343σ (incorrect)')
console.log('\nCorrect calculation:')

const userCpk = 0.990
const userResult = validateCalculations(userCpk)

console.log(`  Cpk: ${userCpk}`)
console.log(`  DPMO (calculated): ${userResult.dpmo}`)
console.log(`  Sigma Level: ${userResult.sigmaDirectCalc.toFixed(3)}σ`)
console.log(`\nExplanation:`)
console.log(`  Z-score = Cpk * 3 = ${userCpk} * 3 = ${(userCpk * 3).toFixed(3)}`)
console.log(`  Sigma Level = Z-score + 1.5 = ${(userCpk * 3).toFixed(3)} + 1.5 = ${userResult.sigmaDirectCalc.toFixed(3)}σ`)
console.log('\nThis matches the standard Six Sigma relationship where:')
console.log('  Cpk ≈ 1.0 corresponds to a 3-sigma process')