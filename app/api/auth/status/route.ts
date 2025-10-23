import { NextRequest, NextResponse } from 'next/server'
import { getFullUser } from '@/lib/auth-check'

/**
 * Auth Status API
 *
 * Purpose: Allow external apps (like marketing site) to check if user is logged in
 * and get their subscription status
 *
 * This endpoint is CORS-enabled to allow requests from the marketing site
 */
export async function GET(request: NextRequest) {
  // Enable CORS for marketing site
  const origin = request.headers.get('origin')
  const allowedOrigins = [
    'http://localhost:3071', // Marketing site local
    process.env.NEXT_PUBLIC_MARKETING_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean)

  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin || '') ? origin! : '',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
  }

  // Handle preflight request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: corsHeaders })
  }

  try {
    const user = await getFullUser()

    if (!user) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        { headers: corsHeaders }
      )
    }

    // Return user info with subscription status
    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          subscriptionTier: user.subscriptionTier,
          subscriptionStatus: user.subscriptionStatus,
          isDemo: user.isDemo || false,
        },
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Auth status check failed:', error)
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        error: 'Failed to check authentication status',
      },
      { status: 500, headers: corsHeaders }
    )
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowedOrigins = [
    'http://localhost:3071',
    process.env.NEXT_PUBLIC_MARKETING_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean)

  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin || '') ? origin! : '',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
  }

  return new NextResponse(null, { status: 200, headers: corsHeaders })
}
