'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DemoLoginPage() {
  const [email, setEmail] = useState('demo@leanprojax.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/demo/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'same-origin'
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid email or password')
      } else {
        // Wait briefly for cookie to be set, then redirect
        await new Promise(resolve => setTimeout(resolve, 100))
        window.location.href = '/demo/assignments'
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md border-2 border-blue-600 shadow-xl">
        <CardHeader className="space-y-4 text-center bg-blue-600 text-white">
          <CardTitle className="text-3xl font-bold">Lean Projax Demo</CardTitle>
          <div className="h-px bg-white/30" />
          <CardDescription className="text-base text-blue-100">
            Experience Six Sigma Workflow Automation
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-medium mb-2">
              Demo Access
            </p>
            <p className="text-xs text-blue-700">
              This is a demonstration environment with pre-populated sample data.
              Editing and deletion features are disabled in demo mode.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-600"
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter demo password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-600"
              />
            </div>

            {error && (
              <div className="text-sm text-red-700 font-medium border border-red-300 p-3 bg-red-50 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              {isLoading ? 'Signing in...' : 'Access Demo'}
            </Button>

            <div className="text-xs text-center text-gray-500 pt-2 border-t pt-4">
              <p>Demo credentials:</p>
              <p className="font-mono mt-1">demo@leanprojax.com / demo123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
