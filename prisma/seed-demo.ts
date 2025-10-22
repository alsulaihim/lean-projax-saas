import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding demo user and assignment...')

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@leanprojax.com' },
    update: {},
    create: {
      email: 'demo@leanprojax.com',
      name: 'Demo User',
      passwordHash: await bcrypt.hash('demo123', 10),
      role: 'BPI_TEAM',
      emailVerified: true,
      isDemo: true,
      subscriptionTier: 'PRO',
      subscriptionStatus: 'ACTIVE',
    },
  })

  console.log('✅ Demo user created:', demoUser.email)

  // Check if demo assignment already exists
  const existingAssignment = await prisma.assignment.findFirst({
    where: {
      createdById: demoUser.id,
      isDemo: true,
    },
  })

  if (existingAssignment) {
    console.log('✅ Demo assignment already exists:', existingAssignment.id)
    return
  }

  // Create demo assignment
  const demoAssignment = await prisma.assignment.create({
    data: {
      title: 'Customer Service Response Time Improvement',
      objective:
        'Reduce average customer service response time from 48 hours to under 24 hours while maintaining quality standards.',
      status: 'COMPLETED',
      isDemo: true,
      createdById: demoUser.id,
      completedAt: new Date(),
    },
  })

  console.log('✅ Demo assignment created:', demoAssignment.id)

  // Create charter
  await prisma.assignmentCharter.create({
    data: {
      assignmentId: demoAssignment.id,
      assignmentName: 'Customer Service Response Time Improvement',
      programSponsor: 'Sarah Johnson - VP of Customer Success',
      processOwner: 'Michael Chen - Director of Customer Support',
      programManagement: 'Emily Rodriguez - Program Manager',
      projectTeam: 'Alex Kim (Data Analyst), Maria Santos (CS Lead), John Park (QA Specialist)',
      strategicAlignment:
        'Aligns with company goal to become industry leader in customer satisfaction by 2026.',
      problemStatement:
        'Current average response time of 48 hours results in customer dissatisfaction scores of 6.2/10 and contributes to 15% monthly churn rate.',
      businessCase:
        'Reducing response time will improve NPS by 20 points, reduce churn by 7%, and increase customer lifetime value by $125K annually.',
      goalMetric: 'Reduce average response time from 48 hours to <24 hours',
      expectedDeliverables:
        'Updated support workflow, automated triage system, staff training materials, performance monitoring dashboard.',
      inScope:
        'Email and chat support channels, tier 1 and tier 2 support teams, support ticket routing system.',
      outOfScope:
        'Phone support (different process), enterprise customer escalations (handled separately), weekend support hours.',
      drivers:
        'Customer complaints about slow responses, competitive pressure (competitors average 18 hours), revenue impact from churn.',
      nonFinancialBenefits:
        'Improved employee morale, better customer relationships, enhanced brand reputation, reduced stress on support team.',
      existingLeverage:
        'Existing CRM system, trained support staff, established knowledge base.',
      futureLeverage:
        'Process improvements can be applied to phone support, model for other operational improvements, case study for sales.',
      risks:
        'Staff burnout from increased pressure, quality degradation if rushed, technology implementation delays.',
      constraints:
        'No additional headcount, must use existing CRM platform, 90-day implementation timeline.',
      assumptions:
        'Current ticket volume remains stable, automation tools integrate smoothly, team adoption of new processes.',
      businessStakeholders:
        'Customer Success Team, Product Team, IT Department, Executive Leadership.',
      scheduleItems: {
        create: [
          {
            milestone: 'Define Phase Complete',
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-01-15'),
            order: 1,
          },
          {
            milestone: 'Measure Phase Complete',
            startDate: new Date('2025-01-16'),
            endDate: new Date('2025-02-15'),
            order: 2,
          },
          {
            milestone: 'Analyze Phase Complete',
            startDate: new Date('2025-02-16'),
            endDate: new Date('2025-03-15'),
            order: 3,
          },
          {
            milestone: 'Implementation & Control',
            startDate: new Date('2025-03-16'),
            endDate: new Date('2025-04-30'),
            order: 4,
          },
        ],
      },
    },
  })

  console.log('✅ Charter created')

  // Create VOC statements
  const vocStatements = await Promise.all([
    prisma.vOCStatement.create({
      data: {
        assignmentId: demoAssignment.id,
        customerSegment: 'Small Business Customers',
        voiceStatement:
          'I need faster responses to my questions so I can make decisions quickly and keep my business running.',
      },
    }),
    prisma.vOCStatement.create({
      data: {
        assignmentId: demoAssignment.id,
        customerSegment: 'Enterprise Customers',
        voiceStatement:
          'When issues arise, delayed responses cost us thousands per hour in downtime. We need immediate acknowledgment and rapid resolution.',
      },
    }),
    prisma.vOCStatement.create({
      data: {
        assignmentId: demoAssignment.id,
        customerSegment: 'Individual Users',
        voiceStatement:
          'I feel ignored when I have to wait days for a response. Even a quick acknowledgment would make me feel valued.',
      },
    }),
  ])

  console.log('✅ VOC statements created')

  // Create CTQ requirements
  await Promise.all([
    prisma.cTQRequirement.create({
      data: {
        assignmentId: demoAssignment.id,
        vocStatementId: vocStatements[0].id,
        ctqDescription: 'Response time for initial contact',
        measurementCriteria: 'Time from ticket creation to first response',
        targetValue: '<24 hours',
      },
    }),
    prisma.cTQRequirement.create({
      data: {
        assignmentId: demoAssignment.id,
        vocStatementId: vocStatements[1].id,
        ctqDescription: 'Acknowledgment speed for critical issues',
        measurementCriteria: 'Time to acknowledge critical priority tickets',
        targetValue: '<2 hours',
      },
    }),
    prisma.cTQRequirement.create({
      data: {
        assignmentId: demoAssignment.id,
        vocStatementId: vocStatements[2].id,
        ctqDescription: 'Customer satisfaction with response time',
        measurementCriteria: 'CSAT score for timeliness question',
        targetValue: '>8/10',
      },
    }),
  ])

  console.log('✅ CTQ requirements created')

  // Create process
  const process = await prisma.process.create({
    data: {
      assignmentId: demoAssignment.id,
      processName: 'Customer Support Ticket Resolution',
      processOwner: 'Michael Chen',
      order: 1,
      lowerSpecLimit: 0,
      upperSpecLimit: 24,
      targetValue: 12,
      sampleMean: 18.5,
      sampleStdDev: 4.2,
    },
  })

  console.log('✅ Process created')

  // Create SIPOC entries
  const sipocData = [
    // Suppliers
    { column: 'SUPPLIER', order: 1, value: 'Customers (via email, chat, web form)' },
    { column: 'SUPPLIER', order: 2, value: 'Internal teams (product, engineering)' },
    { column: 'SUPPLIER', order: 3, value: 'CRM system' },
    // Inputs
    { column: 'INPUT', order: 1, value: 'Support tickets' },
    { column: 'INPUT', order: 2, value: 'Customer information' },
    { column: 'INPUT', order: 3, value: 'Product documentation' },
    { column: 'INPUT', order: 4, value: 'Historical ticket data' },
    // Process
    { column: 'PROCESS', order: 1, value: 'Ticket received and logged' },
    { column: 'PROCESS', order: 2, value: 'Auto-categorization and routing' },
    { column: 'PROCESS', order: 3, value: 'Agent assignment' },
    { column: 'PROCESS', order: 4, value: 'Investigation and research' },
    { column: 'PROCESS', order: 5, value: 'Response drafted' },
    { column: 'PROCESS', order: 6, value: 'Quality review (if needed)' },
    { column: 'PROCESS', order: 7, value: 'Response sent to customer' },
    // Outputs
    { column: 'OUTPUT', order: 1, value: 'Customer response' },
    { column: 'OUTPUT', order: 2, value: 'Resolution documentation' },
    { column: 'OUTPUT', order: 3, value: 'Updated ticket status' },
    { column: 'OUTPUT', order: 4, value: 'Knowledge base articles' },
    // Customers
    { column: 'CUSTOMER', order: 1, value: 'External customers' },
    { column: 'CUSTOMER', order: 2, value: 'Internal teams (for escalations)' },
    { column: 'CUSTOMER', order: 3, value: 'Product team (for feature requests)' },
  ]

  await Promise.all(
    sipocData.map((item) =>
      prisma.sIPOCEntry.create({
        data: {
          processId: process.id,
          column: item.column as 'SUPPLIER' | 'INPUT' | 'PROCESS' | 'OUTPUT' | 'CUSTOMER',
          order: item.order,
          value: item.value,
        },
      })
    )
  )

  console.log('✅ SIPOC entries created')

  // Create second process - Email Response Workflow
  const process2 = await prisma.process.create({
    data: {
      assignmentId: demoAssignment.id,
      processName: 'Email Response Workflow',
      processOwner: 'Sarah Thompson',
      order: 2,
      lowerSpecLimit: 0,
      upperSpecLimit: 48,
      targetValue: 24,
      sampleMean: 32.5,
      sampleStdDev: 6.8,
    },
  })

  // Create SIPOC entries for process 2
  const sipocData2 = [
    // Suppliers
    { column: 'SUPPLIER', order: 1, value: 'Email server' },
    { column: 'SUPPLIER', order: 2, value: 'Customer database' },
    { column: 'SUPPLIER', order: 3, value: 'Templates repository' },
    // Inputs
    { column: 'INPUT', order: 1, value: 'Customer email inquiries' },
    { column: 'INPUT', order: 2, value: 'Customer profile data' },
    { column: 'INPUT', order: 3, value: 'Email templates' },
    { column: 'INPUT', order: 4, value: 'Product information' },
    // Process
    { column: 'PROCESS', order: 1, value: 'Email received in inbox' },
    { column: 'PROCESS', order: 2, value: 'Email parsed and classified' },
    { column: 'PROCESS', order: 3, value: 'Priority assignment' },
    { column: 'PROCESS', order: 4, value: 'Agent receives notification' },
    { column: 'PROCESS', order: 5, value: 'Agent reviews email' },
    { column: 'PROCESS', order: 6, value: 'Response composed using template' },
    { column: 'PROCESS', order: 7, value: 'Response sent and logged' },
    // Outputs
    { column: 'OUTPUT', order: 1, value: 'Email response to customer' },
    { column: 'OUTPUT', order: 2, value: 'Email conversation log' },
    { column: 'OUTPUT', order: 3, value: 'Response time metrics' },
    // Customers
    { column: 'CUSTOMER', order: 1, value: 'Email customers' },
    { column: 'CUSTOMER', order: 2, value: 'Management (for reports)' },
  ]

  await Promise.all(
    sipocData2.map((item) =>
      prisma.sIPOCEntry.create({
        data: {
          processId: process2.id,
          column: item.column as 'SUPPLIER' | 'INPUT' | 'PROCESS' | 'OUTPUT' | 'CUSTOMER',
          order: item.order,
          value: item.value,
        },
      })
    )
  )

  console.log('✅ Process 2 and SIPOC entries created')

  // Create third process - Chat Support Workflow
  const process3 = await prisma.process.create({
    data: {
      assignmentId: demoAssignment.id,
      processName: 'Chat Support Workflow',
      processOwner: 'David Martinez',
      order: 3,
      lowerSpecLimit: 0,
      upperSpecLimit: 5,
      targetValue: 2,
      sampleMean: 3.2,
      sampleStdDev: 1.1,
    },
  })

  // Create SIPOC entries for process 3
  const sipocData3 = [
    // Suppliers
    { column: 'SUPPLIER', order: 1, value: 'Chat platform' },
    { column: 'SUPPLIER', order: 2, value: 'Knowledge base system' },
    { column: 'SUPPLIER', order: 3, value: 'CRM integration' },
    // Inputs
    { column: 'INPUT', order: 1, value: 'Chat requests' },
    { column: 'INPUT', order: 2, value: 'Customer context' },
    { column: 'INPUT', order: 3, value: 'Chat scripts' },
    { column: 'INPUT', order: 4, value: 'Agent availability' },
    // Process
    { column: 'PROCESS', order: 1, value: 'Customer initiates chat' },
    { column: 'PROCESS', order: 2, value: 'Automated greeting sent' },
    { column: 'PROCESS', order: 3, value: 'Queue position assigned' },
    { column: 'PROCESS', order: 4, value: 'Agent accepts chat' },
    { column: 'PROCESS', order: 5, value: 'Issue diagnosed' },
    { column: 'PROCESS', order: 6, value: 'Solution provided' },
    { column: 'PROCESS', order: 7, value: 'Chat closed and rated' },
    // Outputs
    { column: 'OUTPUT', order: 1, value: 'Chat resolution' },
    { column: 'OUTPUT', order: 2, value: 'Chat transcript' },
    { column: 'OUTPUT', order: 3, value: 'Customer satisfaction score' },
    { column: 'OUTPUT', order: 4, value: 'Follow-up actions' },
    // Customers
    { column: 'CUSTOMER', order: 1, value: 'Chat customers' },
    { column: 'CUSTOMER', order: 2, value: 'Quality assurance team' },
  ]

  await Promise.all(
    sipocData3.map((item) =>
      prisma.sIPOCEntry.create({
        data: {
          processId: process3.id,
          column: item.column as 'SUPPLIER' | 'INPUT' | 'PROCESS' | 'OUTPUT' | 'CUSTOMER',
          order: item.order,
          value: item.value,
        },
      })
    )
  )

  console.log('✅ Process 3 and SIPOC entries created')

  // Create VSM steps for process 2 - Email Response Workflow
  const vsmSteps2 = [
    {
      stepNumber: 1,
      stepName: 'Email arrives in inbox',
      processTime: 0.2,
      waitingTime: 0,
      valueMeasure: 'VALUE_ADDED',
      stakeholder: 'Email Server',
      remarks: 'Automatic receipt',
    },
    {
      stepNumber: 2,
      stepName: 'Wait for classification',
      processTime: 0,
      waitingTime: 180,
      valueMeasure: 'NON_VALUE_ADDED',
      wasteType: 'WAITING',
      stakeholder: 'System',
      remarks: 'Average 3 hour wait for AI classification',
    },
    {
      stepNumber: 3,
      stepName: 'Email classification',
      processTime: 3,
      waitingTime: 0,
      valueMeasure: 'ESSENTIAL_NON_VALUE',
      stakeholder: 'AI System',
      remarks: 'Automated categorization',
    },
    {
      stepNumber: 4,
      stepName: 'Priority assignment',
      processTime: 1,
      waitingTime: 0,
      valueMeasure: 'ESSENTIAL_NON_VALUE',
      stakeholder: 'System',
      remarks: 'Based on keywords',
    },
    {
      stepNumber: 5,
      stepName: 'Wait in agent queue',
      processTime: 0,
      waitingTime: 420,
      valueMeasure: 'NON_VALUE_ADDED',
      wasteType: 'WAITING',
      stakeholder: 'System',
      remarks: 'Average 7 hour wait',
    },
    {
      stepNumber: 6,
      stepName: 'Agent reviews email',
      processTime: 8,
      waitingTime: 0,
      valueMeasure: 'VALUE_ADDED',
      stakeholder: 'Support Agent',
      remarks: 'Reading and understanding issue',
    },
    {
      stepNumber: 7,
      stepName: 'Template selection',
      processTime: 5,
      waitingTime: 0,
      valueMeasure: 'ESSENTIAL_NON_VALUE',
      stakeholder: 'Support Agent',
      remarks: 'Finding appropriate template',
    },
    {
      stepNumber: 8,
      stepName: 'Response composition',
      processTime: 12,
      waitingTime: 0,
      valueMeasure: 'VALUE_ADDED',
      stakeholder: 'Support Agent',
      remarks: 'Customizing response',
    },
    {
      stepNumber: 9,
      stepName: 'Send email',
      processTime: 0.5,
      waitingTime: 0,
      valueMeasure: 'VALUE_ADDED',
      stakeholder: 'Support Agent',
      remarks: 'Email sent to customer',
    },
  ]

  await Promise.all(
    vsmSteps2.map((step) =>
      prisma.vSMStep.create({
        data: {
          processId: process2.id,
          stepNumber: step.stepNumber,
          stepName: step.stepName,
          processTime: step.processTime,
          waitingTime: step.waitingTime,
          valueMeasure: step.valueMeasure as 'VALUE_ADDED' | 'ESSENTIAL_NON_VALUE' | 'NON_VALUE_ADDED',
          wasteType: step.wasteType as 'WAITING' | null,
          stakeholder: step.stakeholder,
          remarks: step.remarks,
        },
      })
    )
  )

  console.log('✅ VSM steps for process 2 created')

  // Create VSM steps for process 3 - Chat Support Workflow
  const vsmSteps3 = [
    {
      stepNumber: 1,
      stepName: 'Customer initiates chat',
      processTime: 0.5,
      waitingTime: 0,
      valueMeasure: 'VALUE_ADDED',
      stakeholder: 'Customer',
      remarks: 'Chat request submitted',
    },
    {
      stepNumber: 2,
      stepName: 'Automated greeting',
      processTime: 0.1,
      waitingTime: 0,
      valueMeasure: 'ESSENTIAL_NON_VALUE',
      stakeholder: 'Chat Bot',
      remarks: 'Welcome message',
    },
    {
      stepNumber: 3,
      stepName: 'Wait in queue',
      processTime: 0,
      waitingTime: 45,
      valueMeasure: 'NON_VALUE_ADDED',
      wasteType: 'WAITING',
      stakeholder: 'System',
      remarks: 'Average 45 min wait during peak',
    },
    {
      stepNumber: 4,
      stepName: 'Agent accepts chat',
      processTime: 0.5,
      waitingTime: 0,
      valueMeasure: 'VALUE_ADDED',
      stakeholder: 'Support Agent',
      remarks: 'Agent assigned',
    },
    {
      stepNumber: 5,
      stepName: 'Issue diagnosis',
      processTime: 15,
      waitingTime: 0,
      valueMeasure: 'VALUE_ADDED',
      stakeholder: 'Support Agent',
      remarks: 'Understanding customer need',
    },
    {
      stepNumber: 6,
      stepName: 'Knowledge base lookup',
      processTime: 8,
      waitingTime: 0,
      valueMeasure: 'ESSENTIAL_NON_VALUE',
      stakeholder: 'Support Agent',
      remarks: 'Searching for solution',
    },
    {
      stepNumber: 7,
      stepName: 'Solution provided',
      processTime: 20,
      waitingTime: 0,
      valueMeasure: 'VALUE_ADDED',
      stakeholder: 'Support Agent',
      remarks: 'Guiding customer to resolution',
    },
    {
      stepNumber: 8,
      stepName: 'Chat closed and rated',
      processTime: 2,
      waitingTime: 0,
      valueMeasure: 'ESSENTIAL_NON_VALUE',
      stakeholder: 'Support Agent',
      remarks: 'Closing and collecting feedback',
    },
  ]

  await Promise.all(
    vsmSteps3.map((step) =>
      prisma.vSMStep.create({
        data: {
          processId: process3.id,
          stepNumber: step.stepNumber,
          stepName: step.stepName,
          processTime: step.processTime,
          waitingTime: step.waitingTime,
          valueMeasure: step.valueMeasure as 'VALUE_ADDED' | 'ESSENTIAL_NON_VALUE' | 'NON_VALUE_ADDED',
          wasteType: step.wasteType as 'WAITING' | null,
          stakeholder: step.stakeholder,
          remarks: step.remarks,
        },
      })
    )
  )

  console.log('✅ VSM steps for process 3 created')

  // Create Fishbone analysis for process 2
  const fishboneData2 = [
    {
      category: 'PEOPLE',
      causes: [
        'Inconsistent email response quality',
        'Lack of template training',
        'Agent workload imbalance',
        'Slow typing speed',
      ],
    },
    {
      category: 'PROCESS',
      causes: [
        'Inefficient template selection process',
        'No standardized email format',
        'Manual priority assignment',
        'Delayed classification system',
      ],
    },
    {
      category: 'EQUIPMENT',
      causes: [
        'Slow email client performance',
        'Outdated template repository',
        'Limited AI classification accuracy',
        'Poor search functionality',
      ],
    },
    {
      category: 'MATERIALS',
      causes: [
        'Incomplete email templates',
        'Outdated product information',
        'Missing FAQ responses',
        'No email response guidelines',
      ],
    },
    {
      category: 'ENVIRONMENT',
      causes: [
        'High email volume during peak hours',
        'Frequent email server issues',
        'Interruptions during composition',
        'Poor agent workspace setup',
      ],
    },
    {
      category: 'MANAGEMENT',
      causes: [
        'No email response time SLA',
        'Insufficient performance monitoring',
        'Lack of automation investment',
        'No continuous improvement program',
      ],
    },
  ]

  for (let i = 0; i < fishboneData2.length; i++) {
    const categoryData = fishboneData2[i]
    const category = await prisma.fishboneCategory.create({
      data: {
        processId: process2.id,
        category: categoryData.category as
          | 'PEOPLE'
          | 'PROCESS'
          | 'EQUIPMENT'
          | 'MATERIALS'
          | 'ENVIRONMENT'
          | 'MANAGEMENT',
        order: i + 1,
      },
    })

    await Promise.all(
      categoryData.causes.map((cause, idx) =>
        prisma.fishboneCause.create({
          data: {
            categoryId: category.id,
            causeDescription: cause,
            order: idx + 1,
          },
        })
      )
    )
  }

  console.log('✅ Fishbone diagram for process 2 created')

  // Create Fishbone analysis for process 3
  const fishboneData3 = [
    {
      category: 'PEOPLE',
      causes: [
        'Insufficient chat agents during peak',
        'Inconsistent chat quality',
        'New agent onboarding gaps',
        'Multitasking affecting response time',
      ],
    },
    {
      category: 'PROCESS',
      causes: [
        'No automated chat routing',
        'Inefficient queue management',
        'Lack of standardized chat scripts',
        'Poor handoff procedures',
      ],
    },
    {
      category: 'EQUIPMENT',
      causes: [
        'Chat platform limitations',
        'Slow knowledge base integration',
        'No AI chat assist tools',
        'Limited concurrent chat capacity',
      ],
    },
    {
      category: 'MATERIALS',
      causes: [
        'Inadequate chat scripts library',
        'Missing common issue solutions',
        'No quick response templates',
        'Outdated troubleshooting guides',
      ],
    },
    {
      category: 'ENVIRONMENT',
      causes: [
        'Unpredictable chat volume spikes',
        'Network connectivity issues',
        'Noisy work environment',
        'High-pressure peak periods',
      ],
    },
    {
      category: 'MANAGEMENT',
      causes: [
        'No real-time queue monitoring',
        'Unclear chat response SLA',
        'Limited agent empowerment',
        'Insufficient technology investment',
      ],
    },
  ]

  for (let i = 0; i < fishboneData3.length; i++) {
    const categoryData = fishboneData3[i]
    const category = await prisma.fishboneCategory.create({
      data: {
        processId: process3.id,
        category: categoryData.category as
          | 'PEOPLE'
          | 'PROCESS'
          | 'EQUIPMENT'
          | 'MATERIALS'
          | 'ENVIRONMENT'
          | 'MANAGEMENT',
        order: i + 1,
      },
    })

    await Promise.all(
      categoryData.causes.map((cause, idx) =>
        prisma.fishboneCause.create({
          data: {
            categoryId: category.id,
            causeDescription: cause,
            order: idx + 1,
          },
        })
      )
    )
  }

  console.log('✅ Fishbone diagram for process 3 created')

  // Create VSM steps
  const vsmSteps = [
    {
      stepNumber: 1,
      stepName: 'Ticket received',
      processTime: 0.5,
      waitingTime: 0,
      valueMeasure: 'VALUE_ADDED',
      stakeholder: 'Customer',
      remarks: 'Automatic logging',
    },
    {
      stepNumber: 2,
      stepName: 'Wait in queue',
      processTime: 0,
      waitingTime: 720,
      valueMeasure: 'NON_VALUE_ADDED',
      wasteType: 'WAITING',
      stakeholder: 'System',
      remarks: 'Average 12 hour wait',
    },
    {
      stepNumber: 3,
      stepName: 'Manual categorization',
      processTime: 5,
      waitingTime: 0,
      valueMeasure: 'ESSENTIAL_NON_VALUE',
      stakeholder: 'Support Agent',
      remarks: 'Could be automated',
    },
    {
      stepNumber: 4,
      stepName: 'Assignment to agent',
      processTime: 2,
      waitingTime: 180,
      valueMeasure: 'ESSENTIAL_NON_VALUE',
      stakeholder: 'Team Lead',
      remarks: 'Manual assignment',
    },
    {
      stepNumber: 5,
      stepName: 'Research issue',
      processTime: 15,
      waitingTime: 0,
      valueMeasure: 'VALUE_ADDED',
      stakeholder: 'Support Agent',
      remarks: 'Knowledge base lookup',
    },
    {
      stepNumber: 6,
      stepName: 'Draft response',
      processTime: 10,
      waitingTime: 0,
      valueMeasure: 'VALUE_ADDED',
      stakeholder: 'Support Agent',
      remarks: 'Writing customer response',
    },
    {
      stepNumber: 7,
      stepName: 'Wait for review',
      processTime: 0,
      waitingTime: 240,
      valueMeasure: 'NON_VALUE_ADDED',
      wasteType: 'WAITING',
      stakeholder: 'System',
      remarks: 'Only for complex tickets',
    },
    {
      stepNumber: 8,
      stepName: 'Quality review',
      processTime: 8,
      waitingTime: 0,
      valueMeasure: 'ESSENTIAL_NON_VALUE',
      stakeholder: 'QA Specialist',
      remarks: 'Not all tickets need this',
    },
    {
      stepNumber: 9,
      stepName: 'Send response',
      processTime: 1,
      waitingTime: 0,
      valueMeasure: 'VALUE_ADDED',
      stakeholder: 'Support Agent',
      remarks: 'Email sent to customer',
    },
  ]

  await Promise.all(
    vsmSteps.map((step) =>
      prisma.vSMStep.create({
        data: {
          processId: process.id,
          stepNumber: step.stepNumber,
          stepName: step.stepName,
          processTime: step.processTime,
          waitingTime: step.waitingTime,
          valueMeasure: step.valueMeasure as 'VALUE_ADDED' | 'ESSENTIAL_NON_VALUE' | 'NON_VALUE_ADDED',
          wasteType: step.wasteType as 'WAITING' | null,
          stakeholder: step.stakeholder,
          remarks: step.remarks,
        },
      })
    )
  )

  console.log('✅ VSM steps created')

  // Create Fishbone categories and causes
  const fishboneData = [
    {
      category: 'PEOPLE',
      causes: [
        'Insufficient staff during peak hours',
        'Lack of training on new products',
        'High turnover rate among support agents',
        'Inconsistent response quality',
      ],
    },
    {
      category: 'PROCESS',
      causes: [
        'Manual ticket categorization',
        'No automated routing system',
        'Unnecessary QA review for simple tickets',
        'Unclear escalation procedures',
      ],
    },
    {
      category: 'EQUIPMENT',
      causes: [
        'Slow CRM system performance',
        'Outdated knowledge base search',
        'Limited integration between tools',
        'No mobile access for agents',
      ],
    },
    {
      category: 'MATERIALS',
      causes: [
        'Incomplete documentation',
        'Outdated response templates',
        'Missing product FAQs',
        'No standardized troubleshooting guides',
      ],
    },
    {
      category: 'ENVIRONMENT',
      causes: [
        'Distracting office layout',
        'Frequent system outages',
        'Competing priorities from management',
        'High-stress work environment',
      ],
    },
    {
      category: 'MANAGEMENT',
      causes: [
        'No clear SLA targets',
        'Insufficient monitoring of metrics',
        'Lack of process improvement initiatives',
        'Reactive rather than proactive approach',
      ],
    },
  ]

  for (let i = 0; i < fishboneData.length; i++) {
    const categoryData = fishboneData[i]
    const category = await prisma.fishboneCategory.create({
      data: {
        processId: process.id,
        category: categoryData.category as
          | 'PEOPLE'
          | 'PROCESS'
          | 'EQUIPMENT'
          | 'MATERIALS'
          | 'ENVIRONMENT'
          | 'MANAGEMENT',
        order: i + 1,
      },
    })

    await Promise.all(
      categoryData.causes.map((cause, idx) =>
        prisma.fishboneCause.create({
          data: {
            categoryId: category.id,
            causeDescription: cause,
            order: idx + 1,
          },
        })
      )
    )
  }

  console.log('✅ Fishbone diagram created')

  // Create FMEA entries
  const fmeaEntries = [
    {
      failureMode: 'Ticket sits in queue unassigned',
      effectsOfFailure: 'Customer receives no response, leading to escalation and churn',
      severity: 9,
      potentialCauses: 'No automatic routing, manual assignment bottleneck',
      occurrence: 7,
      currentControls: 'Team lead manually monitors queue',
      detection: 6,
      rpn: 378,
      recommendedActions:
        'Implement automatic ticket routing based on category and agent availability',
    },
    {
      failureMode: 'Agent lacks knowledge to respond',
      effectsOfFailure: 'Delayed response while researching, potential incorrect information',
      severity: 6,
      potentialCauses: 'Insufficient training, outdated documentation',
      occurrence: 5,
      currentControls: 'QA review process, peer consultation',
      detection: 4,
      rpn: 120,
      recommendedActions: 'Implement comprehensive training program and update knowledge base',
    },
    {
      failureMode: 'CRM system slow or crashes',
      effectsOfFailure: 'Agents cannot access tickets or customer information',
      severity: 8,
      potentialCauses: 'System overload, outdated infrastructure',
      occurrence: 4,
      currentControls: 'IT monitoring, backup system',
      detection: 3,
      rpn: 96,
      recommendedActions: 'Upgrade infrastructure, implement load balancing',
    },
    {
      failureMode: 'Complex tickets go through unnecessary QA',
      effectsOfFailure: 'Simple tickets delayed by review process',
      severity: 4,
      potentialCauses: 'All tickets flagged for review regardless of complexity',
      occurrence: 8,
      currentControls: 'None - all tickets reviewed',
      detection: 2,
      rpn: 64,
      recommendedActions: 'Implement complexity-based routing, QA sampling instead of 100%',
    },
    {
      failureMode: 'Agent unavailable during peak hours',
      effectsOfFailure: 'Tickets accumulate, wait time increases',
      severity: 7,
      potentialCauses: 'Insufficient staffing, poor shift scheduling',
      occurrence: 6,
      currentControls: 'Overtime shifts, cross-training',
      detection: 5,
      rpn: 210,
      recommendedActions: 'Analyze ticket volume patterns and optimize shift schedules',
    },
  ]

  await Promise.all(
    fmeaEntries.map((entry) =>
      prisma.fMEAEntry.create({
        data: {
          assignmentId: demoAssignment.id,
          processId: process.id,
          failureMode: entry.failureMode,
          effectsOfFailure: entry.effectsOfFailure,
          severity: entry.severity,
          potentialCauses: entry.potentialCauses,
          occurrence: entry.occurrence,
          currentControls: entry.currentControls,
          detection: entry.detection,
          rpn: entry.rpn,
          recommendedActions: entry.recommendedActions,
        },
      })
    )
  )

  console.log('✅ FMEA entries created')

  // Create recommendations
  await Promise.all([
    prisma.recommendation.create({
      data: {
        assignmentId: demoAssignment.id,
        recommendationTitle: 'Implement AI-Powered Ticket Routing',
        description:
          'Deploy machine learning system to automatically categorize and route tickets to the most appropriate agent based on expertise, availability, and historical performance.',
        expectedImpact:
          'Reduce assignment time from 182 minutes to <5 minutes, eliminate manual categorization errors, optimize agent workload distribution.',
        implementationDifficulty: 'MEDIUM',
        estimatedCostSavings: '$45,000 annually in reduced labor hours',
        linkedFMEAIds: [],
        linkedFishboneCauseIds: [],
        status: 'APPROVED',
      },
    }),
    prisma.recommendation.create({
      data: {
        assignmentId: demoAssignment.id,
        recommendationTitle: 'Eliminate QA Review for Simple Tickets',
        description:
          'Implement complexity-based routing where simple tickets bypass QA review, while complex tickets receive thorough review. Use AI to classify ticket complexity.',
        expectedImpact:
          'Reduce average response time by 4 hours for 60% of tickets, free up QA specialist for training and improvement initiatives.',
        implementationDifficulty: 'LOW',
        estimatedCostSavings: '$28,000 annually in productivity gains',
        linkedFMEAIds: [],
        linkedFishboneCauseIds: [],
        status: 'APPROVED',
      },
    }),
    prisma.recommendation.create({
      data: {
        assignmentId: demoAssignment.id,
        recommendationTitle: 'Optimize Shift Schedules Based on Data',
        description:
          'Analyze 6 months of ticket volume data to identify peak periods and adjust shift schedules to ensure adequate coverage during high-demand times.',
        expectedImpact:
          'Reduce queue wait time by 40%, improve agent utilization rate from 65% to 85%, reduce overtime costs.',
        implementationDifficulty: 'LOW',
        estimatedCostSavings: '$22,000 annually in reduced overtime',
        linkedFMEAIds: [],
        linkedFishboneCauseIds: [],
        status: 'IMPLEMENTED',
      },
    }),
    prisma.recommendation.create({
      data: {
        assignmentId: demoAssignment.id,
        recommendationTitle: 'Upgrade CRM Infrastructure',
        description:
          'Migrate to cloud-based CRM with improved performance, better search capabilities, and mobile access for agents working remotely or during peak coverage.',
        expectedImpact:
          'Reduce system lag from 3-5 seconds to <1 second, enable mobile support, improve knowledge base search accuracy by 60%.',
        implementationDifficulty: 'HIGH',
        estimatedCostSavings: '$35,000 annually in improved productivity',
        linkedFMEAIds: [],
        linkedFishboneCauseIds: [],
        status: 'PROPOSED',
      },
    }),
  ])

  console.log('✅ Recommendations created')

  console.log('🎉 Demo data seeding complete!')
}

main()
  .catch((e) => {
    console.error('Error seeding demo data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
