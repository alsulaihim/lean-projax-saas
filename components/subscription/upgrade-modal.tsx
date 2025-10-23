'use client'

import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Crown, Sparkles, X, Check } from 'lucide-react'
import { PremiumFeature, FEATURE_DESCRIPTIONS } from '@/lib/subscription'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  feature?: PremiumFeature
  title?: string
  description?: string
}

export function UpgradeModal({ isOpen, onClose, feature, title, description }: UpgradeModalProps) {
  const router = useRouter()

  const featureInfo = feature ? FEATURE_DESCRIPTIONS[feature] : null

  const displayTitle = title || featureInfo?.title || 'Upgrade to Pro'
  const displayDescription =
    description || featureInfo?.description || 'Unlock this premium feature and more'

  const handleUpgrade = () => {
    onClose()
    router.push('/upgrade')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2 border-black">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-6 w-6 text-yellow-600" />
            <DialogTitle className="text-2xl font-bold">{displayTitle}</DialogTitle>
          </div>
          <DialogDescription className="text-base text-gray-700">
            {displayDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Pro Benefits */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Pro Plan Includes:
            </h4>
            <ul className="space-y-2">
              {[
                'Unlimited assignments',
                'Advanced analytics & reporting',
                'PDF & Excel exports',
                'Team collaboration',
                'AI-powered insights',
                'Custom branding',
                'Priority support',
              ].map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-800">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border-2 border-gray-300 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600">Monthly</p>
              <p className="text-2xl font-bold text-gray-900">$49</p>
              <p className="text-xs text-gray-500">per month</p>
            </div>
            <div className="border-2 border-purple-600 bg-purple-50 rounded-lg p-3 text-center relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                Save 17%
              </div>
              <p className="text-sm text-purple-700 font-medium">Annual</p>
              <p className="text-2xl font-bold text-purple-900">$490</p>
              <p className="text-xs text-purple-600">$40.83/month</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-black hover:bg-gray-100"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
