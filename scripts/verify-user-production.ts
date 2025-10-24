import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})

async function verifyUser(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpiry: null,
      },
    })
    console.log(`✅ User ${user.email} has been verified!`)
    console.log(`User ID: ${user.id}`)
    console.log(`Name: ${user.name}`)
  } catch (error) {
    console.error('Error verifying user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.error('Please provide an email address')
  console.error('Usage: npx tsx scripts/verify-user-production.ts user@example.com')
  process.exit(1)
}

verifyUser(email)
