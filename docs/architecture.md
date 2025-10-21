# BPI Assignment Platform - Fullstack Architecture Document

**Version:** 1.0
**Date:** 2025-09-30
**Prepared by:** Winston (Architect) 🏗️

---

## Introduction

This document outlines the complete fullstack architecture for BPI Assignment Platform, a Next.js-based web application that automates Six Sigma assignment reporting for Business Process Improvement teams. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

### Starter Template

**Decision:** Vanilla Next.js 14+ with App Router (Greenfield project)

We'll use `create-next-app` with TypeScript and Tailwind CSS as the foundation, manually configuring Prisma, NextAuth.js, and shadcn/ui according to PRD specifications. This provides maximum control while following established patterns.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-09-30 | 1.0 | Initial architecture document created from PRD v1.0 | Winston (Architect) |
| 2025-09-30 | 1.1 | Added react-flow for visual Six Sigma diagrams | Winston (Architect) |

---

## High Level Architecture

### Technical Summary

The BPI Assignment Platform is a **monolithic Next.js 14+ application with serverless API routes** deployed on Vercel with PostgreSQL database hosted on Supabase. The architecture follows a **Jamstack pattern** with server-side rendering for initial page loads and client-side navigation thereafter. The frontend uses React 18+ with TypeScript strict mode, shadcn/ui components, and Zustand for state management. The backend implements REST API routes as serverless Edge functions handling business logic, Prisma ORM for database access, and NextAuth.js for authentication. Key integration points include automated chart generation using Recharts, interactive Six Sigma diagrams via react-flow (Fishbone, SIPOC, Process Flow, Traceability graphs), PDF exports via Puppeteer, and real-time auto-save with optimistic UI updates. This architecture achieves PRD goals of 60-70% time reduction through calculation automation, sub-2-second page loads, and support for 20+ concurrent users while maintaining a $200/month operational budget.

### Platform and Infrastructure Choice

**Platform:** Vercel + Supabase
**Key Services:**
- **Hosting:** Vercel (Next.js native platform with automatic deployments)
- **Database:** Supabase PostgreSQL 15+ with Prisma ORM
- **Authentication:** NextAuth.js with Supabase as credentials provider
- **File Storage:** Vercel Blob for PDF exports (future: CSV uploads)
- **CDN:** Vercel Edge Network for static assets
- **CI/CD:** Vercel Git integration with preview deployments

**Deployment Host and Regions:** Vercel Global Edge Network (primary: US East)

**Rationale:** Vercel provides seamless Next.js deployment with zero configuration, automatic HTTPS, and preview environments for every PR. Supabase offers PostgreSQL with built-in connection pooling, real-time subscriptions (future use), and stays within budget (<$25/month for 500MB database + 2GB bandwidth). Combined operational cost: ~$40/month (well under $200 limit).

### Repository Structure

**Structure:** Monorepo (single Next.js project)
**Monorepo Tool:** Native Next.js project structure (no Turborepo/Nx needed for single app)
**Package Organization:** Feature-based folders within `/app` for routes, `/components` for UI, `/lib` for business logic, `/prisma` for database schema

**Rationale:** With one developer and a tightly coupled full-stack application, a simple monorepo structure maximizes velocity. Next.js App Router naturally organizes code by feature (assignments, processes, auth), eliminating need for complex workspace tooling.

### High Level Architecture Diagram

```mermaid
graph TB
    User[User Browser] -->|HTTPS| Vercel[Vercel Edge Network]
    Vercel -->|Static Assets| CDN[CDN Cache]
    Vercel -->|Dynamic Requests| NextJS[Next.js App Router]

    NextJS -->|Server Components| Pages[Page Components]
    NextJS -->|API Routes| API[API Routes - Serverless]

    API -->|Prisma Client| DB[(Supabase PostgreSQL)]
    API -->|Authentication| Auth[NextAuth.js]
    API -->|PDF Generation| Puppeteer[Puppeteer Service]

    Pages -->|Client Components| React[React 18 + Zustand]
    React -->|API Calls| API
    React -->|Charts| Recharts[Recharts Library]

    Auth -->|Session| DB

    style Vercel fill:#000,stroke:#fff,color:#fff
    style NextJS fill:#333,stroke:#fff,color:#fff
    style DB fill:#3ecf8e,stroke:#fff,color:#000
```

### Architectural Patterns

- **Jamstack Architecture:** Server-side rendering with serverless API routes - _Rationale:_ Optimal performance, automatic scaling, and cost efficiency for data-driven applications with moderate traffic
- **Component-Based UI:** Reusable React Server and Client Components with TypeScript interfaces - _Rationale:_ Maintainability, type safety, and clear boundaries between server/client logic in App Router
- **Repository Pattern:** Data access layer abstracts Prisma queries behind service classes - _Rationale:_ Testability, separation of concerns, and future flexibility for caching or database changes
- **REST API with Resource-Based Routing:** Standard HTTP methods on `/api/assignments`, `/api/processes` endpoints - _Rationale:_ Simplicity, ubiquitous tooling support, and alignment with Next.js conventions
- **Optimistic UI Updates:** Client state updates before server confirmation with rollback on error - _Rationale:_ Perceived performance improvement for auto-save and real-time interactions
- **State Machine Pattern:** Explicit assignment status transitions (DRAFT → COMPLETED → REOPENED) - _Rationale:_ Workflow integrity and clear audit trails for compliance

---

## Tech Stack

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|-----------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.3+ | Type-safe development | Strict mode catches errors at compile time, critical for calculation accuracy (NFR2) |
| Frontend Framework | Next.js | 14.1+ | Full-stack React framework | App Router with RSC, built-in API routes, automatic code splitting, Vercel-optimized |
| UI Component Library | shadcn/ui | Latest | Accessible component primitives | Radix UI primitives + Tailwind, customizable black/white theme, WCAG AA compliant |
| State Management | Zustand | 4.5+ | Client-side global state | Lightweight (1KB), no boilerplate, perfect for unsaved changes tracking and user session |
| Backend Language | TypeScript | 5.3+ | Shared types across stack | Single language reduces context switching, enables type sharing via `/lib/types` |
| Backend Framework | Next.js API Routes | 14.1+ | Serverless API endpoints | Collocated with frontend, automatic deployment, Edge runtime support |
| API Style | REST | - | HTTP-based API | Simple, stateless, well-understood; tRPC unnecessary for this scale |
| Database | PostgreSQL | 15+ | Relational database | ACID compliance for financial data integrity, JSON fields for flexibility, mature ecosystem |
| ORM | Prisma | 5.9+ | Type-safe database client | Auto-generated types from schema, migration management, connection pooling |
| Cache | React Query | 5.0+ | Server state management | Automatic caching, request deduplication, optimistic updates, stale-while-revalidate |
| File Storage | Vercel Blob | Latest | PDF and CSV storage | Integrated with Vercel, simple API, included in Pro plan |
| Authentication | NextAuth.js | 5.0+ | Session management | Supports credentials provider, JWT/database sessions, role-based access control |
| Frontend Testing | Vitest | 1.2+ | Unit test runner | Fast, Vite-powered, Jest-compatible API, ESM native |
| Backend Testing | Vitest | 1.2+ | API integration tests | Same tool as frontend for consistency, supports supertest-style API testing |
| E2E Testing | Playwright | 1.41+ | End-to-end workflows | Cross-browser testing, built-in test runner, trace viewer for debugging |
| Build Tool | Next.js Compiler | 14.1+ | Production builds | Rust-based SWC compiler, minification, tree-shaking built-in |
| Bundler | Turbopack | 14.1+ | Development bundler | Fast HMR, incremental bundling (Next.js 14 default) |
| IaC Tool | N/A | - | Infrastructure as code | Vercel/Supabase managed services require no IaC for MVP |
| CI/CD | Vercel Git Integration | Latest | Automated deployments | Automatic preview deployments per PR, production deployment on merge to main |
| Monitoring | Vercel Analytics | Latest | Web vitals & metrics | Built-in performance monitoring, Core Web Vitals tracking |
| Logging | Vercel Logs | Latest | Application logs | Centralized logging with search, Edge Function logs included |
| Error Tracking | Sentry | Latest | Error monitoring | Client/server error capture, source maps, release tracking (optional but recommended) |
| CSS Framework | Tailwind CSS | 3.4+ | Utility-first styling | Rapid development, small bundle size with purging, shadcn/ui integration |
| Charting Library | Recharts | 2.10+ | Data visualization | React-native charts, composable API, supports Pareto/bell curve requirements |
| Diagram Library | @xyflow/react (react-flow) | 12.0+ | Interactive diagrams | Node-based diagrams for Fishbone, SIPOC visual, Process Flow, Traceability graphs |
| PDF Generation | Puppeteer | 21.11+ | Server-side PDF export | Headless Chrome for high-fidelity PDF rendering of charts and react-flow diagrams |

---

## Data Models

### User

**Purpose:** Represents system users with role-based access (BPI Team, Team Lead, Executive, Process Owner)

**Key Attributes:**
- `id`: string (UUID) - Primary identifier
- `email`: string (unique) - Login credential and identifier
- `name`: string - Display name
- `role`: UserRole enum - Access control designation
- `passwordHash`: string - Bcrypt hashed password
- `createdAt`: DateTime - Account creation timestamp
- `updatedAt`: DateTime - Last profile update

**TypeScript Interface:**

```typescript
enum UserRole {
  BPI_TEAM = 'BPI_TEAM',
  TEAM_LEAD = 'TEAM_LEAD',
  EXECUTIVE = 'EXECUTIVE',
  PROCESS_OWNER = 'PROCESS_OWNER'
}

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Relationships:**
- One-to-many with Assignment (as creator)
- One-to-many with AuditLog (as actor)

---

### Assignment

**Purpose:** Top-level container for Six Sigma analysis projects with state machine workflow

**Key Attributes:**
- `id`: string (UUID) - Primary identifier
- `title`: string - Assignment name
- `objective`: string - Business goal description
- `status`: AssignmentStatus enum - Workflow state (DRAFT, COMPLETED, REOPENED)
- `createdById`: string (FK to User) - Creator reference
- `completedAt`: DateTime | null - Completion timestamp
- `createdAt`: DateTime - Creation timestamp
- `updatedAt`: DateTime - Last modification timestamp

**TypeScript Interface:**

```typescript
enum AssignmentStatus {
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED',
  REOPENED = 'REOPENED'
}

interface Assignment {
  id: string;
  title: string;
  objective: string;
  status: AssignmentStatus;
  createdById: string;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  createdBy?: User;
  processes?: Process[];
  vocStatements?: VOCStatement[];
  ctqRequirements?: CTQRequirement[];
  fmeaEntries?: FMEAEntry[];
  recommendations?: Recommendation[];
}
```

**Relationships:**
- Many-to-one with User (creator)
- One-to-many with Process
- One-to-many with VOCStatement, CTQRequirement
- One-to-many with FMEAEntry, Recommendation
- One-to-many with AuditLog

---

### Process

**Purpose:** Individual process being analyzed within an assignment (supports multi-process analysis)

**Key Attributes:**
- `id`: string (UUID) - Primary identifier
- `assignmentId`: string (FK to Assignment) - Parent assignment
- `processName`: string - Process identifier
- `processOwner`: string | null - Responsible manager name
- `order`: number - Display sequence
- `lowerSpecLimit`: number | null - LSL for capability calculation
- `upperSpecLimit`: number | null - USL for capability calculation
- `targetValue`: number | null - Target for capability
- `sampleMean`: number | null - μ for capability
- `sampleStdDev`: number | null - σ for capability

**TypeScript Interface:**

```typescript
interface Process {
  id: string;
  assignmentId: string;
  processName: string;
  processOwner: string | null;
  order: number;
  lowerSpecLimit: number | null;
  upperSpecLimit: number | null;
  targetValue: number | null;
  sampleMean: number | null;
  sampleStdDev: number | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  assignment?: Assignment;
  sipocEntries?: SIPOCEntry[];
  vsmSteps?: VSMStep[];
  fishboneCategories?: FishboneCategory[];
}

// Computed fields (not stored)
interface ProcessCapability {
  cp: number | null;  // (USL - LSL) / (6 * σ)
  cpk: number | null; // min((USL - μ) / (3σ), (μ - LSL) / (3σ))
  sigmaLevel: number | null; // Cpk * 3 + 1.5
}
```

**Relationships:**
- Many-to-one with Assignment
- One-to-many with SIPOCEntry, VSMStep, FishboneCategory

---

### VOCStatement

**Purpose:** Voice of Customer statements capturing user needs and pain points

**Key Attributes:**
- `id`: string (UUID)
- `assignmentId`: string (FK)
- `customerSegment`: string - User type/persona
- `voiceStatement`: text - Verbatim customer feedback

**TypeScript Interface:**

```typescript
interface VOCStatement {
  id: string;
  assignmentId: string;
  customerSegment: string;
  voiceStatement: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### CTQRequirement

**Purpose:** Critical to Quality requirements derived from VOC

**Key Attributes:**
- `id`: string (UUID)
- `assignmentId`: string (FK)
- `vocStatementId`: string | null (FK) - Source VOC linkage
- `ctqDescription`: text - Measurable requirement
- `measurementCriteria`: string - How to measure
- `targetValue`: string | null - Expected outcome

**TypeScript Interface:**

```typescript
interface CTQRequirement {
  id: string;
  assignmentId: string;
  vocStatementId: string | null;
  ctqDescription: string;
  measurementCriteria: string;
  targetValue: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### SIPOCEntry

**Purpose:** SIPOC (Suppliers, Inputs, Process, Outputs, Customers) high-level process mapping

**Key Attributes:**
- `id`: string (UUID)
- `processId`: string (FK)
- `column`: SIPOCColumn enum - Which SIPOC column
- `order`: number - Row sequence within column
- `value`: text - Entry content

**TypeScript Interface:**

```typescript
enum SIPOCColumn {
  SUPPLIER = 'SUPPLIER',
  INPUT = 'INPUT',
  PROCESS = 'PROCESS',
  OUTPUT = 'OUTPUT',
  CUSTOMER = 'CUSTOMER'
}

interface SIPOCEntry {
  id: string;
  processId: string;
  column: SIPOCColumn;
  order: number;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### VSMStep

**Purpose:** Value Stream Mapping detailed step-level data for Pareto analysis

**Key Attributes:**
- `id`: string (UUID)
- `processId`: string (FK)
- `stepNumber`: number - Sequence in process
- `stepName`: string - Activity description
- `durationMinutes`: number - Cycle time
- `waitTimeMinutes`: number | null - Non-value time
- `valueAdded`: boolean - Contributes to customer value
- `notes`: text | null - Additional context

**TypeScript Interface:**

```typescript
interface VSMStep {
  id: string;
  processId: string;
  stepNumber: number;
  stepName: string;
  durationMinutes: number;
  waitTimeMinutes: number | null;
  valueAdded: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Aggregated metrics (computed from VSMStep array)
interface VSMMetrics {
  totalCycleTime: number;
  valueAddedTime: number;
  nonValueAddedTime: number;
  efficiencyRatio: number; // valueAddedTime / totalCycleTime
}
```

---

### FishboneCategory & FishboneCause

**Purpose:** 6M root cause analysis (People, Process, Equipment, Materials, Environment, Management)

**TypeScript Interface:**

```typescript
enum FishboneCategoryType {
  PEOPLE = 'PEOPLE',
  PROCESS = 'PROCESS',
  EQUIPMENT = 'EQUIPMENT',
  MATERIALS = 'MATERIALS',
  ENVIRONMENT = 'ENVIRONMENT',
  MANAGEMENT = 'MANAGEMENT'
}

interface FishboneCategory {
  id: string;
  processId: string;
  category: FishboneCategoryType;
  order: number;
  createdAt: Date;
  updatedAt: Date;

  causes?: FishboneCause[];
}

interface FishboneCause {
  id: string;
  categoryId: string;
  causeDescription: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### FMEAEntry

**Purpose:** Failure Mode and Effects Analysis with auto-calculated RPN

**Key Attributes:**
- `severity`: number (1-10) - Impact severity
- `occurrence`: number (1-10) - Frequency likelihood
- `detection`: number (1-10) - Detectability (1=easy, 10=hard)
- `rpn`: number (computed) - Risk Priority Number = S × O × D

**TypeScript Interface:**

```typescript
interface FMEAEntry {
  id: string;
  assignmentId: string;
  processId: string | null;
  failureMode: string;
  effectsOfFailure: string;
  severity: number; // 1-10
  potentialCauses: string;
  occurrence: number; // 1-10
  currentControls: string;
  detection: number; // 1-10
  rpn: number; // Computed: severity * occurrence * detection
  recommendedActions: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Recommendation

**Purpose:** Actionable improvement recommendations with traceability

**TypeScript Interface:**

```typescript
enum ImplementationDifficulty {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

enum RecommendationStatus {
  PROPOSED = 'PROPOSED',
  APPROVED = 'APPROVED',
  IMPLEMENTED = 'IMPLEMENTED'
}

interface Recommendation {
  id: string;
  assignmentId: string;
  recommendationTitle: string;
  description: string;
  expectedImpact: string;
  implementationDifficulty: ImplementationDifficulty;
  estimatedCostSavings: string | null;
  linkedFMEAIds: string[]; // JSON array
  linkedFishboneCauseIds: string[]; // JSON array
  status: RecommendationStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### AuditLog

**Purpose:** Compliance audit trail for all state changes and access

**TypeScript Interface:**

```typescript
enum AuditAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  COMPLETED = 'COMPLETED',
  REOPENED = 'REOPENED',
  DELETED = 'DELETED',
  ACCESSED = 'ACCESSED'
}

interface AuditLog {
  id: string;
  assignmentId: string;
  userId: string;
  action: AuditAction;
  entityType: string; // 'Assignment', 'VOCStatement', etc.
  entityId: string | null;
  changeDetails: Record<string, any> | null; // JSON
  timestamp: Date;
}
```

---

## API Specification

### REST API Endpoints

Base URL: `https://bpi-platform.vercel.app/api`

#### Authentication

- `POST /api/auth/signin` - Login with credentials
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Get current user session

#### Assignments

- `GET /api/assignments` - List assignments (filtered by user role)
  - Query params: `status`, `createdBy`
  - Returns: `Assignment[]`
- `POST /api/assignments` - Create new assignment
  - Body: `{ title, objective, teamMemberIds }`
  - Returns: `Assignment`
- `GET /api/assignments/[id]` - Get assignment details
  - Returns: `Assignment` with relations
- `PUT /api/assignments/[id]` - Update assignment
  - Body: Partial `Assignment`
  - Returns: `Assignment`
- `POST /api/assignments/[id]/complete` - Mark as completed (TEAM_LEAD only)
  - Returns: `Assignment`
- `POST /api/assignments/[id]/reopen` - Reopen for editing (TEAM_LEAD only)
  - Returns: `Assignment`
- `GET /api/assignments/[id]/export/pdf` - Export to PDF
  - Returns: Binary PDF file

#### Processes

- `GET /api/assignments/[id]/processes` - List processes for assignment
  - Returns: `Process[]`
- `POST /api/assignments/[id]/processes` - Create process
  - Body: `{ processName, processOwner }`
  - Returns: `Process`
- `PUT /api/processes/[id]` - Update process
  - Body: Partial `Process`
  - Returns: `Process`
- `DELETE /api/processes/[id]` - Delete process (cascade to SIPOC/VSM/Fishbone)
  - Returns: `{ success: boolean }`

#### VOC/CTQ

- `GET /api/assignments/[id]/voc` - Get VOC statements and CTQ requirements
  - Returns: `{ vocStatements: VOCStatement[], ctqRequirements: CTQRequirement[] }`
- `POST /api/assignments/[id]/voc/statements` - Create VOC statement
  - Body: `{ customerSegment, voiceStatement }`
  - Returns: `VOCStatement`
- `PUT /api/assignments/[id]/voc/statements/[vocId]` - Update VOC
- `DELETE /api/assignments/[id]/voc/statements/[vocId]` - Delete VOC
- `POST /api/assignments/[id]/voc/ctqs` - Create CTQ requirement
- `PUT /api/assignments/[id]/voc/ctqs/[ctqId]` - Update CTQ
- `DELETE /api/assignments/[id]/voc/ctqs/[ctqId]` - Delete CTQ

#### SIPOC

- `GET /api/processes/[id]/sipoc` - Get SIPOC entries
  - Returns: `{ suppliers: [], inputs: [], process: [], outputs: [], customers: [] }`
- `POST /api/processes/[id]/sipoc` - Create SIPOC entry
  - Body: `{ column, value, order }`
  - Returns: `SIPOCEntry`
- `PUT /api/processes/[id]/sipoc/[entryId]` - Update entry
- `DELETE /api/processes/[id]/sipoc/[entryId]` - Delete entry
- `PUT /api/processes/[id]/sipoc/reorder` - Reorder entries (bulk update)

#### VSM

- `GET /api/processes/[id]/vsm` - Get VSM steps with computed metrics
  - Returns: `{ steps: VSMStep[], metrics: VSMMetrics }`
- `POST /api/processes/[id]/vsm` - Create VSM step
  - Body: `{ stepName, durationMinutes, valueAdded, ... }`
  - Returns: `VSMStep`
- `PUT /api/processes/[id]/vsm/[stepId]` - Update step
- `DELETE /api/processes/[id]/vsm/[stepId]` - Delete step
- `PUT /api/processes/[id]/vsm/reorder` - Reorder steps (bulk)

#### Fishbone

- `GET /api/processes/[id]/fishbone` - Get categories with causes
  - Returns: `{ categories: FishboneCategory[] }`
- `POST /api/processes/[id]/fishbone/causes` - Add cause to category
  - Body: `{ categoryId, causeDescription }`
  - Returns: `FishboneCause`
- `PUT /api/processes/[id]/fishbone/causes/[causeId]` - Update cause
- `DELETE /api/processes/[id]/fishbone/causes/[causeId]` - Delete cause

#### Process Capability

- `GET /api/processes/[id]/capability` - Get capability data with calculated Cp/Cpk/Sigma
  - Returns: `{ process: Process, capability: ProcessCapability }`
- `PUT /api/processes/[id]/capability` - Update spec limits and sample stats
  - Body: `{ lowerSpecLimit, upperSpecLimit, targetValue, sampleMean, sampleStdDev }`
  - Returns: `Process`

#### FMEA

- `GET /api/assignments/[id]/fmea` - List FMEA entries (sorted by RPN desc)
  - Query params: `processId` (optional filter)
  - Returns: `FMEAEntry[]`
- `POST /api/assignments/[id]/fmea` - Create FMEA entry (RPN auto-calculated)
  - Body: `{ failureMode, severity, occurrence, detection, ... }`
  - Returns: `FMEAEntry`
- `PUT /api/assignments/[id]/fmea/[entryId]` - Update entry (RPN recalculated)
- `DELETE /api/assignments/[id]/fmea/[entryId]` - Delete entry

#### Recommendations

- `GET /api/assignments/[id]/recommendations` - List recommendations
  - Returns: `Recommendation[]`
- `POST /api/assignments/[id]/recommendations` - Create recommendation
  - Body: `{ recommendationTitle, description, linkedFMEAIds, ... }`
  - Returns: `Recommendation`
- `PUT /api/assignments/[id]/recommendations/[recId]` - Update recommendation
- `DELETE /api/assignments/[id]/recommendations/[recId]` - Delete recommendation

#### Audit

- `GET /api/assignments/[id]/audit` - Get audit log (TEAM_LEAD only)
  - Query params: `action`, `startDate`, `endDate`, `userId`
  - Returns: `AuditLog[]`

### API Response Format

**Success Response:**
```typescript
{
  data: T; // Actual payload
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}
```

**Error Response:**
```typescript
{
  error: {
    code: string; // 'UNAUTHORIZED', 'VALIDATION_ERROR', etc.
    message: string; // Human-readable message
    details?: Record<string, any>; // Field-level errors
    timestamp: string; // ISO 8601
    requestId: string; // For debugging
  };
}
```

### Authentication & Authorization

All API routes (except `/api/auth/*`) require authentication via NextAuth.js session cookie. Authorization checked via middleware:

- **BPI_TEAM:** Can create/edit own assignments (status=DRAFT or REOPENED)
- **TEAM_LEAD:** Can edit any assignment, approve (Complete), reopen
- **EXECUTIVE:** Read-only access to completed assignments
- **PROCESS_OWNER:** Read-only access to completed assignments (future: scoped by process)

---

## Components

### Frontend Components

#### 1. AuthProvider

**Responsibility:** Session management and role-based access control context

**Key Interfaces:**
- `useSession()` hook exposing `{ user, status, signIn, signOut }`
- `ProtectedRoute` component wrapping pages requiring authentication

**Dependencies:** NextAuth.js

**Technology Stack:** React Context API + NextAuth.js client

---

#### 2. AssignmentDashboard

**Responsibility:** List view of all assignments with filtering and status indicators

**Key Interfaces:**
- Renders assignment table with columns: Title, Status, Last Modified, Created By
- "New Assignment" button (role-gated)
- Filter dropdowns: Status, Created By

**Dependencies:** AssignmentService (API client), UI components (Table, Button)

**Technology Stack:** React Server Component (initial load) + Client Component (interactions)

---

#### 3. AssignmentEditor

**Responsibility:** Container component managing assignment state and navigation

**Key Interfaces:**
- Story-driven tab navigation: VOC/CTQ, Processes, FMEA, Recommendations
- Assignment status indicator and action buttons (Mark Complete, Reopen)
- Auto-save status indicator

**Dependencies:** Zustand store for unsaved changes, AssignmentService, all section components

**Technology Stack:** React Client Component with Zustand state

---

#### 4. VOCCTQForm

**Responsibility:** Dual-table interface for Voice of Customer and CTQ requirements

**Key Interfaces:**
- VOC table with inline editing (customerSegment, voiceStatement)
- CTQ table with inline editing and VOC linkage dropdown
- "Add VOC Statement" and "Add CTQ Requirement" buttons

**Dependencies:** React Hook Form for validation, VOCService API client

**Technology Stack:** React Client Component with React Hook Form

---

#### 5. SIPOCGrid

**Responsibility:** 5-column spreadsheet interface for SIPOC data entry with optional visual diagram

**Key Interfaces:**
- **Data Entry Mode:** Editable grid with columns: Suppliers, Inputs, Process, Outputs, Customers
- **Visual Diagram Mode:** Interactive process flow using react-flow showing:
  - Left-to-right flow from Suppliers → Inputs → Process → Outputs → Customers
  - Node styling per category with connecting edges
  - Zoom/pan controls for complex processes
- Drag-and-drop row reordering within columns (Data Entry Mode)
- "Add Row" buttons per column
- Toggle between grid and visual views

**Dependencies:** react-dnd or @dnd-kit/core for drag-drop, SIPOCService, @xyflow/react for visual mode

**Technology Stack:** React Client Component with drag-drop library + react-flow

---

#### 6. VSMTable

**Responsibility:** Process step data entry with real-time metric calculations

**Key Interfaces:**
- Editable table: Step #, Name, Duration, Wait Time, Value Added, Notes
- Summary metrics at top: Total Cycle Time, Value-Added Time, Efficiency Ratio
- Drag-drop row reordering

**Dependencies:** VSMService, calculation utilities

**Technology Stack:** React Client Component with inline editing

---

#### 7. ParetoChart

**Responsibility:** Automated Pareto chart generation from VSM data

**Key Interfaces:**
- Bar chart (duration descending) with cumulative percentage line
- 80% threshold indicator
- Hover tooltips with step details

**Dependencies:** Recharts library, VSM data from parent component

**Technology Stack:** React Client Component (Recharts BarChart + Line)

---

#### 8. FishboneDiagramBuilder

**Responsibility:** 6M category root cause entry with visual diagram representation

**Key Interfaces:**
- **Data Entry Mode:** Accordion/card layout for 6 categories with inline text entry for causes
- **Visual Diagram Mode:** Interactive Fishbone diagram using react-flow with:
  - Central spine showing effect/problem
  - 6 category branches (People, Process, Equipment, Materials, Environment, Management)
  - Draggable cause nodes on each branch
  - Zoom/pan controls for large diagrams
- Toggle between table and visual views
- Methodology tooltips per category
- Export diagram as PNG for presentations

**Dependencies:** FishboneService, @xyflow/react for visual mode

**Technology Stack:** React Client Component with shadcn/ui Accordion + react-flow

---

#### 9. ProcessCapabilityDashboard

**Responsibility:** Input form for spec limits + calculated Cp/Cpk/Sigma display + bell curve

**Key Interfaces:**
- Input form: LSL, USL, Target, Sample Mean, Sample Std Dev
- Metrics cards with color-coded indicators (Green/Yellow/Red)
- Bell curve chart with spec limit markers

**Dependencies:** ProcessService, Recharts for bell curve, calculation library

**Technology Stack:** React Client Component

---

#### 10. FMEATable

**Responsibility:** Failure mode entry with auto-calculated RPN and sortable columns

**Key Interfaces:**
- Editable table: Failure Mode, Effects, S, O, D, RPN (read-only), Actions
- RPN cell color-coding: Red (≥200), Yellow (100-199), Green (<100)
- Column sorting (default: RPN descending)

**Dependencies:** FMEAService, calculation utilities (RPN = S × O × D)

**Technology Stack:** React Client Component with sorting logic

---

#### 11. RecommendationForm

**Responsibility:** Recommendation creation with FMEA/Fishbone linkage and visual traceability

**Key Interfaces:**
- Form: Title, Description, Expected Impact, Difficulty, Cost Savings
- Multi-select dropdowns: Linked FMEA Entries, Linked Fishbone Causes
- **Traceability display:**
  - List view showing linked items with badges
  - Optional graph view using react-flow showing relationships between Recommendations → FMEA Entries → Fishbone Causes
- Traceability graph helps visualize impact analysis

**Dependencies:** RecommendationService, FMEA and Fishbone data for dropdowns, @xyflow/react for optional graph view

**Technology Stack:** React Client Component with React Hook Form + react-flow

---

#### 12. CalculationTooltip

**Responsibility:** Reusable tooltip showing formula and substituted values

**Key Interfaces:**
- Renders info icon next to calculated values
- Popover displays: Formula notation, Substituted values, "Learn More" link

**Dependencies:** shadcn/ui Tooltip component

**Technology Stack:** React Client Component

---

### Backend Components

#### 13. AssignmentService

**Responsibility:** Business logic for assignment CRUD and state transitions

**Key Interfaces:**
- `createAssignment(data)` - Creates assignment with DRAFT status
- `updateAssignment(id, data)` - Updates editable fields
- `completeAssignment(id, userId)` - Transitions to COMPLETED (with auth check)
- `reopenAssignment(id, userId)` - Transitions to REOPENED (TEAM_LEAD only)
- `getAssignmentsByUser(userId, role)` - Filtered list based on role

**Dependencies:** Prisma Client, AuditLogService

**Technology Stack:** TypeScript class in `/lib/services/assignment.service.ts`

---

#### 14. CalculationEngine

**Responsibility:** All Six Sigma calculation logic with 100% accuracy

**Key Interfaces:**
- `calculateParetoData(vsmSteps)` - Sorts by duration, computes cumulative %
- `calculateRPN(severity, occurrence, detection)` - S × O × D
- `calculateCp(usl, lsl, stdDev)` - Process capability
- `calculateCpk(usl, lsl, mean, stdDev)` - Process capability with centering
- `calculateSigmaLevel(cpk)` - Cpk × 3 + 1.5

**Dependencies:** None (pure functions)

**Technology Stack:** TypeScript module in `/lib/calculations/` with comprehensive unit tests

---

#### 15. PDFGenerationService

**Responsibility:** Server-side PDF rendering of complete assignments

**Key Interfaces:**
- `generateAssignmentPDF(assignmentId)` - Returns PDF buffer
- Uses Puppeteer to render HTML template with embedded charts

**Dependencies:** Puppeteer, AssignmentService for data, Recharts for server-side chart rendering, react-flow for diagram exports

**Technology Stack:** Next.js API route handler in `/app/api/assignments/[id]/export/pdf/route.ts`

---

#### 16. AuthorizationMiddleware

**Responsibility:** Enforces role-based access control on API routes

**Key Interfaces:**
- `requireAuth(handler)` - Wraps handler, checks session exists
- `requireRole(roles)(handler)` - Wraps handler, checks user.role in allowed roles
- `canEditAssignment(userId, role, assignment)` - Business logic for edit permissions

**Dependencies:** NextAuth.js session, Prisma for assignment lookup

**Technology Stack:** Higher-order function in `/lib/middleware/auth.middleware.ts`

---

#### 17. AuditLogService

**Responsibility:** Records all state changes and access for compliance

**Key Interfaces:**
- `logAction(assignmentId, userId, action, entityType, entityId, changeDetails)`
- `getAuditLog(assignmentId, filters)` - Paginated audit entries

**Dependencies:** Prisma Client

**Technology Stack:** TypeScript class in `/lib/services/audit-log.service.ts`

---

### Component Diagram

```mermaid
graph TB
    subgraph "Frontend Components"
        Browser[Browser Client]
        AuthProvider[AuthProvider<br/>Context]
        Dashboard[AssignmentDashboard<br/>List View]
        Editor[AssignmentEditor<br/>Container]
        VOC[VOCCTQForm]
        SIPOC[SIPOCGrid]
        VSM[VSMTable]
        Pareto[ParetoChart]
        Fishbone[FishboneDiagramBuilder]
        Capability[ProcessCapabilityDashboard]
        FMEA[FMEATable]
        Rec[RecommendationForm]
    end

    subgraph "API Layer"
        API[Next.js API Routes]
        AuthMW[AuthorizationMiddleware]
    end

    subgraph "Backend Services"
        AssignSvc[AssignmentService]
        CalcEngine[CalculationEngine]
        PDFSvc[PDFGenerationService]
        AuditSvc[AuditLogService]
    end

    subgraph "Data Layer"
        Prisma[Prisma ORM]
        DB[(PostgreSQL)]
    end

    Browser --> AuthProvider
    Browser --> Dashboard
    Browser --> Editor
    Editor --> VOC
    Editor --> SIPOC
    Editor --> VSM
    Editor --> Pareto
    Editor --> Fishbone
    Editor --> Capability
    Editor --> FMEA
    Editor --> Rec

    Dashboard --> API
    Editor --> API
    VOC --> API
    SIPOC --> API
    VSM --> API
    Fishbone --> API
    Capability --> API
    FMEA --> API
    Rec --> API

    API --> AuthMW
    AuthMW --> AssignSvc
    AuthMW --> CalcEngine
    AuthMW --> PDFSvc
    AuthMW --> AuditSvc

    AssignSvc --> Prisma
    AuditSvc --> Prisma
    PDFSvc --> Prisma
    CalcEngine -.Pure Functions.-> AssignSvc

    Prisma --> DB

    style Browser fill:#f9f9f9,stroke:#333
    style API fill:#333,stroke:#fff,color:#fff
    style DB fill:#3ecf8e,stroke:#fff,color:#000
```

---

## External APIs

**No external APIs required for MVP.**

The BPI Assignment Platform is self-contained with all functionality implemented internally. Future phases may integrate:
- SMTP service for email notifications (SendGrid, Postmark)
- Cloud storage for large CSV imports (AWS S3 direct upload)
- AI service for root cause suggestions (OpenAI API)

---

## Core Workflows

### Workflow 1: Create and Complete Assignment

```mermaid
sequenceDiagram
    actor Analyst as BPI Analyst
    participant UI as Frontend
    participant API as API Routes
    participant DB as PostgreSQL
    participant Calc as CalculationEngine
    participant Audit as AuditLog

    Analyst->>UI: Click "New Assignment"
    UI->>API: POST /api/assignments
    API->>DB: Create assignment (DRAFT)
    API->>Audit: Log CREATED action
    DB-->>API: Return assignment
    API-->>UI: Return assignment
    UI-->>Analyst: Show assignment editor

    Note over Analyst,UI: Analyst enters VOC/CTQ data
    Analyst->>UI: Add VOC statement
    UI->>API: POST /api/assignments/{id}/voc/statements
    API->>DB: Insert VOCStatement
    API->>Audit: Log UPDATED action
    DB-->>UI: Return statement (auto-save)

    Note over Analyst,UI: Analyst adds process and VSM data
    Analyst->>UI: Create process "Order Fulfillment"
    UI->>API: POST /api/assignments/{id}/processes
    API->>DB: Insert Process
    DB-->>UI: Return process

    Analyst->>UI: Enter VSM steps with durations
    UI->>API: POST /api/processes/{id}/vsm (multiple)
    API->>DB: Insert VSMStep records
    DB-->>UI: Return steps

    Note over UI,Calc: Auto-generate Pareto chart
    UI->>Calc: calculateParetoData(vsmSteps)
    Calc-->>UI: Sorted steps with cumulative %
    UI-->>Analyst: Display Pareto chart

    Note over Analyst,UI: Analyst completes FMEA and Recommendations
    Analyst->>UI: Add FMEA entry (S=8, O=6, D=3)
    UI->>API: POST /api/assignments/{id}/fmea
    API->>Calc: calculateRPN(8, 6, 3)
    Calc-->>API: RPN = 144
    API->>DB: Insert FMEAEntry with RPN=144
    DB-->>UI: Return entry

    Analyst->>UI: Add recommendation linked to FMEA
    UI->>API: POST /api/assignments/{id}/recommendations
    API->>DB: Insert Recommendation
    DB-->>UI: Return recommendation

    Note over Analyst,UI: Mark as complete (TEAM_LEAD action)
    Analyst->>UI: Click "Mark as Complete"
    UI->>API: POST /api/assignments/{id}/complete
    API->>DB: Update status = COMPLETED, completedAt = now
    API->>Audit: Log COMPLETED action
    DB-->>UI: Return updated assignment
    UI-->>Analyst: Show completed state (read-only)
```

### Workflow 2: Executive Views Completed Assignment

```mermaid
sequenceDiagram
    actor Exec as Executive
    participant UI as Frontend
    participant API as API Routes
    participant DB as PostgreSQL

    Exec->>UI: Login as EXECUTIVE
    UI->>API: POST /api/auth/signin
    API->>DB: Verify credentials
    DB-->>API: Return user with role=EXECUTIVE
    API-->>UI: Set session cookie

    Exec->>UI: Navigate to assignments
    UI->>API: GET /api/assignments?status=COMPLETED
    API->>DB: Query assignments WHERE status=COMPLETED
    DB-->>API: Return completed assignments
    API-->>UI: Filter by role (EXECUTIVE sees completed only)
    UI-->>Exec: Display completed assignments list

    Exec->>UI: Click assignment
    Note over UI: Redirect to /assignments/{id}/summary
    UI->>API: GET /api/assignments/{id}
    API->>DB: Query assignment with all relations
    DB-->>API: Return full assignment data
    API-->>UI: Return assignment

    UI-->>Exec: Display Executive Summary View
    Note over UI,Exec: Shows:<br/>- Top 3 Pareto steps<br/>- Top 5 FMEA risks by RPN<br/>- Cp/Cpk for all processes<br/>- All recommendations

    Exec->>UI: Click "View Full Report"
    UI-->>Exec: Navigate to detailed assignment view (read-only)

    Exec->>UI: Click "Export PDF"
    UI->>API: GET /api/assignments/{id}/export/pdf
    API->>DB: Fetch assignment data
    DB-->>API: Return data
    API->>API: Generate PDF via Puppeteer
    API-->>UI: Stream PDF binary
    UI-->>Exec: Download Assignment-[title]-[date].pdf
```

### Workflow 3: Auto-Save with Optimistic UI

```mermaid
sequenceDiagram
    actor User as BPI Analyst
    participant UI as Frontend
    participant Store as Zustand Store
    participant API as API Routes
    participant DB as PostgreSQL

    User->>UI: Edit SIPOC entry value
    UI->>Store: Mark as unsaved
    Store-->>UI: Update unsaved indicator (yellow)
    UI-->>User: Show "Saving..." status

    Note over UI: Wait 2 seconds (debounce)

    UI->>API: PUT /api/processes/{id}/sipoc/{entryId}
    Note over UI,API: Optimistic update: UI shows new value immediately

    API->>DB: Update SIPOCEntry
    DB-->>API: Return updated entry
    API-->>UI: Success response

    UI->>Store: Clear unsaved flag
    Store-->>UI: Update indicator (green checkmark)
    UI-->>User: Show "All changes saved"

    alt Save fails
        API--xUI: Error response (network/server error)
        UI->>Store: Keep unsaved flag
        UI-->>User: Show "Save failed - retrying"
        Note over UI: Retry with exponential backoff (3 attempts)

        alt All retries fail
            UI-->>User: Show "Changes not saved. Please try again."
            UI->>Store: Keep local changes in memory
        end
    end

    alt User navigates away with unsaved changes
        User->>UI: Click different tab
        UI->>User: Show dialog: "You have unsaved changes. Save now?"
        User->>UI: Click "Save"
        UI->>API: Force save via API
        API->>DB: Update records
        DB-->>UI: Success
        UI-->>User: Navigate to new tab
    end
```

---

## Database Schema

### Prisma Schema Definition

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  BPI_TEAM
  TEAM_LEAD
  EXECUTIVE
  PROCESS_OWNER
}

enum AssignmentStatus {
  DRAFT
  COMPLETED
  REOPENED
}

enum SIPOCColumn {
  SUPPLIER
  INPUT
  PROCESS
  OUTPUT
  CUSTOMER
}

enum FishboneCategoryType {
  PEOPLE
  PROCESS
  EQUIPMENT
  MATERIALS
  ENVIRONMENT
  MANAGEMENT
}

enum ImplementationDifficulty {
  LOW
  MEDIUM
  HIGH
}

enum RecommendationStatus {
  PROPOSED
  APPROVED
  IMPLEMENTED
}

enum AuditAction {
  CREATED
  UPDATED
  COMPLETED
  REOPENED
  DELETED
  ACCESSED
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  name         String
  role         UserRole
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  createdAssignments Assignment[]
  auditLogs          AuditLog[]

  @@index([email])
}

model Assignment {
  id          String           @id @default(uuid())
  title       String
  objective   String
  status      AssignmentStatus @default(DRAFT)
  createdById String
  completedAt DateTime?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  createdBy         User               @relation(fields: [createdById], references: [id])
  processes         Process[]
  vocStatements     VOCStatement[]
  ctqRequirements   CTQRequirement[]
  fmeaEntries       FMEAEntry[]
  recommendations   Recommendation[]
  auditLogs         AuditLog[]

  @@index([createdById])
  @@index([status])
  @@index([createdAt])
}

model Process {
  id               String   @id @default(uuid())
  assignmentId     String
  processName      String
  processOwner     String?
  order            Int
  lowerSpecLimit   Float?
  upperSpecLimit   Float?
  targetValue      Float?
  sampleMean       Float?
  sampleStdDev     Float?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  assignment          Assignment          @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  sipocEntries        SIPOCEntry[]
  vsmSteps            VSMStep[]
  fishboneCategories  FishboneCategory[]
  fmeaEntries         FMEAEntry[]

  @@index([assignmentId])
  @@index([order])
}

model VOCStatement {
  id              String   @id @default(uuid())
  assignmentId    String
  customerSegment String
  voiceStatement  String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  assignment      Assignment       @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  ctqRequirements CTQRequirement[]

  @@index([assignmentId])
}

model CTQRequirement {
  id                  String   @id @default(uuid())
  assignmentId        String
  vocStatementId      String?
  ctqDescription      String
  measurementCriteria String
  targetValue         String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  assignment   Assignment    @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  vocStatement VOCStatement? @relation(fields: [vocStatementId], references: [id], onDelete: SetNull)

  @@index([assignmentId])
  @@index([vocStatementId])
}

model SIPOCEntry {
  id        String      @id @default(uuid())
  processId String
  column    SIPOCColumn
  order     Int
  value     String
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  process Process @relation(fields: [processId], references: [id], onDelete: Cascade)

  @@index([processId])
  @@index([column, order])
}

model VSMStep {
  id               String   @id @default(uuid())
  processId        String
  stepNumber       Int
  stepName         String
  durationMinutes  Float
  waitTimeMinutes  Float?
  valueAdded       Boolean  @default(false)
  notes            String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  process Process @relation(fields: [processId], references: [id], onDelete: Cascade)

  @@index([processId])
  @@index([stepNumber])
}

model FishboneCategory {
  id        String               @id @default(uuid())
  processId String
  category  FishboneCategoryType
  order     Int
  createdAt DateTime             @default(now())
  updatedAt DateTime             @updatedAt

  process Process         @relation(fields: [processId], references: [id], onDelete: Cascade)
  causes  FishboneCause[]

  @@index([processId])
}

model FishboneCause {
  id               String   @id @default(uuid())
  categoryId       String
  causeDescription String
  order            Int
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  category FishboneCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@index([categoryId])
}

model FMEAEntry {
  id                 String   @id @default(uuid())
  assignmentId       String
  processId          String?
  failureMode        String
  effectsOfFailure   String
  severity           Int // 1-10
  potentialCauses    String
  occurrence         Int // 1-10
  currentControls    String
  detection          Int // 1-10
  rpn                Int // Computed: severity * occurrence * detection
  recommendedActions String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  assignment Assignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  process    Process?   @relation(fields: [processId], references: [id], onDelete: SetNull)

  @@index([assignmentId])
  @@index([processId])
  @@index([rpn])
}

model Recommendation {
  id                       String                   @id @default(uuid())
  assignmentId             String
  recommendationTitle      String
  description              String
  expectedImpact           String
  implementationDifficulty ImplementationDifficulty
  estimatedCostSavings     String?
  linkedFMEAIds            String[] // JSON array of FMEA entry IDs
  linkedFishboneCauseIds   String[] // JSON array of Fishbone cause IDs
  status                   RecommendationStatus     @default(PROPOSED)
  createdAt                DateTime                 @default(now())
  updatedAt                DateTime                 @updatedAt

  assignment Assignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)

  @@index([assignmentId])
  @@index([status])
}

model AuditLog {
  id            String      @id @default(uuid())
  assignmentId  String
  userId        String
  action        AuditAction
  entityType    String // 'Assignment', 'VOCStatement', etc.
  entityId      String?
  changeDetails Json? // JSON object with before/after values
  timestamp     DateTime    @default(now())

  assignment Assignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  user       User       @relation(fields: [userId], references: [id])

  @@index([assignmentId])
  @@index([userId])
  @@index([timestamp])
}
```

### Database Migrations Strategy

1. **Initial Migration:** Create all tables with indexes
2. **Seed Data:** Generate test users (one per role) and 2 sample assignments with full data
3. **Migration Workflow:**
   - Development: `npx prisma migrate dev --name description`
   - Production: `npx prisma migrate deploy` (runs automatically on Vercel deployment)
4. **Rollback Strategy:** Revert migration files and redeploy previous version

### Indexing Strategy

- **Primary Keys:** All `id` fields are UUIDs with default index
- **Foreign Keys:** Indexed for join performance (`assignmentId`, `processId`, etc.)
- **Filter Fields:** Indexed fields used in WHERE clauses (`status`, `role`, `email`)
- **Sort Fields:** Indexed fields used in ORDER BY (`createdAt`, `rpn`, `order`)

---

## Frontend Architecture

### Component Organization

```
/app
  /(auth)
    /login
      page.tsx                    # Login page (public)
  /(protected)
    /layout.tsx                   # Protected route wrapper with auth check
    /assignments
      page.tsx                    # Assignment dashboard (Server Component)
      /[id]
        /layout.tsx               # Assignment editor container
        page.tsx                  # Redirect to /voc by default
        /voc
          page.tsx                # VOC/CTQ form
        /processes
          /[processId]
            /sipoc
              page.tsx            # SIPOC grid
            /vsm
              page.tsx            # VSM table
            /pareto
              page.tsx            # Pareto chart
            /fishbone
              page.tsx            # Fishbone builder
            /capability
              page.tsx            # Process capability
        /fmea
          page.tsx                # FMEA table
        /recommendations
          page.tsx                # Recommendations form
        /summary
          page.tsx                # Executive summary (EXECUTIVE default)
        /audit
          page.tsx                # Audit log (TEAM_LEAD only)
      /new
        page.tsx                  # Assignment creation form

/components
  /ui                             # shadcn/ui primitives
    button.tsx
    input.tsx
    table.tsx
    dialog.tsx
    ...
  /assignment
    assignment-header.tsx         # Status badge, action buttons
    assignment-tabs.tsx           # Story-driven navigation
  /voc
    voc-table.tsx
    ctq-table.tsx
  /sipoc
    sipoc-grid.tsx
  /vsm
    vsm-table.tsx
    vsm-metrics.tsx
  /charts
    pareto-chart.tsx
    bell-curve-chart.tsx
  /fishbone
    fishbone-builder.tsx
  /fmea
    fmea-table.tsx
  /recommendations
    recommendation-card.tsx
    recommendation-form.tsx
  /shared
    calculation-tooltip.tsx
    auto-save-indicator.tsx
    loading-spinner.tsx

/lib
  /services                       # API client services
    assignment.service.ts
    process.service.ts
    voc.service.ts
    sipoc.service.ts
    vsm.service.ts
    fmea.service.ts
    recommendation.service.ts
  /stores                         # Zustand stores
    assignment.store.ts
    ui.store.ts
  /hooks                          # Custom hooks
    useAutoSave.ts
    usePermissions.ts
    useAssignment.ts
  /utils
    api-client.ts                 # Fetch wrapper with error handling
    format.ts                     # Date, number formatters
    validation.ts                 # Form validation helpers
```

### Component Template

**React Server Component (for data fetching):**

```typescript
// app/(protected)/assignments/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AssignmentList } from '@/components/assignment/assignment-list';
import { getAssignments } from '@/lib/services/assignment.service';

export default async function AssignmentsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const assignments = await getAssignments(session.user.id, session.user.role);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Assignments</h1>
      <AssignmentList initialData={assignments} />
    </div>
  );
}
```

**React Client Component (for interactivity):**

```typescript
// components/assignment/assignment-list.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Assignment } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';

interface Props {
  initialData: Assignment[];
}

export function AssignmentList({ initialData }: Props) {
  const [assignments, setAssignments] = useState(initialData);
  const router = useRouter();

  const handleCreateNew = () => {
    router.push('/assignments/new');
  };

  return (
    <div>
      <Button onClick={handleCreateNew}>New Assignment</Button>
      <Table>
        {/* Table implementation */}
      </Table>
    </div>
  );
}
```

### State Management Architecture

**State Structure:**

```typescript
// lib/stores/assignment.store.ts
import { create } from 'zustand';
import { Assignment } from '@prisma/client';

interface AssignmentState {
  currentAssignment: Assignment | null;
  unsavedChanges: boolean;
  lastSavedAt: Date | null;

  setCurrentAssignment: (assignment: Assignment) => void;
  markUnsaved: () => void;
  markSaved: () => void;
  reset: () => void;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  currentAssignment: null,
  unsavedChanges: false,
  lastSavedAt: null,

  setCurrentAssignment: (assignment) => set({ currentAssignment: assignment }),
  markUnsaved: () => set({ unsavedChanges: true }),
  markSaved: () => set({ unsavedChanges: false, lastSavedAt: new Date() }),
  reset: () => set({ currentAssignment: null, unsavedChanges: false, lastSavedAt: null }),
}));
```

**State Management Patterns:**
- **Server State:** React Query for API data caching with stale-while-revalidate
- **Client State:** Zustand for global UI state (current assignment, unsaved changes)
- **Form State:** React Hook Form for individual form validation
- **URL State:** Next.js router search params for filters and pagination

### Routing Architecture

**Route Organization:**

```
/ (public)
  /login

/(protected) - All routes require authentication
  /assignments
    /[id]
      /voc
      /processes/[processId]/sipoc
      /processes/[processId]/vsm
      /processes/[processId]/pareto
      /processes/[processId]/fishbone
      /processes/[processId]/capability
      /fmea
      /recommendations
      /summary (EXECUTIVE default)
      /audit (TEAM_LEAD only)
    /new
```

**Protected Route Pattern:**

```typescript
// app/(protected)/layout.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <>
      <Header user={session.user} />
      <main>{children}</main>
    </>
  );
}
```

### Frontend Services Layer

**API Client Setup:**

```typescript
// lib/utils/api-client.ts
export class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
  }
}

export async function apiClient<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new APIError(
      error.error.code,
      error.error.message,
      response.status,
      error.error.details
    );
  }

  return response.json();
}
```

**Service Example:**

```typescript
// lib/services/assignment.service.ts
import { apiClient } from '@/lib/utils/api-client';
import { Assignment, AssignmentStatus } from '@prisma/client';

export class AssignmentService {
  static async getAll(): Promise<Assignment[]> {
    return apiClient<Assignment[]>('/api/assignments');
  }

  static async getById(id: string): Promise<Assignment> {
    return apiClient<Assignment>(`/api/assignments/${id}`);
  }

  static async create(data: {
    title: string;
    objective: string;
  }): Promise<Assignment> {
    return apiClient<Assignment>('/api/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async complete(id: string): Promise<Assignment> {
    return apiClient<Assignment>(`/api/assignments/${id}/complete`, {
      method: 'POST',
    });
  }

  static async exportPDF(id: string): Promise<Blob> {
    const response = await fetch(`/api/assignments/${id}/export/pdf`);
    return response.blob();
  }
}
```

---

## Backend Architecture

### Service Architecture

**Function Organization:**

```
/app/api
  /auth
    /[...nextauth]
      route.ts                    # NextAuth.js configuration
  /assignments
    route.ts                      # GET (list), POST (create)
    /[id]
      route.ts                    # GET (detail), PUT (update)
      /complete
        route.ts                  # POST (mark complete)
      /reopen
        route.ts                  # POST (reopen)
      /export
        /pdf
          route.ts                # GET (generate PDF)
      /voc
        route.ts                  # GET (all VOC/CTQ)
        /statements
          route.ts                # POST (create VOC)
          /[vocId]
            route.ts              # PUT (update), DELETE
        /ctqs
          route.ts                # POST (create CTQ)
          /[ctqId]
            route.ts              # PUT, DELETE
      /processes
        route.ts                  # GET (list), POST (create)
      /fmea
        route.ts                  # GET (list), POST (create)
        /[entryId]
          route.ts                # PUT, DELETE
      /recommendations
        route.ts                  # GET, POST
        /[recId]
          route.ts                # PUT, DELETE
      /audit
        route.ts                  # GET (audit log)
  /processes
    /[id]
      route.ts                    # PUT (update), DELETE
      /sipoc
        route.ts                  # GET, POST
        /[entryId]
          route.ts                # PUT, DELETE
        /reorder
          route.ts                # PUT (bulk reorder)
      /vsm
        route.ts                  # GET, POST
        /[stepId]
          route.ts                # PUT, DELETE
        /reorder
          route.ts                # PUT
      /fishbone
        route.ts                  # GET
        /causes
          route.ts                # POST
          /[causeId]
            route.ts              # PUT, DELETE
      /capability
        route.ts                  # GET, PUT

/lib
  /services                       # Business logic layer
    assignment.service.ts
    process.service.ts
    voc.service.ts
    ...
  /calculations                   # Pure calculation functions
    pareto.ts
    capability.ts
    fmea.ts
  /middleware
    auth.middleware.ts            # Authorization helpers
    error.middleware.ts           # Error handling
    audit.middleware.ts           # Audit logging interceptor
  /prisma
    client.ts                     # Prisma singleton
```

**Function Template (Next.js API Route):**

```typescript
// app/api/assignments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AssignmentService } from '@/lib/services/assignment.service';
import { handleAPIError } from '@/lib/middleware/error.middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const assignment = await AssignmentService.getById(
      params.id,
      session.user.id,
      session.user.role
    );

    return NextResponse.json({ data: assignment });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await request.json();

    const assignment = await AssignmentService.update(
      params.id,
      body,
      session.user.id,
      session.user.role
    );

    return NextResponse.json({ data: assignment });
  } catch (error) {
    return handleAPIError(error);
  }
}
```

### Database Architecture

**Data Access Layer (Repository Pattern):**

```typescript
// lib/services/assignment.service.ts
import { prisma } from '@/lib/prisma/client';
import { Assignment, UserRole, AssignmentStatus } from '@prisma/client';
import { AuditLogService } from './audit-log.service';

export class AssignmentService {
  static async getAll(userId: string, userRole: UserRole): Promise<Assignment[]> {
    const where = userRole === 'EXECUTIVE' || userRole === 'PROCESS_OWNER'
      ? { status: AssignmentStatus.COMPLETED }
      : {}; // BPI_TEAM and TEAM_LEAD see all

    return prisma.assignment.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { processes: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async getById(
    id: string,
    userId: string,
    userRole: UserRole
  ): Promise<Assignment> {
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        createdBy: true,
        processes: {
          include: {
            sipocEntries: true,
            vsmSteps: { orderBy: { stepNumber: 'asc' } },
            fishboneCategories: {
              include: { causes: { orderBy: { order: 'asc' } } },
            },
          },
          orderBy: { order: 'asc' },
        },
        vocStatements: true,
        ctqRequirements: true,
        fmeaEntries: { orderBy: { rpn: 'desc' } },
        recommendations: true,
      },
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    // Authorization check
    const canAccess =
      assignment.createdById === userId ||
      userRole === 'TEAM_LEAD' ||
      (userRole === 'EXECUTIVE' && assignment.status === AssignmentStatus.COMPLETED) ||
      (userRole === 'PROCESS_OWNER' && assignment.status === AssignmentStatus.COMPLETED);

    if (!canAccess) {
      throw new Error('Unauthorized access');
    }

    return assignment;
  }

  static async create(
    data: { title: string; objective: string },
    userId: string
  ): Promise<Assignment> {
    const assignment = await prisma.assignment.create({
      data: {
        ...data,
        createdById: userId,
        status: AssignmentStatus.DRAFT,
      },
    });

    await AuditLogService.log({
      assignmentId: assignment.id,
      userId,
      action: 'CREATED',
      entityType: 'Assignment',
      entityId: assignment.id,
    });

    return assignment;
  }

  static async complete(
    id: string,
    userId: string,
    userRole: UserRole
  ): Promise<Assignment> {
    if (userRole !== 'TEAM_LEAD') {
      throw new Error('Only Team Leads can complete assignments');
    }

    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        status: AssignmentStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    await AuditLogService.log({
      assignmentId: id,
      userId,
      action: 'COMPLETED',
      entityType: 'Assignment',
      entityId: id,
    });

    return assignment;
  }
}
```

### Authentication and Authorization

**Auth Flow:**

```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend
    participant Auth as NextAuth.js
    participant DB as PostgreSQL

    User->>UI: Enter email/password
    UI->>Auth: POST /api/auth/signin
    Auth->>DB: SELECT * FROM User WHERE email=?
    DB-->>Auth: Return user with passwordHash
    Auth->>Auth: bcrypt.compare(password, passwordHash)

    alt Password valid
        Auth->>Auth: Generate JWT session token
        Auth-->>UI: Set session cookie (httpOnly, secure)
        UI-->>User: Redirect to /assignments
    else Password invalid
        Auth-->>UI: Error: Invalid credentials
        UI-->>User: Show error message
    end

    Note over User,DB: Subsequent requests

    User->>UI: Navigate to /assignments/[id]
    UI->>Auth: Request with session cookie
    Auth->>Auth: Verify JWT signature
    Auth->>DB: SELECT * FROM User WHERE id=?
    DB-->>Auth: Return user with role
    Auth-->>UI: session = { user: { id, email, name, role } }
    UI->>UI: Check authorization (can user access this resource?)

    alt Authorized
        UI-->>User: Render page
    else Unauthorized
        UI-->>User: Redirect to /login or show 403
    end
```

**Middleware/Guards:**

```typescript
// lib/middleware/auth.middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  return session;
}

export function requireRole(allowedRoles: UserRole[]) {
  return async (request: NextRequest) => {
    const session = await requireAuth(request);

    if (session instanceof NextResponse) {
      return session; // Auth failed, return error response
    }

    if (!allowedRoles.includes(session.user.role as UserRole)) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
        { status: 403 }
      );
    }

    return session;
  };
}

export function canEditAssignment(
  assignment: { createdById: string; status: string },
  userId: string,
  userRole: UserRole
): boolean {
  // TEAM_LEAD can edit any assignment
  if (userRole === 'TEAM_LEAD') return true;

  // BPI_TEAM can edit own assignments if DRAFT or REOPENED
  if (
    userRole === 'BPI_TEAM' &&
    assignment.createdById === userId &&
    (assignment.status === 'DRAFT' || assignment.status === 'REOPENED')
  ) {
    return true;
  }

  return false;
}
```

---

## Unified Project Structure

```plaintext
bpi-assignment-platform/
├── .github/
│   └── workflows/
│       └── ci.yaml                 # GitHub Actions for linting, type-checking, tests
├── app/                            # Next.js 14 App Router
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx            # Login page
│   ├── (protected)/                # Protected routes (require auth)
│   │   ├── layout.tsx              # Auth wrapper
│   │   └── assignments/
│   │       ├── page.tsx            # Assignment list
│   │       ├── new/
│   │       │   └── page.tsx        # Create assignment
│   │       └── [id]/
│   │           ├── layout.tsx      # Assignment editor container
│   │           ├── voc/
│   │           │   └── page.tsx
│   │           ├── processes/
│   │           │   └── [processId]/
│   │           │       ├── sipoc/
│   │           │       ├── vsm/
│   │           │       ├── pareto/
│   │           │       ├── fishbone/
│   │           │       └── capability/
│   │           ├── fmea/
│   │           ├── recommendations/
│   │           ├── summary/
│   │           └── audit/
│   ├── api/                        # API routes (serverless)
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts        # NextAuth.js config
│   │   ├── assignments/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── complete/
│   │   │       ├── reopen/
│   │   │       ├── export/
│   │   │       │   └── pdf/
│   │   │       ├── voc/
│   │   │       ├── processes/
│   │   │       ├── fmea/
│   │   │       ├── recommendations/
│   │   │       └── audit/
│   │   └── processes/
│   │       └── [id]/
│   │           ├── route.ts
│   │           ├── sipoc/
│   │           ├── vsm/
│   │           ├── fishbone/
│   │           └── capability/
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Home page (redirect to /assignments)
│   └── globals.css                 # Tailwind imports
├── components/
│   ├── ui/                         # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── assignment/
│   │   ├── assignment-header.tsx
│   │   ├── assignment-tabs.tsx
│   │   └── assignment-list.tsx
│   ├── voc/
│   │   ├── voc-table.tsx
│   │   └── ctq-table.tsx
│   ├── sipoc/
│   │   └── sipoc-grid.tsx
│   ├── vsm/
│   │   ├── vsm-table.tsx
│   │   └── vsm-metrics.tsx
│   ├── charts/
│   │   ├── pareto-chart.tsx
│   │   └── bell-curve-chart.tsx
│   ├── fishbone/
│   │   └── fishbone-builder.tsx
│   ├── fmea/
│   │   └── fmea-table.tsx
│   ├── recommendations/
│   │   ├── recommendation-card.tsx
│   │   └── recommendation-form.tsx
│   └── shared/
│       ├── calculation-tooltip.tsx
│       ├── auto-save-indicator.tsx
│       └── loading-spinner.tsx
├── lib/
│   ├── auth.ts                     # NextAuth.js configuration
│   ├── services/                   # Business logic layer
│   │   ├── assignment.service.ts
│   │   ├── process.service.ts
│   │   ├── voc.service.ts
│   │   ├── sipoc.service.ts
│   │   ├── vsm.service.ts
│   │   ├── fishbone.service.ts
│   │   ├── fmea.service.ts
│   │   ├── recommendation.service.ts
│   │   ├── audit-log.service.ts
│   │   └── pdf-generation.service.ts
│   ├── calculations/               # Pure calculation functions
│   │   ├── pareto.ts
│   │   ├── capability.ts           # Cp, Cpk, Sigma Level
│   │   └── fmea.ts                 # RPN calculation
│   ├── stores/                     # Zustand state management
│   │   ├── assignment.store.ts
│   │   └── ui.store.ts
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAutoSave.ts
│   │   ├── usePermissions.ts
│   │   └── useAssignment.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── audit.middleware.ts
│   ├── prisma/
│   │   └── client.ts               # Prisma singleton
│   ├── utils/
│   │   ├── api-client.ts
│   │   ├── format.ts
│   │   └── validation.ts
│   └── types/
│       └── index.ts                # Shared TypeScript types
├── prisma/
│   ├── schema.prisma               # Database schema
│   ├── migrations/                 # Migration history
│   └── seed.ts                     # Seed data script
├── public/
│   ├── fonts/                      # Custom fonts
│   └── images/                     # Static images
├── tests/
│   ├── unit/
│   │   ├── calculations/
│   │   │   ├── pareto.test.ts
│   │   │   ├── capability.test.ts
│   │   │   └── fmea.test.ts
│   │   └── services/
│   │       └── assignment.service.test.ts
│   ├── integration/
│   │   └── api/
│   │       └── assignments.test.ts
│   └── e2e/
│       └── assignment-workflow.spec.ts
├── docs/
│   ├── prd.md                      # Product Requirements Document
│   ├── brief.md                    # Project Brief
│   └── architecture.md             # This document
├── .env.example                    # Environment variables template
├── .env.local                      # Local development secrets (gitignored)
├── .eslintrc.json                  # ESLint configuration
├── .prettierrc                     # Prettier configuration
├── next.config.js                  # Next.js configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies and scripts
├── pnpm-lock.yaml                  # pnpm lockfile
├── vitest.config.ts                # Vitest configuration
├── playwright.config.ts            # Playwright E2E configuration
└── README.md                       # Project documentation
```

---

## Development Workflow

### Local Development Setup

**Prerequisites:**

```bash
# Install Node.js 18+ LTS
node --version  # Should be 18.x or higher

# Install pnpm globally
npm install -g pnpm

# Install Docker Desktop (for local PostgreSQL)
# Download from https://www.docker.com/products/docker-desktop
```

**Initial Setup:**

```bash
# Clone repository
git clone <repository-url>
cd bpi-assignment-platform

# Install dependencies
pnpm install

# Copy environment variables template
cp .env.example .env.local

# Edit .env.local with your values:
# DATABASE_URL="postgresql://user:password@localhost:5432/bpi_platform"
# NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
# NEXTAUTH_URL="http://localhost:3000"

# Start local PostgreSQL via Docker
docker-compose up -d postgres

# Run database migrations and seed data
pnpm prisma migrate dev
pnpm prisma db seed

# Generate Prisma Client
pnpm prisma generate

# Start development server
pnpm dev
```

**Development Commands:**

```bash
# Start all services (Next.js dev server)
pnpm dev

# Start Next.js only (no database)
pnpm next dev

# Run tests
pnpm test                # Run all tests (Vitest + Playwright)
pnpm test:unit           # Unit tests only
pnpm test:integration    # Integration tests only
pnpm test:e2e            # End-to-end tests only

# Run linters
pnpm lint                # ESLint
pnpm format              # Prettier

# Database commands
pnpm prisma studio       # Open Prisma Studio (database GUI)
pnpm prisma migrate dev  # Create and apply migration
pnpm prisma db seed      # Run seed script
```

### Environment Configuration

**Required Environment Variables:**

```bash
# Frontend (.env.local - loaded by Next.js)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend (.env.local - server-side only)
DATABASE_URL=postgresql://user:password@localhost:5432/bpi_platform
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Optional (for production)
VERCEL_URL=https://bpi-platform.vercel.app
SENTRY_DSN=https://xxx@sentry.io/xxx
```

**Docker Compose for Local PostgreSQL:**

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    container_name: bpi_postgres
    environment:
      POSTGRES_USER: bpiuser
      POSTGRES_PASSWORD: bpipass
      POSTGRES_DB: bpi_platform
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## Deployment Architecture

### Deployment Strategy

**Frontend Deployment:**
- **Platform:** Vercel (Next.js native deployment)
- **Build Command:** `pnpm build`
- **Output Directory:** `.next`
- **CDN/Edge:** Vercel Edge Network with automatic CDN caching for static assets

**Backend Deployment:**
- **Platform:** Vercel Serverless Functions (Next.js API routes auto-deployed)
- **Build Command:** Included in frontend build
- **Deployment Method:** Git push to `main` branch triggers automatic deployment

**Database Deployment:**
- **Platform:** Supabase PostgreSQL (managed service)
- **Connection Pooling:** Built-in with Supabase
- **Migrations:** Automatic via `prisma migrate deploy` in build step

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run linter
        run: pnpm lint

      - name: Run type check
        run: pnpm tsc --noEmit

      - name: Run unit tests
        run: pnpm test:unit

      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Build project
        run: pnpm build

  e2e-tests:
    runs-on: ubuntu-latest
    needs: lint-and-test

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/

  deploy:
    runs-on: ubuntu-latest
    needs: [lint-and-test, e2e-tests]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|--------------|-------------|---------|
| Development | http://localhost:3000 | http://localhost:3000/api | Local development and testing |
| Staging | https://bpi-platform-staging.vercel.app | https://bpi-platform-staging.vercel.app/api | Pre-production testing and QA |
| Production | https://bpi-platform.vercel.app | https://bpi-platform.vercel.app/api | Live environment for end users |

**Branch Strategy:**
- `main` → Production deployment
- `staging` → Staging deployment
- `feature/*` → Ephemeral preview deployments (Vercel auto-generates URLs)

---

## Security and Performance

### Security Requirements

**Frontend Security:**
- **CSP Headers:** `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';` (configured in `next.config.js`)
- **XSS Prevention:** React auto-escapes JSX, DOMPurify for user-provided rich text (future)
- **Secure Storage:** Session tokens in httpOnly cookies, no localStorage for sensitive data

**Backend Security:**
- **Input Validation:** Zod schemas for all API route inputs, enforce max lengths and data types
- **Rate Limiting:** Vercel Edge Functions have built-in DDoS protection; consider Upstash Redis for API-level rate limiting (future)
- **CORS Policy:** `Access-Control-Allow-Origin` limited to frontend domain only

**Authentication Security:**
- **Token Storage:** JWT session tokens in httpOnly, secure, sameSite=strict cookies
- **Session Management:** 7-day expiration, sliding window refresh
- **Password Policy:** Minimum 8 characters, bcrypt hashing with salt rounds=10

### Performance Optimization

**Frontend Performance:**
- **Bundle Size Target:** <300KB initial JS bundle (Tailwind purging, tree-shaking)
- **Loading Strategy:**
  - Server Components for initial page loads
  - Dynamic imports for large components (Fishbone builder, charts)
  - React.lazy for code splitting
- **Caching Strategy:**
  - Static assets cached for 1 year (immutable)
  - API responses cached with stale-while-revalidate (React Query)
  - Image optimization via Next.js Image component

**Backend Performance:**
- **Response Time Target:** <500ms for API routes (p95), <2s for page loads
- **Database Optimization:**
  - Prisma connection pooling (max 10 connections)
  - Indexes on foreign keys and frequently queried fields
  - Eager loading with `include` to avoid N+1 queries
- **Caching Strategy:**
  - React Query for client-side caching (5-minute stale time)
  - Edge caching for read-only completed assignments

---

## Testing Strategy

### Testing Pyramid

```
        E2E Tests (Playwright)
        /                    \
   Integration Tests (API Routes)
  /                              \
Unit Tests (Calculations, Services)
```

### Test Organization

**Frontend Tests:**

```
tests/unit/
  ├── calculations/
  │   ├── pareto.test.ts          # Pareto calculation logic
  │   ├── capability.test.ts      # Cp/Cpk/Sigma Level
  │   └── fmea.test.ts            # RPN calculation
  ├── components/
  │   ├── pareto-chart.test.tsx   # Chart rendering
  │   └── sipoc-grid.test.tsx     # Grid interactions
  └── hooks/
      └── useAutoSave.test.ts     # Auto-save hook logic
```

**Backend Tests:**

```
tests/integration/
  └── api/
      ├── assignments.test.ts     # Assignment CRUD operations
      ├── voc.test.ts             # VOC/CTQ endpoints
      ├── processes.test.ts       # Process management
      └── auth.test.ts            # Authentication flows
```

**E2E Tests:**

```
tests/e2e/
  ├── assignment-workflow.spec.ts  # Complete assignment creation flow
  ├── authentication.spec.ts       # Login/logout/session
  ├── role-based-access.spec.ts    # Permission testing
  └── pdf-export.spec.ts           # PDF generation workflow
```

### Test Examples

**Frontend Component Test:**

```typescript
// tests/unit/components/pareto-chart.test.tsx
import { render, screen } from '@testing-library/react';
import { ParetoChart } from '@/components/charts/pareto-chart';

describe('ParetoChart', () => {
  const mockData = [
    { stepName: 'Step 1', duration: 50, cumulativePercent: 50 },
    { stepName: 'Step 2', duration: 30, cumulativePercent: 80 },
    { stepName: 'Step 3', duration: 20, cumulativePercent: 100 },
  ];

  it('renders bars for each step', () => {
    render(<ParetoChart data={mockData} />);
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
  });

  it('shows 80% threshold line', () => {
    render(<ParetoChart data={mockData} />);
    expect(screen.getByText('80% threshold')).toBeInTheDocument();
  });

  it('displays empty state when no data', () => {
    render(<ParetoChart data={[]} />);
    expect(screen.getByText(/add at least 2 process steps/i)).toBeInTheDocument();
  });
});
```

**Backend API Test:**

```typescript
// tests/integration/api/assignments.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma/client';
import { testClient } from '../helpers/test-client';

describe('POST /api/assignments', () => {
  let userId: string;

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'BPI_TEAM',
        passwordHash: 'hashed',
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: userId } });
  });

  it('creates assignment with DRAFT status', async () => {
    const response = await testClient.post('/api/assignments', {
      body: {
        title: 'Test Assignment',
        objective: 'Test objective',
      },
      headers: {
        'x-user-id': userId, // Mock auth
      },
    });

    expect(response.status).toBe(200);
    expect(response.data.status).toBe('DRAFT');
    expect(response.data.title).toBe('Test Assignment');
  });

  it('returns 401 if not authenticated', async () => {
    const response = await testClient.post('/api/assignments', {
      body: { title: 'Test', objective: 'Test' },
    });

    expect(response.status).toBe(401);
    expect(response.error.code).toBe('UNAUTHORIZED');
  });
});
```

**E2E Test:**

```typescript
// tests/e2e/assignment-workflow.spec.ts
import { test, expect } from '@playwright/test';

test('complete assignment workflow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('input[name="email"]', 'analyst@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/assignments');

  // Create new assignment
  await page.click('text=New Assignment');
  await page.fill('input[name="title"]', 'E2E Test Assignment');
  await page.fill('textarea[name="objective"]', 'Test objective');
  await page.click('button:has-text("Create")');
  await expect(page).toHaveURL(/\/assignments\/[a-z0-9-]+\/voc/);

  // Add VOC statement
  await page.click('text=Add VOC Statement');
  await page.fill('input[name="customerSegment"]', 'Internal Users');
  await page.fill('textarea[name="voiceStatement"]', 'Process is too slow');
  await page.click('button:has-text("Save")');
  await expect(page.locator('text=Process is too slow')).toBeVisible();

  // Navigate to SIPOC
  await page.click('text=Processes');
  await page.click('text=Add Process');
  await page.fill('input[name="processName"]', 'Order Fulfillment');
  await page.click('button:has-text("Create")');
  await page.click('text=SIPOC');

  // Add SIPOC entry
  await page.click('text=Add Row');
  await page.fill('.sipoc-grid input', 'Customer Order');
  await page.click('body'); // Trigger auto-save
  await expect(page.locator('text=All changes saved')).toBeVisible();

  // Verify assignment status is DRAFT
  await expect(page.locator('[data-status="DRAFT"]')).toBeVisible();
});
```

---

## Coding Standards

### Critical Fullstack Rules

- **Type Sharing:** Always define types in `/lib/types` and import across frontend/backend - never duplicate type definitions
- **API Calls:** Never make direct `fetch()` calls in components - use service layer methods from `/lib/services`
- **Environment Variables:** Access only through config objects in `/lib/config.ts`, never `process.env` directly in components
- **Error Handling:** All API routes must use `handleAPIError()` wrapper for consistent error responses
- **State Updates:** Never mutate Zustand state directly - use state setter functions
- **Prisma Client:** Always use singleton from `/lib/prisma/client.ts`, never create new instances
- **Auto-Save:** All editable forms must integrate `useAutoSave` hook with 2-second debounce
- **Authorization:** Every API route modifying data must call `requireAuth()` or `requireRole()` middleware
- **Calculation Functions:** All Six Sigma calculations must live in `/lib/calculations` as pure functions with 100% test coverage
- **Database Queries:** Use Prisma `include` for eager loading, avoid N+1 queries by fetching related data upfront

### Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `AssignmentHeader.tsx` |
| Hooks | camelCase with 'use' | - | `useAutoSave.ts` |
| Services | PascalCase | PascalCase | `AssignmentService` |
| API Routes | kebab-case | kebab-case | `/api/assignments/[id]/voc/statements` |
| Database Tables | snake_case | snake_case | `voc_statements` |
| Database Fields | camelCase (Prisma) | camelCase | `createdById` |
| React Props | camelCase | - | `isLoading`, `onSubmit` |
| Functions | camelCase | camelCase | `calculatePareto()` |
| Constants | SCREAMING_SNAKE_CASE | SCREAMING_SNAKE_CASE | `MAX_SIPOC_ENTRIES` |

---

## Error Handling Strategy

### Error Flow

```mermaid
sequenceDiagram
    participant UI as Frontend Component
    participant Service as API Service
    participant API as API Route
    participant DB as Database

    UI->>Service: Call service method
    Service->>API: Fetch /api/assignments/[id]

    alt Success
        API->>DB: Query database
        DB-->>API: Return data
        API-->>Service: 200 OK with data
        Service-->>UI: Return data
        UI->>UI: Render success state
    else Validation Error
        API->>API: Validate input
        API-->>Service: 400 Bad Request with field errors
        Service-->>UI: Throw APIError
        UI->>UI: Show field-level errors
    else Authorization Error
        API->>API: Check permissions
        API-->>Service: 403 Forbidden
        Service-->>UI: Throw APIError
        UI->>UI: Show "Access denied" message
    else Server Error
        API->>DB: Query fails
        DB--xAPI: Database error
        API->>API: Log error to Sentry
        API-->>Service: 500 Internal Server Error
        Service-->>UI: Throw APIError
        UI->>UI: Show "Something went wrong. Please try again."
    end
```

### Error Response Format

```typescript
interface ApiError {
  error: {
    code: string;           // 'UNAUTHORIZED', 'VALIDATION_ERROR', 'NOT_FOUND', etc.
    message: string;        // Human-readable message for display
    details?: Record<string, any>; // Field-level errors for forms
    timestamp: string;      // ISO 8601 timestamp
    requestId: string;      // Unique ID for debugging
  };
}
```

### Frontend Error Handling

```typescript
// lib/utils/api-client.ts
export class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: any,
    public requestId?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function apiClient<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new APIError(
        error.error.code,
        error.error.message,
        response.status,
        error.error.details,
        error.error.requestId
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Network error or JSON parsing error
    throw new APIError(
      'NETWORK_ERROR',
      'Unable to connect to server. Please check your internet connection.',
      0
    );
  }
}

// Usage in component:
try {
  await AssignmentService.create({ title, objective });
} catch (error) {
  if (error instanceof APIError) {
    if (error.code === 'VALIDATION_ERROR') {
      // Show field-level errors
      setFormErrors(error.details);
    } else {
      // Show toast notification
      toast.error(error.message);
    }
  }
}
```

### Backend Error Handling

```typescript
// lib/middleware/error.middleware.ts
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export function handleAPIError(error: unknown): NextResponse {
  const requestId = crypto.randomUUID();

  // Log to Sentry
  Sentry.captureException(error, {
    tags: { requestId },
  });

  // Known application errors
  if (error instanceof Error) {
    if (error.message.includes('not found')) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Resource not found',
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        { status: 404 }
      );
    }

    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to perform this action',
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        { status: 403 }
      );
    }
  }

  // Generic server error (don't expose internal details)
  console.error('Unhandled API error:', error);
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred. Please try again later.',
        timestamp: new Date().toISOString(),
        requestId,
      },
    },
    { status: 500 }
  );
}

// Usage in API route:
try {
  const assignment = await AssignmentService.create(data, userId);
  return NextResponse.json({ data: assignment });
} catch (error) {
  return handleAPIError(error);
}
```

---

## Monitoring and Observability

### Monitoring Stack

- **Frontend Monitoring:** Vercel Analytics (Core Web Vitals, page load times, user sessions)
- **Backend Monitoring:** Vercel Logs (API route execution, function duration, errors)
- **Error Tracking:** Sentry (client and server error capture, release tracking, breadcrumbs)
- **Performance Monitoring:** Vercel Speed Insights (Real User Monitoring for page performance)

### Key Metrics

**Frontend Metrics:**
- **Core Web Vitals:**
  - LCP (Largest Contentful Paint) < 2.5s
  - FID (First Input Delay) < 100ms
  - CLS (Cumulative Layout Shift) < 0.1
- **JavaScript Errors:** Error rate < 1% of page views
- **API Response Times:** p95 < 1s for all API calls from frontend
- **User Interactions:** Button clicks, form submissions, navigation events

**Backend Metrics:**
- **Request Rate:** Total requests per minute, by endpoint
- **Error Rate:** 5xx errors < 1% of total requests
- **Response Time:**
  - p50 < 200ms
  - p95 < 500ms
  - p99 < 1s
- **Database Query Performance:** Slow queries (>1s) logged and alerted

**Business Metrics:**
- **Assignment Creation Rate:** New assignments per day/week
- **Assignment Completion Rate:** % of DRAFT assignments marked COMPLETED within 30 days
- **User Activity:** Active users per day, logins per day
- **Feature Adoption:** % of assignments using each feature (SIPOC, VSM, FMEA, etc.)

### Alerting Thresholds

- **Critical (PagerDuty/Slack):**
  - Error rate > 5% for 5 minutes
  - API response time p95 > 5s for 5 minutes
  - Authentication failures > 100/minute
  - Database connection pool exhausted
- **Warning (Slack only):**
  - Error rate > 2% for 10 minutes
  - API response time p95 > 2s for 10 minutes
  - Disk usage > 80%

### Logging Strategy

**Structured Logging:**

```typescript
// lib/utils/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
});

// Usage:
logger.info({ assignmentId, userId }, 'Assignment created');
logger.error({ error, assignmentId }, 'Failed to complete assignment');
```

**Log Levels:**
- **ERROR:** Application errors, failed requests, database errors
- **WARN:** Validation failures, rate limit warnings, deprecated API usage
- **INFO:** State transitions, user actions, successful operations
- **DEBUG:** Detailed execution flow, query details (development only)

---

## Checklist Results Report

*(To be populated after architecture review)*

This section will contain the results of executing the architect-checklist validation. The checklist ensures:
- All PRD requirements have architectural solutions
- Technology choices are justified and consistent
- Performance targets are achievable with proposed architecture
- Security requirements are addressed at all layers
- Scalability and maintainability considerations are documented

---

## Next Steps

### Immediate Actions (Before Development)

1. **Environment Setup:**
   - Create Vercel project and link to Git repository
   - Create Supabase project and obtain database connection string
   - Configure environment variables in Vercel dashboard
   - Set up Sentry project for error tracking

2. **Repository Initialization:**
   - Run `npx create-next-app@latest bpi-assignment-platform --typescript --tailwind --app`
   - Install dependencies: `pnpm add prisma @prisma/client next-auth bcryptjs zustand react-query recharts puppeteer zod`
   - Initialize Prisma: `npx prisma init`
   - Copy Prisma schema from this document to `prisma/schema.prisma`
   - Configure shadcn/ui: `npx shadcn-ui@latest init`

3. **Architecture Validation:**
   - Review this document with development team
   - Validate database schema with Six Sigma SME
   - Confirm calculation formulas match organizational standards
   - Test PDF generation library (Puppeteer) with sample charts

4. **Development Kickoff (Epic 1, Story 1.1):**
   - Set up project structure according to "Unified Project Structure"
   - Configure ESLint, Prettier, Husky pre-commit hooks
   - Create Docker Compose file for local PostgreSQL
   - Run initial Prisma migration and seed script
   - Deploy "Hello World" version to Vercel to validate deployment pipeline

### Recommended Review Cycles

- **Weekly Architecture Reviews:** First 4 weeks to address emerging questions
- **Mid-Epic Retrospectives:** After Epic 2, 4, 6 to assess if architecture decisions are working
- **Pre-Production Review:** Before MVP launch to validate performance, security, and operational readiness

---

*Document prepared using BMAD™ Core fullstack architecture template v2.0*