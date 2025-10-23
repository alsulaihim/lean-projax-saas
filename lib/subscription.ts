import { SubscriptionTier, SubscriptionStatus } from '@prisma/client'

/**
 * Subscription utility functions
 * Use these to check feature access and subscription status
 */

export interface SubscriptionInfo {
  tier: SubscriptionTier
  status: SubscriptionStatus
  trialEndsAt: Date | null
}

/**
 * Check if user has Pro subscription
 */
export function isPro(subscription: SubscriptionInfo): boolean {
  return (
    subscription.tier === SubscriptionTier.PRO && subscription.status === SubscriptionStatus.ACTIVE
  )
}

/**
 * Check if user is on trial
 */
export function isTrial(subscription: SubscriptionInfo): boolean {
  return subscription.status === SubscriptionStatus.TRIAL
}

/**
 * Check if user is on free plan
 */
export function isFree(subscription: SubscriptionInfo): boolean {
  return subscription.tier === SubscriptionTier.FREE
}

/**
 * Check if trial has expired
 */
export function isTrialExpired(subscription: SubscriptionInfo): boolean {
  if (!subscription.trialEndsAt) return false
  return new Date() > subscription.trialEndsAt
}

/**
 * Get days remaining in trial
 */
export function getTrialDaysRemaining(subscription: SubscriptionInfo): number | null {
  if (!subscription.trialEndsAt) return null
  const now = new Date()
  const trialEnd = subscription.trialEndsAt
  const diffTime = trialEnd.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

/**
 * Premium features that require Pro subscription
 */
export enum PremiumFeature {
  // Export features
  EXPORT_PDF = 'export_pdf',
  EXPORT_EXCEL = 'export_excel',

  // Advanced analytics
  ADVANCED_ANALYTICS = 'advanced_analytics',
  CUSTOM_REPORTS = 'custom_reports',

  // Collaboration
  TEAM_COLLABORATION = 'team_collaboration',
  SHARED_ASSIGNMENTS = 'shared_assignments',

  // AI Features
  AI_RECOMMENDATIONS = 'ai_recommendations',
  AI_INSIGHTS = 'ai_insights',

  // Customization
  CUSTOM_BRANDING = 'custom_branding',
  CUSTOM_TEMPLATES = 'custom_templates',

  // Assignment limits
  UNLIMITED_ASSIGNMENTS = 'unlimited_assignments',
}

/**
 * Feature descriptions for upgrade prompts
 */
export const FEATURE_DESCRIPTIONS: Record<PremiumFeature, { title: string; description: string }> =
  {
    [PremiumFeature.EXPORT_PDF]: {
      title: 'PDF Export',
      description: 'Export your assignments and reports to professional PDF documents',
    },
    [PremiumFeature.EXPORT_EXCEL]: {
      title: 'Excel Export',
      description: 'Export data tables and analytics to Excel spreadsheets',
    },
    [PremiumFeature.ADVANCED_ANALYTICS]: {
      title: 'Advanced Analytics',
      description: 'Access detailed analytics, trends, and performance metrics',
    },
    [PremiumFeature.CUSTOM_REPORTS]: {
      title: 'Custom Reports',
      description: 'Create and customize reports with your own templates',
    },
    [PremiumFeature.TEAM_COLLABORATION]: {
      title: 'Team Collaboration',
      description: 'Collaborate with team members in real-time',
    },
    [PremiumFeature.SHARED_ASSIGNMENTS]: {
      title: 'Shared Assignments',
      description: 'Share assignments with team members and stakeholders',
    },
    [PremiumFeature.AI_RECOMMENDATIONS]: {
      title: 'AI Recommendations',
      description: 'Get intelligent recommendations powered by AI',
    },
    [PremiumFeature.AI_INSIGHTS]: {
      title: 'AI Insights',
      description: 'Unlock AI-powered insights and analysis',
    },
    [PremiumFeature.CUSTOM_BRANDING]: {
      title: 'Custom Branding',
      description: 'Add your company logo and branding to reports',
    },
    [PremiumFeature.CUSTOM_TEMPLATES]: {
      title: 'Custom Templates',
      description: 'Create and save custom templates for your processes',
    },
    [PremiumFeature.UNLIMITED_ASSIGNMENTS]: {
      title: 'Unlimited Assignments',
      description: 'Create unlimited assignments without restrictions',
    },
  }

/**
 * Free tier limits
 */
export const FREE_TIER_LIMITS = {
  MAX_ASSIGNMENTS: 3,
  MAX_TEAM_MEMBERS: 1,
  MAX_EXPORTS_PER_MONTH: 5,
}

/**
 * Check if user has access to a premium feature
 */
export function hasFeatureAccess(subscription: SubscriptionInfo, feature: PremiumFeature): boolean {
  // Pro users have access to all features
  if (isPro(subscription)) {
    return true
  }

  // Trial users have access to all features during trial
  if (isTrial(subscription) && !isTrialExpired(subscription)) {
    return true
  }

  // Free users don't have access to premium features
  return false
}

/**
 * Check if user can create more assignments
 */
export function canCreateAssignment(
  subscription: SubscriptionInfo,
  currentAssignmentCount: number
): boolean {
  // Pro users have unlimited assignments
  if (isPro(subscription)) {
    return true
  }

  // Trial users have unlimited assignments during trial
  if (isTrial(subscription) && !isTrialExpired(subscription)) {
    return true
  }

  // Free users are limited
  return currentAssignmentCount < FREE_TIER_LIMITS.MAX_ASSIGNMENTS
}

/**
 * Get user-friendly subscription status message
 */
export function getSubscriptionStatusMessage(subscription: SubscriptionInfo): string {
  if (isPro(subscription)) {
    return 'Pro Plan - All features unlocked'
  }

  if (isTrial(subscription)) {
    const daysRemaining = getTrialDaysRemaining(subscription)
    if (daysRemaining === null) {
      return 'Trial Plan'
    }
    if (daysRemaining === 0) {
      return 'Trial expired - Upgrade to Pro'
    }
    return `Trial Plan - ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining`
  }

  return 'Free Plan - Upgrade to unlock all features'
}
