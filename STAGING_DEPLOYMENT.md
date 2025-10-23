# Staging Deployment with GitHub Actions + Railway

## Overview

This guide sets up **automated staging deployment** using:
- **GitHub Actions** - Automated CI/CD pipeline (`.github/workflows/deploy-staging.yml`)
- **Railway** - Hosting platform for staging environment
- **Automatic deployment** - Push to `staging` branch = auto-deploy to Railway

## ✅ What's Already Done

1. ✅ Created `staging` branch
2. ✅ GitHub Actions workflow created (`.github/workflows/deploy-staging.yml`)
3. ✅ All code quality checks passing
4. ✅ Prettier formatting applied
5. ✅ Ready for Railway setup

## 🚀 Setup Guide: Railway + GitHub Actions

### Step 1: Create Railway Projects

1. Go to https://railway.app/new
2. Click **"Empty Project"**
3. Name it: `lean-projax-staging`

### Step 2: Add PostgreSQL Database

1. In Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will provision a database
4. Note the `DATABASE_URL` (you'll need this for GitHub secrets)

### Step 3: Create Railway Services

#### Platform Service (Main App):

1. Click **"+ New"** → **"Empty Service"**
2. Name it: `platform-staging`
3. Go to **Settings** → **Environment**
4. Select or create environment: `staging`
5. Go to **Settings** → **Deploy**
6. Set:
   - **Branch**: `staging`
   - **Root Directory**: `/` (leave empty)
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
   - **Start Command**: `npm start`

#### Marketing Service:

1. Click **"+ New"** → **"Empty Service"**
2. Name it: `marketing-staging`
3. Go to **Settings** → **Environment**
4. Select: `staging`
5. Go to **Settings** → **Deploy**
6. Set:
   - **Branch**: `staging`
   - **Root Directory**: `marketing`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Step 4: Get Railway API Token

1. Go to https://railway.app/account/tokens
2. Click **"Create Token"**
3. Name it: `GitHub Actions CI/CD`
4. Copy the token (you'll add this to GitHub secrets)

### Step 5: Configure GitHub Secrets

Go to GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Click **"New repository secret"** for each:

#### Railway Configuration:
```
RAILWAY_TOKEN=<your_railway_token_from_step_4>
```

#### Staging Database:
```
STAGING_DATABASE_URL=<from_railway_postgresql_service>
```

#### Staging URLs:
```
STAGING_NEXTAUTH_URL=https://platform-staging.up.railway.app
STAGING_API_URL=https://platform-staging.up.railway.app
STAGING_APP_URL=https://platform-staging.up.railway.app
STAGING_MARKETING_URL=https://marketing-staging.up.railway.app
STAGING_PLATFORM_URL=https://platform-staging.up.railway.app
```

#### Staging Authentication:
```
STAGING_NEXTAUTH_SECRET=<generate_with_openssl_rand_-base64_32>
```

Generate with:
```bash
openssl rand -base64 32
```

#### Stripe TEST Keys (Staging):
```
STAGING_STRIPE_SECRET_KEY=sk_test_...
STAGING_STRIPE_PUBLISHABLE_KEY=pk_test_...
STAGING_STRIPE_WEBHOOK_SECRET=whsec_...
```

Get from: https://dashboard.stripe.com/test/apikeys

#### PayPal SANDBOX Keys (Staging):
```
STAGING_PAYPAL_CLIENT_ID=<sandbox_client_id>
STAGING_PAYPAL_CLIENT_SECRET=<sandbox_secret>
```

Get from: https://developer.paypal.com/developer/applications

#### Shared Secrets (Same for Staging & Production):
```
EMAIL_PROVIDER=resend
RESEND_API_KEY=<your_resend_api_key>
EMAIL_FROM=noreply@yourdomain.com
OPENAI_API_KEY=<your_openai_api_key>
```

### Step 6: Configure Railway Environment Variables

In each Railway service → **Variables** tab:

#### Platform Service Variables:
```bash
# Database (reference from PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Authentication
NEXTAUTH_URL=https://platform-staging.up.railway.app
NEXTAUTH_SECRET=<same_as_github_secret>

# URLs
NEXT_PUBLIC_API_URL=https://platform-staging.up.railway.app
NEXT_PUBLIC_APP_URL=https://platform-staging.up.railway.app
NEXT_PUBLIC_MARKETING_URL=https://marketing-staging.up.railway.app

# Email
EMAIL_PROVIDER=resend
RESEND_API_KEY=<your_resend_api_key>
EMAIL_FROM=noreply@yourdomain.com

# OpenAI
OPENAI_API_KEY=<your_openai_api_key>

# Stripe TEST Keys
STRIPE_SECRET_KEY=<sk_test_...>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<pk_test_...>
STRIPE_WEBHOOK_SECRET=<whsec_...>

# PayPal SANDBOX Keys
PAYPAL_CLIENT_ID=<sandbox_client_id>
NEXT_PUBLIC_PAYPAL_CLIENT_ID=<sandbox_client_id>
PAYPAL_CLIENT_SECRET=<sandbox_secret>
```

#### Marketing Service Variables:
```bash
NEXT_PUBLIC_APP_URL=https://platform-staging.up.railway.app
```

### Step 7: Connect GitHub to Railway

#### Option A: Use Railway GitHub Integration (Recommended)
1. In Railway project → **Settings** → **GitHub**
2. Connect your repository
3. Select branch: `staging`
4. Enable **Auto Deploy**

#### Option B: Use GitHub Actions Only
If you prefer GitHub Actions to handle deployment:
1. Keep Railway services disconnected from GitHub
2. GitHub Actions will deploy using Railway CLI
3. Ensure `RAILWAY_TOKEN` is set in GitHub secrets

### Step 8: Configure Webhooks

#### Stripe Test Webhook:
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. Endpoint URL: `https://platform-staging.up.railway.app/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy **Signing secret** (whsec_...)
6. Update `STAGING_STRIPE_WEBHOOK_SECRET` in both GitHub and Railway

#### PayPal Sandbox Webhook (Optional):
1. Go to https://developer.paypal.com/developer/applications
2. Select your sandbox app
3. Add webhook: `https://platform-staging.up.railway.app/api/webhooks/paypal`
4. Enable required events

### Step 9: Deploy to Staging

Now deployment is automatic! Just push to staging:

```bash
# From dev branch, merge to staging
git checkout staging
git merge dev
git push origin staging
```

This triggers:
1. ✅ GitHub Actions workflow runs
2. ✅ Builds and tests code
3. ✅ Deploys to Railway staging
4. ✅ Runs health checks
5. ✅ Notifies success/failure

### Step 10: Monitor Deployment

#### View GitHub Actions:
1. Go to GitHub repository → **Actions** tab
2. Click on latest **"CD - Deploy to Staging"** workflow
3. Monitor progress of each job:
   - Deploy Platform to Staging
   - Deploy Marketing to Staging
   - Staging Health Check

#### View Railway Logs:
1. Go to Railway dashboard
2. Click on `platform-staging` service
3. View **"Deployments"** tab
4. Click latest deployment → View logs

## 🧪 Testing Staging Deployment

### Verify Deployment Success:

```bash
# Check platform health
curl https://platform-staging.up.railway.app/api/health

# Check marketing site
curl https://marketing-staging.up.railway.app
```

### Manual Testing Checklist:

Visit `https://platform-staging.up.railway.app` and test:

- [ ] ✅ Homepage loads
- [ ] ✅ Demo login works
  - Email: `demo@example.com`
  - Password: `demo123`
- [ ] ✅ Create new assignment
- [ ] ✅ All DMAIC sections work
- [ ] ✅ AI Assessment generates (OpenAI integration)
- [ ] ✅ AI Chat works
- [ ] ✅ Summary page displays correctly
- [ ] ✅ Payment page loads (test mode)
- [ ] ✅ Mobile responsiveness
- [ ] ✅ No console errors

### Test Stripe (Test Mode):

1. Go to billing page
2. Use test card: `4242 4242 4242 4242`
3. Any future date, any CVC
4. Verify payment succeeds
5. Check webhook in Stripe dashboard

### Test PayPal (Sandbox):

1. Go to billing page
2. Select PayPal
3. Use sandbox account credentials
4. Complete payment flow
5. Verify in PayPal sandbox

## 🔄 Workflow: Dev → Staging → Production

### Daily Development:
```bash
# Work on feature branch
git checkout -b feature/my-feature
# Make changes
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature

# Create PR to dev branch
# Wait for CI checks to pass
# Merge PR
```

### Deploy to Staging (Weekly/Before Release):
```bash
# Merge dev to staging
git checkout staging
git pull origin staging
git merge dev
git push origin staging

# GitHub Actions automatically deploys to Railway staging
# Test thoroughly in staging
```

### Deploy to Production (After Staging Testing):
```bash
# Create PR: staging → main
# Add release notes
# Review changes carefully
# Merge PR

# GitHub Actions automatically deploys to Railway production
```

## 🔧 Troubleshooting

### Build Fails in GitHub Actions

**Check:**
1. View workflow logs in **Actions** tab
2. Look for error messages
3. Verify all GitHub secrets are set
4. Ensure `RAILWAY_TOKEN` is valid

**Common issues:**
- Missing environment variables
- TypeScript errors
- Prisma migration failures

### Railway Deployment Fails

**Check:**
1. Railway dashboard → Service → Deployments → View logs
2. Look for build/runtime errors
3. Verify environment variables in Railway

**Common issues:**
- Database connection failures (check `DATABASE_URL`)
- Missing environment variables
- Build command errors

### Health Check Fails

**Error:** "Staging platform health check returned HTTP XXX"

**Solutions:**
```bash
# 1. Check if service is running
# Go to Railway dashboard → Check service status

# 2. Verify URL is correct
# Check STAGING_PLATFORM_URL in GitHub secrets

# 3. Test manually
curl https://platform-staging.up.railway.app/api/health

# 4. Check Railway logs for errors
```

### Database Migration Errors

**Error:** "Migration failed"

**Solution:**
```bash
# Option 1: Reset staging database (safe for staging only!)
# Railway dashboard → PostgreSQL service → Data → Delete all

# Option 2: Run migration manually
# Railway dashboard → platform-staging → Connect → Run:
npx prisma migrate deploy

# Option 3: Check migration files
# Ensure prisma/migrations directory exists
```

### Webhook Not Working

**Stripe webhook fails:**
1. Check endpoint URL is correct
2. Verify `STRIPE_WEBHOOK_SECRET` matches
3. Test with Stripe CLI:
```bash
stripe listen --forward-to https://platform-staging.up.railway.app/api/webhooks/stripe
```

### Environment Variable Not Loading

**Issue:** Variable not accessible in app

**Solutions:**
```bash
# 1. Verify variable is set in Railway
# Service → Variables → Check variable exists

# 2. Redeploy service
# Railway → Service → Deployments → Redeploy

# 3. Check variable naming
# NEXT_PUBLIC_ prefix required for client-side variables
```

## 📊 Monitoring Staging

### Railway Dashboard:
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Deployments**: Deployment history and status

### GitHub Actions:
- **Workflow runs**: Deployment history
- **Build times**: Monitor CI/CD performance
- **Test results**: Quality checks

### Application Monitoring:
- **Health endpoint**: `/api/health`
- **Browser console**: Check for errors
- **Network tab**: Monitor API calls

## 🎯 Best Practices

1. **Always test in staging before production**
2. **Keep staging environment similar to production**
3. **Use test payment keys in staging (never production keys)**
4. **Monitor staging logs regularly**
5. **Clean up staging database periodically**
6. **Document any staging-specific configurations**
7. **Run full regression tests on staging before prod deploy**

## 📚 Related Documentation

- **[DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md)** - Full development process
- **[RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)** - Railway deployment details
- **[QUICK_START.md](QUICK_START.md)** - Daily workflow commands
- **[.github/workflows/deploy-staging.yml](.github/workflows/deploy-staging.yml)** - Staging CI/CD workflow
- **[.github/workflows/deploy.yml](.github/workflows/deploy.yml)** - Production CI/CD workflow

## 🚀 Quick Commands

```bash
# Deploy to staging
git checkout staging && git merge dev && git push origin staging

# Check staging logs
# Railway dashboard → platform-staging → Deployments → View logs

# Test staging health
curl https://platform-staging.up.railway.app/api/health

# View GitHub Actions
# https://github.com/alsulaihim/lean-projax-saas/actions

# Rollback staging (if needed)
git checkout staging
git reset --hard <previous_commit_hash>
git push origin staging --force
```

---

**Ready to deploy?** Push to `staging` branch and GitHub Actions will handle the rest!
