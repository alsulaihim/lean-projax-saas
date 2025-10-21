'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSignupSuccess, setShowSignupSuccess] = useState(false)

  useEffect(() => {
    // Show success message if redirected from signup
    if (searchParams.get('signup') === 'success') {
      setShowSignupSuccess(true)
      setTimeout(() => setShowSignupSuccess(false), 8000)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid email or password')
      } else {
        // First refresh to update the cookie state
        router.refresh()
        // Then navigate to assignments
        window.location.href = '/assignments'
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Card className="w-full max-w-md border-2 border-black">
        <CardHeader className="space-y-4 text-center">
          <CardTitle className="text-3xl font-bold">Lean Projax</CardTitle>
          <div className="h-px bg-black" />
          <CardDescription className="text-base text-gray-600">
            Six Sigma Workflow Automation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showSignupSuccess && (
            <Alert className="mb-4 border-green-600 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Account created successfully! Please sign in to continue.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="analyst@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-300 focus:border-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gray-300 focus:border-black"
              />
            </div>

            {error && (
              <div className="text-sm text-black font-medium border border-black p-3 bg-gray-50">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white hover:bg-gray-800"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="text-center text-sm text-gray-600 pt-4">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-black font-medium hover:underline">
                Sign up for free
              </Link>
            </div>

            <div className="text-xs text-center text-gray-500 pt-2 border-t pt-4">
              <p>Test credentials:</p>
              <p className="font-mono mt-1">analyst@example.com / password123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}