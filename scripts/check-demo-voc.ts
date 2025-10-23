import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== Checking Demo Assignment VOC Statements ===\n')

  // Find the demo assignment
  const demoAssignment = await prisma.assignment.findFirst({
    where: {
      isDemo: true,
    },
    include: {
      vocStatements: {
        include: {
          ctqRequirements: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!demoAssignment) {
    console.log('No demo assignment found')
    return
  }

  console.log(`Demo Assignment: ${demoAssignment.title}`)
  console.log(`Total VOC Statements: ${demoAssignment.vocStatements.length}\n`)

  if (demoAssignment.vocStatements.length === 0) {
    console.log('No VOC statements found')
    return
  }

  demoAssignment.vocStatements.forEach((voc, index) => {
    console.log(`${index + 1}. ${voc.voiceStatement}`)
    console.log(`   Customer Segment: ${voc.customerSegment}`)
    console.log(`   Created: ${voc.createdAt}`)
    console.log(`   CTQ Requirements: ${voc.ctqRequirements.length}`)
    console.log(`   ID: ${voc.id}`)
    console.log('')
  })

  // Find the most recent VOC (likely the test one)
  const latestVoc = demoAssignment.vocStatements[0]

  console.log('=== Deleting Latest VOC (Test Entry) ===')
  console.log(`Deleting: ${latestVoc.voiceStatement}`)
  console.log(`ID: ${latestVoc.id}`)

  // Delete the VOC statement (will cascade to CTQ requirements)
  await prisma.vOCStatement.delete({
    where: {
      id: latestVoc.id,
    },
  })

  console.log('\n✅ Test VOC deleted successfully')
}

main()
  .catch(e => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
