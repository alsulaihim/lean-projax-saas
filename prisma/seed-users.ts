import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Creating users...')

  // Create test users (one per role)
  const password = await bcrypt.hash('password123', 10)

  try {
    const bpiUser = await prisma.user.upsert({
      where: { email: 'analyst@example.com' },
      update: {},
      create: {
        email: 'analyst@example.com',
        name: 'John Analyst',
        role: 'BPI_TEAM',
        passwordHash: password
      }
    })

    const teamLead = await prisma.user.upsert({
      where: { email: 'lead@example.com' },
      update: {},
      create: {
        email: 'lead@example.com',
        name: 'Sarah Lead',
        role: 'TEAM_LEAD',
        passwordHash: password
      }
    })

    const executive = await prisma.user.upsert({
      where: { email: 'exec@example.com' },
      update: {},
      create: {
        email: 'exec@example.com',
        name: 'Mike Executive',
        role: 'EXECUTIVE',
        passwordHash: password
      }
    })

    const processOwner = await prisma.user.upsert({
      where: { email: 'owner@example.com' },
      update: {},
      create: {
        email: 'owner@example.com',
        name: 'Lisa Owner',
        role: 'PROCESS_OWNER',
        passwordHash: password
      }
    })

    console.log('✅ Created/Updated users:')
    console.log('  - analyst@example.com (password: password123)')
    console.log('  - lead@example.com (password: password123)')
    console.log('  - exec@example.com (password: password123)')
    console.log('  - owner@example.com (password: password123)')
    console.log('')
    console.log('You can now login with any of these credentials!')
  } catch (error) {
    console.error('Error creating users:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })