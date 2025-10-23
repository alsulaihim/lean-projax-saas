import { z } from 'zod'

/**
 * Authentication Validation Schemas
 * 
 * Purpose: Type-safe validation for auth endpoints using Zod
 * 
 * Benefits:
 * - Single source of truth for validation rules
 * - Automatic TypeScript type inference
 * - Consistent error messages
 * - Reusable across client and server
 * - Less code, fewer bugs
 */

/**
 * Password validation schema
 * 
 * Requirements:
 * - Minimum 10 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special character
 * 
 * Security: Enforces strong passwords to prevent brute force attacks
 */
const passwordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    'Password must contain at least one special character'
  )

/**
 * Signup Request Schema
 * 
 * Validates user registration data
 * 
 * Fields:
 * - email: Valid email format, converted to lowercase
 * - name: 2-100 characters, trimmed
 * - password: Strong password (see passwordSchema)
 * - companyName: Optional, max 200 characters
 */
export const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  
  password: passwordSchema,
  
  companyName: z
    .string()
    .max(200, 'Company name must not exceed 200 characters')
    .trim()
    .optional()
    .nullable()
})

/**
 * Login Request Schema
 * 
 * Validates user login data
 * 
 * Fields:
 * - email: Valid email format
 * - password: Any string (will be checked against hash)
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .trim(),
  
  password: z
    .string()
    .min(1, 'Password is required')
})

/**
 * Email Verification Schema
 * 
 * Validates email verification token
 */
export const verifyEmailSchema = z.object({
  token: z
    .string()
    .min(1, 'Verification token is required')
    .length(64, 'Invalid verification token format') // 32 bytes = 64 hex characters
})

/**
 * Type exports for TypeScript
 * 
 * Usage:
 * const data: SignupInput = { email: '...', name: '...', ... }
 */
export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>

/**
 * Helper function to format Zod errors for API responses
 *
 * Converts Zod validation errors to user-friendly format
 *
 * @param error - Zod error object
 * @returns Object with field names and error messages
 */
export function formatZodError(error: z.ZodError) {
  if (!error?.errors || !Array.isArray(error.errors) || error.errors.length === 0) {
    // Return generic error without logging in production
    return { _error: ['Validation failed'] }
  }

  const formatted: Record<string, string[]> = {}

  error.errors.forEach((err) => {
    const field = err.path.join('.') || '_error'
    if (!formatted[field]) {
      formatted[field] = []
    }
    formatted[field].push(err.message)
  })

  return formatted
}

