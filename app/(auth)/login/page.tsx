'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2 } from 'lucide-react'
import { Orbitron } from 'next/font/google'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
})

function LoginContent() {
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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'same-origin',
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
    <div className="min-h-screen flex items-center justify-center bg-white p-4 sm:p-6">
      <Card className="w-full max-w-md border-2 border-black">
        <CardHeader className="space-y-3 sm:space-y-4 text-center px-4 sm:px-6">
          <Link
            href="/"
            className="inline-block hover:opacity-80 transition-opacity"
          >
            <CardTitle className={`text-3xl sm:text-4xl text-red-700 ${orbitron.className}`}>
              Lean Projax
            </CardTitle>
          </Link>
          <div className="h-px bg-black" />
          <CardDescription className="text-sm sm:text-base text-gray-600">
            Six Sigma Workflow Automation
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {showSignupSuccess && (
            <Alert className="mb-4 border-blue-600 bg-blue-50">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                <strong>Account created successfully!</strong>
                <br />
                {searchParams.get('verify') === 'pending' ? (
                  <>
                    Please check your email inbox for a verification link. You must verify your
                    email before you can sign in.
                  </>
                ) : searchParams.get('verified') === 'true' ? (
                  <>Your email is verified! You can now sign in.</>
                ) : (
                  <>Please sign in to continue.</>
                )}
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="analyst@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="border-gray-300 focus:border-black h-11"
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
                onChange={e => setPassword(e.target.value)}
                required
                className="border-gray-300 focus:border-black h-11"
              />
            </div>

            {error && (
              <div className="text-sm text-black font-medium border border-black p-3 bg-gray-50 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white hover:bg-gray-800 h-11 text-base"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="text-center text-sm text-gray-600 pt-2 sm:pt-4">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-black font-medium hover:underline">
                Sign up for free
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
          <Card className="w-full max-w-md border-2 border-black">
            <CardHeader className="space-y-3 sm:space-y-4 px-4 sm:px-6 text-center">
              <Link
                href="/"
                className="inline-block hover:opacity-80 transition-opacity"
              >
                <CardTitle className={`text-3xl sm:text-4xl font-bold ${orbitron.className}`}>
                  <span className="text-red-700">Lean Projax</span>
                </CardTitle>
              </Link>
              <CardDescription className="text-gray-600 text-sm sm:text-base">
                Loading...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
