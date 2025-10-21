import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📋 Seeding banking facility granting charter...')

  // Find the banking assignment
  const assignment = await prisma.assignment.findFirst({
    where: {
      title: 'Bank Facility Granting Process Improvement'
    },
    include: {
      charter: true
    }
  })

  if (!assignment) {
    console.error('❌ Banking assignment not found')
    process.exit(1)
  }

  // Delete existing charter if any
  if (assignment.charter) {
    await prisma.charterScheduleItem.deleteMany({
      where: { charterId: assignment.charter.id }
    })
    await prisma.assignmentCharter.delete({
      where: { id: assignment.charter.id }
    })
    console.log('🧹 Deleted existing charter')
  }

  // Create comprehensive charter
  const charter = await prisma.assignmentCharter.create({
    data: {
      assignmentId: assignment.id,
      // Assignment Information
      assignmentName: 'Bank Facility Granting Process Improvement',
      programSponsor: `Chief Operating Officer (COO)
Head of Retail Banking
Head of Credit Risk Management`,
      processOwner: `Credit Operations Manager
Loan Processing Department Head
Regional Business Manager`,
      programManagement: `Six Sigma Black Belt - Project Lead
Project Management Office (PMO) Representative
Change Management Specialist`,
      projectTeam: `Business Analyst - Process Documentation
Data Analyst - Metrics & Reporting
IT System Analyst - Technology Integration
Credit Risk Analyst - Risk Assessment
Compliance Officer - Regulatory Requirements
Branch Operations Representative
Customer Service Representative`,

      // Project Overview
      strategicAlignment: `This initiative directly supports the bank's strategic objectives:

1. Operational Excellence: Streamline facility granting process to reduce cycle time by 40%
2. Customer Experience: Enhance customer satisfaction through faster loan processing
3. Risk Management: Improve credit assessment accuracy and reduce default rates by 15%
4. Digital Transformation: Leverage technology to automate manual processes
5. Competitive Advantage: Reduce time-to-market for loan products
6. Regulatory Compliance: Ensure adherence to Basel III and local banking regulations`,

      problemStatement: `Current facility granting process suffers from multiple inefficiencies:

• Average processing time: 21 days (industry benchmark: 10 days)
• Customer complaints increased by 35% in the past year
• High rate of manual intervention: 78% of applications require manual review
• Documentation errors causing delays: 24% rework rate
• Credit committee bottleneck: 5-day average waiting time
• Limited visibility into application status
• High operational costs: $450 per application processed

Root causes include outdated systems, manual data entry, unclear approval workflows, and lack of standardized processes across branches.`,

      businessCase: `Financial Impact:
• Cost Savings: $2.8M annually through process automation and efficiency gains
• Revenue Growth: $5.2M additional revenue from 30% increase in application volume capacity
• Risk Reduction: $1.5M annual savings from improved credit assessment accuracy

Non-Financial Benefits:
• Improved customer satisfaction (NPS increase from 42 to 65)
• Enhanced employee productivity (20% reduction in processing time per FTE)
• Better regulatory compliance and audit readiness
• Competitive market positioning

ROI Analysis:
• Total Investment: $1.2M (technology, training, change management)
• Expected Annual Benefits: $9.5M
• Payback Period: 5 months
• 3-Year NPV: $26.1M at 10% discount rate`,

      goalMetric: `Primary Goals:
1. Reduce average processing time from 21 days to 10 days (52% reduction)
2. Increase application processing capacity by 30%
3. Reduce operational cost per application from $450 to $275 (39% reduction)
4. Improve credit assessment accuracy to 98% (from current 89%)
5. Reduce rework rate from 24% to <5%

Key Performance Indicators:
• Cycle Time: Average days from application to disbursement
• First-Time Right Rate: % of applications processed without errors
• Customer Satisfaction: Net Promoter Score (NPS)
• Default Rate: % of loans in default within 12 months
• Processing Cost: Cost per application processed
• Automation Rate: % of applications processed straight-through
• Employee Satisfaction: eNPS score for loan processing team`,

      expectedDeliverables: `1. Process Documentation
   • Current State Process Maps (SIPOC, VSM)
   • Future State Process Design
   • Standard Operating Procedures (SOPs)
   • Process Control Plans

2. Analysis Reports
   • Root Cause Analysis (Fishbone Diagrams)
   • Risk Assessment (FMEA)
   • Data Analysis & Statistical Reports
   • Pareto Analysis of Delays

3. Improvement Recommendations
   • Quick Wins (0-3 months)
   • Medium-term Improvements (3-6 months)
   • Strategic Initiatives (6-12 months)
   • Technology Enhancement Roadmap

4. Implementation Artifacts
   • Change Management Plan
   • Training Materials & Job Aids
   • Pilot Program Results
   • Benefits Realization Framework

5. Control Mechanisms
   • Process Performance Dashboard
   • Control Charts & Monitoring Plan
   • Audit & Compliance Checklist`,

      // Project Scope
      inScope: `Processes:
• Customer application submission (all channels: branch, online, mobile)
• Document verification and KYC compliance
• Credit assessment and risk analysis
• Collateral valuation and legal review
• Loan structuring and pricing
• Credit committee approval workflow
• Loan documentation and agreement preparation
• Loan disbursement process
• Post-disbursement monitoring (first 90 days)

Product Types:
• Personal loans ($5K - $100K)
• SME business loans ($50K - $2M)
• Mortgage loans ($100K - $5M)
• Working capital facilities

Geographical Coverage:
• All domestic branches (45 locations)
• Digital channels (web and mobile app)

Systems:
• Core Banking System
• Credit Risk Management System
• Document Management System
• Customer Relationship Management (CRM)`,

      outOfScope: `• Corporate/Large Enterprise lending (>$5M)
• Syndicated loans and structured finance
• International/Cross-border lending
• Credit card and consumer credit products
• Investment banking products
• Treasury operations
• Branch network expansion decisions
• Core banking system replacement (infrastructure project)
• Human resource policies and compensation
• Marketing and customer acquisition strategies
• Other banking products (deposits, investments, insurance)
• Legal and compliance policy creation (only process adherence)`,

      // Customer Drivers & Benefits
      drivers: `External Drivers:
• Increasing customer expectations for digital-first banking experience
• Competitive pressure from fintech companies with faster approval times
• Regulatory requirements for enhanced due diligence and compliance
• Economic pressure to optimize operational costs
• Rising customer acquisition costs requiring better conversion rates

Internal Drivers:
• Executive mandate for operational excellence
• Branch staff frustration with manual, repetitive tasks
• IT modernization initiative and digital transformation strategy
• Risk management concerns about credit assessment accuracy
• Audit findings highlighting process control weaknesses
• Employee turnover in loan processing department due to workload`,

      nonFinancialBenefits: `For Customers:
• Faster loan approval and disbursement (50% reduction in wait time)
• Improved transparency and real-time status updates
• Better customer experience through digital channels
• Reduced documentation burden through digitization
• Consistent service quality across all branches

For Employees:
• Reduced manual workload and repetitive tasks
• Enhanced job satisfaction through meaningful work
• Better decision-support tools and data visibility
• Improved collaboration across departments
• Professional development through process improvement training

For Organization:
• Enhanced brand reputation and market positioning
• Improved regulatory compliance and audit readiness
• Better risk management and portfolio quality
• Increased agility to respond to market changes
• Stronger organizational process improvement culture
• Knowledge retention through documented processes`,

      // Leverage
      existingLeverage: `Technology Infrastructure:
• Core banking platform with API capabilities
• Document management system with OCR capability
• Customer portal and mobile banking app
• Data warehouse and business intelligence tools

Process Frameworks:
• Existing credit risk assessment models
• KYC/AML compliance procedures
• Quality control checkpoints
• Audit trail mechanisms

Organizational Assets:
• Experienced credit assessment team
• Six Sigma trained staff members
• Process improvement PMO
• Change management expertise
• Training department infrastructure`,

      futureLeverage: `Process Improvements:
• Standardized workflows can be replicated for other loan products
• Automated credit decisioning models for consumer lending
• Digital document verification process for account opening
• Customer communication templates for other services

Technology Enhancements:
• AI/ML models for credit scoring across product lines
• Robotic Process Automation (RPA) for data entry tasks
• Process mining tools for continuous improvement
• Customer self-service capabilities for other products

Knowledge Transfer:
• Six Sigma methodology expertise for other departments
• Change management approach for future initiatives
• Training materials and best practices documentation
• Process improvement culture and mindset`,

      // Risk, Constraints and Assumptions
      risks: `High Priority Risks:
1. Technology Integration Challenges
   • Risk: System integration delays or failures
   • Impact: Project timeline extension, cost overrun
   • Mitigation: Early technical assessment, phased rollout, dedicated IT resources

2. Resistance to Change
   • Risk: Staff resistance to new processes and systems
   • Impact: Low adoption, process workarounds
   • Mitigation: Comprehensive change management, early involvement, training

3. Regulatory Compliance Issues
   • Risk: New process may not meet regulatory requirements
   • Impact: Compliance violations, fines, reputational damage
   • Mitigation: Legal/compliance review at each phase, external audit

4. Data Quality and Migration
   • Risk: Poor data quality affecting credit decisions
   • Impact: Increased defaults, customer dissatisfaction
   • Mitigation: Data cleansing initiative, validation rules, parallel run

Medium Priority Risks:
• Resource availability constraints during implementation
• Vendor dependency for technology solutions
• Customer adoption of digital channels slower than expected
• Competing priorities from other strategic initiatives`,

      constraints: `Budget Constraints:
• Total project budget capped at $1.2M
• Limited budget for external consultants
• Must leverage existing technology investments

Time Constraints:
• Project must complete within 12 months
• Quick wins must be delivered within 3 months
• Peak loan season (Q4) - limited availability for major changes

Resource Constraints:
• Limited availability of subject matter experts (20% allocation)
• IT resources shared with other projects
• Cannot disrupt ongoing operations during implementation
• Training must be conducted outside business hours

Regulatory Constraints:
• Must maintain compliance with all banking regulations
• Cannot compromise on credit risk assessment rigor
• Audit trail must be maintained for all decisions
• Data privacy requirements must be strictly enforced

Technical Constraints:
• Legacy core banking system limitations
• Must integrate with existing technology stack
• Infrastructure capacity constraints
• Vendor contract limitations`,

      assumptions: `Business Assumptions:
• Management sponsorship and support will continue throughout project
• Current loan volume trends will remain stable
• No major regulatory changes during project period
• Budget and resources will be available as committed

Technical Assumptions:
• Core banking system APIs are functional and documented
• IT infrastructure can support increased transaction volumes
• Third-party integrations are feasible within timeline
• Technology vendors will provide adequate support

Process Assumptions:
• Current process documentation is reasonably accurate
• Key stakeholders will be available for interviews and validation
• Branch staff can participate in pilot programs
• Credit policies will remain stable during implementation

External Assumptions:
• Economic conditions will remain relatively stable
• Competitor landscape will not change dramatically
• Regulatory environment will remain consistent
• Customer behavior patterns will remain predictable

Team Assumptions:
• Project team members will remain stable throughout project
• Subject matter experts have adequate knowledge of processes
• Training infrastructure is sufficient for staff education
• Change management resources are adequate`,

      // Assignment Team
      businessStakeholders: `Executive Sponsors:
• Chief Operating Officer (COO) - Primary sponsor
• Chief Risk Officer (CRO) - Risk oversight
• Chief Information Officer (CIO) - Technology enabler

Business Leaders:
• Head of Retail Banking - Business owner
• Head of SME Banking - Business owner
• Head of Mortgage Banking - Business owner
• Regional Managers (3) - Implementation leads

Operations:
• Credit Operations Manager - Process owner
• Branch Operations Managers (6) - Frontline implementation
• Customer Service Manager - Customer experience
• Quality Assurance Manager - Process controls

Risk & Compliance:
• Credit Risk Department Head - Risk assessment
• Compliance Officer - Regulatory adherence
• Internal Audit Manager - Process validation
• Legal Counsel - Documentation review

Technology:
• IT Systems Manager - Technical implementation
• Business Analyst Team Lead - Requirements
• Infrastructure Manager - System capacity

Support Functions:
• Human Resources Manager - Training & change management
• Finance Controller - Budget and ROI tracking
• Marketing Manager - Customer communication`,

      scheduleItems: {
        create: [
          {
            milestone: 'Form project team',
            startDate: new Date('2025-01-15'),
            endDate: new Date('2025-01-30'),
            order: 1
          },
          {
            milestone: 'Prepare project plan',
            startDate: new Date('2025-02-01'),
            endDate: new Date('2025-02-28'),
            order: 2
          },
          {
            milestone: 'Define phase',
            startDate: new Date('2025-03-01'),
            endDate: new Date('2025-04-15'),
            order: 3
          },
          {
            milestone: 'Measure phase',
            startDate: new Date('2025-04-16'),
            endDate: new Date('2025-05-31'),
            order: 4
          },
          {
            milestone: 'Analysis phase',
            startDate: new Date('2025-06-01'),
            endDate: new Date('2025-07-15'),
            order: 5
          },
          {
            milestone: 'Report preparation',
            startDate: new Date('2025-07-16'),
            endDate: new Date('2025-07-31'),
            order: 6
          },
          {
            milestone: 'Recommendation and action plan discussion',
            startDate: new Date('2025-08-01'),
            endDate: new Date('2025-08-15'),
            order: 7
          },
          {
            milestone: 'Improvement phase',
            startDate: new Date('2025-08-16'),
            endDate: new Date('2025-11-15'),
            order: 8
          },
          {
            milestone: 'Control phase',
            startDate: new Date('2025-11-16'),
            endDate: new Date('2025-12-31'),
            order: 9
          }
        ]
      }
    },
    include: {
      scheduleItems: {
        orderBy: { order: 'asc' }
      }
    }
  })

  console.log('✅ Created comprehensive banking charter')
  console.log('📊 Charter details:')
  console.log(`   - Assignment: ${charter.assignmentName}`)
  console.log(`   - Schedule items: ${charter.scheduleItems.length}`)
  console.log('🎉 Banking charter seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Charter seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
