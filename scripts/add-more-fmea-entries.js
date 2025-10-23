// Usage: DATABASE_URL="postgresql://user:password@localhost:5432/dbname" node scripts/add-more-fmea-entries.js
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

async function addMoreFMEAEntries() {
  try {
    console.log('🚀 Adding additional FMEA entries to Facility Granting Assignment...')
    console.log('='.repeat(60))

    // Find the Facility Granting assignment
    const assignment = await prisma.assignment.findFirst({
      where: { title: 'Facility Granting Process Optimization' },
      include: { processes: true },
    })

    if (!assignment) {
      console.log('❌ Facility Granting assignment not found')
      return
    }

    console.log('✅ Found assignment:', assignment.title)

    // Additional comprehensive FMEA data covering all processes
    const additionalFmeaData = [
      // CRITICAL RISKS (RPN > 250)
      {
        processName: 'Technical Review',
        failureMode: 'Structural integrity assessment failure',
        effects: 'Building collapse, multiple fatalities, criminal liability',
        severity: 10,
        causes: 'Unqualified reviewers, calculation errors, corrupted data',
        occurrence: 3,
        controls: 'Structural engineer sign-off required',
        detection: 9,
        actions: 'Implement triple-check system with external validation',
      },
      {
        processName: 'Compliance Check',
        failureMode: 'Environmental hazard approval',
        effects: 'Toxic exposure, environmental disaster, permanent closure',
        severity: 10,
        causes: 'Missing environmental impact data, bribery, system manipulation',
        occurrence: 2,
        controls: 'Environmental agency review',
        detection: 8,
        actions: 'Blockchain-based approval tracking, whistleblower hotline',
      },

      // HIGH RISKS (RPN 200-250)
      {
        processName: 'Document Verification',
        failureMode: 'Identity theft through document fraud',
        effects: 'Financial fraud, legal proceedings, victim compensation',
        severity: 9,
        causes: 'Sophisticated forgeries, insider threats, social engineering',
        occurrence: 3,
        controls: 'Background checks, reference verification',
        detection: 8,
        actions: 'Biometric verification, AI fraud detection system',
      },
      {
        processName: 'Risk Assessment',
        failureMode: 'Catastrophic risk underestimation',
        effects: 'Major financial losses, insurance claims, bankruptcy',
        severity: 9,
        causes: 'Incomplete data, model failures, conflict of interest',
        occurrence: 3,
        controls: 'Independent risk review',
        detection: 7,
        actions: 'Monte Carlo simulations, stress testing protocols',
      },
      {
        processName: 'Application Submission',
        failureMode: 'Data breach of applicant information',
        effects: 'GDPR violations, lawsuits, regulatory fines up to 4% revenue',
        severity: 8,
        causes: 'Cyber attacks, unencrypted data, weak access controls',
        occurrence: 4,
        controls: 'Firewall, basic encryption',
        detection: 7,
        actions: 'Zero-trust architecture, end-to-end encryption',
      },

      // MEDIUM-HIGH RISKS (RPN 150-199)
      {
        processName: 'Management Approval',
        failureMode: 'Conflict of interest in approval',
        effects: 'Corruption allegations, investigation, license suspension',
        severity: 8,
        causes: 'Undisclosed relationships, financial incentives, pressure',
        occurrence: 2,
        controls: 'Declaration of interest forms',
        detection: 9,
        actions: 'Automated conflict checking, rotation of committee members',
      },
      {
        processName: 'Facility Activation',
        failureMode: 'Premature activation without safety clearance',
        effects: 'Accidents, injuries, emergency shutdown, litigation',
        severity: 8,
        causes: 'Communication breakdown, system override, time pressure',
        occurrence: 3,
        controls: 'Activation checklist',
        detection: 6,
        actions: 'Digital twin validation, IoT safety sensors',
      },
      {
        processName: 'Technical Review',
        failureMode: 'Utility infrastructure overload',
        effects: 'Power outages, service disruptions, community impact',
        severity: 7,
        causes: 'Capacity miscalculation, outdated grid data, peak load errors',
        occurrence: 4,
        controls: 'Utility company consultation',
        detection: 5,
        actions: 'Real-time grid capacity monitoring, load balancing system',
      },

      // MEDIUM RISKS (RPN 100-149)
      {
        processName: 'Document Verification',
        failureMode: 'Processing delays due to document quality',
        effects: 'SLA breaches, customer complaints, reputation damage',
        severity: 6,
        causes: 'Poor scan quality, illegible handwriting, format issues',
        occurrence: 5,
        controls: 'Document quality guidelines',
        detection: 4,
        actions: 'OCR enhancement, customer portal improvements',
      },
      {
        processName: 'Risk Assessment',
        failureMode: 'Inconsistent risk scoring',
        effects: 'Unfair treatment, appeals, process credibility loss',
        severity: 6,
        causes: 'Subjective criteria, assessor bias, training gaps',
        occurrence: 4,
        controls: 'Scoring rubric',
        detection: 5,
        actions: 'ML-based scoring model, calibration sessions',
      },
      {
        processName: 'Compliance Check',
        failureMode: 'Outdated regulation application',
        effects: 'Invalid approvals, retrofitting costs, delays',
        severity: 5,
        causes: 'Manual update process, notification delays, version control',
        occurrence: 5,
        controls: 'Quarterly regulation review',
        detection: 5,
        actions: 'Automated regulation feed, version control system',
      },

      // LOW-MEDIUM RISKS (RPN 50-99)
      {
        processName: 'Application Submission',
        failureMode: 'Duplicate application submissions',
        effects: 'Processing confusion, wasted resources, delays',
        severity: 4,
        causes: 'System timeout, user error, browser issues',
        occurrence: 6,
        controls: 'Duplicate detection logic',
        detection: 3,
        actions: 'Unique application ID, session management',
      },
      {
        processName: 'Management Approval',
        failureMode: 'Meeting minutes loss',
        effects: 'Audit findings, decision uncertainty, rework',
        severity: 5,
        causes: 'Recording failure, storage issues, human error',
        occurrence: 3,
        controls: 'Backup recording, written notes',
        detection: 4,
        actions: 'Automated transcription, cloud backup',
      },
      {
        processName: 'Facility Activation',
        failureMode: 'Welcome package delivery failure',
        effects: 'Customer confusion, support calls, poor experience',
        severity: 3,
        causes: 'Wrong address, courier issues, packaging damage',
        occurrence: 5,
        controls: 'Delivery tracking',
        detection: 3,
        actions: 'Digital welcome package, delivery confirmation',
      },

      // LOW RISKS (RPN < 50)
      {
        processName: 'Document Verification',
        failureMode: 'Timestamp synchronization error',
        effects: 'Minor audit issues, log inconsistencies',
        severity: 2,
        causes: 'Server time drift, timezone issues',
        occurrence: 4,
        controls: 'NTP synchronization',
        detection: 2,
        actions: 'Time server redundancy',
      },
      {
        processName: 'Technical Review',
        failureMode: 'Report formatting inconsistency',
        effects: 'Professional appearance, minor rework',
        severity: 2,
        causes: 'Multiple templates, version differences',
        occurrence: 7,
        controls: 'Template library',
        detection: 2,
        actions: 'Standardized report generator',
      },
      {
        processName: 'Risk Assessment',
        failureMode: 'Calculation rounding errors',
        effects: 'Minor score variations, negligible impact',
        severity: 1,
        causes: 'Decimal precision, formula differences',
        occurrence: 8,
        controls: 'Calculation validation',
        detection: 3,
        actions: 'Standardized precision rules',
      },
    ]

    let addedCount = 0
    let riskDistribution = {
      critical: 0, // RPN > 250
      high: 0, // RPN 200-250
      mediumHigh: 0, // RPN 150-199
      medium: 0, // RPN 100-149
      low: 0, // RPN < 100
    }

    console.log('\nAdding FMEA entries:')
    console.log('-'.repeat(40))

    for (const fmea of additionalFmeaData) {
      const process = assignment.processes.find(p => p.processName === fmea.processName)

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
            recommendedActions: fmea.actions,
          },
        })

        // Categorize risk
        if (rpn > 250) riskDistribution.critical++
        else if (rpn >= 200) riskDistribution.high++
        else if (rpn >= 150) riskDistribution.mediumHigh++
        else if (rpn >= 100) riskDistribution.medium++
        else riskDistribution.low++

        addedCount++

        const riskLevel =
          rpn > 250
            ? 'CRITICAL'
            : rpn >= 200
              ? 'HIGH'
              : rpn >= 150
                ? 'MED-HIGH'
                : rpn >= 100
                  ? 'MEDIUM'
                  : 'LOW'

        console.log(`  ✓ ${fmea.processName}: ${fmea.failureMode}`)
        console.log(
          `    RPN: ${rpn} (${riskLevel}) - S:${fmea.severity} O:${fmea.occurrence} D:${fmea.detection}`
        )
      }
    }

    // Get total count
    const totalFmeaEntries = await prisma.fMEAEntry.count({
      where: { assignmentId: assignment.id },
    })

    console.log('\n' + '='.repeat(60))
    console.log('✅ FMEA ENTRIES SUCCESSFULLY ADDED!')
    console.log('='.repeat(60))
    console.log('\n📊 FMEA Summary:')
    console.log(`  New entries added: ${addedCount}`)
    console.log(`  Total FMEA entries: ${totalFmeaEntries}`)
    console.log('\n📈 Risk Distribution (New Entries):')
    console.log(`  Critical (RPN > 250): ${riskDistribution.critical}`)
    console.log(`  High (RPN 200-250): ${riskDistribution.high}`)
    console.log(`  Medium-High (RPN 150-199): ${riskDistribution.mediumHigh}`)
    console.log(`  Medium (RPN 100-149): ${riskDistribution.medium}`)
    console.log(`  Low (RPN < 100): ${riskDistribution.low}`)

    // Display all FMEA entries sorted by RPN
    const allFmea = await prisma.fMEAEntry.findMany({
      where: { assignmentId: assignment.id },
      include: { process: true },
      orderBy: { rpn: 'desc' },
    })

    console.log('\n🎯 Top 10 Risks by RPN:')
    console.log('-'.repeat(60))
    allFmea.slice(0, 10).forEach((entry, index) => {
      console.log(`${index + 1}. [RPN: ${entry.rpn}] ${entry.process?.processName}`)
      console.log(`   ${entry.failureMode}`)
    })
  } catch (error) {
    console.error('❌ Error adding FMEA entries:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
addMoreFMEAEntries()
