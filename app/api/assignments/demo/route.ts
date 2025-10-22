import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // If authenticated, verify they are the demo user
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isDemo: true },
      })

      if (!user?.isDemo) {
        return NextResponse.json({ error: 'Not a demo user' }, { status: 403 })
      }

      // Get demo assignment for this user
      const demoAssignment = await prisma.assignment.findFirst({
        where: {
          createdById: session.user.id,
          isDemo: true,
        },
        select: { id: true },
      })

      if (!demoAssignment) {
        return NextResponse.json({ error: 'Demo assignment not found' }, { status: 404 })
      }

      return NextResponse.json({ assignmentId: demoAssignment.id })
    }

    // Not authenticated - return the demo assignment ID for public access
    // This allows the /demo page to get the assignment ID before logging in
    const demoUser = await prisma.user.findFirst({
      where: { email: 'demo@leanprojax.com' },
      select: { id: true },
    })

    if (!demoUser) {
      return NextResponse.json({ error: 'Demo user not found' }, { status: 404 })
    }

    const demoAssignment = await prisma.assignment.findFirst({
      where: {
        createdById: demoUser.id,
        isDemo: true,
      },
      select: { id: true },
    })

    if (!demoAssignment) {
      return NextResponse.json({ error: 'Demo assignment not found' }, { status: 404 })
    }

    return NextResponse.json({ assignmentId: demoAssignment.id })
  } catch (error) {
    console.error('Error fetching demo assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
