import { NextResponse } from 'next/server'
import type { User } from './auth-check'

/**
 * Check if user is in demo mode and return an error response if they try to modify data
 * @param user - The authenticated user
 * @returns NextResponse with 403 error if demo user, null otherwise
 */
export function checkDemoMode(user: User | null): NextResponse | null {
  if (user?.isDemo) {
    return NextResponse.json(
      {
        error: 'Demo mode is read-only. Sign up for a free account to create your own assignments.',
        isDemo: true
      },
      { status: 403 }
    )
  }
  return null
}
