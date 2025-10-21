import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

export const pool = new Pool({
  connectionString,
})

export async function query(text: string, params?: unknown[]) {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start

  // Log query execution without sensitive data
  if (process.env.NODE_ENV === 'development') {
    console.log('Executed query', { duration, rows: res.rowCount })
  }

  return res
}