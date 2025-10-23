# Quick Setup Guide - Staging Deployment

## You Have GitHub & Railway MCP - Let's Get Staging Live!

### Current Status:
- ✅ GitHub Actions workflow created
- ✅ Staging branch ready
- ✅ Code merged and pushed
- ❌ Railway project not configured yet
- ❌ GitHub secrets not set yet

### 🚀 Quick Setup Steps (10-15 minutes)

---

## Step 1: Create Railway Staging Project

### Using Railway Web Dashboard:

1. **Go to Railway**: https://railway.app/new
2. **Create Empty Project**:
   - Click "Empty Project"
   - Name: `lean-projax-staging`

3. **Add PostgreSQL Database**:
   - Click "+ New" in the project
   - Select "Database" → "Add PostgreSQL"
   - Wait for provisioning (~30 seconds)
   - Click on PostgreSQL service
   - Go to "Connect" tab
   - Copy the **DATABASE_URL** (starts with `postgresql://`)
   - Save this - you'll need it for GitHub secrets

4. **Create Platform Service**:
   - Click "+ New" → "GitHub Repo"
   - Select `lean-projax-saas` repository
   - **IMPORTANT**: Set branch to `staging`
   - Service name: `platform-staging`
   - Go to Settings → Environment
   - Create/select environment: `staging`

5. **Create Marketing Service** (if you want marketing site on staging):
   - Click "+ New" → "GitHub Repo"
   - Select `lean-projax-saas` repository
   - **IMPORTANT**: Set branch to `staging`
   - Service name: `marketing-staging`
   - Go to Settings → Deploy
   - Set Root Directory: `marketing`

---

## Step 2: Get Railway API Token

1. **Go to Railway Account**: https://railway.app/account/tokens
2. **Create New Token**:
   - Click "Create Token"
   - Name: `GitHub Actions CI/CD`
   - Copy the token (starts with something long)
   - **SAVE THIS** - you can't see it again!

---

## Step 3: Generate Required Secrets

Run these commands locally:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Copy the output - you'll need it for GitHub secrets
```

---

## Step 4: Add GitHub Secrets

Go to: https://github.com/alsulaihim/lean-projax-saas/settings/secrets/actions

Click **"New repository secret"** and add each of these:

### Required Secrets:

```bash
# Railway Configuration
Name: RAILWAY_TOKEN
Value: <paste_token_from_step_2>

# Database
Name: STAGING_DATABASE_URL
Value: <paste_database_url_from_railway_postgresql>

# Authentication
Name: STAGING_NEXTAUTH_SECRET
Value: <paste_output_from_openssl_command_above>

# Staging URLs (update domain when you get Railway URL)
Name: STAGING_NEXTAUTH_URL
Value: https://platform-staging.up.railway.app

Name: STAGING_API_URL
Value: https://platform-staging.up.railway.app

Name: STAGING_APP_URL
Value: https://platform-staging.up.railway.app

Name: STAGING_MARKETING_URL
Value: https://marketing-staging.up.railway.app

Name: STAGING_PLATFORM_URL
Value: https://platform-staging.up.railway.app

# Stripe TEST Keys (get from Stripe dashboard - test mode)
Name: STAGING_STRIPE_SECRET_KEY
Value: sk_test_...

Name: STAGING_STRIPE_PUBLISHABLE_KEY
Value: pk_test_...

Name: STAGING_STRIPE_WEBHOOK_SECRET
Value: whsec_... (you'll get this after setting up webhook)

# PayPal SANDBOX Keys (get from PayPal developer)
Name: STAGING_PAYPAL_CLIENT_ID
Value: <sandbox_client_id>

Name: STAGING_PAYPAL_CLIENT_SECRET
Value: <sandbox_secret>
```

### Secrets You Already Have (use same as production):

```bash
# Email (Resend)
EMAIL_PROVIDER=resend
RESEND_API_KEY=<your_existing_key>
EMAIL_FROM=<your_existing_email>

# OpenAI
OPENAI_API_KEY=<your_existing_key>
```

---

## Step 5: Configure Railway Environment Variables

Go to Railway Dashboard → `platform-staging` service → Variables tab

### Add these variables:

```bash
# Database (reference from PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Authentication (use same values as GitHub secrets)
NEXTAUTH_URL=https://platform-staging.up.railway.app
NEXTAUTH_SECRET=<same_as_github_secret>

# URLs
NEXT_PUBLIC_API_URL=https://platform-staging.up.railway.app
NEXT_PUBLIC_APP_URL=https://platform-staging.up.railway.app
NEXT_PUBLIC_MARKETING_URL=https://marketing-staging.up.railway.app

# Email (use your existing production keys)
EMAIL_PROVIDER=resend
RESEND_API_KEY=<your_resend_key>
EMAIL_FROM=<your_email>

# OpenAI (use your existing key)
OPENAI_API_KEY=<your_openai_key>

# Stripe TEST Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (add after webhook setup)

# PayPal SANDBOX Keys
PAYPAL_CLIENT_ID=<sandbox_client_id>
NEXT_PUBLIC_PAYPAL_CLIENT_ID=<sandbox_client_id>
PAYPAL_CLIENT_SECRET=<sandbox_secret>
```

### For Marketing Service:

```bash
NEXT_PUBLIC_APP_URL=https://platform-staging.up.railway.app
```

---

## Step 6: Configure Railway Deployment Settings

### Platform Service:

Go to: Railway → `platform-staging` → Settings → Deploy

```bash
Build Command:
npm install && npx prisma generate && npx prisma migrate deploy && npm run build

Start Command:
npm start

Root Directory:
(leave empty)

Watch Paths:
(leave empty to deploy on any change)
```

### Marketing Service:

Go to: Railway → `marketing-staging` → Settings → Deploy

```bash
Build Command:
npm install && npm run build

Start Command:
npm start

Root Directory:
marketing

Watch Paths:
(leave empty)
```

---

## Step 7: Get Railway URLs

After Railway deploys (first deployment might take 5-10 minutes):

1. Go to Railway Dashboard
2. Click `platform-staging` service
3. Go to "Settings" → "Networking"
4. Click "Generate Domain"
5. Copy the URL (e.g., `platform-staging-production.up.railway.app`)
6. Update GitHub secrets with actual Railway URLs if different

Repeat for `marketing-staging` service.

---

## Step 8: Update GitHub Secrets with Actual URLs

If your Railway URLs are different from the placeholders:

1. Go to GitHub Secrets
2. Update these secrets with actual URLs:
   - `STAGING_NEXTAUTH_URL`
   - `STAGING_API_URL`
   - `STAGING_APP_URL`
   - `STAGING_MARKETING_URL`
   - `STAGING_PLATFORM_URL`

---

## Step 9: Set Up Stripe Test Webhook

1. **Get Stripe Test Keys**:
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Copy `Secret key` (sk_test_...)
   - Copy `Publishable key` (pk_test_...)
   - Add these to GitHub secrets and Railway variables

2. **Create Webhook**:
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://<your-railway-url>/api/webhooks/stripe`
   - Select events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Click "Add endpoint"
   - Copy the **Signing secret** (whsec_...)
   - Add to GitHub secret: `STAGING_STRIPE_WEBHOOK_SECRET`
   - Add to Railway variable: `STRIPE_WEBHOOK_SECRET`

---

## Step 10: Trigger Deployment

### Option A: Push to Staging (Recommended)

```bash
# Make any small change or just push again
git checkout staging
git commit --allow-empty -m "trigger: initial staging deployment"
git push origin staging
```

This triggers GitHub Actions which will:
1. Build the app
2. Run migrations
3. Deploy to Railway
4. Run health checks

### Option B: Manual Railway Deployment

Railway should auto-deploy when connected to GitHub repo on `staging` branch.

---

## Step 11: Monitor Deployment

### Watch GitHub Actions:

```bash
# View workflow runs
gh run list --branch staging --limit 5

# Watch latest run
gh run watch
```

Or visit: https://github.com/alsulaihim/lean-projax-saas/actions

### Watch Railway Logs:

1. Railway Dashboard → `platform-staging` service
2. Click "Deployments" tab
3. Click latest deployment
4. View logs in real-time

---

## Step 12: Verify Deployment

Once deployed, test these:

```bash
# Check health endpoint
curl https://<your-railway-url>/api/health

# Should return: {"status":"ok","timestamp":"..."}
```

### Manual Testing:

1. **Visit staging URL** in browser
2. **Try demo login**:
   - Email: `demo@example.com`
   - Password: `demo123`
3. **Create test assignment**
4. **Test AI features** (should work with your OpenAI key)
5. **Check all DMAIC sections**
6. **View summary page**
7. **Test on mobile device**

---

## 🎯 Quick Checklist

- [ ] Created Railway staging project
- [ ] Added PostgreSQL database to Railway
- [ ] Created platform-staging service
- [ ] Created marketing-staging service (optional)
- [ ] Got Railway API token
- [ ] Generated NEXTAUTH_SECRET
- [ ] Added all GitHub secrets (15+ secrets)
- [ ] Configured Railway environment variables
- [ ] Set deployment settings in Railway
- [ ] Generated Railway domains
- [ ] Updated GitHub secrets with actual URLs
- [ ] Set up Stripe test webhook
- [ ] Triggered deployment
- [ ] Verified health endpoint works
- [ ] Tested demo login
- [ ] Tested key features

---

## 🆘 Troubleshooting

### Build Fails in GitHub Actions

**Check:**
```bash
gh run view --log-failed
```

**Common issues:**
- Missing `STAGING_DATABASE_URL` secret
- Missing `RAILWAY_TOKEN` secret
- Verify all secrets are set

### Railway Deployment Fails

**Check Railway logs:**
- Dashboard → Service → Deployments → View logs

**Common issues:**
- Missing environment variables in Railway
- Database connection error (check `DATABASE_URL`)
- Build command error

### Database Migration Fails

**Error:** "No migrations directory found"

**Solution:** This is expected on first run. Railway will create tables on first deploy.

### Health Check Returns 404

**Likely causes:**
1. Deployment not finished yet (wait 2-3 minutes)
2. Wrong URL (check Railway dashboard for actual domain)
3. App crashed (check Railway logs)

---

## 🚀 After Setup is Complete

Future deployments are **fully automatic**:

```bash
# Develop on dev branch
git checkout dev
# make changes...
git add .
git commit -m "feat: new feature"
git push origin dev

# Deploy to staging
git checkout staging
git merge dev
git push origin staging  # ← This triggers auto-deployment!

# Monitor
gh run watch
```

---

## 📚 Need Help?

- **Detailed Guide**: [STAGING_DEPLOYMENT.md](STAGING_DEPLOYMENT.md)
- **Development Workflow**: [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md)
- **Railway Docs**: https://docs.railway.app
- **GitHub Actions Logs**: https://github.com/alsulaihim/lean-projax-saas/actions

---

**Time Estimate:** 10-15 minutes if you have all credentials ready

**You're setting up**: Fully automated CI/CD pipeline that deploys to staging on every push to `staging` branch! 🎉
