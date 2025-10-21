import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth-check'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { message, history } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Get assignment with all relations
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        processes: {
          include: {
            sipocEntries: true,
            vsmSteps: {
              orderBy: { stepNumber: 'asc' }
            },
            fishboneCategories: {
              include: {
                causes: true
              }
            },
            fmeaEntries: true
          },
          orderBy: { order: 'asc' }
        },
        vocStatements: {
          include: {
            ctqRequirements: true
          }
        },
        recommendations: true
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Check if assignment is completed
    if (assignment.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'AI Chat is only available for completed assignments' },
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
      apiKey: openaiApiKey
    })

    // Prepare context about the assignment
    const assignmentContext = `You are an AI assistant helping with a Six Sigma Business Process Improvement assignment.

Assignment Details:
- Title: ${assignment.title}
- Objective: ${assignment.objective}
- Status: ${assignment.status}

Data Available:
- VOC Statements: ${assignment.vocStatements.length}
- CTQ Requirements: ${assignment.vocStatements.reduce((acc, voc) => acc + voc.ctqRequirements.length, 0)}
- Processes: ${assignment.processes.length}
${assignment.processes.map(p => `  * ${p.processName}: ${p.sipocEntries.length} SIPOC entries, ${p.vsmSteps.length} VSM steps, ${p.fmeaEntries.length} FMEA entries`).join('\n')}
- Recommendations: ${assignment.recommendations.length}

Process Metrics:
${assignment.processes.map(p => {
  const totalTime = p.vsmSteps.reduce((acc, s) => acc + (s.processTime || 0) + (s.waitingTime || 0), 0)
  const valueAddedTime = p.vsmSteps.filter(s => s.valueAdded).reduce((acc, s) => acc + (s.processTime || 0), 0)
  const efficiency = totalTime > 0 ? Math.round((valueAddedTime / totalTime) * 100) : 0
  return `  * ${p.processName}: ${efficiency}% efficiency, ${p.fmeaEntries.filter(f => f.rpn && f.rpn >= 100).length} high-risk issues`
}).join('\n')}

You can answer questions about:
- Customer requirements (VOC/CTQ)
- Process efficiency and bottlenecks
- Quality issues and risks (FMEA)
- Root cause analysis (Fishbone)
- Recommendations and improvements
- Process capability and performance

Be specific, reference the actual data, and provide actionable insights.`

    // Build conversation messages
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: assignmentContext
      }
    ]

    // Add conversation history (limit to last 10 messages to manage token usage)
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-10)
      recentHistory.forEach((msg: Message) => {
        messages.push({
          role: msg.role,
          content: msg.content
        })
      })
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: message
    })

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 1000
    })

    const responseMessage = completion.choices[0].message.content

    if (!responseMessage) {
      throw new Error('No response from OpenAI')
    }

    return NextResponse.json({ message: responseMessage })
  } catch (error) {
    console.error('AI Chat Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
