const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkVSMData() {
  try {
    // Get all VSM steps
    const vsmSteps = await prisma.vSMStep.findMany({
      include: {
        process: {
          select: {
            processName: true,
          },
        },
      },
    })

    console.log('\n=== VSM STEPS DATA ===\n')
    console.log(`Total VSM Steps: ${vsmSteps.length}\n`)

    if (vsmSteps.length > 0) {
      console.log('Sample VSM Steps:')
      vsmSteps.slice(0, 5).forEach((step, index) => {
        console.log(`\n${index + 1}. ${step.stepName} (Process: ${step.process.processName})`)
        console.log(`   - processTime: ${step.processTime}`)
        console.log(`   - waitingTime: ${step.waitingTime}`)
        console.log(`   - durationMinutes (legacy): ${step.durationMinutes}`)
        console.log(`   - waitTimeMinutes (legacy): ${step.waitTimeMinutes}`)
        console.log(`   - valueMeasure: ${step.valueMeasure}`)
        console.log(`   - valueAdded (legacy): ${step.valueAdded}`)
      })
    } else {
      console.log('No VSM steps found in the database.')
    }

    // Check processes with VSM steps
    const processesWithVSM = await prisma.process.findMany({
      where: {
        vsmSteps: {
          some: {},
        },
      },
      include: {
        _count: {
          select: {
            vsmSteps: true,
          },
        },
      },
    })

    console.log('\n=== PROCESSES WITH VSM STEPS ===\n')
    processesWithVSM.forEach(process => {
      console.log(`- ${process.processName}: ${process._count.vsmSteps} steps`)
    })
  } catch (error) {
    console.error('Error checking VSM data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkVSMData()
