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
    <Card className="border-2 border-black w-full max-w-full">
      <CardHeader>
        <CardTitle>AI Analysis</CardTitle>
        <CardDescription>
          Get AI-powered insights and analysis of your Six Sigma assignment
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
            <TabsTrigger value="chat">Chat with AI</TabsTrigger>
          </TabsList>

          <TabsContent value="assessment" className="mt-6 w-full max-w-full">
            <AIAssessment assignment={assignment} />
          </TabsContent>

          <TabsContent value="chat" className="mt-6 w-full max-w-full">
            <div className="h-[600px]">
              <AIChat assignmentId={assignment.id} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
