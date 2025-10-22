'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, AlertCircle, TrendingUp, Target, Lightbulb } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
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

interface AIAssessmentProps {
  assignment: AssignmentWithRelations
}

interface AssessmentData {
  overview: string
  keyInsights: string[]
  deepInsights: {
    title: string
    description: string
    category: 'voc' | 'process' | 'quality' | 'recommendation'
  }[]
  metrics: {
    processEfficiency: number
    qualityScore: number
    riskLevel: string
  }
}

export function AIAssessment({ assignment }: AIAssessmentProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assessment, setAssessment] = useState<AssessmentData | null>(null)

  const generateAssessment = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/ai/assessment/${assignment.id}`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate assessment')
      }

      const data = await response.json()
      setAssessment(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'voc':
        return <Target className="h-5 w-5" />
      case 'process':
        return <TrendingUp className="h-5 w-5" />
      case 'quality':
        return <Sparkles className="h-5 w-5" />
      case 'recommendation':
        return <Lightbulb className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'voc':
        return 'border-blue-500 bg-blue-50'
      case 'process':
        return 'border-green-500 bg-green-50'
      case 'quality':
        return 'border-purple-500 bg-purple-50'
      case 'recommendation':
        return 'border-orange-500 bg-orange-50'
      default:
        return 'border-gray-500 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {!assessment && (
        <div className="flex flex-col items-center justify-center py-12">
          <Sparkles className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">AI-Powered Assessment</h3>
          <p className="text-sm text-gray-600 mb-6 text-center max-w-md">
            Generate a comprehensive AI analysis of your Six Sigma assignment with deep insights,
            key findings, and actionable recommendations.
          </p>
          <Button
            onClick={generateAssessment}
            disabled={loading}
            className="bg-black text-white hover:bg-gray-800"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Assessment
              </>
            )}
          </Button>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {assessment && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Assessment Results</h3>
            <Button
              variant="outline"
              onClick={generateAssessment}
              disabled={loading}
              className="border-2 border-black"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                'Regenerate Assessment'
              )}
            </Button>
          </div>

          {/* Overview */}
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{assessment.overview}</p>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-2 border-black">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Process Efficiency</p>
                  <p className="text-3xl font-bold">{assessment.metrics.processEfficiency}%</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-black">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Quality Score</p>
                  <p className="text-3xl font-bold">{assessment.metrics.qualityScore}%</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-black">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Risk Level</p>
                  <p className="text-3xl font-bold">{assessment.metrics.riskLevel}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Insights */}
          <Card className="border-2 border-black">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {assessment.keyInsights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 leading-relaxed">{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Deep Insights */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Deep Insights to Consider
            </h4>
            <div className="grid gap-4">
              {assessment.deepInsights.map((insight, index) => (
                <Card
                  key={index}
                  className={`border-2 ${getCategoryColor(insight.category)}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">{getCategoryIcon(insight.category)}</div>
                      <div className="flex-1">
                        <h5 className="font-semibold mb-2">{insight.title}</h5>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
