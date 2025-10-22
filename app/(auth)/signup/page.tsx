'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'

/**
 * Signup Page Component
 * 
 * Purpose: Allow new users to create an account for the Lean Projax platform
 * 
 * Flow:
 * 1. User fills out signup form (email, name, password, company)
 * 2. Form validates input client-side
 * 3. Submits to /api/signup endpoint
 * 4. On success, redirects to login page with success message
 * 
 * Default Settings:
 * - New users get FREE tier subscription
 * - TRIAL status with 14-day trial period
 * - BPI_TEAM role by default
 */
export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    companyName: ''
  })

  /**
   * Handle input field changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('') // Clear error when user types
  }

  /**
   * Validate form data before submission
   * 
   * Checks:
   * - All required fields filled
   * - Valid email format
   * - Password minimum 8 characters
   * - Passwords match
   */
  const validateForm = (): string | null => {
    if (!formData.email || !formData.name || !formData.password || !formData.confirmPassword) {
      return 'Please fill in all required fields'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Please enter a valid email address'
    }

    // Enhanced password validation
    if (formData.password.length < 10) {
      return 'Password must be at least 10 characters long'
    }

    if (!/[A-Z]/.test(formData.password)) {
      return 'Password must contain at least one uppercase letter'
    }

    if (!/[a-z]/.test(formData.password)) {
      return 'Password must contain at least one lowercase letter'
    }

    if (!/[0-9]/.test(formData.password)) {
      return 'Password must contain at least one number'
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
      return 'Password must contain at least one special character'
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match'
    }

    return null
  }

  /**
   * Handle form submission
   * 
   * Process:
   * 1. Validate form data
   * 2. Send POST request to /api/signup
   * 3. Handle success (redirect to login) or error
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          companyName: formData.companyName || null
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Success - redirect to login with message about email verification
        router.push('/login?signup=success&verify=pending')
      } else {
        // Server error
        setError(data.error || 'Failed to create account. Please try again.')
      }
    } catch (error) {
      console.error('Signup error:', error)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-black">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Create an account</CardTitle>
          <CardDescription className="text-gray-600">
            Start your 14-day free trial. No credit card required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-red-600">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className="border-black"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                className="border-black"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name (Optional)</Label>
              <Input
                id="companyName"
                name="companyName"
                type="text"
                placeholder="Acme Corp"
                value={formData.companyName}
                onChange={handleChange}
                disabled={isLoading}
                className="border-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className="border-black"
                required
              />
              <div className="text-xs text-gray-600 mt-2 space-y-1">
                <p className="font-medium">Password requirements:</p>
                <ul className="list-disc list-inside space-y-0.5 text-gray-500">
                  <li>At least 10 characters</li>
                  <li>One uppercase & one lowercase letter</li>
                  <li>One number & one special character</li>
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                className="border-black"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-800"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-black font-medium hover:underline">
                Sign in
              </Link>
            </div>

            <p className="text-xs text-center text-gray-500 mt-4">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

