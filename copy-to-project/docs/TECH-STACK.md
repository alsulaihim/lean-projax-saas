# Tech Stack Specification

> Exact versions and configurations

---

## 🔧 CORE TECHNOLOGIES

### Frontend

- **Next.js:** `^14.x.x` (App Router)
- **React:** `^18.x.x`
- **TypeScript:** `^5.x.x`
- **shadcn/ui:** Latest
- **Tailwind CSS:** `^3.x.x`

### Backend

- **NestJS:** `^10.x.x`
- **Node.js:** `^20.x.x` (LTS)
- **TypeScript:** `^5.x.x`
- **Supabase:** Latest (PostgreSQL-compatible BaaS)
- **Supabase Client:** `@supabase/supabase-js` `^2.x.x`

### Mobile

- **iOS:** Swift ^5.x, SwiftUI, iOS 15.0+
- **Android:** Kotlin ^1.9.x, Jetpack Compose, Min SDK 24

---

## 🔐 Security & Authentication

- **bcrypt:** `^5.x.x` (password hashing, 10 rounds)
- **jsonwebtoken:** `^9.x.x`
- **@nestjs/jwt:** Latest
- **@nestjs/passport:** Latest

---

## 🐳 DevOps & Deployment

- **Docker:** `^24.x` or `^25.x`
- **Docker Compose:** `^2.x`
- **GitHub Actions:** Latest

**Cloud Platforms:** [Choose one or combine]

- **Railway:** Modern deployment platform (recommended for rapid deployment)
- **GCP (Google Cloud Platform):** Enterprise-grade infrastructure
- **AWS (Amazon Web Services):** Enterprise-grade infrastructure

---

## 🧪 Testing & Quality

- **Jest:** `^29.x.x`
- **Testing Library:** `@testing-library/react`
- **Playwright:** `^1.x.x` OR **Cypress:** `^13.x.x`
- **ESLint:** `^8.x.x`
- **Prettier:** `^3.x.x`

---

## 🔌 Port Allocation

**IMPORTANT:** Define ports at project initialization to avoid conflicts across projects.

```bash
# Define these ports when starting the project:
FRONTEND_PORT=[DEFINE_AT_INIT]        # Example: 3000
BACKEND_PORT=[DEFINE_AT_INIT]         # Example: 3001
DATABASE_PORT=[DEFINE_AT_INIT]        # Example: 5432
REDIS_PORT=[DEFINE_AT_INIT]           # Example: 6379 (if using Redis)
```

**Common Port Ranges by Project Type:**

- **Development:** 3000-3999
- **Staging:** 4000-4999
- **Services:** 5000-5999
- **Local Services:** 54321... (Supabase local, if using)
- **Testing:** 8000-8999

---

## 🌍 Environment Variables

```bash
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:[BACKEND_PORT]/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend
NODE_ENV=development
PORT=[BACKEND_PORT]

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Authentication (if not using Supabase Auth)
JWT_SECRET=your-secret-change-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
BCRYPT_SALT_ROUNDS=10

# Optional: Redis (if using)
REDIS_HOST=localhost
REDIS_PORT=[REDIS_PORT]
```

---

## 📝 CUSTOMIZATION INSTRUCTIONS

Fill in during project initialization:

- [ ] **Port allocation** - Define all ports to avoid conflicts
- [ ] Exact version numbers when initializing
- [ ] **Supabase project** - Create project and get URL/keys
- [ ] **Cloud platform** - Choose Railway, GCP, or AWS
- [ ] **Railway setup** - Install Railway CLI if using Railway
- [ ] E2E testing tool (Playwright or Cypress)
- [ ] Replace all `[BACKEND_PORT]`, etc. with actual port numbers
- [ ] Update Supabase URLs and keys in environment variables

---

[END OF TECH-STACK.md]
