// Usage: DATABASE_URL="postgresql://user:password@localhost:5432/dbname" node scripts/create-fishbone-for-vital-few.js
const { PrismaClient } = require('@prisma/client')

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('ERROR: DATABASE_URL environment variable is not set')
  process.exit(1)
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionString
    }
  }
})

// Calculate Pareto analysis for a process
function calculatePareto(steps) {
  // Sort steps by total time (process + waiting) in descending order
  const sortedSteps = steps
    .map(step => ({
      ...step,
      totalTime: (step.processTime || step.durationMinutes || 0) +
                 (step.waitingTime || step.waitTimeMinutes || 0)
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
      isVitalFew: cumulativePercentage <= 80
    }
  })
}

// Create fishbone diagram for a process
async function createFishboneDiagram(processId, processName, vitalFewSteps) {
  console.log(`\n📊 Creating fishbone diagram for vital few steps in: ${processName}`)

  // Check if fishbone categories already exist
  const existingCategories = await prisma.fishboneCategory.findMany({
    where: { processId }
  })

  if (existingCategories.length > 0) {
    console.log(`  ⚠️  Fishbone diagram already exists. Updating with vital few causes...`)
  }

  // Define category types for fishbone
  const categories = [
    'PEOPLE',
    'PROCESS',
    'EQUIPMENT',
    'MATERIALS',
    'ENVIRONMENT',
    'MANAGEMENT'
  ]

  // Generate root causes for each vital few step
  const causesPerCategory = {
    PEOPLE: (stepName) => [
      `Insufficient training for ${stepName}`,
      `High staff turnover affecting ${stepName}`,
      `Lack of expertise in ${stepName} procedures`
    ],
    PROCESS: (stepName) => [
      `${stepName} lacks standardization`,
      `Inefficient workflow design in ${stepName}`,
      `Missing quality checks in ${stepName}`
    ],
    EQUIPMENT: (stepName) => [
      `Equipment downtime during ${stepName}`,
      `Outdated machinery for ${stepName}`,
      `Lack of maintenance affecting ${stepName}`
    ],
    MATERIALS: (stepName) => [
      `Material quality issues in ${stepName}`,
      `Supply delays impacting ${stepName}`,
      `Incorrect specifications for ${stepName}`
    ],
    ENVIRONMENT: (stepName) => [
      `Poor workspace layout for ${stepName}`,
      `Environmental conditions affecting ${stepName}`,
      `Safety hazards in ${stepName} area`
    ],
    MANAGEMENT: (stepName) => [
      `Unclear priorities for ${stepName}`,
      `Resource allocation issues in ${stepName}`,
      `Lack of performance metrics for ${stepName}`
    ]
  }

  let totalCausesCreated = 0

  // Create or update categories and causes
  for (let i = 0; i < categories.length; i++) {
    const categoryType = categories[i]

    // Check if category exists
    let category = await prisma.fishboneCategory.findFirst({
      where: {
        processId,
        category: categoryType
      }
    })

    // Create category if it doesn't exist
    if (!category) {
      category = await prisma.fishboneCategory.create({
        data: {
          processId,
          category: categoryType,
          order: i
        }
      })
      console.log(`  ✅ Created category: ${categoryType}`)
    }

    // Get existing causes for this category
    const existingCauses = await prisma.fishboneCause.findMany({
      where: { categoryId: category.id }
    })

    // Generate causes for vital few steps
    let orderIndex = existingCauses.length

    for (const step of vitalFewSteps) {
      const stepCauses = causesPerCategory[categoryType](step.stepName)

      // Only add the most relevant cause per vital step to avoid overwhelming the diagram
      const primaryCause = stepCauses[0]

      // Check if a similar cause already exists
      const similarExists = existingCauses.some(c =>
        c.causeDescription.toLowerCase().includes(step.stepName.toLowerCase())
      )

      if (!similarExists) {
        await prisma.fishboneCause.create({
          data: {
            categoryId: category.id,
            causeDescription: primaryCause,
            order: orderIndex++
          }
        })
        totalCausesCreated++
      }
    }
  }

  console.log(`  ✅ Added ${totalCausesCreated} new causes for vital few steps`)
  return totalCausesCreated
}

async function createFishboneForVitalFew() {
  try {
    console.log('🚀 Creating Fishbone Diagrams for Vital Few Steps (80% Pareto)')
    console.log('=' .repeat(60))

    // Get all processes with their VSM steps
    const processes = await prisma.process.findMany({
      include: {
        vsmSteps: {
          orderBy: { stepNumber: 'asc' }
        },
        fishboneCategories: {
          include: {
            causes: true
          }
        }
      }
    })

    if (processes.length === 0) {
      console.log('❌ No processes found.')
      return
    }

    console.log(`Found ${processes.length} processes to analyze`)

    let totalProcessesUpdated = 0
    let totalCausesCreated = 0

    for (const process of processes) {
      if (process.vsmSteps.length === 0) {
        console.log(`\n⚠️  No VSM steps for process: ${process.processName}`)
        continue
      }

      // Calculate Pareto for this process
      const paretoAnalysis = calculatePareto(process.vsmSteps)

      // Filter vital few (80% and below)
      const vitalFewSteps = paretoAnalysis.filter(step => step.isVitalFew)

      console.log(`\n📈 Process: ${process.processName}`)
      console.log(`   Total VSM steps: ${process.vsmSteps.length}`)
      console.log(`   Vital few steps (≤80%): ${vitalFewSteps.length}`)

      if (vitalFewSteps.length > 0) {
        console.log(`   Steps requiring fishbone analysis:`)
        vitalFewSteps.forEach(step => {
          console.log(`     - ${step.stepName} (${step.percentage.toFixed(1)}%, cumulative: ${step.cumulativePercentage.toFixed(1)}%)`)
        })

        // Create or update fishbone diagram
        const causesAdded = await createFishboneDiagram(process.id, process.processName, vitalFewSteps)

        if (causesAdded > 0) {
          totalProcessesUpdated++
          totalCausesCreated += causesAdded
        }
      }
    }

    console.log('\n' + '=' .repeat(60))
    console.log('✅ Summary:')
    console.log(`   Processes updated: ${totalProcessesUpdated}`)
    console.log(`   Total causes created: ${totalCausesCreated}`)

    // Verify the results
    const updatedProcesses = await prisma.process.findMany({
      select: {
        processName: true,
        _count: {
          select: {
            fishboneCategories: true
          }
        }
      }
    })

    console.log('\n📊 Verification:')
    for (const p of updatedProcesses) {
      if (p._count.fishboneCategories > 0) {
        console.log(`   ✓ ${p.processName}: ${p._count.fishboneCategories} fishbone categories`)
      }
    }

  } catch (error) {
    console.error('❌ Error creating fishbone diagrams:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
createFishboneForVitalFew()