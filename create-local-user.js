// Usage: DATABASE_URL="postgresql://user:password@localhost:5432/dbname" node create-local-user.js
const { Client } = require('pg')
const bcrypt = require('bcryptjs')

async function createUsers() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('ERROR: DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  const client = new Client({
    connectionString: connectionString
  })

  try {
    await client.connect()
    console.log('Connected to local PostgreSQL')

    // Create test user with hashed password
    const passwordHash = await bcrypt.hash('password123', 10)

    // Insert user
    const query = `
      INSERT INTO "User" (id, email, name, role, "passwordHash", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE
      SET "passwordHash" = $5, "updatedAt" = NOW()
      RETURNING email, name
    `

    const users = [
      ['user-1', 'analyst@example.com', 'John Analyst', 'BPI_TEAM'],
      ['user-2', 'lead@example.com', 'Sarah Lead', 'TEAM_LEAD'],
      ['user-3', 'exec@example.com', 'Mike Executive', 'EXECUTIVE'],
      ['user-4', 'owner@example.com', 'Lisa Owner', 'PROCESS_OWNER']
    ]

    for (const [id, email, name, role] of users) {
      const result = await client.query(query, [id, email, name, role, passwordHash])
      console.log('Created/Updated user:', result.rows[0])
    }

    console.log('\n✅ Users created successfully!')
    console.log('You can now login with:')
    console.log('  Email: analyst@example.com')
    console.log('  Password: password123')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.end()
  }
}

createUsers()