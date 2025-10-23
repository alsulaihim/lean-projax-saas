# Feature Locks Implementation Guide

This guide explains how to implement feature locks for premium features in Lean Projax.

## Overview

The application now includes a comprehensive subscription/feature lock system that:

- Shows "Upgrade to Pro" prompts for locked features
- Displays subscription status in header
- Limits free users to 3 assignments
- Locks premium features behind Pro subscription
- Provides upgrade modals with clear pricing

## Components Created

### 1. Subscription Utilities ([lib/subscription.ts](lib/subscription.ts))

Helper functions for checking subscription status and feature access:

```typescript
import { isPro, hasFeatureAccess, PremiumFeature } from '@/lib/subscription'

// Check if user is Pro
const userIsPro = isPro({
  tier: user.subscriptionTier,
  status: user.subscriptionStatus,
  trialEndsAt: user.trialEndsAt,
})

// Check if user has access to a feature
const canExportPDF = hasFeatureAccess({ tier, status, trialEndsAt }, PremiumFeature.EXPORT_PDF)
```

### 2. Feature Lock Components

#### `<FeatureLock>` ([components/subscription/feature-lock.tsx](components/subscription/feature-lock.tsx))

Wraps premium features with three lock modes:

**Mode: "disable"** (default) - Shows content but disabled with lock badge

```tsx
<FeatureLock isLocked={!isPro} feature={PremiumFeature.EXPORT_PDF} mode="disable">
  <ExportButton />
</FeatureLock>
```

**Mode: "blur"** - Shows blurred content with lock overlay

```tsx
<FeatureLock isLocked={!isPro} feature={PremiumFeature.ADVANCED_ANALYTICS} mode="blur">
  <AdvancedChart />
</FeatureLock>
```

**Mode: "hide"** - Hides content and shows upgrade CTA

```tsx
<FeatureLock
  isLocked={!isPro}
  feature={PremiumFeature.TEAM_COLLABORATION}
  mode="hide"
  lockedMessage="Collaborate with your team in real-time"
>
  <TeamFeatures />
</FeatureLock>
```

#### `<LockedButton>` - For action buttons

```tsx
import { LockedButton } from '@/components/subscription/feature-lock'

;<LockedButton isLocked={!isPro} feature={PremiumFeature.EXPORT_PDF} onClick={() => handleExport()}>
  Export to PDF
</LockedButton>
```

### 3. Upgrade Modal ([components/subscription/upgrade-modal.tsx](components/subscription/upgrade-modal.tsx))

Automatically shown when users interact with locked features. Shows:

- Feature-specific title and description
- All Pro benefits
- Pricing (monthly $49, annual $490)
- Clear upgrade CTA

## Implementation Examples

### Example 1: Lock PDF Export Feature

```tsx
// In assignment detail page
import { getFullUser } from '@/lib/auth-check'
import { isPro, PremiumFeature } from '@/lib/subscription'
import { LockedButton } from '@/components/subscription/feature-lock'

export default async function AssignmentPage({ params }: { params: { id: string } }) {
  const user = await getFullUser()
  if (!user) redirect('/login')

  const userIsPro = isPro({
    tier: user.subscriptionTier,
    status: user.subscriptionStatus,
    trialEndsAt: user.trialEndsAt,
  })

  return (
    <div>
      {/* Other content */}

      <div className="flex gap-2">
        <Button>Save</Button>

        <LockedButton
          isLocked={!userIsPro}
          feature={PremiumFeature.EXPORT_PDF}
          onClick={() => handleExportPDF()}
          variant="outline"
        >
          Export PDF
        </LockedButton>
      </div>
    </div>
  )
}
```

### Example 2: Lock Advanced Analytics Section

```tsx
'use client'

import { FeatureLock } from '@/components/subscription/feature-lock'
import { PremiumFeature } from '@/lib/subscription'

interface AnalyticsDashboardProps {
  isPro: boolean
}

export function AnalyticsDashboard({ isPro }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Basic analytics - always shown */}
      <BasicCharts />

      {/* Advanced analytics - locked for free users */}
      <FeatureLock isLocked={!isPro} feature={PremiumFeature.ADVANCED_ANALYTICS} mode="blur">
        <AdvancedAnalytics />
      </FeatureLock>
    </div>
  )
}
```

### Example 3: Limit Assignment Creation

```tsx
// In assignments page
import { getFullUser } from '@/lib/auth-check'
import { canCreateAssignment, FREE_TIER_LIMITS, PremiumFeature } from '@/lib/subscription'
import { LockedButton } from '@/components/subscription/feature-lock'

export default async function AssignmentsPage() {
  const user = await getFullUser()
  if (!user) redirect('/login')

  const assignments = await prisma.assignment.findMany({
    where: { createdById: user.id },
  })

  const canCreate = canCreateAssignment(
    {
      tier: user.subscriptionTier,
      status: user.subscriptionStatus,
      trialEndsAt: user.trialEndsAt,
    },
    assignments.length
  )

  const isAtLimit = assignments.length >= FREE_TIER_LIMITS.MAX_ASSIGNMENTS
  const isLocked = !canCreate && isAtLimit

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Assignments ({assignments.length})</h1>

        {isLocked ? (
          <LockedButton
            isLocked={true}
            feature={PremiumFeature.UNLIMITED_ASSIGNMENTS}
            variant="default"
          >
            Create New Assignment
          </LockedButton>
        ) : (
          <Button onClick={() => router.push('/assignments/new')}>Create New Assignment</Button>
        )}
      </div>

      {/* Show warning when approaching limit */}
      {!canCreate && assignments.length >= FREE_TIER_LIMITS.MAX_ASSIGNMENTS - 1 && (
        <Alert>
          <AlertDescription>
            You've used {assignments.length} of {FREE_TIER_LIMITS.MAX_ASSIGNMENTS} free assignments.
            <Link href="/upgrade" className="ml-2 underline">
              Upgrade to Pro
            </Link>{' '}
            for unlimited assignments.
          </AlertDescription>
        </Alert>
      )}

      <AssignmentList assignments={assignments} />
    </div>
  )
}
```

### Example 4: Lock AI Features

```tsx
'use client'

import { useState } from 'react'
import { FeatureLock } from '@/components/subscription/feature-lock'
import { PremiumFeature } from '@/lib/subscription'

interface AIAssessmentProps {
  isPro: boolean
}

export function AIAssessment({ isPro }: AIAssessmentProps) {
  const [showAIInsights, setShowAIInsights] = useState(false)

  return (
    <div>
      <Button onClick={() => setShowAIInsights(true)} className="mb-4">
        View AI Insights
      </Button>

      {showAIInsights && (
        <FeatureLock isLocked={!isPro} feature={PremiumFeature.AI_INSIGHTS} mode="hide">
          <AIInsightsPanel />
        </FeatureLock>
      )}
    </div>
  )
}
```

## Premium Features List

Available premium features (defined in `lib/subscription.ts`):

| Feature                 | Description         | Where to Use               |
| ----------------------- | ------------------- | -------------------------- |
| `EXPORT_PDF`            | PDF export          | Assignment detail, reports |
| `EXPORT_EXCEL`          | Excel export        | Data tables, analytics     |
| `ADVANCED_ANALYTICS`    | Advanced analytics  | Dashboard, reports         |
| `CUSTOM_REPORTS`        | Custom reports      | Reporting section          |
| `TEAM_COLLABORATION`    | Team collaboration  | Throughout app             |
| `SHARED_ASSIGNMENTS`    | Shared assignments  | Assignment sharing         |
| `AI_RECOMMENDATIONS`    | AI recommendations  | Process recommendations    |
| `AI_INSIGHTS`           | AI insights         | AI assessment              |
| `CUSTOM_BRANDING`       | Custom branding     | Reports, exports           |
| `CUSTOM_TEMPLATES`      | Custom templates    | Assignment creation        |
| `UNLIMITED_ASSIGNMENTS` | No assignment limit | Assignment creation        |

## Best Practices

### 1. Server-Side vs Client-Side Checks

**Server-side** (for security):

```tsx
// Server component
export default async function Page() {
  const user = await getFullUser()
  const userIsPro = isPro({...})

  // Pass to client component
  return <ClientComponent isPro={userIsPro} />
}
```

**Client-side** (for UX):

```tsx
// Client component
'use client'
export function Component({ isPro }: { isPro: boolean }) {
  return <FeatureLock isLocked={!isPro} feature={...}>
}
```

### 2. Choose the Right Lock Mode

- **disable**: For buttons/actions that should be visible but not clickable
- **blur**: For dashboards/charts that show value but need upgrade
- **hide**: For major features that should be completely hidden

### 3. Provide Clear Upgrade Paths

Always make it obvious how to upgrade:

- Use `<LockedButton>` for actions
- Show pricing in modals
- Add "Upgrade to Pro" in header (already implemented)

### 4. Test Both States

Test your feature locks with both Pro and Free users:

```typescript
// In your component
if (process.env.NODE_ENV === 'development') {
  // Force free state for testing
  const isPro = false
}
```

## Free Tier Limits

Defined in `lib/subscription.ts`:

```typescript
export const FREE_TIER_LIMITS = {
  MAX_ASSIGNMENTS: 3,
  MAX_TEAM_MEMBERS: 1,
  MAX_EXPORTS_PER_MONTH: 5,
}
```

## Subscription Status Messages

Get user-friendly status messages:

```typescript
import { getSubscriptionStatusMessage } from '@/lib/subscription'

const message = getSubscriptionStatusMessage({
  tier: user.subscriptionTier,
  status: user.subscriptionStatus,
  trialEndsAt: user.trialEndsAt,
})

// Returns:
// - "Pro Plan - All features unlocked"
// - "Trial Plan - 7 days remaining"
// - "Trial expired - Upgrade to Pro"
// - "Free Plan - Upgrade to unlock all features"
```

## Where Feature Locks Are Needed

Recommended places to add feature locks:

1. **Assignment Detail Page**
   - [x] PDF export button
   - [ ] Excel export button
   - [ ] Share assignment button

2. **Dashboard**
   - [ ] Advanced analytics section
   - [ ] Custom report builder

3. **Process Tools**
   - [ ] AI-powered recommendations
   - [ ] Advanced templates

4. **Team Features**
   - [ ] Team member invitations
   - [ ] Assignment sharing
   - [ ] Real-time collaboration

5. **Exports**
   - [x] PDF export (via LockedButton)
   - [ ] Excel export
   - [ ] Custom branding options

## Next Steps

To fully implement feature locks throughout the app:

1. Identify all premium features in your app
2. Add `<FeatureLock>` or `<LockedButton>` components
3. Update server-side logic to enforce limits
4. Test with free and Pro accounts
5. Add usage tracking if needed

## Testing Checklist

- [ ] Free user sees locked features
- [ ] Free user can't create more than 3 assignments
- [ ] Free user sees upgrade modal on locked features
- [ ] Pro user has all features unlocked
- [ ] Trial user has features unlocked during trial
- [ ] Trial user sees locked features after trial expires
- [ ] Upgrade modal shows correct pricing
- [ ] "Upgrade to Pro" button in header works
- [ ] Marketing site shows correct user status

## Marketing Site Integration

See [MARKETING_INTEGRATION.md](MARKETING_INTEGRATION.md) for details on connecting the marketing site to check user authentication and subscription status.
