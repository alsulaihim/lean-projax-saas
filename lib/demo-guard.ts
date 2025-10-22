import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function checkDemoUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isDemo: true },
  })
  return user?.isDemo || false
}

export function demoUserResponse() {
  return NextResponse.json(
    {
      error: 'Demo mode: Modifications are not allowed',
      message:
        'You are in demo mode. To create and modify assignments, please sign up for a free trial.',
    },
    { status: 403 }
  )
}
