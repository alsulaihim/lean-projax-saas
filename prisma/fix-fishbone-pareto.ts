import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Calculate vital few steps for a process
function calculateVitalFew(steps: Array<{ stepName: string, processTime: number, waitingTime: number }>) {
  const sorted = steps
    .map(s => ({ ...s, totalTime: s.processTime + s.waitingTime }))
    .sort((a, b) => b.totalTime - a.totalTime)

  const total = sorted.reduce((sum, s) => sum + s.totalTime, 0)
  let cumulative = 0
  const vitalFew = []

  for (const step of sorted) {
    cumulative += step.totalTime
    const cumulativePct = (cumulative / total) * 100
    if (cumulativePct <= 80) {
      vitalFew.push(step)
    } else {
      break
    }
  }

  return vitalFew
}

async function main() {
  console.log('🔧 Fixing Fishbone-Pareto alignment...')

  const assignment = await prisma.assignment.findFirst({
    where: { title: 'Bank Facility Granting Process Improvement' }
  })

  if (!assignment) {
    throw new Error('Assignment not found')
  }

  const processes = await prisma.process.findMany({
    where: { assignment: { id: assignment.id } },
    include: { vsmSteps: true, fishboneCategories: { include: { causes: true } } },
    orderBy: { order: 'asc' }
  })

  console.log('✅ Found', processes.length, 'processes\n')

  // Delete all existing fishbone data
  console.log('🧹 Cleaning existing fishbone data...')
  for (const process of processes) {
    await prisma.fishboneCause.deleteMany({
      where: { category: { processId: process.id } }
    })
    await prisma.fishboneCategory.deleteMany({
      where: { processId: process.id }
    })
  }
  console.log('✅ Cleaned up existing fishbone data\n')

  let totalCategoriesCreated = 0
  let totalCausesCreated = 0

  // For each process, create fishbones for each vital few step
  for (const process of processes) {
    const vitalSteps = calculateVitalFew(process.vsmSteps as any)
    console.log(`📊 ${process.processName}:`)
    console.log(`   - Total steps: ${process.vsmSteps.length}`)
    console.log(`   - Vital few: ${vitalSteps.length}`)
    console.log(`   - Creating ${vitalSteps.length * 6} fishbone categories\n`)

    let categoryOrder = 0

    for (let stepIdx = 0; stepIdx < vitalSteps.length; stepIdx++) {
      const step = vitalSteps[stepIdx]

      // Create 6 categories (6M's) for this vital few step
      const categories = []

      // PEOPLE category
      const peopleCategory = await prisma.fishboneCategory.create({
        data: {
          processId: process.id,
          category: 'PEOPLE',
          order: categoryOrder++
        }
      })
      categories.push(peopleCategory)

      // PROCESS category
      const processCategory = await prisma.fishboneCategory.create({
        data: {
          processId: process.id,
          category: 'PROCESS',
          order: categoryOrder++
        }
      })
      categories.push(processCategory)

      // EQUIPMENT category
      const equipmentCategory = await prisma.fishboneCategory.create({
        data: {
          processId: process.id,
          category: 'EQUIPMENT',
          order: categoryOrder++
        }
      })
      categories.push(equipmentCategory)

      // MATERIALS category
      const materialsCategory = await prisma.fishboneCategory.create({
        data: {
          processId: process.id,
          category: 'MATERIALS',
          order: categoryOrder++
        }
      })
      categories.push(materialsCategory)

      // ENVIRONMENT category
      const environmentCategory = await prisma.fishboneCategory.create({
        data: {
          processId: process.id,
          category: 'ENVIRONMENT',
          order: categoryOrder++
        }
      })
      categories.push(environmentCategory)

      // MANAGEMENT category
      const managementCategory = await prisma.fishboneCategory.create({
        data: {
          processId: process.id,
          category: 'MANAGEMENT',
          order: categoryOrder++
        }
      })
      categories.push(managementCategory)

      totalCategoriesCreated += 6

      // Now add relevant causes for this specific vital few step
      const causes = generateCausesForStep(step.stepName, categories)

      for (const cause of causes) {
        await prisma.fishboneCause.create({ data: cause })
        totalCausesCreated++
      }
    }
  }

  console.log('\n✅ Fishbone-Pareto alignment completed!')
  console.log(`📊 Created ${totalCategoriesCreated} fishbone categories`)
  console.log(`📊 Created ${totalCausesCreated} root causes`)
}

// Generate relevant causes based on the step name
function generateCausesForStep(stepName: string, categories: any[]): any[] {
  const causes = []

  const [people, process, equipment, materials, environment, management] = categories

  // Check step type and generate relevant causes
  const isWaiting = stepName.toLowerCase().includes('wait')
  const isManual = stepName.toLowerCase().includes('manual') || stepName.toLowerCase().includes('entry')
  const isApproval = stepName.toLowerCase().includes('approval') || stepName.toLowerCase().includes('review')
  const isDocument = stepName.toLowerCase().includes('document') || stepName.toLowerCase().includes('paper')

  if (isWaiting) {
    // Waiting time causes
    causes.push(
      { categoryId: people.id, causeDescription: `Insufficient staff capacity for ${stepName}`, order: 1 },
      { categoryId: people.id, causeDescription: 'Staff unavailability or conflicting priorities', order: 2 },
      { categoryId: process.id, causeDescription: 'No prioritization or queue management', order: 1 },
      { categoryId: process.id, causeDescription: 'Sequential workflow instead of parallel', order: 2 },
      { categoryId: process.id, causeDescription: 'Batch processing delays', order: 3 },
      { categoryId: equipment.id, causeDescription: 'Lack of automation for this step', order: 1 },
      { categoryId: equipment.id, causeDescription: 'No workflow management system', order: 2 },
      { categoryId: materials.id, causeDescription: 'Missing information or incomplete inputs', order: 1 },
      { categoryId: environment.id, causeDescription: 'High workload volume', order: 1 },
      { categoryId: management.id, causeDescription: 'No SLA or time targets defined', order: 1 },
      { categoryId: management.id, causeDescription: 'Inadequate resource allocation', order: 2 }
    )
  } else if (isManual) {
    // Manual process causes
    causes.push(
      { categoryId: people.id, causeDescription: 'Human error in manual entry', order: 1 },
      { categoryId: people.id, causeDescription: 'Lack of training on efficient methods', order: 2 },
      { categoryId: people.id, causeDescription: 'Fatigue from repetitive tasks', order: 3 },
      { categoryId: process.id, causeDescription: 'No standardized procedure', order: 1 },
      { categoryId: process.id, causeDescription: 'Multiple data sources requiring manual consolidation', order: 2 },
      { categoryId: equipment.id, causeDescription: 'No automation tools available', order: 1 },
      { categoryId: equipment.id, causeDescription: 'Legacy systems not integrated', order: 2 },
      { categoryId: materials.id, causeDescription: 'Data in incompatible formats', order: 1 },
      { categoryId: environment.id, causeDescription: 'Pressure for speed leading to errors', order: 1 },
      { categoryId: management.id, causeDescription: 'No investment in automation', order: 1 },
      { categoryId: management.id, causeDescription: 'No quality control checks', order: 2 }
    )
  } else if (isApproval) {
    // Approval/review causes
    causes.push(
      { categoryId: people.id, causeDescription: 'Approver unavailability', order: 1 },
      { categoryId: people.id, causeDescription: 'Lack of clear authority levels', order: 2 },
      { categoryId: people.id, causeDescription: 'Insufficient expertise to make quick decisions', order: 3 },
      { categoryId: process.id, causeDescription: 'Overly complex approval workflow', order: 1 },
      { categoryId: process.id, causeDescription: 'Multiple sequential approvals required', order: 2 },
      { categoryId: process.id, causeDescription: 'No clear decision criteria', order: 3 },
      { categoryId: equipment.id, causeDescription: 'No digital approval workflow', order: 1 },
      { categoryId: equipment.id, causeDescription: 'Paper-based process', order: 2 },
      { categoryId: materials.id, causeDescription: 'Incomplete supporting documentation', order: 1 },
      { categoryId: environment.id, causeDescription: 'High volume requiring detailed review', order: 1 },
      { categoryId: management.id, causeDescription: 'Centralized approval bottleneck', order: 1 },
      { categoryId: management.id, causeDescription: 'No delegation framework', order: 2 }
    )
  } else if (isDocument) {
    // Documentation causes
    causes.push(
      { categoryId: people.id, causeDescription: 'Limited documentation staff', order: 1 },
      { categoryId: people.id, causeDescription: 'Lack of document preparation skills', order: 2 },
      { categoryId: process.id, causeDescription: 'Manual document creation from scratch', order: 1 },
      { categoryId: process.id, causeDescription: 'Multiple review rounds', order: 2 },
      { categoryId: process.id, causeDescription: 'Customer delays in providing info', order: 3 },
      { categoryId: equipment.id, causeDescription: 'No document automation system', order: 1 },
      { categoryId: equipment.id, causeDescription: 'Outdated templates', order: 2 },
      { categoryId: materials.id, causeDescription: 'Complex regulatory requirements', order: 1 },
      { categoryId: materials.id, causeDescription: 'Incomplete customer information', order: 2 },
      { categoryId: environment.id, causeDescription: 'Frequent regulatory changes', order: 1 },
      { categoryId: management.id, causeDescription: 'No document management system', order: 1 },
      { categoryId: management.id, causeDescription: 'Inadequate quality assurance', order: 2 }
    )
  } else {
    // Generic causes for other steps
    causes.push(
      { categoryId: people.id, causeDescription: `Insufficient skill level for ${stepName}`, order: 1 },
      { categoryId: people.id, causeDescription: 'Inadequate training', order: 2 },
      { categoryId: people.id, causeDescription: 'High workload per person', order: 3 },
      { categoryId: process.id, causeDescription: 'Inefficient process design', order: 1 },
      { categoryId: process.id, causeDescription: 'Lack of standardization', order: 2 },
      { categoryId: process.id, causeDescription: 'Redundant steps', order: 3 },
      { categoryId: equipment.id, causeDescription: 'Inadequate tools or technology', order: 1 },
      { categoryId: equipment.id, causeDescription: 'System performance issues', order: 2 },
      { categoryId: materials.id, causeDescription: 'Poor quality inputs', order: 1 },
      { categoryId: materials.id, causeDescription: 'Missing or incomplete data', order: 2 },
      { categoryId: environment.id, causeDescription: 'External dependencies', order: 1 },
      { categoryId: environment.id, causeDescription: 'Volume fluctuations', order: 2 },
      { categoryId: management.id, causeDescription: 'Lack of performance monitoring', order: 1 },
      { categoryId: management.id, causeDescription: 'Insufficient resources allocated', order: 2 }
    )
  }

  return causes
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
