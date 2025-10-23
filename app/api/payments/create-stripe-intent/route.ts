import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth-check'
import { checkDemoMode } from '@/lib/demo-check'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Prevent demo users from making payments
  const demoCheck = checkDemoMode(user)
  if (demoCheck) return demoCheck

  try {
    const { subscriptionTier, billingPeriod } = await request.json()

    // Validate input
    if (!subscriptionTier || !billingPeriod) {
      return NextResponse.json(
        { error: 'Missing required fields: subscriptionTier, billingPeriod' },
        { status: 400 }
      )
    }

    if (!['PRO'].includes(subscriptionTier)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      )
    }

    if (!['monthly', 'annual'].includes(billingPeriod)) {
      return NextResponse.json(
        { error: 'Invalid billing period' },
        { status: 400 }
      )
    }

    // Calculate amount based on tier and period
    const amounts = {
      PRO: {
        monthly: 4900, // $49.00
        annual: 49000  // $490.00 (save ~17%)
      }
    }

    const amount = amounts[subscriptionTier as 'PRO'][billingPeriod as 'monthly' | 'annual']

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: user.id,
        subscriptionTier,
        billingPeriod,
        userEmail: user.email
      }
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })
  } catch (error) {
    console.error('Failed to create Stripe payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
