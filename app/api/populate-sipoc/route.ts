import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    // Get all processes
    const processes = await prisma.process.findMany()

    if (processes.length === 0) {
      return NextResponse.json({ error: 'No processes found' }, { status: 404 })
    }

    let totalAdded = 0

    for (const process of processes) {
      // Check if SIPOC entries already exist
      const existingEntries = await prisma.sIPOCEntry.count({
        where: { processId: process.id }
      })

      if (existingEntries > 0) {
        continue // Skip if already has data
      }

      // Define SIPOC data based on process name
      let sipocData = []

      if (process.processName.includes('Order') || process.processName.includes('Fulfillment')) {
        sipocData = [
          { supplier: 'Customer', input: 'Purchase Order', process: 'Order Validation', output: 'Validated Order', customer: 'Inventory System' },
          { supplier: 'Sales Team', input: 'Customer Requirements', process: 'Order Processing', output: 'Order Confirmation', customer: 'Customer' },
          { supplier: 'Inventory System', input: 'Stock Levels', process: 'Inventory Check', output: 'Stock Availability', customer: 'Warehouse' },
          { supplier: 'Warehouse', input: 'Picking List', process: 'Order Picking', output: 'Packed Order', customer: 'Shipping Dept' },
          { supplier: 'Shipping Partners', input: 'Shipping Labels', process: 'Order Dispatch', output: 'Tracking Info', customer: 'Customer' }
        ]
      } else if (process.processName.includes('Manufacturing') || process.processName.includes('Assembly')) {
        sipocData = [
          { supplier: 'Raw Material Vendor', input: 'Raw Materials', process: 'Material Inspection', output: 'Approved Materials', customer: 'Production Line' },
          { supplier: 'Production Planning', input: 'Work Orders', process: 'Production Setup', output: 'Ready Line', customer: 'Operators' },
          { supplier: 'Machine Operators', input: 'Machine Settings', process: 'Manufacturing', output: 'Semi-Finished Goods', customer: 'Assembly Team' },
          { supplier: 'Assembly Team', input: 'Components', process: 'Product Assembly', output: 'Finished Products', customer: 'Quality Control' },
          { supplier: 'Quality Team', input: 'Quality Standards', process: 'Final Inspection', output: 'Certified Products', customer: 'Warehouse' }
        ]
      } else if (process.processName.includes('Quality') || process.processName.includes('Control')) {
        sipocData = [
          { supplier: 'Production Line', input: 'Product Samples', process: 'Sample Collection', output: 'Test Samples', customer: 'Lab Team' },
          { supplier: 'Test Equipment', input: 'Calibrated Tools', process: 'Performance Testing', output: 'Test Results', customer: 'Quality Records' },
          { supplier: 'QC Engineers', input: 'Quality Standards', process: 'Compliance Check', output: 'Compliance Report', customer: 'Management' },
          { supplier: 'Customer Service', input: 'Customer Complaints', process: 'Root Cause Analysis', output: 'Corrective Actions', customer: 'Production Team' },
          { supplier: 'Quality Team', input: 'Metrics Data', process: 'Quality Reporting', output: 'Quality Dashboard', customer: 'Stakeholders' }
        ]
      } else {
        // Generic SIPOC data
        sipocData = [
          { supplier: 'Internal Team', input: 'Requirements', process: 'Process Step 1', output: 'Intermediate Output', customer: 'Next Process' },
          { supplier: 'External Vendor', input: 'Resources', process: 'Process Step 2', output: 'Processed Item', customer: 'Internal Team' },
          { supplier: 'Department A', input: 'Information', process: 'Process Step 3', output: 'Report', customer: 'Department B' },
          { supplier: 'System', input: 'Data', process: 'Process Step 4', output: 'Analysis', customer: 'Management' },
          { supplier: 'Stakeholder', input: 'Feedback', process: 'Process Step 5', output: 'Improvements', customer: 'End User' }
        ]
      }

      // Create SIPOC entries atomically for this process
      await prisma.$transaction(async (tx) => {
        const sipocEntries = sipocData.flatMap((row, index) => [
          {
            processId: process.id,
            column: 'SUPPLIER' as const,
            order: index,
            value: row.supplier
          },
          {
            processId: process.id,
            column: 'INPUT' as const,
            order: index,
            value: row.input
          },
          {
            processId: process.id,
            column: 'PROCESS' as const,
            order: index,
            value: row.process
          },
          {
            processId: process.id,
            column: 'OUTPUT' as const,
            order: index,
            value: row.output
          },
          {
            processId: process.id,
            column: 'CUSTOMER' as const,
            order: index,
            value: row.customer
          }
        ])

        await tx.sIPOCEntry.createMany({
          data: sipocEntries
        })
      })

      totalAdded += sipocData.length * 5 // 5 entries per row
    }

    return NextResponse.json({
      message: 'SIPOC data populated successfully',
      entriesAdded: totalAdded,
      processesUpdated: processes.length
    })
  } catch (error) {
    console.error('Error populating SIPOC data:', error)
    return NextResponse.json(
      { error: 'Failed to populate SIPOC data' },
      { status: 500 }
    )
  }
}