# Development Workflow Guide

Complete guide for managing development, staging, and production environments with code quality standards.

## 📋 Table of Contents

1. [Environment Setup](#environment-setup)
2. [Git Branch Strategy](#git-branch-strategy)
3. [Development Process](#development-process)
4. [Code Quality Tools](#code-quality-tools)
5. [Deployment Process](#deployment-process)
6. [Railway Multi-Environment Setup](#railway-multi-environment-setup)

---

## 🌍 Environment Setup

You'll have 3 environments:

| Environment | Branch | Purpose | URL |
|------------|--------|---------|-----|
| **Development** | `dev` | Local development & testing | `localhost:3070` |
| **Staging** | `staging` | Pre-production testing | `staging.yourapp.railway.app` |
| **Production** | `main` | Live user-facing app | `app.yourdomain.com` |

### Why 3 Environments?

- **Development**: Where you write and test new features
- **Staging**: Where you test features before going live (exact copy of production)
- **Production**: Your live application that users access

---

## 🌿 Git Branch Strategy (Git Flow Simplified)

### Branch Structure:

```
main (production)
  ↑
staging (pre-production)
  ↑
dev (development)
  ↑
feature/* (your work)
```

### Branch Rules:

1. **`main`** - Production code only
   - ⛔ Never commit directly
   - ✅ Only merge from `staging` via Pull Request
   - 🚀 Auto-deploys to production Railway

2. **`staging`** - Pre-production testing
   - ⛔ Never commit directly
   - ✅ Only merge from `dev` via Pull Request
   - 🚀 Auto-deploys to staging Railway

3. **`dev`** - Active development
   - ✅ Merge feature branches here
   - ✅ Daily integration of features
   - 🚀 Can deploy to dev Railway (optional)

4. **`feature/*`** - Individual features
   - ✅ Create from `dev`
   - ✅ Work here on new features
   - ✅ Merge back to `dev` when done

---

## 🔄 Development Process (Step-by-Step)

### Step 1: Start a New Feature

```bash
# 1. Make sure you're on dev and it's up to date
git checkout dev
git pull origin dev

# 2. Create a feature branch
git checkout -b feature/payment-improvements
# OR
git checkout -b feature/add-export-pdf
# OR
git checkout -b fix/sipoc-bug

# Naming convention:
# - feature/description-of-feature
# - fix/description-of-bug
# - chore/description-of-task
```

### Step 2: Develop and Test Locally

```bash
# 1. Make your changes
# 2. Test locally at http://localhost:3070
npm run dev

# 3. Commit your changes frequently
git add .
git commit -m "feat: add PDF export functionality"

# Commit message format:
# feat: new feature
# fix: bug fix
# chore: maintenance
# docs: documentation
# style: formatting
# refactor: code restructuring
# test: adding tests
```

### Step 3: Get Code Review (Automated)

```bash
# 1. Push your feature branch
git push origin feature/payment-improvements

# 2. Create a Pull Request on GitHub
# - Go to GitHub repository
# - Click "Compare & pull request"
# - Set base: dev (not main!)
# - Add description of changes
# - Create Pull Request

# 3. CodeRabbit will automatically review your code!
# - Wait 1-2 minutes
# - Review CodeRabbit's suggestions
# - Fix any critical issues
```

### Step 4: Merge to Dev

```bash
# After CodeRabbit approval and all checks pass:

# Option A: Merge via GitHub UI
# - Click "Merge pull request" on GitHub

# Option B: Merge locally
git checkout dev
git merge feature/payment-improvements
git push origin dev

# Then delete feature branch
git branch -d feature/payment-improvements
git push origin --delete feature/payment-improvements
```

### Step 5: Test in Staging

```bash
# 1. Create PR from dev to staging
git checkout staging
git pull origin staging

# Create PR: dev → staging on GitHub
# Wait for CI checks to pass
# Merge PR

# 2. Test on staging URL
# Visit: https://staging.yourapp.railway.app
# Test all new features thoroughly
# Test with real-like data
```

### Step 6: Deploy to Production

```bash
# Only when staging is working perfectly:

# 1. Create PR from staging to main
# Create PR: staging → main on GitHub
# Add detailed release notes
# Wait for all checks

# 2. Merge to main
# This triggers production deployment!

# 3. Monitor production
# Check logs in Railway
# Test critical features
# Monitor error tracking
```

---

## 🛠️ Code Quality Tools

### What is Prettier?

**Prettier** is an automatic code formatter that makes your code look consistent and professional.

**Example:**

```javascript
// Before Prettier (messy):
function example(  x,y  ){
return x+y
}

// After Prettier (clean):
function example(x, y) {
  return x + y
}
```

### Should You Use Prettier?

**✅ YES! Benefits:**
- Automatic code formatting
- Consistent style across all files
- No debates about spacing/tabs
- Easier code reviews
- Professional-looking code

**Current Status:**
- ✅ ESLint is configured (catches bugs)
- ❌ Prettier is NOT configured (formatting)
- ✅ TypeScript is configured (type safety)

### Install Prettier (Recommended)

I'll set this up for you in the next step!

---

## 📦 Railway Multi-Environment Setup

### Step 1: Create 3 Railway Projects

1. **Production Project**
   - Name: `lean-projax-production`
   - Branch: `main`
   - URL: Custom domain

2. **Staging Project**
   - Name: `lean-projax-staging`
   - Branch: `staging`
   - URL: `staging.railway.app`

3. **Development Project** (Optional)
   - Name: `lean-projax-dev`
   - Branch: `dev`
   - URL: `dev.railway.app`

### Step 2: Configure Each Environment

For each Railway project:

1. Add PostgreSQL database
2. Configure environment variables
3. Set build command:
   ```bash
   npm install && npx prisma generate && npx prisma migrate deploy && npm run build
   ```

### Step 3: Environment-Specific Variables

**Production:**
```bash
NEXTAUTH_URL=https://app.yourdomain.com
STRIPE_SECRET_KEY=sk_live_...
PAYPAL_CLIENT_ID=live_...
```

**Staging:**
```bash
NEXTAUTH_URL=https://staging.railway.app
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=sandbox_...
```

**Development:**
```bash
NEXTAUTH_URL=http://localhost:3070
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=sandbox_...
```

---

## 🚦 Complete Workflow Example

### Scenario: Adding a new "Export to Excel" feature

```bash
# Week 1: Development
git checkout dev
git pull origin dev
git checkout -b feature/excel-export

# Code the feature...
# Test locally...

git add .
git commit -m "feat: add Excel export functionality"
git push origin feature/excel-export

# Create PR: feature/excel-export → dev
# Wait for CodeRabbit review
# Fix any issues
# Merge PR

# Week 2: Staging
# Create PR: dev → staging
# Merge to staging
# Test at https://staging.railway.app

# Week 3: Production
# Create PR: staging → main
# Add release notes
# Merge to main
# Feature is LIVE!
```

---

## 📝 Daily Workflow (Simple Version)

### As a Non-Developer, Follow This:

**Every day:**
1. Pull latest `dev` branch
2. Create feature branch
3. Make changes
4. Test locally
5. Commit and push

**Every feature:**
1. Create Pull Request to `dev`
2. Wait for CodeRabbit review
3. Fix issues if any
4. Merge to `dev`

**Every week:**
1. Merge `dev` → `staging`
2. Test on staging
3. If good, merge `staging` → `main`

---

## 🔍 Code Review with CodeRabbit

CodeRabbit automatically reviews your PRs and checks for:

- 🐛 **Bugs**: Potential errors
- 🔒 **Security**: Vulnerabilities
- 📊 **Performance**: Slow code
- 🎨 **Style**: Code formatting
- 📚 **Best Practices**: Industry standards

**How to Use CodeRabbit:**

1. Create Pull Request
2. Wait 1-2 minutes
3. Review CodeRabbit's comments
4. Address critical issues
5. Merge when approved

---

## 🎯 Quick Reference Card

### When to Create PR:

| From | To | When |
|------|-----|------|
| `feature/*` → `dev` | ✅ After feature complete & tested locally |
| `dev` → `staging` | ✅ When ready to test in staging |
| `staging` → `main` | ✅ When staging is perfect |

### Branch Protection Rules (Set on GitHub):

1. **main**:
   - ✅ Require PR reviews
   - ✅ Require status checks
   - ✅ No direct pushes

2. **staging**:
   - ✅ Require PR reviews
   - ✅ Require status checks

3. **dev**:
   - ✅ Require status checks

---

## 🆘 Common Questions

### Q: Can I push directly to dev?
**A:** Yes, but better to use feature branches and PRs for code review.

### Q: How often should I deploy to production?
**A:** Once per week or when you have tested features ready.

### Q: What if staging breaks?
**A:** Fix in `dev`, then merge to `staging` again. Never touch `main`!

### Q: Should I test on localhost?
**A:** Always! Test locally → staging → production.

### Q: What if production breaks?
**A:** Create hotfix branch from `main`, fix, PR directly to `main`.

---

## 🎓 Learning Resources

### Git & GitHub:
- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [Pull Request Tutorial](https://docs.github.com/en/pull-requests)

### Railway:
- [Railway Docs](https://docs.railway.app)
- [Multi-Environment Setup](https://docs.railway.app/guides/environments)

### Best Practices:
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)

---

## ✅ Checklist for New Features

Before merging to production, ensure:

- [ ] ✅ Feature works locally
- [ ] ✅ All tests pass
- [ ] ✅ CodeRabbit approved
- [ ] ✅ Tested in staging
- [ ] ✅ No breaking changes
- [ ] ✅ Database migrations work
- [ ] ✅ Environment variables set
- [ ] ✅ Documentation updated
- [ ] ✅ Error handling added
- [ ] ✅ Loading states added

---

**Remember:** It's better to be slow and careful than fast and broken! 🐢✨
