/**
 * API Error Handler Utility
 * Sanitizes errors to prevent information leakage in production
 */

export interface ApiError {
  message: string
  statusCode: number
}

/**
 * Sanitizes error messages to prevent leaking sensitive information
 * In development: returns full error details
 * In production: returns generic messages
 */
export function sanitizeError(error: unknown): ApiError {
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Log the full error server-side for debugging
  if (isDevelopment) {
    console.error('[API Error]', error)
  } else {
    // In production, log minimal info without sensitive details
    console.error('[API Error]', error instanceof Error ? error.message : 'Unknown error')
  }

  // Default error response
  const defaultError: ApiError = {
    message: 'An unexpected error occurred',
    statusCode: 500,
  }

  // Handle known error types
  if (error instanceof Error) {
    // Prisma errors
    if (error.constructor.name.includes('Prisma')) {
      return {
        message: isDevelopment ? error.message : 'Database operation failed',
        statusCode: 500,
      }
    }

    // Validation errors (safe to expose)
    if (error.message.includes('required') || error.message.includes('invalid')) {
      return {
        message: error.message,
        statusCode: 400,
      }
    }

    // In development, show full error
    if (isDevelopment) {
      return {
        message: error.message,
        statusCode: 500,
      }
    }
  }

  return defaultError
}

/**
 * Sanitizes console logs to remove PII
 * Use this instead of console.log for user data
 */
export function sanitizeLog(data: any, label?: string): void {
  if (process.env.NODE_ENV === 'development') {
    // In development, show full data but mark as potentially sensitive
    console.log(`[SANITIZED${label ? ` - ${label}` : ''}]`, sanitizeObject(data))
  } else {
    // In production, only log non-sensitive metadata
    console.log(`[SANITIZED${label ? ` - ${label}` : ''}]`, {
      timestamp: new Date().toISOString(),
      type: typeof data,
      hasData: !!data,
    })
  }
}

/**
 * Removes PII from objects before logging
 */
function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj

  const sensitiveFields = ['password', 'email', 'phone', 'ssn', 'token', 'apiKey', 'secret']
  const sanitized: any = Array.isArray(obj) ? [] : {}

  for (const key in obj) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof obj[key] === 'object') {
      sanitized[key] = sanitizeObject(obj[key])
    } else {
      sanitized[key] = obj[key]
    }
  }

  return sanitized
}
