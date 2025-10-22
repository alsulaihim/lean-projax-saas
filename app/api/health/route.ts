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
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'lean-projax-platform',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}

