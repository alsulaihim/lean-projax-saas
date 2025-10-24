# Lean Projax - Six Sigma Workflow Automation Platform

A comprehensive SaaS platform for Business Process Improvement teams to create professional Six Sigma DMAIC project reports.

## 🚀 Quick Start

```bash
# Development
npm run dev
# Visit: http://localhost:3070

# Build for production
npm run build:prod

# Format code
npm run format
```

---

## 📋 Table of Contents

- [Current Setup](#current-setup)
- [Deployments](#deployments)
- [Repository Structure](#repository-structure)
- [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
- [Recent Changes](#recent-changes)
- [Demo Mode](#demo-mode)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Current Setup

### Tech Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Email**: Resend
- **Payments**: Stripe + PayPal
- **Hosting**: Railway
- **CI/CD**: GitHub Actions (configured, needs Railway token fix)

### Project Structure

```
/Lean Projax 1/                    # Main SaaS application
├── app/                           # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, signup)
│   ├── (protected)/              # Protected routes (assignments, dashboard)
│   ├── (public)/                 # Public pages (demo-login)
│   ├── api/                      # API routes
│   │   ├── admin/                # Admin endpoints (seed, verify)
│   │   ├── ai/                   # AI features (chat, assessment)
│   │   ├── payments/             # Stripe/PayPal
│   │   └── webhooks/             # External webhooks
│   ├── demo/                     # Demo mode routes
│   ├── pricing/                  # Pricing page
│   └── page.tsx                  # Marketing landing page
├── components/                    # React components
├── lib/                          # Utilities and configs
├── prisma/                       # Database schema and seeds
├── public/images/                # Static assets
└── marketing/                    # Separate marketing site (not deployed)
```

---

## 🌐 Deployments

### Production/Staging Environment

**URL**: https://lean-projax-saas-production.up.railway.app

**Platform**: Railway
**Project ID**: 60b62950-598b-428c-8438-a1d030219bf7
**Branch**: `staging` (auto-deploys on push)
**Database**: Railway PostgreSQL (internal)

**Deployment Process**:
1. Push to `staging` branch
2. GitHub detects push
3. Railway auto-builds and deploys
4. Takes ~2-3 minutes

**Access**:
- Railway Dashboard: https://railway.com/project/60b62950-598b-428c-8438-a1d030219bf7
- Health Check: https://lean-projax-saas-production.up.railway.app/api/health

### Local Development

**URL**: http://localhost:3070
**Port**: 3070 (configured in package.json)
**Database**: Local PostgreSQL (localhost:5435)
**Database Name**: `leanprojax_dev`

---

## 🌳 Repository Structure

### GitHub Repository
**URL**: https://github.com/alsulaihim/lean-projax-saas

### Branches

| Branch | Purpose | Deploys To | Status |
|--------|---------|------------|--------|
| `dev` | Local development | Localhost | Active ✅ |
| `staging` | Pre-production testing | Railway | Active ✅ |
| `main` | Production (future) | Not set up yet | Planned |

### Git Workflow

```bash
# 1. Work on dev branch
git checkout dev
# Make changes...

# 2. Test locally
npm run dev
npm run build

# 3. Merge to staging when ready
git checkout staging
git merge dev
git push origin staging

# 4. Railway auto-deploys (2-3 min)
# Test at: https://lean-projax-saas-production.up.railway.app

# 5. When staging is stable, merge to main (future)
git checkout main
git merge staging
git push origin main
```

---

## 🔐 Environment Variables

### Local (.env.local)

Located at: `/Users/alsulaihim/All-Day-Dev/Lean Projax 1/.env.local`

**Required Variables**:
```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5435/leanprojax_dev

# NextAuth
NEXTAUTH_URL=http://localhost:3070
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# OpenAI
OPENAI_API_KEY=<your-key>

# Stripe (Test Keys)
STRIPE_SECRET_KEY=sk_test_<your-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_<your-key>
STRIPE_WEBHOOK_SECRET=whsec_<your-key>

# PayPal (Sandbox)
PAYPAL_CLIENT_ID=<sandbox-client-id>
NEXT_PUBLIC_PAYPAL_CLIENT_ID=<sandbox-client-id>
PAYPAL_CLIENT_SECRET=<sandbox-secret>

# Email (Resend)
EMAIL_PROVIDER=resend
RESEND_API_KEY=<your-key>
EMAIL_FROM=noreply@yourdomain.com

# URLs
NEXT_PUBLIC_API_URL=http://localhost:3070/api
NEXT_PUBLIC_APP_URL=http://localhost:3070
```

### Railway (Production/Staging)

**How to Access**:
1. Go to Railway Dashboard
2. Click on your service
3. Navigate to **Variables** tab

**Production Variables**:
```bash
# Database (Auto-provided by Railway)
DATABASE_URL=postgresql://postgres:viDXtbIGlbYrecJywucqkyltOPFAeuWn@postgres.railway.internal:5432/railway

# NextAuth
NEXTAUTH_URL=https://lean-projax-saas-production.up.railway.app
NEXTAUTH_SECRET=<generated-secret>

# Admin (for seeding and management)
ADMIN_SECRET=6TD4nnJQCyXWHCTJstC3Ns5t8FkZXhE2tx1NTdH59z0=

# Email (Resend - Production)
EMAIL_PROVIDER=resend
RESEND_API_KEY=<your-production-key>
EMAIL_FROM=onboarding@resend.dev

# Stripe (Test for Staging, Live for Production)
STRIPE_SECRET_KEY=sk_test_<your-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_<your-key>
STRIPE_WEBHOOK_SECRET=<from-stripe-dashboard>

# PayPal (Sandbox for Staging)
PAYPAL_CLIENT_ID=<sandbox-id>
NEXT_PUBLIC_PAYPAL_CLIENT_ID=<sandbox-id>
PAYPAL_CLIENT_SECRET=<sandbox-secret>

# OpenAI
OPENAI_API_KEY=<your-key>

# URLs
NEXT_PUBLIC_API_URL=https://lean-projax-saas-production.up.railway.app/api
NEXT_PUBLIC_APP_URL=https://lean-projax-saas-production.up.railway.app
```

---

## 👨‍💻 Development Workflow

### Daily Development

```bash
# 1. Start on dev branch and pull latest from staging
git checkout dev
git pull origin staging

# 2. Start dev server
npm run dev
# Visit: http://localhost:3070

# 3. Make your changes...

# 4. Test locally
npm run format        # Format code
npm run build        # Check for build errors

# 5. Commit changes
git add .
git commit -m "feat: your feature description"

# 6. Push to staging when ready
git checkout staging
git merge dev
git push origin staging

# 7. Wait for Railway deploy (2-3 min)
# Test at: https://lean-projax-saas-production.up.railway.app
```

### Check if Local Matches Staging

```bash
# Pull latest from staging
git checkout staging
git pull origin staging

# Check for differences
git fetch origin staging
git log HEAD..origin/staging --oneline

# If empty = you're up to date ✅
```

### Running Database Seeds

**Local**:
```bash
# Seed demo user and assignment
npx tsx prisma/seed-demo.ts

# Reset demo data
npx tsx prisma/reset-demo.ts
```

**Production (Railway)**:
```bash
# Seed demo user via API
curl -X POST https://lean-projax-saas-production.up.railway.app/api/admin/seed-demo \
  -H "Content-Type: application/json" \
  -d '{"adminSecret": "6TD4nnJQCyXWHCTJstC3Ns5t8FkZXhE2tx1NTdH59z0="}'

# Seed full demo data
curl -X POST https://lean-projax-saas-production.up.railway.app/api/admin/seed-full-demo \
  -H "Content-Type: application/json" \
  -d '{"adminSecret": "6TD4nnJQCyXWHCTJstC3Ns5t8FkZXhE2tx1NTdH59z0="}'
```

---

## 📦 Recent Changes (October 24, 2025)

### Major Features Implemented

1. **Railway Staging Deployment** ✅
   - Deployed to Railway at `lean-projax-saas-production.up.railway.app`
   - Fixed 6+ deployment errors (turbopack, npm cache, Stripe API, TypeScript)
   - Changed from `prisma migrate deploy` to `prisma db push`
   - Added build-time placeholder env vars for Next.js

2. **Email Verification (Resend)** ✅
   - Set up Resend API integration
   - Email verification for new signups
   - Test sender: `onboarding@resend.dev`
   - Working in production

3. **Marketing Pages** ✅
   - **Landing Page** (`/`): Hero section, features, CTAs
   - **Pricing Page** (`/pricing`): Free, Pro ($29/mo), Enterprise tiers with FAQ
   - **Hero Image**: Updated to artistic Japanese ink style illustration
   - All logos point to homepage (not localhost)

4. **Demo Mode** ✅
   - Demo user: `demo@leanprojax.com` / `demo123`
   - Full assignment: "Customer Service Response Time Improvement"
   - Complete DMAIC data:
     - 3 VOC statements
     - 3 CTQ requirements
     - 3 Processes (Support Ticket, Email, Chat workflows)
     - Complete SIPOC diagrams
     - VSM (Value Stream Mapping)
     - Fishbone diagrams (6M analysis)
     - FMEA entries with RPN
     - 4 Recommendations with cost savings
   - Admin seed endpoints for production

5. **Admin Endpoints** ✅
   - `/api/admin/verify-user` - Manually verify user accounts
   - `/api/admin/seed-demo` - Create demo user with basic data
   - `/api/admin/seed-full-demo` - Full demo with all DMAIC data
   - Protected with `ADMIN_SECRET`

6. **User Account Management** ✅
   - Main account: `nasser.khalid@me.com` (verified and working)
   - Demo account: `demo@leanprojax.com` (seeded with full data)

### Files Changed

Key files modified in today's session:

```
app/page.tsx                                  # Marketing landing page
app/pricing/page.tsx                          # NEW: Pricing page
app/(auth)/login/page.tsx                     # Fixed logo links
app/(public)/demo-login/page.tsx              # Fixed logo links
app/demo/layout.tsx                           # Fixed TypeScript errors
app/api/admin/verify-user/route.ts            # NEW: Manual user verification
app/api/admin/seed-demo/route.ts              # NEW: Demo seeding
app/api/admin/seed-full-demo/route.ts         # NEW: Full demo seeding
app/api/payments/confirm/route.ts             # Updated Stripe API version
app/api/payments/create-stripe-intent/route.ts # Updated Stripe API version
app/api/webhooks/stripe/route.ts              # Updated Stripe API version
nixpacks.toml                                 # Railway build config
railway.json                                  # Railway deployment config
package.json                                  # Added prod scripts
public/images/hero-six-sigma.png              # NEW: Hero image
```

### Build Errors Fixed

1. ✅ Turbopack incompatibility with Railway
2. ✅ npm cache conflicts with Railway mounts
3. ✅ Stripe API version mismatch (2024 → 2025)
4. ✅ TypeScript type errors in demo layout
5. ✅ Missing NEXTAUTH_SECRET at build time
6. ✅ Missing STRIPE_SECRET_KEY at build time

---

## 🎭 Demo Mode

### Accessing Demo Mode

**Production URL**: https://lean-projax-saas-production.up.railway.app/demo-login

**Credentials**:
- Email: `demo@leanprojax.com`
- Password: `demo123`

### Demo Features

The demo includes a complete Six Sigma project:

**Project**: Customer Service Response Time Improvement

**Objective**: Reduce average customer service response time from 48 hours to under 24 hours

**Includes**:
- ✅ Charter with stakeholders, timeline, business case
- ✅ VOC Analysis (3 customer segments)
- ✅ CTQ Requirements (3 metrics)
- ✅ Process Mapping (3 processes)
- ✅ SIPOC Diagrams
- ✅ Value Stream Mapping
- ✅ Fishbone Analysis (6M method)
- ✅ FMEA with RPN calculations
- ✅ Recommendations with cost savings

### Demo Data Location

- User: Seeded via `/api/admin/seed-demo` or `prisma/seed-demo.ts`
- Assignment ID: Check Railway logs or database
- Data persists across deployments

---

## 🔧 Troubleshooting

### Common Issues

**Issue**: "localhost:3071 doesn't match staging"
**Solution**: Use **localhost:3070** (configured port). Kill any old servers on 3071.

```bash
# Check what's running
lsof -i :3070 -i :3071

# Kill old server
kill <PID>

# Start fresh
npm run dev
```

---

**Issue**: "No assignments yet" in demo mode
**Solution**: Seed the demo data

```bash
# Production
curl -X POST https://lean-projax-saas-production.up.railway.app/api/admin/seed-full-demo \
  -H "Content-Type: application/json" \
  -d '{"adminSecret": "6TD4nnJQCyXWHCTJstC3Ns5t8FkZXhE2tx1NTdH59z0="}'
```

---

**Issue**: Railway build fails
**Solution**: Check the logs in Railway dashboard

Common fixes:
- Ensure `NEXTAUTH_SECRET` is set in Railway variables
- Ensure `ADMIN_SECRET` is set
- Verify `DATABASE_URL` is correct
- Check for TypeScript errors: `npx tsc --noEmit`

---

**Issue**: Email verification not sending
**Solution**: Check Resend API key

```bash
# Verify in Railway Variables tab:
RESEND_API_KEY=re_your_key
EMAIL_FROM=onboarding@resend.dev
EMAIL_PROVIDER=resend
```

---

**Issue**: Demo login fails
**Solution**: Check if demo user exists in production

```bash
# Verify demo user
curl https://lean-projax-saas-production.up.railway.app/api/health
```

---

**Issue**: Changes not showing on staging
**Solution**:

1. Verify code is pushed to staging branch
2. Check Railway dashboard for deployment status
3. Clear browser cache (Cmd+Shift+R)
4. Wait 2-3 minutes for full deployment

---

## 📚 Documentation Files

Additional setup guides created:

- `RAILWAY_VARIABLES_SETUP.md` - How to add env vars in Railway
- `RESEND_EMAIL_SETUP.md` - Email service setup guide
- `STAGING_DEPLOYMENT.md` - Complete staging deployment guide
- `DEVELOPMENT_WORKFLOW.md` - Full development workflow
- `QUICK_START.md` - Daily workflow commands

---

## 🎯 Next Steps

### Immediate Priorities

1. **Fix GitHub Actions CI/CD**
   - Issue: "Project Token not found"
   - Solution: Create Railway service token (not project token)
   - Update GitHub secret `RAILWAY_TOKEN`

2. **Set up Production Environment**
   - Create separate Railway project for production
   - Point `main` branch to production
   - Use live Stripe/PayPal keys
   - Add custom domain

3. **Stripe Webhook Setup**
   - After custom domain, create webhook in Stripe dashboard
   - Get webhook signing secret
   - Add to Railway: `STRIPE_WEBHOOK_SECRET`

4. **Custom Domain**
   - Purchase domain (e.g., leanprojax.com)
   - Add to Railway settings
   - Update environment URLs

### Feature Roadmap

- [ ] Team collaboration features
- [ ] PDF export for reports
- [ ] Advanced AI analysis
- [ ] Real-time collaboration
- [ ] Custom branding
- [ ] API integrations

---

## 👥 Team

**Developer**: Nasser Al-Sulaihim
**Email**: nasser.khalid@me.com
**Platform**: Lean Projax - Six Sigma Workflow Automation

---

## 📝 Important Commands

```bash
# Development
npm run dev                    # Start dev server (port 3070)
npm run build                  # Build for production
npm run format                 # Format code with Prettier

# Database
npx prisma studio              # Open database GUI (port 5555)
npx prisma migrate dev         # Create migration
npx prisma generate            # Generate Prisma client
npx prisma db push             # Push schema without migrations

# Railway
railway status                 # Check Railway connection
railway logs                   # View deployment logs
railway variables              # List environment variables

# Process Management
ps aux | grep node             # Find running Node processes
lsof -i :3070                  # Check port 3070
kill <PID>                     # Kill specific process
pkill -f "next-server"         # Kill all Next.js servers
```

---

**Last Updated**: October 24, 2025
**Session Summary**: Railway staging deployment, demo mode setup, marketing pages, email verification

---

## 🚨 Important Notes

### Multiple Dev Servers Running

You currently have multiple dev servers running. To clean up:

```bash
# Find all node processes
ps aux | grep "next-server"

# Kill specific process
kill <PID>

# Or kill all Next.js servers
pkill -f "next-server"

# Then start fresh
npm run dev
```

### Correct Local URL

**Use**: http://localhost:3070 ✅
**Don't use**: http://localhost:3071 ❌ (old server with outdated code)

The configured port in `package.json` is **3070**.
