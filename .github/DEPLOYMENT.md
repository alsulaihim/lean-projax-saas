# Deployment Guide - Lean Projax SaaS

> CI/CD Pipeline and Production Deployment Instructions

---

## 🚀 **CI/CD Pipeline Overview**

### **GitHub Actions Workflows:**

1. **`ci.yml`** - Runs on every push/PR
   - Code quality checks
   - Security audits
   - Database schema validation
   - Build tests

2. **`pr-check.yml`** - Runs on pull requests
   - Automated code review
   - TypeScript type checking
   - Bundle size analysis
   - PR comments with results

3. **`deploy.yml`** - Runs on merge to `main`
   - Deploys platform (port 3070)
   - Deploys marketing site (port 3071)
   - Runs database migrations
   - Health checks

---

## 📋 **Required GitHub Secrets**

### **Setup Instructions:**

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add the following secrets:

### **Database Secrets:**
```
DATABASE_URL=postgresql://user:password@host:5432/database
```

### **Authentication Secrets:**
```
NEXTAUTH_URL=https://app.yourdomain.com
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

### **Email Service Secrets:**
```
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

### **Deployment Platform Secrets:**

#### **For Vercel:**
```
VERCEL_TOKEN=<from vercel.com/account/tokens>
VERCEL_ORG_ID=<from vercel project settings>
VERCEL_PROJECT_ID=<main app project ID>
VERCEL_MARKETING_PROJECT_ID=<marketing site project ID>
```

#### **For Railway:**
```
RAILWAY_TOKEN=<from railway.app settings>
```

### **Health Check URLs:**
```
PLATFORM_URL=https://app.yourdomain.com
MARKETING_URL=https://yourdomain.com
```

---

## 🎯 **Deployment Options**

### **Option 1: Vercel (Recommended for Next.js)** ⭐

**Why Vercel:**
- Built by Next.js creators
- Zero-config Next.js deployment
- Automatic HTTPS
- Global CDN
- Serverless functions
- Free tier: Good for beta

**Setup Steps:**

1. **Create Vercel Account:** https://vercel.com
2. **Import Repository:**
   - Click "New Project"
   - Import from GitHub: `lean-projax-saas`
   - Create TWO projects:
     - Project 1: Main app (root directory)
     - Project 2: Marketing (marketing directory)

3. **Configure Environment Variables** in Vercel dashboard:
   - Add all secrets listed above
   - Different values for production vs preview

4. **Set Build Settings:**
   - **Main App:**
     - Build Command: `npm run build`
     - Output Directory: `.next`
     - Install Command: `npm ci && npx prisma generate`
   
   - **Marketing:**
     - Root Directory: `marketing`
     - Build Command: `npm run build`
     - Output Directory: `.next`

5. **Connect Domain:**
   - Platform: `app.yourdomain.com`
   - Marketing: `www.yourdomain.com` or `yourdomain.com`

6. **Done!** - Auto-deploys on every push to `main`

---

### **Option 2: Railway**

**Why Railway:**
- Simple PostgreSQL setup
- Good for full-stack apps
- Built-in database
- Affordable pricing

**Setup Steps:**

1. **Create Railway Account:** https://railway.app
2. **Create New Project**
3. **Add Services:**
   - PostgreSQL database
   - Main app (from GitHub)
   - Marketing site (from GitHub)

4. **Configure Variables:**
   - Add all environment variables
   - Railway auto-generates DATABASE_URL

5. **Deploy:**
   - Railway auto-deploys on push
   - Or use Railway CLI: `railway up`

---

### **Option 3: Docker + Cloud Provider**

**For AWS/GCP/DigitalOcean:**

Use included `docker-compose.yml` and `Dockerfile.dev`:

```bash
# Build images
docker build -t lean-projax-platform .
docker build -t lean-projax-marketing ./marketing

# Push to registry
docker push your-registry.com/lean-projax-platform
docker push your-registry.com/lean-projax-marketing

# Deploy via cloud provider
```

---

## 🔄 **Deployment Workflow**

### **Development → Production Flow:**

```
1. Developer creates feature branch
   └─> git checkout -b feature/new-feature

2. Push code, open PR
   └─> GitHub Actions runs CI checks ✅
   └─> Automated review
   └─> Build test
   └─> Security scan

3. Review & merge PR to dev
   └─> Deploy to staging (optional)

4. Merge dev to main
   └─> GitHub Actions runs deployment ✅
   └─> Deploy main app
   └─> Deploy marketing site
   └─> Run database migrations
   └─> Health checks

5. Production live! 🎉
```

---

## 🧪 **Pre-Deployment Checklist**

### **Before First Deploy:**

#### **1. Environment Variables** ✅
- [ ] All secrets added to GitHub
- [ ] Production DATABASE_URL configured
- [ ] NEXTAUTH_SECRET generated (secure)
- [ ] Email provider API key added
- [ ] URLs point to production domains

#### **2. Database** ✅
- [ ] Production PostgreSQL database created
- [ ] Connection tested
- [ ] Backups configured
- [ ] Migration plan ready

#### **3. Email Service** ✅
- [ ] Resend/SendGrid account created
- [ ] Domain verified (for production emails)
- [ ] API key added to secrets
- [ ] Test email delivery

#### **4. Domain & DNS** ✅
- [ ] Domain purchased/available
- [ ] DNS configured:
  - `app.yourdomain.com` → Platform
  - `www.yourdomain.com` → Marketing
- [ ] SSL certificates (auto via Vercel/Railway)

#### **5. Security** ✅
- [ ] All Tier 1 security features active
- [ ] Rate limiting configured
- [ ] Email verification enabled
- [ ] Security headers applied

---

## 📊 **Environment-Specific Configuration**

### **Development (.env.local):**
```env
DATABASE_URL=postgresql://leanprojax:dev_password@localhost:5435/leanprojax_dev
NEXTAUTH_URL=http://localhost:3070
NEXTAUTH_SECRET=dev-secret-not-for-production
NEXT_PUBLIC_API_URL=http://localhost:3071
EMAIL_PROVIDER=console
```

### **Production (GitHub Secrets):**
```env
DATABASE_URL=postgresql://prod_user:SECURE_PASSWORD@prod-host:5432/leanprojax_prod
NEXTAUTH_URL=https://app.yourdomain.com
NEXTAUTH_SECRET=<64-char-random-string>
NEXT_PUBLIC_API_URL=https://www.yourdomain.com
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

---

## 🎯 **Quick Start Deployment**

### **Deploy to Vercel (5 Minutes):**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy Main App:**
   ```bash
   vercel --prod
   ```

4. **Deploy Marketing:**
   ```bash
   cd marketing
   vercel --prod
   ```

5. **Set Environment Variables** in Vercel dashboard

6. **Done!** Your app is live

---

## 🔍 **Monitoring & Logs**

### **After Deployment:**

1. **Monitor deployments:**
   - GitHub Actions tab → See workflow runs
   - Vercel/Railway dashboard → See live logs

2. **Check health:**
   - Platform: https://app.yourdomain.com
   - Marketing: https://www.yourdomain.com
   - Database: Check connection from platform

3. **Setup alerts:**
   - Vercel: Email alerts for failed deployments
   - Railway: Deployment notifications
   - Sentry: Error monitoring (optional)

---

## 💰 **Estimated Costs**

### **Vercel (Hobby Plan - Free):**
- **Main App:** Free
- **Marketing:** Free
- **Total:** $0/month
- **Limits:** 100GB bandwidth, serverless functions

### **Vercel (Pro Plan):**
- **Cost:** $20/month
- **Benefits:** More bandwidth, team features, analytics

### **Railway:**
- **Free tier:** $5 credit/month
- **Database:** ~$5/month
- **Apps:** ~$5/month each
- **Total:** ~$15-20/month

### **Database (External):**
- **Supabase:** Free tier available
- **Railway PostgreSQL:** ~$5/month
- **AWS RDS:** ~$15-30/month

---

## 🚨 **Rollback Procedure**

### **If Deployment Fails:**

#### **Vercel:**
1. Go to Vercel dashboard
2. Click "Deployments"
3. Find last working deployment
4. Click "..." → "Promote to Production"

#### **Railway:**
1. Go to Railway dashboard
2. Click deployment history
3. Rollback to previous deployment

#### **Manual:**
```bash
# Revert last commit
git revert HEAD
git push origin main

# Or force push previous version
git reset --hard <previous-commit-hash>
git push --force origin main
```

---

## 📝 **Next Steps**

1. **Choose deployment platform** (Vercel recommended)
2. **Add GitHub secrets** (all environment variables)
3. **Merge to main branch** (triggers deployment)
4. **Monitor deployment** (GitHub Actions tab)
5. **Test production site** (verify all features work)
6. **Setup custom domain** (optional but recommended)

---

## ✅ **You're Ready to Deploy!**

Your code is production-ready with:
- ✅ CI/CD pipelines configured
- ✅ Automated testing
- ✅ Security scanning
- ✅ Database migrations
- ✅ Multi-environment support

**Next:** Add GitHub secrets and merge to main! 🚀

---

[END OF DEPLOYMENT.md]

