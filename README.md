# Lean Projax

A Six Sigma workflow automation platform for Business Process Improvement teams. Built with Next.js 15, TypeScript, Prisma, and NextAuth.js.

## Features

### Phase 1 (Implemented)
- ✅ **Authentication System** - Role-based access control with NextAuth.js
- ✅ **Assignment Dashboard** - List, filter, and manage assignments
- ✅ **User Roles** - BPI Team, Team Lead, Executive, Process Owner
- ✅ **Database Schema** - Complete Prisma schema for all Six Sigma entities
- ✅ **Black & White Theme** - Professional, data-centric interface

### Coming Soon
- 📋 VOC/CTQ Section - Voice of Customer and Critical to Quality
- 🔄 Process Analysis - SIPOC, VSM, and Pareto charts
- 🐟 Root Cause Analysis - Fishbone diagrams and Process Capability
- ⚠️ FMEA & Recommendations - Risk assessment and solutions
- 📊 Auto-calculations - Six Sigma metrics automation
- 📄 PDF Export - Professional reports for stakeholders

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js
- **UI Components:** shadcn/ui with Tailwind CSS
- **State Management:** Zustand
- **Charts:** Recharts
- **Diagrams:** @xyflow/react (react-flow)

## Getting Started

### Prerequisites

- Node.js 18+ LTS
- PostgreSQL database (local or Docker)
- npm or pnpm

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**

   Copy `.env.example` to `.env.local` and update with your values:
   ```env
   DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/lean_projax_dev"
   NEXTAUTH_URL="http://localhost:3070"
   NEXTAUTH_SECRET="GENERATE_A_SECURE_RANDOM_STRING_HERE"
   NEXT_PUBLIC_API_URL="http://localhost:3021"
   ```

   **Important:**
   - Generate a secure `NEXTAUTH_SECRET` using: `openssl rand -base64 32`
   - Never commit real credentials to version control

3. **Start PostgreSQL** (if using Docker)
   ```bash
   docker run -d \
     -e POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD \
     -p 5432:5432 \
     --name lean-projax-postgres \
     postgres:15
   ```

4. **Initialize the database**
   ```bash
   npm run db:push    # Push schema to database
   npm run db:seed    # Add test data
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3070](http://localhost:3070)

### Test Credentials

After seeding the database, test users will be created. Check the seed script output for login credentials.

**Security Note:** Change all default passwords immediately in production environments.

## Development Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma Client
npm run db:migrate   # Create and apply migrations
npm run db:seed      # Seed test data
npm run db:studio    # Open Prisma Studio
npm run db:push      # Push schema changes (dev only)
```

## Project Structure

```
lean-projax/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   │   └── login/           # Login page
│   ├── (protected)/         # Protected routes
│   │   └── assignments/     # Assignment dashboard
│   ├── api/                 # API routes
│   │   └── auth/            # NextAuth.js endpoints
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── assignment/          # Assignment components
│   ├── layout/              # Layout components (Header)
│   ├── providers/           # Context providers
│   └── ui/                  # shadcn/ui components
├── lib/                     # Shared utilities
│   ├── auth.ts              # Auth configuration
│   ├── prisma.ts            # Prisma client
│   ├── types/               # TypeScript types
│   └── utils/               # Utility functions
├── prisma/                  # Database
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed script
└── types/                   # Type definitions
    └── next-auth.d.ts       # NextAuth types
```

## Database Schema

The platform uses a comprehensive schema supporting:

- **Users** with role-based access control
- **Assignments** with state machine (DRAFT → COMPLETED → REOPENED)
- **Processes** for multi-process analysis
- **VOC/CTQ** for customer requirements
- **SIPOC** for high-level process mapping
- **VSM** for value stream analysis
- **Fishbone** for root cause analysis (6M categories)
- **FMEA** with auto-calculated RPN scores
- **Recommendations** with traceability to root causes
- **Audit logs** for compliance tracking

## Key Features

### Role-Based Access Control

- **BPI Team:** Create and edit draft assignments
- **Team Lead:** Edit any assignment, approve, reopen
- **Executive:** View completed assignments (read-only)
- **Process Owner:** View relevant completed assignments

### Assignment Workflow

1. **Draft Mode** - Flexible editing for analysis work
2. **Mark as Complete** - Lock for stakeholder viewing
3. **Reopen** - Team leads can reopen if changes needed

### Six Sigma Methodology

The platform follows the DMAIC approach:
- **Define:** VOC/CTQ requirements
- **Measure:** Process mapping (SIPOC, VSM)
- **Analyze:** Root cause analysis (Fishbone, Pareto)
- **Improve:** FMEA and recommendations
- **Control:** Process capability metrics

## Documentation

- [PRD](../docs/prd.md) - Product Requirements Document
- [Architecture](../docs/architecture.md) - Technical Architecture
- [UX Design](../docs/ux-design.md) - User Experience Design

## License

Proprietary - All rights reserved