import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Check if payment already exists
        const existingPayment = await prisma.payment.findUnique({
          where: { stripePaymentId: paymentIntent.id },
        })

        if (existingPayment) {
          // Update existing payment
          await prisma.payment.update({
            where: { stripePaymentId: paymentIntent.id },
            data: {
              status: 'SUCCEEDED',
              paidAt: new Date(),
            },
          })
        } else {
          // Create new payment record from webhook
          const userId = paymentIntent.metadata.userId
          const subscriptionTier = paymentIntent.metadata.subscriptionTier as 'PRO'
          const billingPeriod = paymentIntent.metadata.billingPeriod

          if (userId && subscriptionTier && billingPeriod) {
            const trialEndsAt = new Date()
            if (billingPeriod === 'monthly') {
              trialEndsAt.setMonth(trialEndsAt.getMonth() + 1)
            } else {
              trialEndsAt.setFullYear(trialEndsAt.getFullYear() + 1)
            }

            await prisma.$transaction(async tx => {
              await tx.payment.create({
                data: {
                  userId,
                  amount: paymentIntent.amount / 100,
                  currency: paymentIntent.currency.toUpperCase(),
                  provider: 'STRIPE',
                  status: 'SUCCEEDED',
                  stripePaymentId: paymentIntent.id,
                  subscriptionTier,
                  billingPeriod,
                  description: `Lean Projax ${subscriptionTier} - ${billingPeriod}`,
                  paidAt: new Date(),
                },
              })

              await tx.user.update({
                where: { id: userId },
                data: {
                  subscriptionTier,
                  subscriptionStatus: 'ACTIVE',
                  trialEndsAt,
                },
              })
            })
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Update payment status to failed
        await prisma.payment.updateMany({
          where: { stripePaymentId: paymentIntent.id },
          data: {
            status: 'FAILED',
          },
        })
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
