import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth-check'

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { processId, assignmentId, column, value, order } = await request.json()

    // Input validation
    if (!processId || !assignmentId || !column || !value) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create SIPOC entry and audit log atomically
    const entry = await prisma.$transaction(async (tx) => {
      const newEntry = await tx.sIPOCEntry.create({
        data: {
          processId,
          column,
          value,
          order: order || 0
        }
      })

      await tx.auditLog.create({
        data: {
          userId: user.id, // Use authenticated user's ID
          assignmentId,
          action: 'CREATED',
          entityType: 'SIPOCEntry',
          entityId: newEntry.id,
          changeDetails: {
            column,
            value,
            order: order || 0
          }
        }
      })

      return newEntry
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Failed to create SIPOC entry:', error)
    return NextResponse.json(
      { error: 'Failed to create SIPOC entry' },
      { status: 500 }
    )
  }
}