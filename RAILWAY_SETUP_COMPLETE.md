# 🚀 Railway Staging - Final Setup Steps

## ✅ What I've Done For You:

1. **Created Railway Project**: `lean-projax-staging`
   - Project ID: `60b62950-598b-428c-8438-a1d030219bf7`
   - URL: https://railway.com/project/60b62950-598b-428c-8438-a1d030219bf7

2. **Generated All Secrets**: See [.staging-secrets.txt](.staging-secrets.txt)
   - NEXTAUTH_SECRET: `QSg5smORrdPvPaRAAhioXwpfS+RJy4hUfuvMXNNMgEU=`
   - Stripe TEST keys extracted from your MCP
   - PayPal SANDBOX keys extracted from your MCP
   - OpenAI API key extracted from .env.local

3. **Created Railway Configuration**: [railway.json](railway.json)
   - Build command configured
   - Health check configured
   - Auto-restart on failure

4. **Created GitHub Actions Workflow**: [.github/workflows/deploy-staging.yml](.github/workflows/deploy-staging.yml)
   - Automatic deployment on push to `staging`
   - Database migrations included
   - Health checks included

5. **Opened Railway Dashboard**: Should be open in your browser now!

---

## 📋 What You Need To Do (5-10 minutes):

### Step 1: Add PostgreSQL Database (2 min)

**In Railway Dashboard (now open in your browser):**

1. Click **"+ New"** button
2. Select **"Database"**
3. Click **"Add PostgreSQL"**
4. Wait ~30 seconds for provisioning
5. Click on the PostgreSQL service
6. Go to **"Connect"** tab
7. Copy the **DATABASE_URL** (starts with `postgresql://`)
8. Save it - you'll need it for GitHub secrets

### Step 2: Create Platform Service (3 min)

**In Railway Dashboard:**

1. Click **"+ New"** button
2. Select **"GitHub Repo"**
3. Choose `lean-projax-saas` repository
4. **IMPORTANT**: Change branch from `main` to **`staging`**
5. Service will be named automatically (can rename to `platform-staging`)
6. Railway will start building automatically

### Step 3: Get Railway Token (1 min)

1. Open new tab: https://railway.app/account/tokens
2. Click **"Create Token"**
3. Name it: `GitHub Actions CI/CD`
4. Copy the token (starts with long string)
5. **SAVE THIS** - you can't see it again!

### Step 4: Add GitHub Secrets (3 min)

Open: https://github.com/alsulaihim/lean-projax-saas/settings/secrets/actions

Click **"New repository secret"** and add these **3 critical secrets first**:

```
Name: RAILWAY_TOKEN
Value: <paste_token_from_step_3>

Name: STAGING_DATABASE_URL
Value: <paste_database_url_from_step_1>

Name: STAGING_NEXTAUTH_SECRET
Value: QSg5smORrdPvPaRAAhioXwpfS+RJy4hUfuvMXNNMgEU=
```

**Then add these Stripe/PayPal secrets** (from [.staging-secrets.txt](.staging-secrets.txt)):

```
Name: STAGING_STRIPE_SECRET_KEY
Value: <see .staging-secrets.txt file>

Name: STAGING_STRIPE_PUBLISHABLE_KEY
Value: <see .staging-secrets.txt file>

Name: STAGING_PAYPAL_CLIENT_ID
Value: <see .staging-secrets.txt file>

Name: STAGING_PAYPAL_CLIENT_SECRET
Value: <see .staging-secrets.txt file>
```

**Add URL secrets** (update these after Railway gives you the domain):

```
Name: STAGING_NEXTAUTH_URL
Value: https://platform-staging-production.up.railway.app

Name: STAGING_API_URL
Value: https://platform-staging-production.up.railway.app

Name: STAGING_APP_URL
Value: https://platform-staging-production.up.railway.app

Name: STAGING_PLATFORM_URL
Value: https://platform-staging-production.up.railway.app

Name: STAGING_MARKETING_URL
Value: https://marketing-staging-production.up.railway.app
```

**Add remaining secrets** (you need to provide these):

```
Name: EMAIL_PROVIDER
Value: resend

Name: RESEND_API_KEY
Value: <YOUR_RESEND_API_KEY>

Name: EMAIL_FROM
Value: <YOUR_EMAIL>

Name: OPENAI_API_KEY
Value: <see .staging-secrets.txt file>

Name: STAGING_STRIPE_WEBHOOK_SECRET
Value: <GET_AFTER_WEBHOOK_SETUP>
```

### Step 5: Configure Railway Environment Variables (3 min)

**In Railway Dashboard → Platform Service → Variables tab:**

Click **"+ New Variable"** and add each:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
NEXTAUTH_URL=https://platform-staging-production.up.railway.app
NEXTAUTH_SECRET=QSg5smORrdPvPaRAAhioXwpfS+RJy4hUfuvMXNNMgEU=
NEXT_PUBLIC_API_URL=https://platform-staging-production.up.railway.app
NEXT_PUBLIC_APP_URL=https://platform-staging-production.up.railway.app
EMAIL_PROVIDER=resend
RESEND_API_KEY=<YOUR_RESEND_KEY>
EMAIL_FROM=<YOUR_EMAIL>
OPENAI_API_KEY=<see .staging-secrets.txt file>
STRIPE_SECRET_KEY=<see .staging-secrets.txt file>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<see .staging-secrets.txt file>
PAYPAL_CLIENT_ID=<see .staging-secrets.txt file>
NEXT_PUBLIC_PAYPAL_CLIENT_ID=<see .staging-secrets.txt file>
PAYPAL_CLIENT_SECRET=<see .staging-secrets.txt file>
```

### Step 6: Generate Railway Domain (1 min)

**In Railway Dashboard → Platform Service:**

1. Go to **"Settings"** tab
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"**
4. Copy the generated domain (e.g., `platform-staging-production.up.railway.app`)
5. Update GitHub secrets with the actual domain (if different from placeholders)

### Step 7: Deploy! (2 min)

```bash
git checkout staging
git add railway.json RAILWAY_SETUP_COMPLETE.md
git commit -m "feat: configure Railway deployment

- Added railway.json configuration
- Added deployment guide
- Ready for automated deployment

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin staging
```

This will trigger GitHub Actions which will:
1. ✅ Build your application
2. ✅ Run Prisma migrations
3. ✅ Deploy to Railway
4. ✅ Run health checks

### Step 8: Monitor Deployment

**Watch GitHub Actions:**
```bash
gh run watch
```

Or visit: https://github.com/alsulaihim/lean-projax-saas/actions

**Watch Railway Logs:**
- Railway Dashboard → Platform Service → Deployments tab → Click latest deployment

---

## 🧪 Testing After Deployment

### Check Health:
```bash
curl https://platform-staging-production.up.railway.app/api/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### Test Demo Login:
1. Visit: `https://platform-staging-production.up.railway.app`
2. Email: `demo@example.com`
3. Password: `demo123`

### Test Features:
- [ ] Homepage loads
- [ ] Demo mode works
- [ ] Create assignment
- [ ] AI Assessment works
- [ ] All DMAIC sections
- [ ] Summary page
- [ ] Mobile responsive

---

## 🔧 Optional: Setup Stripe Webhook

After deployment is live:

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. URL: `https://platform-staging-production.up.railway.app/api/webhooks/stripe`
4. Events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy signing secret (whsec_...)
6. Update GitHub secret: `STAGING_STRIPE_WEBHOOK_SECRET`
7. Update Railway variable: `STRIPE_WEBHOOK_SECRET`
8. Redeploy

---

## 📊 Quick Reference

### Railway Project:
- **Name**: lean-projax-staging
- **ID**: 60b62950-598b-428c-8438-a1d030219bf7
- **URL**: https://railway.com/project/60b62950-598b-428c-8438-a1d030219bf7

### GitHub Repository:
- **Repo**: https://github.com/alsulaihim/lean-projax-saas
- **Actions**: https://github.com/alsulaihim/lean-projax-saas/actions
- **Secrets**: https://github.com/alsulaihim/lean-projax-saas/settings/secrets/actions

### Branch:
- **Staging**: `staging`
- **Production**: `main`
- **Development**: `dev`

### Documentation:
- **All Secrets**: [.staging-secrets.txt](.staging-secrets.txt)
- **Deployment Guide**: [STAGING_DEPLOYMENT.md](STAGING_DEPLOYMENT.md)
- **Quick Start**: [SETUP_STAGING_NOW.md](SETUP_STAGING_NOW.md)
- **Workflow**: [.github/workflows/deploy-staging.yml](.github/workflows/deploy-staging.yml)

---

## 🎯 Summary

**What's Done:**
✅ Railway project created
✅ All secrets generated and documented
✅ GitHub Actions workflow configured
✅ Railway configuration file created
✅ Documentation complete

**What You Need:**
⏳ Add PostgreSQL database in Railway (2 min)
⏳ Create GitHub repo service in Railway (2 min)
⏳ Get Railway token (1 min)
⏳ Add GitHub secrets (3 min)
⏳ Add Railway environment variables (3 min)
⏳ Push to staging branch (1 min)

**Total Time**: ~12 minutes

**Result**: Fully automated CI/CD pipeline! Every push to `staging` = automatic deployment 🚀

---

**Need Help?** All the details are in [.staging-secrets.txt](.staging-secrets.txt) - just copy and paste!
