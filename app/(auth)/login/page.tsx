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
      
      // Extended timeout if verification pending
      const timeout = searchParams.get('verify') === 'pending' ? 15000 : 8000
      setTimeout(() => setShowSignupSuccess(false), timeout)
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
        body: JSON.stringify({ email, password }),
        credentials: 'same-origin'
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid email or password')
      } else {
        // Wait briefly for cookie to be set, then redirect
        await new Promise(resolve => setTimeout(resolve, 100))
        window.location.href = '/assignments'
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Hero Section - Left Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-gray-50 to-gray-100 p-12 flex-col justify-between overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-40">
          <img
            src="/images/hero-meeting.png"
            alt="Six Sigma Analytics"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Lean Projax</h1>
            <div className="h-1 w-24 bg-black mb-6" />
            <p className="text-2xl text-gray-700 font-light">
              Six Sigma Workflow Automation
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Data-Driven Decision Making</h3>
              <p className="text-gray-600">Transform complex processes with real-time analytics and actionable insights</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Streamlined Workflows</h3>
              <p className="text-gray-600">Automate DMAIC processes and eliminate inefficiencies across your organization</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Collaborative Teams</h3>
              <p className="text-gray-600">Empower cross-functional teams with role-based access and audit trails</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form - Right Side */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <Card className="w-full max-w-md border-2 border-black">
          <CardHeader className="space-y-4 text-center">
            <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
            <div className="h-px bg-black" />
            <CardDescription className="text-base text-gray-600">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
          {showSignupSuccess && (
            <Alert className="mb-4 border-blue-600 bg-blue-50">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Account created successfully!</strong>
                <br />
                {searchParams.get('verify') === 'pending' ? (
                  <>Please check your email inbox for a verification link. You must verify your email before you can sign in.</>
                ) : searchParams.get('verified') === 'true' ? (
                  <>Your email is verified! You can now sign in.</>
                ) : (
                  <>Please sign in to continue.</>
                )}
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
    </div>
  )
}