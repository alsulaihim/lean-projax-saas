# CodeRabbit Security Fixes - Action Required

## ✅ COMPLETED

### Critical Security Issues
- [x] XSS vulnerability in PDF generation - Added escapeHtml() function
- [x] Filename sanitization for PDF export - Prevents path traversal
- [x] Filename sanitization for HTML export - Prevents path traversal

## 🔴 CRITICAL - Fix Immediately

### 1. Hardcoded Database Credentials
**Files to check:**
- [ ] All test scripts and seed files
- [ ] Environment example files (.env.example)
- [ ] README.md documentation
- [ ] Any configuration files

**Action:** Replace all hardcoded credentials with environment variables

### 2. Missing Authentication on Endpoints
- [ ] `/api/assignments/[id]/export/route.ts` - Add authentication check
- [ ] Check all other API routes for auth middleware

### 3. Privilege Escalation - userId from Request Body
**Files:**
- [ ] All API routes accepting `userId` in request body
- [ ] Should use authenticated user's ID from session instead

**Pattern to find:**
```typescript
const { userId } = await request.json() // WRONG
const userId = user.id // CORRECT (from session)
```

### 4. Remove Hardcoded Secrets
- [ ] Remove hardcoded JWT secrets
- [ ] Remove fallback JWT secrets in production
- [ ] Remove session cookies from version control
- [ ] Check `.gitignore` includes all sensitive files

### 5. Field Name Mismatches
- [ ] Audit log field names don't match schema
- [ ] Process field names inconsistent
- [ ] Fix all schema mismatches

## 🟠 HIGH PRIORITY

### 6. Input Validation
Add validation for:
- [ ] SIPOC entry fields
- [ ] VSM step fields
- [ ] Fishbone cause fields
- [ ] FMEA entry fields
- [ ] Process capability numeric inputs
- [ ] All PATCH/POST endpoints

### 7. Null Safety Checks
- [ ] Add null checks before accessing `oldProcess`
- [ ] Add null checks for `oldEntry`
- [ ] Add null checks for user object access
- [ ] Check all optional chaining usage

### 8. Race Conditions
- [ ] Category creation race condition (fishbone)
- [ ] Status reset timeout race condition
- [ ] Fetch-then-update pattern in recommendations

### 9. Transaction Safety
- [ ] Wrap data deletion in transactions
- [ ] Wrap fishbone creation in transactions
- [ ] Use transactions for SIPOC operations
- [ ] Optimize with bulk inserts where possible

## 🟡 MEDIUM PRIORITY

### 10. Type Safety Issues
- [ ] Replace `any` types with proper interfaces
- [ ] Fix type annotations for step/item parameters
- [ ] Add proper JWT payload validation
- [ ] Fix ref type mismatch in AlertTitle

### 11. Error Handling
- [ ] Add user feedback for update failures
- [ ] Add user feedback for delete failures
- [ ] Add user feedback for API failures
- [ ] Handle logout errors
- [ ] Add error handling for onConfirm failures
- [ ] Handle partial row creation failures

### 12. Code Quality
- [ ] Remove debug console.log statements
- [ ] Replace alert() with proper UI feedback
- [ ] Extract category name mapping (avoid duplication)
- [ ] Replace inline rating logic with capability.ts functions
- [ ] Fix JSON.stringify for deep equality checks
- [ ] Fix dependency array infinite loops

### 13. Configuration Issues
- [ ] Fix inconsistent dark mode configuration
- [ ] Add timeout configuration for Puppeteer
- [ ] Don't disable TypeScript/ESLint in production builds

## 🔵 LOW PRIORITY / REFACTORING

### 14. Refactoring Suggestions
- [ ] Improve type safety in helper functions
- [ ] Add ref forwarding for form components
- [ ] Optimize database operations
- [ ] Handle non-existent recommendation gracefully
- [ ] Chart renders empty when showDistribution is false

### 15. Documentation & Comments
- [ ] Fix misleading password field label
- [ ] Fix misleading comments
- [ ] Update README security warnings

## 🛠️ SPECIFIC FIXES NEEDED

### Regex Injection Vulnerability
- [ ] Fix regex in formula substitution (CRITICAL)

### SIPOC Table Rendering
- [ ] Fix SIPOC table rendering logic

### Process Name Matching
- [ ] Fix process name matching behavior

### Line Color vs Legend
- [ ] Fix Pareto chart line color/legend mismatch

### View-Level Access Control
- [ ] Add view-level access control checks

### Test Endpoint Security
- [ ] Remove or secure test endpoints before production

### Database Query Logging
- [ ] Remove DATABASE_URL logging
- [ ] Avoid logging sensitive query data

## 📋 VERIFICATION CHECKLIST

Before deploying to production:
- [ ] All CRITICAL issues resolved
- [ ] All HIGH PRIORITY issues resolved
- [ ] Security audit completed
- [ ] All hardcoded credentials removed
- [ ] All API routes have authentication
- [ ] All inputs are validated
- [ ] All transactions are atomic
- [ ] Error handling is comprehensive
- [ ] Type safety is enforced
- [ ] No sensitive data in logs

## 🔍 Files Requiring Immediate Attention

1. `/lib/pdf-generation.ts` - Apply escapeHtml to ALL user data
2. All API route files - Add authentication
3. All files with userId in request body
4. `.env.example` - Remove sensitive defaults
5. `README.md` - Remove hardcoded credentials
6. All seed/test scripts - Remove credentials
7. `next.config.js` - Re-enable TypeScript/ESLint
8. All audit log operations - Fix field names
