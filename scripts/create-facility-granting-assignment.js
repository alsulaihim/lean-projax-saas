// Usage: DATABASE_URL="postgresql://user:password@localhost:5432/dbname" node scripts/create-facility-granting-assignment.js
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

async function createFacilityGrantingAssignment() {
  try {
    console.log('🏭 Creating comprehensive Facility Granting Assignment...')
    console.log('=' .repeat(60))

    // Get Mashael M as the creator
    const creator = await prisma.user.findUnique({
      where: { email: 'mashael@sample.com' }
    })

    if (!creator) {
      console.log('❌ User mashael@sample.com not found. Please create the user first.')
      return
    }

    // Create the assignment
    const assignment = await prisma.assignment.create({
      data: {
        title: 'Facility Granting Process Optimization',
        objective: 'Optimize the end-to-end facility granting process to reduce cycle time by 40%, improve approval accuracy to 98%, and enhance customer satisfaction scores to 4.5/5.0 through Six Sigma DMAIC methodology.',
        status: 'COMPLETED',
        createdById: creator.id,
        completedAt: new Date()
      }
    })

    console.log('✅ Assignment created:', assignment.title)

    // Create 7 processes for the facility granting workflow
    const processesData = [
      {
        name: 'Application Submission',
        owner: 'Customer Service Team',
        lsl: 10, usl: 30, target: 20, mean: 19.5, stdDev: 3.2
      },
      {
        name: 'Document Verification',
        owner: 'Document Processing Unit',
        lsl: 15, usl: 45, target: 30, mean: 31.2, stdDev: 4.8
      },
      {
        name: 'Technical Review',
        owner: 'Engineering Department',
        lsl: 30, usl: 90, target: 60, mean: 58.5, stdDev: 9.5
      },
      {
        name: 'Compliance Check',
        owner: 'Legal & Compliance Team',
        lsl: 20, usl: 60, target: 40, mean: 42.3, stdDev: 6.2
      },
      {
        name: 'Risk Assessment',
        owner: 'Risk Management Unit',
        lsl: 25, usl: 75, target: 50, mean: 48.7, stdDev: 7.8
      },
      {
        name: 'Management Approval',
        owner: 'Executive Committee',
        lsl: 5, usl: 15, target: 10, mean: 10.8, stdDev: 1.6
      },
      {
        name: 'Facility Activation',
        owner: 'Operations Team',
        lsl: 10, usl: 20, target: 15, mean: 14.5, stdDev: 1.8
      }
    ]

    const processes = []
    for (let i = 0; i < processesData.length; i++) {
      const processData = processesData[i]
      const process = await prisma.process.create({
        data: {
          assignmentId: assignment.id,
          processName: processData.name,
          processOwner: processData.owner,
          order: i,
          lowerSpecLimit: processData.lsl,
          upperSpecLimit: processData.usl,
          targetValue: processData.target,
          sampleMean: processData.mean,
          sampleStdDev: processData.stdDev
        }
      })
      processes.push(process)
      console.log(`  📋 Process ${i + 1}: ${process.processName}`)
    }

    // Create VOC and CTQ data
    console.log('\n📣 Adding Voice of Customer (VOC) and Critical to Quality (CTQ) data...')

    const vocData = [
      {
        segment: 'Small Business Owners',
        statement: 'We need faster approval times for facility permits to start operations quickly',
        ctqs: [
          { description: 'Application processing time', criteria: 'Time from submission to approval', target: '< 10 business days' },
          { description: 'First-time approval rate', criteria: 'Percentage approved without rework', target: '> 85%' }
        ]
      },
      {
        segment: 'Large Corporations',
        statement: 'We require transparent tracking and predictable timelines for multiple facility applications',
        ctqs: [
          { description: 'Real-time application status', criteria: 'Updates available within system', target: '100% visibility' },
          { description: 'Process consistency', criteria: 'Standard deviation of processing times', target: '< 2 days' }
        ]
      },
      {
        segment: 'Government Regulators',
        statement: 'All facility grants must comply with safety and environmental regulations',
        ctqs: [
          { description: 'Regulatory compliance rate', criteria: 'Percentage meeting all requirements', target: '100%' },
          { description: 'Audit trail completeness', criteria: 'Documentation available for review', target: '100%' }
        ]
      }
    ]

    for (const voc of vocData) {
      const vocStatement = await prisma.vOCStatement.create({
        data: {
          assignmentId: assignment.id,
          customerSegment: voc.segment,
          voiceStatement: voc.statement
        }
      })

      for (const ctq of voc.ctqs) {
        await prisma.cTQRequirement.create({
          data: {
            assignmentId: assignment.id,
            vocStatementId: vocStatement.id,
            ctqDescription: ctq.description,
            measurementCriteria: ctq.criteria,
            targetValue: ctq.target
          }
        })
      }
    }
    console.log('  ✅ Added 3 VOC statements with 6 CTQ requirements')

    // Create VSM steps for each process with realistic facility granting steps
    console.log('\n⚙️  Adding Value Stream Mapping (VSM) steps...')

    const vsmStepsData = {
      'Application Submission': [
        { name: 'Customer Inquiry', processTime: 5, waitingTime: 10, value: 'NON_VALUE_ADDED' },
        { name: 'Application Form Filling', processTime: 30, waitingTime: 0, value: 'VALUE_ADDED' },
        { name: 'Document Collection', processTime: 45, waitingTime: 120, value: 'ESSENTIAL_NON_VALUE' },
        { name: 'Initial Submission', processTime: 10, waitingTime: 5, value: 'VALUE_ADDED' },
        { name: 'Receipt Confirmation', processTime: 2, waitingTime: 3, value: 'ESSENTIAL_NON_VALUE' }
      ],
      'Document Verification': [
        { name: 'Document Reception', processTime: 5, waitingTime: 30, value: 'NON_VALUE_ADDED' },
        { name: 'Completeness Check', processTime: 15, waitingTime: 10, value: 'VALUE_ADDED' },
        { name: 'Authentication Verification', processTime: 25, waitingTime: 20, value: 'VALUE_ADDED' },
        { name: 'Missing Document Request', processTime: 10, waitingTime: 240, value: 'NON_VALUE_ADDED' },
        { name: 'Final Documentation Review', processTime: 20, waitingTime: 15, value: 'VALUE_ADDED' }
      ],
      'Technical Review': [
        { name: 'Technical Assignment', processTime: 10, waitingTime: 60, value: 'NON_VALUE_ADDED' },
        { name: 'Site Plan Analysis', processTime: 45, waitingTime: 30, value: 'VALUE_ADDED' },
        { name: 'Infrastructure Assessment', processTime: 60, waitingTime: 20, value: 'VALUE_ADDED' },
        { name: 'Environmental Impact Review', processTime: 40, waitingTime: 15, value: 'VALUE_ADDED' },
        { name: 'Technical Report Generation', processTime: 30, waitingTime: 10, value: 'ESSENTIAL_NON_VALUE' }
      ],
      'Compliance Check': [
        { name: 'Regulatory Mapping', processTime: 15, waitingTime: 10, value: 'ESSENTIAL_NON_VALUE' },
        { name: 'Zoning Compliance', processTime: 25, waitingTime: 20, value: 'VALUE_ADDED' },
        { name: 'Safety Standards Review', processTime: 30, waitingTime: 15, value: 'VALUE_ADDED' },
        { name: 'Legal Documentation Check', processTime: 20, waitingTime: 10, value: 'VALUE_ADDED' },
        { name: 'Compliance Certificate', processTime: 10, waitingTime: 5, value: 'ESSENTIAL_NON_VALUE' }
      ],
      'Risk Assessment': [
        { name: 'Risk Profile Creation', processTime: 20, waitingTime: 15, value: 'VALUE_ADDED' },
        { name: 'Financial Risk Analysis', processTime: 35, waitingTime: 20, value: 'VALUE_ADDED' },
        { name: 'Operational Risk Review', processTime: 30, waitingTime: 15, value: 'VALUE_ADDED' },
        { name: 'Mitigation Strategy', processTime: 25, waitingTime: 10, value: 'VALUE_ADDED' },
        { name: 'Risk Score Calculation', processTime: 15, waitingTime: 5, value: 'ESSENTIAL_NON_VALUE' }
      ],
      'Management Approval': [
        { name: 'Executive Summary Prep', processTime: 15, waitingTime: 10, value: 'ESSENTIAL_NON_VALUE' },
        { name: 'Committee Scheduling', processTime: 5, waitingTime: 480, value: 'NON_VALUE_ADDED' },
        { name: 'Presentation', processTime: 30, waitingTime: 0, value: 'VALUE_ADDED' },
        { name: 'Deliberation', processTime: 20, waitingTime: 0, value: 'VALUE_ADDED' },
        { name: 'Decision Documentation', processTime: 10, waitingTime: 5, value: 'ESSENTIAL_NON_VALUE' }
      ],
      'Facility Activation': [
        { name: 'System Registration', processTime: 10, waitingTime: 5, value: 'VALUE_ADDED' },
        { name: 'Permit Generation', processTime: 5, waitingTime: 2, value: 'VALUE_ADDED' },
        { name: 'Stakeholder Notification', processTime: 15, waitingTime: 10, value: 'ESSENTIAL_NON_VALUE' },
        { name: 'Account Setup', processTime: 20, waitingTime: 10, value: 'VALUE_ADDED' },
        { name: 'Welcome Package Delivery', processTime: 10, waitingTime: 30, value: 'NON_VALUE_ADDED' }
      ]
    }

    let totalVsmSteps = 0
    for (const process of processes) {
      const steps = vsmStepsData[process.processName] || []
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        await prisma.vSMStep.create({
          data: {
            processId: process.id,
            stepNumber: i + 1,
            stepName: step.name,
            processTime: step.processTime,
            waitingTime: step.waitingTime,
            valueMeasure: step.value,
            stakeholder: process.processOwner,
            wasteType: step.value === 'NON_VALUE_ADDED' ? 'WAITING' : null,
            remarks: `Step ${i + 1} of ${process.processName} process`
          }
        })
        totalVsmSteps++
      }
    }
    console.log(`  ✅ Added ${totalVsmSteps} VSM steps across all processes`)

    // Create SIPOC entries
    console.log('\n📊 Adding SIPOC analysis data...')

    const sipocData = {
      'Application Submission': [
        { s: 'Applicants', i: 'Application Forms', p: 'Form Processing', o: 'Completed Applications', c: 'Document Verification Team' },
        { s: 'IT Systems', i: 'Online Portal', p: 'Digital Submission', o: 'Electronic Records', c: 'Database System' },
        { s: 'Help Desk', i: 'Customer Queries', p: 'Guidance Provision', o: 'Support Tickets', c: 'Quality Assurance' }
      ],
      'Document Verification': [
        { s: 'Application Team', i: 'Submitted Documents', p: 'Verification Process', o: 'Verified Documents', c: 'Technical Review Team' },
        { s: 'External Databases', i: 'Reference Data', p: 'Cross-Validation', o: 'Validation Reports', c: 'Compliance Team' },
        { s: 'Document Standards', i: 'Requirement Checklists', p: 'Completeness Check', o: 'Gap Analysis', c: 'Applicants' }
      ],
      'Technical Review': [
        { s: 'Engineering Team', i: 'Technical Specifications', p: 'Technical Analysis', o: 'Technical Reports', c: 'Risk Assessment Team' },
        { s: 'Site Inspectors', i: 'Site Survey Data', p: 'Field Assessment', o: 'Inspection Reports', c: 'Management Committee' },
        { s: 'Industry Standards', i: 'Best Practices', p: 'Benchmark Comparison', o: 'Compliance Matrix', c: 'Compliance Team' }
      ],
      'Compliance Check': [
        { s: 'Legal Department', i: 'Regulations', p: 'Legal Review', o: 'Compliance Report', c: 'Risk Management' },
        { s: 'Government Bodies', i: 'Policy Guidelines', p: 'Policy Alignment', o: 'Approval Checklist', c: 'Management' },
        { s: 'Industry Regulators', i: 'Standards', p: 'Standard Verification', o: 'Certification', c: 'Facility Activation Team' }
      ],
      'Risk Assessment': [
        { s: 'Risk Analysts', i: 'Risk Parameters', p: 'Risk Evaluation', o: 'Risk Score', c: 'Executive Committee' },
        { s: 'Historical Data', i: 'Past Incidents', p: 'Trend Analysis', o: 'Risk Profile', c: 'Insurance Partners' },
        { s: 'Market Intelligence', i: 'Industry Risks', p: 'Comparative Analysis', o: 'Mitigation Plan', c: 'Operations Team' }
      ],
      'Management Approval': [
        { s: 'Department Heads', i: 'Recommendations', p: 'Review Meeting', o: 'Approval Decision', c: 'Facility Activation' },
        { s: 'Financial Team', i: 'Cost Analysis', p: 'Budget Review', o: 'Financial Approval', c: 'Accounting Department' },
        { s: 'Strategy Team', i: 'Strategic Alignment', p: 'Strategic Assessment', o: 'Strategic Fit Report', c: 'Board of Directors' }
      ],
      'Facility Activation': [
        { s: 'IT Department', i: 'System Requirements', p: 'System Setup', o: 'Active Accounts', c: 'Facility Operators' },
        { s: 'Operations Team', i: 'Activation Checklist', p: 'Facility Onboarding', o: 'Operational Facility', c: 'End Customers' },
        { s: 'Support Team', i: 'Training Materials', p: 'User Training', o: 'Trained Users', c: 'Facility Management' }
      ]
    }

    let totalSipocEntries = 0
    for (const process of processes) {
      const sipocRows = sipocData[process.processName] || []
      for (let i = 0; i < sipocRows.length; i++) {
        const row = sipocRows[i]

        await prisma.sIPOCEntry.create({
          data: { processId: process.id, column: 'SUPPLIER', value: row.s, order: i }
        })
        await prisma.sIPOCEntry.create({
          data: { processId: process.id, column: 'INPUT', value: row.i, order: i }
        })
        await prisma.sIPOCEntry.create({
          data: { processId: process.id, column: 'PROCESS', value: row.p, order: i }
        })
        await prisma.sIPOCEntry.create({
          data: { processId: process.id, column: 'OUTPUT', value: row.o, order: i }
        })
        await prisma.sIPOCEntry.create({
          data: { processId: process.id, column: 'CUSTOMER', value: row.c, order: i }
        })

        totalSipocEntries += 5
      }
    }
    console.log(`  ✅ Added ${totalSipocEntries} SIPOC entries`)

    // Create FMEA entries with varied risk levels
    console.log('\n⚠️  Adding FMEA (Failure Mode and Effects Analysis) data...')

    const fmeaData = [
      // High Risk (RPN > 200)
      {
        process: 'Document Verification',
        failureMode: 'Fraudulent documents accepted',
        effects: 'Legal liability, regulatory penalties, reputation damage',
        severity: 9,
        causes: 'Inadequate verification tools, insufficient training',
        occurrence: 5,
        controls: 'Manual review, spot checks',
        detection: 7,
        actions: 'Implement AI-based document verification system'
      },
      {
        process: 'Technical Review',
        failureMode: 'Critical safety hazards overlooked',
        effects: 'Facility accidents, injuries, operational shutdown',
        severity: 10,
        causes: 'Incomplete site inspection, reviewer fatigue',
        occurrence: 4,
        controls: 'Peer review process',
        detection: 6,
        actions: 'Mandatory dual-review for high-risk facilities'
      },
      {
        process: 'Compliance Check',
        failureMode: 'Non-compliant facility approved',
        effects: 'Regulatory fines, legal action, license revocation',
        severity: 8,
        causes: 'Outdated regulation database, human error',
        occurrence: 4,
        controls: 'Quarterly regulation updates',
        detection: 7,
        actions: 'Real-time regulatory compliance system integration'
      },
      // Medium Risk (100 < RPN < 200)
      {
        process: 'Application Submission',
        failureMode: 'Incomplete applications accepted',
        effects: 'Process delays, customer dissatisfaction',
        severity: 5,
        causes: 'System validation gaps, unclear requirements',
        occurrence: 6,
        controls: 'Automated form validation',
        detection: 4,
        actions: 'Enhanced front-end validation rules'
      },
      {
        process: 'Risk Assessment',
        failureMode: 'Risk score miscalculation',
        effects: 'Inappropriate risk mitigation, financial exposure',
        severity: 7,
        causes: 'Formula errors, data quality issues',
        occurrence: 3,
        controls: 'Monthly audit of calculations',
        detection: 5,
        actions: 'Automated risk scoring with validation checks'
      },
      {
        process: 'Management Approval',
        failureMode: 'Delayed approval decisions',
        effects: 'Customer churn, lost business opportunities',
        severity: 6,
        causes: 'Committee scheduling conflicts, incomplete information',
        occurrence: 5,
        controls: 'Weekly committee meetings',
        detection: 3,
        actions: 'Implement delegation matrix for routine approvals'
      },
      // Low Risk (RPN < 100)
      {
        process: 'Facility Activation',
        failureMode: 'Account setup errors',
        effects: 'Minor delays, customer inconvenience',
        severity: 3,
        causes: 'Data entry errors, system glitches',
        occurrence: 4,
        controls: 'Verification checklist',
        detection: 3,
        actions: 'Automated provisioning system'
      },
      {
        process: 'Application Submission',
        failureMode: 'System downtime during submission',
        effects: 'Temporary service unavailability',
        severity: 4,
        causes: 'Server issues, maintenance windows',
        occurrence: 2,
        controls: 'Redundant systems, scheduled maintenance',
        detection: 2,
        actions: 'Cloud-based infrastructure upgrade'
      }
    ]

    let fmeaCount = 0
    for (const fmea of fmeaData) {
      const process = processes.find(p => p.processName === fmea.process)
      if (process) {
        const rpn = fmea.severity * fmea.occurrence * fmea.detection
        await prisma.fMEAEntry.create({
          data: {
            assignmentId: assignment.id,
            processId: process.id,
            failureMode: fmea.failureMode,
            effectsOfFailure: fmea.effects,
            severity: fmea.severity,
            potentialCauses: fmea.causes,
            occurrence: fmea.occurrence,
            currentControls: fmea.controls,
            detection: fmea.detection,
            rpn: rpn,
            recommendedActions: fmea.actions
          }
        })
        fmeaCount++
      }
    }
    console.log(`  ✅ Added ${fmeaCount} FMEA entries (High: 3, Medium: 3, Low: 2)`)

    // Create Fishbone diagrams
    console.log('\n🐟 Adding Fishbone (Ishikawa) analysis...')

    const fishboneCategories = ['PEOPLE', 'PROCESS', 'EQUIPMENT', 'MATERIALS', 'ENVIRONMENT', 'MANAGEMENT']

    const fishboneCauses = {
      PEOPLE: [
        'Insufficient training on new procedures',
        'High employee turnover rate',
        'Language barriers with international applicants',
        'Lack of technical expertise'
      ],
      PROCESS: [
        'Unclear process documentation',
        'Redundant approval steps',
        'Lack of standardization across departments',
        'Missing escalation procedures'
      ],
      EQUIPMENT: [
        'Outdated IT systems',
        'Inadequate document scanning equipment',
        'System integration issues',
        'Frequent server downtime'
      ],
      MATERIALS: [
        'Incomplete application templates',
        'Outdated regulatory guidelines',
        'Missing reference materials',
        'Poor quality control documents'
      ],
      ENVIRONMENT: [
        'Remote work coordination challenges',
        'Multiple office locations',
        'Time zone differences',
        'Regulatory environment changes'
      ],
      MANAGEMENT: [
        'Unclear performance metrics',
        'Insufficient resource allocation',
        'Lack of strategic direction',
        'Poor change management'
      ]
    }

    let fishboneCount = 0
    // Add fishbone for critical processes
    const criticalProcesses = processes.slice(0, 4) // First 4 processes are most critical
    for (const process of criticalProcesses) {
      for (let i = 0; i < fishboneCategories.length; i++) {
        const category = await prisma.fishboneCategory.create({
          data: {
            processId: process.id,
            category: fishboneCategories[i],
            order: i
          }
        })

        const causes = fishboneCauses[fishboneCategories[i]]
        for (let j = 0; j < 2; j++) { // Add 2 causes per category
          if (causes[j]) {
            await prisma.fishboneCause.create({
              data: {
                categoryId: category.id,
                causeDescription: causes[j] + ` (${process.processName})`,
                order: j
              }
            })
            fishboneCount++
          }
        }
      }
    }
    console.log(`  ✅ Added ${fishboneCount} fishbone causes across 4 critical processes`)

    // Create Recommendations
    console.log('\n💡 Adding improvement recommendations...')

    const recommendations = [
      {
        title: 'Implement Digital Transformation Initiative',
        description: 'Deploy end-to-end digital platform with AI-powered document verification, automated workflow management, and real-time tracking. This includes mobile app development, blockchain for document authentication, and RPA for routine tasks.',
        impact: 'Reduce processing time by 60%, improve accuracy to 99%, enhance customer experience',
        difficulty: 'HIGH',
        savings: '$2.5M annually',
        status: 'APPROVED'
      },
      {
        title: 'Establish Dedicated Fast-Track Lane',
        description: 'Create expedited processing path for low-risk, high-volume applications using risk-based segmentation and automated approval for qualifying criteria.',
        impact: 'Process 40% of applications in 24 hours, improve customer satisfaction by 30%',
        difficulty: 'MEDIUM',
        savings: '$800K annually',
        status: 'IMPLEMENTED'
      },
      {
        title: 'Implement Continuous Training Program',
        description: 'Develop comprehensive training curriculum with certification program, monthly workshops, and e-learning modules for all process participants.',
        impact: 'Reduce errors by 45%, improve employee competency scores to 95%',
        difficulty: 'LOW',
        savings: '$400K annually',
        status: 'IMPLEMENTED'
      },
      {
        title: 'Deploy Predictive Analytics System',
        description: 'Use machine learning to predict processing times, identify bottlenecks proactively, and optimize resource allocation based on demand patterns.',
        impact: 'Improve capacity utilization by 35%, reduce overtime costs by 50%',
        difficulty: 'HIGH',
        savings: '$1.2M annually',
        status: 'PROPOSED'
      },
      {
        title: 'Standardize Cross-Department Procedures',
        description: 'Create unified SOPs, implement ISO 9001 standards, and establish cross-functional teams for process harmonization.',
        impact: 'Reduce process variation by 70%, improve interdepartmental handoffs',
        difficulty: 'MEDIUM',
        savings: '$600K annually',
        status: 'APPROVED'
      }
    ]

    for (const rec of recommendations) {
      await prisma.recommendation.create({
        data: {
          assignmentId: assignment.id,
          recommendationTitle: rec.title,
          description: rec.description,
          expectedImpact: rec.impact,
          implementationDifficulty: rec.difficulty,
          estimatedCostSavings: rec.savings,
          status: rec.status,
          linkedFMEAIds: [],
          linkedFishboneCauseIds: []
        }
      })
    }
    console.log(`  ✅ Added ${recommendations.length} improvement recommendations`)

    // Create Audit Logs
    console.log('\n📝 Adding audit trail...')

    const auditEvents = [
      { action: 'CREATED', entityType: 'Assignment', changeDetails: { status: 'DRAFT' } },
      { action: 'UPDATED', entityType: 'Process', changeDetails: { added: '7 processes' } },
      { action: 'UPDATED', entityType: 'VOC', changeDetails: { added: '3 statements' } },
      { action: 'UPDATED', entityType: 'VSM', changeDetails: { added: '35 steps' } },
      { action: 'UPDATED', entityType: 'FMEA', changeDetails: { added: '8 entries' } },
      { action: 'COMPLETED', entityType: 'Assignment', changeDetails: { status: 'COMPLETED', completionDate: new Date() } }
    ]

    for (const event of auditEvents) {
      await prisma.auditLog.create({
        data: {
          assignmentId: assignment.id,
          userId: creator.id,
          action: event.action,
          entityType: event.entityType,
          changeDetails: event.changeDetails
        }
      })
    }
    console.log(`  ✅ Added ${auditEvents.length} audit log entries`)

    console.log('\n' + '=' .repeat(60))
    console.log('✅ FACILITY GRANTING ASSIGNMENT CREATED SUCCESSFULLY!')
    console.log('=' .repeat(60))
    console.log('\n📊 Summary:')
    console.log(`  Assignment ID: ${assignment.id}`)
    console.log(`  Title: ${assignment.title}`)
    console.log(`  Status: COMPLETED (100%)`)
    console.log(`  Created by: ${creator.name}`)
    console.log(`  Processes: 7`)
    console.log(`  VOC Statements: 3`)
    console.log(`  CTQ Requirements: 6`)
    console.log(`  VSM Steps: ${totalVsmSteps}`)
    console.log(`  SIPOC Entries: ${totalSipocEntries}`)
    console.log(`  FMEA Entries: ${fmeaCount}`)
    console.log(`  Fishbone Causes: ${fishboneCount}`)
    console.log(`  Recommendations: ${recommendations.length}`)
    console.log('\n🔗 Access URL: http://localhost:3020/assignments/' + assignment.id)

  } catch (error) {
    console.error('❌ Error creating assignment:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
createFacilityGrantingAssignment()