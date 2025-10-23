import { PrismaClient } from '@prisma/client'
import { analyzeProcessCapability } from '../lib/calculations/capability'

const prisma = new PrismaClient()

async function main() {
  console.log('=== Testing Capability Calculation ===\n')

  // Find the demo assignment
  const demoAssignment = await prisma.assignment.findFirst({
    where: {
      isDemo: true,
    },
    include: {
      processes: true,
    },
  })

  if (!demoAssignment) {
    console.log('No demo assignment found')
    return
  }

  console.log(`Demo Assignment: ${demoAssignment.title}\n`)

  demoAssignment.processes.forEach((process, index) => {
    console.log(`\n${index + 1}. ${process.processName}`)
    console.log('   Input Data:')
    console.log(`   - LSL: ${process.lowerSpecLimit}`)
    console.log(`   - USL: ${process.upperSpecLimit}`)
    console.log(`   - Target: ${process.targetValue}`)
    console.log(`   - Mean: ${process.sampleMean}`)
    console.log(`   - StdDev: ${process.sampleStdDev}`)

    // Check if all required fields are present
    const hasAllData =
      process.lowerSpecLimit !== null &&
      process.upperSpecLimit !== null &&
      process.sampleMean !== null &&
      process.sampleStdDev !== null

    console.log(`   - Has All Required Data: ${hasAllData ? '✅' : '❌'}`)

    if (hasAllData) {
      try {
        const capabilityData = analyzeProcessCapability({
          lowerSpecLimit: process.lowerSpecLimit,
          upperSpecLimit: process.upperSpecLimit,
          targetValue: process.targetValue,
          mean: process.sampleMean,
          stdDev: process.sampleStdDev,
        })

        console.log('\n   Capability Results:')
        console.log(`   - Cp: ${capabilityData.cp?.toFixed(3)}`)
        console.log(`   - Cpk: ${capabilityData.cpk?.toFixed(3)}`)
        console.log(`   - Sigma Level: ${capabilityData.sigmaLevel?.toFixed(3)}`)
        console.log(`   - PPM: ${capabilityData.ppm?.toFixed(0)}`)
        console.log(`   - Is Capable: ${capabilityData.isCapable ? '✅ YES' : '❌ NO'}`)
      } catch (error) {
        console.log(`   ❌ Error calculating capability: ${error}`)
      }
    } else {
      console.log('   ⚠️  Missing required data for capability analysis')
    }
  })
}

main()
  .catch(e => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
