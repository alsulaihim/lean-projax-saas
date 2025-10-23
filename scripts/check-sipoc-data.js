// Usage: DATABASE_URL="postgresql://user:password@localhost:5432/dbname" node scripts/check-sipoc-data.js
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

async function checkSIPOCData() {
  try {
    // Get all processes with SIPOC entries
    const processes = await prisma.process.findMany({
      include: {
        sipocEntries: true,
      },
    })

    console.log('\n=== SIPOC Data Check ===\n')

    for (const process of processes) {
      console.log(`Process: ${process.processName}`)
      console.log(`  Total SIPOC entries: ${process.sipocEntries.length}`)

      if (process.sipocEntries.length > 0) {
        const categories = {}
        process.sipocEntries.forEach(entry => {
          categories[entry.category] = (categories[entry.category] || 0) + 1
        })

        console.log('  Breakdown by category:')
        Object.entries(categories).forEach(([cat, count]) => {
          console.log(`    ${cat}: ${count} entries`)
        })

        // Show sample entries
        console.log('\n  Sample entries:')
        process.sipocEntries.slice(0, 3).forEach(entry => {
          console.log(
            `    [${entry.category}] ${entry.item}: ${entry.description || 'No description'}`
          )
        })
      }
      console.log('---')
    }

    // Check if there are any SIPOC entries at all
    const totalEntries = await prisma.sipocEntry.count()
    console.log(`\nTotal SIPOC entries in database: ${totalEntries}`)
  } catch (error) {
    console.error('Error checking SIPOC data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSIPOCData()
