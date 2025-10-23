# Marketing Site Integration Guide

This guide explains how to integrate the marketing site with the main application to show user authentication status and subscription tier.

## Overview

The main application (port 3070) provides an API endpoint that the marketing site (port 3071) can call to check if a user is logged in and their subscription status.

## API Endpoint

### GET `/api/auth/status`

Returns the current user's authentication and subscription status.

**Response when authenticated:**

```json
{
  "authenticated": true,
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "subscriptionTier": "PRO" | "FREE",
    "subscriptionStatus": "ACTIVE" | "TRIAL" | "CANCELLED",
    "isDemo": false
  }
}
```

**Response when not authenticated:**

```json
{
  "authenticated": false,
  "user": null
}
```

## Integration for Marketing Site

### 1. Create a React Hook

Add this hook to your marketing site (`marketing/lib/useAuth.ts` or similar):

```typescript
// marketing/lib/useAuth.ts
import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  subscriptionTier: 'PRO' | 'FREE'
  subscriptionStatus: 'ACTIVE' | 'TRIAL' | 'CANCELLED'
  isDemo: boolean
}

interface AuthStatus {
  authenticated: boolean
  user: User | null
  loading: boolean
  error: string | null
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3070'

export function useAuth(): AuthStatus {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    authenticated: false,
    user: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch(`${APP_URL}/api/auth/status`, {
          credentials: 'include', // Important: Send cookies
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to check auth status')
        }

        const data = await response.json()

        setAuthStatus({
          authenticated: data.authenticated,
          user: data.user,
          loading: false,
          error: null,
        })
      } catch (error) {
        setAuthStatus({
          authenticated: false,
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    checkAuth()
  }, [])

  return authStatus
}
```

### 2. Update Marketing Site Header

Use the hook in your marketing site header component:

```typescript
// marketing/components/Header.tsx
'use client'

import { useAuth } from '@/lib/useAuth'
import Link from 'next/link'

export function MarketingHeader() {
  const { authenticated, user, loading } = useAuth()

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3070'

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-red-700">
          Lean Projax
        </Link>

        <nav className="flex items-center gap-4">
          {loading ? (
            <div className="animate-pulse bg-gray-200 h-10 w-24 rounded" />
          ) : authenticated && user ? (
            <>
              {/* Show user info and link to app */}
              <span className="text-sm text-gray-600">
                Welcome, {user.name}
                {user.subscriptionTier === 'PRO' && (
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                    Pro
                  </span>
                )}
              </span>
              <a
                href={`${APP_URL}/assignments`}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                Go to App
              </a>
            </>
          ) : (
            <>
              {/* Show login/signup buttons */}
              <a
                href={`${APP_URL}/login`}
                className="text-black hover:text-gray-700"
              >
                Sign In
              </a>
              <a
                href={`${APP_URL}/signup`}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                Get Started
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
```

### 3. Update Pricing Page

Show different CTAs based on authentication status:

```typescript
// marketing/app/pricing/page.tsx
'use client'

import { useAuth } from '@/lib/useAuth'

export default function PricingPage() {
  const { authenticated, user } = useAuth()

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3070'

  const getUpgradeUrl = () => {
    if (authenticated) {
      // User is logged in, send to upgrade page
      return `${APP_URL}/upgrade`
    } else {
      // User not logged in, send to signup
      return `${APP_URL}/signup`
    }
  }

  const getButtonText = () => {
    if (!authenticated) {
      return 'Get Started'
    }
    if (user?.subscriptionTier === 'PRO') {
      return 'Current Plan'
    }
    return 'Upgrade Now'
  }

  const isCurrentPlan = authenticated && user?.subscriptionTier === 'PRO'

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-12">Pricing</h1>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="border-2 border-gray-300 rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-4">Free</h3>
          <p className="text-4xl font-bold mb-6">$0<span className="text-lg text-gray-600">/month</span></p>
          <ul className="space-y-3 mb-8">
            <li>✓ Up to 3 assignments</li>
            <li>✓ Basic analytics</li>
            <li>✓ Email support</li>
          </ul>
          {!authenticated && (
            <a
              href={`${APP_URL}/signup`}
              className="block w-full text-center bg-gray-200 text-gray-900 py-3 rounded hover:bg-gray-300"
            >
              Get Started Free
            </a>
          )}
        </div>

        {/* Pro Plan */}
        <div className="border-2 border-purple-600 rounded-lg p-8 relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm">
            Most Popular
          </div>
          <h3 className="text-2xl font-bold mb-4">Pro</h3>
          <p className="text-4xl font-bold mb-6">$49<span className="text-lg text-gray-600">/month</span></p>
          <ul className="space-y-3 mb-8">
            <li>✓ Unlimited assignments</li>
            <li>✓ Advanced analytics</li>
            <li>✓ PDF & Excel exports</li>
            <li>✓ Team collaboration</li>
            <li>✓ AI-powered insights</li>
            <li>✓ Priority support</li>
          </ul>
          <a
            href={getUpgradeUrl()}
            className={`block w-full text-center py-3 rounded ${
              isCurrentPlan
                ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {getButtonText()}
          </a>
        </div>
      </div>
    </div>
  )
}
```

## Environment Variables

### Main App (.env.local)

```env
NEXT_PUBLIC_MARKETING_URL="http://localhost:3071"
NEXT_PUBLIC_APP_URL="http://localhost:3070"
```

### Marketing Site (.env.local)

```env
NEXT_PUBLIC_APP_URL="http://localhost:3070"
```

## CORS Configuration

The auth status API endpoint is configured to allow requests from:

- `http://localhost:3071` (local marketing site)
- The value in `NEXT_PUBLIC_MARKETING_URL`
- The value in `NEXT_PUBLIC_APP_URL`

Requests include credentials (cookies) so the authentication token is sent with the request.

## How It Works

1. **Marketing site loads** → Calls `useAuth()` hook
2. **Hook makes request** → `GET ${APP_URL}/api/auth/status` with `credentials: 'include'`
3. **Main app checks auth** → Reads `auth-token` cookie and verifies JWT
4. **Returns user data** → Including subscription tier and status
5. **Marketing site updates UI** → Shows personalized content based on user state

## User Flow Examples

### Not Logged In

- Marketing site shows "Sign In" and "Get Started" buttons
- Pricing page shows "Get Started" for both plans
- Clicking either redirects to main app login/signup

### Logged In (Free User)

- Marketing site shows "Welcome, [Name]" and "Go to App" button
- Pricing page shows "Upgrade Now" on Pro plan
- Clicking upgrade redirects to `/upgrade` page

### Logged In (Pro User)

- Marketing site shows "Welcome, [Name]" with "Pro" badge and "Go to App" button
- Pricing page shows "Current Plan" (disabled) on Pro plan
- User can access all premium features

## Testing

1. **Start both servers:**

   ```bash
   # Terminal 1 - Main app
   cd "/Users/alsulaihim/All-Day-Dev/Lean Projax 1"
   npm run dev

   # Terminal 2 - Marketing site
   cd "/Users/alsulaihim/All-Day-Dev/Lean Projax 1/marketing"
   npm run dev
   ```

2. **Test not authenticated:**
   - Open http://localhost:3071
   - Should see login/signup buttons

3. **Test authenticated:**
   - Login at http://localhost:3070/login
   - Go to http://localhost:3071
   - Should see personalized header with your name

4. **Test Pro user:**
   - Upgrade to Pro at http://localhost:3070/upgrade
   - Refresh http://localhost:3071
   - Should see "Pro" badge next to your name

## Troubleshooting

### "CORS error" or "Failed to fetch"

- Verify both servers are running
- Check environment variables are set correctly
- Clear browser cookies and try again

### "Not showing user even after login"

- Check that cookies are being sent (`credentials: 'include'`)
- Verify `auth-token` cookie exists in browser dev tools
- Check CORS headers in network tab

### "Shows wrong subscription status"

- Clear browser cache
- Check database for correct user subscription data
- Verify auth token is up to date (may need to re-login)
