# Quality Gates

> Mandatory Checks Before Every Commit

---

## 🎯 Purpose

**Quality gates are STOP POINTS.** Code cannot be committed until ALL applicable checks pass.

**Why:** Catching issues early saves time, money, and reputation. Bad code in production is expensive.

---

## ✅ Pre-Commit Checklist

### 1. Code Functionality

- [ ] **Feature works** - Tested manually in browser/app
- [ ] **Happy path tested** - Normal user flow works
- [ ] **Edge cases tested** - Empty states, max values, errors
- [ ] **No console errors** - Clean browser console
- [ ] **No TypeScript errors** - `npm run type-check` passes
- [ ] **No ESLint errors** - `npm run lint` passes

### 2. Testing

- [ ] **Unit tests written** - For new functions/services
- [ ] **Unit tests passing** - `npm test` passes
- [ ] **Test coverage maintained** - No decrease in coverage %
- [ ] **Integration tests** - If touching API endpoints
- [ ] **Manual testing done** - Tested in real environment

### 3. Security

- [ ] **SECURITY-CHECKLIST.md reviewed** - Applicable items checked
- [ ] **No hardcoded secrets** - Check for API keys, passwords
- [ ] **Input validation added** - All user inputs validated
- [ ] **No SQL injection risks** - Parameterized queries only
- [ ] **Authentication checked** - Protected routes stay protected
- [ ] **Authorization verified** - Users can only access their data

### 4. Code Quality

- [ ] **CODING-STANDARDS.md followed** - Naming, structure, patterns
- [ ] **No commented code** - Remove or explain why it's there
- [ ] **No `console.log`** - Remove debug statements
- [ ] **No `any` types** - Use proper TypeScript types
- [ ] **No TODO comments** - Create tickets instead
- [ ] **DRY principle** - No duplicated logic
- [ ] **Functions < 50 lines** - Break up long functions
- [ ] **Files < 300 lines** - Split large files

### 5. Performance

- [ ] **No N+1 queries** - Check database queries
- [ ] **Proper indexing** - Database indexes for queries
- [ ] **Images optimized** - Compressed, proper format
- [ ] **No unnecessary re-renders** - React optimization
- [ ] **Lazy loading** - For large components/routes
- [ ] **Bundle size** - No significant increase

### 6. Documentation

- [ ] **Code comments** - Explain WHY, not WHAT
- [ ] **README updated** - If setup steps changed
- [ ] **API docs updated** - If endpoints changed
- [ ] **Types documented** - JSDoc for complex types
- [ ] **SESSION-CONTEXT.md updated** - Document changes

### 7. Git & Version Control

- [ ] **Branch up to date** - Pulled latest from main
- [ ] **No merge conflicts** - Resolved cleanly
- [ ] **Commit message clear** - Explains WHAT and WHY
- [ ] **Single responsibility** - Commit does one thing
- [ ] **No unnecessary files** - No build artifacts, logs

### 8. Dependencies

- [ ] **No unnecessary deps** - Justify new packages
- [ ] **No security vulnerabilities** - `npm audit` clean
- [ ] **Lock file updated** - Committed with changes
- [ ] **Bundle size impact** - Checked if adding deps

---

## 🚨 Critical Quality Gates (MUST PASS)

These are **BLOCKERS**. If any fail, **DO NOT COMMIT**.

### Gate 1: Build Success

```bash
npm run build
```

**Must:** Complete without errors
**Why:** Broken builds block everyone

### Gate 2: Type Safety

```bash
npm run type-check
```

**Must:** Zero TypeScript errors
**Why:** Type errors cause runtime bugs

### Gate 3: Linting

```bash
npm run lint
```

**Must:** Zero ESLint errors (warnings OK if justified)
**Why:** Maintains code consistency

### Gate 4: Tests

```bash
npm test
```

**Must:** All tests passing
**Why:** Broken tests = broken features

### Gate 5: Security Scan

```bash
npm audit
```

**Must:** No high/critical vulnerabilities
**Why:** Security is not negotiable

---

## 📊 Quality Metrics

### Code Coverage

- **Target:** 80% coverage minimum
- **Critical paths:** 100% coverage
- **Check:** `npm run test:cov`

### Performance Budgets

- **Initial load:** < 3 seconds
- **API response:** < 500ms (p95)
- **Bundle size:** < 500KB (gzipped)
- **Lighthouse score:** > 90

### Technical Debt

- **TODO limit:** < 10 TODOs in codebase
- **Code smells:** Zero critical (SonarQube)
- **Duplication:** < 3% (SonarQube)

---

## 🔄 Automated Quality Checks

### Git Hooks (Husky + lint-staged)

#### Pre-commit Hook

```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write", "jest --findRelatedTests"]
}
```

**Runs:**

1. ESLint with auto-fix
2. Prettier formatting
3. Tests for changed files

#### Pre-push Hook

```bash
#!/bin/sh
npm run type-check &&
npm run lint &&
npm run test &&
npm run build
```

**Runs:** Full validation before push

### CI/CD Pipeline

- **Triggered:** Every PR
- **Runs:** All quality gates
- **Blocks:** Merge if fails

---

## 🎯 Feature-Specific Gates

### New API Endpoint

- [ ] OpenAPI/Swagger docs added
- [ ] Request validation (DTO)
- [ ] Response validation
- [ ] Error handling
- [ ] Rate limiting configured
- [ ] Authentication required
- [ ] Authorization checked
- [ ] Integration test written
- [ ] Postman collection updated

### New UI Component

- [ ] Accessibility checked (WCAG 2.1 AA)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Dark mode support
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] shadcn/ui components used
- [ ] Storybook story (if using)

### Database Migration

- [ ] Migration script tested
- [ ] Rollback script ready
- [ ] Data backup plan
- [ ] Indexes added
- [ ] No breaking changes (or migration plan)
- [ ] Tested on staging
- [ ] Performance impact assessed

### Third-Party Integration

- [ ] Error handling for API failures
- [ ] Timeout configured
- [ ] Rate limiting considered
- [ ] Secrets in env vars
- [ ] API costs estimated
- [ ] Fallback behavior defined
- [ ] Documentation added

---

## 🛠️ Tools & Commands

### Quick Quality Check (Run Before Commit)

```bash
# All-in-one check
npm run pre-commit

# Or manually:
npm run type-check && \
npm run lint && \
npm run test && \
npm run build
```

### Coverage Report

```bash
npm run test:cov
open coverage/lcov-report/index.html
```

### Dependency Audit

```bash
npm audit
npm outdated
```

### Bundle Analysis

```bash
npm run build
npm run analyze  # If configured
```

---

## 🚦 When to Skip Checks (Rare)

### Acceptable Exceptions

- **Urgent hotfix:** Security vulnerability in production
- **Documentation only:** README/docs changes (still run Prettier)
- **Config changes:** Environment variables, CI config

### Never Skip

- Tests
- Type checking
- Security checklist
- Input validation

### How to Skip (If Approved)

```bash
git commit --no-verify -m "HOTFIX: Critical security patch"
```

**Note:** Requires post-commit fix and full check

---

## 📋 Quality Review Template

```markdown
## Pre-Commit Quality Check

### Functionality

- [ ] Feature works as expected
- [ ] Edge cases tested
- [ ] No console errors

### Code Quality

- [ ] Coding standards followed
- [ ] No code smells
- [ ] Proper error handling

### Security

- [ ] Security checklist reviewed
- [ ] No hardcoded secrets
- [ ] Input validation added

### Testing

- [ ] Unit tests written
- [ ] All tests passing
- [ ] Coverage maintained

### Performance

- [ ] No performance regressions
- [ ] Database queries optimized
- [ ] Bundle size acceptable

### Documentation

- [ ] Code commented
- [ ] SESSION-CONTEXT updated
- [ ] Commit message clear

**Checklist Complete:** ✅ Ready to commit
```

---

## 🎓 Quality Culture

### Team Expectations

1. **Quality is everyone's responsibility**
2. **Gates protect the team, not block it**
3. **Fix broken windows immediately**
4. **Boy Scout Rule:** Leave code better than you found it
5. **Ask for help if stuck**

### Code Review Philosophy

- **Be kind:** Critique code, not people
- **Be thorough:** Check all gates
- **Be helpful:** Suggest improvements
- **Be quick:** Review within 24 hours

---

## 📊 Quality Metrics Dashboard

### Track Monthly

- Average test coverage: \_\_\_%
- Build success rate: \_\_\_%
- Deploy frequency: \_\_\_/week
- Mean time to recovery: \_\_\_ hours
- Bug escape rate: \_\_\_%
- Technical debt ratio: \_\_\_%

---

## 🔄 Continuous Improvement

### Weekly

- Review failed quality checks
- Update gates based on issues found

### Monthly

- Team retro on quality
- Update this document
- Review quality metrics

### Quarterly

- Major quality initiatives
- Tool upgrades
- Process improvements

---

## 🆘 What If A Gate Fails?

### Build Fails

1. Check error message
2. Fix the issue
3. Test locally
4. Try again

### Tests Fail

1. Understand why (regression or bad test?)
2. Fix code or update test
3. Verify all tests pass
4. Commit

### Can't Fix Immediately

1. Create ticket for the issue
2. Get team input
3. Do NOT commit broken code
4. Work on different feature if blocked

---

**Remember:** Quality gates exist to protect you and your users. They're not obstacles—they're guardrails that prevent disasters.

---

[END OF QUALITY-GATES.md]
