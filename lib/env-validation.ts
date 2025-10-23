/**
 * Environment Variable Validation
 *
 * Validates required environment variables at startup
 * Fails fast if critical configuration is missing
 */

interface EnvConfig {
  name: string
  required: boolean
  description: string
}

const requiredEnvVars: EnvConfig[] = [
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'PostgreSQL database connection string',
  },
  {
    name: 'NEXTAUTH_SECRET',
    required: true,
    description: 'Secret key for JWT token signing',
  },
  {
    name: 'NEXTAUTH_URL',
    required: true,
    description: 'Base URL of the application',
  },
  {
    name: 'NEXT_PUBLIC_MARKETING_URL',
    required: false,
    description: 'Marketing site URL (defaults to localhost:3071)',
  },
  {
    name: 'EMAIL_PROVIDER',
    required: false,
    description: 'Email provider (resend or console)',
  },
  {
    name: 'RESEND_API_KEY',
    required: false,
    description: 'Resend API key for sending emails',
  },
  {
    name: 'EMAIL_FROM',
    required: false,
    description: 'From email address',
  },
  {
    name: 'OPENAI_API_KEY',
    required: false,
    description: 'OpenAI API key for AI features',
  },
]

/**
 * Validates environment variables and provides helpful error messages
 * Call this at app startup to ensure all required config is present
 */
export function validateEnv(): void {
  const missing: string[] = []
  const warnings: string[] = []

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar.name]

    if (envVar.required && !value) {
      missing.push(`${envVar.name}: ${envVar.description}`)
    } else if (!envVar.required && !value) {
      warnings.push(`${envVar.name}: ${envVar.description} (optional, using defaults)`)
    }
  }

  // Log warnings for optional missing variables
  if (warnings.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('\n⚠️  Optional environment variables not set:')
    warnings.forEach(warning => console.warn(`   - ${warning}`))
    console.warn('')
  }

  // Fail fast if required variables are missing
  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:\n')
    missing.forEach(msg => console.error(`   - ${msg}`))
    console.error('\nPlease set these variables in your .env.local file')
    console.error('See .env.example for reference\n')
    process.exit(1)
  }

  // Success message in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('✅ Environment variables validated successfully')
  }
}

/**
 * Get environment variable with fallback
 * Useful for non-critical config with defaults
 */
export function getEnv(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue
}

/**
 * Get required environment variable or throw error
 * Use for critical config that must exist
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`)
  }
  return value
}
