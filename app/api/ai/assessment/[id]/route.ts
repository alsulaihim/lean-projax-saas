import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth-check'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get assignment with all relations
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        processes: {
          include: {
            sipocEntries: true,
            vsmSteps: {
              orderBy: { stepNumber: 'asc' },
            },
            fishboneCategories: {
              include: {
                causes: true,
              },
            },
            fmeaEntries: true,
          },
          orderBy: { order: 'asc' },
        },
        vocStatements: {
          include: {
            ctqRequirements: true,
          },
        },
        recommendations: true,
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Check if assignment is completed
    if (assignment.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'AI Analysis is only available for completed assignments' },
        { status: 400 }
      )
    }

    // Check for OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    })

    // Prepare assignment data for analysis
    const assignmentData = {
      title: assignment.title,
      objective: assignment.objective,
      vocCount: assignment.vocStatements.length,
      ctqCount: assignment.vocStatements.reduce((acc, voc) => acc + voc.ctqRequirements.length, 0),
      processCount: assignment.processes.length,
      totalSIPOCEntries: assignment.processes.reduce((acc, p) => acc + p.sipocEntries.length, 0),
      totalVSMSteps: assignment.processes.reduce((acc, p) => acc + p.vsmSteps.length, 0),
      totalFMEAEntries: assignment.processes.reduce((acc, p) => acc + p.fmeaEntries.length, 0),
      recommendationCount: assignment.recommendations.length,
      processes: assignment.processes.map(p => ({
        name: p.processName,
        sipocEntries: p.sipocEntries.length,
        vsmSteps: p.vsmSteps.length,
        vsmData: {
          totalTime: p.vsmSteps.reduce(
            (acc, s) => acc + (s.processTime || 0) + (s.waitingTime || 0),
            0
          ),
          valueAddedTime: p.vsmSteps
            .filter(s => s.valueAdded)
            .reduce((acc, s) => acc + (s.processTime || 0), 0),
          nonValueAddedTime: p.vsmSteps
            .filter(s => !s.valueAdded)
            .reduce((acc, s) => acc + (s.processTime || 0) + (s.waitingTime || 0), 0),
        },
        fmeaEntries: p.fmeaEntries.length,
        highRiskFMEAs: p.fmeaEntries.filter(f => f.rpn && f.rpn >= 100).length,
        processCapability:
          p.sampleMean && p.sampleStdDev
            ? {
                mean: p.sampleMean,
                stdDev: p.sampleStdDev,
                lsl: p.lowerSpecLimit,
                usl: p.upperSpecLimit,
              }
            : null,
      })),
      highPriorityRecommendations: assignment.recommendations.filter(
        r => r.implementationDifficulty === 'LOW'
      ).length,
    }

    // Create AI prompt
    const prompt = `You are a Six Sigma expert analyzing a Business Process Improvement assignment. Provide a comprehensive assessment with deep insights.

Assignment Title: ${assignmentData.title}
Objective: ${assignmentData.objective}

Data Summary:
- VOC Statements: ${assignmentData.vocCount}
- CTQ Requirements: ${assignmentData.ctqCount}
- Processes Analyzed: ${assignmentData.processCount}
- SIPOC Entries: ${assignmentData.totalSIPOCEntries}
- VSM Steps: ${assignmentData.totalVSMSteps}
- FMEA Entries: ${assignmentData.totalFMEAEntries}
- Recommendations: ${assignmentData.recommendationCount}
- High Priority Recommendations: ${assignmentData.highPriorityRecommendations}

Process Details:
${assignmentData.processes
  .map(
    p => `
Process: ${p.name}
- SIPOC Entries: ${p.sipocEntries}
- VSM Steps: ${p.vsmSteps}
- Value-Added Time: ${p.vsmData.valueAddedTime} mins
- Non-Value-Added Time: ${p.vsmData.nonValueAddedTime} mins
- Cycle Time Efficiency: ${p.vsmData.totalTime > 0 ? Math.round((p.vsmData.valueAddedTime / p.vsmData.totalTime) * 100) : 0}%
- FMEA Entries: ${p.fmeaEntries}
- High Risk FMEAs (RPN >= 100): ${p.highRiskFMEAs}
${p.processCapability ? `- Process Capability: Mean=${p.processCapability.mean}, StdDev=${p.processCapability.stdDev}` : ''}
`
  )
  .join('\n')}

Please provide:
1. A comprehensive overview (2-3 sentences)
2. 5-7 key insights about the assignment
3. 6-8 deep insights with titles and descriptions, categorized as:
   - "voc" for customer voice insights
   - "process" for process efficiency insights
   - "quality" for quality and FMEA insights
   - "recommendation" for improvement opportunities
4. Metrics:
   - Process Efficiency (0-100%)
   - Quality Score (0-100%)
   - Risk Level (Low/Medium/High)

Return ONLY a valid JSON object with this exact structure:
{
  "overview": "string",
  "keyInsights": ["string"],
  "deepInsights": [
    {
      "title": "string",
      "description": "string",
      "category": "voc" | "process" | "quality" | "recommendation"
    }
  ],
  "metrics": {
    "processEfficiency": number,
    "qualityScore": number,
    "riskLevel": "Low" | "Medium" | "High"
  }
}`

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are a Six Sigma expert providing detailed analysis of business process improvement assignments. Always return valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const result = completion.choices[0].message.content
    if (!result) {
      throw new Error('No response from OpenAI')
    }

    const assessment = JSON.parse(result)

    return NextResponse.json(assessment)
  } catch (error) {
    console.error('AI Assessment Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate assessment' },
      { status: 500 }
    )
  }
}
