// Usage: DATABASE_URL="postgresql://user:password@localhost:5432/dbname" node scripts/fix-fishbone-for-vital-steps.js
const { PrismaClient } = require('@prisma/client')

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('ERROR: DATABASE_URL environment variable is not set')
  process.exit(1)
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionString,
    },
  },
})

// Calculate Pareto analysis for a process
function calculatePareto(steps) {
  // Sort steps by total time (process + waiting) in descending order
  const sortedSteps = steps
    .map(step => ({
      ...step,
      totalTime:
        (step.processTime || step.durationMinutes || 0) +
        (step.waitingTime || step.waitTimeMinutes || 0),
    }))
    .sort((a, b) => b.totalTime - a.totalTime)

  // Calculate cumulative percentages
  const total = sortedSteps.reduce((sum, step) => sum + step.totalTime, 0)
  let cumulative = 0

  return sortedSteps.map(step => {
    cumulative += step.totalTime
    const cumulativePercentage = (cumulative / total) * 100
    return {
      ...step,
      percentage: (step.totalTime / total) * 100,
      cumulativePercentage,
      isVitalFew: cumulativePercentage <= 80,
    }
  })
}

async function fixFishboneForVitalSteps() {
  try {
    console.log('🐟 Fixing Fishbone Diagrams - One per Vital Few Step')
    console.log('='.repeat(60))

    // First, let's clear existing fishbone data to start fresh
    console.log('🧹 Clearing existing fishbone data...')

    // Get all processes
    const processes = await prisma.process.findMany({
      include: {
        vsmSteps: {
          orderBy: { stepNumber: 'asc' },
        },
        fishboneCategories: {
          include: {
            causes: true,
          },
        },
      },
    })

    // Delete existing fishbone data
    for (const process of processes) {
      for (const category of process.fishboneCategories) {
        // Delete causes first due to foreign key
        await prisma.fishboneCause.deleteMany({
          where: { categoryId: category.id },
        })
      }
      // Then delete categories
      await prisma.fishboneCategory.deleteMany({
        where: { processId: process.id },
      })
    }
    console.log('  ✅ Cleared existing fishbone data')

    // Now create fishbone for each vital few step
    console.log('\n📊 Creating Fishbone for Each Vital Few Step...')
    console.log('-'.repeat(60))

    let totalFishbonesCreated = 0
    let totalCausesCreated = 0

    const categories = ['PEOPLE', 'PROCESS', 'EQUIPMENT', 'MATERIALS', 'ENVIRONMENT', 'MANAGEMENT']

    // Detailed causes for each category and step type
    const getCausesForStep = (stepName, category) => {
      const causeTemplates = {
        PEOPLE: [
          `Insufficient training for "${stepName}" procedures`,
          `Staff fatigue during "${stepName}" activities`,
          `Lack of qualified personnel for "${stepName}"`,
          `Communication gaps in "${stepName}" handoffs`,
        ],
        PROCESS: [
          `"${stepName}" lacks standardized procedures`,
          `Inefficient workflow design in "${stepName}"`,
          `No quality checkpoints in "${stepName}"`,
          `Unclear escalation path for "${stepName}" issues`,
        ],
        EQUIPMENT: [
          `Equipment failure during "${stepName}"`,
          `Outdated technology for "${stepName}"`,
          `Insufficient tools for "${stepName}" tasks`,
          `System downtime affecting "${stepName}"`,
        ],
        MATERIALS: [
          `Poor quality inputs for "${stepName}"`,
          `Material shortage impacting "${stepName}"`,
          `Incorrect specifications in "${stepName}"`,
          `Documentation gaps for "${stepName}"`,
        ],
        ENVIRONMENT: [
          `Workspace constraints for "${stepName}"`,
          `Environmental factors affecting "${stepName}"`,
          `External dependencies delaying "${stepName}"`,
          `Location issues impacting "${stepName}"`,
        ],
        MANAGEMENT: [
          `Unclear priorities for "${stepName}"`,
          `Resource constraints in "${stepName}"`,
          `Lack of performance metrics for "${stepName}"`,
          `Poor change management in "${stepName}"`,
        ],
      }

      return causeTemplates[category] || []
    }

    for (const process of processes) {
      if (process.vsmSteps.length === 0) continue

      // Calculate Pareto for this process
      const paretoAnalysis = calculatePareto(process.vsmSteps)
      const vitalFewSteps = paretoAnalysis.filter(step => step.isVitalFew)

      if (vitalFewSteps.length === 0) {
        console.log(`\n⚠️  No vital few steps for: ${process.processName}`)
        continue
      }

      console.log(`\n📈 Process: ${process.processName}`)
      console.log(`   Vital Few Steps (≤80% cumulative): ${vitalFewSteps.length}`)

      // Create a separate fishbone for each vital few step
      for (const vitalStep of vitalFewSteps) {
        console.log(`\n   🎯 Creating fishbone for: "${vitalStep.stepName}"`)
        console.log(`      Cycle Time: ${vitalStep.totalTime.toFixed(1)} min`)
        console.log(`      Contribution: ${vitalStep.percentage.toFixed(1)}%`)
        console.log(`      Cumulative: ${vitalStep.cumulativePercentage.toFixed(1)}%`)

        // We'll create categories with order based on step position
        const baseOrder = vitalFewSteps.indexOf(vitalStep) * categories.length

        for (let i = 0; i < categories.length; i++) {
          const categoryType = categories[i]

          // Create category for this vital step
          const category = await prisma.fishboneCategory.create({
            data: {
              processId: process.id,
              category: categoryType,
              order: baseOrder + i,
            },
          })

          // Get causes specific to this step
          const stepCauses = getCausesForStep(vitalStep.stepName, categoryType)

          // Add 2-3 causes per category for this specific step
          const numCauses = categoryType === 'PROCESS' || categoryType === 'PEOPLE' ? 3 : 2
          for (let j = 0; j < Math.min(numCauses, stepCauses.length); j++) {
            await prisma.fishboneCause.create({
              data: {
                categoryId: category.id,
                causeDescription: stepCauses[j],
                order: j,
              },
            })
            totalCausesCreated++
          }
        }

        totalFishbonesCreated++
        console.log(`      ✅ Created fishbone with ${categories.length} categories`)
      }
    }

    // Verify the results
    console.log('\n' + '='.repeat(60))
    console.log('✅ FISHBONE RESTRUCTURING COMPLETE!')
    console.log('='.repeat(60))

    // Get statistics
    const processesWithFishbone = await prisma.process.findMany({
      select: {
        processName: true,
        vsmSteps: {
          select: {
            stepName: true,
            processTime: true,
            waitingTime: true,
          },
        },
        _count: {
          select: {
            fishboneCategories: true,
          },
        },
      },
    })

    console.log('\n📊 Summary:')
    console.log(`  Total Fishbone Diagrams Created: ${totalFishbonesCreated}`)
    console.log(`  Total Root Causes Created: ${totalCausesCreated}`)

    console.log('\n📋 Fishbone Distribution by Process:')
    for (const p of processesWithFishbone) {
      if (p._count.fishboneCategories > 0) {
        const paretoAnalysis = calculatePareto(p.vsmSteps)
        const vitalCount = paretoAnalysis.filter(s => s.isVitalFew).length
        const fishboneSets = p._count.fishboneCategories / 6 // 6 categories per fishbone
        console.log(`  ${p.processName}:`)
        console.log(`    Vital Few Steps: ${vitalCount}`)
        console.log(`    Fishbone Diagrams: ${fishboneSets}`)
      }
    }

    console.log('\n💡 Note: Each vital few step now has its own complete fishbone diagram')
    console.log('   with 6 categories and specific root causes related to that step.')
  } catch (error) {
    console.error('❌ Error fixing fishbone diagrams:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
fixFishboneForVitalSteps()
