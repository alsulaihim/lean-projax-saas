import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth-check'
import { checkDemoMode } from '@/lib/demo-check'

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Prevent demo users from modifying data
  const demoCheck = checkDemoMode(user)
  if (demoCheck) return demoCheck

  try {
    const body = await request.json()
    const { 
      vocId, 
      requirement, 
      unit, 
      lowerSpec, 
      targetSpec, 
      upperSpec,
      assignmentId 
    } = body

    // Input validation - assignmentId is required, vocId is optional
    if (!assignmentId) {
      return NextResponse.json({ error: 'Missing required field: assignmentId' }, { status: 400 })
    }

    if (!requirement) {
      return NextResponse.json({ error: 'Missing required field: requirement (CTQ description)' }, { status: 400 })
    }

    // Build measurement criteria from specs
    const specs = []
    if (lowerSpec) specs.push(`LSL: ${lowerSpec}`)
    if (targetSpec) specs.push(`Target: ${targetSpec}`)
    if (upperSpec) specs.push(`USL: ${upperSpec}`)
    const measurementCriteria = unit ? `${specs.join(', ')} ${unit}` : specs.join(', ')
    const targetValue = targetSpec ? `${targetSpec} ${unit || ''}`.trim() : null

    // Create CTQ requirement and audit log atomically
    const ctq = await prisma.$transaction(async (tx) => {
      const newCtq = await tx.cTQRequirement.create({
        data: {
          vocStatementId: vocId || null, // Optional link to VOC
          assignmentId,
          ctqDescription: requirement,
          measurementCriteria: measurementCriteria || 'Not specified',
          targetValue
        }
      })

      // Log the action
      await tx.auditLog.create({
        data: {
          userId: user.id,
          assignmentId,
          action: 'CREATED',
          entityType: 'CTQRequirement',
          entityId: newCtq.id,
          changeDetails: {
            requirement,
            measurementCriteria,
            targetValue,
            vocId
          }
        }
      })

      return newCtq
    })

    return NextResponse.json(ctq)
  } catch (error) {
    console.error('Failed to create CTQ requirement:', error)
    return NextResponse.json(
      { error: 'Failed to create CTQ requirement' },
      { status: 500 }
    )
  }
}