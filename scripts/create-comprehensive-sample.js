const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createComprehensiveSample() {
  try {
    console.log('🚀 Starting creation of comprehensive sample assignment...')

    // First, ensure we have a user
    let user = await prisma.user.findFirst({
      where: { email: 'analyst@example.com' }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: 'user-analyst-1',
          email: 'analyst@example.com',
          name: 'John Analyst',
          password: 'hashed_password',
          role: 'BPI_TEAM'
        }
      })
      console.log('✅ Created user')
    }

    // Create the main assignment
    const assignmentId = 'comprehensive-sample-' + Date.now()
    const assignment = await prisma.assignment.create({
      data: {
        id: assignmentId,
        title: 'Manufacturing Excellence Initiative - Multi-Process Optimization',
        objective: 'Reduce overall manufacturing defect rate by 50%, improve cycle time by 30%, and increase customer satisfaction to 95%',
        status: 'COMPLETED',
        createdById: user.id,
        completedAt: new Date()
      }
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
            targetValue: '98%'
          },
          {
            ctqDescription: 'Zero critical defects in delivered products',
            measurementCriteria: 'Number of critical defects per 1000 units',
            targetValue: '0 defects/1000 units'
          }
        ]
      },
      {
        voiceStatement: 'Need faster response times for customer inquiries and complaints',
        customerSegment: 'All Customers',
        ctqs: [
          {
            ctqDescription: 'Initial response within 2 hours',
            measurementCriteria: 'Average first response time',
            targetValue: '2 hours'
          },
          {
            ctqDescription: 'Complete resolution within 24 hours',
            measurementCriteria: 'Average resolution time',
            targetValue: '24 hours'
          }
        ]
      },
      {
        voiceStatement: 'Products should be competitively priced without compromising quality',
        customerSegment: 'Price-Sensitive Customers',
        ctqs: [
          {
            ctqDescription: 'Production cost reduction of 15%',
            measurementCriteria: 'Cost per unit manufactured',
            targetValue: '85% of baseline'
          },
          {
            ctqDescription: 'Maintain quality score above 4.5/5',
            measurementCriteria: 'Customer quality rating',
            targetValue: '4.5/5.0'
          }
        ]
      }
    ]

    for (const voc of vocData) {
      const vocStatement = await prisma.vOCStatement.create({
        data: {
          assignmentId,
          voiceStatement: voc.voiceStatement,
          customerSegment: voc.customerSegment
        }
      })

      for (const ctq of voc.ctqs) {
        await prisma.cTQRequirement.create({
          data: {
            assignmentId,
            vocStatementId: vocStatement.id,
            ctqDescription: ctq.ctqDescription,
            measurementCriteria: ctq.measurementCriteria,
            targetValue: ctq.targetValue
          }
        })
      }
    }
    console.log('✅ Created VOC statements and CTQ requirements')

    // Create multiple processes
    const processesData = [
      {
        name: 'Order Fulfillment Process',
        owner: 'Operations Manager',
        description: 'End-to-end process from order receipt to delivery'
      },
      {
        name: 'Manufacturing Assembly Line',
        owner: 'Production Manager',
        description: 'Core manufacturing and assembly operations'
      },
      {
        name: 'Quality Control Process',
        owner: 'Quality Manager',
        description: 'Quality inspection and testing procedures'
      }
    ]

    for (let i = 0; i < processesData.length; i++) {
      const processData = processesData[i]
      const process = await prisma.process.create({
        data: {
          assignmentId,
          processName: processData.name,
          processOwner: processData.owner,
          order: i + 1
        }
      })

      // Create SIPOC entries for each process (creating complete rows)
      const sipocRows = [
        {
          supplier: 'Raw Material Vendors',
          input: 'Raw materials, Components',
          process: 'Material Reception & Inspection',
          output: 'Verified Materials',
          customer: 'Production Team'
        },
        {
          supplier: 'Sales Team',
          input: 'Customer Orders',
          process: 'Order Processing',
          output: 'Work Orders',
          customer: 'Manufacturing Team'
        },
        {
          supplier: 'Manufacturing Team',
          input: 'Work Orders, Materials',
          process: 'Production & Assembly',
          output: 'Finished Products',
          customer: 'Quality Control'
        },
        {
          supplier: 'Quality Control',
          input: 'Finished Products',
          process: 'Quality Testing',
          output: 'Approved Products',
          customer: 'Shipping Department'
        },
        {
          supplier: 'Shipping Department',
          input: 'Approved Products, Shipping Info',
          process: 'Packaging & Shipping',
          output: 'Delivered Products',
          customer: 'End Customers'
        }
      ]

      for (let j = 0; j < sipocRows.length; j++) {
        const row = sipocRows[j]
        // Create all 5 columns for each row
        await prisma.sIPOCEntry.create({
          data: {
            processId: process.id,
            column: 'SUPPLIER',
            order: j + 1,
            value: row.supplier
          }
        })
        await prisma.sIPOCEntry.create({
          data: {
            processId: process.id,
            column: 'INPUT',
            order: j + 1,
            value: row.input
          }
        })
        await prisma.sIPOCEntry.create({
          data: {
            processId: process.id,
            column: 'PROCESS',
            order: j + 1,
            value: row.process
          }
        })
        await prisma.sIPOCEntry.create({
          data: {
            processId: process.id,
            column: 'OUTPUT',
            order: j + 1,
            value: row.output
          }
        })
        await prisma.sIPOCEntry.create({
          data: {
            processId: process.id,
            column: 'CUSTOMER',
            order: j + 1,
            value: row.customer
          }
        })
      }

      // Create VSM steps for each process
      const vsmSteps = [
        {
          stepName: 'Order Receipt',
          processTime: 15,
          waitingTime: 60,
          valueMeasure: 'NON_VALUE_ADDED',
          stakeholder: 'Sales Team',
          wasteType: 'WAITING',
          remarks: 'Manual order entry causes delays'
        },
        {
          stepName: 'Order Validation',
          processTime: 30,
          waitingTime: 120,
          valueMeasure: 'ESSENTIAL_NON_VALUE',
          stakeholder: 'Order Processing',
          wasteType: 'OVER_PROCESSING',
          remarks: 'Multiple validation steps'
        },
        {
          stepName: 'Material Preparation',
          processTime: 45,
          waitingTime: 180,
          valueMeasure: 'NON_VALUE_ADDED',
          stakeholder: 'Warehouse',
          wasteType: 'MOTION',
          remarks: 'Inefficient warehouse layout'
        },
        {
          stepName: 'Manufacturing',
          processTime: 240,
          waitingTime: 30,
          valueMeasure: 'VALUE_ADDED',
          stakeholder: 'Production',
          wasteType: null,
          remarks: 'Core value-adding activity'
        },
        {
          stepName: 'Quality Inspection',
          processTime: 60,
          waitingTime: 45,
          valueMeasure: 'ESSENTIAL_NON_VALUE',
          stakeholder: 'QC Team',
          wasteType: 'WAITING',
          remarks: 'Batch inspection causes queues'
        },
        {
          stepName: 'Packaging',
          processTime: 30,
          waitingTime: 15,
          valueMeasure: 'VALUE_ADDED',
          stakeholder: 'Packaging Team',
          wasteType: null,
          remarks: 'Customer requirement'
        },
        {
          stepName: 'Shipping',
          processTime: 20,
          waitingTime: 240,
          valueMeasure: 'NON_VALUE_ADDED',
          stakeholder: 'Logistics',
          wasteType: 'TRANSPORT',
          remarks: 'Consolidation delays'
        }
      ]

      for (let j = 0; j < vsmSteps.length; j++) {
        await prisma.vSMStep.create({
          data: {
            ...vsmSteps[j],
            processId: process.id,
            stepNumber: j + 1
          }
        })
      }

      // Create Fishbone categories and causes
      const fishboneCategories = [
        {
          category: 'PEOPLE',
          causes: [
            { cause: 'Insufficient training on new procedures', rootCause: 'No structured training program' },
            { cause: 'High employee turnover rate', rootCause: 'Poor work conditions' },
            { cause: 'Lack of skilled operators', rootCause: 'No skill development programs' }
          ]
        },
        {
          category: 'PROCESS',
          causes: [
            { cause: 'Outdated standard operating procedures', rootCause: 'No regular review process' },
            { cause: 'Inconsistent work methods across shifts', rootCause: 'Poor standardization' },
            { cause: 'No documented best practices', rootCause: 'Knowledge not captured' }
          ]
        },
        {
          category: 'EQUIPMENT',
          causes: [
            { cause: 'Frequent equipment breakdowns', rootCause: 'Inadequate preventive maintenance' },
            { cause: 'Old machinery with poor precision', rootCause: 'No equipment upgrade plan' },
            { cause: 'Lack of backup equipment', rootCause: 'Budget constraints' }
          ]
        },
        {
          category: 'MATERIALS',
          causes: [
            { cause: 'Variable raw material quality', rootCause: 'Multiple suppliers without standards' },
            { cause: 'Material shortages causing delays', rootCause: 'Poor inventory management' },
            { cause: 'Wrong material specifications', rootCause: 'Communication gaps with suppliers' }
          ]
        },
        {
          category: 'MANAGEMENT',
          causes: [
            { cause: 'Unclear quality standards', rootCause: 'No documented quality policy' },
            { cause: 'Poor resource allocation', rootCause: 'Lack of capacity planning' },
            { cause: 'Insufficient budget for improvements', rootCause: 'Cost-cutting measures' }
          ]
        },
        {
          category: 'ENVIRONMENT',
          causes: [
            { cause: 'Temperature variations affecting quality', rootCause: 'No climate control' },
            { cause: 'Dust contamination in production area', rootCause: 'Poor air filtration' },
            { cause: 'Poor lighting causing errors', rootCause: 'Inadequate facility maintenance' }
          ]
        }
      ]

      for (let k = 0; k < fishboneCategories.length; k++) {
        const categoryData = fishboneCategories[k]
        const category = await prisma.fishboneCategory.create({
          data: {
            processId: process.id,
            category: categoryData.category,
            order: k + 1
          }
        })

        for (let l = 0; l < categoryData.causes.length; l++) {
          const causeData = categoryData.causes[l]
          await prisma.fishboneCause.create({
            data: {
              categoryId: category.id,
              causeDescription: `${causeData.cause} - ${causeData.rootCause}`,
              order: l + 1
            }
          })
        }
      }

      // Create FMEA entries
      const fmeaData = [
        {
          processStep: 'Material Reception',
          failureMode: 'Wrong material received',
          failureEffect: 'Production delays, quality issues',
          severity: 8,
          failureCause: 'Supplier labeling errors',
          occurrence: 4,
          currentControls: 'Visual inspection',
          detection: 6,
          recommendedActions: 'Implement barcode scanning system'
        },
        {
          processStep: 'Manufacturing Assembly',
          failureMode: 'Component misalignment',
          failureEffect: 'Product malfunction, customer complaints',
          severity: 9,
          failureCause: 'Worn fixture guides',
          occurrence: 5,
          currentControls: 'Operator visual check',
          detection: 7,
          recommendedActions: 'Install automated alignment verification'
        },
        {
          processStep: 'Quality Testing',
          failureMode: 'Defects not detected',
          failureEffect: 'Defective products reach customer',
          severity: 10,
          failureCause: 'Inadequate test coverage',
          occurrence: 3,
          currentControls: 'Sample testing',
          detection: 8,
          recommendedActions: '100% automated optical inspection'
        },
        {
          processStep: 'Packaging',
          failureMode: 'Incorrect labeling',
          failureEffect: 'Shipping errors, returns',
          severity: 6,
          failureCause: 'Manual label application',
          occurrence: 4,
          currentControls: 'Random checks',
          detection: 5,
          recommendedActions: 'Automated label printing and verification'
        },
        {
          processStep: 'Order Processing',
          failureMode: 'Data entry errors',
          failureEffect: 'Wrong products shipped',
          severity: 7,
          failureCause: 'Manual data entry',
          occurrence: 6,
          currentControls: 'Double-check by another operator',
          detection: 4,
          recommendedActions: 'Implement OCR and automated validation'
        }
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
            recommendedActions: fmea.recommendedActions
          }
        })
      }
    }

    console.log('✅ Created processes with SIPOC, VSM, Fishbone, and FMEA data')

    // Create Recommendations
    const recommendations = [
      {
        recommendationTitle: 'Implement Automated Quality Inspection System',
        description: 'Deploy computer vision-based inspection system to achieve 100% quality checking',
        expectedImpact: 'Reduce defect rate by 80%, eliminate manual inspection labor',
        implementationDifficulty: 'MEDIUM',
        estimatedCostSavings: '$250,000 annually'
      },
      {
        recommendationTitle: 'Upgrade Manufacturing Equipment',
        description: 'Replace aging machinery with modern CNC equipment for better precision',
        expectedImpact: 'Improve precision by 50%, reduce cycle time by 30%',
        implementationDifficulty: 'HIGH',
        estimatedCostSavings: '$500,000 annually'
      },
      {
        recommendationTitle: 'Implement Enterprise Resource Planning (ERP) System',
        description: 'Centralized system for order management, inventory, and production planning',
        expectedImpact: 'Streamline operations, reduce order processing time by 60%',
        implementationDifficulty: 'HIGH',
        estimatedCostSavings: '$350,000 annually'
      },
      {
        recommendationTitle: 'Establish Supplier Quality Program',
        description: 'Implement supplier certification and regular quality audits',
        expectedImpact: 'Reduce material defects by 70%, improve supply reliability',
        implementationDifficulty: 'LOW',
        estimatedCostSavings: '$150,000 annually'
      },
      {
        recommendationTitle: 'Create Comprehensive Training Program',
        description: 'Develop structured training for all operators with certification',
        expectedImpact: 'Reduce human errors by 60%, improve productivity by 25%',
        implementationDifficulty: 'MEDIUM',
        estimatedCostSavings: '$100,000 annually'
      }
    ]

    for (const rec of recommendations) {
      await prisma.recommendation.create({
        data: {
          ...rec,
          assignmentId,
          linkedFMEAIds: [],
          linkedFishboneCauseIds: []
        }
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
        timestamp: new Date()
      }
    })

    console.log('✅ Created audit log')

    console.log('\n' + '='.repeat(60))
    console.log('✨ SUCCESS! Comprehensive sample assignment created')
    console.log('='.repeat(60))
    console.log(`Assignment ID: ${assignmentId}`)
    console.log(`Title: ${assignment.title}`)
    console.log('\nSummary:')
    console.log('- 3 VOC statements with 6 CTQ requirements')
    console.log('- 3 processes (Order Fulfillment, Manufacturing, Quality Control)')
    console.log('- 75 SIPOC entries (25 per process, 5 rows × 5 columns)')
    console.log('- 21 VSM steps (7 per process)')
    console.log('- 54 Fishbone causes (18 per process, 3 per category)')
    console.log('- 15 FMEA entries (5 per process)')
    console.log('- 5 improvement recommendations')
    console.log('\n📊 Visit http://localhost:3020/assignments to view the assignment')
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ Error creating sample assignment:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createComprehensiveSample()