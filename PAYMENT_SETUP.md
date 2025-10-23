# Payment Integration Setup Guide

This guide will help you configure Stripe and PayPal payment integration for Lean Projax.

## Overview

The payment system supports both Stripe and PayPal with seamless, embedded checkout (no redirects or popups). Users can choose between:

- **Monthly Plan**: $49/month
- **Annual Plan**: $490/year (saves $98/year)

## Features

✅ **Seamless Payment Experience**
- Embedded Stripe Elements (no redirect)
- Inline PayPal checkout (no popup)
- Real-time payment confirmation
- Automatic subscription activation

✅ **Payment Methods**
- Credit/Debit cards via Stripe
- PayPal balance or linked accounts

✅ **Security**
- PCI-compliant payment processing
- Webhook signature verification
- Server-side payment confirmation

## Setup Instructions

### 1. Stripe Setup

#### Step 1: Create Stripe Account
1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up for a Stripe account
3. Complete account verification

#### Step 2: Get API Keys
1. Navigate to [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

#### Step 3: Configure Webhook
1. Go to [https://dashboard.stripe.com/test/webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **Add endpoint**
3. Enter your webhook URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

#### Step 4: Update Environment Variables
Add to your `.env.local`:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 2. PayPal Setup

#### Step 1: Create PayPal Developer Account
1. Go to [https://developer.paypal.com/dashboard](https://developer.paypal.com/dashboard)
2. Sign in with your PayPal account or create one
3. Navigate to **Dashboard**

#### Step 2: Create App
1. Click **Apps & Credentials**
2. Select **Sandbox** for testing (or **Live** for production)
3. Click **Create App**
4. Enter app name: "Lean Projax"
5. Click **Create App**

#### Step 3: Get API Credentials
1. Under your app, you'll see:
   - **Client ID** (starts with a long alphanumeric string)
   - **Secret** (click **Show** to reveal)
2. Copy both values

#### Step 4: Update Environment Variables
Add to your `.env.local`:
```env
NEXT_PUBLIC_PAYPAL_CLIENT_ID="your_paypal_client_id"
PAYPAL_CLIENT_SECRET="your_paypal_client_secret"
```

### 3. Test the Integration

#### Test Stripe
1. Navigate to [http://localhost:3070/upgrade](http://localhost:3070/upgrade)
2. Select **Credit Card** tab
3. Use test card: `4242 4242 4242 4242`
4. Use any future expiry date, any CVC
5. Complete payment

#### Test PayPal
1. Navigate to [http://localhost:3070/upgrade](http://localhost:3070/upgrade)
2. Select **PayPal** tab
3. Click PayPal button
4. Log in with PayPal sandbox account:
   - Email: Create at [https://developer.paypal.com/dashboard/accounts](https://developer.paypal.com/dashboard/accounts)
   - Or use personal PayPal for sandbox testing
5. Complete payment

### 4. Production Setup

When ready to go live:

#### Stripe Production
1. Switch to live mode in [Stripe Dashboard](https://dashboard.stripe.com)
2. Get live API keys from [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
3. Create production webhook pointing to your production domain
4. Update `.env.production` with live keys

#### PayPal Production
1. Switch to **Live** in PayPal Developer Dashboard
2. Create new app for production or activate existing
3. Get live credentials
4. Update `.env.production` with live keys

## API Routes

The following API routes handle payment processing:

### Payment Creation
- `POST /api/payments/create-stripe-intent` - Create Stripe PaymentIntent
- `POST /api/payments/create-paypal-order` - Create PayPal Order

### Payment Confirmation
- `POST /api/payments/confirm` - Confirm payment and activate subscription

### Webhooks
- `POST /api/webhooks/stripe` - Stripe webhook handler (verifies payment)

## Database Schema

The `Payment` model stores all payment records:

```prisma
model Payment {
  id               String          @id @default(uuid())
  userId           String
  amount           Float
  currency         String          @default("USD")
  provider         PaymentProvider // STRIPE or PAYPAL
  status           PaymentStatus   // PENDING, SUCCEEDED, FAILED, etc.
  stripePaymentId  String?         @unique
  paypalOrderId    String?         @unique
  subscriptionTier SubscriptionTier
  billingPeriod    String
  createdAt        DateTime        @default(now())
  paidAt           DateTime?
}
```

## Component Usage

To use the payment form in your app:

```tsx
import { PaymentForm } from '@/components/payment/payment-form'

export default function YourPage() {
  return (
    <PaymentForm
      onSuccess={() => {
        // Handle successful payment
        router.push('/dashboard?payment=success')
      }}
    />
  )
}
```

## Troubleshooting

### Stripe Issues

**"Invalid API key"**
- Verify you copied the full key including `pk_test_` or `sk_test_` prefix
- Check there are no extra spaces
- Ensure you're using test keys in development

**Webhook not receiving events**
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3070/api/webhooks/stripe`
- Verify webhook URL is publicly accessible in production
- Check webhook signing secret is correct

### PayPal Issues

**"Authorization failed"**
- Verify Client ID and Secret are correct
- Ensure you're using Sandbox credentials in development
- Check that credentials match the environment (sandbox vs live)

**Order creation fails**
- Check browser console for detailed errors
- Verify PayPal SDK is loaded correctly
- Ensure amount format is correct (string with 2 decimals)

### General Issues

**Payment succeeds but subscription not updated**
- Check database connection
- Review server logs for errors in `/api/payments/confirm`
- Verify user session is valid

**Demo mode users can't pay**
- This is intentional - demo accounts cannot make payments
- Create a real account to test payments

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never expose secret keys** in client-side code
2. **Always verify webhooks** using signature verification
3. **Validate amounts** on the server, never trust client input
4. **Use HTTPS** in production for all payment endpoints
5. **Store sensitive data** securely in environment variables
6. **Log payment events** for audit trail and debugging

## Support

For payment-related issues:
- **Stripe**: [https://support.stripe.com](https://support.stripe.com)
- **PayPal**: [https://developer.paypal.com/support](https://developer.paypal.com/support)

For application issues, contact your development team.
