// Usage: DATABASE_URL="postgresql://user:password@localhost:5432/dbname" node create-sample-assignment.js
const { Client } = require('pg')

async function createSampleAssignment() {
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

    // Create sample assignment
    const query = `
      INSERT INTO "Assignment" (id, title, objective, status, "createdById", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE
      SET title = $2, objective = $3, "updatedAt" = NOW()
      RETURNING title
    `

    const result = await client.query(query, [
      'assignment-1',
      'Order Fulfillment Process Analysis',
      'Reduce order cycle time by 30% and improve accuracy to 99.5%',
      'DRAFT',
      'user-1' // analyst user ID
    ])

    console.log('✅ Sample assignment created:', result.rows[0])
    console.log('\nYou should now see this assignment in the assignments page!')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.end()
  }
}

createSampleAssignment()