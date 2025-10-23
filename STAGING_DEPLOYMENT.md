# Staging Deployment Checklist

## ✅ Completed Steps

1. ✅ Created `staging` branch
2. ✅ Merged `dev` branch to `staging` (225 files, 12,484 insertions)
3. ✅ Pushed `staging` branch to GitHub
4. ✅ All code quality checks passing
5. ✅ Prettier formatting applied
6. ✅ CodeRabbit configuration ready

## 🚀 Next Steps: Deploy to Railway

### Step 1: Create Railway Staging Project

1. Go to https://railway.app/new
2. Click **"Deploy from GitHub repo"**
3. Select `lean-projax-saas` repository
4. **Important**: Set the branch to `staging` (not main!)
5. Name the project: `lean-projax-staging`

### Step 2: Add PostgreSQL Database

1. In Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will provision a database
4. Database URL will be available as `${{Postgres.DATABASE_URL}}`

### Step 3: Configure Environment Variables

Go to your Railway project → **Variables** tab and add:

```bash
# Database (auto-set by Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Authentication
NEXTAUTH_URL=https://lean-projax-staging.up.railway.app
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Email (Use same as production)
EMAIL_PROVIDER=resend
RESEND_API_KEY=<your_resend_api_key>
EMAIL_FROM=noreply@yourdomain.com

# OpenAI (Use same key or separate staging key)
OPENAI_API_KEY=<your_openai_api_key>

# Payment - Stripe TEST Keys
STRIPE_SECRET_KEY=<sk_test_...>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<pk_test_...>
STRIPE_WEBHOOK_SECRET=<whsec_test_...>

# Payment - PayPal SANDBOX Keys
PAYPAL_CLIENT_ID=<sandbox_client_id>
NEXT_PUBLIC_PAYPAL_CLIENT_ID=<sandbox_client_id>
PAYPAL_CLIENT_SECRET=<sandbox_secret>

# URLs
NEXT_PUBLIC_API_URL=https://lean-projax-staging.up.railway.app
NEXT_PUBLIC_APP_URL=https://lean-projax-staging.up.railway.app
NEXT_PUBLIC_MARKETING_URL=https://lean-projax-staging.up.railway.app
```

### Step 4: Configure Build Settings

Railway should auto-detect Next.js. Verify these settings in **Settings** → **Build**:

**Build Command:**
```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

**Start Command:**
```bash
npm start
```

**Root Directory:** `/` (leave empty)

### Step 5: Deploy

1. Railway will automatically start deploying
2. Monitor logs in **Deployments** tab
3. Wait for "Deployment successful" message
4. Note the Railway URL (e.g., `lean-projax-staging.up.railway.app`)

### Step 6: Run Database Migrations

After first deployment:

1. Go to Railway dashboard
2. Click on your service
3. Click **"Deployments"** tab
4. Migrations should run automatically
5. Verify in logs: "Migration complete"

Alternatively, run manually:
1. Click **"Connect"** in PostgreSQL service
2. Use Railway CLI or database GUI
3. Run: `npx prisma migrate deploy`

### Step 7: Configure Stripe Test Webhooks

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. Endpoint URL: `https://lean-projax-staging.up.railway.app/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy **Signing secret** (whsec_...)
6. Update `STRIPE_WEBHOOK_SECRET` in Railway

### Step 8: Configure PayPal Sandbox Webhooks (Optional)

1. Go to https://developer.paypal.com/developer/applications
2. Select your sandbox app
3. Add webhook URL: `https://lean-projax-staging.up.railway.app/api/webhooks/paypal`
4. Enable required events

### Step 9: Verify Deployment

#### Check Health Endpoint:
```bash
curl https://lean-projax-staging.up.railway.app/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

#### Test Login:
1. Visit: `https://lean-projax-staging.up.railway.app`
2. Try demo login:
   - Email: `demo@example.com`
   - Password: `demo123`

#### Test Key Features:
- [ ] Login/Authentication works
- [ ] Demo mode works
- [ ] Assignment creation
- [ ] AI-Powered Assessment (OpenAI integration)
- [ ] All DMAIC sections render correctly
- [ ] Summary page displays properly
- [ ] Payment pages load (test mode)
- [ ] Navigation between pages
- [ ] Mobile responsiveness

### Step 10: Monitor Logs

In Railway dashboard:
1. Click on your service
2. Go to **"Deployments"** tab
3. Click on the latest deployment
4. Monitor logs for any errors

## 🔧 Troubleshooting

### Build Fails

**Check logs for:**
- Missing environment variables
- TypeScript errors
- Prisma migration issues

**Solution:**
```bash
# Verify all required env vars are set in Railway
# Check Settings → Variables
```

### Database Connection Issues

**Error:** "Can't reach database server"

**Solution:**
1. Verify `DATABASE_URL` is set to `${{Postgres.DATABASE_URL}}`
2. Check PostgreSQL service is running
3. Restart deployment

### Prisma Client Errors

**Error:** "PrismaClient is unable to be run in the browser"

**Solution:**
```bash
# Railway should run this automatically, but verify:
npx prisma generate
```

### 404 Errors

**Error:** Pages return 404

**Solution:**
1. Check build logs completed successfully
2. Verify `npm run build` succeeded
3. Check start command is `npm start`

### OpenAI Integration Not Working

**Error:** AI Assessment fails

**Solution:**
1. Verify `OPENAI_API_KEY` is set in Railway
2. Check OpenAI API quota/billing
3. Test with: `curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"`

## 📊 Post-Deployment Checklist

After staging is live, verify:

- [ ] ✅ Application loads without errors
- [ ] ✅ Database connection works
- [ ] ✅ Authentication flow complete
- [ ] ✅ Demo mode functional
- [ ] ✅ AI features working (OpenAI)
- [ ] ✅ All DMAIC tools render correctly
- [ ] ✅ Summary page displays properly
- [ ] ✅ Payment pages accessible (test mode)
- [ ] ✅ No console errors in browser
- [ ] ✅ Mobile layout responsive
- [ ] ✅ Health endpoint returns 200

## 🎯 Testing Guide for Staging

### Critical User Flows to Test:

1. **Demo User Flow:**
   - Visit staging URL
   - Click "Try Demo"
   - Explore demo assignment
   - Test all DMAIC sections
   - Test AI Assessment
   - Verify Summary page

2. **Registration Flow:**
   - Create new account
   - Verify email works (check Resend logs)
   - Complete onboarding

3. **Assignment Creation:**
   - Create new assignment
   - Fill Project Charter
   - Add VOC/CTQ
   - Create Process Map (SIPOC)
   - Test VSM, Fishbone, FMEA
   - Add Recommendations
   - Generate Summary

4. **AI Features:**
   - Generate AI Assessment
   - Use AI Chat
   - Verify recommendations are relevant

5. **Payment Flow (Test Mode):**
   - Go to billing page
   - Test Stripe checkout (use test card: 4242 4242 4242 4242)
   - Test PayPal sandbox
   - Verify webhook events

## 🚀 Ready for Production?

Once staging is tested and stable:

1. Create PR: `staging` → `main`
2. Add detailed release notes
3. Merge to `main`
4. Deploy to production Railway
5. Monitor production logs

## 📞 Support

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **Issues:** https://github.com/alsulaihim/lean-projax-saas/issues

---

**Current Status:** Staging branch pushed to GitHub, ready for Railway deployment.

**Next Action:** Follow Step 1 above to create Railway staging project.
