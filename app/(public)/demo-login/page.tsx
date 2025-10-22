'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, Play, Shield } from 'lucide-react'
import { Orbitron } from 'next/font/google'
import Link from 'next/link'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
})

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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-5xl px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Demo info */}
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-4">
                <Play className="h-4 w-4" />
                Interactive Demo
              </div>
              <h1 className={`text-5xl mb-4 text-gray-900 ${orbitron.className}`}>
                Lean Projax
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Experience Six Sigma Workflow Automation
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Explore Full Features</h3>
                  <p className="text-sm text-gray-600">
                    Test all DMAIC tools including VOC analysis, process mapping, and statistical controls
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Safe Sandbox Environment</h3>
                  <p className="text-sm text-gray-600">
                    Pre-populated with sample data. Changes won't affect real projects
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Play className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">No Setup Required</h3>
                  <p className="text-sm text-gray-600">
                    Jump right in and start exploring without any installation
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <p className="text-sm text-gray-500">
                Ready for the full experience?{' '}
                <Link href="/signup" className="text-blue-600 font-medium hover:text-blue-700 hover:underline">
                  Create a free account
                </Link>
              </p>
            </div>
          </div>

          {/* Right side - Login form */}
          <Card className="w-full border-2 border-gray-200 shadow-lg">
            <CardHeader className="space-y-4 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-b-2 border-gray-200">
              <CardTitle className="text-2xl font-bold text-gray-900">Demo Access</CardTitle>
              <CardDescription className="text-base text-gray-600">
                Sign in to explore the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
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
              <div className="text-sm text-red-700 font-medium border border-red-200 p-3 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 h-11"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Access Demo'
              )}
            </Button>

            <div className="text-center pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">Demo credentials:</span>
                  <p className="font-mono mt-1 text-gray-600">demo@leanprojax.com / demo123</p>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  )
}
