'use client'

import { useState, ReactNode } from 'react'
import { Lock, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UpgradeModal } from './upgrade-modal'
import { PremiumFeature } from '@/lib/subscription'

interface FeatureLockProps {
  /**
   * Is this feature locked for the current user?
   */
  isLocked: boolean

  /**
   * Which premium feature is this?
   */
  feature: PremiumFeature

  /**
   * Children to render (will be disabled if locked)
   */
  children: ReactNode

  /**
   * Lock mode:
   * - "disable": Show content but disable interaction
   * - "blur": Show blurred content with lock overlay
   * - "hide": Hide content completely and show upgrade message
   */
  mode?: 'disable' | 'blur' | 'hide'

  /**
   * Custom message for locked state
   */
  lockedMessage?: string
}

/**
 * FeatureLock component
 * Wraps premium features and shows upgrade prompts for non-Pro users
 *
 * @example
 * <FeatureLock isLocked={!isPro} feature={PremiumFeature.EXPORT_PDF} mode="blur">
 *   <ExportButton />
 * </FeatureLock>
 */
export function FeatureLock({
  isLocked,
  feature,
  children,
  mode = 'disable',
  lockedMessage,
}: FeatureLockProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // If not locked, render children normally
  if (!isLocked) {
    return <>{children}</>
  }

  // Handle different lock modes
  if (mode === 'hide') {
    return (
      <>
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
            <Crown className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pro Feature</h3>
          <p className="text-sm text-gray-600 text-center mb-4 max-w-sm">
            {lockedMessage || 'This feature is available in the Pro plan'}
          </p>
          <Button
            onClick={() => setShowUpgradeModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
          >
            <Crown className="mr-2 h-4 w-4" />
            Upgrade to Pro
          </Button>
        </div>
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature={feature}
        />
      </>
    )
  }

  if (mode === 'blur') {
    return (
      <>
        <div className="relative">
          {/* Blurred content */}
          <div className="blur-sm pointer-events-none select-none">{children}</div>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-3">
                <Lock className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-2">Pro Feature Locked</p>
              <Button
                size="sm"
                onClick={() => setShowUpgradeModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
              >
                <Crown className="mr-2 h-3 w-3" />
                Upgrade
              </Button>
            </div>
          </div>
        </div>
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature={feature}
        />
      </>
    )
  }

  // Default: disable mode
  return (
    <>
      <div className="relative">
        <div
          className="opacity-60 cursor-not-allowed pointer-events-none select-none"
          title="This feature requires Pro subscription"
        >
          {children}
        </div>
        {/* Lock badge */}
        <div
          className="absolute top-2 right-2 flex items-center gap-1 bg-purple-600 text-white text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-purple-700 transition-colors"
          onClick={() => setShowUpgradeModal(true)}
        >
          <Lock className="h-3 w-3" />
          <span>Pro</span>
        </div>
      </div>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={feature}
      />
    </>
  )
}

/**
 * Simpler component for locking buttons/actions
 */
interface LockedButtonProps {
  isLocked: boolean
  feature: PremiumFeature
  onClick?: () => void
  children: ReactNode
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
}

export function LockedButton({
  isLocked,
  feature,
  onClick,
  children,
  className,
  variant = 'default',
}: LockedButtonProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const handleClick = () => {
    if (isLocked) {
      setShowUpgradeModal(true)
    } else {
      onClick?.()
    }
  }

  return (
    <>
      <Button onClick={handleClick} variant={variant} className={className} disabled={isLocked}>
        {isLocked && <Lock className="mr-2 h-4 w-4" />}
        {children}
        {isLocked && <Crown className="ml-2 h-4 w-4 text-yellow-600" />}
      </Button>
      {isLocked && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature={feature}
        />
      )}
    </>
  )
}
