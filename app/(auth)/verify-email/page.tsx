'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Email Verification Content Component
 * Handles the actual verification logic with search params
 */
function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  const verifyEmail = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('Email verified successfully! You can now sign in.')
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?verified=true')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Verification failed. The link may be invalid or expired.')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }, [router])

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. Token is missing.')
      return
    }

    // Verify the token
    verifyEmail(token)
  }, [searchParams, verifyEmail])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-black">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Email Verification</CardTitle>
          <CardDescription className="text-gray-600">
            Verifying your email address...
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
              <p className="text-gray-600">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <Alert className="border-green-600 bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <Alert variant="destructive" className="border-red-600">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>

              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Need a new verification link?
                </p>
                <Link href="/signup">
                  <Button variant="outline" className="border-black">
                    Sign Up Again
                  </Button>
                </Link>
                <p className="text-sm">
                  or{' '}
                  <Link href="/login" className="text-black font-medium hover:underline">
                    Back to Login
                  </Link>
                </p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600 mb-3">
                Redirecting to login page...
              </p>
              <Link href="/login">
                <Button className="bg-black text-white hover:bg-gray-800">
                  Go to Login Now
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Email Verification Page
 *
 * Purpose: Verify user's email address via token from verification email
 *
 * Flow:
 * 1. User clicks link in verification email
 * 2. Page loads with token in URL query
 * 3. Automatically verifies token with API
 * 4. Shows success or error message
 * 5. Redirects to login on success
 */
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-black">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">Email Verification</CardTitle>
            <CardDescription className="text-gray-600">
              Loading verification...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
              <p className="text-gray-600">Please wait...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}

