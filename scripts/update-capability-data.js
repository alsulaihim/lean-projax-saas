// Usage: DATABASE_URL="postgresql://user:password@localhost:5432/dbname" node scripts/update-capability-data.js
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

async function updateCapabilityData() {
  try {
    console.log('🚀 Updating process capability data with varied values...')

    // Get all processes
    const processes = await prisma.process.findMany()

    if (processes.length === 0) {
      console.log('❌ No processes found.')
      return
    }

    console.log(`Found ${processes.length} process(es)`)

    // Different capability data for different process types
    const capabilityDataSets = {
      Order: {
        lowerSpecLimit: 8.0,
        upperSpecLimit: 12.0,
        targetValue: 10.0,
        sampleMean: 10.2,
        sampleStdDev: 0.45,
      },
      Manufacturing: {
        lowerSpecLimit: 95.0,
        upperSpecLimit: 105.0,
        targetValue: 100.0,
        sampleMean: 99.8,
        sampleStdDev: 1.2,
      },
      Quality: {
        lowerSpecLimit: 0.0,
        upperSpecLimit: 5.0,
        targetValue: 2.5,
        sampleMean: 2.3,
        sampleStdDev: 0.8,
      },
      Assembly: {
        lowerSpecLimit: 45.0,
        upperSpecLimit: 55.0,
        targetValue: 50.0,
        sampleMean: 50.5,
        sampleStdDev: 1.8,
      },
      Fulfillment: {
        lowerSpecLimit: 20.0,
        upperSpecLimit: 30.0,
        targetValue: 25.0,
        sampleMean: 24.8,
        sampleStdDev: 1.5,
      },
      Default: {
        lowerSpecLimit: 10.0,
        upperSpecLimit: 20.0,
        targetValue: 15.0,
        sampleMean: 15.3,
        sampleStdDev: 1.1,
      },
    }

    let updatedCount = 0

    for (const process of processes) {
      // Skip if process already has complete capability data
      if (
        process.lowerSpecLimit &&
        process.upperSpecLimit &&
        process.sampleMean &&
        process.sampleStdDev
      ) {
        console.log(
          `⚠️  Process "${process.processName}" already has capability data. Updating with new values...`
        )
      }

      // Determine which data set to use based on process name
      let dataToUse = capabilityDataSets.Default

      for (const [key, data] of Object.entries(capabilityDataSets)) {
        if (process.processName.includes(key)) {
          dataToUse = data
          break
        }
      }

      // Add some variation to make each process unique
      const variation = Math.random() * 0.2 - 0.1 // ±10% variation
      const uniqueData = {
        lowerSpecLimit: dataToUse.lowerSpecLimit,
        upperSpecLimit: dataToUse.upperSpecLimit,
        targetValue: dataToUse.targetValue,
        sampleMean: dataToUse.sampleMean * (1 + variation),
        sampleStdDev: dataToUse.sampleStdDev * (1 + Math.abs(variation)),
      }

      // Update the process with capability data
      await prisma.process.update({
        where: { id: process.id },
        data: uniqueData,
      })

      updatedCount++
      console.log(`✅ Updated capability data for: ${process.processName}`)
      console.log(`   LSL: ${uniqueData.lowerSpecLimit}, USL: ${uniqueData.upperSpecLimit}`)
      console.log(
        `   Mean: ${uniqueData.sampleMean.toFixed(2)}, StdDev: ${uniqueData.sampleStdDev.toFixed(3)}`
      )
    }

    console.log(`\n✅ Successfully updated capability data for ${updatedCount} processes`)
  } catch (error) {
    console.error('❌ Error updating capability data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
updateCapabilityData()
