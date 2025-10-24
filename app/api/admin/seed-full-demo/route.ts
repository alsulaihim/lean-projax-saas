import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(req: NextRequest) {
  try {
    const { adminSecret } = await req.json()

    // Simple admin secret check
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🌱 Running full demo seed script...')

    // Run the seed script using the DATABASE_URL from environment
    const { stdout, stderr } = await execAsync('npx tsx prisma/seed-demo.ts', {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      },
      timeout: 60000, // 60 second timeout
    })

    console.log('stdout:', stdout)
    if (stderr) console.error('stderr:', stderr)

    return NextResponse.json({
      success: true,
      message: 'Full demo data seeded successfully!',
      output: stdout,
    })
  } catch (error) {
    console.error('Error seeding full demo data:', error)
    return NextResponse.json(
      {
        error: 'Failed to seed full demo data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
