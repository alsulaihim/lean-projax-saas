// Usage: DATABASE_URL="postgresql://user:password@localhost:5432/dbname" node scripts/add-sipoc-data.js
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

async function addSIPOCData() {
  try {
    console.log('🚀 Adding SIPOC data to existing processes...')

    // Get all processes
    const processes = await prisma.process.findMany()

    if (processes.length === 0) {
      console.log('❌ No processes found. Please create an assignment with processes first.')
      return
    }

    console.log(`Found ${processes.length} process(es)`)

    for (const process of processes) {
      console.log(`\nAdding SIPOC data for process: ${process.processName}`)

      // Check if SIPOC entries already exist
      const existingEntries = await prisma.sIPOCEntry.count({
        where: { processId: process.id },
      })

      if (existingEntries > 0) {
        console.log(`⚠️  SIPOC entries already exist for ${process.processName}. Skipping...`)
        continue
      }

      // Define SIPOC data based on process name
      let sipocData = []

      if (process.processName.includes('Order') || process.processName.includes('Fulfillment')) {
        sipocData = [
          {
            supplier: 'Customer',
            input: 'Purchase Order',
            process: 'Order Validation',
            output: 'Validated Order',
            customer: 'Inventory System',
          },
          {
            supplier: 'Sales Team',
            input: 'Customer Requirements',
            process: 'Order Processing',
            output: 'Order Confirmation',
            customer: 'Customer',
          },
          {
            supplier: 'Inventory System',
            input: 'Stock Levels',
            process: 'Inventory Check',
            output: 'Stock Availability',
            customer: 'Warehouse',
          },
          {
            supplier: 'Warehouse',
            input: 'Picking List',
            process: 'Order Picking',
            output: 'Packed Order',
            customer: 'Shipping Dept',
          },
          {
            supplier: 'Shipping Partners',
            input: 'Shipping Labels',
            process: 'Order Dispatch',
            output: 'Tracking Info',
            customer: 'Customer',
          },
        ]
      } else if (
        process.processName.includes('Manufacturing') ||
        process.processName.includes('Assembly')
      ) {
        sipocData = [
          {
            supplier: 'Raw Material Vendor',
            input: 'Raw Materials',
            process: 'Material Inspection',
            output: 'Approved Materials',
            customer: 'Production Line',
          },
          {
            supplier: 'Production Planning',
            input: 'Work Orders',
            process: 'Production Setup',
            output: 'Ready Line',
            customer: 'Operators',
          },
          {
            supplier: 'Machine Operators',
            input: 'Machine Settings',
            process: 'Manufacturing',
            output: 'Semi-Finished Goods',
            customer: 'Assembly Team',
          },
          {
            supplier: 'Assembly Team',
            input: 'Components',
            process: 'Product Assembly',
            output: 'Finished Products',
            customer: 'Quality Control',
          },
          {
            supplier: 'Quality Team',
            input: 'Quality Standards',
            process: 'Final Inspection',
            output: 'Certified Products',
            customer: 'Warehouse',
          },
        ]
      } else if (
        process.processName.includes('Quality') ||
        process.processName.includes('Control')
      ) {
        sipocData = [
          {
            supplier: 'Production Line',
            input: 'Product Samples',
            process: 'Sample Collection',
            output: 'Test Samples',
            customer: 'Lab Team',
          },
          {
            supplier: 'Test Equipment',
            input: 'Calibrated Tools',
            process: 'Performance Testing',
            output: 'Test Results',
            customer: 'Quality Records',
          },
          {
            supplier: 'QC Engineers',
            input: 'Quality Standards',
            process: 'Compliance Check',
            output: 'Compliance Report',
            customer: 'Management',
          },
          {
            supplier: 'Customer Service',
            input: 'Customer Complaints',
            process: 'Root Cause Analysis',
            output: 'Corrective Actions',
            customer: 'Production Team',
          },
          {
            supplier: 'Quality Team',
            input: 'Metrics Data',
            process: 'Quality Reporting',
            output: 'Quality Dashboard',
            customer: 'Stakeholders',
          },
        ]
      } else {
        // Generic SIPOC data
        sipocData = [
          {
            supplier: 'Internal Team',
            input: 'Requirements',
            process: 'Process Step 1',
            output: 'Intermediate Output',
            customer: 'Next Process',
          },
          {
            supplier: 'External Vendor',
            input: 'Resources',
            process: 'Process Step 2',
            output: 'Processed Item',
            customer: 'Internal Team',
          },
          {
            supplier: 'Department A',
            input: 'Information',
            process: 'Process Step 3',
            output: 'Report',
            customer: 'Department B',
          },
          {
            supplier: 'System',
            input: 'Data',
            process: 'Process Step 4',
            output: 'Analysis',
            customer: 'Management',
          },
          {
            supplier: 'Stakeholder',
            input: 'Feedback',
            process: 'Process Step 5',
            output: 'Improvements',
            customer: 'End User',
          },
        ]
      }

      // Create SIPOC entries using the actual schema with column, value, and order fields
      let orderIndex = 0
      for (const row of sipocData) {
        // Create SUPPLIER entry
        await prisma.sIPOCEntry.create({
          data: {
            processId: process.id,
            column: 'SUPPLIER',
            value: row.supplier,
            order: orderIndex,
          },
        })

        // Create INPUT entry
        await prisma.sIPOCEntry.create({
          data: {
            processId: process.id,
            column: 'INPUT',
            value: row.input,
            order: orderIndex,
          },
        })

        // Create PROCESS entry
        await prisma.sIPOCEntry.create({
          data: {
            processId: process.id,
            column: 'PROCESS',
            value: row.process,
            order: orderIndex,
          },
        })

        // Create OUTPUT entry
        await prisma.sIPOCEntry.create({
          data: {
            processId: process.id,
            column: 'OUTPUT',
            value: row.output,
            order: orderIndex,
          },
        })

        // Create CUSTOMER entry
        await prisma.sIPOCEntry.create({
          data: {
            processId: process.id,
            column: 'CUSTOMER',
            value: row.customer,
            order: orderIndex,
          },
        })

        orderIndex++
      }

      console.log(`✅ Added ${sipocData.length} rows of SIPOC data for ${process.processName}`)
    }

    // Verify the data was added
    const totalEntries = await prisma.sIPOCEntry.count()
    console.log(`\n✅ Total SIPOC entries in database: ${totalEntries}`)
  } catch (error) {
    console.error('❌ Error adding SIPOC data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
addSIPOCData()
