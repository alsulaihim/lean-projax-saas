// Verify CORRECT Six Sigma calculations

console.log('Correct Six Sigma Calculations')
console.log('=' .repeat(50))
console.log('\nFormula: Sigma Level = Cpk × 3')
console.log('(No 1.5 shift added - Cpk already measures actual performance)')
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
  const sigmaLevel = test.cpk * 3
  console.log(`Cpk: ${test.cpk.toFixed(3)} → Sigma Level: ${sigmaLevel.toFixed(3)}σ (${test.name})`)
})

console.log('\n' + '=' .repeat(50))
console.log('✓ For Cpk = 0.990:')
const cpk = 0.990
const sigma = cpk * 3
console.log(`  Calculation: ${cpk} × 3 = ${sigma.toFixed(3)}σ`)
console.log(`  This is CORRECT! Cpk ≈ 1.0 corresponds to a 3σ process`)

console.log('\nWhy no 1.5 shift?')
console.log('- Cpk already measures the ACTUAL process performance')
console.log('- It accounts for any shift from center (mean vs target)')
console.log('- Adding 1.5 would be double-counting')
console.log('\nThe 1.5σ shift is only used when converting from:')
console.log('- Short-term capability to long-term performance')
console.log('- Or when using DPMO tables that assume the shift')