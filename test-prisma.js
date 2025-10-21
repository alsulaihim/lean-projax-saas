const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function test() {
  try {
    console.log('Attempting to connect to database...')
    const users = await prisma.user.findMany()
    console.log('Success! Found users:', users.length)
    console.log('Users:', users.map(u => ({ email: u.email, role: u.role })))
  } catch (error) {
    console.error('Error:', error.message)
    console.error('Code:', error.code)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

test()