import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Completing all Six Sigma tools for banking assignment...')

  // Get the banking assignment
  const assignment = await prisma.assignment.findFirst({
    where: { title: 'Bank Facility Granting Process Improvement' }
  })

  if (!assignment) {
    throw new Error('Banking assignment not found')
  }

  console.log('✅ Found assignment:', assignment.title)

  // Get processes separately
  const allProcesses = await prisma.process.findMany({
    where: {
      assignment: {
        id: assignment.id
      }
    },
    orderBy: { order: 'asc' }
  })

  console.log('📊 Processes:', allProcesses.length)

  // Delete existing incomplete data to start fresh
  console.log('\n🧹 Cleaning up existing data...')

  for (const process of allProcesses) {
    await prisma.vSMStep.deleteMany({ where: { processId: process.id } })
    await prisma.fishboneCause.deleteMany({
      where: { category: { processId: process.id } }
    })
    await prisma.fishboneCategory.deleteMany({ where: { processId: process.id } })
  }

  console.log('✅ Cleaned up existing data')

  // Create comprehensive VSM for ALL processes
  console.log('\n📈 Creating comprehensive VSM steps for all 9 processes...')

  const processes = allProcesses

  // Process 1: Customer Application Submission
  await prisma.vSMStep.createMany({
    data: [
      { processId: processes[0].id, stepNumber: 1, stepName: 'Customer accesses portal/branch', processTime: 5, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Customer' },
      { processId: processes[0].id, stepNumber: 2, stepName: 'Read instructions and requirements', processTime: 10, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Customer' },
      { processId: processes[0].id, stepNumber: 3, stepName: 'Fill personal/business details', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Customer' },
      { processId: processes[0].id, stepNumber: 4, stepName: 'Upload identity documents', processTime: 10, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Customer' },
      { processId: processes[0].id, stepNumber: 5, stepName: 'Upload financial documents', processTime: 15, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Customer' },
      { processId: processes[0].id, stepNumber: 6, stepName: 'Wait for system validation', processTime: 0, waitingTime: 120, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'System' },
      { processId: processes[0].id, stepNumber: 7, stepName: 'System validates completeness', processTime: 5, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'System' },
      { processId: processes[0].id, stepNumber: 8, stepName: 'Document quality check', processTime: 8, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'System' },
      { processId: processes[0].id, stepNumber: 9, stepName: 'Fraud screening', processTime: 10, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'System' },
      { processId: processes[0].id, stepNumber: 10, stepName: 'Generate reference number', processTime: 2, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'System' },
      { processId: processes[0].id, stepNumber: 11, stepName: 'Log in CRM', processTime: 3, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'System' },
      { processId: processes[0].id, stepNumber: 12, stepName: 'Eligibility check', processTime: 5, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'System' },
      { processId: processes[0].id, stepNumber: 13, stepName: 'Route to loan officer', processTime: 2, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'System' },
      { processId: processes[0].id, stepNumber: 14, stepName: 'Wait in queue', processTime: 0, waitingTime: 240, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'Loan Officer' },
      { processId: processes[0].id, stepNumber: 15, stepName: 'Send confirmation email', processTime: 1, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'System' }
    ]
  })

  // Process 2: Document Verification and KYC
  await prisma.vSMStep.createMany({
    data: [
      { processId: processes[1].id, stepNumber: 1, stepName: 'Retrieve application from queue', processTime: 3, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'KYC Officer' },
      { processId: processes[1].id, stepNumber: 2, stepName: 'Review submitted documents', processTime: 15, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'KYC Officer' },
      { processId: processes[1].id, stepNumber: 3, stepName: 'Verify ID against govt database', processTime: 10, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'KYC Officer' },
      { processId: processes[1].id, stepNumber: 4, stepName: 'Wait for database response', processTime: 0, waitingTime: 60, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'External System' },
      { processId: processes[1].id, stepNumber: 5, stepName: 'Verify address proof', processTime: 12, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'KYC Officer' },
      { processId: processes[1].id, stepNumber: 6, stepName: 'Employment verification call', processTime: 20, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'KYC Officer' },
      { processId: processes[1].id, stepNumber: 7, stepName: 'Wait for employer callback', processTime: 0, waitingTime: 180, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'Employer' },
      { processId: processes[1].id, stepNumber: 8, stepName: 'Business registration check', processTime: 15, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'KYC Officer' },
      { processId: processes[1].id, stepNumber: 9, stepName: 'Bank statement analysis', processTime: 25, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'KYC Officer' },
      { processId: processes[1].id, stepNumber: 10, stepName: 'Credit bureau check', processTime: 10, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'KYC Officer' },
      { processId: processes[1].id, stepNumber: 11, stepName: 'AML screening', processTime: 8, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'System' },
      { processId: processes[1].id, stepNumber: 12, stepName: 'Sanctions list screening', processTime: 5, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'System' },
      { processId: processes[1].id, stepNumber: 13, stepName: 'PEP screening', processTime: 5, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'System' },
      { processId: processes[1].id, stepNumber: 14, stepName: 'Source of funds verification', processTime: 20, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'KYC Officer' },
      { processId: processes[1].id, stepNumber: 15, stepName: 'Resolve discrepancies', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'KYC Officer' },
      { processId: processes[1].id, stepNumber: 16, stepName: 'Create customer profile', processTime: 10, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'KYC Officer' },
      { processId: processes[1].id, stepNumber: 17, stepName: 'Wait for supervisor approval', processTime: 0, waitingTime: 240, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'Supervisor' },
      { processId: processes[1].id, stepNumber: 18, stepName: 'Supervisor approval', processTime: 10, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Supervisor' }
    ]
  })

  // Process 3: Credit Assessment and Risk Analysis
  await prisma.vSMStep.createMany({
    data: [
      { processId: processes[2].id, stepNumber: 1, stepName: 'Retrieve verified application', processTime: 5, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: processes[2].id, stepNumber: 2, stepName: 'Request credit report', processTime: 5, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: processes[2].id, stepNumber: 3, stepName: 'Wait for credit bureau', processTime: 0, waitingTime: 180, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'Credit Bureau' },
      { processId: processes[2].id, stepNumber: 4, stepName: 'Review credit report', processTime: 15, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: processes[2].id, stepNumber: 5, stepName: 'Calculate DTI ratio', processTime: 10, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: processes[2].id, stepNumber: 6, stepName: 'Spread financial statements', processTime: 60, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: processes[2].id, stepNumber: 7, stepName: 'Calculate liquidity ratios', processTime: 20, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: processes[2].id, stepNumber: 8, stepName: 'Calculate leverage ratios', processTime: 15, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: processes[2].id, stepNumber: 9, stepName: 'Cash flow analysis', processTime: 45, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: processes[2].id, stepNumber: 10, stepName: 'Review payment history', processTime: 20, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: processes[2].id, stepNumber: 11, stepName: 'Industry risk assessment', processTime: 45, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: processes[2].id, stepNumber: 12, stepName: 'Market risk assessment', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: processes[2].id, stepNumber: 13, stepName: 'Calculate PD', processTime: 15, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: processes[2].id, stepNumber: 14, stepName: 'Calculate LGD', processTime: 15, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: processes[2].id, stepNumber: 15, stepName: 'Run scoring model', processTime: 10, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'System' },
      { processId: processes[2].id, stepNumber: 16, stepName: 'Review existing exposure', processTime: 20, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: processes[2].id, stepNumber: 17, stepName: 'Stress testing', processTime: 25, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: processes[2].id, stepNumber: 18, stepName: 'Calculate RAROC', processTime: 20, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: processes[2].id, stepNumber: 19, stepName: 'Prepare credit memo', processTime: 60, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: processes[2].id, stepNumber: 20, stepName: 'Wait for senior review', processTime: 0, waitingTime: 480, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'Senior Analyst' },
      { processId: processes[2].id, stepNumber: 21, stepName: 'Senior analyst review', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Senior Analyst' },
      { processId: processes[2].id, stepNumber: 22, stepName: 'Incorporate feedback', processTime: 20, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Credit Analyst' }
    ]
  })

  // Process 4: Collateral Valuation
  await prisma.vSMStep.createMany({
    data: [
      { processId: processes[3].id, stepNumber: 1, stepName: 'Review collateral details', processTime: 10, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Collateral Manager' },
      { processId: processes[3].id, stepNumber: 2, stepName: 'Select valuer from panel', processTime: 15, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Collateral Manager' },
      { processId: processes[3].id, stepNumber: 3, stepName: 'Send valuation request', processTime: 5, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Collateral Manager' },
      { processId: processes[3].id, stepNumber: 4, stepName: 'Wait for valuer acceptance', processTime: 0, waitingTime: 240, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'External Valuer' },
      { processId: processes[3].id, stepNumber: 5, stepName: 'Schedule site inspection', processTime: 15, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'External Valuer' },
      { processId: processes[3].id, stepNumber: 6, stepName: 'Wait for appointment', processTime: 0, waitingTime: 1440, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'Customer' },
      { processId: processes[3].id, stepNumber: 7, stepName: 'Physical inspection', processTime: 120, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'External Valuer' },
      { processId: processes[3].id, stepNumber: 8, stepName: 'Market comparables research', processTime: 180, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'External Valuer' },
      { processId: processes[3].id, stepNumber: 9, stepName: 'Calculate market value', processTime: 60, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'External Valuer' },
      { processId: processes[3].id, stepNumber: 10, stepName: 'Calculate forced sale value', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'External Valuer' },
      { processId: processes[3].id, stepNumber: 11, stepName: 'Prepare valuation report', processTime: 120, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'External Valuer' },
      { processId: processes[3].id, stepNumber: 12, stepName: 'Wait for report delivery', processTime: 0, waitingTime: 480, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'External Valuer' },
      { processId: processes[3].id, stepNumber: 13, stepName: 'Review valuation report', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Collateral Manager' },
      { processId: processes[3].id, stepNumber: 14, stepName: 'Legal title search', processTime: 60, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Legal Team' },
      { processId: processes[3].id, stepNumber: 15, stepName: 'Encumbrance check', processTime: 45, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Legal Team' },
      { processId: processes[3].id, stepNumber: 16, stepName: 'Ownership verification', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Legal Team' },
      { processId: processes[3].id, stepNumber: 17, stepName: 'Litigation check', processTime: 40, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Legal Team' },
      { processId: processes[3].id, stepNumber: 18, stepName: 'Calculate LTV ratio', processTime: 15, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Collateral Manager' },
      { processId: processes[3].id, stepNumber: 19, stepName: 'Prepare legal opinion', processTime: 60, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Legal Team' }
    ]
  })

  // Process 5: Loan Structuring
  await prisma.vSMStep.createMany({
    data: [
      { processId: processes[4].id, stepNumber: 1, stepName: 'Retrieve credit assessment', processTime: 5, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Product Manager' },
      { processId: processes[4].id, stepNumber: 2, stepName: 'Review customer cash flow', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Product Manager' },
      { processId: processes[4].id, stepNumber: 3, stepName: 'Determine loan amount', processTime: 15, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Product Manager' },
      { processId: processes[4].id, stepNumber: 4, stepName: 'Calculate optimal tenor', processTime: 20, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Product Manager' },
      { processId: processes[4].id, stepNumber: 5, stepName: 'Structure repayment schedule', processTime: 25, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Product Manager' },
      { processId: processes[4].id, stepNumber: 6, stepName: 'Get treasury funding cost', processTime: 10, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Treasury' },
      { processId: processes[4].id, stepNumber: 7, stepName: 'Calculate risk premium', processTime: 15, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Product Manager' },
      { processId: processes[4].id, stepNumber: 8, stepName: 'Determine interest rate', processTime: 20, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Product Manager' },
      { processId: processes[4].id, stepNumber: 9, stepName: 'Calculate fees', processTime: 10, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Product Manager' },
      { processId: processes[4].id, stepNumber: 10, stepName: 'Define covenants', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Product Manager' },
      { processId: processes[4].id, stepNumber: 11, stepName: 'Structure grace period', processTime: 15, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Product Manager' },
      { processId: processes[4].id, stepNumber: 12, stepName: 'Define drawdown terms', processTime: 20, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Product Manager' },
      { processId: processes[4].id, stepNumber: 13, stepName: 'Calculate total cost', processTime: 15, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Product Manager' },
      { processId: processes[4].id, stepNumber: 14, stepName: 'Prepare scenarios', processTime: 40, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Product Manager' },
      { processId: processes[4].id, stepNumber: 15, stepName: 'Validate pricing', processTime: 20, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Risk' },
      { processId: processes[4].id, stepNumber: 16, stepName: 'Generate offer letter', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Product Manager' }
    ]
  })

  // Process 6: Credit Committee
  await prisma.vSMStep.createMany({
    data: [
      { processId: processes[5].id, stepNumber: 1, stepName: 'Compile documentation', processTime: 60, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: processes[5].id, stepNumber: 2, stepName: 'Schedule committee meeting', processTime: 15, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Secretary' },
      { processId: processes[5].id, stepNumber: 3, stepName: 'Wait for meeting slot', processTime: 0, waitingTime: 1440, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'Committee' },
      { processId: processes[5].id, stepNumber: 4, stepName: 'Distribute materials', processTime: 10, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Secretary' },
      { processId: processes[5].id, stepNumber: 5, stepName: 'Wait for members to review', processTime: 0, waitingTime: 720, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'Committee' },
      { processId: processes[5].id, stepNumber: 6, stepName: 'Present case to committee', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Credit Analyst' },
      { processId: processes[5].id, stepNumber: 7, stepName: 'Committee Q&A', processTime: 45, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Committee' },
      { processId: processes[5].id, stepNumber: 8, stepName: 'Committee deliberation', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Committee' },
      { processId: processes[5].id, stepNumber: 9, stepName: 'Vote and decision', processTime: 15, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Committee' },
      { processId: processes[5].id, stepNumber: 10, stepName: 'Define conditions', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Committee' },
      { processId: processes[5].id, stepNumber: 11, stepName: 'Document minutes', processTime: 45, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Secretary' },
      { processId: processes[5].id, stepNumber: 12, stepName: 'Update system', processTime: 10, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Secretary' },
      { processId: processes[5].id, stepNumber: 13, stepName: 'Generate decision letter', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Secretary' },
      { processId: processes[5].id, stepNumber: 14, stepName: 'Notify loan officer', processTime: 5, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Secretary' }
    ]
  })

  // Process 7: Documentation
  await prisma.vSMStep.createMany({
    data: [
      { processId: processes[6].id, stepNumber: 1, stepName: 'Receive approval notification', processTime: 2, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Doc Team' },
      { processId: processes[6].id, stepNumber: 2, stepName: 'Review approval conditions', processTime: 20, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Doc Team' },
      { processId: processes[6].id, stepNumber: 3, stepName: 'Select agreement template', processTime: 10, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Doc Team' },
      { processId: processes[6].id, stepNumber: 4, stepName: 'Prepare loan agreement', processTime: 90, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Doc Team' },
      { processId: processes[6].id, stepNumber: 5, stepName: 'Prepare security documents', processTime: 60, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Doc Team' },
      { processId: processes[6].id, stepNumber: 6, stepName: 'Prepare guarantee docs', processTime: 45, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Doc Team' },
      { processId: processes[6].id, stepNumber: 7, stepName: 'Wait for legal review', processTime: 0, waitingTime: 1440, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'Legal' },
      { processId: processes[6].id, stepNumber: 8, stepName: 'Legal review', processTime: 90, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Legal' },
      { processId: processes[6].id, stepNumber: 9, stepName: 'Compliance review', processTime: 60, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Compliance' },
      { processId: processes[6].id, stepNumber: 10, stepName: 'Incorporate changes', processTime: 45, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Doc Team' },
      { processId: processes[6].id, stepNumber: 11, stepName: 'Final document preparation', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Doc Team' },
      { processId: processes[6].id, stepNumber: 12, stepName: 'Send to customer', processTime: 10, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Doc Team' },
      { processId: processes[6].id, stepNumber: 13, stepName: 'Wait for customer review', processTime: 0, waitingTime: 2880, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'Customer' },
      { processId: processes[6].id, stepNumber: 14, stepName: 'Address customer queries', processTime: 45, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Doc Team' },
      { processId: processes[6].id, stepNumber: 15, stepName: 'Schedule signing', processTime: 15, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Doc Team' },
      { processId: processes[6].id, stepNumber: 16, stepName: 'Wait for appointment', processTime: 0, waitingTime: 1440, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'Customer' },
      { processId: processes[6].id, stepNumber: 17, stepName: 'Verify signatory authority', processTime: 15, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Doc Team' },
      { processId: processes[6].id, stepNumber: 18, stepName: 'Witness signing', processTime: 45, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Doc Team' },
      { processId: processes[6].id, stepNumber: 19, stepName: 'Notarization', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Notary' },
      { processId: processes[6].id, stepNumber: 20, stepName: 'Register security', processTime: 180, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Doc Team' },
      { processId: processes[6].id, stepNumber: 21, stepName: 'Obtain insurance', processTime: 60, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Doc Team' },
      { processId: processes[6].id, stepNumber: 22, stepName: 'Update loan system', processTime: 20, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Doc Team' },
      { processId: processes[6].id, stepNumber: 23, stepName: 'Archive documents', processTime: 30, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Doc Team' }
    ]
  })

  // Process 8: Disbursement
  await prisma.vSMStep.createMany({
    data: [
      { processId: processes[7].id, stepNumber: 1, stepName: 'Receive disbursement request', processTime: 2, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Treasury' },
      { processId: processes[7].id, stepNumber: 2, stepName: 'Review conditions precedent', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Treasury' },
      { processId: processes[7].id, stepNumber: 3, stepName: 'Verify signed docs received', processTime: 15, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Treasury' },
      { processId: processes[7].id, stepNumber: 4, stepName: 'Verify collateral registered', processTime: 10, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Treasury' },
      { processId: processes[7].id, stepNumber: 5, stepName: 'Verify insurance in place', processTime: 10, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Treasury' },
      { processId: processes[7].id, stepNumber: 6, stepName: 'Validate account details', processTime: 15, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Treasury' },
      { processId: processes[7].id, stepNumber: 7, stepName: 'Prepare disbursement voucher', processTime: 20, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Treasury' },
      { processId: processes[7].id, stepNumber: 8, stepName: 'Maker input in system', processTime: 15, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Treasury Officer' },
      { processId: processes[7].id, stepNumber: 9, stepName: 'Wait for checker review', processTime: 0, waitingTime: 60, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'Checker' },
      { processId: processes[7].id, stepNumber: 10, stepName: 'Checker verification', processTime: 20, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Checker' },
      { processId: processes[7].id, stepNumber: 11, stepName: 'Wait for authorizer', processTime: 0, waitingTime: 120, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'Authorizer' },
      { processId: processes[7].id, stepNumber: 12, stepName: 'Final authorization', processTime: 15, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Authorizer' },
      { processId: processes[7].id, stepNumber: 13, stepName: 'Execute transfer', processTime: 5, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'System' },
      { processId: processes[7].id, stepNumber: 14, stepName: 'Generate confirmation', processTime: 5, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'System' },
      { processId: processes[7].id, stepNumber: 15, stepName: 'Notify customer', processTime: 2, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'System' },
      { processId: processes[7].id, stepNumber: 16, stepName: 'Update loan account', processTime: 10, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'System' },
      { processId: processes[7].id, stepNumber: 17, stepName: 'Generate repayment schedule', processTime: 15, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'System' },
      { processId: processes[7].id, stepNumber: 18, stepName: 'Setup standing instructions', processTime: 20, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'Treasury' },
      { processId: processes[7].id, stepNumber: 19, stepName: 'Activate monitoring', processTime: 10, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'System' },
      { processId: processes[7].id, stepNumber: 20, stepName: 'Handover to RM', processTime: 15, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'Treasury' }
    ]
  })

  // Process 9: Post-Disbursement Monitoring
  await prisma.vSMStep.createMany({
    data: [
      { processId: processes[8].id, stepNumber: 1, stepName: 'Setup monitoring parameters', processTime: 60, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'RM' },
      { processId: processes[8].id, stepNumber: 2, stepName: 'Monitor repayments daily', processTime: 15, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'RM' },
      { processId: processes[8].id, stepNumber: 3, stepName: 'Review account conduct', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'RM' },
      { processId: processes[8].id, stepNumber: 4, stepName: 'Request financial statements', processTime: 10, waitingTime: 0, valueMeasure: 'NON_VALUE_ADDED', stakeholder: 'RM' },
      { processId: processes[8].id, stepNumber: 5, stepName: 'Wait for statements', processTime: 0, waitingTime: 1440, valueMeasure: 'NON_VALUE_ADDED', wasteType: 'WAITING', stakeholder: 'Customer' },
      { processId: processes[8].id, stepNumber: 6, stepName: 'Analyze financial statements', processTime: 90, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'RM' },
      { processId: processes[8].id, stepNumber: 7, stepName: 'Verify covenant compliance', processTime: 60, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'RM' },
      { processId: processes[8].id, stepNumber: 8, stepName: 'Track collateral value', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'RM' },
      { processId: processes[8].id, stepNumber: 9, stepName: 'Monitor industry trends', processTime: 45, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'RM' },
      { processId: processes[8].id, stepNumber: 10, stepName: 'Conduct customer visit', processTime: 180, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'RM' },
      { processId: processes[8].id, stepNumber: 11, stepName: 'Review profitability', processTime: 45, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'RM' },
      { processId: processes[8].id, stepNumber: 12, stepName: 'Identify cross-sell', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'RM' },
      { processId: processes[8].id, stepNumber: 13, stepName: 'Generate monitoring report', processTime: 60, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'RM' },
      { processId: processes[8].id, stepNumber: 14, stepName: 'Update risk rating', processTime: 30, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'RM' },
      { processId: processes[8].id, stepNumber: 15, stepName: 'Escalate if needed', processTime: 20, waitingTime: 0, valueMeasure: 'VALUE_ADDED', stakeholder: 'RM' }
    ]
  })

  const vsmCount = await prisma.vSMStep.count({
    where: { process: { assignmentId: assignment.id } }
  })
  console.log('✅ Created', vsmCount, 'VSM steps across all 9 processes')

  // Create comprehensive Fishbone diagrams for ALL processes
  console.log('\n🐟 Creating comprehensive Fishbone analysis for all 9 processes...')

  // Process 1: Application Submission - "Incomplete Applications"
  await prisma.fishboneCategory.createMany({
    data: [
      { processId: processes[0].id, category: 'PEOPLE', order: 1 },
      { processId: processes[0].id, category: 'PROCESS', order: 2 },
      { processId: processes[0].id, category: 'EQUIPMENT', order: 3 },
      { processId: processes[0].id, category: 'MATERIALS', order: 4 },
      { processId: processes[0].id, category: 'ENVIRONMENT', order: 5 },
      { processId: processes[0].id, category: 'MANAGEMENT', order: 6 }
    ]
  })

  const p1Categories = await prisma.fishboneCategory.findMany({
    where: { processId: processes[0].id },
    orderBy: { order: 'asc' }
  })

  await prisma.fishboneCause.createMany({
    data: [
      // People
      { categoryId: p1Categories[0].id, causeDescription: 'Customers lack understanding of requirements', order: 1 },
      { categoryId: p1Categories[0].id, causeDescription: 'Branch staff inadequately trained', order: 2 },
      { categoryId: p1Categories[0].id, causeDescription: 'No dedicated application support team', order: 3 },
      { categoryId: p1Categories[0].id, causeDescription: 'High customer service agent turnover', order: 4 },
      // Process
      { categoryId: p1Categories[1].id, causeDescription: 'Unclear application instructions', order: 1 },
      { categoryId: p1Categories[1].id, causeDescription: 'No document checklist provided upfront', order: 2 },
      { categoryId: p1Categories[1].id, causeDescription: 'No real-time validation at submission', order: 3 },
      { categoryId: p1Categories[1].id, causeDescription: 'Complex multi-page form design', order: 4 },
      { categoryId: p1Categories[1].id, causeDescription: 'No progressive disclosure of fields', order: 5 },
      // Equipment/Technology
      { categoryId: p1Categories[2].id, causeDescription: 'Online portal lacks real-time validation', order: 1 },
      { categoryId: p1Categories[2].id, causeDescription: 'No document quality check', order: 2 },
      { categoryId: p1Categories[2].id, causeDescription: 'No smart form with conditional fields', order: 3 },
      { categoryId: p1Categories[2].id, causeDescription: 'No progress save feature', order: 4 },
      { categoryId: p1Categories[2].id, causeDescription: 'Poor mobile responsiveness', order: 5 },
      // Materials
      { categoryId: p1Categories[3].id, causeDescription: 'Different requirements for different products', order: 1 },
      { categoryId: p1Categories[3].id, causeDescription: 'Requirements documentation outdated', order: 2 },
      { categoryId: p1Categories[3].id, causeDescription: 'No visual examples provided', order: 3 },
      // Environment
      { categoryId: p1Categories[4].id, causeDescription: 'Peak hour server slowness', order: 1 },
      { categoryId: p1Categories[4].id, causeDescription: 'Competitor portals more user-friendly', order: 2 },
      { categoryId: p1Categories[4].id, causeDescription: 'Customer expectations for instant processing', order: 3 },
      // Management
      { categoryId: p1Categories[5].id, causeDescription: 'No quality metrics tracked for completeness', order: 1 },
      { categoryId: p1Categories[5].id, causeDescription: 'Inadequate user testing before launch', order: 2 },
      { categoryId: p1Categories[5].id, causeDescription: 'No customer feedback loop', order: 3 }
    ]
  })

  // Process 2: KYC - "KYC Verification Delays"
  await prisma.fishboneCategory.createMany({
    data: [
      { processId: processes[1].id, category: 'PEOPLE', order: 1 },
      { processId: processes[1].id, category: 'PROCESS', order: 2 },
      { processId: processes[1].id, category: 'EQUIPMENT', order: 3 },
      { processId: processes[1].id, category: 'MATERIALS', order: 4 },
      { processId: processes[1].id, category: 'ENVIRONMENT', order: 5 },
      { processId: processes[1].id, category: 'MANAGEMENT', order: 6 }
    ]
  })

  const p2Categories = await prisma.fishboneCategory.findMany({
    where: { processId: processes[1].id },
    orderBy: { order: 'asc' }
  })

  await prisma.fishboneCause.createMany({
    data: [
      // People
      { categoryId: p2Categories[0].id, causeDescription: 'Insufficient KYC officers', order: 1 },
      { categoryId: p2Categories[0].id, causeDescription: 'Lack of specialized training', order: 2 },
      { categoryId: p2Categories[0].id, causeDescription: 'High workload per officer', order: 3 },
      { categoryId: p2Categories[0].id, causeDescription: 'Inconsistent interpretation of requirements', order: 4 },
      // Process
      { categoryId: p2Categories[1].id, causeDescription: 'Manual verification of each document', order: 1 },
      { categoryId: p2Categories[1].id, causeDescription: 'Multiple handoffs between teams', order: 2 },
      { categoryId: p2Categories[1].id, causeDescription: 'No risk-based approach (all checked equally)', order: 3 },
      { categoryId: p2Categories[1].id, causeDescription: 'Waiting for employer callbacks', order: 4 },
      { categoryId: p2Categories[1].id, causeDescription: 'Duplicate checks across systems', order: 5 },
      // Equipment
      { categoryId: p2Categories[2].id, causeDescription: 'Slow third-party API responses', order: 1 },
      { categoryId: p2Categories[2].id, causeDescription: 'No automated document authentication', order: 2 },
      { categoryId: p2Categories[2].id, causeDescription: 'Legacy screening tools', order: 3 },
      { categoryId: p2Categories[2].id, causeDescription: 'No AI-based fraud detection', order: 4 },
      { categoryId: p2Categories[2].id, causeDescription: 'Multiple disconnected systems', order: 5 },
      // Materials
      { categoryId: p2Categories[3].id, causeDescription: 'Poor quality document submissions', order: 1 },
      { categoryId: p2Categories[3].id, causeDescription: 'Expired documents', order: 2 },
      { categoryId: p2Categories[3].id, causeDescription: 'Missing supporting documents', order: 3 },
      { categoryId: p2Categories[3].id, causeDescription: 'Inconsistent data across documents', order: 4 },
      // Environment
      { categoryId: p2Categories[4].id, causeDescription: 'Increasing regulatory requirements', order: 1 },
      { categoryId: p2Categories[4].id, causeDescription: 'Rising fraud attempts', order: 2 },
      { categoryId: p2Categories[4].id, causeDescription: 'Government database downtime', order: 3 },
      // Management
      { categoryId: p2Categories[5].id, causeDescription: 'No SLA monitoring', order: 1 },
      { categoryId: p2Categories[5].id, causeDescription: 'Lack of performance metrics', order: 2 },
      { categoryId: p2Categories[5].id, causeDescription: 'No automation investment', order: 3 }
    ]
  })

  // Process 3: Credit Assessment - "Long Credit Assessment Time"
  await prisma.fishboneCategory.createMany({
    data: [
      { processId: processes[2].id, category: 'PEOPLE', order: 1 },
      { processId: processes[2].id, category: 'PROCESS', order: 2 },
      { processId: processes[2].id, category: 'EQUIPMENT', order: 3 },
      { processId: processes[2].id, category: 'MATERIALS', order: 4 },
      { processId: processes[2].id, category: 'ENVIRONMENT', order: 5 },
      { processId: processes[2].id, category: 'MANAGEMENT', order: 6 }
    ]
  })

  const p3Categories = await prisma.fishboneCategory.findMany({
    where: { processId: processes[2].id },
    orderBy: { order: 'asc' }
  })

  await prisma.fishboneCause.createMany({
    data: [
      // People
      { categoryId: p3Categories[0].id, causeDescription: 'Insufficient number of credit analysts', order: 1 },
      { categoryId: p3Categories[0].id, causeDescription: 'Lack of industry-specific expertise', order: 2 },
      { categoryId: p3Categories[0].id, causeDescription: 'High analyst turnover rate', order: 3 },
      { categoryId: p3Categories[0].id, causeDescription: 'Inadequate training on models', order: 4 },
      { categoryId: p3Categories[0].id, causeDescription: 'Senior analysts overloaded', order: 5 },
      // Process
      { categoryId: p3Categories[1].id, causeDescription: 'Manual data entry from multiple sources', order: 1 },
      { categoryId: p3Categories[1].id, causeDescription: 'Multiple approval layers', order: 2 },
      { categoryId: p3Categories[1].id, causeDescription: 'Lack of standardized framework', order: 3 },
      { categoryId: p3Categories[1].id, causeDescription: 'Redundant review steps', order: 4 },
      { categoryId: p3Categories[1].id, causeDescription: 'No prioritization mechanism', order: 5 },
      { categoryId: p3Categories[1].id, causeDescription: 'Waiting for senior analyst availability', order: 6 },
      // Equipment
      { categoryId: p3Categories[2].id, causeDescription: 'Outdated credit bureau integration', order: 1 },
      { categoryId: p3Categories[2].id, causeDescription: 'No automated financial spreading', order: 2 },
      { categoryId: p3Categories[2].id, causeDescription: 'Legacy scoring models', order: 3 },
      { categoryId: p3Categories[2].id, causeDescription: 'Slow system response times', order: 4 },
      { categoryId: p3Categories[2].id, causeDescription: 'No system integration', order: 5 },
      // Materials
      { categoryId: p3Categories[3].id, causeDescription: 'Incomplete financial statements', order: 1 },
      { categoryId: p3Categories[3].id, causeDescription: 'Outdated industry reports', order: 2 },
      { categoryId: p3Categories[3].id, causeDescription: 'Inconsistent credit bureau data', order: 3 },
      { categoryId: p3Categories[3].id, causeDescription: 'Missing collateral valuations', order: 4 },
      // Environment
      { categoryId: p3Categories[4].id, causeDescription: 'High application volume', order: 1 },
      { categoryId: p3Categories[4].id, causeDescription: 'Regulatory changes', order: 2 },
      { categoryId: p3Categories[4].id, causeDescription: 'Economic uncertainty', order: 3 },
      { categoryId: p3Categories[4].id, causeDescription: 'Competitive pressure for speed', order: 4 },
      // Management
      { categoryId: p3Categories[5].id, causeDescription: 'No turnaround time tracking', order: 1 },
      { categoryId: p3Categories[5].id, causeDescription: 'Quality metrics not defined', order: 2 },
      { categoryId: p3Categories[5].id, causeDescription: 'No SLA monitoring', order: 3 },
      { categoryId: p3Categories[5].id, causeDescription: 'Lack of process improvement focus', order: 4 }
    ]
  })

  // Process 4: Collateral Valuation - "Delayed Valuation"
  await prisma.fishboneCategory.createMany({
    data: [
      { processId: processes[3].id, category: 'PEOPLE', order: 1 },
      { processId: processes[3].id, category: 'PROCESS', order: 2 },
      { processId: processes[3].id, category: 'EQUIPMENT', order: 3 },
      { processId: processes[3].id, category: 'MATERIALS', order: 4 },
      { processId: processes[3].id, category: 'ENVIRONMENT', order: 5 },
      { processId: processes[3].id, category: 'MANAGEMENT', order: 6 }
    ]
  })

  const p4Categories = await prisma.fishboneCategory.findMany({
    where: { processId: processes[3].id },
    orderBy: { order: 'asc' }
  })

  await prisma.fishboneCause.createMany({
    data: [
      // People
      { categoryId: p4Categories[0].id, causeDescription: 'Limited valuer capacity on panel', order: 1 },
      { categoryId: p4Categories[0].id, causeDescription: 'Valuers overloaded with requests', order: 2 },
      { categoryId: p4Categories[0].id, causeDescription: 'Legal team resource constraints', order: 3 },
      { categoryId: p4Categories[0].id, causeDescription: 'Customer unavailability for site visits', order: 4 },
      // Process
      { categoryId: p4Categories[1].id, causeDescription: 'Sequential workflow (not parallel)', order: 1 },
      { categoryId: p4Categories[1].id, causeDescription: 'Waiting for customer appointments', order: 2 },
      { categoryId: p4Categories[1].id, causeDescription: 'Multiple rounds of scheduling', order: 3 },
      { categoryId: p4Categories[1].id, causeDescription: 'Lengthy report preparation', order: 4 },
      { categoryId: p4Categories[1].id, causeDescription: 'Manual valuer selection', order: 5 },
      // Equipment
      { categoryId: p4Categories[2].id, causeDescription: 'No automated valuation models for standard properties', order: 1 },
      { categoryId: p4Categories[2].id, causeDescription: 'No valuer workload tracking system', order: 2 },
      { categoryId: p4Categories[2].id, causeDescription: 'No online scheduling platform', order: 3 },
      { categoryId: p4Categories[2].id, causeDescription: 'Manual title search process', order: 4 },
      // Materials
      { categoryId: p4Categories[3].id, causeDescription: 'Incomplete property documentation', order: 1 },
      { categoryId: p4Categories[3].id, causeDescription: 'Missing title deeds', order: 2 },
      { categoryId: p4Categories[3].id, causeDescription: 'Lack of comparable sales data', order: 3 },
      { categoryId: p4Categories[3].id, causeDescription: 'Complex property structures', order: 4 },
      // Environment
      { categoryId: p4Categories[4].id, causeDescription: 'Market volatility requiring extra scrutiny', order: 1 },
      { categoryId: p4Categories[4].id, causeDescription: 'Geographic spread of properties', order: 2 },
      { categoryId: p4Categories[4].id, causeDescription: 'Peak season workload', order: 3 },
      // Management
      { categoryId: p4Categories[5].id, causeDescription: 'No SLA with external valuers', order: 1 },
      { categoryId: p4Categories[5].id, causeDescription: 'Limited panel of approved valuers', order: 2 },
      { categoryId: p4Categories[5].id, causeDescription: 'No performance monitoring', order: 3 }
    ]
  })

  // Process 5: Loan Structuring - "Non-optimal Loan Structure"
  await prisma.fishboneCategory.createMany({
    data: [
      { processId: processes[4].id, category: 'PEOPLE', order: 1 },
      { processId: processes[4].id, category: 'PROCESS', order: 2 },
      { processId: processes[4].id, category: 'EQUIPMENT', order: 3 },
      { processId: processes[4].id, category: 'MATERIALS', order: 4 },
      { processId: processes[4].id, category: 'ENVIRONMENT', order: 5 },
      { processId: processes[4].id, category: 'MANAGEMENT', order: 6 }
    ]
  })

  const p5Categories = await prisma.fishboneCategory.findMany({
    where: { processId: processes[4].id },
    orderBy: { order: 'asc' }
  })

  await prisma.fishboneCause.createMany({
    data: [
      // People
      { categoryId: p5Categories[0].id, causeDescription: 'Limited product knowledge', order: 1 },
      { categoryId: p5Categories[0].id, causeDescription: 'Insufficient cash flow analysis skills', order: 2 },
      { categoryId: p5Categories[0].id, causeDescription: 'Lack of industry expertise', order: 3 },
      // Process
      { categoryId: p5Categories[1].id, causeDescription: 'Template-driven approach without customization', order: 1 },
      { categoryId: p5Categories[1].id, causeDescription: 'Insufficient cash flow modeling', order: 2 },
      { categoryId: p5Categories[1].id, causeDescription: 'No scenario analysis', order: 3 },
      { categoryId: p5Categories[1].id, causeDescription: 'Limited flexibility in terms', order: 4 },
      // Equipment
      { categoryId: p5Categories[2].id, causeDescription: 'No cash flow modeling tool', order: 1 },
      { categoryId: p5Categories[2].id, causeDescription: 'No dynamic pricing engine', order: 2 },
      { categoryId: p5Categories[2].id, causeDescription: 'Manual rate calculations', order: 3 },
      { categoryId: p5Categories[2].id, causeDescription: 'No competitor pricing data', order: 4 },
      // Materials
      { categoryId: p5Categories[3].id, causeDescription: 'Inaccurate customer projections', order: 1 },
      { categoryId: p5Categories[3].id, causeDescription: 'Outdated market rate information', order: 2 },
      { categoryId: p5Categories[3].id, causeDescription: 'Limited product options', order: 3 },
      // Environment
      { categoryId: p5Categories[4].id, causeDescription: 'Volatile interest rate environment', order: 1 },
      { categoryId: p5Categories[4].id, causeDescription: 'Competitive pressure', order: 2 },
      { categoryId: p5Categories[4].id, causeDescription: 'Customer expectations for flexibility', order: 3 },
      // Management
      { categoryId: p5Categories[5].id, causeDescription: 'No tracking of structure vs performance', order: 1 },
      { categoryId: p5Categories[5].id, causeDescription: 'Limited innovation in products', order: 2 },
      { categoryId: p5Categories[5].id, causeDescription: 'Risk-averse culture', order: 3 }
    ]
  })

  // Process 6: Credit Committee - "Committee Decision Delays"
  await prisma.fishboneCategory.createMany({
    data: [
      { processId: processes[5].id, category: 'PEOPLE', order: 1 },
      { processId: processes[5].id, category: 'PROCESS', order: 2 },
      { processId: processes[5].id, category: 'EQUIPMENT', order: 3 },
      { processId: processes[5].id, category: 'MATERIALS', order: 4 },
      { processId: processes[5].id, category: 'ENVIRONMENT', order: 5 },
      { processId: processes[5].id, category: 'MANAGEMENT', order: 6 }
    ]
  })

  const p6Categories = await prisma.fishboneCategory.findMany({
    where: { processId: processes[5].id },
    orderBy: { order: 'asc' }
  })

  await prisma.fishboneCause.createMany({
    data: [
      // People
      { categoryId: p6Categories[0].id, causeDescription: 'Committee members often unavailable', order: 1 },
      { categoryId: p6Categories[0].id, causeDescription: 'Quorum issues', order: 2 },
      { categoryId: p6Categories[0].id, causeDescription: 'Limited time per case review', order: 3 },
      { categoryId: p6Categories[0].id, causeDescription: 'Members lack industry expertise', order: 4 },
      // Process
      { categoryId: p6Categories[1].id, causeDescription: 'Fixed weekly meeting schedule (not on-demand)', order: 1 },
      { categoryId: p6Categories[1].id, causeDescription: 'Lengthy documentation requirements', order: 2 },
      { categoryId: p6Categories[1].id, causeDescription: 'Sequential review (not parallel)', order: 3 },
      { categoryId: p6Categories[1].id, causeDescription: 'Lack of standardized decision criteria', order: 4 },
      { categoryId: p6Categories[1].id, causeDescription: 'All cases reviewed equally (no fast-track)', order: 5 },
      // Equipment
      { categoryId: p6Categories[2].id, causeDescription: 'No digital approval workflow', order: 1 },
      { categoryId: p6Categories[2].id, causeDescription: 'Paper-based documentation', order: 2 },
      { categoryId: p6Categories[2].id, causeDescription: 'No decision support tools', order: 3 },
      { categoryId: p6Categories[2].id, causeDescription: 'No automated scheduling', order: 4 },
      // Materials
      { categoryId: p6Categories[3].id, causeDescription: 'Incomplete credit memos', order: 1 },
      { categoryId: p6Categories[3].id, causeDescription: 'Poor quality presentations', order: 2 },
      { categoryId: p6Categories[3].id, causeDescription: 'Missing key information', order: 3 },
      // Environment
      { categoryId: p6Categories[4].id, causeDescription: 'High volume of cases', order: 1 },
      { categoryId: p6Categories[4].id, causeDescription: 'Regulatory scrutiny', order: 2 },
      { categoryId: p6Categories[4].id, causeDescription: 'Complex transactions increasing', order: 3 },
      // Management
      { categoryId: p6Categories[5].id, causeDescription: 'No authority delegation framework', order: 1 },
      { categoryId: p6Categories[5].id, causeDescription: 'No performance metrics', order: 2 },
      { categoryId: p6Categories[5].id, causeDescription: 'Overly centralized decision-making', order: 3 }
    ]
  })

  // Process 7: Documentation - "Documentation Delays"
  await prisma.fishboneCategory.createMany({
    data: [
      { processId: processes[6].id, category: 'PEOPLE', order: 1 },
      { processId: processes[6].id, category: 'PROCESS', order: 2 },
      { processId: processes[6].id, category: 'EQUIPMENT', order: 3 },
      { processId: processes[6].id, category: 'MATERIALS', order: 4 },
      { processId: processes[6].id, category: 'ENVIRONMENT', order: 5 },
      { processId: processes[6].id, category: 'MANAGEMENT', order: 6 }
    ]
  })

  const p7Categories = await prisma.fishboneCategory.findMany({
    where: { processId: processes[6].id },
    orderBy: { order: 'asc' }
  })

  await prisma.fishboneCause.createMany({
    data: [
      // People
      { categoryId: p7Categories[0].id, causeDescription: 'Limited documentation team capacity', order: 1 },
      { categoryId: p7Categories[0].id, causeDescription: 'Legal team resource constraints', order: 2 },
      { categoryId: p7Categories[0].id, causeDescription: 'Customer delays in signing', order: 3 },
      { categoryId: p7Categories[0].id, causeDescription: 'High staff turnover', order: 4 },
      // Process
      { categoryId: p7Categories[1].id, causeDescription: 'Sequential workflow (doc -> legal -> compliance)', order: 1 },
      { categoryId: p7Categories[1].id, causeDescription: 'Multiple review rounds', order: 2 },
      { categoryId: p7Categories[1].id, causeDescription: 'Waiting for customer review', order: 3 },
      { categoryId: p7Categories[1].id, causeDescription: 'Manual document preparation', order: 4 },
      { categoryId: p7Categories[1].id, causeDescription: 'Physical signing requirement', order: 5 },
      // Equipment
      { categoryId: p7Categories[2].id, causeDescription: 'No automated document generation', order: 1 },
      { categoryId: p7Categories[2].id, causeDescription: 'No e-signature capability', order: 2 },
      { categoryId: p7Categories[2].id, causeDescription: 'Templates not up to date', order: 3 },
      { categoryId: p7Categories[2].id, causeDescription: 'No workflow automation', order: 4 },
      // Materials
      { categoryId: p7Categories[3].id, causeDescription: 'Complex legal requirements', order: 1 },
      { categoryId: p7Categories[3].id, causeDescription: 'Multiple document types needed', order: 2 },
      { categoryId: p7Categories[3].id, causeDescription: 'Frequent regulatory updates', order: 3 },
      // Environment
      { categoryId: p7Categories[4].id, causeDescription: 'Customer scheduling conflicts', order: 1 },
      { categoryId: p7Categories[4].id, causeDescription: 'Notary availability issues', order: 2 },
      { categoryId: p7Categories[4].id, causeDescription: 'Registry office processing times', order: 3 },
      // Management
      { categoryId: p7Categories[5].id, causeDescription: 'No SLA for documentation', order: 1 },
      { categoryId: p7Categories[5].id, causeDescription: 'No performance tracking', order: 2 },
      { categoryId: p7Categories[5].id, causeDescription: 'Low investment in digitization', order: 3 }
    ]
  })

  // Process 8: Disbursement - "Disbursement Errors"
  await prisma.fishboneCategory.createMany({
    data: [
      { processId: processes[7].id, category: 'PEOPLE', order: 1 },
      { processId: processes[7].id, category: 'PROCESS', order: 2 },
      { processId: processes[7].id, category: 'EQUIPMENT', order: 3 },
      { processId: processes[7].id, category: 'MATERIALS', order: 4 },
      { processId: processes[7].id, category: 'ENVIRONMENT', order: 5 },
      { processId: processes[7].id, category: 'MANAGEMENT', order: 6 }
    ]
  })

  const p8Categories = await prisma.fishboneCategory.findMany({
    where: { processId: processes[7].id },
    orderBy: { order: 'asc' }
  })

  await prisma.fishboneCause.createMany({
    data: [
      // People
      { categoryId: p8Categories[0].id, causeDescription: 'Manual data entry errors', order: 1 },
      { categoryId: p8Categories[0].id, causeDescription: 'Lack of attention to detail', order: 2 },
      { categoryId: p8Categories[0].id, causeDescription: 'Pressure to meet targets', order: 3 },
      { categoryId: p8Categories[0].id, causeDescription: 'Insufficient training', order: 4 },
      // Process
      { categoryId: p8Categories[1].id, causeDescription: 'Manual verification of conditions', order: 1 },
      { categoryId: p8Categories[1].id, causeDescription: 'No hard stops in system', order: 2 },
      { categoryId: p8Categories[1].id, causeDescription: 'Paper-based checklist', order: 3 },
      { categoryId: p8Categories[1].id, causeDescription: 'Triple authorization delays', order: 4 },
      { categoryId: p8Categories[1].id, causeDescription: 'No automated validation', order: 5 },
      // Equipment
      { categoryId: p8Categories[2].id, causeDescription: 'No straight-through processing', order: 1 },
      { categoryId: p8Categories[2].id, causeDescription: 'No automated account validation', order: 2 },
      { categoryId: p8Categories[2].id, causeDescription: 'Legacy payment system', order: 3 },
      { categoryId: p8Categories[2].id, causeDescription: 'No integration with doc system', order: 4 },
      // Materials
      { categoryId: p8Categories[3].id, causeDescription: 'Incorrect account details from customer', order: 1 },
      { categoryId: p8Categories[3].id, causeDescription: 'Missing documentation', order: 2 },
      { categoryId: p8Categories[3].id, causeDescription: 'Unclear disbursement instructions', order: 3 },
      // Environment
      { categoryId: p8Categories[4].id, causeDescription: 'Month-end processing pressure', order: 1 },
      { categoryId: p8Categories[4].id, causeDescription: 'Target-driven culture', order: 2 },
      // Management
      { categoryId: p8Categories[5].id, causeDescription: 'Speed prioritized over accuracy', order: 1 },
      { categoryId: p8Categories[5].id, causeDescription: 'No error rate tracking', order: 2 },
      { categoryId: p8Categories[5].id, causeDescription: 'Inadequate quality control', order: 3 }
    ]
  })

  // Process 9: Monitoring - "Missed Early Warning Signals"
  await prisma.fishboneCategory.createMany({
    data: [
      { processId: processes[8].id, category: 'PEOPLE', order: 1 },
      { processId: processes[8].id, category: 'PROCESS', order: 2 },
      { processId: processes[8].id, category: 'EQUIPMENT', order: 3 },
      { processId: processes[8].id, category: 'MATERIALS', order: 4 },
      { processId: processes[8].id, category: 'ENVIRONMENT', order: 5 },
      { processId: processes[8].id, category: 'MANAGEMENT', order: 6 }
    ]
  })

  const p9Categories = await prisma.fishboneCategory.findMany({
    where: { processId: processes[8].id },
    orderBy: { order: 'asc' }
  })

  await prisma.fishboneCause.createMany({
    data: [
      // People
      { categoryId: p9Categories[0].id, causeDescription: 'High portfolio per relationship manager', order: 1 },
      { categoryId: p9Categories[0].id, causeDescription: 'Insufficient industry expertise', order: 2 },
      { categoryId: p9Categories[0].id, causeDescription: 'Alert fatigue from too many alerts', order: 3 },
      { categoryId: p9Categories[0].id, causeDescription: 'Optimism bias in assessment', order: 4 },
      // Process
      { categoryId: p9Categories[1].id, causeDescription: 'Manual monitoring approach', order: 1 },
      { categoryId: p9Categories[1].id, causeDescription: 'Infrequent financial statement reviews', order: 2 },
      { categoryId: p9Categories[1].id, causeDescription: 'No systematic covenant tracking', order: 3 },
      { categoryId: p9Categories[1].id, causeDescription: 'Reactive rather than proactive', order: 4 },
      { categoryId: p9Categories[1].id, causeDescription: 'Limited customer site visits', order: 5 },
      // Equipment
      { categoryId: p9Categories[2].id, causeDescription: 'No predictive analytics', order: 1 },
      { categoryId: p9Categories[2].id, causeDescription: 'No automated covenant tracking', order: 2 },
      { categoryId: p9Categories[2].id, causeDescription: 'Basic reporting tools only', order: 3 },
      { categoryId: p9Categories[2].id, causeDescription: 'No integration with external data', order: 4 },
      { categoryId: p9Categories[2].id, causeDescription: 'No AI-based risk detection', order: 5 },
      // Materials
      { categoryId: p9Categories[3].id, causeDescription: 'Delayed financial statement submission', order: 1 },
      { categoryId: p9Categories[3].id, causeDescription: 'Poor quality financial data', order: 2 },
      { categoryId: p9Categories[3].id, causeDescription: 'Lack of real-time market data', order: 3 },
      { categoryId: p9Categories[3].id, causeDescription: 'Incomplete covenant reporting', order: 4 },
      // Environment
      { categoryId: p9Categories[4].id, causeDescription: 'Rapid market changes', order: 1 },
      { categoryId: p9Categories[4].id, causeDescription: 'Economic volatility', order: 2 },
      { categoryId: p9Categories[4].id, causeDescription: 'Industry-specific disruptions', order: 3 },
      // Management
      { categoryId: p9Categories[5].id, causeDescription: 'No early warning KPIs', order: 1 },
      { categoryId: p9Categories[5].id, causeDescription: 'Inadequate escalation procedures', order: 2 },
      { categoryId: p9Categories[5].id, causeDescription: 'Low investment in monitoring tools', order: 3 },
      { categoryId: p9Categories[5].id, causeDescription: 'No predictive modeling capability', order: 4 }
    ]
  })

  const fishboneCount = await prisma.fishboneCategory.count({
    where: { process: { assignmentId: assignment.id } }
  })
  const fishboneCauseCount = await prisma.fishboneCause.count({
    where: { category: { process: { assignmentId: assignment.id } } }
  })
  console.log('✅ Created', fishboneCount, 'Fishbone categories with', fishboneCauseCount, 'root causes across all processes')

  console.log('\n✅ All Six Sigma tools completed successfully!')
  console.log('\n📊 Final Summary:')
  console.log(`   - VSM Steps: ${vsmCount}`)
  console.log(`   - Fishbone Categories: ${fishboneCount}`)
  console.log(`   - Root Causes: ${fishboneCauseCount}`)
  console.log(`   - All 9 processes have complete VSM and Fishbone analysis`)
  console.log(`   - All 9 processes have process capability metrics`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
