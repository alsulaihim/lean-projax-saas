# 🚀 Deploy to Railway Staging - FINAL STEPS

## Current Status:
✅ Railway project created: `lean-projax-staging`
✅ Project linked to your repository
✅ All secrets documented in `.staging-secrets.txt`
✅ Railway configuration (`railway.json`) created
✅ GitHub Actions workflow ready

## 🎯 Complete These 4 Steps (8 minutes):

Since Railway CLI requires interactive input, please complete these steps in the **Railway Web Dashboard** (already open in your browser):

---

### Step 1: Add PostgreSQL Database (2 min)

**In Railway Dashboard:** https://railway.com/project/60b62950-598b-428c-8438-a1d030219bf7

1. Click **"+ New"** button
2. Select **"Database"**
3. Click **"Add PostgreSQL"**
4. Wait ~30 seconds for provisioning
5. Click on PostgreSQL service
6. Click **"Connect"** tab
7. Copy the **`DATABASE_URL`** (starts with `postgresql://`)
8. Save it - we'll need it

---

### Step 2: Create Platform Service (3 min)

**Still in Railway Dashboard:**

1. Click **"+ New"** button
2. Select **"GitHub Repo"**
3. Click **"Configure GitHub App"** if prompted (or select repository)
4. Choose repository: **`lean-projax-saas`**
5. **CRITICAL**: Change branch from `main` to **`staging`**
6. Click **"Add Service"**
7. Service will start deploying automatically
8. Rename service to `platform-staging` (optional but recommended)

**⚠️ IMPORTANT:** Make sure branch is set to `staging`, not `main`!

---

### Step 3: Configure Environment Variables in Railway (3 min)

**In Railway Dashboard → Click on `platform-staging` service → Variables tab:**

Add these variables (copy from `.staging-secrets.txt` for actual values):

```bash
# Database - Use reference to PostgreSQL service
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Authentication
NEXTAUTH_SECRET=QSg5smORrdPvPaRAAhioXwpfS+RJy4hUfuvMXNNMgEU=

# OpenAI - Get from .staging-secrets.txt
OPENAI_API_KEY=<from_.staging-secrets.txt>

# Stripe TEST Keys - Get from .staging-secrets.txt
STRIPE_SECRET_KEY=<from_.staging-secrets.txt>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<from_.staging-secrets.txt>

# PayPal SANDBOX Keys - Get from .staging-secrets.txt
PAYPAL_CLIENT_ID=<from_.staging-secrets.txt>
NEXT_PUBLIC_PAYPAL_CLIENT_ID=<from_.staging-secrets.txt>
PAYPAL_CLIENT_SECRET=<from_.staging-secrets.txt>

# Email (Use your production Resend credentials)
EMAIL_PROVIDER=resend
RESEND_API_KEY=<your_resend_key>
EMAIL_FROM=<your_email>
```

**After deployment completes, get the Railway URL and add these URL variables:**

```bash
# URLs - Update with your actual Railway domain
NEXTAUTH_URL=https://platform-staging-production.up.railway.app
NEXT_PUBLIC_API_URL=https://platform-staging-production.up.railway.app
NEXT_PUBLIC_APP_URL=https://platform-staging-production.up.railway.app
```

**💡 Tip:** After adding all variables, Railway will automatically redeploy.

---

### Step 4: Generate Domain & Test (2 min)

**Get your deployment URL:**

1. In Railway Dashboard → `platform-staging` service
2. Go to **"Settings"** tab
3. Scroll to **"Networking"** section
4. Click **"Generate Domain"**
5. Copy the generated domain (e.g., `platform-staging-production.up.railway.app`)
6. Update the URL variables in Step 3 with this domain
7. Railway will redeploy automatically

**Test the deployment:**

```bash
# Check health endpoint
curl https://your-railway-domain.up.railway.app/api/health

# Should return: {"status":"ok","timestamp":"..."}
```

**Test in browser:**
1. Visit: `https://your-railway-domain.up.railway.app`
2. Try demo login:
   - Email: `demo@example.com`
   - Password: `demo123`

---

## ✅ After Deployment is Live:

### Optional: Set Up GitHub Secrets for CI/CD

If you want GitHub Actions to deploy automatically on push:

1. Get Railway API Token: https://railway.app/account/tokens
2. Go to GitHub Secrets: https://github.com/alsulaihim/lean-projax-saas/settings/secrets/actions
3. Add secret:
   - Name: `RAILWAY_TOKEN`
   - Value: `<your_railway_token>`

Then any push to `staging` branch will trigger automated deployment!

### Optional: Set Up Stripe Webhook

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. URL: `https://your-railway-domain.up.railway.app/api/webhooks/stripe`
4. Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, etc.
5. Copy webhook secret
6. Add to Railway variables: `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## 📊 Quick Reference

### Railway Project:
- **URL**: https://railway.com/project/60b62950-598b-428c-8438-a1d030219bf7
- **Project**: `lean-projax-staging`
- **Branch**: `staging`

### Secrets File:
- **All credentials**: `.staging-secrets.txt` (in your project root)

### What to Test:
- [ ] Health endpoint returns 200
- [ ] Demo login works
- [ ] Create assignment
- [ ] AI features work
- [ ] All DMAIC sections
- [ ] Summary page
- [ ] Mobile responsive

---

## 🎯 Summary

**Time Required:** 8 minutes

**Steps:**
1. Add PostgreSQL (2 min)
2. Create GitHub service (3 min)
3. Add environment variables (3 min)
4. Generate domain & test (2 min)

**Result:** Fully deployed staging environment on Railway! 🎉

**Need the secrets?** Open `.staging-secrets.txt` - everything is there!

---

## 🆘 Troubleshooting

**Build fails:**
- Check Railway logs in Deployments tab
- Verify all environment variables are set
- Make sure branch is `staging`, not `main`

**Can't connect to database:**
- Verify `DATABASE_URL=${{Postgres.DATABASE_URL}}` is set
- Make sure PostgreSQL service is running
- Check PostgreSQL wasn't created in a different environment

**Health check fails:**
- Wait 2-3 minutes for full deployment
- Check deployment logs for errors
- Verify domain is generated

---

**Ready?** Open Railway dashboard and follow the 4 steps above! 🚀

Railway Dashboard: https://railway.com/project/60b62950-598b-428c-8438-a1d030219bf7
