import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import type { UserRole, SubscriptionTier, SubscriptionStatus } from '@prisma/client'
import { prisma } from './prisma'

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET environment variable is required')
}

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  isDemo?: boolean
}

export interface FullUser extends User {
  subscriptionTier: SubscriptionTier
  subscriptionStatus: SubscriptionStatus
  trialEndsAt: Date | null
}

export async function getUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token.value, JWT_SECRET)

    // Validate JWT payload structure and extract typed values
    if (!payload || typeof payload !== 'object' ||
        !('id' in payload) || !('email' in payload) ||
        !('name' in payload) || !('role' in payload)) {
      return null
    }

    // Extract and validate payload properties
    const { id, email, name, role, isDemo } = payload

    if (typeof id !== 'string' || typeof email !== 'string' ||
        typeof name !== 'string' || typeof role !== 'string') {
      return null
    }

    return {
      id,
      email,
      name,
      role: role as UserRole,
      isDemo: typeof isDemo === 'boolean' ? isDemo : undefined
    }
  } catch {
    return null
  }
}

/**
 * Get full user with subscription data from database
 * Use this when you need subscription information (e.g., in layouts, headers)
 */
export async function getFullUser(): Promise<FullUser | null> {
  const user = await getUser()

  if (!user) {
    return null
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        trialEndsAt: true,
      }
    })

    if (!dbUser) {
      return null
    }

    return {
      ...dbUser,
      isDemo: user.isDemo
    }
  } catch {
    return null
  }
}