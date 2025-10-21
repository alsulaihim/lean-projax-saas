import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🏦 Seeding comprehensive banking facility granting assignment...')

  // Get the analyst user
  const analyst = await prisma.user.findUnique({
    where: { email: 'analyst@example.com' }
  })

  if (!analyst) {
    throw new Error('Analyst user not found')
  }

  // Create the main assignment
  const assignment = await prisma.assignment.create({
    data: {
      title: 'Bank Facility Granting Process Improvement',
      objective: 'Reduce loan approval cycle time by 40%, improve accuracy to 99%, and enhance customer satisfaction score to 4.5/5',
      status: 'DRAFT',
      createdById: analyst.id,
    }
  })

  console.log('✅ Created assignment:', assignment.title)

  // Create VOC Statements (Voice of Customer) - using correct schema fields
  const vocStatements = await Promise.all([
    prisma.vOCStatement.create({
      data: {
        assignmentId: assignment.id,
        customerSegment: 'Retail Banking Customers',
        voiceStatement: 'I need faster loan approval process - currently takes too long'
      }
    }),
    prisma.vOCStatement.create({
      data: {
        assignmentId: assignment.id,
        customerSegment: 'Business Banking Customers',
        voiceStatement: 'The documentation requirements are confusing and excessive'
      }
    }),
    prisma.vOCStatement.create({
      data: {
        assignmentId: assignment.id,
        customerSegment: 'All Customer Segments',
        voiceStatement: 'I want real-time updates on my application status'
      }
    }),
    prisma.vOCStatement.create({
      data: {
        assignmentId: assignment.id,
        customerSegment: 'Price-Sensitive Customers',
        voiceStatement: 'The interest rates are not competitive compared to other banks'
      }
    }),
    prisma.vOCStatement.create({
      data: {
        assignmentId: assignment.id,
        customerSegment: 'Business Banking Customers',
        voiceStatement: 'I need flexible repayment options that match my cash flow'
      }
    }),
    prisma.vOCStatement.create({
      data: {
        assignmentId: assignment.id,
        customerSegment: 'Digital-First Customers',
        voiceStatement: 'The online application portal is not user-friendly'
      }
    }),
    prisma.vOCStatement.create({
      data: {
        assignmentId: assignment.id,
        customerSegment: 'Premium Banking Customers',
        voiceStatement: 'I want a dedicated relationship manager throughout the process'
      }
    }),
    prisma.vOCStatement.create({
      data: {
        assignmentId: assignment.id,
        customerSegment: 'All Customer Segments',
        voiceStatement: 'The credit decision criteria are not transparent'
      }
    }),
    prisma.vOCStatement.create({
      data: {
        assignmentId: assignment.id,
        customerSegment: 'Mortgage Customers',
        voiceStatement: 'I need pre-approval before shopping for property'
      }
    }),
    prisma.vOCStatement.create({
      data: {
        assignmentId: assignment.id,
        customerSegment: 'Secured Loan Customers',
        voiceStatement: 'The collateral valuation process delays approval significantly'
      }
    })
  ])

  console.log('✅ Created', vocStatements.length, 'VOC statements')

  // Create CTQ Requirements (Critical to Quality) - using correct schema fields
  const ctqRequirements = await Promise.all([
    prisma.cTQRequirement.create({
      data: {
        assignmentId: assignment.id,
        vocStatementId: vocStatements[0].id,
        ctqDescription: 'Loan approval decision time',
        measurementCriteria: 'Time from complete application to credit decision',
        targetValue: 'Maximum 48 hours for standard loans'
      }
    }),
    prisma.cTQRequirement.create({
      data: {
        assignmentId: assignment.id,
        vocStatementId: vocStatements[1].id,
        ctqDescription: 'Document completeness rate',
        measurementCriteria: 'Percentage of applications submitted with all required documents',
        targetValue: 'Minimum 95% complete on first submission'
      }
    }),
    prisma.cTQRequirement.create({
      data: {
        assignmentId: assignment.id,
        vocStatementId: vocStatements[2].id,
        ctqDescription: 'Application status update frequency',
        measurementCriteria: 'Number of automated status updates sent to customer',
        targetValue: 'Minimum 3 updates per application journey'
      }
    }),
    prisma.cTQRequirement.create({
      data: {
        assignmentId: assignment.id,
        vocStatementId: vocStatements[3].id,
        ctqDescription: 'Interest rate competitiveness',
        measurementCriteria: 'Interest rate position vs top 3 competitors',
        targetValue: 'Within 0.5% of market leader'
      }
    }),
    prisma.cTQRequirement.create({
      data: {
        assignmentId: assignment.id,
        vocStatementId: vocStatements[4].id,
        ctqDescription: 'Repayment flexibility options',
        measurementCriteria: 'Number of repayment schedule options available',
        targetValue: 'Minimum 5 different repayment structures'
      }
    }),
    prisma.cTQRequirement.create({
      data: {
        assignmentId: assignment.id,
        vocStatementId: vocStatements[5].id,
        ctqDescription: 'Online application completion rate',
        measurementCriteria: 'Percentage of started applications that are completed',
        targetValue: 'Minimum 80% completion rate'
      }
    }),
    prisma.cTQRequirement.create({
      data: {
        assignmentId: assignment.id,
        vocStatementId: vocStatements[6].id,
        ctqDescription: 'Relationship manager assignment',
        measurementCriteria: 'Percentage of premium customers with dedicated RM',
        targetValue: '100% for facility > $500K'
      }
    }),
    prisma.cTQRequirement.create({
      data: {
        assignmentId: assignment.id,
        vocStatementId: vocStatements[7].id,
        ctqDescription: 'Credit decision transparency score',
        measurementCriteria: 'Customer understanding of decision factors (survey)',
        targetValue: 'Minimum 4.0/5.0 on transparency survey'
      }
    }),
    prisma.cTQRequirement.create({
      data: {
        assignmentId: assignment.id,
        vocStatementId: vocStatements[8].id,
        ctqDescription: 'Pre-approval turnaround time',
        measurementCriteria: 'Time to issue pre-approval certificate',
        targetValue: 'Maximum 24 hours'
      }
    }),
    prisma.cTQRequirement.create({
      data: {
        assignmentId: assignment.id,
        vocStatementId: vocStatements[9].id,
        ctqDescription: 'Collateral valuation completion time',
        measurementCriteria: 'Days from valuation request to report receipt',
        targetValue: 'Maximum 3 business days'
      }
    })
  ])

  console.log('✅ Created', ctqRequirements.length, 'CTQ requirements')

  // Create 9 Processes with SIPOC data using correct schema
  const processes = []

  // Process 1: Application Submission
  const process1 = await prisma.process.create({
    data: {
      assignmentId: assignment.id,
      processName: 'Customer Application Submission',
      processOwner: 'Branch Manager / Digital Channel Head',
      order: 1,
      lowerSpecLimit: 5,
      targetValue: 10,
      upperSpecLimit: 15,
      sipocEntries: {
        create: [
          // Suppliers
          { column: 'SUPPLIER', order: 1, value: 'Customers (Individual & Business)' },
          { column: 'SUPPLIER', order: 2, value: 'Branch Staff' },
          { column: 'SUPPLIER', order: 3, value: 'Digital Banking Platform' },
          // Inputs
          { column: 'INPUT', order: 1, value: 'Application Form' },
          { column: 'INPUT', order: 2, value: 'Identity Documents (National ID, Passport)' },
          { column: 'INPUT', order: 3, value: 'Income Proof (Salary Certificate, Tax Returns)' },
          { column: 'INPUT', order: 4, value: 'Business Plan (for business loans)' },
          { column: 'INPUT', order: 5, value: 'Financial Statements (3 years)' },
          // Process Steps
          { column: 'PROCESS', order: 1, value: 'Customer accesses application portal or visits branch' },
          { column: 'PROCESS', order: 2, value: 'Customer fills application form with personal/business details' },
          { column: 'PROCESS', order: 3, value: 'Customer uploads required documents' },
          { column: 'PROCESS', order: 4, value: 'System validates form completeness and document quality' },
          { column: 'PROCESS', order: 5, value: 'Application scanned for fraud indicators' },
          { column: 'PROCESS', order: 6, value: 'Customer receives application reference number' },
          { column: 'PROCESS', order: 7, value: 'Confirmation email sent with next steps' },
          { column: 'PROCESS', order: 8, value: 'Application logged in CRM system' },
          { column: 'PROCESS', order: 9, value: 'Initial eligibility check performed' },
          { column: 'PROCESS', order: 10, value: 'Application routed to appropriate loan officer' },
          // Outputs
          { column: 'OUTPUT', order: 1, value: 'Validated Application' },
          { column: 'OUTPUT', order: 2, value: 'Application Reference Number' },
          { column: 'OUTPUT', order: 3, value: 'Initial Eligibility Assessment' },
          { column: 'OUTPUT', order: 4, value: 'Document Package' },
          // Customers
          { column: 'CUSTOMER', order: 1, value: 'Credit Assessment Team' },
          { column: 'CUSTOMER', order: 2, value: 'Document Verification Team' },
          { column: 'CUSTOMER', order: 3, value: 'Customer Service Department' },
        ]
      }
    }
  })
  processes.push(process1)

  // Process 2: Document Verification and KYC
  const process2 = await prisma.process.create({
    data: {
      assignmentId: assignment.id,
      processName: 'Document Verification and KYC',
      processOwner: 'Compliance Officer',
      order: 2,
      lowerSpecLimit: 12,
      targetValue: 18,
      upperSpecLimit: 24,
      sipocEntries: {
        create: [
          { column: 'SUPPLIER', order: 1, value: 'Application Team' },
          { column: 'SUPPLIER', order: 2, value: 'Third-party KYC Providers' },
          { column: 'SUPPLIER', order: 3, value: 'Government Databases' },
          { column: 'SUPPLIER', order: 4, value: 'Credit Bureau' },
          { column: 'INPUT', order: 1, value: 'Identity Documents' },
          { column: 'INPUT', order: 2, value: 'Address Proof' },
          { column: 'INPUT', order: 3, value: 'Financial Statements' },
          { column: 'INPUT', order: 4, value: 'Bank Statements (6 months)' },
          { column: 'PROCESS', order: 1, value: 'Loan officer reviews submitted documents' },
          { column: 'PROCESS', order: 2, value: 'Identity verification against government database' },
          { column: 'PROCESS', order: 3, value: 'Address verification through utility bills' },
          { column: 'PROCESS', order: 4, value: 'Financial statements authenticity check' },
          { column: 'PROCESS', order: 5, value: 'Employment verification with employer' },
          { column: 'PROCESS', order: 6, value: 'Business registration verification' },
          { column: 'PROCESS', order: 7, value: 'Tax filing history review' },
          { column: 'PROCESS', order: 8, value: 'Bank statement analysis for cash flow' },
          { column: 'PROCESS', order: 9, value: 'Cross-reference with credit bureau data' },
          { column: 'PROCESS', order: 10, value: 'AML (Anti-Money Laundering) screening' },
          { column: 'PROCESS', order: 11, value: 'Sanctions list screening' },
          { column: 'PROCESS', order: 12, value: 'PEP (Politically Exposed Person) check' },
          { column: 'PROCESS', order: 13, value: 'Source of funds verification' },
          { column: 'PROCESS', order: 14, value: 'Document discrepancy resolution' },
          { column: 'PROCESS', order: 15, value: 'KYC approval and profile creation' },
          { column: 'OUTPUT', order: 1, value: 'Verified Customer Profile' },
          { column: 'OUTPUT', order: 2, value: 'KYC Compliance Certificate' },
          { column: 'OUTPUT', order: 3, value: 'AML Clearance' },
          { column: 'CUSTOMER', order: 1, value: 'Credit Assessment Team' },
          { column: 'CUSTOMER', order: 2, value: 'Compliance Department' },
        ]
      }
    }
  })
  processes.push(process2)

  // Process 3: Credit Assessment
  const process3 = await prisma.process.create({
    data: {
      assignmentId: assignment.id,
      processName: 'Credit Assessment and Risk Analysis',
      processOwner: 'Senior Credit Analyst',
      order: 3,
      lowerSpecLimit: 24,
      targetValue: 36,
      upperSpecLimit: 48,
      sipocEntries: {
        create: [
          { column: 'SUPPLIER', order: 1, value: 'Credit Bureau' },
          { column: 'SUPPLIER', order: 2, value: 'Document Verification Team' },
          { column: 'SUPPLIER', order: 3, value: 'Risk Department' },
          { column: 'INPUT', order: 1, value: 'Credit Report' },
          { column: 'INPUT', order: 2, value: 'Financial Statements' },
          { column: 'INPUT', order: 3, value: 'Business Performance Data' },
          { column: 'INPUT', order: 4, value: 'Industry Reports' },
          { column: 'PROCESS', order: 1, value: 'Pull credit report from credit bureau' },
          { column: 'PROCESS', order: 2, value: 'Calculate debt-to-income ratio' },
          { column: 'PROCESS', order: 3, value: 'Analyze financial statements (3 years)' },
          { column: 'PROCESS', order: 4, value: 'Calculate liquidity ratios' },
          { column: 'PROCESS', order: 5, value: 'Assess business cash flow stability' },
          { column: 'PROCESS', order: 6, value: 'Review payment history with other lenders' },
          { column: 'PROCESS', order: 7, value: 'Industry and market risk assessment' },
          { column: 'PROCESS', order: 8, value: 'Calculate probability of default (PD)' },
          { column: 'PROCESS', order: 9, value: 'Determine loss given default (LGD)' },
          { column: 'PROCESS', order: 10, value: 'Run internal credit scoring model' },
          { column: 'PROCESS', order: 11, value: 'Assess collateral adequacy' },
          { column: 'PROCESS', order: 12, value: 'Review existing exposure with bank' },
          { column: 'PROCESS', order: 13, value: 'Stress testing under adverse scenarios' },
          { column: 'PROCESS', order: 14, value: 'Risk-adjusted return calculation' },
          { column: 'PROCESS', order: 15, value: 'Generate comprehensive credit assessment report' },
          { column: 'OUTPUT', order: 1, value: 'Credit Score' },
          { column: 'OUTPUT', order: 2, value: 'Risk Rating (AAA to D)' },
          { column: 'OUTPUT', order: 3, value: 'Credit Assessment Report' },
          { column: 'OUTPUT', order: 4, value: 'Preliminary Approval/Rejection' },
          { column: 'CUSTOMER', order: 1, value: 'Credit Committee' },
          { column: 'CUSTOMER', order: 2, value: 'Loan Structuring Team' },
        ]
      }
    }
  })
  processes.push(process3)

  // Process 4: Collateral Valuation
  const process4 = await prisma.process.create({
    data: {
      assignmentId: assignment.id,
      processName: 'Collateral Valuation and Legal Review',
      processOwner: 'Legal and Collateral Manager',
      order: 4,
      lowerSpecLimit: 48,
      targetValue: 60,
      upperSpecLimit: 72,
      sipocEntries: {
        create: [
          { column: 'SUPPLIER', order: 1, value: 'External Valuers (Approved Panel)' },
          { column: 'SUPPLIER', order: 2, value: 'Legal Team' },
          { column: 'SUPPLIER', order: 3, value: 'Land Registry' },
          { column: 'INPUT', order: 1, value: 'Property Details' },
          { column: 'INPUT', order: 2, value: 'Title Deeds' },
          { column: 'INPUT', order: 3, value: 'Property Survey' },
          { column: 'PROCESS', order: 1, value: 'Assign external valuer from approved panel' },
          { column: 'PROCESS', order: 2, value: 'Schedule property inspection' },
          { column: 'PROCESS', order: 3, value: 'Conduct physical property inspection' },
          { column: 'PROCESS', order: 4, value: 'Market comparable analysis' },
          { column: 'PROCESS', order: 5, value: 'Calculate forced sale value' },
          { column: 'PROCESS', order: 6, value: 'Prepare valuation report' },
          { column: 'PROCESS', order: 7, value: 'Legal team reviews title deeds' },
          { column: 'PROCESS', order: 8, value: 'Land registry search for encumbrances' },
          { column: 'PROCESS', order: 9, value: 'Verify property ownership' },
          { column: 'PROCESS', order: 10, value: 'Check for legal disputes or litigation' },
          { column: 'PROCESS', order: 11, value: 'Review zoning and development permissions' },
          { column: 'PROCESS', order: 12, value: 'Environmental compliance check' },
          { column: 'PROCESS', order: 13, value: 'Calculate loan-to-value (LTV) ratio' },
          { column: 'PROCESS', order: 14, value: 'Determine acceptable collateral coverage' },
          { column: 'PROCESS', order: 15, value: 'Legal opinion on enforceability' },
          { column: 'OUTPUT', order: 1, value: 'Collateral Valuation Certificate' },
          { column: 'OUTPUT', order: 2, value: 'Legal Opinion' },
          { column: 'OUTPUT', order: 3, value: 'LTV Ratio Calculation' },
          { column: 'CUSTOMER', order: 1, value: 'Credit Committee' },
          { column: 'CUSTOMER', order: 2, value: 'Loan Documentation Team' },
        ]
      }
    }
  })
  processes.push(process4)

  // Process 5: Loan Structuring
  const process5 = await prisma.process.create({
    data: {
      assignmentId: assignment.id,
      processName: 'Loan Structuring and Pricing',
      processOwner: 'Product Manager - Lending',
      order: 5,
      lowerSpecLimit: 8,
      targetValue: 12,
      upperSpecLimit: 16,
      sipocEntries: {
        create: [
          { column: 'SUPPLIER', order: 1, value: 'Credit Assessment Team' },
          { column: 'SUPPLIER', order: 2, value: 'Treasury Department' },
          { column: 'SUPPLIER', order: 3, value: 'Risk Department' },
          { column: 'INPUT', order: 1, value: 'Risk Rating' },
          { column: 'INPUT', order: 2, value: 'Collateral Value' },
          { column: 'INPUT', order: 3, value: 'Market Interest Rates' },
          { column: 'INPUT', order: 4, value: 'Customer Cash Flow Projections' },
          { column: 'PROCESS', order: 1, value: 'Determine optimal loan amount' },
          { column: 'PROCESS', order: 2, value: 'Calculate tenor based on cash flow' },
          { column: 'PROCESS', order: 3, value: 'Structure repayment schedule' },
          { column: 'PROCESS', order: 4, value: 'Determine interest rate based on risk' },
          { column: 'PROCESS', order: 5, value: 'Calculate processing fees' },
          { column: 'PROCESS', order: 6, value: 'Define prepayment terms' },
          { column: 'PROCESS', order: 7, value: 'Establish covenants and conditions' },
          { column: 'PROCESS', order: 8, value: 'Structure grace period if applicable' },
          { column: 'PROCESS', order: 9, value: 'Define draw-down schedule' },
          { column: 'PROCESS', order: 10, value: 'Set monitoring and reporting requirements' },
          { column: 'PROCESS', order: 11, value: 'Determine guarantee requirements' },
          { column: 'PROCESS', order: 12, value: 'Calculate total cost to customer' },
          { column: 'PROCESS', order: 13, value: 'Prepare comparative scenarios' },
          { column: 'PROCESS', order: 14, value: 'Risk-adjusted pricing validation' },
          { column: 'PROCESS', order: 15, value: 'Generate formal loan offer letter' },
          { column: 'OUTPUT', order: 1, value: 'Loan Terms Sheet' },
          { column: 'OUTPUT', order: 2, value: 'Pricing Proposal' },
          { column: 'OUTPUT', order: 3, value: 'Repayment Schedule' },
          { column: 'OUTPUT', order: 4, value: 'Loan Offer Letter' },
          { column: 'CUSTOMER', order: 1, value: 'Customer' },
          { column: 'CUSTOMER', order: 2, value: 'Credit Committee' },
        ]
      }
    }
  })
  processes.push(process5)

  // Process 6: Credit Committee Approval
  const process6 = await prisma.process.create({
    data: {
      assignmentId: assignment.id,
      processName: 'Credit Committee Approval',
      processOwner: 'Chief Credit Officer',
      order: 6,
      lowerSpecLimit: 24,
      targetValue: 36,
      upperSpecLimit: 48,
      sipocEntries: {
        create: [
          { column: 'SUPPLIER', order: 1, value: 'Credit Assessment Team' },
          { column: 'SUPPLIER', order: 2, value: 'Loan Structuring Team' },
          { column: 'SUPPLIER', order: 3, value: 'Risk Department' },
          { column: 'INPUT', order: 1, value: 'Credit Memo' },
          { column: 'INPUT', order: 2, value: 'Valuation Report' },
          { column: 'INPUT', order: 3, value: 'Financial Analysis' },
          { column: 'INPUT', order: 4, value: 'Loan Terms Proposal' },
          { column: 'PROCESS', order: 1, value: 'Prepare comprehensive credit memo' },
          { column: 'PROCESS', order: 2, value: 'Compile all supporting documents' },
          { column: 'PROCESS', order: 3, value: 'Schedule credit committee meeting' },
          { column: 'PROCESS', order: 4, value: 'Present case to committee members' },
          { column: 'PROCESS', order: 5, value: 'Highlight key risks and mitigants' },
          { column: 'PROCESS', order: 6, value: 'Answer committee questions and concerns' },
          { column: 'PROCESS', order: 7, value: 'Committee deliberation' },
          { column: 'PROCESS', order: 8, value: 'Vote on approval/rejection/defer' },
          { column: 'PROCESS', order: 9, value: 'Define conditions precedent' },
          { column: 'PROCESS', order: 10, value: 'Set conditions subsequent' },
          { column: 'PROCESS', order: 11, value: 'Establish monitoring requirements' },
          { column: 'PROCESS', order: 12, value: 'Document committee decision' },
          { column: 'PROCESS', order: 13, value: 'Communicate decision to loan officer' },
          { column: 'PROCESS', order: 14, value: 'Update application status in system' },
          { column: 'PROCESS', order: 15, value: 'Generate approval/rejection letter' },
          { column: 'OUTPUT', order: 1, value: 'Approval Decision' },
          { column: 'OUTPUT', order: 2, value: 'Conditions Precedent List' },
          { column: 'OUTPUT', order: 3, value: 'Conditions Subsequent List' },
          { column: 'OUTPUT', order: 4, value: 'Committee Minutes' },
          { column: 'CUSTOMER', order: 1, value: 'Loan Documentation Team' },
          { column: 'CUSTOMER', order: 2, value: 'Customer' },
        ]
      }
    }
  })
  processes.push(process6)

  // Process 7: Documentation
  const process7 = await prisma.process.create({
    data: {
      assignmentId: assignment.id,
      processName: 'Loan Documentation and Agreement',
      processOwner: 'Legal Documentation Manager',
      order: 7,
      lowerSpecLimit: 72,
      targetValue: 96,
      upperSpecLimit: 120,
      sipocEntries: {
        create: [
          { column: 'SUPPLIER', order: 1, value: 'Legal Team' },
          { column: 'SUPPLIER', order: 2, value: 'Loan Officer' },
          { column: 'SUPPLIER', order: 3, value: 'Customer' },
          { column: 'INPUT', order: 1, value: 'Approved Terms' },
          { column: 'INPUT', order: 2, value: 'Legal Templates' },
          { column: 'INPUT', order: 3, value: 'Customer Information' },
          { column: 'INPUT', order: 4, value: 'Collateral Details' },
          { column: 'PROCESS', order: 1, value: 'Prepare loan agreement from template' },
          { column: 'PROCESS', order: 2, value: 'Customize terms based on approval' },
          { column: 'PROCESS', order: 3, value: 'Prepare security documents' },
          { column: 'PROCESS', order: 4, value: 'Prepare guarantee documents if required' },
          { column: 'PROCESS', order: 5, value: 'Legal review of all documents' },
          { column: 'PROCESS', order: 6, value: 'Compliance review of documentation' },
          { column: 'PROCESS', order: 7, value: 'Send documents to customer for review' },
          { column: 'PROCESS', order: 8, value: 'Address customer queries on terms' },
          { column: 'PROCESS', order: 9, value: 'Schedule signing appointment' },
          { column: 'PROCESS', order: 10, value: 'Verify signatory authority' },
          { column: 'PROCESS', order: 11, value: 'Witness document signing' },
          { column: 'PROCESS', order: 12, value: 'Notarization where required' },
          { column: 'PROCESS', order: 13, value: 'Collect original documents' },
          { column: 'PROCESS', order: 14, value: 'Register security interests' },
          { column: 'PROCESS', order: 15, value: 'Obtain insurance policies' },
          { column: 'PROCESS', order: 16, value: 'Complete regulatory reporting' },
          { column: 'PROCESS', order: 17, value: 'Update loan management system' },
          { column: 'OUTPUT', order: 1, value: 'Signed Loan Agreement' },
          { column: 'OUTPUT', order: 2, value: 'Security Documents' },
          { column: 'OUTPUT', order: 3, value: 'Registered Collateral' },
          { column: 'OUTPUT', order: 4, value: 'Insurance Certificates' },
          { column: 'CUSTOMER', order: 1, value: 'Disbursement Team' },
          { column: 'CUSTOMER', order: 2, value: 'Legal Records Department' },
        ]
      }
    }
  })
  processes.push(process7)

  // Process 8: Disbursement
  const process8 = await prisma.process.create({
    data: {
      assignmentId: assignment.id,
      processName: 'Loan Disbursement',
      processOwner: 'Treasury Manager',
      order: 8,
      lowerSpecLimit: 2,
      targetValue: 4,
      upperSpecLimit: 8,
      sipocEntries: {
        create: [
          { column: 'SUPPLIER', order: 1, value: 'Treasury Department' },
          { column: 'SUPPLIER', order: 2, value: 'Loan Documentation Team' },
          { column: 'SUPPLIER', order: 3, value: 'Operations Team' },
          { column: 'INPUT', order: 1, value: 'Signed Loan Agreement' },
          { column: 'INPUT', order: 2, value: 'Disbursement Instructions' },
          { column: 'INPUT', order: 3, value: 'Conditions Precedent Checklist' },
          { column: 'PROCESS', order: 1, value: 'Verify all conditions precedent met' },
          { column: 'PROCESS', order: 2, value: 'Validate signed documentation received' },
          { column: 'PROCESS', order: 3, value: 'Verify collateral registration complete' },
          { column: 'PROCESS', order: 4, value: 'Check insurance policies in place' },
          { column: 'PROCESS', order: 5, value: 'Validate disbursement instructions' },
          { column: 'PROCESS', order: 6, value: 'Verify customer account details' },
          { column: 'PROCESS', order: 7, value: 'Obtain final disbursement approval' },
          { column: 'PROCESS', order: 8, value: 'Create disbursement voucher' },
          { column: 'PROCESS', order: 9, value: 'Execute fund transfer' },
          { column: 'PROCESS', order: 10, value: 'Generate disbursement confirmation' },
          { column: 'PROCESS', order: 11, value: 'Send confirmation to customer' },
          { column: 'PROCESS', order: 12, value: 'Update loan account with disbursement' },
          { column: 'PROCESS', order: 13, value: 'Generate repayment schedule' },
          { column: 'PROCESS', order: 14, value: 'Set up standing instructions if applicable' },
          { column: 'PROCESS', order: 15, value: 'Activate monitoring alerts' },
          { column: 'OUTPUT', order: 1, value: 'Disbursed Funds' },
          { column: 'OUTPUT', order: 2, value: 'Disbursement Confirmation' },
          { column: 'OUTPUT', order: 3, value: 'Active Loan Account' },
          { column: 'OUTPUT', order: 4, value: 'Repayment Schedule' },
          { column: 'CUSTOMER', order: 1, value: 'Customer' },
          { column: 'CUSTOMER', order: 2, value: 'Relationship Manager' },
          { column: 'CUSTOMER', order: 3, value: 'Accounting Department' },
        ]
      }
    }
  })
  processes.push(process8)

  // Process 9: Post-Disbursement Monitoring
  const process9 = await prisma.process.create({
    data: {
      assignmentId: assignment.id,
      processName: 'Post-Disbursement Monitoring',
      processOwner: 'Relationship Manager',
      order: 9,
      lowerSpecLimit: 720, // Monthly monitoring
      targetValue: 720,
      upperSpecLimit: 1440,
      sipocEntries: {
        create: [
          { column: 'SUPPLIER', order: 1, value: 'Relationship Manager' },
          { column: 'SUPPLIER', order: 2, value: 'MIS Department' },
          { column: 'SUPPLIER', order: 3, value: 'Customer' },
          { column: 'INPUT', order: 1, value: 'Loan Agreement Terms' },
          { column: 'INPUT', order: 2, value: 'Repayment Data' },
          { column: 'INPUT', order: 3, value: 'Financial Statements (Periodic)' },
          { column: 'INPUT', order: 4, value: 'Market Intelligence' },
          { column: 'PROCESS', order: 1, value: 'Set up account monitoring parameters' },
          { column: 'PROCESS', order: 2, value: 'Track repayment schedules' },
          { column: 'PROCESS', order: 3, value: 'Monitor account conduct' },
          { column: 'PROCESS', order: 4, value: 'Review periodic financial statements' },
          { column: 'PROCESS', order: 5, value: 'Verify covenant compliance' },
          { column: 'PROCESS', order: 6, value: 'Track collateral value changes' },
          { column: 'PROCESS', order: 7, value: 'Monitor industry trends' },
          { column: 'PROCESS', order: 8, value: 'Conduct periodic customer visits' },
          { column: 'PROCESS', order: 9, value: 'Review relationship profitability' },
          { column: 'PROCESS', order: 10, value: 'Identify cross-sell opportunities' },
          { column: 'PROCESS', order: 11, value: 'Generate monthly monitoring reports' },
          { column: 'PROCESS', order: 12, value: 'Escalate early warning signals' },
          { column: 'PROCESS', order: 13, value: 'Update risk rating quarterly' },
          { column: 'PROCESS', order: 14, value: 'Assess need for restructuring' },
          { column: 'PROCESS', order: 15, value: 'Maintain customer communication' },
          { column: 'OUTPUT', order: 1, value: 'Monitoring Reports' },
          { column: 'OUTPUT', order: 2, value: 'Early Warning Alerts' },
          { column: 'OUTPUT', order: 3, value: 'Updated Risk Rating' },
          { column: 'OUTPUT', order: 4, value: 'Portfolio Quality Metrics' },
          { column: 'CUSTOMER', order: 1, value: 'Credit Risk Department' },
          { column: 'CUSTOMER', order: 2, value: 'Senior Management' },
        ]
      }
    }
  })
  processes.push(process9)

  console.log('✅ Created', processes.length, 'SIPOC processes with detailed entries')

  // Create FMEA Entries - using correct schema fields
  const fmeaEntries = await Promise.all([
    // High Risk FMEAs
    prisma.fMEAEntry.create({
      data: {
        assignmentId: assignment.id,
        processId: process3.id,
        failureMode: 'Inaccurate credit scoring due to outdated credit bureau data',
        effectsOfFailure: 'Wrong credit decision leading to defaults or missed opportunities',
        severity: 9,
        potentialCauses: 'Credit bureau not updated in real-time, data lag of 30-60 days',
        occurrence: 7,
        currentControls: 'Monthly bureau refresh, manual override by senior credit officer',
        detection: 4,
        rpn: 252,
        recommendedActions: 'Implement real-time credit bureau API integration'
      }
    }),
    prisma.fMEAEntry.create({
      data: {
        assignmentId: assignment.id,
        processId: process2.id,
        failureMode: 'Fraudulent document submission not detected',
        effectsOfFailure: 'Loan granted to unqualified customer, high risk of default and legal issues',
        severity: 10,
        potentialCauses: 'Manual verification process, lack of AI-based fraud detection tools',
        occurrence: 5,
        currentControls: 'Two-level manual review, random sample audit',
        detection: 5,
        rpn: 250,
        recommendedActions: 'Deploy AI-powered document authentication system'
      }
    }),
    prisma.fMEAEntry.create({
      data: {
        assignmentId: assignment.id,
        processId: process4.id,
        failureMode: 'Overvaluation of collateral by external valuer',
        effectsOfFailure: 'Insufficient collateral coverage leading to higher losses in default',
        severity: 8,
        potentialCauses: 'Valuer conflict of interest, pressure to complete transactions',
        occurrence: 6,
        currentControls: 'Approved valuer panel, random second valuation on high-value properties',
        detection: 5,
        rpn: 240,
        recommendedActions: 'Implement automated valuation models (AVM)'
      }
    }),
    prisma.fMEAEntry.create({
      data: {
        assignmentId: assignment.id,
        processId: process1.id,
        failureMode: 'Incomplete application submitted due to unclear requirements',
        effectsOfFailure: 'Delays in processing, customer frustration, increased operational cost',
        severity: 6,
        potentialCauses: 'Confusing application form, lack of upfront guidance',
        occurrence: 8,
        currentControls: 'FAQ section, call center support',
        detection: 4,
        rpn: 192,
        recommendedActions: 'Redesign application with step-by-step wizard'
      }
    }),
    prisma.fMEAEntry.create({
      data: {
        assignmentId: assignment.id,
        processId: process9.id,
        failureMode: 'Customer financial statements not received as per covenant',
        effectsOfFailure: 'Unable to monitor performance, breach of covenant undetected',
        severity: 6,
        potentialCauses: 'No automated reminder system, customer forgetfulness',
        occurrence: 8,
        currentControls: 'Manual email reminders',
        detection: 4,
        rpn: 192,
        recommendedActions: 'Automated covenant tracking system with customer portal'
      }
    }),
    prisma.fMEAEntry.create({
      data: {
        assignmentId: assignment.id,
        processId: process7.id,
        failureMode: 'Legal documentation errors or missing clauses',
        effectsOfFailure: 'Unenforceable security, legal disputes, regulatory penalties',
        severity: 9,
        potentialCauses: 'Template not updated with latest regulations, human error',
        occurrence: 4,
        currentControls: 'Legal review, template version control',
        detection: 5,
        rpn: 180,
        recommendedActions: 'Implement automated document generation system'
      }
    }),
    prisma.fMEAEntry.create({
      data: {
        assignmentId: assignment.id,
        processId: process6.id,
        failureMode: 'Inconsistent credit decisions across different committees',
        effectsOfFailure: 'Reputational risk, potential discrimination issues, portfolio quality variance',
        severity: 7,
        potentialCauses: 'Lack of standardized decision framework, subjective judgments',
        occurrence: 5,
        currentControls: 'Written credit policy, decision documentation',
        detection: 5,
        rpn: 175,
        recommendedActions: 'Develop credit decision scorecards'
      }
    }),
    prisma.fMEAEntry.create({
      data: {
        assignmentId: assignment.id,
        processId: process3.id,
        failureMode: 'Industry risk factors not adequately considered',
        effectsOfFailure: 'Concentration risk in portfolio, sector-specific losses',
        severity: 8,
        potentialCauses: 'Limited industry expertise, no centralized industry risk database',
        occurrence: 4,
        currentControls: 'Industry reports, external research',
        detection: 5,
        rpn: 160,
        recommendedActions: 'Establish sector specialist team'
      }
    }),
    prisma.fMEAEntry.create({
      data: {
        assignmentId: assignment.id,
        processId: process3.id,
        failureMode: 'Financial statement analysis errors',
        effectsOfFailure: 'Incorrect risk assessment, wrong pricing or loan rejection',
        severity: 7,
        potentialCauses: 'Manual calculations, complex financial statements, time pressure',
        occurrence: 5,
        currentControls: 'Senior analyst review, ratio calculation templates',
        detection: 4,
        rpn: 140,
        recommendedActions: 'Implement automated financial spreading tool'
      }
    }),
    prisma.fMEAEntry.create({
      data: {
        assignmentId: assignment.id,
        processId: process5.id,
        failureMode: 'Non-competitive pricing due to slow market rate updates',
        effectsOfFailure: 'Lost business to competitors, lower market share',
        severity: 5,
        potentialCauses: 'Manual rate review process, weekly updates',
        occurrence: 7,
        currentControls: 'Weekly pricing committee',
        detection: 4,
        rpn: 140,
        recommendedActions: 'Real-time competitive intelligence dashboard'
      }
    }),
    prisma.fMEAEntry.create({
      data: {
        assignmentId: assignment.id,
        processId: process8.id,
        failureMode: 'Funds disbursed before all conditions precedent are met',
        effectsOfFailure: 'Increased credit risk, compliance violations',
        severity: 8,
        potentialCauses: 'Pressure to meet disbursement targets, inadequate verification',
        occurrence: 4,
        currentControls: 'Checklist review, dual authorization',
        detection: 4,
        rpn: 128,
        recommendedActions: 'System-enforced checklist with hard stops'
      }
    }),
    prisma.fMEAEntry.create({
      data: {
        assignmentId: assignment.id,
        processId: process5.id,
        failureMode: 'Loan structure misaligned with customer cash flow',
        effectsOfFailure: 'Customer struggles with repayment, potential default',
        severity: 7,
        potentialCauses: 'Insufficient cash flow analysis',
        occurrence: 6,
        currentControls: 'Cash flow projection review',
        detection: 3,
        rpn: 126,
        recommendedActions: 'Develop cash flow modeling tool'
      }
    }),
    prisma.fMEAEntry.create({
      data: {
        assignmentId: assignment.id,
        processId: process9.id,
        failureMode: 'Early warning signals of deterioration not detected',
        effectsOfFailure: 'Loan deteriorates to default before corrective action taken',
        severity: 8,
        potentialCauses: 'Manual monitoring, high portfolio per RM',
        occurrence: 5,
        currentControls: 'Monthly review meetings',
        detection: 3,
        rpn: 120,
        recommendedActions: 'Implement predictive analytics for early warning'
      }
    }),
    prisma.fMEAEntry.create({
      data: {
        assignmentId: assignment.id,
        processId: process4.id,
        failureMode: 'Delayed collateral valuation during market volatility',
        effectsOfFailure: 'Application delays, outdated valuations',
        severity: 6,
        potentialCauses: 'Limited valuer capacity, complex properties',
        occurrence: 5,
        currentControls: 'Expanded valuer panel',
        detection: 3,
        rpn: 90,
        recommendedActions: 'Implement AVM for standard properties'
      }
    }),
    prisma.fMEAEntry.create({
      data: {
        assignmentId: assignment.id,
        processId: process7.id,
        failureMode: 'Customer delays in document signing',
        effectsOfFailure: 'Extended cycle time, potential deal fall-through',
        severity: 6,
        potentialCauses: 'Customer scheduling conflicts',
        occurrence: 7,
        currentControls: 'Flexible appointment scheduling',
        detection: 2,
        rpn: 84,
        recommendedActions: 'Implement e-signature capability'
      }
    }),
    prisma.fMEAEntry.create({
      data: {
        assignmentId: assignment.id,
        processId: process2.id,
        failureMode: 'Sanctions screening not covering all required lists',
        effectsOfFailure: 'Regulatory penalties, reputational damage',
        severity: 10,
        potentialCauses: 'Screening tool not updated with latest sanctions lists',
        occurrence: 2,
        currentControls: 'Monthly screening tool update',
        detection: 4,
        rpn: 80,
        recommendedActions: 'Real-time sanctions list integration'
      }
    }),
    prisma.fMEAEntry.create({
      data: {
        assignmentId: assignment.id,
        processId: process8.id,
        failureMode: 'Incorrect disbursement amount or account',
        effectsOfFailure: 'Operational loss, customer complaint',
        severity: 7,
        potentialCauses: 'Manual data entry errors',
        occurrence: 3,
        currentControls: 'Dual verification, maker-checker',
        detection: 3,
        rpn: 63,
        recommendedActions: 'Straight-through processing automation'
      }
    }),
    prisma.fMEAEntry.create({
      data: {
        assignmentId: assignment.id,
        processId: process6.id,
        failureMode: 'Credit committee quorum not achieved causing delays',
        effectsOfFailure: 'Application delays, lost opportunities',
        severity: 5,
        potentialCauses: 'Committee member availability conflicts',
        occurrence: 6,
        currentControls: 'Scheduled meeting calendar',
        detection: 2,
        rpn: 60,
        recommendedActions: 'Implement digital approval workflow'
      }
    }),
    prisma.fMEAEntry.create({
      data: {
        assignmentId: assignment.id,
        processId: process2.id,
        failureMode: 'KYC verification delay due to third-party API failures',
        effectsOfFailure: 'Extended processing time, customer frustration',
        severity: 5,
        potentialCauses: 'External service dependency',
        occurrence: 6,
        currentControls: 'SLA monitoring',
        detection: 2,
        rpn: 60,
        recommendedActions: 'Multi-vendor KYC strategy'
      }
    }),
    prisma.fMEAEntry.create({
      data: {
        assignmentId: assignment.id,
        processId: process1.id,
        failureMode: 'System downtime during peak application hours',
        effectsOfFailure: 'Lost applications, customer dissatisfaction',
        severity: 6,
        potentialCauses: 'Server capacity limitations',
        occurrence: 4,
        currentControls: 'Load balancing',
        detection: 2,
        rpn: 48,
        recommendedActions: 'Cloud infrastructure scaling'
      }
    })
  ])

  console.log('✅ Created', fmeaEntries.length, 'FMEA entries')

  // Create Recommendations - using correct schema fields
  const recommendations = await Promise.all([
    prisma.recommendation.create({
      data: {
        assignmentId: assignment.id,
        recommendationTitle: 'Implement End-to-End Loan Origination System (LOS)',
        description: 'Deploy a modern, cloud-based loan origination system with workflow automation, document management, and real-time status tracking.',
        expectedImpact: 'Reduce approval cycle time by 50%, improve accuracy by 30%',
        implementationDifficulty: 'MEDIUM',
        estimatedCostSavings: '$8,000,000 annually',
        linkedFMEAIds: [fmeaEntries[3].id],
        linkedFishboneCauseIds: [],
        status: 'PROPOSED'
      }
    }),
    prisma.recommendation.create({
      data: {
        assignmentId: assignment.id,
        recommendationTitle: 'Deploy AI-Powered Credit Risk Assessment',
        description: 'Implement machine learning models for credit scoring with alternative data sources and explainable AI decisions.',
        expectedImpact: 'Improve default prediction accuracy by 25%, reduce credit losses by 15%',
        implementationDifficulty: 'HIGH',
        estimatedCostSavings: '$12,000,000 annually',
        linkedFMEAIds: [fmeaEntries[0].id],
        linkedFishboneCauseIds: [],
        status: 'PROPOSED'
      }
    }),
    prisma.recommendation.create({
      data: {
        assignmentId: assignment.id,
        recommendationTitle: 'Establish Digital Customer Portal',
        description: 'Create customer portal for real-time tracking, document upload, and e-signing.',
        expectedImpact: 'Reduce customer inquiries by 60%, improve CSAT to 4.5/5',
        implementationDifficulty: 'MEDIUM',
        estimatedCostSavings: '$4,500,000 annually',
        linkedFMEAIds: [],
        linkedFishboneCauseIds: [],
        status: 'IMPLEMENTED'
      }
    }),
    prisma.recommendation.create({
      data: {
        assignmentId: assignment.id,
        recommendationTitle: 'Implement Real-Time Credit Bureau Integration',
        description: 'Replace monthly credit bureau refresh with real-time API integration.',
        expectedImpact: 'Reduce credit decision errors by 35%, improve risk-adjusted returns',
        implementationDifficulty: 'LOW',
        estimatedCostSavings: '$3,200,000 annually',
        linkedFMEAIds: [fmeaEntries[0].id],
        linkedFishboneCauseIds: [],
        status: 'PROPOSED'
      }
    }),
    prisma.recommendation.create({
      data: {
        assignmentId: assignment.id,
        recommendationTitle: 'Deploy Automated Valuation Model (AVM)',
        description: 'Implement AVM for standard residential properties to provide instant valuations.',
        expectedImpact: 'Reduce valuation time from 72 hours to 2 hours for 70% of cases',
        implementationDifficulty: 'MEDIUM',
        estimatedCostSavings: '$2,800,000 annually',
        linkedFMEAIds: [fmeaEntries[2].id, fmeaEntries[13].id],
        linkedFishboneCauseIds: [],
        status: 'PROPOSED'
      }
    }),
    prisma.recommendation.create({
      data: {
        assignmentId: assignment.id,
        recommendationTitle: 'Centralized Document Verification Hub',
        description: 'Create specialized team using AI-powered document authentication tools.',
        expectedImpact: 'Reduce fraud losses by 80%, improve verification time by 50%',
        implementationDifficulty: 'MEDIUM',
        estimatedCostSavings: '$5,500,000 annually',
        linkedFMEAIds: [fmeaEntries[1].id],
        linkedFishboneCauseIds: [],
        status: 'PROPOSED'
      }
    }),
    prisma.recommendation.create({
      data: {
        assignmentId: assignment.id,
        recommendationTitle: 'Digital Signature and E-Documentation',
        description: 'Deploy e-signature platform to eliminate physical paperwork.',
        expectedImpact: 'Reduce documentation time from 5 days to 1 day',
        implementationDifficulty: 'LOW',
        estimatedCostSavings: '$2,200,000 annually',
        linkedFMEAIds: [fmeaEntries[14].id],
        linkedFishboneCauseIds: [],
        status: 'IMPLEMENTED'
      }
    }),
    prisma.recommendation.create({
      data: {
        assignmentId: assignment.id,
        recommendationTitle: 'Automated Financial Spreading Tool',
        description: 'AI-powered financial statement analysis with automatic ratio calculations.',
        expectedImpact: 'Reduce analysis time by 70%, improve accuracy by 40%',
        implementationDifficulty: 'MEDIUM',
        estimatedCostSavings: '$1,800,000 annually',
        linkedFMEAIds: [fmeaEntries[8].id],
        linkedFishboneCauseIds: [],
        status: 'PROPOSED'
      }
    }),
    prisma.recommendation.create({
      data: {
        assignmentId: assignment.id,
        recommendationTitle: 'Dynamic Pricing Engine',
        description: 'Real-time pricing engine considering market rates, risk, and competitor pricing.',
        expectedImpact: 'Improve win rate by 15%, increase margin by 0.3%',
        implementationDifficulty: 'MEDIUM',
        estimatedCostSavings: '$6,500,000 annually',
        linkedFMEAIds: [fmeaEntries[9].id],
        linkedFishboneCauseIds: [],
        status: 'PROPOSED'
      }
    }),
    prisma.recommendation.create({
      data: {
        assignmentId: assignment.id,
        recommendationTitle: 'Predictive Early Warning System',
        description: 'ML-based monitoring to predict deterioration 6 months in advance.',
        expectedImpact: 'Reduce NPL ratio by 30%, improve recovery rates by 25%',
        implementationDifficulty: 'HIGH',
        estimatedCostSavings: '$15,000,000 annually',
        linkedFMEAIds: [fmeaEntries[12].id],
        linkedFishboneCauseIds: [],
        status: 'PROPOSED'
      }
    }),
    prisma.recommendation.create({
      data: {
        assignmentId: assignment.id,
        recommendationTitle: 'Credit Decision Governance Framework',
        description: 'Standardize credit decisions with scorecards and analytics.',
        expectedImpact: 'Improve decision consistency by 40%, reduce committee time by 30%',
        implementationDifficulty: 'LOW',
        estimatedCostSavings: '$1,500,000 annually',
        linkedFMEAIds: [fmeaEntries[6].id],
        linkedFishboneCauseIds: [],
        status: 'PROPOSED'
      }
    }),
    prisma.recommendation.create({
      data: {
        assignmentId: assignment.id,
        recommendationTitle: 'Robotic Process Automation (RPA)',
        description: 'Automate repetitive tasks like data entry, document routing, status updates.',
        expectedImpact: 'Reduce operational costs by 35%, eliminate 80% of manual errors',
        implementationDifficulty: 'MEDIUM',
        estimatedCostSavings: '$3,500,000 annually',
        linkedFMEAIds: [],
        linkedFishboneCauseIds: [],
        status: 'IMPLEMENTED'
      }
    }),
    prisma.recommendation.create({
      data: {
        assignmentId: assignment.id,
        recommendationTitle: 'Customer Mobile Application',
        description: 'Mobile app for loan application with biometric authentication.',
        expectedImpact: 'Increase digital application rate from 40% to 75%',
        implementationDifficulty: 'MEDIUM',
        estimatedCostSavings: '$3,200,000 annually',
        linkedFMEAIds: [],
        linkedFishboneCauseIds: [],
        status: 'PROPOSED'
      }
    }),
    prisma.recommendation.create({
      data: {
        assignmentId: assignment.id,
        recommendationTitle: 'Automated Covenant Tracking System',
        description: 'System to track covenants, send reminders, and alert breaches.',
        expectedImpact: 'Improve covenant compliance monitoring from 60% to 95%',
        implementationDifficulty: 'LOW',
        estimatedCostSavings: '$1,200,000 annually',
        linkedFMEAIds: [fmeaEntries[4].id],
        linkedFishboneCauseIds: [],
        status: 'PROPOSED'
      }
    }),
    prisma.recommendation.create({
      data: {
        assignmentId: assignment.id,
        recommendationTitle: 'Industry Risk Intelligence Platform',
        description: 'Centralized platform with industry reports and risk indicators.',
        expectedImpact: 'Improve sector risk assessment, reduce concentration risk',
        implementationDifficulty: 'MEDIUM',
        estimatedCostSavings: '$2,500,000 annually',
        linkedFMEAIds: [fmeaEntries[7].id],
        linkedFishboneCauseIds: [],
        status: 'PROPOSED'
      }
    }),
    prisma.recommendation.create({
      data: {
        assignmentId: assignment.id,
        recommendationTitle: 'Real-Time Sanctions Screening',
        description: 'Continuous sanctions and PEP screening with automated case management.',
        expectedImpact: 'Eliminate regulatory penalties, ensure 100% compliance',
        implementationDifficulty: 'MEDIUM',
        estimatedCostSavings: 'Risk mitigation',
        linkedFMEAIds: [fmeaEntries[15].id],
        linkedFishboneCauseIds: [],
        status: 'PROPOSED'
      }
    }),
    prisma.recommendation.create({
      data: {
        assignmentId: assignment.id,
        recommendationTitle: 'Loan Officer Performance Dashboard',
        description: 'Analytics dashboard for productivity, quality metrics, and training needs.',
        expectedImpact: 'Improve officer productivity by 20%',
        implementationDifficulty: 'LOW',
        estimatedCostSavings: '$1,500,000 annually',
        linkedFMEAIds: [],
        linkedFishboneCauseIds: [],
        status: 'PROPOSED'
      }
    }),
    prisma.recommendation.create({
      data: {
        assignmentId: assignment.id,
        recommendationTitle: 'Pre-Approval Program',
        description: 'Fast-track pre-approval for qualified customers with instant in-principle approval.',
        expectedImpact: 'Increase conversion rate by 25%, competitive advantage',
        implementationDifficulty: 'MEDIUM',
        estimatedCostSavings: '$4,000,000 annually',
        linkedFMEAIds: [],
        linkedFishboneCauseIds: [],
        status: 'PROPOSED'
      }
    }),
    prisma.recommendation.create({
      data: {
        assignmentId: assignment.id,
        recommendationTitle: 'Cross-Functional Process Improvement Team',
        description: 'Permanent team for continuous improvement of loan processes.',
        expectedImpact: 'Institutionalize improvement culture, sustain gains',
        implementationDifficulty: 'LOW',
        estimatedCostSavings: 'Ongoing improvement',
        linkedFMEAIds: [],
        linkedFishboneCauseIds: [],
        status: 'IMPLEMENTED'
      }
    }),
    prisma.recommendation.create({
      data: {
        assignmentId: assignment.id,
        recommendationTitle: 'Customer Feedback Loop System',
        description: 'Automated customer feedback collection and sentiment analysis.',
        expectedImpact: 'Improve CSAT from 3.8 to 4.5, identify pain points faster',
        implementationDifficulty: 'LOW',
        estimatedCostSavings: '$1,800,000 annually',
        linkedFMEAIds: [],
        linkedFishboneCauseIds: [],
        status: 'PROPOSED'
      }
    })
  ])

  console.log('✅ Created', recommendations.length, 'recommendations')

  // Create VSM Steps (Value Stream Mapping) for key processes
  console.log('\n📈 Creating VSM steps...')

  // VSM for Process 1: Application Submission
  await prisma.vSMStep.createMany({
    data: [
      { processId: process1.id, stepNumber: 1, stepName: 'Customer accesses portal/branch', processTime: 5, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Customer' },
      { processId: process1.id, stepNumber: 2, stepName: 'Fill application form', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Customer' },
      { processId: process1.id, stepNumber: 3, stepName: 'Upload documents', processTime: 20, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Customer' },
      { processId: process1.id, stepNumber: 4, stepName: 'Wait for validation', processTime: 0, waitingTime: 120, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'System' },
      { processId: process1.id, stepNumber: 5, stepName: 'System validation', processTime: 5, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'System' },
      { processId: process1.id, stepNumber: 6, stepName: 'Fraud screening', processTime: 10, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'System' },
      { processId: process1.id, stepNumber: 7, stepName: 'Generate reference number', processTime: 2, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'System' },
      { processId: process1.id, stepNumber: 8, stepName: 'Send confirmation email', processTime: 1, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'System' },
      { processId: process1.id, stepNumber: 9, stepName: 'Route to loan officer', processTime: 3, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'System' },
      { processId: process1.id, stepNumber: 10, stepName: 'Wait in queue', processTime: 0, waitingTime: 240, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'Loan Officer' }
    ]
  })

  // VSM for Process 3: Credit Assessment
  await prisma.vSMStep.createMany({
    data: [
      { processId: process3.id, stepNumber: 1, stepName: 'Retrieve application', processTime: 5, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: process3.id, stepNumber: 2, stepName: 'Pull credit report', processTime: 15, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: process3.id, stepNumber: 3, stepName: 'Wait for bureau response', processTime: 0, waitingTime: 180, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'Credit Bureau' },
      { processId: process3.id, stepNumber: 4, stepName: 'Analyze financial statements', processTime: 60, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: process3.id, stepNumber: 5, stepName: 'Calculate financial ratios', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: process3.id, stepNumber: 6, stepName: 'Review payment history', processTime: 20, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: process3.id, stepNumber: 7, stepName: 'Industry risk assessment', processTime: 45, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: process3.id, stepNumber: 8, stepName: 'Run scoring model', processTime: 10, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'System' },
      { processId: process3.id, stepNumber: 9, stepName: 'Stress testing', processTime: 25, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: process3.id, stepNumber: 10, stepName: 'Prepare credit memo', processTime: 40, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: process3.id, stepNumber: 11, stepName: 'Senior review wait', processTime: 0, waitingTime: 480, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'Senior Analyst' },
      { processId: process3.id, stepNumber: 12, stepName: 'Senior analyst review', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Senior Analyst' }
    ]
  })

  // VSM for Process 7: Documentation
  await prisma.vSMStep.createMany({
    data: [
      { processId: process7.id, stepNumber: 1, stepName: 'Receive approval', processTime: 2, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Documentation Team' },
      { processId: process7.id, stepNumber: 2, stepName: 'Select template', processTime: 5, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Documentation Team' },
      { processId: process7.id, stepNumber: 3, stepName: 'Prepare loan agreement', processTime: 60, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Documentation Team' },
      { processId: process7.id, stepNumber: 4, stepName: 'Prepare security docs', processTime: 45, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Documentation Team' },
      { processId: process7.id, stepNumber: 5, stepName: 'Wait for legal review', processTime: 0, waitingTime: 1440, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'Legal Team' },
      { processId: process7.id, stepNumber: 6, stepName: 'Legal review', processTime: 90, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Legal Team' },
      { processId: process7.id, stepNumber: 7, stepName: 'Incorporate changes', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Documentation Team' },
      { processId: process7.id, stepNumber: 8, stepName: 'Send to customer', processTime: 5, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Documentation Team' },
      { processId: process7.id, stepNumber: 9, stepName: 'Wait for customer review', processTime: 0, waitingTime: 2880, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'Customer' },
      { processId: process7.id, stepNumber: 10, stepName: 'Schedule signing', processTime: 10, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Documentation Team' },
      { processId: process7.id, stepNumber: 11, stepName: 'Wait for appointment', processTime: 0, waitingTime: 1440, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'Customer' },
      { processId: process7.id, stepNumber: 12, stepName: 'Document signing', processTime: 45, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Customer' },
      { processId: process7.id, stepNumber: 13, stepName: 'Register security', processTime: 120, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Documentation Team' }
    ]
  })

  const vsmCount = await prisma.vSMStep.count({
    where: { process: { assignmentId: assignment.id } }
  })
  console.log('✅ Created', vsmCount, 'VSM steps')

  // Create Fishbone (Cause and Effect) Analysis for key processes
  console.log('\n🐟 Creating Fishbone analysis...')

  // Fishbone for Process 3: Credit Assessment - analyzing "Long Credit Assessment Time"
  const fishbone1 = await prisma.fishboneCategory.create({
    data: {
      processId: process3.id,
      category: 'PEOPLE',
      order: 1,
      causes: {
        create: [
          { causeDescription: 'Insufficient number of credit analysts', order: 1 },
          { causeDescription: 'Lack of industry-specific expertise', order: 2 },
          { causeDescription: 'High analyst turnover rate', order: 3 },
          { causeDescription: 'Inadequate training on credit scoring models', order: 4 }
        ]
      }
    }
  })

  const fishbone2 = await prisma.fishboneCategory.create({
    data: {
      processId: process3.id,
      category: 'PROCESS',
      order: 2,
      causes: {
        create: [
          { causeDescription: 'Manual data entry from multiple sources', order: 1 },
          { causeDescription: 'Multiple approval layers causing delays', order: 2 },
          { causeDescription: 'Lack of standardized assessment framework', order: 3 },
          { causeDescription: 'Redundant review steps', order: 4 },
          { causeDescription: 'No prioritization mechanism for urgent applications', order: 5 }
        ]
      }
    }
  })

  const fishbone3 = await prisma.fishboneCategory.create({
    data: {
      processId: process3.id,
      category: 'EQUIPMENT',
      order: 3,
      causes: {
        create: [
          { causeDescription: 'Outdated credit bureau integration (monthly refresh)', order: 1 },
          { causeDescription: 'No automated financial spreading tool', order: 2 },
          { causeDescription: 'Legacy scoring models not using AI/ML', order: 3 },
          { causeDescription: 'Slow system response times', order: 4 },
          { causeDescription: 'No integration between systems (manual data transfer)', order: 5 }
        ]
      }
    }
  })

  const fishbone4 = await prisma.fishboneCategory.create({
    data: {
      processId: process3.id,
      category: 'MATERIALS',
      order: 4,
      causes: {
        create: [
          { causeDescription: 'Incomplete financial statements from customers', order: 1 },
          { causeDescription: 'Outdated industry risk reports', order: 2 },
          { causeDescription: 'Inconsistent data quality from credit bureau', order: 3 },
          { causeDescription: 'Missing collateral valuation reports', order: 4 }
        ]
      }
    }
  })

  const fishbone5 = await prisma.fishboneCategory.create({
    data: {
      processId: process3.id,
      category: 'MANAGEMENT',
      order: 5,
      causes: {
        create: [
          { causeDescription: 'No tracking of assessment turnaround time', order: 1 },
          { causeDescription: 'Quality metrics not defined', order: 2 },
          { causeDescription: 'No SLA monitoring for credit assessment', order: 3 }
        ]
      }
    }
  })

  const fishbone6 = await prisma.fishboneCategory.create({
    data: {
      processId: process3.id,
      category: 'ENVIRONMENT',
      order: 6,
      causes: {
        create: [
          { causeDescription: 'High application volume during peak seasons', order: 1 },
          { causeDescription: 'Regulatory changes requiring additional analysis', order: 2 },
          { causeDescription: 'Economic uncertainty requiring deeper scrutiny', order: 3 }
        ]
      }
    }
  })

  // Fishbone for Process 1: Application - analyzing "Incomplete Applications"
  await prisma.fishboneCategory.create({
    data: {
      processId: process1.id,
      category: 'PEOPLE',
      order: 1,
      causes: {
        create: [
          { causeDescription: 'Customers lack understanding of requirements', order: 1 },
          { causeDescription: 'Branch staff not properly explaining requirements', order: 2 },
          { causeDescription: 'No dedicated application support team', order: 3 }
        ]
      }
    }
  })

  await prisma.fishboneCategory.create({
    data: {
      processId: process1.id,
      category: 'PROCESS',
      order: 2,
      causes: {
        create: [
          { causeDescription: 'Unclear application instructions', order: 1 },
          { causeDescription: 'No document checklist provided upfront', order: 2 },
          { causeDescription: 'No validation at time of submission', order: 3 },
          { causeDescription: 'Complex application form design', order: 4 }
        ]
      }
    }
  })

  await prisma.fishboneCategory.create({
    data: {
      processId: process1.id,
      category: 'EQUIPMENT',
      order: 3,
      causes: {
        create: [
          { causeDescription: 'Online portal lacks real-time validation', order: 1 },
          { causeDescription: 'No document quality check (file size, readability)', order: 2 },
          { causeDescription: 'No smart form with conditional fields', order: 3 },
          { causeDescription: 'No progress save feature (customers abandon mid-way)', order: 4 }
        ]
      }
    }
  })

  const fishboneCount = await prisma.fishboneCategory.count({
    where: { process: { assignmentId: assignment.id } }
  })
  const fishboneCauseCount = await prisma.fishboneCause.count({
    where: { category: { process: { assignmentId: assignment.id } } }
  })
  console.log('✅ Created', fishboneCount, 'Fishbone categories with', fishboneCauseCount, 'causes')

  // Update process capability metrics with realistic banking data
  console.log('\n📊 Updating process capability metrics...')

  await prisma.process.update({
    where: { id: process1.id },
    data: {
      sampleMean: 11.2,
      sampleStdDev: 2.8
    }
  })

  await prisma.process.update({
    where: { id: process2.id },
    data: {
      sampleMean: 19.5,
      sampleStdDev: 3.2
    }
  })

  await prisma.process.update({
    where: { id: process3.id },
    data: {
      sampleMean: 38.4,
      sampleStdDev: 5.6
    }
  })

  await prisma.process.update({
    where: { id: process4.id },
    data: {
      sampleMean: 62.3,
      sampleStdDev: 8.4
    }
  })

  await prisma.process.update({
    where: { id: process5.id },
    data: {
      sampleMean: 13.2,
      sampleStdDev: 2.1
    }
  })

  await prisma.process.update({
    where: { id: process6.id },
    data: {
      sampleMean: 40.8,
      sampleStdDev: 6.2
    }
  })

  await prisma.process.update({
    where: { id: process7.id },
    data: {
      sampleMean: 105.6,
      sampleStdDev: 14.3
    }
  })

  await prisma.process.update({
    where: { id: process8.id },
    data: {
      sampleMean: 5.2,
      sampleStdDev: 1.4
    }
  })

  await prisma.process.update({
    where: { id: process9.id },
    data: {
      sampleMean: 720,
      sampleStdDev: 0
    }
  })

  console.log('✅ Updated process capability metrics for all 9 processes')

  // Mark assignment as COMPLETED
  await prisma.assignment.update({
    where: { id: assignment.id },
    data: {
      status: 'COMPLETED',
      completedAt: new Date()
    }
  })

  console.log('✅ Marked assignment as COMPLETED')

  console.log('\n🎉 Banking facility granting assignment seeded successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - Assignment: ${assignment.title}`)
  console.log(`   - VOC Statements: ${vocStatements.length}`)
  console.log(`   - CTQ Requirements: ${ctqRequirements.length}`)
  console.log(`   - Processes: ${processes.length}`)

  // Count SIPOC entries
  const sipocCount = await prisma.sIPOCEntry.count({
    where: { process: { assignmentId: assignment.id } }
  })
  console.log(`   - SIPOC Entries: ${sipocCount}`)
  console.log(`   - FMEA Entries: ${fmeaEntries.length}`)

  const highRiskCount = fmeaEntries.filter(f => f.rpn >= 200).length
  console.log(`   - High Risk FMEAs (RPN >= 200): ${highRiskCount}`)
  console.log(`   - Recommendations: ${recommendations.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding banking assignment:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
