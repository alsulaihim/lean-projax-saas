import { getUser } from '@/lib/auth-check'
import { redirect } from 'next/navigation'
import { PaymentForm } from '@/components/payment/payment-form'

/**
 * Upgrade to Pro Page
 *
 * Purpose: Allow users to upgrade to Pro subscription
 * Flow:
 * 1. Check authentication via JWT token
 * 2. Display payment form with Stripe and PayPal options
 * 3. Handle successful payment
 */
export default async function UpgradePage() {
  const user = await getUser()

  // Redirect if not authenticated (middleware should catch this, but double-check)
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Upgrade to Pro</h1>
          <p className="text-gray-600 text-lg">
            Unlock all features and take your Lean Six Sigma projects to the next level
          </p>
        </div>

        <PaymentForm />
      </div>
    </div>
  )
}
