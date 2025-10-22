import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      isDemo: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  console.log('\n=== Users in Database ===\n')
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name} (${user.email})`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Email Verified: ${user.emailVerified ? 'YES' : 'NO'}`)
    console.log(`   Is Demo: ${user.isDemo ? 'YES' : 'NO'}`)
    console.log(`   Created: ${user.createdAt.toISOString()}`)
    console.log('')
  })

  console.log(`Total users: ${users.length}\n`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
