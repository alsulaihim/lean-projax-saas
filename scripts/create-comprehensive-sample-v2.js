// Usage: DATABASE_URL="postgresql://user:password@localhost:5432/dbname" node scripts/create-comprehensive-sample-v2.js
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

async function createComprehensiveSample() {
  try {
    console.log('🚀 Starting creation of comprehensive sample assignment...')

    // First, ensure we have a user
    let user = await prisma.user.findFirst({
      where: { email: 'analyst@example.com' },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: 'user-analyst-1',
          email: 'analyst@example.com',
          name: 'John Analyst',
          password: 'hashed_password',
          role: 'BPI_TEAM',
        },
      })
      console.log('✅ Created user')
    }

    // Create unique assignment ID with timestamp to avoid duplicates
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const assignmentId = `sample-${timestamp}`

    const assignment = await prisma.assignment.create({
      data: {
        id: assignmentId,
        title: `Manufacturing Excellence Initiative - ${new Date().toLocaleDateString()}`,
        objective:
          'Reduce overall manufacturing defect rate by 50%, improve cycle time by 30%, and increase customer satisfaction to 95%',
        status: 'COMPLETED',
        createdById: user.id,
        completedAt: new Date(),
      },
    })
    console.log('✅ Created assignment:', assignment.title)

    // Create VOC statements with CTQ requirements
    const vocData = [
      {
        voiceStatement: 'Products must be delivered on time without any defects',
        customerSegment: 'Enterprise Customers',
        ctqs: [
          {
            ctqDescription: 'On-time delivery rate >= 98%',
            measurementCriteria: 'Percentage of orders delivered on promised date',
            targetValue: '98%',
          },
          {
            ctqDescription: 'Zero critical defects in delivered products',
            measurementCriteria: 'Number of critical defects per 1000 units',
            targetValue: '0 defects/1000 units',
          },
        ],
      },
      {
        voiceStatement: 'Need faster response times for customer inquiries and complaints',
        customerSegment: 'All Customers',
        ctqs: [
          {
            ctqDescription: 'Initial response within 2 hours',
            measurementCriteria: 'Average first response time',
            targetValue: '2 hours',
          },
          {
            ctqDescription: 'Complete resolution within 24 hours',
            measurementCriteria: 'Average resolution time',
            targetValue: '24 hours',
          },
        ],
      },
      {
        voiceStatement: 'Products should be competitively priced without compromising quality',
        customerSegment: 'Price-Sensitive Customers',
        ctqs: [
          {
            ctqDescription: 'Production cost reduction of 15%',
            measurementCriteria: 'Cost per unit manufactured',
            targetValue: '85% of baseline',
          },
          {
            ctqDescription: 'Maintain quality score above 4.5/5',
            measurementCriteria: 'Customer quality rating',
            targetValue: '4.5/5.0',
          },
        ],
      },
    ]

    for (const voc of vocData) {
      const vocStatement = await prisma.vOCStatement.create({
        data: {
          assignmentId,
          voiceStatement: voc.voiceStatement,
          customerSegment: voc.customerSegment,
        },
      })

      for (const ctq of voc.ctqs) {
        await prisma.cTQRequirement.create({
          data: {
            assignmentId,
            vocStatementId: vocStatement.id,
            ctqDescription: ctq.ctqDescription,
            measurementCriteria: ctq.measurementCriteria,
            targetValue: ctq.targetValue,
          },
        })
      }
    }
    console.log('✅ Created VOC statements and CTQ requirements')

    // Create multiple processes with UNIQUE data for each
    const processesData = [
      {
        name: 'Order Fulfillment Process',
        owner: 'Operations Manager',
        sipocRows: [
          {
            supplier: 'Sales Team',
            input: 'Customer Orders',
            process: 'Order Verification',
            output: 'Validated Orders',
            customer: 'Planning Department',
          },
          {
            supplier: 'Planning Department',
            input: 'Production Schedule',
            process: 'Inventory Check',
            output: 'Stock Availability Report',
            customer: 'Warehouse Team',
          },
          {
            supplier: 'Warehouse Team',
            input: 'Pick Lists',
            process: 'Order Picking',
            output: 'Packed Orders',
            customer: 'Shipping Department',
          },
          {
            supplier: 'Shipping Department',
            input: 'Shipping Labels',
            process: 'Order Dispatch',
            output: 'Tracking Information',
            customer: 'End Customer',
          },
          {
            supplier: 'Customer Service',
            input: 'Delivery Feedback',
            process: 'Order Completion',
            output: 'Order Status Update',
            customer: 'Management Reports',
          },
        ],
        vsmSteps: [
          {
            stepName: 'Order Receipt',
            processTime: 10,
            waitingTime: 30,
            valueMeasure: 'NON_VALUE_ADDED',
            stakeholder: 'Sales',
            wasteType: 'WAITING',
          },
          {
            stepName: 'Credit Check',
            processTime: 15,
            waitingTime: 60,
            valueMeasure: 'ESSENTIAL_NON_VALUE',
            stakeholder: 'Finance',
            wasteType: 'WAITING',
          },
          {
            stepName: 'Inventory Allocation',
            processTime: 20,
            waitingTime: 45,
            valueMeasure: 'VALUE_ADDED',
            stakeholder: 'Warehouse',
            wasteType: null,
          },
          {
            stepName: 'Pick & Pack',
            processTime: 45,
            waitingTime: 30,
            valueMeasure: 'VALUE_ADDED',
            stakeholder: 'Warehouse',
            wasteType: null,
          },
          {
            stepName: 'Quality Check',
            processTime: 15,
            waitingTime: 20,
            valueMeasure: 'ESSENTIAL_NON_VALUE',
            stakeholder: 'QA',
            wasteType: 'OVER_PROCESSING',
          },
          {
            stepName: 'Shipping Prep',
            processTime: 25,
            waitingTime: 60,
            valueMeasure: 'NON_VALUE_ADDED',
            stakeholder: 'Shipping',
            wasteType: 'MOTION',
          },
          {
            stepName: 'Dispatch',
            processTime: 10,
            waitingTime: 120,
            valueMeasure: 'VALUE_ADDED',
            stakeholder: 'Logistics',
            wasteType: 'TRANSPORT',
          },
        ],
      },
      {
        name: 'Manufacturing Assembly Line',
        owner: 'Production Manager',
        sipocRows: [
          {
            supplier: 'Raw Material Suppliers',
            input: 'Steel, Aluminum, Plastics',
            process: 'Material Preparation',
            output: 'Prepared Components',
            customer: 'Assembly Line',
          },
          {
            supplier: 'Component Suppliers',
            input: 'Electronic Components',
            process: 'Component Assembly',
            output: 'Sub-assemblies',
            customer: 'Main Assembly',
          },
          {
            supplier: 'Assembly Workers',
            input: 'Sub-assemblies',
            process: 'Final Assembly',
            output: 'Completed Products',
            customer: 'Testing Station',
          },
          {
            supplier: 'Quality Control',
            input: 'Test Equipment',
            process: 'Product Testing',
            output: 'Tested Products',
            customer: 'Packaging Line',
          },
          {
            supplier: 'Packaging Team',
            input: 'Packaging Materials',
            process: 'Product Packaging',
            output: 'Packaged Products',
            customer: 'Finished Goods Warehouse',
          },
        ],
        vsmSteps: [
          {
            stepName: 'Material Staging',
            processTime: 30,
            waitingTime: 90,
            valueMeasure: 'NON_VALUE_ADDED',
            stakeholder: 'Materials',
            wasteType: 'INVENTORY',
          },
          {
            stepName: 'Component Prep',
            processTime: 45,
            waitingTime: 20,
            valueMeasure: 'VALUE_ADDED',
            stakeholder: 'Production',
            wasteType: null,
          },
          {
            stepName: 'Assembly Station 1',
            processTime: 60,
            waitingTime: 15,
            valueMeasure: 'VALUE_ADDED',
            stakeholder: 'Assembly',
            wasteType: null,
          },
          {
            stepName: 'Assembly Station 2',
            processTime: 75,
            waitingTime: 20,
            valueMeasure: 'VALUE_ADDED',
            stakeholder: 'Assembly',
            wasteType: null,
          },
          {
            stepName: 'Assembly Station 3',
            processTime: 55,
            waitingTime: 25,
            valueMeasure: 'VALUE_ADDED',
            stakeholder: 'Assembly',
            wasteType: null,
          },
          {
            stepName: 'Final Assembly',
            processTime: 40,
            waitingTime: 30,
            valueMeasure: 'VALUE_ADDED',
            stakeholder: 'Assembly',
            wasteType: null,
          },
          {
            stepName: 'Testing & Inspection',
            processTime: 35,
            waitingTime: 45,
            valueMeasure: 'ESSENTIAL_NON_VALUE',
            stakeholder: 'Quality',
            wasteType: 'WAITING',
          },
        ],
      },
      {
        name: 'Quality Control Process',
        owner: 'Quality Manager',
        sipocRows: [
          {
            supplier: 'Production Line',
            input: 'Finished Products',
            process: 'Initial Inspection',
            output: 'Inspection Report',
            customer: 'QC Database',
          },
          {
            supplier: 'Test Equipment',
            input: 'Calibrated Instruments',
            process: 'Performance Testing',
            output: 'Test Results',
            customer: 'Quality Records',
          },
          {
            supplier: 'QC Engineers',
            input: 'Quality Standards',
            process: 'Compliance Verification',
            output: 'Compliance Certificate',
            customer: 'Shipping Approval',
          },
          {
            supplier: 'Customer Feedback',
            input: 'Return/Complaint Data',
            process: 'Root Cause Analysis',
            output: 'Improvement Actions',
            customer: 'Production Team',
          },
          {
            supplier: 'Quality Team',
            input: 'Quality Metrics',
            process: 'Quality Reporting',
            output: 'Quality Dashboard',
            customer: 'Management',
          },
        ],
        vsmSteps: [
          {
            stepName: 'Sample Collection',
            processTime: 15,
            waitingTime: 30,
            valueMeasure: 'ESSENTIAL_NON_VALUE',
            stakeholder: 'QC',
            wasteType: 'MOTION',
          },
          {
            stepName: 'Visual Inspection',
            processTime: 20,
            waitingTime: 10,
            valueMeasure: 'VALUE_ADDED',
            stakeholder: 'Inspector',
            wasteType: null,
          },
          {
            stepName: 'Dimensional Check',
            processTime: 25,
            waitingTime: 15,
            valueMeasure: 'VALUE_ADDED',
            stakeholder: 'QC Tech',
            wasteType: null,
          },
          {
            stepName: 'Functional Testing',
            processTime: 40,
            waitingTime: 20,
            valueMeasure: 'VALUE_ADDED',
            stakeholder: 'Test Engineer',
            wasteType: null,
          },
          {
            stepName: 'Documentation',
            processTime: 15,
            waitingTime: 30,
            valueMeasure: 'ESSENTIAL_NON_VALUE',
            stakeholder: 'QC Admin',
            wasteType: 'OVER_PROCESSING',
          },
          {
            stepName: 'Approval Process',
            processTime: 10,
            waitingTime: 60,
            valueMeasure: 'NON_VALUE_ADDED',
            stakeholder: 'QC Manager',
            wasteType: 'WAITING',
          },
          {
            stepName: 'Release to Ship',
            processTime: 5,
            waitingTime: 45,
            valueMeasure: 'NON_VALUE_ADDED',
            stakeholder: 'Shipping',
            wasteType: 'WAITING',
          },
        ],
      },
    ]

    // Track created processes and their IDs for Pareto data
    const createdProcesses = []

    for (let i = 0; i < processesData.length; i++) {
      const processData = processesData[i]
      const process = await prisma.process.create({
        data: {
          assignmentId,
          processName: processData.name,
          processOwner: processData.owner,
          order: i + 1,
          // Add process capability limits for calculations
          lowerSpecLimit: 9.5,
          upperSpecLimit: 10.5,
          targetValue: 10.0,
          sampleMean: 10.02,
          sampleStdDev: 0.15,
        },
      })

      createdProcesses.push(process)

      // Create SIPOC entries (unique for each process)
      for (let j = 0; j < processData.sipocRows.length; j++) {
        const row = processData.sipocRows[j]
        await prisma.sipocEntry.create({
          data: {
            processId: process.id,
            category: 'SUPPLIER',
            item: row.supplier,
            description: `Supplier for ${processData.name} - Row ${j + 1}`,
          },
        })
        await prisma.sipocEntry.create({
          data: {
            processId: process.id,
            category: 'INPUT',
            item: row.input,
            description: `Input materials/data for ${processData.name}`,
          },
        })
        await prisma.sipocEntry.create({
          data: {
            processId: process.id,
            category: 'PROCESS',
            item: row.process,
            description: `Core process step in ${processData.name}`,
          },
        })
        await prisma.sipocEntry.create({
          data: {
            processId: process.id,
            category: 'OUTPUT',
            item: row.output,
            description: `Output from ${processData.name} process`,
          },
        })
        await prisma.sipocEntry.create({
          data: {
            processId: process.id,
            category: 'CUSTOMER',
            item: row.customer,
            description: `End recipient of ${processData.name} output`,
          },
        })
      }

      // Create VSM steps (unique for each process)
      for (let j = 0; j < processData.vsmSteps.length; j++) {
        const step = processData.vsmSteps[j]
        await prisma.vSMStep.create({
          data: {
            ...step,
            processId: process.id,
            stepNumber: j + 1,
            remarks: step.wasteType
              ? `Waste type identified: ${step.wasteType}`
              : 'Value-adding step',
          },
        })
      }

      // Create Fishbone categories and causes
      const fishboneCategories = [
        {
          category: 'PEOPLE',
          causes: [
            `Insufficient training for ${processData.name}`,
            `High turnover in ${processData.owner} team`,
            `Skill gaps in critical ${processData.name} areas`,
          ],
        },
        {
          category: 'PROCESS',
          causes: [
            `Outdated procedures in ${processData.name}`,
            `Inconsistent methods across shifts`,
            `No standardization in ${processData.name}`,
          ],
        },
        {
          category: 'EQUIPMENT',
          causes: [
            `Equipment failures in ${processData.name}`,
            `Aging machinery affecting output`,
            `Lack of preventive maintenance`,
          ],
        },
        {
          category: 'MATERIALS',
          causes: [
            `Material quality issues for ${processData.name}`,
            `Supply chain disruptions`,
            `Incorrect specifications`,
          ],
        },
        {
          category: 'MANAGEMENT',
          causes: [
            `Unclear KPIs for ${processData.name}`,
            `Resource allocation issues`,
            `Poor communication channels`,
          ],
        },
        {
          category: 'ENVIRONMENT',
          causes: [
            `Temperature control issues`,
            `Workspace layout inefficiencies`,
            `Safety hazards in ${processData.name} area`,
          ],
        },
      ]

      for (let k = 0; k < fishboneCategories.length; k++) {
        const categoryData = fishboneCategories[k]
        const category = await prisma.fishboneCategory.create({
          data: {
            processId: process.id,
            category: categoryData.category,
            order: k + 1,
          },
        })

        for (let l = 0; l < categoryData.causes.length; l++) {
          await prisma.fishboneCause.create({
            data: {
              categoryId: category.id,
              causeDescription: categoryData.causes[l],
              order: l + 1,
            },
          })
        }
      }

      // Create FMEA entries (unique per process)
      const fmeaData = [
        {
          failureMode: `Critical failure in ${processData.name}`,
          failureEffect: 'Complete process stoppage, customer impact',
          severity: 9,
          failureCause: `System breakdown in ${processData.name}`,
          occurrence: 3,
          currentControls: 'Manual monitoring',
          detection: 7,
        },
        {
          failureMode: `Quality defect in ${processData.name}`,
          failureEffect: 'Product returns, customer dissatisfaction',
          severity: 8,
          failureCause: 'Process variation',
          occurrence: 5,
          currentControls: 'Sampling inspection',
          detection: 6,
        },
        {
          failureMode: `Delay in ${processData.name}`,
          failureEffect: 'Missed delivery deadlines',
          severity: 7,
          failureCause: 'Resource unavailability',
          occurrence: 4,
          currentControls: 'Schedule monitoring',
          detection: 5,
        },
        {
          failureMode: `Documentation error in ${processData.name}`,
          failureEffect: 'Compliance issues',
          severity: 6,
          failureCause: 'Human error',
          occurrence: 6,
          currentControls: 'Manual review',
          detection: 4,
        },
        {
          failureMode: `Communication breakdown in ${processData.name}`,
          failureEffect: 'Misaligned activities',
          severity: 5,
          failureCause: 'System gaps',
          occurrence: 7,
          currentControls: 'Email notifications',
          detection: 3,
        },
      ]

      for (const fmea of fmeaData) {
        await prisma.fMEAEntry.create({
          data: {
            assignmentId,
            processId: process.id,
            failureMode: fmea.failureMode,
            effectsOfFailure: fmea.failureEffect,
            severity: fmea.severity,
            potentialCauses: fmea.failureCause,
            occurrence: fmea.occurrence,
            currentControls: fmea.currentControls,
            detection: fmea.detection,
            rpn: fmea.severity * fmea.occurrence * fmea.detection,
            recommendedActions: `Implement automated monitoring for ${processData.name}`,
          },
        })
      }
    }

    console.log('✅ Created processes with SIPOC, VSM, Fishbone, and FMEA data')

    // Create Recommendations
    const recommendations = [
      {
        recommendationTitle: 'Implement Automated Quality Inspection System',
        description:
          'Deploy computer vision-based inspection system to achieve 100% quality checking',
        expectedImpact: 'Reduce defect rate by 80%, eliminate manual inspection labor',
        implementationDifficulty: 'MEDIUM',
        estimatedCostSavings: '$250,000 annually',
      },
      {
        recommendationTitle: 'Upgrade Manufacturing Equipment',
        description: 'Replace aging machinery with modern CNC equipment for better precision',
        expectedImpact: 'Improve precision by 50%, reduce cycle time by 30%',
        implementationDifficulty: 'HIGH',
        estimatedCostSavings: '$500,000 annually',
      },
      {
        recommendationTitle: 'Implement Enterprise Resource Planning (ERP) System',
        description: 'Centralized system for order management, inventory, and production planning',
        expectedImpact: 'Streamline operations, reduce order processing time by 60%',
        implementationDifficulty: 'HIGH',
        estimatedCostSavings: '$350,000 annually',
      },
      {
        recommendationTitle: 'Establish Supplier Quality Program',
        description: 'Implement supplier certification and regular quality audits',
        expectedImpact: 'Reduce material defects by 70%, improve supply reliability',
        implementationDifficulty: 'LOW',
        estimatedCostSavings: '$150,000 annually',
      },
      {
        recommendationTitle: 'Create Comprehensive Training Program',
        description: 'Develop structured training for all operators with certification',
        expectedImpact: 'Reduce human errors by 60%, improve productivity by 25%',
        implementationDifficulty: 'MEDIUM',
        estimatedCostSavings: '$100,000 annually',
      },
    ]

    for (const rec of recommendations) {
      await prisma.recommendation.create({
        data: {
          ...rec,
          assignmentId,
          linkedFMEAIds: [],
          linkedFishboneCauseIds: [],
        },
      })
    }

    console.log('✅ Created recommendations')

    // Create audit log entries
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        assignmentId,
        action: 'CREATED',
        entityType: 'Assignment',
        entityId: assignmentId,
        changeDetails: { status: 'Assignment created with comprehensive data' },
        timestamp: new Date(),
      },
    })

    console.log('✅ Created audit log')

    // Calculate VSM metrics for display
    console.log('\n📊 VSM CALCULATIONS:')
    for (const processData of processesData) {
      const steps = processData.vsmSteps
      const totalProcessTime = steps.reduce((sum, step) => sum + step.processTime, 0)
      const totalWaitingTime = steps.reduce((sum, step) => sum + step.waitingTime, 0)
      const totalCycleTime = totalProcessTime + totalWaitingTime
      const valueAddedTime = steps
        .filter(s => s.valueMeasure === 'VALUE_ADDED')
        .reduce((sum, step) => sum + step.processTime, 0)
      const efficiency = ((valueAddedTime / totalCycleTime) * 100).toFixed(1)

      console.log(`\n${processData.name}:`)
      console.log(`  Total Process Time: ${totalProcessTime} minutes`)
      console.log(`  Total Waiting Time: ${totalWaitingTime} minutes`)
      console.log(`  Total Cycle Time: ${totalCycleTime} minutes`)
      console.log(`  Value-Added Time: ${valueAddedTime} minutes`)
      console.log(`  Process Efficiency: ${efficiency}%`)
    }

    console.log('\n' + '='.repeat(60))
    console.log('✨ SUCCESS! Comprehensive sample assignment created')
    console.log('='.repeat(60))
    console.log(`Assignment ID: ${assignmentId}`)
    console.log(`Title: ${assignment.title}`)
    console.log('\n📈 Data Summary:')
    console.log('- 3 VOC statements with 6 CTQ requirements')
    console.log('- 3 unique processes with different SIPOC and VSM data')
    console.log('- 21 VSM steps per process (with calculations)')
    console.log('- 15 FMEA entries with RPN calculations')
    console.log('- 5 improvement recommendations')
    console.log('\n🔗 View Options:')
    console.log(`Main Assignment: http://localhost:3020/assignments/${assignmentId}`)
    console.log(`Summary Dashboard: http://localhost:3020/assignments/${assignmentId}/summary`)
    console.log('='.repeat(60))
  } catch (error) {
    console.error('❌ Error creating sample assignment:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createComprehensiveSample()
