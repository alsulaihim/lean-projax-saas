# BPI Assignment Platform Product Requirements Document (PRD)

**Version:** 1.1
**Date:** 2025-10-17
**Prepared by:** John (PM Agent) 📋

---

## Goals and Background Context

### Goals

- Reduce BPI assignment report creation time by 60-70% through automation of calculations, charts, and formatting
- Enable BPI teams to complete assignments in 2-3 weeks instead of 4-6 weeks (40% cycle time reduction)
- Achieve 100% calculation accuracy for Six Sigma metrics (Cp, Cpk, Sigma Level, RPN) with zero stakeholder-reported errors
- Improve stakeholder decision quality through professional, interactive, story-driven presentations that trace recommendations to root causes
- Enable real-time collaboration for 5-10 BPI team members working on assignments simultaneously
- Increase team assignment capacity by 50% without additional headcount by eliminating non-analytical work
- Provide executives and process owners with accessible, on-demand access to completed assignments via web dashboard
- Ensure 90% platform adoption within 6 months of launch for all new assignments

### Background Context

BPI teams currently spend 40-50% of their assignment time on manual report formatting, chart creation in separate tools (Excel, Visio, PowerPoint), and ensuring calculation accuracy—reducing time available for actual process improvement analysis. This manual workflow introduces transcription errors, creates collaboration bottlenecks through sequential handoffs and version control issues, and delays stakeholder communication by 2-3 weeks while waiting for final PDF reports. Generic project management tools don't understand Six Sigma frameworks, BI dashboards require data engineering support and don't capture qualitative analysis, and spreadsheet-based systems lack professional presentation capabilities.

The BPI Assignment Platform addresses these pain points by providing a purpose-built web application that guides analysts through the complete Six Sigma lifecycle (VOC/CTQ → Process Analysis → FMEA → Recommendations) with automated calculations, real-time visualizations, and role-based stakeholder access. Built on Next.js with shadcn/ui, the platform follows a story-driven architecture that matches how users think about analytical work, automates mechanical tasks while preserving human expertise for root cause analysis, and provides a dual-mode workflow (Draft for flexible editing, Completed for locked professional presentation). This enables BPI teams to focus 70%+ of their time on analysis rather than document production, while stakeholders receive interactive dashboards instead of static PDFs.

### Change Log

| Date       | Version | Description                                                      | Author          |
| ---------- | ------- | ---------------------------------------------------------------- | --------------- |
| 2025-09-30 | 1.0     | Initial PRD created from Project Brief v1.0                      | John (PM Agent) |
| 2025-10-17 | 1.1     | Added Assignment Charter, AI Analysis, and Enhanced VSM features | John (PM Agent) |

---

## Requirements

### Functional Requirements

**FR1:** Assignment Management - System shall support creating, editing, and managing Six Sigma assignments with Draft and Completed modes, where Draft mode allows flexible editing and Completed mode locks the assignment for stable stakeholder presentation

**FR2:** Voice of Customer (VOC) & Critical to Quality (CTQ) - System shall provide structured form input for capturing customer voice statements and derived CTQ requirements as the foundation for each assignment

**FR3:** Multi-Process Analysis - System shall support analyzing multiple processes per assignment, where each process has its own complete SIPOC → VSM → Pareto → Fishbone → Process Capability workflow

**FR4:** SIPOC Data Entry - System shall provide a spreadsheet-like grid interface for entering Suppliers, Inputs, Process steps, Outputs, and Customers with inline validation

**FR5:** Value Stream Mapping (VSM) - System shall capture process step data including step name, process time, waiting time, value measure classification (Value Added, Essential Non-Value Added, Non-Value Added), waste type categorization (Transport, Inventory, Motion, Waiting, Over Production, Over Processing, Defects, Skills), stakeholder information, and remarks for each process being analyzed

**FR6:** Automated Pareto Chart Generation - System shall automatically generate Pareto charts (bar chart with cumulative line showing 80/20 rule) from VSM step durations, updating in real-time as data changes

**FR7:** Fishbone Diagram Builder - System shall provide a template-driven interface for creating Fishbone diagrams with 6 standard categories (People, Process, Equipment, Materials, Environment, Management) and free-text root cause entry

**FR8:** FMEA (Failure Mode and Effects Analysis) - System shall provide a table interface for capturing failure modes with Severity, Occurrence, and Detection ratings (1-10 scale) and automatically calculate Risk Priority Number (RPN = S × O × D)

**FR9:** Recommendations Management - System shall provide structured form input for actionable recommendations including description, expected impact, implementation difficulty, and traceability to root causes from Fishbone/FMEA

**FR10:** Story-Driven Navigation - System shall organize navigation following analytical narrative flow: VOC/CTQ → Process Tabs (one per process) → FMEA → Recommendations, allowing users to progress sequentially through the workflow

**FR11:** PDF Export - System shall generate a single-document PDF export of the entire assignment with professional formatting suitable for executive presentation and archival

**FR12:** Auto-Save - System shall automatically save user input every 30 seconds or on significant data changes to prevent data loss during interruptions

**FR13:** User Authentication - System shall require user login and maintain session state throughout assignment editing

**FR14:** Role-Based Access Control - System shall implement role-based permissions for BPI Team (create/edit assignments), Team Lead (review/approve), Executive (view completed), and Process Owner (view completed, scoped to relevant processes)

**FR15:** Assignment State Transitions - System shall enforce state transitions: New → Draft (editing enabled) → Completed (locked) → Reopened for Editing (with audit trail)

**FR16:** Process Capability Calculations - System shall calculate Cp, Cpk, and Sigma Level metrics from process data with specification limits provided by user

**FR17:** Data Validation - System shall validate required fields, numeric ranges (e.g., FMEA ratings 1-10), and data completeness before allowing transition to Completed state

**FR18:** Calculation Transparency - System shall provide "show your work" tooltips displaying formulas and intermediate values for all automated calculations (Pareto rankings, RPN, Cp/Cpk)

**FR19:** Assignment Charter - System shall provide a comprehensive charter section capturing assignment information (sponsor, process owner, program management, project team), project overview (strategic alignment, problem statement, business case, goal metrics, deliverables), project scope (in/out of scope), customer drivers and benefits, leverage opportunities (existing and future), risk/constraints/assumptions, business stakeholders, and milestone schedule with start/end dates

**FR20:** AI-Powered Analysis - System shall integrate with OpenAI GPT-4 to provide automated insights and interactive chat capabilities for completed assignments, including AI Assessment (overview, key insights, deep insights, metrics analysis) and AI Chat (contextual question-answering about assignment data)

**FR21:** CTQ Requirements Linkage - System shall support linking CTQ (Critical to Quality) requirements to specific VOC (Voice of Customer) statements to establish traceability from customer needs to measurable quality requirements

### Non-Functional Requirements

**NFR1:** Performance - System shall load assignment pages in <2 seconds for typical assignments (up to 10 processes, 50 SIPOC steps per process) and generate charts in <500ms after data input

**NFR2:** Calculation Accuracy - System shall achieve 100% accuracy for all Six Sigma calculations (Pareto, RPN, Cp, Cpk, Sigma Level) with comprehensive unit test coverage and SME validation

**NFR3:** Concurrency - System shall support 20+ concurrent BPI team members editing different assignments and 100+ stakeholders viewing completed assignments simultaneously

**NFR4:** Browser Support - System shall support modern browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ (no IE11 required)

**NFR5:** Responsive Design - System shall provide optimized layouts for desktop/laptop screens 1024px+ width (tablet and mobile optimization deferred to Phase 2)

**NFR6:** Data Integrity - System shall prevent data loss through auto-save functionality, transaction-based database updates, and backup mechanisms

**NFR7:** Security - System shall enforce HTTPS-only connections, secure authentication (NextAuth.js or Supabase Auth), and row-level security preventing unauthorized access to assignments

**NFR8:** Audit Logging - System shall log all assignment state changes, user edits, and access attempts for compliance and troubleshooting

**NFR9:** Scalability - System shall support 30-50 assignments per year with 2-year growth capacity without architectural changes

**NFR10:** Maintainability - System shall follow TypeScript strict mode, modular component architecture, and comprehensive code documentation to enable future enhancements

**NFR11:** Deployment - System shall support serverless deployment on Vercel with edge runtime optimization and automated CI/CD pipelines

**NFR12:** Cost Constraints - System shall operate within $200/month SaaS budget (Vercel Pro, Supabase, storage) for MVP and Phase 2

---

## User Interface Design Goals

### Overall UX Vision

The BPI Assignment Platform embraces a **clean, professional, data-centric aesthetic** that prioritizes clarity and efficiency over visual embellishment. Using a black and white theme inspired by analytical rigor, the interface guides users through a **story-driven workflow** that mirrors the Six Sigma methodology's logical progression from problem identification to solution recommendation. The system acts as an **intelligent assistant** that automates mechanical tasks (calculations, chart generation) while keeping human expertise at the center of qualitative analysis. Every screen reinforces the narrative: "What did customers say?" → "What processes are involved?" → "Where are the bottlenecks?" → "What's causing them?" → "What should we do?"

### Key Interaction Paradigms

**Sequential Workflow with Progressive Disclosure:** Users navigate left-to-right through workflow stages (Charter → VOC/CTQ → Process 1 → Process 2 → FMEA → Recommendations → AI Analysis), with visual indicators showing completion status. Sections unlock progressively as prerequisites are met.

**Hybrid Data Entry Modes:** Forms for qualitative inputs (VOC statements, recommendations), spreadsheet grids for tabular data (SIPOC, VSM, FMEA), and future CSV upload for bulk data. Each interaction matches real-world data collection patterns.

**Instant Visualization Feedback:** Charts and diagrams update in real-time as users enter data, providing immediate validation that inputs are correct and reinforcing the story being told.

**Context-Sensitive Help:** Tooltips on calculations show formulas ("RPN = Severity × Occurrence × Detection"), methodology guidance appears inline (e.g., "Value-added time directly contributes to customer requirements"), and examples illustrate expected inputs.

**State-Aware Actions:** Draft mode shows "Save" and "Mark as Complete" buttons; Completed mode displays "Reopen for Editing" with warning; stakeholder read-only view hides all editing controls.

### Core Screens and Views

1. **Assignment Dashboard** - List of all assignments with status, assigned team members, and last modified date; filtering by status/owner
2. **Assignment Creation Wizard** - Initial form capturing assignment name, objective, team members, and target completion date
3. **Assignment Charter Form** - Comprehensive charter section with assignment information, project overview, scope definition, customer drivers, leverage opportunities, risks/constraints/assumptions, stakeholders, and milestone schedule
4. **VOC/CTQ Input Form** - Structured entry for customer voice statements and derived CTQ requirements with linkage between VOC and CTQ items
5. **Process Overview Tab** - High-level view showing all processes in the assignment with navigation to detailed process analysis
6. **SIPOC Grid Editor** - Spreadsheet interface for Suppliers, Inputs, Process, Outputs, Customers
7. **VSM Data Entry Table** - Process steps with process time, waiting time, value measure classification (VA/ENVA/NVA), waste type (TIMWOODS), stakeholder, remarks, and calculated metrics
8. **Pareto Chart View** - Auto-generated bar chart with cumulative line, drill-down to underlying VSM data
9. **Fishbone Diagram Builder** - Interactive diagram with 6 category branches and editable root cause nodes
10. **Process Capability Dashboard** - Input specification limits, view calculated Cp/Cpk/Sigma Level, bell curve visualization
11. **FMEA Table Editor** - Failure modes with S/O/D ratings and auto-calculated RPN, sortable by risk score
12. **Recommendations Form** - Structured input for solutions with impact assessment and root cause traceability
13. **AI Analysis Tab** - AI-powered insights for completed assignments with two sub-tabs: Assessment (overview, key insights, deep insights, metrics) and Chat (interactive Q&A assistant)
14. **PDF Preview & Export** - Preview full report layout before generating final PDF with custom branding options
15. **Team Lead Dashboard** - Overview of all team assignments, progress tracking, validation alerts, approval queue
16. **Executive Summary View** - At-a-glance findings, recommendations, and key metrics for completed assignments
17. **User Profile & Settings** - Role management, notification preferences, default assignment templates

### Accessibility: WCAG AA

Comply with WCAG 2.1 Level AA standards including keyboard navigation for all interactive elements, sufficient color contrast (black/white theme naturally supports this), screen reader compatibility for data tables and charts, clear focus indicators, and skip navigation links.

### Branding

**Minimalist Black & White Theme:** Clean, professional aesthetic using shadcn/ui components with minimal color (black text, white backgrounds, gray borders/shading for emphasis). Charts use grayscale gradients with pattern fills for differentiation. Typography emphasizes hierarchy through weight and size rather than color.

**Data-First Design Language:** Visual design defers to content—large, readable data tables; prominent charts; clear section headings. No decorative elements that compete with analytical artifacts.

**Professional PDF Output:** Exported reports maintain clean black/white aesthetic with organizational logo placement (configurable), professional typography, and consistent spacing matching executive presentation standards.

### Target Device and Platforms: Web Responsive (Desktop Priority)

Primary: Desktop/laptop browsers 1024px+ width (analysts working at desks)
Secondary: Tablet landscape orientation 768px+ (team leads reviewing on iPad)
Deferred to Phase 2: Mobile phones, tablet portrait mode, offline progressive web app

---

## Technical Assumptions

### Repository Structure: Monorepo

Single repository containing all frontend and backend code, shared utilities, database schema definitions, and documentation. This simplifies dependency management, enables atomic cross-layer changes, and reduces coordination overhead for the single full-stack developer.

**Rationale:** With one developer and tightly coupled frontend/backend (Next.js API routes), monorepo eliminates the complexity of managing multiple repositories, versioning across repos, and coordinating deployments. Feature development touches UI, API, and database simultaneously—monorepo makes this seamless.

**Structure:**

```
/app          - Next.js 14+ app router pages and layouts
/components   - Reusable React components (shadcn/ui + custom)
/lib          - Business logic, calculation engines, utilities
/prisma       - Database schema and migrations
/public       - Static assets
/tests        - Unit and integration tests
```

### Service Architecture

**Monolithic Next.js application with serverless API routes**

- **Frontend:** Next.js 14+ App Router with server-side rendering for initial page loads, client-side navigation thereafter
- **Backend:** Next.js API routes as serverless functions handling business logic, database queries, and PDF generation
- **Database:** PostgreSQL via Prisma ORM with connection pooling
- **File Storage:** Vercel Blob or AWS S3 for CSV uploads and generated PDFs (future)

**Rationale:** Monolithic architecture matches team size (1 developer) and scale requirements (30-50 assignments/year, 20 concurrent users). Microservices would add operational complexity (service discovery, inter-service communication, distributed debugging) without scalability benefits at this volume. Next.js serverless functions provide automatic scaling and zero-downtime deployments while keeping the codebase unified.

**Technology Stack:**

- **Frontend:** Next.js 14+, React 18+, TypeScript, shadcn/ui, Tailwind CSS
- **Charting:** Recharts or Chart.js for Pareto, process capability curves
- **Diagrams:** React Flow or custom SVG for Fishbone diagrams (future: Mermaid for Process Flow)
- **Backend:** Next.js API routes, TypeScript
- **Database:** PostgreSQL 15+, Prisma ORM
- **Authentication:** NextAuth.js or Supabase Auth
- **AI Integration:** OpenAI GPT-4 API for automated insights and chat functionality
- **PDF Generation:** react-pdf or Puppeteer for server-side rendering
- **Hosting:** Vercel (Next.js native platform)
- **CI/CD:** Vercel automatic deployments from main branch, preview deployments for PRs

### Testing Requirements

**Unit + Integration Testing** (Full Testing Pyramid deferred to Phase 2)

**MVP Testing Strategy:**

- **Unit Tests (High Priority):** Comprehensive coverage for all calculation functions (Pareto sorting, RPN, Cp/Cpk, Sigma Level) using Jest. 100% coverage for `/lib/calculations` module with edge case testing (zero values, missing data, outliers). This is CRITICAL for NFR2 (calculation accuracy).
- **Integration Tests (Selective):** API route testing for state transitions (Draft → Completed), data validation, and authorization checks using Jest + Supertest or Vitest.
- **Manual Testing (UAT):** User acceptance testing with 3-5 pilot analysts for workflow validation, UI/UX feedback, and real assignment completion.
- **SME Validation:** Six Sigma subject matter expert validates calculation formulas and outputs against manual calculations.

**Phase 2 Testing Expansion:**

- E2E tests using Playwright for critical user journeys
- Visual regression testing for PDF exports
- Performance testing for concurrent user scenarios

**Testing Utilities:**

- Seed scripts for test data (sample assignments with known calculation outputs)
- Test fixtures for common scenarios (single process, multi-process, edge cases)
- Calculation verification spreadsheet for manual cross-checking

### Additional Technical Assumptions and Requests

**Database Design:**

- Multi-tenancy not required (single organization deployment)
- Row-level security enforcing assignment access by user role
- Soft deletes for assignments (audit trail preservation)
- Normalized schema with assignment → processes → artifacts relationships
- JSON fields for flexible metadata storage (Fishbone categories, recommendation tags)

**State Management:**

- Zustand for client-side global state (current assignment, unsaved changes indicator)
- React Query or SWR for server state caching and optimistic updates
- Auto-save debouncing (30-second idle timeout) with visual confirmation

**Code Quality:**

- TypeScript strict mode enforced
- ESLint + Prettier for code formatting and linting
- Husky pre-commit hooks for linting and type-checking
- Conventional Commits for git history clarity

**Development Environment:**

- Node.js 18+ LTS
- pnpm for package management (faster than npm, workspace support)
- VS Code as recommended IDE with project-specific extensions config
- Local PostgreSQL via Docker Compose for development consistency

**Security:**

- Environment variables for secrets (database URL, auth keys)
- HTTPS enforced in production (Vercel default)
- CSRF protection on state-mutating API routes
- Input sanitization for user-provided text (XSS prevention)
- SQL injection protection via Prisma parameterized queries

**Performance Optimizations:**

- React Server Components where appropriate (App Router default)
- Dynamic imports for large components (Fishbone diagram builder)
- Database query optimization (eager loading, indexing on frequently queried fields)
- Edge caching for static assets and read-only assignment views

**Deployment:**

- Production branch: `main` (auto-deploy to production)
- Staging branch: `staging` (auto-deploy to preview environment)
- Feature branches deploy to ephemeral Vercel previews
- Database migrations run automatically on deployment via Prisma Migrate
- Rollback strategy: Revert git commit and redeploy previous version

---

## Epic List

**Epic 1: Foundation & Authentication**
_Goal:_ Establish project infrastructure, authentication system, and database foundation while delivering a functional login and basic assignment list view that can be deployed to production.

**Epic 2: Assignment Core Workflow & VOC/CTQ**
_Goal:_ Implement the assignment state machine (Draft/Completed modes), story-driven navigation shell, and the first data capture section (VOC/CTQ forms) enabling analysts to create and manage assignments.

**Epic 3: Process Analysis Suite (SIPOC, VSM, Pareto)**
_Goal:_ Build the complete process-level analysis workflow with multi-process support, SIPOC grid editor, VSM data entry, and automated Pareto chart generation demonstrating the platform's core automation value.

**Epic 4: Root Cause Analysis (Fishbone & Process Capability)**
_Goal:_ Deliver root cause identification tools through Fishbone diagram builder and process capability calculations (Cp/Cpk/Sigma Level) connecting process data to analytical insights.

**Epic 5: Risk Assessment & Recommendations (FMEA & Solutions)**
_Goal:_ Complete the analytical narrative with FMEA risk prioritization and recommendations management, establishing full traceability from problems to solutions.

**Epic 6: Stakeholder Experience (PDF Export & Role-Based Access)**
_Goal:_ Enable stakeholder engagement through professional PDF exports, executive summary views, and role-based access controls allowing the platform to serve its full user base beyond BPI analysts.

**Epic 7: Assignment Charter & Project Planning**
_Goal:_ Provide comprehensive project charter functionality enabling BPI teams to document assignment context, scope, strategic alignment, stakeholders, and milestones before beginning detailed analysis work, ensuring executive alignment and clear project boundaries.

**Epic 8: AI-Powered Insights & Intelligence**
_Goal:_ Leverage OpenAI GPT-4 to automate insight generation from completed assignments and provide interactive AI assistance, reducing the time required for report synthesis and enabling stakeholders to quickly understand findings through conversational interfaces.

**Epic 9: Enhanced VSM Analysis (Waste Types & Value Classification)**
_Goal:_ Extend Value Stream Mapping capabilities with TIMWOODS waste categorization and three-tier value measure classification (VA/ENVA/NVA), enabling more sophisticated lean analysis and waste identification aligned with industry best practices.

---

## Epic 1: Foundation & Authentication

**Goal:** Establish the technical foundation for the BPI Assignment Platform by setting up the Next.js monorepo with TypeScript, shadcn/ui black/white theme, PostgreSQL database via Prisma, and authentication system. Deliver a deployable application with user login, basic role-based routing, and an assignment list dashboard demonstrating that the infrastructure successfully supports a simple end-to-end user journey.

### Story 1.1: Project Initialization and Core Dependencies

As a **Developer**,
I want **a properly configured Next.js 14+ project with TypeScript, essential dependencies, and development tooling**,
so that **I have a solid foundation to build features with type safety and code quality standards**.

**Acceptance Criteria:**

1. Next.js 14+ project initialized with App Router and TypeScript strict mode
2. Package manager configured to pnpm with workspace settings
3. Core dependencies installed: React 18+, shadcn/ui, Tailwind CSS, Prisma, NextAuth.js (or Supabase Auth)
4. Development tooling configured: ESLint, Prettier, Husky pre-commit hooks
5. Git repository initialized with `.gitignore` excluding node_modules, .env, and build artifacts
6. Environment variables template (`.env.example`) documented with required keys
7. README.md includes setup instructions and architecture overview
8. Project builds successfully (`npm run build`) and starts in development mode (`npm run dev`)

### Story 1.2: Database Schema and Prisma Setup

As a **Developer**,
I want **a PostgreSQL database connected via Prisma ORM with an initial schema for users and assignments**,
so that **I can persist data with type-safe queries and handle migrations systematically**.

**Acceptance Criteria:**

1. PostgreSQL database provisioned (local Docker Compose for dev, Supabase or managed PostgreSQL for production)
2. Prisma initialized with schema file defining database connection
3. `User` model created with fields: id, email, name, role (enum: BPI_TEAM, TEAM_LEAD, EXECUTIVE, PROCESS_OWNER), createdAt, updatedAt
4. `Assignment` model created with fields: id, title, objective, status (enum: DRAFT, COMPLETED), createdById (FK to User), createdAt, updatedAt
5. Prisma migration generated and applied to development database
6. Prisma Client generated and importable in application code
7. Seed script created populating test users (one per role) and 2 sample assignments
8. Database connection tested successfully from Next.js API route

### Story 1.3: Authentication System with Role-Based Access

As a **user**,
I want **to log in with my credentials and have my role (BPI Team, Team Lead, Executive, Process Owner) recognized**,
so that **I can access features appropriate to my permissions**.

**Acceptance Criteria:**

1. Authentication provider configured (NextAuth.js with credentials provider or Supabase Auth)
2. Login page created at `/login` with email/password form matching black/white theme
3. Session management implemented storing user ID, email, name, and role
4. Protected route middleware created redirecting unauthenticated users to `/login`
5. Role-based access control helper functions created: `requireRole(['BPI_TEAM', 'TEAM_LEAD'])`
6. Logout functionality implemented clearing session and redirecting to login
7. User can log in with seed data credentials and see their role displayed in UI
8. Session persists across page refreshes and expires after 7 days of inactivity

### Story 1.4: shadcn/ui Theme Configuration and Base Layout

As a **Developer**,
I want **shadcn/ui components configured with a black/white minimalist theme and a consistent layout shell**,
so that **all pages share professional styling and navigation structure**.

**Acceptance Criteria:**

1. shadcn/ui initialized with Tailwind CSS configuration
2. Custom theme variables defined for black/white color palette (no color accents except grays)
3. Base components installed: Button, Input, Card, Table, Dialog, Dropdown
4. Root layout (`app/layout.tsx`) created with header, main content area, and optional footer
5. Header includes app logo/name, user profile dropdown (name + role), and logout button
6. Navigation sidebar or top nav created (placeholder links for now)
7. Typography scale established (headings, body, captions) using Tailwind utilities
8. Sample page rendered demonstrates consistent styling and responsive layout (1024px+ optimized)

### Story 1.5: Assignment List Dashboard

As a **BPI Team member**,
I want **to see a list of all assignments I have access to with their status and last modified date**,
so that **I can quickly navigate to assignments I'm working on**.

**Acceptance Criteria:**

1. Dashboard page created at `/assignments` (protected route requiring authentication)
2. API route `/api/assignments` returns assignments based on user role:
   - BPI_TEAM/TEAM_LEAD: All assignments
   - EXECUTIVE/PROCESS_OWNER: Only completed assignments (future: scoped by relevance)
3. Assignments displayed in a table with columns: Title, Status (Draft/Completed), Last Modified, Created By
4. Each row has "Open" button navigating to `/assignments/[id]` (placeholder page for now)
5. "New Assignment" button visible only to BPI_TEAM/TEAM_LEAD roles, navigating to creation form (placeholder)
6. Empty state shown when no assignments exist ("No assignments yet. Create your first one!")
7. Loading state displayed while fetching data
8. Error handling for API failures with user-friendly message

### Story 1.6: Deployment Pipeline and Production Environment

As a **Developer**,
I want **the application automatically deployed to Vercel on every push to main with preview environments for pull requests**,
so that **I can validate changes in production-like environments and ship updates continuously**.

**Acceptance Criteria:**

1. Vercel project linked to Git repository
2. Production environment configured with environment variables (database URL, auth secrets)
3. `main` branch pushes trigger automatic production deployments
4. Pull requests generate preview deployments with unique URLs
5. Database migrations run automatically on deployment via `prisma migrate deploy`
6. Build success/failure notifications configured (email or Slack)
7. Production deployment tested: Login works, assignment list loads with seed data
8. Rollback procedure documented (revert commit + redeploy)

---

## Epic 2: Assignment Core Workflow & VOC/CTQ

**Goal:** Implement the assignment state machine enabling Draft and Completed modes with proper state transitions, build the story-driven navigation shell that will house all analytical sections, and deliver the first data capture capability (VOC/CTQ forms) allowing analysts to begin documenting customer requirements. This epic validates the core workflow architecture and demonstrates the progressive disclosure navigation pattern.

### Story 2.1: Assignment Creation Form

As a **BPI Team member**,
I want **to create a new assignment by providing a title, objective, and selecting team members**,
so that **I can initiate a new Six Sigma analysis project**.

**Acceptance Criteria:**

1. "New Assignment" button on dashboard navigates to `/assignments/new`
2. Form includes fields: Title (required, max 200 chars), Objective (required, textarea, max 1000 chars), Team Members (multi-select dropdown from BPI_TEAM/TEAM_LEAD users)
3. Form validation prevents submission with empty required fields
4. On submit, API route `/api/assignments` (POST) creates assignment with status=DRAFT and createdById=current user
5. Success redirects to `/assignments/[id]` with newly created assignment ID
6. Error handling displays validation errors inline
7. Cancel button returns to dashboard without saving
8. Auto-save not implemented yet (user must explicitly save)

### Story 2.2: Assignment State Machine and Mode Switching

As a **BPI Team member**,
I want **assignments to have Draft mode for flexible editing and Completed mode that locks changes for stakeholder presentation**,
so that **I can work freely during analysis but provide stable reports to stakeholders**.

**Acceptance Criteria:**

1. Database schema updated: `Assignment.status` enum includes DRAFT, COMPLETED, REOPENED
2. Draft mode shows "Mark as Complete" button (visible only to creators and TEAM_LEAD)
3. Clicking "Mark as Complete" shows confirmation dialog: "This will lock the assignment for editing. Stakeholders will be able to view it. Continue?"
4. On confirmation, API route `/api/assignments/[id]/complete` (POST) updates status to COMPLETED and records completedAt timestamp
5. Completed mode hides all edit controls and shows "Reopen for Editing" button (TEAM_LEAD only)
6. Clicking "Reopen" shows warning dialog: "This will allow edits again and hide from stakeholders temporarily. Continue?"
7. On confirmation, API route `/api/assignments/[id]/reopen` updates status to REOPENED
8. Status indicator badge displayed prominently on assignment page (Draft = gray, Completed = green, Reopened = yellow)
9. State transition logged in database audit table (assignmentId, fromStatus, toStatus, userId, timestamp)

### Story 2.3: Story-Driven Navigation Shell

As a **BPI Team member**,
I want **a navigation structure that follows the Six Sigma analytical flow (VOC/CTQ → Processes → FMEA → Recommendations)**,
so that **I can logically progress through the assignment and stakeholders can follow the narrative**.

**Acceptance Criteria:**

1. Assignment detail page (`/assignments/[id]`) displays horizontal tab navigation
2. Tabs rendered in order: VOC/CTQ, Processes (expandable showing process tabs), FMEA, Recommendations
3. Active tab highlighted with visual indicator (underline or background)
4. Clicking tab navigates to `/assignments/[id]/voc`, `/assignments/[id]/processes`, etc. (client-side routing)
5. "Processes" tab shows dropdown or accordion revealing individual process tabs when >1 process exists
6. Empty state shown for tabs without content: "This section is empty. Start by adding data."
7. Navigation locked in Completed mode (tabs visible but clicking shows "Assignment is locked" message unless TEAM_LEAD reopens)
8. Breadcrumb trail shown: Home > Assignments > [Assignment Title] > [Current Section]
9. Mobile responsiveness: Tabs collapse to dropdown menu on screens <768px (Phase 2 optimization, but layout shouldn't break)

### Story 2.4: VOC/CTQ Data Model and API

As a **Developer**,
I want **database tables and API routes for storing Voice of Customer and Critical to Quality data**,
so that **the VOC/CTQ form can persist user inputs**.

**Acceptance Criteria:**

1. Prisma schema updated with models:
   - `VOCStatement`: id, assignmentId (FK), customerSegment (string), voiceStatement (text), createdAt, updatedAt
   - `CTQRequirement`: id, assignmentId (FK), vocStatementId (nullable FK), ctqDescription (text), measurementCriteria (text), targetValue (string, nullable), createdAt, updatedAt
2. API routes created:
   - `GET /api/assignments/[id]/voc` - Returns all VOC statements and CTQ requirements
   - `POST /api/assignments/[id]/voc/statements` - Creates new VOC statement
   - `PUT /api/assignments/[id]/voc/statements/[vocId]` - Updates VOC statement
   - `DELETE /api/assignments/[id]/voc/statements/[vocId]` - Soft deletes VOC statement
   - `POST /api/assignments/[id]/voc/ctqs` - Creates new CTQ requirement
   - `PUT /api/assignments/[id]/voc/ctqs/[ctqId]` - Updates CTQ requirement
   - `DELETE /api/assignments/[id]/voc/ctqs/[ctqId]` - Soft deletes CTQ requirement
3. Authorization checks: Only assignment creators, team members, and TEAM_LEAD can modify; EXECUTIVE/PROCESS_OWNER can read if status=COMPLETED
4. Validation: Required fields enforced, text length limits applied
5. Unit tests created for API routes testing CRUD operations and authorization

### Story 2.5: VOC/CTQ Form UI

As a **BPI Team member**,
I want **forms to capture Voice of Customer statements and derive Critical to Quality requirements**,
so that **I can document customer needs and translate them into measurable requirements**.

**Acceptance Criteria:**

1. VOC/CTQ page rendered at `/assignments/[id]/voc` with two sections: VOC Statements and CTQ Requirements
2. **VOC Statements Section:**
   - Table displaying existing VOC statements (columns: Customer Segment, Voice Statement, Actions)
   - "Add VOC Statement" button opens dialog with fields: Customer Segment (text input), Voice Statement (textarea)
   - Inline edit: Clicking statement row opens edit dialog
   - Delete icon with confirmation: "Are you sure? CTQs linked to this VOC will remain but lose the link."
3. **CTQ Requirements Section:**
   - Table displaying CTQ requirements (columns: CTQ Description, Linked VOC, Measurement Criteria, Target Value, Actions)
   - "Add CTQ Requirement" button opens dialog with fields: CTQ Description (textarea), Linked VOC (dropdown, optional), Measurement Criteria (text), Target Value (text, optional)
   - Inline edit and delete with confirmation
4. Empty states shown when no data: "No VOC statements yet. Add your first one to begin."
5. Auto-save implemented: Changes debounced and saved automatically after 2 seconds of inactivity with "Saving..." indicator
6. Form disabled in Completed mode with message: "Assignment is completed. Reopen to edit."
7. Data validation: Required fields highlighted, max lengths enforced (Customer Segment: 100 chars, Voice Statement: 1000 chars, CTQ Description: 500 chars)

### Story 2.6: Auto-Save Foundation

As a **BPI Team member**,
I want **my changes to be automatically saved every 30 seconds without manual intervention**,
so that **I don't lose work if I'm interrupted or navigate away**.

**Acceptance Criteria:**

1. Auto-save utility function created: `useAutoSave(data, saveFunction, debounceMs=30000)`
2. VOC/CTQ form integrated with auto-save hook
3. Visual indicator shown: "All changes saved" (checkmark icon) when save succeeds, "Saving..." (spinner) during save, "Save failed - retrying" (error icon) on failure
4. Auto-save triggers on:
   - Form field blur (after 2-second debounce)
   - 30 seconds of inactivity after last edit
   - Before navigating to another tab (useEffect cleanup)
5. Failed saves retry up to 3 times with exponential backoff
6. User can manually trigger save via "Save Now" button (visible during unsaved changes)
7. Browser unload warning shown if unsaved changes exist: "You have unsaved changes. Are you sure you want to leave?"
8. Unit tests verify debouncing logic and retry mechanism

---

## Epic 3: Process Analysis Suite (SIPOC, VSM, Pareto)

**Goal:** Deliver the core process-level analysis capabilities that distinguish the platform—multi-process support, SIPOC grid editor for high-level process mapping, VSM data entry for detailed step analysis, and automated Pareto chart generation demonstrating the platform's automation value. This epic establishes the foundation for all subsequent analytical artifacts that depend on process data.

### Story 3.1: Process Data Model and Multi-Process Architecture

As a **Developer**,
I want **database schema and APIs supporting multiple processes per assignment, each with independent SIPOC and VSM data**,
so that **analysts can model complex assignments involving multiple related processes**.

**Acceptance Criteria:**

1. Prisma schema updated with `Process` model: id, assignmentId (FK), processName (string), processOwner (string, nullable), order (int), createdAt, updatedAt
2. Assignment detail page updated: "Add Process" button creates new process (modal asking for Process Name and Owner)
3. API routes created:
   - `GET /api/assignments/[id]/processes` - Returns all processes for assignment
   - `POST /api/assignments/[id]/processes` - Creates new process
   - `PUT /api/assignments/[id]/processes/[processId]` - Updates process name/owner
   - `DELETE /api/assignments/[id]/processes/[processId]` - Deletes process and cascades to SIPOC/VSM data (with confirmation)
4. Navigation shell updated: "Processes" tab shows dropdown listing all process names, clicking navigates to `/assignments/[id]/processes/[processId]`
5. Process tabs reorderable via drag-and-drop (order persisted to database)
6. Authorization and auto-save applied consistently to process operations
7. Unit tests cover multi-process CRUD and cascade delete behavior

### Story 3.2: SIPOC Data Model and Grid Foundation

As a **Developer**,
I want **database schema and APIs for storing SIPOC data (Suppliers, Inputs, Process steps, Outputs, Customers)**,
so that **the SIPOC grid UI can persist structured process mapping data**.

**Acceptance Criteria:**

1. Prisma schema updated with `SIPOCEntry` model: id, processId (FK), column (enum: SUPPLIER, INPUT, PROCESS, OUTPUT, CUSTOMER), order (int), value (text), createdAt, updatedAt
2. API routes created:
   - `GET /api/processes/[processId]/sipoc` - Returns all SIPOC entries organized by column
   - `POST /api/processes/[processId]/sipoc` - Creates new SIPOC entry
   - `PUT /api/processes/[processId]/sipoc/[entryId]` - Updates entry value
   - `DELETE /api/processes/[processId]/sipoc/[entryId]` - Deletes entry
   - `PUT /api/processes/[processId]/sipoc/reorder` - Updates order of entries within column (bulk update)
3. Response format: `{ suppliers: [...], inputs: [...], process: [...], outputs: [...], customers: [...] }`
4. Validation: Empty values rejected, max length 500 chars per entry
5. Authorization checks applied (assignment team members only)
6. Unit tests cover CRUD operations and column-based querying

### Story 3.3: SIPOC Grid Editor UI

As a **BPI Team member**,
I want **a spreadsheet-like interface to enter SIPOC data with columns for Suppliers, Inputs, Process, Outputs, and Customers**,
so that **I can efficiently map high-level process flows**.

**Acceptance Criteria:**

1. SIPOC page rendered at `/assignments/[id]/processes/[processId]/sipoc`
2. Grid layout with 5 columns (equal width): Suppliers | Inputs | Process | Outputs | Customers
3. Each column displays existing entries as editable rows:
   - Clicking cell enters edit mode (textarea for multi-line support)
   - Blur or Enter saves via auto-save
   - Delete icon per row with confirmation
4. "Add Row" button at bottom of each column creates new entry
5. Drag handles on rows allow reordering within same column (order persisted)
6. Empty state per column: "No suppliers yet. Click Add Row to start."
7. Keyboard navigation: Tab moves between cells, Shift+Tab moves back, Enter adds new row in same column
8. Responsive layout: Columns stack vertically on screens <1024px
9. Auto-save integrated (2-second debounce per cell edit)
10. Inline validation: Red border if empty, max length enforced with character counter

### Story 3.4: VSM Data Model and API

As a **Developer**,
I want **database schema and APIs for Value Stream Mapping data capturing process steps with durations and value classification**,
so that **analysts can enter detailed step-level data for Pareto analysis**.

**Acceptance Criteria:**

1. Prisma schema updated with `VSMStep` model: id, processId (FK), stepNumber (int), stepName (string), durationMinutes (float), waitTimeMinutes (float, nullable), valueAdded (boolean), notes (text, nullable), createdAt, updatedAt
2. API routes created:
   - `GET /api/processes/[processId]/vsm` - Returns all VSM steps ordered by stepNumber
   - `POST /api/processes/[processId]/vsm` - Creates new VSM step
   - `PUT /api/processes/[processId]/vsm/[stepId]` - Updates step data
   - `DELETE /api/processes/[processId]/vsm/[stepId]` - Deletes step and renumbers subsequent steps
   - `PUT /api/processes/[processId]/vsm/reorder` - Updates step order (bulk update)
3. Calculated fields returned in GET response:
   - `totalCycleTime` = sum of all durationMinutes
   - `valueAddedTime` = sum of durationMinutes where valueAdded=true
   - `nonValueAddedTime` = sum where valueAdded=false
   - `efficiencyRatio` = valueAddedTime / totalCycleTime
4. Validation: durationMinutes > 0, stepName required (max 200 chars)
5. Authorization and unit tests applied

### Story 3.5: VSM Data Entry Table UI

As a **BPI Team member**,
I want **a table interface to enter process steps with durations, wait times, and value classification**,
so that **I can capture detailed workflow data for analysis**.

**Acceptance Criteria:**

1. VSM page rendered at `/assignments/[id]/processes/[processId]/vsm`
2. Table columns: Step #, Step Name, Duration (min), Wait Time (min), Value Added (checkbox), Notes, Actions
3. Each row editable inline:
   - Step Name: Text input
   - Duration: Number input (min 0.1)
   - Wait Time: Number input (optional, min 0)
   - Value Added: Checkbox with tooltip: "Does this step directly contribute to customer requirements?"
   - Notes: Text input (expandable on click)
4. "Add Step" button adds new row at end (step number auto-assigned)
5. Drag handles allow reordering steps (renumbering automatic)
6. Delete icon per row with confirmation
7. Summary metrics displayed at top:
   - Total Cycle Time: XX.X minutes
   - Value-Added Time: XX.X minutes (XX%)
   - Non-Value-Added Time: XX.X minutes (XX%)
   - Efficiency Ratio: XX%
8. Summary updates in real-time as data changes
9. Auto-save applied (2-second debounce per cell)
10. Empty state: "No steps yet. Add your first process step."

### Story 3.6: Pareto Chart Calculation Engine

As a **Developer**,
I want **a calculation function that sorts VSM steps by duration descending and computes cumulative percentages**,
so that **Pareto charts can be generated accurately from process data**.

**Acceptance Criteria:**

1. Calculation utility created: `calculateParetoData(vsmSteps: VSMStep[])`
2. Function returns sorted array: `{ stepName, duration, cumulativePercent, rank }`
3. Logic:
   - Filter out steps with duration = 0 (edge case handling)
   - Sort steps by durationMinutes descending
   - Calculate cumulative sum and percentage: (cumSum / totalDuration) \* 100
   - Assign rank (1 = longest duration)
4. Unit tests cover:
   - Standard case: 10 steps with varying durations
   - Edge case: Single step
   - Edge case: All steps equal duration
   - Edge case: Empty array returns empty result
   - Edge case: Steps with zero duration excluded
5. Function pure (no side effects) and exported from `/lib/calculations/pareto.ts`
6. Documentation includes example input/output

### Story 3.7: Pareto Chart Visualization

As a **BPI Team member**,
I want **an automatically generated Pareto chart showing steps ranked by duration with a cumulative percentage line**,
so that **I can quickly identify the 20% of steps causing 80% of cycle time**.

**Acceptance Criteria:**

1. Pareto chart component created using Recharts or Chart.js
2. Chart displays:
   - X-axis: Step names (truncated if >15 chars, full name in tooltip)
   - Y-axis (left): Duration in minutes (bar chart)
   - Y-axis (right): Cumulative percentage (line chart)
   - Bars: Grayscale gradient (darkest = longest duration)
   - Line: Dashed line with markers at each point
3. 80% threshold line rendered horizontally (red dashed line with label "80% threshold")
4. Tooltip on hover shows: Step Name (full), Duration (XX.X min), Cumulative % (XX.X%)
5. Chart renders at `/assignments/[id]/processes/[processId]/pareto` tab
6. Chart updates in real-time when VSM data changes (via React state)
7. Empty state if <2 steps: "Add at least 2 process steps to generate Pareto chart."
8. Export button downloads chart as PNG image
9. Responsive: Chart scales to container width (min 600px, max 1200px)
10. Accessibility: Chart has alt text describing data for screen readers

---

## Epic 4: Root Cause Analysis (Fishbone & Process Capability)

**Goal:** Enable analysts to identify and document root causes through Fishbone diagram creation and assess process performance via capability calculations (Cp/Cpk/Sigma Level), connecting process data from VSM to analytical insights that will inform FMEA risk assessment and recommendations. This epic delivers the "why" layer of the analytical narrative.

### Story 4.1: Fishbone Data Model and API

As a **Developer**,
I want **database schema and APIs for storing Fishbone diagram data organized by 6M categories with root causes**,
so that **analysts can persist their root cause analysis**.

**Acceptance Criteria:**

1. Prisma schema updated with `FishboneCategory` model: id, processId (FK), category (enum: PEOPLE, PROCESS, EQUIPMENT, MATERIALS, ENVIRONMENT, MANAGEMENT), order (int)
2. Prisma schema updated with `FishboneCause` model: id, categoryId (FK), causeDescription (text), order (int), createdAt, updatedAt
3. API routes created:
   - `GET /api/processes/[processId]/fishbone` - Returns all categories with nested causes
   - `POST /api/processes/[processId]/fishbone/causes` - Creates cause under specified category
   - `PUT /api/processes/[processId]/fishbone/causes/[causeId]` - Updates cause description
   - `DELETE /api/processes/[processId]/fishbone/causes/[causeId]` - Deletes cause
   - `PUT /api/processes/[processId]/fishbone/reorder` - Updates cause order within categories (bulk)
4. Seeding: When process created, auto-create 6 FishboneCategory records (one per 6M category)
5. Response format: `{ categories: [{ category: 'PEOPLE', causes: [...] }, ...] }`
6. Validation: causeDescription required (max 500 chars)
7. Authorization and unit tests applied

### Story 4.2: Fishbone Diagram Builder UI

As a **BPI Team member**,
I want **a visual interface to add root causes under 6M categories (People, Process, Equipment, Materials, Environment, Management)**,
so that **I can systematically identify factors contributing to process problems**.

**Acceptance Criteria:**

1. Fishbone page rendered at `/assignments/[id]/processes/[processId]/fishbone`
2. Layout: 6 sections (accordion or cards), one per category
3. Each category section displays:
   - Category name (e.g., "People") with icon
   - List of existing root causes
   - "Add Cause" button opens inline text area
4. Adding cause:
   - Click "Add Cause" → text area appears
   - Type description (max 500 chars with counter)
   - Save button commits via API (or auto-save on blur)
   - Cancel button discards unsaved input
5. Editing cause: Click cause text to edit inline (same as add flow)
6. Deleting cause: Delete icon per cause with confirmation
7. Drag handles allow reordering causes within same category
8. Empty state per category: "No causes identified yet for People. Add the first one."
9. Methodology guidance tooltip per category (e.g., People: "Consider skills, training, motivation, communication")
10. Auto-save applied (2-second debounce)
11. Export button generates static Fishbone diagram as PNG (Phase 2: SVG visualization)

### Story 4.3: Process Capability Data Model and API

As a **Developer**,
I want **database schema and APIs for storing process capability inputs (specification limits) and calculated metrics**,
so that **analysts can assess process performance against customer requirements**.

**Acceptance Criteria:**

1. Prisma schema updated adding fields to `Process` model: lowerSpecLimit (float, nullable), upperSpecLimit (float, nullable), targetValue (float, nullable), sampleMean (float, nullable), sampleStdDev (float, nullable)
2. API routes extended:
   - `PUT /api/processes/[processId]/capability` - Updates spec limits and sample statistics
   - `GET /api/processes/[processId]/capability` - Returns capability data with calculated Cp, Cpk, Sigma Level
3. Calculation logic in `/lib/calculations/capability.ts`:
   - Cp = (USL - LSL) / (6 \* σ)
   - Cpk = min((USL - μ) / (3 _ σ), (μ - LSL) / (3 _ σ))
   - Sigma Level = Cpk \* 3 + 1.5 (short-term approximation)
4. Validation: USL > LSL, all values must be numeric, sample std dev > 0
5. API returns null for metrics if required inputs missing
6. Unit tests cover:
   - Standard case: Cp=1.33, Cpk=1.2 (capable process)
   - Off-center process: Cp > Cpk
   - Incapable process: Cp < 1.0
   - Edge case: Missing data returns null gracefully

### Story 4.4: Process Capability Input Form and Metrics Display

As a **BPI Team member**,
I want **to enter specification limits and sample statistics, then see calculated Cp, Cpk, and Sigma Level**,
so that **I can quantify how well the process meets customer requirements**.

**Acceptance Criteria:**

1. Process Capability page rendered at `/assignments/[id]/processes/[processId]/capability`
2. Input form with fields:
   - Lower Specification Limit (LSL): Number input
   - Upper Specification Limit (USL): Number input
   - Target Value: Number input (optional)
   - Sample Mean (μ): Number input
   - Sample Standard Deviation (σ): Number input
3. Validation: USL > LSL enforced, required fields highlighted
4. "Calculate" button (or auto-calculate on blur) triggers API call
5. Metrics displayed in cards with color-coded indicators:
   - Cp: Green if ≥1.33, Yellow if 1.0-1.32, Red if <1.0
   - Cpk: Same color coding
   - Sigma Level: Green if ≥4, Yellow if 3-3.99, Red if <3
6. Tooltips explain metrics: "Cp measures potential capability. Cpk accounts for process centering."
7. "Show Formula" toggle displays calculation steps below metrics
8. Empty state if no data: "Enter specification limits and sample statistics to calculate capability."
9. Auto-save applied to input form

### Story 4.5: Process Capability Bell Curve Visualization

As a **BPI Team member**,
I want **a bell curve chart showing the process distribution relative to specification limits**,
so that **I can visually assess process centering and spread**.

**Acceptance Criteria:**

1. Bell curve chart component created (Recharts Area Chart or custom SVG)
2. Chart displays:
   - Normal distribution curve centered at sample mean with sample std dev
   - Vertical lines marking LSL, USL, and Target (if provided)
   - Shaded regions: Green (within spec), Red (out of spec)
   - X-axis: Process output values (μ ± 4σ range)
   - Y-axis: Probability density
3. Chart rendered below metrics on capability page
4. Tooltip on hover shows: Value, Probability Density
5. Chart updates when inputs change
6. Empty state if capability data incomplete
7. Export button downloads chart as PNG
8. Responsive sizing (600px - 1200px width)

### Story 4.6: Calculation Transparency Tooltips

As a **BPI Team member and Team Lead**,
I want **tooltips on all calculated metrics showing the formula and intermediate values**,
so that **I can verify correctness and understand how results were derived**.

**Acceptance Criteria:**

1. "Show Formula" icon (ℹ️ or lightbulb) added next to every calculated value (RPN, Cp, Cpk, Pareto cumulative %, etc.)
2. Clicking icon opens tooltip or popover displaying:
   - Formula in mathematical notation (e.g., "Cp = (USL - LSL) / (6σ)")
   - Substituted values (e.g., "Cp = (50 - 20) / (6 × 2.5) = 30 / 15 = 2.0")
   - Link to documentation: "Learn more about Process Capability"
3. Tooltips styled consistently (black/white theme, readable font size)
4. Accessibility: Tooltips keyboard-accessible (focus + Enter to open)
5. Applied across platform:
   - Pareto chart cumulative percentages
   - RPN scores in FMEA (Epic 5)
   - VSM efficiency ratio
   - Process capability metrics
6. Unit tests verify tooltip content matches actual calculation logic

---

## Epic 5: Risk Assessment & Recommendations (FMEA & Solutions)

**Goal:** Complete the analytical narrative by implementing FMEA risk prioritization (Severity × Occurrence × Detection = RPN) and recommendations management, establishing full traceability from identified failure modes back to Fishbone root causes and forward to actionable solutions. This epic delivers the "what should we do" conclusion to the story-driven workflow.

### Story 5.1: FMEA Data Model and API

As a **Developer**,
I want **database schema and APIs for FMEA failure modes with S/O/D ratings and auto-calculated RPN**,
so that **analysts can prioritize risks systematically**.

**Acceptance Criteria:**

1. Prisma schema updated with `FMEAEntry` model: id, assignmentId (FK), processId (FK, nullable - FMEA can span multiple processes), failureMode (text), effectsOfFailure (text), severity (int 1-10), potentialCauses (text), occurrence (int 1-10), currentControls (text), detection (int 1-10), rpn (int, calculated), recommendedActions (text, nullable), createdAt, updatedAt
2. API routes created:
   - `GET /api/assignments/[id]/fmea` - Returns all FMEA entries sorted by RPN descending
   - `POST /api/assignments/[id]/fmea` - Creates FMEA entry with auto-calculated RPN
   - `PUT /api/assignments/[id]/fmea/[entryId]` - Updates entry and recalculates RPN
   - `DELETE /api/assignments/[id]/fmea/[entryId]` - Deletes entry
3. Calculation: RPN = Severity × Occurrence × Detection (performed server-side)
4. Validation: S/O/D must be integers 1-10, failure mode and effects required (max 500 chars each)
5. Authorization and unit tests applied
6. Unit test verifies RPN recalculation on update

### Story 5.2: FMEA Table Editor UI

As a **BPI Team member**,
I want **a table interface to enter failure modes with S/O/D ratings and see auto-calculated RPN scores**,
so that **I can identify and prioritize process risks**.

**Acceptance Criteria:**

1. FMEA page rendered at `/assignments/[id]/fmea`
2. Table columns: Failure Mode, Effects, Severity (S), Potential Causes, Occurrence (O), Current Controls, Detection (D), RPN, Actions
3. Each row editable inline:
   - Text fields: Failure Mode, Effects, Potential Causes, Current Controls
   - Number inputs (1-10): Severity, Occurrence, Detection with validation
   - RPN: Read-only, calculated automatically
4. "Add Failure Mode" button adds new row
5. RPN cell color-coded: Red if ≥200, Yellow if 100-199, Green if <100
6. Table sortable by clicking column headers (default: RPN descending)
7. Delete icon per row with confirmation
8. Methodology guidance tooltips:
   - Severity: "1 = No effect, 10 = Safety hazard"
   - Occurrence: "1 = Rare, 10 = Very frequent"
   - Detection: "1 = Certain detection, 10 = Cannot detect"
9. Auto-save applied (2-second debounce per cell)
10. Empty state: "No failure modes identified. Add the first one."
11. "Show Formula" tooltip on RPN displays: "RPN = S × O × D = 7 × 5 × 3 = 105"

### Story 5.3: FMEA Filtering and Process Association

As a **BPI Team member**,
I want **to filter FMEA entries by process and optionally associate failure modes with specific processes**,
so that **I can focus on risks relevant to each process or view consolidated risks across all processes**.

**Acceptance Criteria:**

1. FMEA page shows dropdown filter: "All Processes" or select specific process
2. Filter updates table to show only FMEA entries where processId matches selected (or all if "All Processes")
3. When adding FMEA entry, "Associated Process" dropdown allows selecting process (optional)
4. Process column added to table showing associated process name (or "All Processes" if null)
5. Filter state persists in URL query param: `/assignments/[id]/fmea?process=[processId]`
6. Empty state respects filter: "No failure modes for Process X. Add one."

### Story 5.4: Recommendations Data Model and API

As a **Developer**,
I want **database schema and APIs for storing recommendations with impact assessment and root cause traceability**,
so that **analysts can document actionable solutions linked to analysis findings**.

**Acceptance Criteria:**

1. Prisma schema updated with `Recommendation` model: id, assignmentId (FK), recommendationTitle (string), description (text), expectedImpact (text), implementationDifficulty (enum: LOW, MEDIUM, HIGH), estimatedCostSavings (string, nullable), linkedFMEAIds (int array, nullable), linkedFishboneCauseIds (int array, nullable), status (enum: PROPOSED, APPROVED, IMPLEMENTED), createdAt, updatedAt
2. API routes created:
   - `GET /api/assignments/[id]/recommendations` - Returns all recommendations
   - `POST /api/assignments/[id]/recommendations` - Creates recommendation
   - `PUT /api/assignments/[id]/recommendations/[recId]` - Updates recommendation
   - `DELETE /api/assignments/[id]/recommendations/[recId]` - Deletes recommendation
3. Validation: Title required (max 200 chars), description required (max 1000 chars)
4. Authorization and unit tests applied

### Story 5.5: Recommendations Form UI

As a **BPI Team member**,
I want **a form to enter recommendations with impact details and link them to FMEA failure modes or Fishbone root causes**,
so that **stakeholders can trace solutions back to identified problems**.

**Acceptance Criteria:**

1. Recommendations page rendered at `/assignments/[id]/recommendations`
2. List view showing existing recommendations (cards or table):
   - Title, Description (truncated), Difficulty badge, Expected Impact (truncated)
   - Edit and Delete buttons per recommendation
3. "Add Recommendation" button opens form (dialog or dedicated page):
   - Recommendation Title: Text input
   - Description: Textarea (rich text optional Phase 2)
   - Expected Impact: Textarea (e.g., "Reduce cycle time by 15 minutes per unit")
   - Implementation Difficulty: Radio buttons (Low / Medium / High)
   - Estimated Cost Savings: Text input (optional, e.g., "$50K/year")
   - Linked FMEA Entries: Multi-select dropdown (shows failure modes)
   - Linked Fishbone Causes: Multi-select dropdown (shows causes by category)
   - Status: Dropdown (Proposed / Approved / Implemented) - future workflow
4. Form validation: Required fields enforced
5. On save, recommendation appears in list
6. Inline edit: Clicking recommendation opens edit mode
7. Delete with confirmation
8. Empty state: "No recommendations yet. Add your first one."
9. Auto-save applied

### Story 5.6: Recommendation Traceability View

As a **BPI Team member and Executive**,
I want **to see which FMEA failure modes and Fishbone root causes are linked to each recommendation**,
so that **I can understand the rationale behind proposed solutions**.

**Acceptance Criteria:**

1. Recommendation detail view (expand card or dedicated page) shows "Traceability" section
2. Section displays:
   - "Addresses FMEA Risks:" List of linked failure modes with RPN scores
   - "Resolves Root Causes:" List of linked Fishbone causes with categories
3. Clicking linked item navigates to source (FMEA table row or Fishbone cause)
4. If no links: "No traceability links defined."
5. Badge on recommendation card shows count: "Addresses 3 risks, 2 root causes"
6. Executive summary view (Phase 2) aggregates this data

---

## Epic 6: Stakeholder Experience (PDF Export & Role-Based Access)

**Goal:** Enable stakeholders (Team Leads, Executives, Process Owners) to engage with completed assignments through professional PDF exports for archival and offline distribution, executive summary views for at-a-glance insights, and role-based access controls ensuring users only see assignments and sections appropriate to their permissions. This epic completes the full user lifecycle from creation to stakeholder consumption.

### Story 6.1: PDF Generation Service Setup

As a **Developer**,
I want **a server-side PDF generation service that can render assignment data into a formatted document**,
so that **users can export assignments for distribution and archival**.

**Acceptance Criteria:**

1. PDF generation library integrated (react-pdf or Puppeteer)
2. PDF template component created rendering assignment structure:
   - Cover page: Assignment title, objective, date, team members
   - Table of contents with page numbers
   - Sections: VOC/CTQ, SIPOC (per process), VSM (per process), Pareto chart (per process), Fishbone (per process), Process Capability (per process), FMEA table, Recommendations
3. API route created: `GET /api/assignments/[id]/export/pdf` (generates PDF, returns binary)
4. PDF styling: Black/white theme, professional typography, consistent margins
5. Charts rendered as static images embedded in PDF
6. Page breaks enforced between major sections
7. Header/footer: Assignment title (left), page number (right)
8. Unit test verifies PDF generation succeeds for sample assignment

### Story 6.2: PDF Export UI and Download

As a **BPI Team member and Team Lead**,
I want **a button to export the current assignment as a PDF that downloads to my device**,
so that **I can share reports with stakeholders offline or archive completed work**.

**Acceptance Criteria:**

1. "Export PDF" button added to assignment header (visible to BPI_TEAM, TEAM_LEAD)
2. Button disabled in Draft mode with tooltip: "Complete the assignment to enable PDF export"
3. Clicking button shows loading indicator: "Generating PDF..."
4. On success, browser downloads file: `Assignment-[title]-[date].pdf`
5. On failure, error message shown: "PDF generation failed. Please try again or contact support."
6. Timeout set to 60 seconds for large assignments
7. Preview option (Phase 2): Show PDF in browser before downloading
8. Export respects user role: Executives see condensed version (Phase 2)

### Story 6.3: Executive Summary View for Completed Assignments

As an **Executive**,
I want **a summary view of completed assignments showing key findings, recommendations, and metrics at-a-glance**,
so that **I can quickly assess the assignment without reading the full report**.

**Acceptance Criteria:**

1. Executive summary page created at `/assignments/[id]/summary` (default view for EXECUTIVE role when accessing completed assignment)
2. Summary includes:
   - Assignment title, objective, completion date, team members
   - **Key Findings:** Auto-generated bullets from top 3 Pareto steps (80% of cycle time)
   - **Critical Risks:** Top 5 FMEA entries by RPN with risk scores
   - **Process Performance:** Cp/Cpk/Sigma Level for each process (table view)
   - **Recommendations:** All recommendations with difficulty and expected impact
3. "View Full Report" button navigates to detailed assignment view (all tabs)
4. Charts: Mini Pareto charts (thumbnail size) per process, clickable to enlarge
5. Traceability: Clicking recommendation shows linked FMEA/Fishbone items in popover
6. Print-friendly layout (CSS print styles)
7. Empty state sections: "No risks identified" if FMEA empty

### Story 6.4: Role-Based Access Control Enforcement

As a **System Administrator and Team Lead**,
I want **role-based permissions enforced so users can only access assignments and perform actions appropriate to their role**,
so that **data security and workflow integrity are maintained**.

**Acceptance Criteria:**

1. Access control matrix implemented:
   - **BPI_TEAM:** Create assignments, edit own assignments (Draft/Reopened), view all assignments
   - **TEAM_LEAD:** All BPI_TEAM permissions + edit any assignment, approve (Complete), reopen assignments
   - **EXECUTIVE:** View completed assignments only (read-only), executive summary default view
   - **PROCESS_OWNER:** View completed assignments only (future: scoped to relevant processes)
2. API routes enforce authorization:
   - 403 Forbidden returned if user lacks permission
   - Assignment edit routes check: status=DRAFT or REOPENED AND (user is creator OR user is TEAM_LEAD)
   - Complete/Reopen routes check: user is TEAM_LEAD
   - Read routes check: user is team member OR status=COMPLETED
3. UI hides unauthorized actions:
   - Edit buttons hidden if user can't edit
   - "Mark as Complete" visible only to TEAM_LEAD
   - "New Assignment" visible only to BPI_TEAM/TEAM_LEAD
4. Redirect logic:
   - EXECUTIVE accessing `/assignments/[id]` redirects to `/assignments/[id]/summary`
   - Unauthorized access to assignment redirects to dashboard with error message
5. Unit tests cover all permission scenarios
6. Audit log records permission denials

### Story 6.5: Team Lead Dashboard for Progress Tracking

As a **Team Lead**,
I want **a dashboard showing all team assignments with progress indicators and validation alerts**,
so that **I can track work without micromanaging and identify assignments needing review**.

**Acceptance Criteria:**

1. Team Lead Dashboard page created at `/dashboard/team-lead` (TEAM_LEAD role only)
2. Dashboard displays table: Assignment Title, Status, Assigned To, Last Modified, Progress %, Validation Alerts, Actions
3. **Progress % calculation:**
   - Sections with data / Total sections × 100
   - Sections: VOC/CTQ, SIPOC (per process), VSM (per process), Fishbone (per process), Capability (per process), FMEA, Recommendations
4. **Validation Alerts column:**
   - Icon indicators: ⚠️ if any section incomplete, ✓ if all complete
   - Hover shows missing sections: "Missing: Process 2 SIPOC, FMEA"
5. **Actions:** "View" button navigates to assignment, "Approve" button if status=DRAFT (triggers Complete transition)
6. Filters: Status (Draft / Completed / Reopened), Assigned To (dropdown of team members)
7. Sort by: Last Modified (default), Progress %, Title
8. Empty state: "No assignments yet. Team members will appear here when they create assignments."
9. Refresh button updates data

### Story 6.6: Assignment Audit Trail

As a **Team Lead and System Administrator**,
I want **an audit log showing who made changes to assignments and when**,
so that **I can track accountability and troubleshoot issues**.

**Acceptance Criteria:**

1. Prisma schema updated with `AuditLog` model: id, assignmentId (FK), userId (FK), action (enum: CREATED, UPDATED, COMPLETED, REOPENED, DELETED), entityType (string, e.g., "VOCStatement"), entityId (int, nullable), changeDetails (json, nullable), timestamp
2. Audit logging middleware created intercepting all API write operations
3. Logged actions:
   - Assignment state changes (Draft → Completed)
   - VOC/CTQ/SIPOC/VSM/Fishbone/FMEA/Recommendation create/update/delete
   - User role changes (future)
4. API route created: `GET /api/assignments/[id]/audit` (TEAM_LEAD only)
5. Audit log page at `/assignments/[id]/audit` displaying:
   - Table: Timestamp, User, Action, Entity, Details
   - Filter by: Action type, Date range, User
   - Export to CSV button
6. Empty state: "No activity yet."
7. Details column shows abbreviated JSON (full details in tooltip)
8. Pagination if >100 entries

---

## Epic 7: Assignment Charter & Project Planning

**Goal:** Provide comprehensive project charter functionality enabling BPI teams to document assignment context, scope, strategic alignment, stakeholders, and milestones before beginning detailed analysis work, ensuring executive alignment and clear project boundaries.

### Story 7.1: Assignment Charter Data Model and API

As a **Developer**,
I want **database schema and API routes for storing comprehensive assignment charter information**,
so that **BPI teams can document project context and planning details**.

**Acceptance Criteria:**

1. Prisma schema updated with `AssignmentCharter` model: id, assignmentId (unique FK), assignmentName, programSponsor, processOwner, programManagement, projectTeam, strategicAlignment, problemStatement, businessCase, goalMetric, expectedDeliverables, inScope, outOfScope, drivers, nonFinancialBenefits, existingLeverage, futureLeverage, risks, constraints, assumptions, businessStakeholders, createdAt, updatedAt
2. Prisma schema updated with `CharterScheduleItem` model: id, charterId (FK), milestone, startDate, endDate, order, createdAt, updatedAt
3. API routes created:
   - `GET /api/charter/[assignmentId]` - Returns charter data with schedule items
   - `POST /api/charter/[assignmentId]` - Creates or updates charter
   - `POST /api/charter/[assignmentId]/schedule` - Adds schedule milestone
   - `PUT /api/charter/[assignmentId]/schedule/[itemId]` - Updates milestone
   - `DELETE /api/charter/[assignmentId]/schedule/[itemId]` - Deletes milestone
4. Authorization checks: Only assignment creators, team members, and TEAM_LEAD can modify
5. Validation: Required fields enforced for charter completion, date validation for schedule items
6. Unit tests cover CRUD operations and cascade delete behavior

### Story 7.2: Assignment Charter UI

As a **BPI Team member**,
I want **a comprehensive charter form to document project context, scope, and planning details**,
so that **I can establish clear project boundaries and stakeholder alignment before beginning analysis**.

**Acceptance Criteria:**

1. Charter page rendered at `/assignments/[id]/charter` as first tab in navigation
2. Form organized in numbered sections with two-column grid layout:
   - Section 1: Assignment Information (name, sponsor, process owner, program management, team)
   - Section 2: Project Overview (strategic alignment, problem statement, business case, goal metrics, deliverables)
   - Section 3: Project Scope (in scope, out of scope)
   - Section 4: Customer Drivers & Benefits (drivers, non-financial benefits)
   - Section 5: Leverage (existing leverage, future leverage)
   - Section 6: Risk, Constraints and Assumptions (risks, constraints, assumptions)
   - Section 7: Assignment Team (business stakeholders)
   - Section 8: Schedule (milestone table with start/end dates)
3. All fields use textarea inputs for rich text entry
4. Schedule section displays table with columns: Milestone, Start Date, End Date, Actions
5. "Add Milestone" button creates new schedule row with date pickers
6. Drag handles allow reordering milestones
7. Auto-save applied to all fields (2-second debounce)
8. Form disabled in Completed mode
9. Visual hierarchy with gray header backgrounds and uppercase bold section titles
10. Empty state: "Complete the charter to establish project context before beginning analysis."

### Story 7.3: Charter Integration with Assignment Workflow

As a **BPI Team member and Team Lead**,
I want **the charter to be the starting point of the assignment workflow**,
so that **project context is established before detailed analysis begins**.

**Acceptance Criteria:**

1. Navigation updated: Charter tab appears first in tab sequence (before VOC/CTQ)
2. Assignment creation wizard optionally prompts: "Create charter now or skip?" with default to create
3. Progress indicator shows charter completion status
4. Executive summary view includes charter overview section displaying problem statement, business case, and goal metrics
5. PDF export includes charter as first section after cover page
6. Charter completion tracked in assignment progress percentage
7. Team Lead dashboard shows charter completion status for each assignment

---

## Epic 8: AI-Powered Insights & Intelligence

**Goal:** Leverage OpenAI GPT-4 to automate insight generation from completed assignments and provide interactive AI assistance, reducing the time required for report synthesis and enabling stakeholders to quickly understand findings through conversational interfaces.

### Story 8.1: OpenAI Integration Setup

As a **Developer**,
I want **OpenAI GPT-4 API integrated into the platform**,
so that **AI-powered features can analyze assignment data and generate insights**.

**Acceptance Criteria:**

1. OpenAI SDK installed and configured (openai package)
2. Environment variable `OPENAI_API_KEY` documented and validated on startup
3. AI service wrapper created in `/lib/ai/openai-client.ts` with error handling and retry logic
4. Rate limiting implemented (max 10 requests/minute per user)
5. Cost tracking: Log token usage per API call for monitoring
6. Timeout set to 30 seconds for AI responses
7. Fallback handling: Display user-friendly error if API unavailable
8. Unit tests mock OpenAI responses for testing

### Story 8.2: AI Assessment Generation

As an **Executive or BPI Team member**,
I want **AI to automatically analyze completed assignments and generate comprehensive insights**,
so that **I can quickly understand key findings without reading the full report**.

**Acceptance Criteria:**

1. API route created: `GET /api/ai/assessment/[assignmentId]` (requires assignment status=COMPLETED)
2. Assessment generation logic:
   - Aggregates all assignment data (VOC, CTQ, processes, SIPOC, VSM, Pareto, Fishbone, FMEA, Recommendations)
   - Sends structured prompt to GPT-4 requesting: Overview, Key Insights (3-5 bullets), Deep Insights (detailed analysis), Metrics Summary
   - Parses and returns JSON response
3. AI Assessment UI component created at `/assignments/[id]/ai-analysis` (sub-tab: Assessment)
4. Assessment view displays:
   - Overview section (2-3 paragraph summary)
   - Key Insights (bullet list with icons)
   - Deep Insights (expandable sections per process)
   - Metrics Summary (process capability, RPN scores, cycle time reductions)
5. "Regenerate Assessment" button allows manual refresh
6. Loading state: "AI is analyzing assignment data..." with progress indicator
7. Error handling: "AI assessment unavailable. Try again later."
8. Cache assessment results for 24 hours to reduce API costs

### Story 8.3: AI Chat Assistant

As an **Executive or BPI Team member**,
I want **to ask questions about assignment data and receive AI-generated answers**,
so that **I can explore findings interactively without searching through the full report**.

**Acceptance Criteria:**

1. API route created: `POST /api/ai/chat/[assignmentId]` accepting message text
2. Chat logic:
   - Maintains conversation context (last 10 messages)
   - Includes assignment data as context in system prompt
   - Generates contextual responses using GPT-4
   - Returns message with timestamp and role (user/assistant)
3. AI Chat UI component created at `/assignments/[id]/ai-analysis` (sub-tab: Chat)
4. Chat interface displays:
   - Message history (scrollable, auto-scroll to latest)
   - Input field with "Ask a question..." placeholder
   - Send button (or Enter key to submit)
   - Suggested questions: "What are the top 3 bottlenecks?", "Summarize recommendations", "What risks have highest RPN?"
5. Messages styled: User messages right-aligned (gray background), AI messages left-aligned (white background)
6. Typing indicator shown while AI generates response
7. Error handling: "Failed to get response. Please try again."
8. "Clear chat" button resets conversation
9. Chat history not persisted (session-only)

### Story 8.4: AI Analysis Tab Integration

As a **BPI Team member**,
I want **AI Analysis to appear as a tab only for completed assignments**,
so that **AI features are available when data is finalized**.

**Acceptance Criteria:**

1. Assignment tabs updated: "AI Analysis" tab shown only when assignment status=COMPLETED
2. AI Analysis tab positioned after Recommendations tab
3. Tab contains two sub-tabs: Assessment and Chat
4. Default view: Assessment sub-tab
5. Tab badge shows "NEW" indicator for first 7 days after feature launch
6. Role-based access: All roles can view AI Analysis for completed assignments
7. Navigation updates URL: `/assignments/[id]/ai-analysis?tab=assessment` or `?tab=chat`

---

## Epic 9: Enhanced VSM Analysis (Waste Types & Value Classification)

**Goal:** Extend Value Stream Mapping capabilities with TIMWOODS waste categorization and three-tier value measure classification (VA/ENVA/NVA), enabling more sophisticated lean analysis and waste identification aligned with industry best practices.

### Story 9.1: VSM Enhanced Data Model

As a **Developer**,
I want **database schema updated to support value measure classification and waste type categorization**,
so that **VSM analysis can capture lean-specific attributes**.

**Acceptance Criteria:**

1. Prisma schema updated for `VSMStep` model adding:
   - `valueMeasure` enum field: VALUE_ADDED, ESSENTIAL_NON_VALUE, NON_VALUE_ADDED (default: NON_VALUE_ADDED)
   - `wasteType` enum field: TRANSPORT, INVENTORY, MOTION, WAITING, OVER_PRODUCTION, OVER_PROCESSING, DEFECTS, SKILLS (nullable)
   - `stakeholder` string field (nullable)
   - `remarks` text field (nullable)
   - `processTime` float field (replaces durationMinutes)
   - `waitingTime` float field (replaces waitTimeMinutes)
2. Migration script created maintaining backward compatibility with legacy `valueAdded` boolean field
3. Calculated metrics updated:
   - `valueAddedTime` = sum of processTime where valueMeasure=VALUE_ADDED
   - `essentialNonValueTime` = sum where valueMeasure=ESSENTIAL_NON_VALUE
   - `nonValueAddedTime` = sum where valueMeasure=NON_VALUE_ADDED
4. API routes updated to accept and return new fields
5. Unit tests cover new calculations

### Story 9.2: VSM Enhanced UI

As a **BPI Team member**,
I want **VSM table to include value measure classification, waste type, stakeholder, and remarks columns**,
so that **I can perform comprehensive lean analysis**.

**Acceptance Criteria:**

1. VSM table updated with columns: Step #, Step Name, Process Time, Waiting Time, Value Measure, Waste Type, Stakeholder, Remarks, Actions
2. Value Measure column displays:
   - Select dropdown with 3 options: Value Added (green badge), Essential Non-Value (yellow badge), Non-Value Added (red badge)
   - Color-coded badges for visual distinction
3. Waste Type column displays:
   - Select dropdown with 8 TIMWOODS options: Transport, Inventory, Motion, Waiting, Over Production, Over Processing, Defects, Skills
   - Optional field (can be empty)
4. Stakeholder column: Text input
5. Remarks column: Text input (expandable on click)
6. Summary metrics updated displaying:
   - Value-Added Time: XX.X min (XX%)
   - Essential Non-Value Time: XX.X min (XX%)
   - Non-Value-Added Time: XX.X min (XX%)
   - Efficiency Ratio: VA / (VA + ENVA + NVA)
7. Tooltips provide guidance:
   - Value Added: "Directly adds value perceived by customer"
   - Essential Non-Value: "Required but doesn't add customer value (e.g., compliance)"
   - Non-Value Added: "Pure waste - candidate for elimination"
8. Auto-save applied to all fields
9. Responsive: Horizontal scroll enabled for tables on smaller screens

### Story 9.3: Waste Analysis Summary

As a **BPI Team member and Executive**,
I want **a summary view showing waste distribution by type**,
so that **I can identify which waste categories are most prevalent**.

**Acceptance Criteria:**

1. Waste summary section added to VSM page below step table
2. Summary displays:
   - Pie or bar chart showing distribution of waste types across all steps
   - Table: Waste Type, Count of Steps, Total Time (min), Percentage of Total Cycle Time
   - Sorted by total time descending
3. Chart color-coded by waste type for visual distinction (grayscale gradients)
4. Empty state: "Classify waste types in VSM steps to see distribution."
5. Clicking waste type in chart filters VSM table to show only those steps
6. Export button downloads waste summary as CSV
7. Executive summary view includes top 3 waste types by time

---

## Checklist Results Report

### PRD Validation Summary

**Overall PRD Completeness:** 92%
**MVP Scope Appropriateness:** Just Right
**Readiness for Architecture Phase:** Ready

**Executive Summary:**
The BPI Assignment Platform PRD demonstrates excellent completeness across all critical dimensions. The problem definition is grounded in quantified pain points from the project brief, functional requirements are comprehensive with proper traceability to user needs, and the epic structure follows agile best practices with sequential, vertical-slice stories. The MVP scope is appropriately minimal while viable—focusing on core automation (Pareto, RPN calculations), story-driven workflow, and multi-process support without overreaching into portfolio analytics or advanced collaboration features that are properly deferred to Phase 2. The technical assumptions provide clear constraints for the architect, and acceptance criteria are specific and testable. Minor gaps exist in operational requirements (monitoring strategy) and explicit user journey mapping, but these don't block architecture work.

### Category Analysis Table

| Category                         | Status  | Critical Issues                                                         |
| -------------------------------- | ------- | ----------------------------------------------------------------------- |
| 1. Problem Definition & Context  | PASS    | None - excellent grounding in quantified pain points                    |
| 2. MVP Scope Definition          | PASS    | None - clear boundaries, strong rationale for in/out decisions          |
| 3. User Experience Requirements  | PARTIAL | User journey flows not explicitly mapped (implied via story sequencing) |
| 4. Functional Requirements       | PASS    | None - comprehensive, testable, properly sequenced                      |
| 5. Non-Functional Requirements   | PARTIAL | Monitoring/alerting strategy needs detail (NFR8 is high-level)          |
| 6. Epic & Story Structure        | PASS    | None - excellent sequencing, appropriate sizing, strong ACs             |
| 7. Technical Guidance            | PASS    | None - clear stack, architecture, testing strategy                      |
| 8. Cross-Functional Requirements | PARTIAL | Integration requirements minimal (acceptable for MVP, no external APIs) |
| 9. Clarity & Communication       | PASS    | None - clear language, consistent structure, comprehensive              |

### Top Issues by Priority

**BLOCKERS:** None identified

**HIGH:**

1. **User Journey Mapping Missing:** While stories imply user flows, explicit journey maps (analyst creating first assignment, team lead reviewing, executive accessing summary) would help UX architect validate navigation and edge cases.
2. **Monitoring Strategy Underspecified:** NFR8 mentions audit logging but doesn't detail what system health metrics to monitor (API response times, database query performance, failed PDF generations, authentication errors). Architect needs guidance for instrumentation.

**MEDIUM:** 3. **Edge Case Documentation:** Stories focus on happy paths. Document edge cases that should be handled (e.g., "What happens if user navigates away during auto-save?" addressed in Story 2.6, but others like "Can FMEA entries exist without processes?" not explicit). 4. **Data Validation Rules:** Validation mentioned throughout but not consolidated. Consider adding appendix: "Validation Rules Reference" (e.g., "All S/O/D ratings 1-10", "USL > LSL", etc.)

**LOW:** 5. **Wireframe/Mockup References:** UI Design Goals describe paradigms well, but references to wireframes (mentioned in brief's Next Steps) would accelerate UX work. 6. **Change Management Strategy:** Brief mentions user training and change management (section 8, Next Steps) but PRD doesn't include success criteria around adoption or training requirements.

### MVP Scope Assessment

**Scope is Appropriately Minimal:**

- ✅ Core automation value delivered (Pareto, RPN, Cp/Cpk calculations)
- ✅ Multi-process support included (architectural decision that would be costly to retrofit)
- ✅ Story-driven navigation MVP-ready (no section-level locking—added to Phase 2)
- ✅ PDF export deferred until Epic 6 (allows analyst workflow validation in Epics 1-5 first)

**Potential Further Cuts (if timeline pressure):**

- **Process Capability (Story 4.3-4.5):** Could defer bell curve visualization to Phase 2, keeping only Cp/Cpk calculation display. Impact: Medium (capability analysis is valuable but not core to MVP success criteria).
- **Team Lead Dashboard (Story 6.5):** Could defer to Phase 2 if team lead uses assignment list with filters. Impact: Low (nice-to-have for oversight but manual review possible).

**No Missing Critical Features Identified:** MVP covers assignment creation → data capture → automated analysis → stakeholder distribution

**Complexity Concerns:**

- **PDF Generation (Story 6.1-6.2):** Rendering dynamic charts/tables to static PDF can be tricky. Recommend architect evaluates react-pdf vs. Puppeteer early (Epic 1-2 timeframe) to avoid late-stage surprises.
- **Multi-Process Data Model:** Architect should validate cascade delete strategies and query performance with sample data (10 processes × 50 SIPOC entries each).

**Timeline Realism:**

- Original 6 epics × 4-6 stories each = ~32 stories
- New features (Epics 7-9) add ~10 stories = ~42 total stories
- Assuming 1 developer, 2-3 stories/week (including testing, code review) = 14-21 weeks
- Brief targets 6-8 weeks MVP + 3 months Phase 2 = ~5 months total
- Assessment: **MVP delivered** (Epics 1-6). **New features implemented** (Epics 7-9 completed). Current phase appears to be late MVP/early Phase 2.

### Technical Readiness

**Clarity of Technical Constraints:** Excellent

- Stack fully specified (Next.js 14+, Prisma, PostgreSQL, shadcn/ui, Recharts)
- Architecture decision (monolith with serverless API routes) justified with rationale
- Repository structure clear (monorepo with `/app`, `/components`, `/lib`, `/prisma`)
- Testing strategy explicit (unit for calculations, selective integration, manual UAT)

**Identified Technical Risks:**

1. **Calculation Accuracy:** NFR2 is non-negotiable (100% accuracy). Recommend comprehensive unit test suite for `/lib/calculations` with edge case coverage before pilot (Story 3.6, 4.3, 5.1 all have calculation components).
2. **Real-time Chart Updates:** Auto-save + real-time chart updates (Story 3.7 AC #6) requires careful state management. Architect should plan for optimistic UI updates with rollback on save failure.
3. **PDF Generation Performance:** Large assignments (10 processes with full data) may timeout at 60 seconds (Story 6.2 AC #6). Architect should consider background job queue if generation exceeds 30 seconds.

**Areas Needing Architect Investigation:**

- Database schema optimization: Indexing strategy for frequently queried fields (assignmentId, processId, status)
- State management library selection: Zustand vs. React Query vs. hybrid approach
- PDF library trade-off: react-pdf (pure React, faster setup) vs. Puppeteer (full browser, better fidelity but heavier)
- Auto-save conflict resolution: What happens if two users edit same assignment simultaneously in MVP (no section-locking yet)?

### Recommendations

**To Address HIGH Priority Issues:**

1. **Create User Journey Maps:** Document 3 primary flows:
   - Analyst Flow: Login → Create Assignment → VOC/CTQ → Add Process → SIPOC → VSM → Pareto Review → Fishbone → Capability → FMEA → Recommendations → Mark Complete
   - Team Lead Flow: Login → Dashboard → Select Assignment → Review Sections → Reopen (if needed) → Approve/Complete
   - Executive Flow: Login → Completed Assignments → Executive Summary → Drill into Recommendations → Export PDF

   Add as appendix to PRD or create separate UX flow document before architecture kick-off.

2. **Define Monitoring & Alerting Strategy:** Add to Technical Assumptions section:
   - System health metrics: API response times (p50/p95/p99), database query performance, error rates by endpoint
   - Business metrics: Assignments created/completed per week, user login frequency, PDF exports per assignment
   - Alerting thresholds: API response time >5s, error rate >5%, authentication failures >10/minute
   - Tool recommendation: Vercel Analytics + Sentry for error tracking (within budget constraints)

**To Address MEDIUM Priority Issues:**

3. **Document Edge Cases:** Create "Edge Case Handling" appendix covering:
   - Auto-save conflict resolution (two users, no locking): Last write wins with warning banner
   - Orphaned data: FMEA entries without processes (allow for cross-process risks)
   - Empty state transitions: Can assignment be marked Complete with zero processes? (No—validation rule needed)
   - Delete cascade: Process deletion removes SIPOC/VSM/Fishbone/Capability (confirmed in Story 3.1 AC #3)

4. **Consolidate Validation Rules:** Create "Data Validation Reference" in PRD appendix:
   - S/O/D ratings: Integer 1-10 inclusive
   - Process Capability: USL > LSL, σ > 0
   - Durations: >0 minutes
   - Text limits: See requirements (most 500 chars, some 1000)

**Suggested Improvements (OPTIONAL):**

5. **Reference Wireframes:** If wireframes exist from brief's validation phase (Week 2 Next Steps), link in UI Design Goals section to accelerate UX architect work.

6. **Add Adoption Success Criteria:** Consider adding to Goals section:
   - 80% of pilot users (3/5 analysts) complete at least one assignment in platform within first 2 weeks
   - NPS score >40 from pilot users at 30-day mark
   - Zero calculation errors reported during pilot

### Next Steps

**Immediate Actions:**

1. Add user journey maps (1-2 hours, can be PM or UX architect)
2. Specify monitoring strategy in Technical Assumptions (30 minutes)
3. Review edge case handling with development team before Epic 2 (auto-save conflicts)

**Before Architecture Kick-off:** 4. Validate PDF library choice with proof-of-concept (Architect, 2-4 hours) 5. Review database indexing strategy for multi-process queries (Architect) 6. Confirm auto-save conflict resolution approach (PM + Architect)

**During Architecture Phase:** 7. Create detailed component hierarchy and state management plan 8. Design database schema with Prisma models matching PRD entities 9. Define API contract (routes, request/response schemas) 10. Establish testing strategy (unit test frameworks, integration test approach)

### Final Decision

**✅ READY FOR ARCHITECT**

The PRD and epics are comprehensive, properly structured, and provide sufficient guidance for architectural design to begin. The two HIGH priority issues (user journey maps, monitoring strategy) can be addressed in parallel with architecture work and don't block the architect from designing system components, database schema, or API contracts. The MVP scope is well-defined with clear success criteria, acceptance criteria are testable, and technical constraints are explicit. Architect can proceed with confidence.

---

## Next Steps

### UX Expert Prompt

```
I have a completed PRD for the BPI Assignment Platform at docs/prd.md.

Please review the UI Design Goals section and create a comprehensive UX architecture including:
1. Detailed user journey maps for the 3 primary personas (BPI Analyst, Team Lead, Executive)
2. Information architecture and navigation structure
3. Wireframes for the 15 core screens identified in the PRD
4. Component hierarchy and reusable UI patterns
5. Responsive design breakpoints and mobile/tablet considerations
6. Accessibility compliance strategy (WCAG AA)

Focus on the story-driven workflow (VOC/CTQ → Processes → FMEA → Recommendations) and the black/white minimalist theme using shadcn/ui components. Ensure the design supports the dual-mode workflow (Draft vs. Completed states) and auto-save functionality.
```

### Architect Prompt

```
I have a completed PRD for the BPI Assignment Platform at docs/prd.md.

Please create a comprehensive technical architecture document covering:
1. Database schema design (Prisma models for all entities: Assignment, Process, VOC, SIPOC, VSM, Fishbone, FMEA, Recommendation)
2. API contract specification (REST/tRPC routes with request/response schemas)
3. Component architecture (React components, state management strategy, auto-save implementation)
4. Calculation engine design (Pareto, RPN, Cp/Cpk/Sigma Level with unit test coverage plan)
5. PDF generation approach (react-pdf vs Puppeteer trade-off analysis and recommendation)
6. Authentication & authorization implementation (role-based access control with NextAuth.js or Supabase Auth)
7. Deployment architecture (Vercel, database hosting, CI/CD pipeline)
8. Monitoring & observability strategy (system health, business metrics, alerting thresholds)

Focus on the monorepo structure with Next.js 14+ App Router, TypeScript strict mode, and serverless API routes. Ensure the architecture supports multi-process assignments, real-time chart updates, and auto-save with conflict resolution strategy.
```

---

_Document prepared using BMAD™ Core PRD template v2.0_
