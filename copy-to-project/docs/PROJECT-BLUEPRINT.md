# Project Blueprint

> High-level architecture and locked decisions

---

## 🎯 PROJECT OVERVIEW

**Project Name:** [Your Project Name]

**Type:** Full-Stack Web + Mobile Application

**Purpose:** [1-2 sentence description of what this application does]

**Target Users:** [Who will use this application]

---

## 🏗️ ARCHITECTURE PATTERN

**Chosen Pattern:** [Clean Architecture / Layered Architecture / Monolith]

**Rationale:** [Why this pattern - details in DECISION-LOG.md]

### Architecture Layers:

**Frontend:**

- Next.js App Router
- React Server Components + Client Components
- shadcn/ui component library
- Tailwind CSS

**Backend:**

- NestJS framework
- Business logic in services
- Data access through repositories

**Database:**

- Supabase (PostgreSQL-compatible BaaS)
- Built-in Auth, Storage, and Real-time features

**Mobile:**

- iOS: Swift + SwiftUI
- Android: Kotlin + Jetpack Compose

---

## 📁 PROJECT STRUCTURE

```
project-root/
├── .ai/                        # AI agent configuration
│   ├── CLAUDE.md
│   ├── SESSION-CONTEXT.md
│   ├── DECISION-LOG.md
│   └── FEATURE-TRACKER.md
│
├── docs/                       # Documentation
│   ├── PROJECT-BLUEPRINT.md
│   ├── TECH-STACK.md
│   ├── CODING-STANDARDS.md
│   └── SECURITY-CHECKLIST.md
│
├── frontend/                   # Next.js application
├── backend/                    # NestJS application
├── mobile/                     # Mobile apps
├── docker/                     # Docker configurations
└── .github/workflows/          # CI/CD
```

---

## 🔐 SECURITY ARCHITECTURE

**Authentication:**

- JWT-based with refresh tokens
- Access tokens: 15 minutes
- Refresh tokens: 7 days

**Authorization:**

- Role-Based Access Control (RBAC)

**Data Protection:**

- Passwords: bcrypt hashing
- PII: Encrypted at rest
- Communications: HTTPS only

---

## 🐳 DEPLOYMENT ARCHITECTURE

**Environments:**

1. **Development:** Local Docker Compose
2. **Staging:** Cloud (mirrors production)
3. **Production:** Cloud ([Railway/GCP/AWS])

**Deployment Platform Options:**

- **Railway:** Simple, modern deployment with automatic deploys from GitHub
- **GCP:** Enterprise-scale with full control
- **AWS:** Enterprise-scale with full control

**CI/CD Pipeline:**

```
Code Push → Tests → Build → Deploy Staging → Manual Approval → Production
```

**Railway Integration** (if using Railway):

- Automatic deployments from GitHub
- Preview environments for PRs
- Database provisioning (Postgres, MySQL, Redis)
- Environment variable management
- Domain management

---

## 🔒 LOCKED DECISIONS

**These decisions are LOCKED - changing them requires major effort:**

1. **Architecture Pattern:** [Your choice]
2. **Tech Stack:** Next.js + NestJS + Supabase
3. **Component Library:** shadcn/ui
4. **Authentication:** Supabase Auth (or JWT with refresh tokens)
5. **Cloud Provider:** [Railway/GCP/AWS] + Supabase
6. **Containerization:** Docker
7. **Version Control:** GitHub

---

## 📝 CUSTOMIZATION INSTRUCTIONS

Fill in:

- [ ] Project name and purpose
- [ ] Architecture pattern choice
- [ ] Cloud provider choice (Railway, GCP, or AWS)
- [ ] Railway CLI installed (if using Railway)
- [ ] Any project-specific architectural decisions

---

[END OF PROJECT-BLUEPRINT.md]
