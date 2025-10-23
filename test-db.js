const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })

  try {
    console.log('Testing database connection...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL)

    const users = await prisma.user.findMany()
    console.log('Found users:', users.length)
    users.forEach(user => {
      console.log(' -', user.email, user.name)
    })
  } catch (error) {
    console.error('Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
