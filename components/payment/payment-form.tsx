'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, CreditCard, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentFormProps {
  onSuccess?: () => void
}

function StripePaymentForm({
  subscriptionTier,
  billingPeriod,
  onSuccess,
}: {
  subscriptionTier: 'PRO'
  billingPeriod: 'monthly' | 'annual'
  onSuccess?: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(undefined)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      if (error) {
        setErrorMessage(error.message)
        setIsProcessing(false)
        return
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        const response = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: 'STRIPE',
            paymentIntentId: paymentIntent.id,
            subscriptionTier,
            billingPeriod,
          }),
        })

        if (response.ok) {
          if (onSuccess) {
            onSuccess()
          } else {
            router.push('/dashboard?payment=success')
            router.refresh()
          }
        } else {
          setErrorMessage('Payment confirmation failed. Please contact support.')
        }
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-black text-white hover:bg-gray-800"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay with Card
          </>
        )}
      </Button>
    </form>
  )
}

export function PaymentForm({ onSuccess }: PaymentFormProps) {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState<'stripe' | 'paypal'>('stripe')
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')
  const [stripeClientSecret, setStripeClientSecret] = useState<string>()
  const [isLoadingIntent, setIsLoadingIntent] = useState(false)
  const [paypalError, setPaypalError] = useState<string>()

  const subscriptionTier = 'PRO'

  const prices = {
    monthly: { amount: 49, display: '$49' },
    annual: { amount: 490, display: '$490', savings: 'Save $98/year' },
  }

  const handleTabChange = async (value: string) => {
    setSelectedTab(value as 'stripe' | 'paypal')

    // Create Stripe payment intent when switching to Stripe tab
    if (value === 'stripe' && !stripeClientSecret) {
      setIsLoadingIntent(true)
      try {
        const response = await fetch('/api/payments/create-stripe-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscriptionTier,
            billingPeriod,
          }),
        })

        const data = await response.json()
        if (response.ok) {
          setStripeClientSecret(data.clientSecret)
        }
      } catch (error) {
        console.error('Failed to create payment intent:', error)
      } finally {
        setIsLoadingIntent(false)
      }
    }
  }

  const handleBillingPeriodChange = async (period: 'monthly' | 'annual') => {
    setBillingPeriod(period)

    // Recreate Stripe intent with new amount if on Stripe tab
    if (selectedTab === 'stripe') {
      setIsLoadingIntent(true)
      setStripeClientSecret(undefined)

      try {
        const response = await fetch('/api/payments/create-stripe-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscriptionTier,
            billingPeriod: period,
          }),
        })

        const data = await response.json()
        if (response.ok) {
          setStripeClientSecret(data.clientSecret)
        }
      } catch (error) {
        console.error('Failed to create payment intent:', error)
      } finally {
        setIsLoadingIntent(false)
      }
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-2 border-black">
      <CardHeader>
        <CardTitle className="text-2xl">Upgrade to Pro</CardTitle>
        <CardDescription>Choose your payment method and billing period</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Billing Period Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Billing Period</Label>
          <RadioGroup
            value={billingPeriod}
            onValueChange={value => handleBillingPeriodChange(value as 'monthly' | 'annual')}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            <div>
              <RadioGroupItem value="monthly" id="monthly" className="peer sr-only" />
              <Label
                htmlFor="monthly"
                className="flex flex-col items-start justify-between rounded-md border-2 border-gray-300 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-black peer-data-[state=checked]:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-lg font-semibold">Monthly</span>
                  <span className="text-2xl font-bold">{prices.monthly.display}</span>
                </div>
                <span className="text-sm text-gray-600 mt-1">per month</span>
              </Label>
            </div>

            <div>
              <RadioGroupItem value="annual" id="annual" className="peer sr-only" />
              <Label
                htmlFor="annual"
                className="flex flex-col items-start justify-between rounded-md border-2 border-gray-300 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-black peer-data-[state=checked]:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-lg font-semibold">Annual</span>
                  <span className="text-2xl font-bold">{prices.annual.display}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-600">per year</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                    {prices.annual.savings}
                  </span>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Payment Method Tabs */}
        <Tabs value={selectedTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stripe">Credit Card</TabsTrigger>
            <TabsTrigger value="paypal">PayPal</TabsTrigger>
          </TabsList>

          <TabsContent value="stripe" className="mt-6">
            {isLoadingIntent ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
              </div>
            ) : stripeClientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: stripeClientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#000000',
                      borderRadius: '6px',
                    },
                  },
                }}
              >
                <StripePaymentForm
                  subscriptionTier={subscriptionTier}
                  billingPeriod={billingPeriod}
                  onSuccess={onSuccess}
                />
              </Elements>
            ) : (
              <div className="text-center py-12 text-gray-600">Click here to load payment form</div>
            )}
          </TabsContent>

          <TabsContent value="paypal" className="mt-6">
            <PayPalScriptProvider
              options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
                currency: 'USD',
                intent: 'capture',
              }}
            >
              <div className="space-y-4">
                {paypalError && (
                  <Alert variant="destructive">
                    <AlertDescription>{paypalError}</AlertDescription>
                  </Alert>
                )}

                <PayPalButtons
                  style={{
                    layout: 'vertical',
                    color: 'black',
                    shape: 'rect',
                    label: 'paypal',
                  }}
                  createOrder={async () => {
                    try {
                      const response = await fetch('/api/payments/create-paypal-order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          subscriptionTier,
                          billingPeriod,
                        }),
                      })

                      const data = await response.json()
                      if (!response.ok) {
                        throw new Error(data.error || 'Failed to create order')
                      }

                      return data.orderId
                    } catch (error) {
                      setPaypalError('Failed to create PayPal order. Please try again.')
                      throw error
                    }
                  }}
                  onApprove={async data => {
                    try {
                      const response = await fetch('/api/payments/confirm', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          provider: 'PAYPAL',
                          orderId: data.orderID,
                          subscriptionTier,
                          billingPeriod,
                        }),
                      })

                      if (response.ok) {
                        if (onSuccess) {
                          onSuccess()
                        } else {
                          router.push('/dashboard?payment=success')
                          router.refresh()
                        }
                      } else {
                        setPaypalError('Payment confirmation failed. Please contact support.')
                      }
                    } catch (error) {
                      setPaypalError('An unexpected error occurred. Please try again.')
                    }
                  }}
                  onError={err => {
                    console.error('PayPal error:', err)
                    setPaypalError('PayPal payment failed. Please try again.')
                  }}
                />
              </div>
            </PayPalScriptProvider>
          </TabsContent>
        </Tabs>

        {/* Features List */}
        <div className="border-t pt-6 mt-6">
          <h4 className="font-semibold mb-3">Pro Plan includes:</h4>
          <ul className="space-y-2">
            {[
              'Unlimited assignments',
              'Advanced analytics and reporting',
              'Team collaboration features',
              'Priority support',
              'Export to PDF',
              'Custom branding',
            ].map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
