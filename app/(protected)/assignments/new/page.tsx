'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'

export default function NewAssignmentPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState({
    title: '',
    objective: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (response.ok) {
        const assignment = await response.json()
        router.push(`/assignments/${assignment.id}`)
      }
    } catch (error) {
      console.error('Failed to create assignment:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/assignments')}
          className="hover:bg-gray-100 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assignments
        </Button>
      </div>

      <Card className="border-2 border-black">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Assignment</CardTitle>
          <CardDescription>Start a new Six Sigma improvement assignment</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Assignment Title</Label>
              <Input
                id="title"
                placeholder="e.g., Order Processing Optimization"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
                className="border-gray-300 focus:border-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objective">Objective</Label>
              <Textarea
                id="objective"
                placeholder="Describe the main objective and expected outcomes..."
                value={form.objective}
                onChange={e => setForm({ ...form, objective: e.target.value })}
                required
                className="border-gray-300 focus:border-black min-h-[120px]"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/assignments')}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || !form.title || !form.objective}
                className="bg-black text-white hover:bg-gray-800"
              >
                {isCreating ? 'Creating...' : 'Create Assignment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
