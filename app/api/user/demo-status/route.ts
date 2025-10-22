import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth-check'

export async function GET() {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ isDemo: false }, { status: 401 })
    }

    return NextResponse.json({
      isDemo: user.isDemo || false,
    })
  } catch (error) {
    console.error('Error checking demo status:', error)
    return NextResponse.json({ isDemo: false }, { status: 500 })
  }
}
