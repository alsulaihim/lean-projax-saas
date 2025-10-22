'use client'

import React, { useState } from 'react'
import { ChevronRight } from 'lucide-react'

interface FishboneCategory {
  id: string
  category: string
  order: number
  causes: {
    id: string
    causeDescription: string
    order: number
  }[]
}

interface FishboneAnalysisViewerProps {
  categories: FishboneCategory[]
  paretoSteps: {
    name: string
    value: number
    cumulativePercentage?: number
    isVitalFew: boolean
  }[]
  totalCycleTime: number
}

export function FishboneAnalysisViewer({
  categories,
  paretoSteps,
  totalCycleTime
}: FishboneAnalysisViewerProps) {
  const categoriesPerStep = 6
  const totalCategories = categories.length
  const numberOfFishbones = Math.ceil(totalCategories / categoriesPerStep)

  const [activeFishbone, setActiveFishbone] = useState(0)

  if (totalCategories === 0) {
    return <p className="text-center text-gray-500 py-8">No fishbone analysis data available</p>
  }

  const fishbones = []
  const stepNames = []

  for (let i = 0; i < numberOfFishbones; i++) {
    const startIdx = i * categoriesPerStep
    const endIdx = Math.min(startIdx + categoriesPerStep, totalCategories)
    const categoriesForThisStep = categories.slice(startIdx, endIdx)

    // Try to match with the vital step
    const vitalStep = paretoSteps[i]
    const stepName = vitalStep ? vitalStep.name : `Step ${i + 1}`
    stepNames.push(stepName)

    const stepInfo = vitalStep ?
      `Cycle Time: ${vitalStep.value} min | Contribution: ${((vitalStep.value / totalCycleTime) * 100).toFixed(1)}% | Cumulative: ${vitalStep.cumulativePercentage?.toFixed(1) || 'N/A'}%` : ''

    fishbones.push(
      <div key={`fishbone-${i}`} className={i === activeFishbone ? 'block' : 'hidden'}>
        <div className="mb-3 md:mb-4 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-bold text-base md:text-xl text-gray-800 mb-1">
            {stepName}
          </h4>
          <p className="text-xs md:text-sm text-gray-600">{stepInfo}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-3 md:mb-4">
          {categoriesForThisStep.slice(0, 3).map(category => {
            const categoryDisplayName = category.category === 'PEOPLE' ? 'Manpower (People)' :
                                        category.category === 'PROCESS' ? 'Method (Process)' :
                                        category.category === 'EQUIPMENT' ? 'Machine (Equipment)' :
                                        category.category

            return (
              <div key={category.id} className="border border-gray-300 rounded-lg p-3 md:p-4 bg-white shadow-sm">
                <h5 className="font-bold mb-2 md:mb-3 text-xs md:text-sm text-gray-800 uppercase tracking-wider">
                  {categoryDisplayName}
                </h5>
                <ul className="space-y-1.5 md:space-y-2">
                  {category.causes.map(cause => (
                    <li key={cause.id} className="text-xs md:text-sm flex items-start">
                      <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-blue-500 mt-0.5 mr-1.5 md:mr-2 flex-shrink-0" />
                      <span className="text-gray-700 leading-relaxed">{cause.causeDescription}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {categoriesForThisStep.slice(3, 6).map(category => {
            const categoryDisplayName = category.category === 'MATERIALS' ? 'Materials' :
                                        category.category === 'ENVIRONMENT' ? 'Environment' :
                                        category.category === 'MANAGEMENT' ? 'Management' :
                                        category.category

            return (
              <div key={category.id} className="border border-gray-300 rounded-lg p-3 md:p-4 bg-white shadow-sm">
                <h5 className="font-bold mb-2 md:mb-3 text-xs md:text-sm text-gray-800 uppercase tracking-wider">
                  {categoryDisplayName}
                </h5>
                <ul className="space-y-1.5 md:space-y-2">
                  {category.causes.map(cause => (
                    <li key={cause.id} className="text-xs md:text-sm flex items-start">
                      <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-blue-500 mt-0.5 mr-1.5 md:mr-2 flex-shrink-0" />
                      <span className="text-gray-700 leading-relaxed">{cause.causeDescription}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3 md:mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs md:text-sm text-blue-800">
            <strong>{numberOfFishbones}</strong> fishbone diagram(s) for vital few steps
          </p>
          <div className="flex gap-2 flex-wrap justify-start md:justify-end">
            {stepNames.map((name, idx) => (
              <button
                key={idx}
                onClick={() => setActiveFishbone(idx)}
                className={`px-2 md:px-3 py-1 text-xs rounded-lg transition-colors ${
                  idx === activeFishbone
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {name.length > 15 ? `${name.substring(0, 15)}...` : name}
              </button>
            ))}
          </div>
        </div>

        {numberOfFishbones > 1 && (
          <div className="flex justify-center gap-2 mb-3 md:mb-4">
            <button
              onClick={() => setActiveFishbone(Math.max(0, activeFishbone - 1))}
              disabled={activeFishbone === 0}
              className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm bg-gray-100 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition-colors"
            >
              ← Previous
            </button>
            <span className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm">
              {activeFishbone + 1} of {numberOfFishbones}
            </span>
            <button
              onClick={() => setActiveFishbone(Math.min(numberOfFishbones - 1, activeFishbone + 1))}
              disabled={activeFishbone === numberOfFishbones - 1}
              className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm bg-gray-100 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {fishbones}
    </div>
  )
}