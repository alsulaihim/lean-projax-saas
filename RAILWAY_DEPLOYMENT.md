# Railway Deployment Guide

Complete guide for deploying Lean Projax to Railway.

## Prerequisites

- Railway account (https://railway.app)
- GitHub repository connected to Railway
- PostgreSQL database on Railway

## Step 1: Create Railway Project

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your `lean-projax-saas` repository
4. Railway will create a new project

## Step 2: Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will provision a PostgreSQL database
4. Note: Database URL will be automatically available as `DATABASE_URL`

## Step 3: Configure Environment Variables

Go to your project → Variables and add:

### Required Variables:

```bash
# Database (automatically set by Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Authentication
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=generate-random-32-char-string

# Email
EMAIL_PROVIDER=resend
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Payment - Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Payment - PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# URLs
NEXT_PUBLIC_API_URL=https://your-marketing-site.railway.app
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
NEXT_PUBLIC_MARKETING_URL=https://your-marketing-site.railway.app
```

### Generate NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

## Step 4: Configure Build Settings

Railway auto-detects Next.js projects. Verify these settings:

**Build Command:**
```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

**Start Command:**
```bash
npm start
```

**Install Command:**
```bash
npm install
```

## Step 5: Deploy Marketing Site (Optional)

1. Create a new service in the same project
2. Click "+ New" → "GitHub Repo"
3. Select the same repository
4. Set Root Directory: `/marketing`
5. Add environment variables:
   ```bash
   NEXT_PUBLIC_APP_URL=https://your-app.railway.app
   ```

## Step 6: Set Up Custom Domain (Optional)

1. Go to Settings → Domains
2. Click "Generate Domain" for a railway.app subdomain
3. Or add your custom domain:
   - Click "Custom Domain"
   - Enter your domain (e.g., `app.yourdomain.com`)
   - Add CNAME record to your DNS:
     - Name: `app` (or your subdomain)
     - Value: provided by Railway

## Step 7: Database Migration

Railway will automatically run migrations on deploy, but you can also run them manually:

1. Go to your database service
2. Click "Connect" → "Postgres CLI"
3. Run:
   ```bash
   npx prisma migrate deploy
   ```

## Step 8: Configure GitHub Actions for Railway

The deployment workflow is already configured in `.github/workflows/deploy.yml`.

### Add GitHub Secrets:

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the `RAILWAY_TOKEN`:

1. Get token from Railway:
   - Go to Account Settings → Tokens
   - Create a new token

2. Add to GitHub:
   - Name: `RAILWAY_TOKEN`
   - Value: your Railway token

### Add Repository Variable:

- Name: `DEPLOY_TARGET`
- Value: `railway`

## Step 9: Configure Webhook Endpoints

### Stripe Webhooks:

1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-app.railway.app/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook signing secret
5. Update `STRIPE_WEBHOOK_SECRET` in Railway

### PayPal Webhooks (if using PayPal):

1. Go to https://developer.paypal.com/developer/applications
2. Configure webhook URL: `https://your-app.railway.app/api/webhooks/paypal`
3. Enable events as needed

## Step 10: Verify Deployment

### Check Health Endpoints:

```bash
# Platform health check
curl https://your-app.railway.app/api/health

# Should return: {"status":"ok","timestamp":"..."}
```

### Test Login:

1. Visit your app URL
2. Try logging in with demo credentials:
   - Email: `demo@example.com`
   - Password: `demo123`

### Monitor Logs:

- Go to Railway dashboard
- Click on your service
- View "Deployments" tab
- Check logs for any errors

## Troubleshooting

### Database Connection Issues:

```bash
# Check if DATABASE_URL is set correctly
echo $DATABASE_URL

# Verify Prisma can connect
npx prisma db pull
```

### Build Failures:

Check Railway logs for errors:
- Missing environment variables
- TypeScript errors
- Prisma migration issues

### Common Solutions:

1. **Prisma Client errors:**
   ```bash
   npx prisma generate
   ```

2. **Migration errors:**
   ```bash
   npx prisma migrate reset
   npx prisma migrate deploy
   ```

3. **Environment variable issues:**
   - Verify all required variables are set
   - Check for typos in variable names
   - Ensure no trailing spaces

## Railway-Specific Features

### Automatic Deployments:

- Every push to `main` triggers auto-deployment
- View deployment history in Railway dashboard

### Rollback:

1. Go to Deployments tab
2. Click on a previous deployment
3. Click "Redeploy"

### Scaling:

Railway automatically scales based on your plan:
- Free tier: Limited resources
- Pro tier: More resources and custom domains

## Cost Optimization

### Free Tier Limits:
- $5 free credits per month
- Shared CPU and memory
- Limited to 500 hours

### Recommended for Production:
- Pro Plan: $20/month
- Includes:
  - More resources
  - Custom domains
  - Better performance
  - Priority support

## Security Checklist

- ✅ All secrets stored as environment variables
- ✅ NEXTAUTH_SECRET is random and secure
- ✅ Database has strong password
- ✅ HTTPS enabled (automatic on Railway)
- ✅ Webhook secrets configured
- ✅ CORS configured for marketing site

## Monitoring

### Railway Dashboard:

- View metrics (CPU, Memory, Network)
- Check deployment logs
- Monitor build times

### External Monitoring:

Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Uptime monitoring (UptimeRobot, Pingdom)

## CI/CD Pipeline

The GitHub Actions workflow handles:
1. ✅ Code quality checks (ESLint, TypeScript)
2. ✅ Security audit
3. ✅ Build validation
4. ✅ Database schema validation
5. ✅ Automatic Railway deployment

## Next Steps After Deployment

1. **Set up monitoring** - Add error tracking and uptime monitoring
2. **Configure custom domain** - Point your domain to Railway
3. **Enable HTTPS** - Automatic on Railway custom domains
4. **Set up backups** - Railway Pro includes automated backups
5. **Test payment flows** - Verify Stripe and PayPal webhooks work
6. **Load test** - Ensure app performs under load
7. **Set up staging environment** - Create separate Railway project for testing

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: https://github.com/alsulaihim/lean-projax-saas/issues

## Railway vs Vercel

Railway is chosen for this project because:
- ✅ Native PostgreSQL database support
- ✅ Better for full-stack applications
- ✅ Easier database management
- ✅ More predictable pricing
- ✅ Better for background jobs
- ❌ Vercel is great but better suited for frontend-only apps

---

**Need help?** Check the Railway documentation or open an issue on GitHub.
