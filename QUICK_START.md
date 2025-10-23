# Quick Start Guide - For Non-Developers 🚀

Simple, step-by-step guide to work on your application every day.

---

## 📅 Daily Workflow (5 Minutes)

### Start Your Day:

```bash
# 1. Open terminal and navigate to project
cd "/Users/alsulaihim/All-Day-Dev/Lean Projax 1"

# 2. Pull latest changes
git checkout dev
git pull origin dev

# 3. Start development server
npm run dev

# 4. Open browser
# Visit: http://localhost:3070
```

---

## ✨ Adding a New Feature (Simple Version)

### Step 1: Create Feature Branch (30 seconds)

```bash
# Create new branch
git checkout -b feature/my-new-feature

# Replace "my-new-feature" with your feature name:
# Examples:
# - feature/improve-dashboard
# - feature/add-reports
# - fix/login-bug
```

### Step 2: Make Your Changes (Your time)

- Edit files in VS Code
- Test at `http://localhost:3070`
- Make sure it works!

### Step 3: Save Your Work (1 minute)

```bash
# Save all changes
git add .

# Commit with message
git commit -m "feat: describe what you changed"

# Push to GitHub
git push origin feature/my-new-feature
```

### Step 4: Create Pull Request (2 minutes)

1. Go to GitHub: https://github.com/alsulaihim/lean-projax-saas
2. Click **"Compare & pull request"** (green button)
3. Set **base:** to `dev` (not main!)
4. Write description of changes
5. Click **"Create pull request"**

### Step 5: Wait for Code Review (5 minutes)

- CodeRabbit will automatically review your code
- Fix any issues it finds
- When checks pass, click **"Merge pull request"**

---

## 🔧 Common Commands

### Development:

```bash
# Start development server
npm run dev

# Format code (make it pretty)
npm run format

# Check for errors
npm run lint

# Build for production
npm run build
```

### Database:

```bash
# Open database viewer
npm run db:studio

# Create migration
npm run db:migrate

# Push schema changes
npm run db:push
```

### Git:

```bash
# See what branch you're on
git branch

# Switch branches
git checkout dev
git checkout staging
git checkout main

# Pull latest changes
git pull origin dev

# Push your changes
git push origin your-branch-name
```

---

## 🌍 Deploying to Environments

### To Staging:

```bash
# 1. Switch to staging
git checkout staging
git pull origin staging

# 2. Create PR from dev to staging on GitHub
# 3. Merge PR
# 4. Test at: https://staging.yourapp.railway.app
```

### To Production:

```bash
# 1. Switch to main
git checkout main
git pull origin main

# 2. Create PR from staging to main on GitHub
# 3. Merge PR
# 4. Your app is LIVE! 🎉
```

---

## 🆘 Something Went Wrong?

### Can't push code:

```bash
# Pull latest changes first
git pull origin dev

# Then push again
git push origin your-branch-name
```

### Want to undo changes:

```bash
# Undo uncommitted changes
git checkout .

# Undo last commit (but keep changes)
git reset --soft HEAD~1
```

### Dev server won't start:

```bash
# Kill the server
lsof -ti:3070 | xargs kill -9

# Start again
npm run dev
```

### Database issues:

```bash
# Reset Prisma
npx prisma generate
npx prisma db push
```

---

## 📋 Pre-Deployment Checklist

Before deploying to production, check:

- [ ] ✅ Feature works on localhost
- [ ] ✅ No console errors
- [ ] ✅ CodeRabbit approved
- [ ] ✅ Tested in staging
- [ ] ✅ Database works
- [ ] ✅ All environment variables set

---

## 🎯 Your Typical Week

**Monday:**

- Start new feature
- Create branch: `git checkout -b feature/week-feature`
- Code and test locally

**Tuesday-Thursday:**

- Continue coding
- Commit changes daily
- Test frequently

**Friday:**

- Create PR to `dev`
- Merge to `dev` after review
- Test in staging over weekend

**Next Monday:**

- If staging looks good, deploy to production
- Start next feature!

---

## 💡 Pro Tips

1. **Commit often** - Save your work every hour
2. **Test locally first** - Always check `localhost:3070` before pushing
3. **Read CodeRabbit comments** - They help you learn!
4. **Use descriptive branch names** - `feature/add-pdf-export` not `feature/stuff`
5. **Ask for help** - Open GitHub issues if stuck

---

## 📞 Need Help?

- **Documentation:** Check `DEVELOPMENT_WORKFLOW.md` for detailed guide
- **Railway:** Check `RAILWAY_DEPLOYMENT.md` for deployment
- **GitHub Issues:** https://github.com/alsulaihim/lean-projax-saas/issues

---

## 🎨 Code Formatting

Before committing, format your code:

```bash
# Format all files
npm run format

# Check if code is formatted
npm run format:check
```

This makes your code look professional and consistent! ✨

---

**Remember: You're doing great! Every developer started where you are. 🌟**
