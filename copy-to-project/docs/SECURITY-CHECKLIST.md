# Security Checklist
> OWASP Top 10 & Security Best Practices - Check EVERY Feature

---

## 🎯 Purpose

This checklist must be completed for EVERY feature before it's considered done. Security is not optional.

**Rule:** If you can't check all applicable boxes, the feature is not ready for production.

---

## ✅ Universal Security Requirements

### Authentication & Authorization
- [ ] **Authentication implemented** - Users must prove identity
- [ ] **Authorization checks** - Users can only access their own data
- [ ] **JWT tokens** - Short expiration (15min for access, 7 days for refresh)
- [ ] **Password requirements** - Min 8 chars, uppercase, lowercase, number
- [ ] **Password hashing** - bcrypt with 10+ rounds (never plain text)
- [ ] **Refresh token rotation** - New token on each refresh
- [ ] **Token stored securely** - HttpOnly cookies or secure storage
- [ ] **Session timeout** - Auto-logout after inactivity
- [ ] **No credentials in code** - Use environment variables

### Input Validation
- [ ] **All inputs validated** - Frontend AND backend
- [ ] **Use validation library** - class-validator (NestJS), Zod (Next.js)
- [ ] **Whitelist approach** - Define what's allowed, reject everything else
- [ ] **Sanitize user input** - Escape HTML, SQL, etc.
- [ ] **File upload validation** - Type, size, and content checks
- [ ] **Max length limits** - Prevent buffer overflow attacks
- [ ] **Type checking** - Ensure correct data types

### SQL Injection Prevention
- [ ] **Parameterized queries ONLY** - Never string concatenation
- [ ] **Use ORM** - TypeORM or Prisma (they handle this)
- [ ] **No raw queries** - Or if needed, sanitize inputs
- [ ] **Least privilege DB user** - Limited permissions
- [ ] **Input validation** - Even for query parameters

### XSS (Cross-Site Scripting) Prevention
- [ ] **Escape user content** - Before rendering HTML
- [ ] **Content Security Policy** - CSP headers configured
- [ ] **No dangerouslySetInnerHTML** - Or sanitize with DOMPurify
- [ ] **Validate URLs** - Before redirects or href attributes
- [ ] **HttpOnly cookies** - Prevent JavaScript access

### CSRF (Cross-Site Request Forgery) Prevention
- [ ] **CSRF tokens** - For state-changing operations
- [ ] **SameSite cookies** - Set to 'Strict' or 'Lax'
- [ ] **Verify Origin header** - Check request origin
- [ ] **Double-submit cookies** - Additional CSRF protection

---

## 🔐 API Security

### Endpoint Protection
- [ ] **Rate limiting** - Prevent brute force and DoS
- [ ] **API authentication** - JWT or API keys required
- [ ] **CORS configured** - Whitelist allowed origins
- [ ] **HTTPS only** - No HTTP in production
- [ ] **Request size limits** - Prevent payload attacks
- [ ] **Timeout limits** - Prevent hanging requests

### Data Exposure
- [ ] **Sensitive data filtered** - Never return passwords, tokens
- [ ] **Error messages sanitized** - No stack traces in production
- [ ] **Logging secure** - No sensitive data in logs
- [ ] **GraphQL depth limits** - Prevent nested query attacks (if using GraphQL)
- [ ] **Pagination required** - No unlimited result sets

### API Keys & Secrets
- [ ] **Secrets in env vars** - Never in code
- [ ] **Separate keys per env** - Dev, staging, prod
- [ ] **Key rotation plan** - Document how to rotate
- [ ] **No keys in frontend** - Use backend proxy
- [ ] **`.env` in `.gitignore`** - Never commit secrets

---

## 🗄️ Database Security

### Access Control
- [ ] **Principle of least privilege** - Minimal DB permissions
- [ ] **Separate DB users** - Per service/environment
- [ ] **No root/admin access** - From application
- [ ] **Connection encryption** - SSL/TLS for DB connections
- [ ] **Strong DB passwords** - Long, complex, rotated

### Data Protection
- [ ] **Encrypt sensitive data** - PII, payment info, etc.
- [ ] **Soft deletes** - Keep audit trail
- [ ] **Backup strategy** - Regular automated backups
- [ ] **Backup encryption** - Encrypt backup files
- [ ] **Access logs** - Track who accessed what data

---

## 📱 Frontend Security

### Client-Side Protection
- [ ] **No sensitive logic in frontend** - Use backend
- [ ] **Minify & obfuscate** - Production builds
- [ ] **No console.logs** - Remove debug statements
- [ ] **Secure localStorage usage** - Avoid for sensitive data
- [ ] **Third-party scripts** - Audit all external scripts
- [ ] **Subresource Integrity** - SRI for CDN resources

### Form Security
- [ ] **Client validation** - User experience
- [ ] **Server validation** - ALWAYS (never trust client)
- [ ] **Hidden fields protected** - Can be tampered with
- [ ] **Autocomplete disabled** - For sensitive fields
- [ ] **CAPTCHA for public forms** - Prevent bots

---

## 🌐 Network & Infrastructure

### HTTPS & Certificates
- [ ] **HTTPS enforced** - Redirect HTTP to HTTPS
- [ ] **Valid SSL certificate** - Not self-signed in production
- [ ] **HSTS header** - Force HTTPS
- [ ] **Certificate expiration monitoring** - Auto-renewal

### Headers Security
```typescript
// Required security headers
{
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}
```

- [ ] **Security headers configured** - See above
- [ ] **Remove server signature** - Hide tech stack
- [ ] **Disable directory listing** - No folder browsing

---

## 🔄 Session Management

### Session Security
- [ ] **Secure session storage** - Server-side or encrypted
- [ ] **Session expiration** - Auto-timeout after inactivity
- [ ] **Session regeneration** - After login/privilege change
- [ ] **Single session per user** - Or concurrent session limits
- [ ] **Logout functionality** - Properly destroys session

---

## 📦 Dependencies & Supply Chain

### Third-Party Code
- [ ] **Audit npm packages** - `npm audit` run regularly
- [ ] **Update dependencies** - Patch vulnerabilities
- [ ] **Minimize dependencies** - Less attack surface
- [ ] **Verify package integrity** - Check hashes
- [ ] **Review package permissions** - What they access
- [ ] **Use lock files** - package-lock.json, yarn.lock

---

## 🚨 Error Handling & Logging

### Error Management
- [ ] **Graceful error handling** - Try-catch everywhere
- [ ] **Generic error messages** - To users
- [ ] **Detailed logs** - For developers (secure)
- [ ] **No stack traces** - In production responses
- [ ] **Error monitoring** - Sentry, LogRocket, etc.

### Logging Best Practices
- [ ] **Log security events** - Logins, failures, access
- [ ] **No sensitive data logged** - Passwords, tokens, PII
- [ ] **Centralized logging** - Easy to monitor
- [ ] **Log rotation** - Prevent disk fill
- [ ] **Access control on logs** - Who can view

---

## 📱 Mobile Security (iOS/Android)

### App Security
- [ ] **Code obfuscation** - ProGuard, R8 (Android)
- [ ] **Root/jailbreak detection** - Warn or block
- [ ] **Certificate pinning** - Prevent MITM attacks
- [ ] **Secure storage** - Keychain (iOS), KeyStore (Android)
- [ ] **No hardcoded secrets** - Use secure storage
- [ ] **Biometric authentication** - Face ID, Touch ID option

---

## 🧪 Security Testing

### Pre-Deployment Testing
- [ ] **Automated security scans** - SAST tools
- [ ] **Dependency vulnerability scan** - Snyk, npm audit
- [ ] **Penetration testing** - For critical features
- [ ] **Authentication testing** - Try to bypass
- [ ] **Authorization testing** - Access other user's data
- [ ] **Input fuzzing** - Random/malicious inputs

---

## 🚀 Production Deployment

### Pre-Launch Checklist
- [ ] **Environment variables set** - All secrets configured
- [ ] **HTTPS configured** - Valid certificates
- [ ] **Security headers** - All headers set
- [ ] **Rate limiting enabled** - Prevent abuse
- [ ] **Monitoring configured** - Error tracking, logging
- [ ] **Backup tested** - Can restore from backup
- [ ] **Incident response plan** - Know what to do if breached
- [ ] **Security contacts** - Who to notify

### Post-Launch Monitoring
- [ ] **Monitor failed logins** - Detect brute force
- [ ] **Monitor API usage** - Detect anomalies
- [ ] **Security log review** - Regular audits
- [ ] **Vulnerability scanning** - Ongoing
- [ ] **Update dependencies** - Monthly at minimum

---

## 📋 Feature-Specific Checklists

### User Registration
- [ ] Email validation
- [ ] Password strength enforcement
- [ ] Email verification required
- [ ] Rate limit signup attempts
- [ ] CAPTCHA on public signup
- [ ] No user enumeration (same error for email exists)

### User Login
- [ ] Rate limit login attempts
- [ ] Account lockout after X failures
- [ ] Secure password comparison (bcrypt.compare)
- [ ] Session created securely
- [ ] Log login attempts (success & failure)
- [ ] 2FA option (if high security)

### Password Reset
- [ ] Secure token generation (crypto.randomBytes)
- [ ] Token expiration (15-30 minutes)
- [ ] Rate limit reset requests
- [ ] No user enumeration
- [ ] Invalidate old sessions on reset
- [ ] Email confirmation of reset

### File Upload
- [ ] File type validation (whitelist)
- [ ] File size limits
- [ ] Scan for malware (ClamAV)
- [ ] Store outside webroot
- [ ] Generate random filenames
- [ ] Serve via CDN or proxy

### Payment Processing
- [ ] PCI-DSS compliance (if storing cards)
- [ ] Use payment gateway (Stripe, PayPal)
- [ ] Never store raw card numbers
- [ ] HTTPS required
- [ ] Transaction logging
- [ ] Fraud detection

---

## 🔄 Regular Security Maintenance

### Weekly
- [ ] Review failed login attempts
- [ ] Check error logs for anomalies

### Monthly
- [ ] Update dependencies
- [ ] Review access logs
- [ ] Security audit of new features

### Quarterly
- [ ] Rotate API keys
- [ ] Security training for team
- [ ] Review and update this checklist

---

## 🆘 Incident Response

### If Security Breach Detected:
1. **Contain** - Isolate affected systems
2. **Assess** - Determine scope and impact
3. **Notify** - Users, stakeholders, authorities (if required)
4. **Fix** - Patch vulnerability
5. **Monitor** - Watch for further attacks
6. **Document** - Write incident report
7. **Improve** - Update security measures

---

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [NestJS Security](https://docs.nestjs.com/security/helmet)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)

---

**Remember:** Security is not a feature, it's a requirement. When in doubt, ask for a security review.

---

[END OF SECURITY-CHECKLIST.md]
