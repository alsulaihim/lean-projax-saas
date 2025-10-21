'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AIAssessment } from './ai-assessment'
import { AIChat } from './ai-chat'
import type { Prisma } from '@prisma/client'

type AssignmentWithRelations = Prisma.AssignmentGetPayload<{
  include: {
    processes: {
      include: {
        sipocEntries: true
        vsmSteps: true
        fishboneCategories: {
          include: {
            causes: true
          }
        }
        fmeaEntries: true
      }
    }
    vocStatements: {
      include: {
        ctqRequirements: true
      }
    }
    recommendations: true
  }
}>

interface AIAnalysisSectionProps {
  assignment: AssignmentWithRelations
}

export function AIAnalysisSection({ assignment }: AIAnalysisSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState('assessment')

  return (
    <Card className="border-2 border-black h-[calc(100vh-12rem)]">
      <CardHeader>
        <CardTitle>AI Analysis</CardTitle>
        <CardDescription>
          Get AI-powered insights and analysis of your Six Sigma assignment
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[calc(100%-6rem)] flex flex-col">
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
            <TabsTrigger value="chat">Chat with AI</TabsTrigger>
          </TabsList>

          <TabsContent value="assessment" className="mt-6 flex-1 overflow-y-auto">
            <AIAssessment assignment={assignment} />
          </TabsContent>

          <TabsContent value="chat" className="mt-6 flex-1">
            <AIChat assignmentId={assignment.id} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
