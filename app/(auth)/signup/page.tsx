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
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)

  // Real-time password validation for UX feedback
  const passwordChecks = {
    minLength: formData.password.length >= 10,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
    passwordsMatch: formData.password.length > 0 && formData.password === formData.confirmPassword
  }

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
                onFocus={() => setShowPasswordRequirements(true)}
                disabled={isLoading}
                className="border-black"
                required
              />
              
              {/* Real-time Password Strength Indicator */}
              {showPasswordRequirements && formData.password.length > 0 && (
                <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                  
                  <div className="space-y-1.5">
                    {/* Minimum Length */}
                    <div className={`flex items-center gap-2 text-sm transition-colors ${
                      passwordChecks.minLength ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {passwordChecks.minLength ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <XIcon className="h-4 w-4 text-gray-400" />
                      )}
                      <span>At least 10 characters</span>
                    </div>

                    {/* Uppercase */}
                    <div className={`flex items-center gap-2 text-sm transition-colors ${
                      passwordChecks.hasUppercase ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {passwordChecks.hasUppercase ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                      <span>Contains uppercase letter (A-Z)</span>
                    </div>

                    {/* Lowercase */}
                    <div className={`flex items-center gap-2 text-sm transition-colors ${
                      passwordChecks.hasLowercase ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {passwordChecks.hasLowercase ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                      <span>Contains lowercase letter (a-z)</span>
                    </div>

                    {/* Number */}
                    <div className={`flex items-center gap-2 text-sm transition-colors ${
                      passwordChecks.hasNumber ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {passwordChecks.hasNumber ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                      <span>Contains number (0-9)</span>
                    </div>

                    {/* Special Character */}
                    <div className={`flex items-center gap-2 text-sm transition-colors ${
                      passwordChecks.hasSpecial ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {passwordChecks.hasSpecial ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                      <span>Contains special character (!@#$%^&* etc.)</span>
                    </div>
                  </div>

                  {/* Overall Strength Indicator */}
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    {Object.values(passwordChecks).filter(Boolean).length === 6 ? (
                      <div className="flex items-center gap-2 text-green-700 font-medium">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>Strong password! ✓</span>
                      </div>
                    ) : (
                      <div className="text-gray-600 text-sm">
                        {Object.values(passwordChecks).filter(Boolean).length} of 5 requirements met
                      </div>
                    )}
                  </div>
                </div>
              )}
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
              
              {/* Password Match Indicator */}
              {formData.confirmPassword.length > 0 && (
                <div className={`flex items-center gap-2 text-sm mt-2 ${
                  passwordChecks.passwordsMatch ? 'text-green-700' : 'text-red-600'
                }`}>
                  {passwordChecks.passwordsMatch ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Passwords match ✓</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      <span>Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
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

