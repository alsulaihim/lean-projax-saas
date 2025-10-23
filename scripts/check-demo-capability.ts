import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== Checking Demo Process Capability Data ===\n')

  // Find the demo assignment and its processes
  const demoAssignment = await prisma.assignment.findFirst({
    where: {
      isDemo: true,
    },
    include: {
      processes: {
        include: {
          vsmSteps: true,
          fmeaEntries: true,
        },
      },
    },
  })

  if (!demoAssignment) {
    console.log('No demo assignment found')
    return
  }

  console.log(`Demo Assignment: ${demoAssignment.title}`)
  console.log(`Total Processes: ${demoAssignment.processes.length}\n`)

  demoAssignment.processes.forEach((process, index) => {
    console.log(`\n${index + 1}. ${process.processName}`)
    console.log(`   Process ID: ${process.id}`)
    console.log(`   VSM Steps: ${process.vsmSteps.length}`)
    console.log(`   FMEA Entries: ${process.fmeaEntries.length}`)
    console.log('\n   Capability Data:')
    console.log(`   - Lower Spec Limit: ${process.lowerSpecLimit}`)
    console.log(`   - Upper Spec Limit: ${process.upperSpecLimit}`)
    console.log(`   - Target Value: ${process.targetValue}`)
    console.log(`   - Sample Mean: ${process.sampleMean}`)
    console.log(`   - Sample Std Dev: ${process.sampleStdDev}`)

    const hasCapabilityData =
      process.lowerSpecLimit !== null &&
      process.upperSpecLimit !== null &&
      process.sampleMean !== null &&
      process.sampleStdDev !== null

    console.log(`   - Has Complete Capability Data: ${hasCapabilityData ? '✅ YES' : '❌ NO'}`)
  })

  console.log('\n=== Summary ===')
  const processesWithCapability = demoAssignment.processes.filter(
    p =>
      p.lowerSpecLimit !== null &&
      p.upperSpecLimit !== null &&
      p.sampleMean !== null &&
      p.sampleStdDev !== null
  )

  console.log(
    `Processes with capability data: ${processesWithCapability.length}/${demoAssignment.processes.length}`
  )

  if (processesWithCapability.length === 0) {
    console.log('\n⚠️  No processes have capability data. Adding sample data...')

    // Add capability data to the first process
    const firstProcess = demoAssignment.processes[0]
    if (firstProcess) {
      await prisma.process.update({
        where: { id: firstProcess.id },
        data: {
          lowerSpecLimit: 8,
          upperSpecLimit: 12,
          targetValue: 10,
          sampleMean: 10.2,
          sampleStdDev: 0.8,
        },
      })

      console.log(`\n✅ Added capability data to process: ${firstProcess.processName}`)
      console.log('   LSL: 8, USL: 12, Target: 10, Mean: 10.2, StdDev: 0.8')
    }
  }
}

main()
  .catch(e => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
