import { PrismaClient } from '@prisma/client'
import * as readline from 'readline'

const prisma = new PrismaClient()

async function confirmAction(): Promise<boolean> {
  // Skip confirmation if --force flag is provided
  if (process.argv.includes('--force')) {
    console.log('⚠️  Force flag detected, skipping confirmation...')
    return true
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question('⚠️  This will delete all demo assignments and related data. Continue? (yes/no): ', (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'yes')
    })
  })
}

async function main() {
  console.log('🗑️  Resetting demo data...')

  // Ask for confirmation
  const confirmed = await confirmAction()
  if (!confirmed) {
    console.log('❌ Operation cancelled')
    process.exit(0)
  }

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
