'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SummaryTabsProps {
  defaultValue: string
  processes: Array<{
    id: string
    processName: string
  }>
  children: React.ReactNode
}

export function SummaryTabs({ defaultValue, processes, children }: SummaryTabsProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(defaultValue)

  const tabs = [
    { value: 'overview', label: 'Overall Summary' },
    ...processes.map(p => ({ value: p.id, label: p.processName })),
  ]

  const currentTabLabel = tabs.find(t => t.value === activeTab)?.label || 'Overview'

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setIsSheetOpen(false)
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      {/* Mobile burger menu */}
      <div className="md:hidden mb-4">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-between border-2 border-black">
              <span className="font-medium">{currentTabLabel}</span>
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[320px]">
            <SheetHeader>
              <SheetTitle>Summary Sections</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => handleTabChange(tab.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.value
                      ? 'bg-black text-white font-medium'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{tab.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop tabs */}
      <div className="hidden md:block">
        <TabsList className="w-full justify-start bg-white border-2 border-black h-auto flex-wrap">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-black data-[state=active]:text-white"
          >
            Overall Summary
          </TabsTrigger>
          {processes.map(process => (
            <TabsTrigger
              key={process.id}
              value={process.id}
              className="data-[state=active]:bg-black data-[state=active]:text-white"
            >
              {process.processName}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {children}
    </Tabs>
  )
}
