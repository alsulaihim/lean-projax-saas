import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import type { UserRole } from '@prisma/client'

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET environment variable is required')
}

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export async function getUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token.value, JWT_SECRET)

    // Validate JWT payload structure
    if (!payload || typeof payload !== 'object' ||
        !('id' in payload) || !('email' in payload) ||
        !('name' in payload) || !('role' in payload)) {
      return null
    }

    return payload as User
  } catch {
    return null
  }
}