// Usage: DATABASE_URL="postgresql://user:password@localhost:5432/dbname" node scripts/create-user-mashael.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('ERROR: DATABASE_URL environment variable is not set')
  process.exit(1)
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionString
    }
  }
})

async function createUser() {
  try {
    console.log('🚀 Creating new user for Mashael M (Head of BPI)...')

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'mashael@sample.com' }
    })

    if (existingUser) {
      console.log('⚠️  User already exists with email: mashael@sample.com')
      console.log('   Name:', existingUser.name)
      console.log('   Role:', existingUser.role)
      return
    }

    // Hash the default password
    const hashedPassword = await bcrypt.hash('Password123!', 10)

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        email: 'mashael@sample.com',
        name: 'Mashael M',
        role: 'BPI_TEAM', // Full privileges for BPI team
        passwordHash: hashedPassword
      }
    })

    console.log('✅ User created successfully!')
    console.log('   Email:', newUser.email)
    console.log('   Name:', newUser.name)
    console.log('   Role:', newUser.role)
    console.log('   Title: Head of BPI')
    console.log('   Default Password: Password123!')
    console.log('\n📌 Note: Please change the password after first login')

  } catch (error) {
    console.error('❌ Error creating user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
createUser()