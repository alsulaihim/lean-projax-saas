import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Health check endpoint for deployment verification
 * Tests database connectivity and returns service status
 */
export async function GET() {
  try {
    // Test database connection by running a simple query
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'lean-projax-platform',
      database: 'connected'
    }, { status: 200 })
  } catch (error) {
    // Log full error server-side
    console.error('[Health Check Failed]', error)

    // Return generic error without exposing internals
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'lean-projax-platform',
      database: 'disconnected',
      // Don't expose error details in production
      ...(process.env.NODE_ENV === 'development' && {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }, { status: 503 })
  }
}

