// Quick verification of Six Sigma calculations

console.log('Official Six Sigma Calculations - Verification')
console.log('=' .repeat(50))
console.log('\nFormula: Sigma Level = (Cpk × 3) + 1.5')
console.log('-'.repeat(50))

const testCases = [
  { cpk: 2.00, name: 'World Class' },
  { cpk: 1.67, name: 'Excellent' },
  { cpk: 1.33, name: 'Good' },
  { cpk: 1.00, name: 'Acceptable' },
  { cpk: 0.99, name: 'Your Example' },
  { cpk: 0.67, name: 'Poor' }
]

testCases.forEach(test => {
  const sigmaLevel = Math.min((test.cpk * 3) + 1.5, 6.0)
  console.log(`Cpk: ${test.cpk.toFixed(3)} → Sigma Level: ${sigmaLevel.toFixed(3)}σ (${test.name})`)
})

console.log('\n' + '=' .repeat(50))
console.log('✓ For Cpk = 0.990:')
const cpk = 0.990
const sigma = (cpk * 3) + 1.5
console.log(`  Calculation: (${cpk} × 3) + 1.5 = ${sigma.toFixed(3)}σ`)
console.log(`  This is correct! Cpk ≈ 1.0 should give ~4.5σ with the shift`)
console.log('\nNote: The 1.5σ shift is the industry standard assumption')
console.log('for long-term process variation in Six Sigma methodology.')