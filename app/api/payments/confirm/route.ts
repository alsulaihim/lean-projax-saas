import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth-check'
import { checkDemoMode } from '@/lib/demo-check'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

const PAYPAL_API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`
    },
    body: 'grant_type=client_credentials'
  })

  const data = await response.json()
  return data.access_token
}

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Prevent demo users from making payments
  const demoCheck = checkDemoMode(user)
  if (demoCheck) return demoCheck

  try {
    const { provider, paymentIntentId, orderId, subscriptionTier, billingPeriod } = await request.json()

    // Validate input
    if (!provider || !subscriptionTier || !billingPeriod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let amount = 0
    let providerPaymentId = ''
    let paymentStatus: 'SUCCEEDED' | 'FAILED' = 'FAILED'

    // Handle Stripe payment confirmation
    if (provider === 'STRIPE') {
      if (!paymentIntentId) {
        return NextResponse.json(
          { error: 'Missing paymentIntentId for Stripe payment' },
          { status: 400 }
        )
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

      if (paymentIntent.status === 'succeeded') {
        amount = paymentIntent.amount / 100 // Convert from cents
        providerPaymentId = paymentIntent.id
        paymentStatus = 'SUCCEEDED'
      }
    }

    // Handle PayPal payment confirmation
    if (provider === 'PAYPAL') {
      if (!orderId) {
        return NextResponse.json(
          { error: 'Missing orderId for PayPal payment' },
          { status: 400 }
        )
      }

      const accessToken = await getPayPalAccessToken()

      // Capture the PayPal order
      const captureResponse = await fetch(
        `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        }
      )

      const captureData = await captureResponse.json()

      if (captureData.status === 'COMPLETED') {
        amount = parseFloat(captureData.purchase_units[0].amount.value)
        providerPaymentId = orderId
        paymentStatus = 'SUCCEEDED'
      }
    }

    // Create payment record in database
    const payment = await prisma.$transaction(async (tx) => {
      const newPayment = await tx.payment.create({
        data: {
          userId: user.id,
          amount,
          currency: 'USD',
          provider,
          status: paymentStatus,
          stripePaymentId: provider === 'STRIPE' ? providerPaymentId : null,
          paypalOrderId: provider === 'PAYPAL' ? providerPaymentId : null,
          subscriptionTier,
          billingPeriod,
          description: `Lean Projax ${subscriptionTier} - ${billingPeriod}`,
          paidAt: paymentStatus === 'SUCCEEDED' ? new Date() : null
        }
      })

      // Update user subscription if payment succeeded
      if (paymentStatus === 'SUCCEEDED') {
        const trialEndsAt = new Date()
        if (billingPeriod === 'monthly') {
          trialEndsAt.setMonth(trialEndsAt.getMonth() + 1)
        } else {
          trialEndsAt.setFullYear(trialEndsAt.getFullYear() + 1)
        }

        await tx.user.update({
          where: { id: user.id },
          data: {
            subscriptionTier,
            subscriptionStatus: 'ACTIVE',
            trialEndsAt
          }
        })
      }

      return newPayment
    })

    return NextResponse.json({
      success: paymentStatus === 'SUCCEEDED',
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount
      }
    })
  } catch (error) {
    console.error('Failed to confirm payment:', error)
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}
