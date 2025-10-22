import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Resetting demo data...')

  // Find demo user
  const demoUser = await prisma.user.findFirst({
    where: { email: 'demo@leanprojax.com' },
  })

  if (!demoUser) {
    console.log('❌ Demo user not found')
    return
  }

  // Delete all demo assignments (cascade will delete related data)
  const deleted = await prisma.assignment.deleteMany({
    where: {
      createdById: demoUser.id,
      isDemo: true,
    },
  })

  console.log(`✅ Deleted ${deleted.count} demo assignment(s)`)
}

main()
  .catch((e) => {
    console.error('Error resetting demo data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
