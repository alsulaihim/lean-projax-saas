import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import type { Adapter } from 'next-auth/adapters'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@/lib/types'

export const authOptions: NextAuthOptions = {
  // Type assertion needed due to adapter interface mismatch between @auth/prisma-adapter and next-auth
  adapter: PrismaAdapter(prisma) as Adapter,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.passwordHash) {
          throw new Error('Invalid credentials')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    }
  }
}

// Helper functions for authorization
export function canEditAssignment(
  userId: string,
  role: UserRole,
  assignment: { createdById: string; status: string }
): boolean {
  // Team leads can edit any assignment
  if (role === UserRole.TEAM_LEAD) return true

  // BPI team members can edit their own draft or reopened assignments
  if (role === UserRole.BPI_TEAM) {
    return (
      assignment.createdById === userId &&
      (assignment.status === 'DRAFT' || assignment.status === 'REOPENED')
    )
  }

  return false
}

export function canCompleteAssignment(role: UserRole): boolean {
  return role === UserRole.TEAM_LEAD
}

export function canReopenAssignment(role: UserRole): boolean {
  return role === UserRole.TEAM_LEAD
}

export function canViewAssignment(
  role: UserRole,
  assignment: { status: string }
): boolean {
  // Executives and process owners can only view completed assignments
  if (role === UserRole.EXECUTIVE || role === UserRole.PROCESS_OWNER) {
    return assignment.status === 'COMPLETED'
  }

  // BPI team and team leads can view all assignments
  return true
}