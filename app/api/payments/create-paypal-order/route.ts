import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth-check'
import { checkDemoMode } from '@/lib/demo-check'

const PAYPAL_API_BASE =
  process.env.NODE_ENV === 'production'
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
      Authorization: `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
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
    const { subscriptionTier, billingPeriod } = await request.json()

    // Validate input
    if (!subscriptionTier || !billingPeriod) {
      return NextResponse.json(
        { error: 'Missing required fields: subscriptionTier, billingPeriod' },
        { status: 400 }
      )
    }

    if (!['PRO'].includes(subscriptionTier)) {
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 })
    }

    if (!['monthly', 'annual'].includes(billingPeriod)) {
      return NextResponse.json({ error: 'Invalid billing period' }, { status: 400 })
    }

    // Calculate amount based on tier and period
    const amounts = {
      PRO: {
        monthly: '49.00',
        annual: '490.00',
      },
    }

    const amount = amounts[subscriptionTier as 'PRO'][billingPeriod as 'monthly' | 'annual']

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()

    // Create PayPal order
    const orderResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amount,
            },
            description: `Lean Projax ${subscriptionTier} - ${billingPeriod}`,
            custom_id: JSON.stringify({
              userId: user.id,
              subscriptionTier,
              billingPeriod,
              userEmail: user.email,
            }),
          },
        ],
        application_context: {
          brand_name: 'Lean Projax',
          shipping_preference: 'NO_SHIPPING',
        },
      }),
    })

    const order = await orderResponse.json()

    if (!orderResponse.ok) {
      console.error('PayPal order creation failed:', order)
      return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 })
    }

    return NextResponse.json({
      orderId: order.id,
    })
  } catch (error) {
    console.error('Failed to create PayPal order:', error)
    return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 })
  }
}
