import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clean existing data
  await prisma.auditLog.deleteMany()
  await prisma.recommendation.deleteMany()
  await prisma.fMEAEntry.deleteMany()
  await prisma.fishboneCause.deleteMany()
  await prisma.fishboneCategory.deleteMany()
  await prisma.vSMStep.deleteMany()
  await prisma.sIPOCEntry.deleteMany()
  await prisma.cTQRequirement.deleteMany()
  await prisma.vOCStatement.deleteMany()
  await prisma.process.deleteMany()
  await prisma.assignment.deleteMany()
  await prisma.user.deleteMany()

  console.log('✨ Cleaned existing data')

  // Create test users (one per role)
  const password = await bcrypt.hash('password123', 10)

  const bpiUser = await prisma.user.create({
    data: {
      email: 'analyst@example.com',
      name: 'John Analyst',
      role: 'BPI_TEAM',
      passwordHash: password
    }
  })

  const teamLead = await prisma.user.create({
    data: {
      email: 'lead@example.com',
      name: 'Sarah Lead',
      role: 'TEAM_LEAD',
      passwordHash: password
    }
  })

  const executive = await prisma.user.create({
    data: {
      email: 'exec@example.com',
      name: 'Mike Executive',
      role: 'EXECUTIVE',
      passwordHash: password
    }
  })

  const processOwner = await prisma.user.create({
    data: {
      email: 'owner@example.com',
      name: 'Lisa Owner',
      role: 'PROCESS_OWNER',
      passwordHash: password
    }
  })

  console.log('👤 Created users:', { bpiUser, teamLead, executive, processOwner })

  // Create sample assignments
  const draftAssignment = await prisma.assignment.create({
    data: {
      title: 'Order Fulfillment Process Analysis',
      objective: 'Reduce order cycle time by 30% and improve accuracy to 99.5%',
      status: 'DRAFT',
      createdById: bpiUser.id,

      // Add VOC statements
      vocStatements: {
        create: [
          {
            customerSegment: 'Online Shoppers',
            voiceStatement: 'Orders take too long to arrive and sometimes contain wrong items'
          },
          {
            customerSegment: 'B2B Clients',
            voiceStatement: 'Need better visibility into order status and tracking'
          }
        ]
      },

      // Add CTQ requirements
      ctqRequirements: {
        create: [
          {
            ctqDescription: 'Order cycle time',
            measurementCriteria: 'Time from order placement to delivery',
            targetValue: '< 3 days'
          },
          {
            ctqDescription: 'Order accuracy',
            measurementCriteria: 'Percentage of orders with correct items',
            targetValue: '> 99.5%'
          }
        ]
      }
    }
  })

  // Create a process for the assignment
  const process = await prisma.process.create({
    data: {
      assignmentId: draftAssignment.id,
      processName: 'Order Entry and Fulfillment',
      processOwner: 'John Warehouse Manager',
      order: 1,
      lowerSpecLimit: 24,
      upperSpecLimit: 72,
      targetValue: 48,
      sampleMean: 52,
      sampleStdDev: 8
    }
  })

  // Add SIPOC entries using batch insert for better performance
  const sipocData = [
    { column: 'SUPPLIER', value: 'Warehouse Staff', order: 1 },
    { column: 'SUPPLIER', value: 'IT Systems', order: 2 },
    { column: 'INPUT', value: 'Customer Orders', order: 1 },
    { column: 'INPUT', value: 'Inventory Data', order: 2 },
    { column: 'PROCESS', value: 'Receive Order', order: 1 },
    { column: 'PROCESS', value: 'Pick Items', order: 2 },
    { column: 'PROCESS', value: 'Pack and Ship', order: 3 },
    { column: 'OUTPUT', value: 'Shipped Package', order: 1 },
    { column: 'OUTPUT', value: 'Tracking Number', order: 2 },
    { column: 'CUSTOMER', value: 'End Customers', order: 1 },
    { column: 'CUSTOMER', value: 'Customer Service', order: 2 }
  ]

  await prisma.sIPOCEntry.createMany({
    data: sipocData.map(entry => ({
      processId: process.id,
      ...entry
    }))
  })

  // Add VSM steps with new schema
  const vsmSteps = [
    {
      stepNumber: 1,
      stepName: 'Receive Order',
      processTime: 5,
      waitingTime: 0,
      valueMeasure: 'NON_VALUE_ADDED' as const,
      stakeholder: 'Customer Service',
      wasteType: null,
      remarks: 'Initial order entry'
    },
    {
      stepNumber: 2,
      stepName: 'Order Validation',
      processTime: 10,
      waitingTime: 60,
      valueMeasure: 'ESSENTIAL_NON_VALUE' as const,
      stakeholder: 'IT Systems',
      wasteType: 'WAITING' as const,
      remarks: 'System verification'
    },
    {
      stepNumber: 3,
      stepName: 'Pick Items',
      processTime: 30,
      waitingTime: 120,
      valueMeasure: 'VALUE_ADDED' as const,
      stakeholder: 'Warehouse Staff',
      wasteType: 'WAITING' as const,
      remarks: 'Core value add'
    },
    {
      stepNumber: 4,
      stepName: 'Quality Check',
      processTime: 15,
      waitingTime: 30,
      valueMeasure: 'VALUE_ADDED' as const,
      stakeholder: 'QA Team',
      wasteType: 'WAITING' as const,
      remarks: 'Essential quality control'
    },
    {
      stepNumber: 5,
      stepName: 'Pack Box',
      processTime: 20,
      waitingTime: 15,
      valueMeasure: 'VALUE_ADDED' as const,
      stakeholder: 'Packing Team',
      wasteType: null,
      remarks: 'Final packaging'
    },
    {
      stepNumber: 6,
      stepName: 'Generate Label',
      processTime: 5,
      waitingTime: 0,
      valueMeasure: 'NON_VALUE_ADDED' as const,
      stakeholder: 'IT Systems',
      wasteType: 'OVER_PROCESSING' as const,
      remarks: 'Could be automated'
    },
    {
      stepNumber: 7,
      stepName: 'Ship Package',
      processTime: 10,
      waitingTime: 480,
      valueMeasure: 'NON_VALUE_ADDED' as const,
      stakeholder: 'Shipping Carrier',
      wasteType: 'WAITING' as const,
      remarks: 'Carrier pickup wait'
    }
  ]

  await prisma.vSMStep.createMany({
    data: vsmSteps.map(step => ({
      processId: process.id,
      ...step
    }))
  })

  // Create Fishbone categories and causes using batch operations
  const categories = ['PEOPLE', 'PROCESS', 'EQUIPMENT', 'MATERIALS', 'ENVIRONMENT', 'MANAGEMENT']

  // First, create all categories in a loop (can't use createMany as we need the IDs)
  const createdCategories: { [key: string]: string } = {}
  for (let i = 0; i < categories.length; i++) {
    const category = await prisma.fishboneCategory.create({
      data: {
        processId: process.id,
        category: categories[i] as any,
        order: i + 1
      }
    })
    createdCategories[categories[i]] = category.id
  }

  // Batch create all causes at once
  const causesData = [
    {
      categoryId: createdCategories['PEOPLE'],
      causeDescription: 'Insufficient training on new system',
      order: 1
    },
    {
      categoryId: createdCategories['PEOPLE'],
      causeDescription: 'High staff turnover',
      order: 2
    },
    {
      categoryId: createdCategories['PROCESS'],
      causeDescription: 'Manual order entry prone to errors',
      order: 1
    }
  ]

  await prisma.fishboneCause.createMany({
    data: causesData
  })

  // Add FMEA entries
  await prisma.fMEAEntry.create({
    data: {
      assignmentId: draftAssignment.id,
      processId: process.id,
      failureMode: 'Wrong items picked',
      effectsOfFailure: 'Customer dissatisfaction, returns, rework',
      severity: 8,
      potentialCauses: 'Poor labeling, similar SKUs stored together',
      occurrence: 6,
      currentControls: 'Random quality checks',
      detection: 3,
      rpn: 144,
      recommendedActions: 'Implement barcode scanning at pick stage'
    }
  })

  await prisma.fMEAEntry.create({
    data: {
      assignmentId: draftAssignment.id,
      processId: process.id,
      failureMode: 'Delayed shipment',
      effectsOfFailure: 'Late delivery, customer complaints',
      severity: 7,
      potentialCauses: 'Inventory stockouts, carrier delays',
      occurrence: 5,
      currentControls: 'Daily shipping reports',
      detection: 4,
      rpn: 140
    }
  })

  // Add recommendations
  await prisma.recommendation.create({
    data: {
      assignmentId: draftAssignment.id,
      recommendationTitle: 'Implement Barcode Scanning System',
      description: 'Deploy handheld scanners at pick and pack stations to verify items',
      expectedImpact: 'Reduce picking errors by 90%, save $50K annually',
      implementationDifficulty: 'MEDIUM',
      estimatedCostSavings: '$50,000/year',
      linkedFMEAIds: [],
      linkedFishboneCauseIds: [],
      status: 'PROPOSED'
    }
  })

  // Create another draft assignment
  const secondDraftAssignment = await prisma.assignment.create({
    data: {
      title: 'Shipping Process Improvement',
      objective: 'Optimize shipping routes and reduce costs by 20%',
      status: 'DRAFT',
      createdById: bpiUser.id
    }
  })

  console.log('📊 Created assignments:', { draftAssignment, secondDraftAssignment })
  console.log('✅ Seed completed successfully')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })