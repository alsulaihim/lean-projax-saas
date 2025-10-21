# Project Brief: BPI Assignment Platform

**Version:** 1.0
**Date:** 2025-09-30
**Prepared by:** Business Analyst Mary 📊

---

## Executive Summary

**BPI Assignment Platform** is a Next.js web application that automates Six Sigma assignment reporting by transforming manual, time-intensive documentation processes into a streamlined digital workflow. The platform enables BPI teams to efficiently create comprehensive process improvement reports with automated calculations, professional visualizations, and multi-user collaboration, while providing stakeholders with accessible, story-driven presentations that clearly communicate root causes and actionable recommendations.

**Primary Problem:** BPI teams currently spend excessive time manually creating charts, formatting reports, and ensuring calculation accuracy for Six Sigma assignments, reducing time available for actual analysis and delaying stakeholder communication.

**Target Market:** Internal BPI (Business Process Improvement) teams performing Six Sigma analysis, their team leads requiring quality oversight, executives making investment decisions, and process owners implementing recommendations.

**Key Value Proposition:**
- **For BPI Teams:** Reduce report creation time by 60-70% through automated calculations and chart generation
- **For Stakeholders:** Improve decision quality with professional, interactive presentations that trace recommendations back to root causes
- **For Organizations:** Accelerate improvement cycle time from analysis to implementation

---

## Problem Statement

### Current State & Pain Points

BPI teams currently perform Six Sigma process improvement analysis using a **manual, document-based workflow** that creates significant friction:

**Time Drain on Report Creation:**
- Analysts spend 40-50% of assignment time on report formatting, chart creation, and document assembly rather than actual analysis
- Each Pareto chart, Fishbone diagram, Process Capability curve, and VSM visualization requires manual creation in separate tools (Excel, Visio, PowerPoint)
- Formatting consistency across assignments requires constant vigilance and rework

**Data Integrity & Accuracy Risks:**
- Manual calculation of Six Sigma metrics (Cp, Cpk, Sigma Level, RPN scores) introduces transcription errors
- No systematic validation of data completeness or outlier detection
- Team leads cannot easily spot-check calculations, creating trust issues with stakeholders

**Collaboration Bottlenecks:**
- Sequential workflow forces analysts to wait for sections to be "handed off"
- Version control via shared drives leads to conflicting edits and lost work
- No visibility into who's working on what, causing duplicate effort

**Stakeholder Presentation Gaps:**
- Static PDF reports don't allow executives to drill into details or explore "what if" scenarios
- Process owners receive complete reports when targeted, process-specific views would be more actionable
- Delayed distribution (waiting for final PDF) slows decision-making cycles

### Impact (Quantified)

- **Time Cost:** Estimated 15-20 hours per assignment spent on non-analytical work (formatting, chart creation, revisions)
- **Quality Risk:** Manual processes introduce calculation errors that undermine credibility
- **Cycle Time:** 2-3 weeks from analysis completion to stakeholder presentation due to formatting delays
- **Opportunity Cost:** Reduced capacity for new assignments while teams handle report production

### Why Existing Solutions Fall Short

- **Generic project management tools** (Jira, Asana) don't understand Six Sigma frameworks or automate domain-specific calculations
- **BI dashboards** (Tableau, Power BI) require data engineering support and don't capture qualitative analysis (VOC, root causes, recommendations)
- **Document templates** (Word, Google Docs) still require manual chart creation and don't enforce Six Sigma methodology
- **Spreadsheet-based systems** (Excel workbooks) lack collaboration features and professional presentation capabilities

### Urgency & Importance

**Now is the time because:**
- BPI team capacity is constrained—automation unlocks bandwidth for more assignments without hiring
- Executive demand for data-driven decision support is increasing—better presentations improve adoption of recommendations
- Remote/hybrid work makes collaboration challenges more acute—real-time digital workflow enables distributed teams
- Six Sigma methodology is standardized—automation won't require constant retooling as practices evolve

---

## Proposed Solution

### Core Concept

BPI Assignment Platform is a **purpose-built web application** that guides BPI analysts through the complete Six Sigma assignment lifecycle—from VOC/CTQ capture through multi-process analysis to actionable recommendations—with automated calculations, real-time visualizations, and role-based access for stakeholders.

### Key Differentiators

**1. Story-Driven Architecture**
- Navigation follows analytical narrative: VOC/CTQ → Process Analysis → FMEA → Recommendations
- Stakeholders see the logical flow from customer voice to root causes to solutions
- Process-centric tabs (not artifact-centric) match how users think about the work

**2. Automation That Preserves Expertise**
- System handles calculations (Pareto, Cp/Cpk, Sigma Level, RPN) with full transparency ("show your work")
- Human insight drives qualitative analysis (root causes, recommendations, CTQ identification)
- Eliminates chart creation drudgery while maintaining analyst control over interpretation

**3. Dual-Mode Workflow**
- **Draft Mode:** Flexible, collaborative editing with auto-propagation of changes across dependent sections
- **Completed Mode:** Locked, stable reports with professional presentation and stakeholder access
- Prevents chaos during creation while ensuring polished delivery

**4. Built-in Collaboration Safety**
- Section-level locking (one editor at a time per section) prevents conflicts
- Activity feed shows who changed what and when for full transparency
- Team Lead dashboard provides progress tracking and validation oversight

**5. Hybrid Data Entry**
- Manual forms for qualitative inputs (VOC/CTQ, recommendations)
- Spreadsheet-like grids for tabular data (SIPOC, VSM, FMEA)
- CSV/Excel bulk import for system-sourced process data
- Matches real-world workflows where data collection happens offline

### Why This Will Succeed

- **Domain-specific:** Built for Six Sigma methodology, not generic project management
- **Automation + Control:** Speeds up mechanical tasks without replacing human judgment
- **User-centered design:** Based on extensive brainstorming with actual BPI team workflows and pain points
- **Modern tech stack:** Next.js + shadcn provides professional UI with rapid development cycle

### High-Level Vision

A comprehensive digital workspace where BPI teams spend 70%+ of their time analyzing problems (not formatting documents), stakeholders access insights through interactive dashboards (not static PDFs), and organizations track improvement patterns across their entire assignment portfolio.

---

## Target Users

### Primary User Segment: BPI Analysts

**Profile:**
- Business process improvement specialists trained in Six Sigma methodology
- Perform 8-15 assignments per year analyzing internal processes
- Work involves field observation, data collection, statistical analysis, and recommendation development
- Tech-savvy but not software developers; comfortable with Excel, PowerPoint, basic web apps

**Current Behaviors & Workflows:**
- Conduct analysis offline (shadowing employees, reviewing system data extracts, interviewing stakeholders)
- Transfer findings into manual report templates
- Create visualizations in separate tools (Excel charts, Visio diagrams)
- Coordinate with team members via email and shared drives
- Present findings to executives in meetings using PDF reports

**Specific Needs & Pain Points:**
- **Speed:** Need to complete assignments faster without sacrificing quality
- **Accuracy:** Must trust that automated calculations are correct (credibility is critical)
- **Flexibility:** Get interrupted frequently; need auto-save and easy resume capability
- **Efficiency:** Want to avoid re-typing data from Excel into separate chart tools
- **Guidance:** Appreciate templates and structure that ensure methodology compliance

**Goals:**
- Complete assignment reports in 50% less time
- Reduce manual errors in calculations and transcription
- Focus more time on analysis and less on document production
- Maintain professional output quality that impresses stakeholders

### Secondary User Segment: Team Leads (Quality Oversight)

**Profile:**
- Senior BPI professionals managing 3-5 analysts
- Responsible for final approval of assignment quality before stakeholder presentation
- Balance speed (team productivity) with accuracy (organizational credibility)

**Current Behaviors & Workflows:**
- Review draft reports section by section
- Spot-check calculations manually in Excel
- Provide feedback via email or document comments
- Gate-keep final approval before distribution

**Specific Needs & Pain Points:**
- **Visibility:** Need real-time view of assignment progress and team activity
- **Validation:** Must quickly identify incomplete sections or suspicious data
- **Control:** Require approval workflow to prevent premature release of unvetted work
- **Trust:** Need transparency into how calculations are performed

**Goals:**
- Ensure 100% accuracy of calculations and data integrity
- Track team progress without micromanaging
- Reduce time spent spot-checking (trust but verify)
- Maintain team's credibility with executive stakeholders

### Tertiary User Segment: Executive Stakeholders

**Profile:**
- C-suite and senior leadership making investment decisions based on BPI recommendations
- Limited time, need concise insights
- Care about "why this recommendation" not detailed methodology

**Current Behaviors & Workflows:**
- Receive PDF reports via email
- Skim executive summary and recommendations
- Ask clarifying questions in meetings
- Approve or defer implementation based on expected ROI

**Specific Needs & Pain Points:**
- **Clarity:** Need story-driven presentation (problem → analysis → solution)
- **Traceability:** Want to understand how recommendations connect to root causes
- **Access:** Prefer on-demand access over waiting for PDF distribution
- **Impact:** Need quantified benefits (time savings, cost reduction, quality improvement)

**Goals:**
- Quickly understand key findings and recommendations
- Make confident decisions with clear supporting evidence
- Drill into details only when necessary
- Track implementation progress post-approval

### Quaternary User Segment: Process Owners

**Profile:**
- Department managers responsible for implementing approved recommendations
- Defensive about their processes but want to improve outcomes
- Need focused information relevant to their area only

**Current Behaviors & Workflows:**
- Receive completed assignment reports affecting their departments
- Review findings and recommendations
- Plan implementation with teams
- Report back on results

**Specific Needs & Pain Points:**
- **Relevance:** Only need information about their specific processes, not entire portfolio
- **Timing:** Prefer seeing final results (not draft analysis in progress)
- **Actionability:** Need clear, implementable recommendations with expected impact
- **Collaboration:** Want to engage constructively, not defensively

**Goals:**
- Understand root causes affecting their processes
- Receive actionable recommendations with implementation guidance
- Track results of implemented changes
- Maintain positive relationship with BPI team

---

## Goals & Success Metrics

### Business Objectives

- **Efficiency Gain:** Reduce average assignment completion time from 4-6 weeks to 2-3 weeks (40% reduction)
- **Capacity Expansion:** Increase team assignment capacity by 50% without additional headcount
- **Quality Improvement:** Achieve 100% calculation accuracy with zero stakeholder-reported errors
- **Adoption Rate:** 90% of assignments created in platform within 6 months of launch
- **Stakeholder Engagement:** Increase executive review time by 30% (easier access = more engagement)

### User Success Metrics

- **Time to First Chart:** Analysts generate first visualization in <5 minutes (vs. 30+ minutes manually)
- **Collaboration Efficiency:** Reduce version conflicts to zero (vs. ~3 per assignment currently)
- **Team Lead Confidence:** 100% of Team Leads report trusting automated calculations after validation period
- **Stakeholder Satisfaction:** 80%+ of executives rate presentation quality as "excellent" or "very good"
- **Repeat Usage:** 95% of analysts prefer platform over manual workflow after first assignment

### Key Performance Indicators (KPIs)

- **Assignment Cycle Time:** Days from kickoff to stakeholder presentation (Target: 50% reduction)
- **Non-Analytical Time Ratio:** Hours spent on formatting/charts vs. analysis work (Target: <20% of total time)
- **Calculation Error Rate:** Errors per assignment requiring correction (Target: <0.1%)
- **Platform Adoption Rate:** % of new assignments created in platform (Target: 90% by month 6)
- **Concurrent Collaboration:** Average number of team members working simultaneously per assignment (Target: 2+)
- **Stakeholder Access Rate:** % of completed assignments viewed by stakeholders within 48 hours (Target: 80%)
- **User Satisfaction Score:** NPS or CSAT from BPI analysts (Target: 40+ NPS)

---

## MVP Scope

### Core Features (Must Have)

- **Two-Mode Workflow (Draft/Completed):** State machine with flexible editing during creation and locked stability post-completion; "Reopen for Editing" action for approved changes
  - *Rationale:* Foundational architectural decision affecting all features; prevents rework if added later

- **Story-Driven Navigation:** VOC/CTQ → Process Tabs → FMEA → Recommendations with clear sequential flow
  - *Rationale:* Core UX pattern that matches user mental models; must be in place before building content sections

- **VOC/CTQ Form Input:** Structured form capturing Voice of Customer and Critical to Quality requirements as assignment foundation
  - *Rationale:* First section in workflow; validates end-to-end flow early with real users

- **SIPOC Spreadsheet Interface:** Grid-based editor for Suppliers, Inputs, Process, Outputs, Customers with validation
  - *Rationale:* Core Six Sigma tool demonstrating multi-input capability and data entry UX patterns

- **VSM Data Entry:** Capture process steps, durations, value-added vs. non-value-added time for Value Stream Mapping
  - *Rationale:* Required for Pareto analysis and process capability calculations

- **Automated Pareto Chart Generation:** Bar chart with cumulative line showing 80/20 rule, generated from VSM step durations
  - *Rationale:* First proof of automation value; demonstrates calculation correctness and visualization quality

- **Fishbone Diagram Builder:** Template-driven interface for 6 categories (People, Process, Equipment, Materials, Environment, Management) with free-text root causes
  - *Rationale:* Central analytical artifact connecting Pareto findings to recommendations

- **FMEA Table (Consolidated):** Failure Mode and Effects Analysis with Severity, Occurrence, Detection ratings and auto-calculated RPN scores
  - *Rationale:* Risk prioritization framework informing recommendation development

- **Recommendations Form:** Structured input for actionable recommendations with expected impact, implementation difficulty, and traceability to root causes
  - *Rationale:* Final deliverable section; must connect back to Fishbone/FMEA for stakeholder story

- **Multi-Process Support:** Ability to analyze multiple processes per assignment, each with full SIPOC → VSM → Pareto → Fishbone → Capability workflow
  - *Rationale:* Real assignments analyze multiple related processes; single-process MVP would require major refactor

- **Basic PDF Export:** Single-document export of entire assignment for traditional distribution
  - *Rationale:* Critical for stakeholder sharing and archival; validates layout and print formatting

- **User Authentication & Authorization:** Role-based access (BPI Team, Team Lead, Executive, Process Owner) with appropriate permissions
  - *Rationale:* Security requirement and foundation for collaboration features

- **Auto-Save Functionality:** Periodic background saves to handle frequent interruptions during data entry
  - *Rationale:* Ahmed persona highlighted getting interrupted frequently; prevents data loss

### Out of Scope for MVP

- Section-level locking and real-time collaboration (multi-user editing)
- CSV/Excel bulk import for tabular data
- Team Lead approval workflow and validation dashboard
- Activity feed and audit trail
- Version history and compare/restore capabilities
- Process Flow Diagram auto-generation from SIPOC
- Process Capability calculations (Cp, Cpk, Sigma Level) and bell curve charts
- Portfolio view and cross-assignment analytics
- Interactive stakeholder workshop mode
- Mobile/tablet optimization
- AI-assisted root cause suggestions
- Custom branding and white-labeling
- Integration with external tools (ERP, BI, Slack)

### MVP Success Criteria

**MVP is successful if:**
1. A single BPI analyst can complete a 2-process assignment from scratch to PDF export in <10 hours (vs. 20+ hours manually)
2. All automated calculations (Pareto rankings, RPN scores) are validated as 100% accurate by Team Lead
3. Generated Pareto chart and Fishbone diagram are rated "professional quality, suitable for executive presentation" by 3+ analysts
4. Platform demonstrates faster time-to-completion than manual workflow for at least 80% of test assignments
5. Zero data loss incidents during 30-day pilot with 5 real assignments
6. At least 3 out of 5 pilot analysts choose to continue using platform over manual workflow

---

## Post-MVP Vision

### Phase 2 Features

**Team Collaboration & Oversight (3-4 weeks development)**
- Section-level locking with presence indicators
- Activity feed showing edit history and user actions
- Team Lead dashboard with progress tracking and validation alerts
- Approval workflow (Draft → Review → Completed state transitions)
- Validation rules and data completeness indicators

**Enhanced Data Entry & Automation (4-5 weeks development)**
- CSV/Excel bulk import with column mapping and validation
- Process Flow Diagram auto-generation from SIPOC steps
- Process Capability calculations (Cp, Cpk, Sigma Level) with bell curve visualization
- Calculation transparency UI ("show formula" tooltips)
- Outlier detection and warning indicators

**Stakeholder Experience Improvements (2-3 weeks development)**
- Executive summary landing page with key findings at-a-glance
- Traceability links (recommendations → root causes → process data)
- Process-specific views for Process Owners
- Enhanced PDF export with custom branding and executive summary page

### Long-Term Vision (12-18 months)

**Portfolio Intelligence**
- Cross-assignment pattern recognition identifying recurring root causes
- Organizational trend analysis (which processes need most attention)
- Recommendation tracking and implementation monitoring
- Strategic insights dashboard for senior leadership

**Advanced Analytics**
- Predictive process capability modeling (forecast improvements from recommendations)
- ROI calculator connecting recommendations to quantified business impact
- Benchmark library comparing similar processes across departments

**Collaboration Evolution**
- Interactive stakeholder workshop mode with scenario modeling
- Real-time presentation capabilities with live data manipulation
- Comment threads and discussion forums per section
- Integration with project management tools for implementation tracking

### Expansion Opportunities

- **External Consulting:** White-label version for Six Sigma consulting firms serving multiple clients
- **Adjacent Methodologies:** Adapt platform for Lean, Kaizen, DMAIC frameworks beyond traditional Six Sigma
- **Industry Specialization:** Vertical-specific templates (healthcare, manufacturing, financial services)
- **Training Platform:** Built-in Six Sigma methodology education and certification tracking
- **API Ecosystem:** Open platform allowing third-party integrations and custom extensions

---

## Technical Considerations

### Platform Requirements

- **Target Platforms:** Web application (desktop browsers primary, tablet secondary)
- **Browser/OS Support:**
  - Modern browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
  - No IE11 support required
  - Responsive design for 1024px+ screens (desktop/laptop focus)
  - PDF export must render consistently across platforms
- **Performance Requirements:**
  - Page load time <2 seconds for typical assignment
  - Chart generation <500ms after data input
  - Auto-save latency <1 second
  - Support assignments with up to 10 processes, 50 SIPOC steps per process
  - Concurrent users: 20+ team members, 100+ stakeholder viewers

### Technology Preferences

- **Frontend:**
  - Next.js 14+ (App Router)
  - React 18+ with TypeScript
  - shadcn/ui component library
  - Black/white theme (minimal, professional aesthetic)
  - Chart.js or Recharts for visualizations
  - React Flow or Mermaid for diagram generation (future)

- **Backend:**
  - Next.js API routes (serverless functions)
  - TypeScript for type safety
  - tRPC or REST API design

- **Database:**
  - PostgreSQL (relational data model for structured Six Sigma artifacts)
  - Supabase or direct PostgreSQL hosting
  - Prisma ORM for type-safe database access

- **Hosting/Infrastructure:**
  - Vercel (seamless Next.js deployment)
  - Edge runtime for optimal performance
  - AWS S3 or Vercel Blob for file storage (CSV uploads, PDF exports)

### Architecture Considerations

- **Repository Structure:**
  - Monorepo with clear separation: `/app` (Next.js), `/components` (UI), `/lib` (business logic), `/prisma` (database schema)
  - Feature-based organization within `/app/assignments/[id]/...` for assignment workflows

- **Service Architecture:**
  - Server-side rendering for initial page loads (SEO not required but SSR improves perceived performance)
  - Client-side state management with Zustand or React Context
  - Optimistic UI updates for better UX during auto-save

- **Integration Requirements:**
  - PDF generation: react-pdf or Puppeteer for server-side rendering
  - Future: REST API endpoints for potential external integrations

- **Security/Compliance:**
  - Role-based access control (RBAC) at data layer
  - Row-level security in database (Supabase RLS or custom middleware)
  - Audit logging for compliance (who accessed/modified what)
  - HTTPS only, secure authentication (NextAuth.js or Supabase Auth)
  - No PII or sensitive business data encryption requirements identified yet (confirm with stakeholders)

---

## Constraints & Assumptions

### Constraints

- **Budget:** Internal project with developer resources allocated, minimal SaaS costs acceptable (Vercel Pro, Supabase, <$200/month)
- **Timeline:** 6-8 weeks for MVP, 3-month total timeline to Phase 2 feature-complete version
- **Resources:**
  - 1 Full-stack developer (primary)
  - Part-time design review (shadcn component customization)
  - BPI team access for user testing (2-3 analysts, 1 team lead)
  - Six Sigma SME for calculation validation (5-10 hours total)
- **Technical:**
  - Must work within corporate network (no external API dependencies that require firewall exceptions)
  - Desktop-first (mobile optimization deferred)
  - Single-tenant deployment (no multi-organization support in MVP)

### Key Assumptions

- **Assumption 1:** BPI analysts have consistent internet access during data entry (not offline-first architecture)
  - *Validation needed:* Confirm with team about field work scenarios requiring offline capability

- **Assumption 2:** Six Sigma methodology is standardized across all analysts (same SIPOC/FMEA/Fishbone frameworks)
  - *Validation needed:* Review current templates and confirm no departmental variations

- **Assumption 3:** Assignment volume is 30-50 per year (scalability requirements modest)
  - *Validation needed:* Get actual historical data on assignment count and growth projections

- **Assumption 4:** Manual workflow currently takes 15-25 hours per assignment
  - *Validation needed:* Time study with 3-5 analysts tracking actual hours on next assignments

- **Assumption 5:** Stakeholders prefer web access over PDF-only distribution
  - *Validation needed:* Survey executives and process owners on preferred delivery format

- **Assumption 6:** Team size is 5-10 analysts (collaboration features sized accordingly)
  - *Validation needed:* Confirm current team size and 2-year growth plans

- **Assumption 7:** Calculation accuracy concerns are perception-based, not evidence of frequent actual errors
  - *Validation needed:* Audit sample of past assignments for calculation errors

- **Assumption 8:** Process data is collected offline (shadowing, interviews) then manually entered
  - *Validation needed:* Confirm % of processes using system-sourced data vs. manual observation

---

## Risks & Open Questions

### Key Risks

- **Calculation Trust Risk:** If automated calculations have even one significant error in pilot, could undermine entire platform adoption
  - *Impact:* High (could kill project)
  - *Mitigation:* Comprehensive unit testing, SME validation, "show your work" transparency features, parallel manual calculation checks during pilot

- **Adoption Resistance Risk:** Analysts comfortable with manual workflow may resist change despite efficiency gains
  - *Impact:* Medium (slow adoption delays ROI)
  - *Mitigation:* Involve analysts early in design, pilot with enthusiastic early adopters, demonstrate time savings with real metrics

- **Scope Creep Risk:** Team Lead and stakeholder feature requests could balloon MVP beyond 8-week timeline
  - *Impact:* Medium (delayed launch)
  - *Mitigation:* Strict MVP definition, Phase 2 parking lot for good ideas, regular prioritization reviews

- **Data Migration Risk:** Existing in-flight assignments may need to be completed in old workflow (no migration path)
  - *Impact:* Low (accept hybrid period)
  - *Mitigation:* Clear cutover date, optional manual data entry for critical historical assignments

- **Performance Risk:** Complex assignments with 10+ processes and hundreds of data points could cause slow load times
  - *Impact:* Medium (UX degradation)
  - *Mitigation:* Performance testing with realistic data volumes, lazy loading strategies, pagination if needed

- **Stakeholder Access Risk:** Executives may not adopt web dashboard, defaulting to PDF requests
  - *Impact:* Low (PDF export covers fallback)
  - *Mitigation:* Champion identification, executive demo sessions, mobile-responsive design (future)

### Open Questions

- **Q1:** How many assignments does the team complete per year? (Affects scalability and ROI calculation)
- **Q2:** What percentage of assignments analyze multiple processes vs. single process? (Affects UI complexity priorities)
- **Q3:** Are there regulatory or compliance requirements for audit trails and data retention? (Affects architecture decisions)
- **Q4:** Do analysts need offline capability for field work, or is internet access consistent? (Affects technical approach)
- **Q5:** What is the actual time breakdown for current manual workflow? (Validates problem statement quantification)
- **Q6:** Are there existing calculation spreadsheets or templates that could be directly imported? (Affects migration strategy)
- **Q7:** How are FMEA failure modes currently identified? Is there a standard template or is it ad hoc? (Affects FMEA builder design)
- **Q8:** Do executives need mobile access for on-the-go review, or is desktop-only acceptable? (Affects responsive design priorities)
- **Q9:** Is there budget for ongoing maintenance and feature development post-launch? (Affects technical debt and architecture decisions)
- **Q10:** What happens if two analysts need to edit the same section simultaneously during MVP (no locking)? (Affects user training and workflow)

### Areas Needing Further Research

- **PDF Layout & Branding:** Detailed design of executive summary page, page breaks, header/footer, organizational branding requirements
- **FMEA Workflow Details:** Standard failure mode categories, connection logic to Fishbone causes, risk prioritization thresholds
- **Portfolio Analytics Requirements:** What cross-assignment views executives need, trend analysis formats, process comparison methodologies
- **Calculation Formula Documentation:** Comprehensive specification of all Six Sigma formulas with edge cases and rounding rules
- **User Training Approach:** Self-service tutorials, live training sessions, documentation requirements, change management strategy
- **Integration Opportunities:** Potential future connections to ERP systems, BI platforms, project management tools
- **Mobile UX Requirements:** Stakeholder mobile access patterns, tablet usage scenarios, responsive breakpoints

---

## Appendices

### A. Research Summary

This Project Brief is based on a comprehensive brainstorming session conducted on 2025-09-30 using the BMAD-METHOD™ framework. The session employed three analytical techniques:

**1. First Principles Thinking (30 minutes)**
- Identified fundamental purpose: automate manual reporting + modernize stakeholder presentation
- Distinguished human insight inputs (VOC, root causes, recommendations) from system calculations (VSM metrics, Pareto, capability)
- Recognized two distinct user types with different value propositions (creators vs. viewers)
- Key insight: Automation value comes from eliminating repetitive chart creation, not replacing human analysis

**2. Morphological Analysis (45 minutes)**
- Systematically explored architectural options for data input, workflow structure, visualization, dashboard layout, and collaboration
- Generated 50+ architecture decisions and feature requirements
- Resolved navigation tension (process-centric beats artifact-centric)
- Key insight: Two-mode system (Draft flexible, Completed locked) solves creation vs. presentation tension

**3. Role Playing (30 minutes)**
- Validated architecture from perspectives of: Team Lead (Sarah), Analyst (Ahmed), Executive (Fatima), Process Owner (Khalid)
- Uncovered missing requirements: Team Lead dashboard, hybrid data entry, calculation transparency, access control model
- Key insight: Accuracy trumps speed for Team Leads; story matters more than data for Executives

**Key Themes from Brainstorming:**
- Automation & Efficiency (transform manual reporting into streamlined workflow)
- Story-Driven Design (VOC → Analysis → Recommendations as narrative flow)
- Multi-User Collaboration (section-level locking with activity feed)
- Role-Based Experience (different views for creators, decision-makers, process owners)
- Data Integrity (validation, transparency, audit trails as core requirements)
- Hybrid Data Entry (manual observation + bulk CSV import based on process type)

**Top 3 Priority Recommendations from Session:**
1. **MVP Foundation** - Core workflow with Draft mode, story-driven navigation, basic forms/grids, Pareto chart, PDF export (6-8 weeks)
2. **Calculation Engine + Visualization Suite** - Six Sigma formulas with transparency, complete chart library (4-5 weeks parallel)
3. **Team Lead Dashboard + Validation System** - Quality gates, approval workflow, validation rules (3 weeks post-MVP)

### B. Stakeholder Input

**BPI Analyst Personas (from brainstorming Role Playing):**
- **Ahmed:** Field-focused analyst who collects data offline, needs hybrid manual/bulk entry, gets interrupted frequently (auto-save critical)
- Emphasized transcription error risk from manual re-typing, validated need for CSV import

**Team Lead Persona:**
- **Sarah:** Quality-focused leader prioritizing accuracy over speed, needs calculation transparency and validation tools
- Highlighted data integrity as #1 concern, credibility with stakeholders depends on zero errors
- Required progress tracking dashboard and approval workflow

**Executive Persona:**
- **Fatima:** Time-constrained decision-maker who needs story-driven presentation (problem → analysis → solution)
- Wants traceability from recommendations back to root causes
- Prefers executive summary landing view with drill-down capability

**Process Owner Persona:**
- **Khalid:** Department manager who needs process-specific views (not full portfolio), prefers final results over draft visibility
- Validated access control model: view completed assignments only, scoped to relevant processes

### C. References

- Brainstorming Session Results: `docs/brainstorming-session-results.md` (2025-09-30)
- BMAD-METHOD™ Framework: `.bmad-core/data/brainstorming-techniques.md`
- Core Project Configuration: `.bmad-core/core-config.yaml`

---

## Next Steps

### Immediate Actions

1. **Validate Assumptions (Week 1)**
   - Survey BPI team: Confirm assignment volume, time breakdowns, team size, workflow patterns
   - Interview Team Lead (Sarah): Review calculation validation needs and approval workflow requirements
   - Interview 2-3 analysts: Validate offline data collection patterns and tool preferences

2. **Technical Setup (Week 1)**
   - Initialize Next.js project with TypeScript, shadcn/ui, and black/white theme
   - Set up PostgreSQL database (Supabase recommended) with basic schema
   - Configure authentication (NextAuth.js or Supabase Auth) with role-based access
   - Establish CI/CD pipeline for Vercel deployment

3. **Define Database Schema (Week 1-2)**
   - Design multi-process assignment data model
   - Schema for: Assignments, Processes, VOC/CTQ, SIPOC, VSM, Fishbone, FMEA, Recommendations
   - Plan relationships and cascading rules
   - Review with technical SME for normalization and performance

4. **Create Wireframes (Week 2)**
   - Draft UI mockups for: VOC/CTQ form, SIPOC grid, VSM table, Fishbone builder, FMEA table, Recommendations form
   - Story-driven navigation flow diagram
   - Team Lead dashboard concept
   - Review with 2-3 pilot analysts for feedback

5. **Build MVP Foundation (Weeks 2-8)**
   - Implement two-mode state machine (Draft/Completed)
   - Build story-driven navigation structure
   - Create forms and spreadsheet interfaces for all 7 sections
   - Implement Pareto chart auto-generation
   - Add basic PDF export
   - User testing every 2 weeks with pilot analysts

6. **Pilot Program (Weeks 7-10)**
   - Recruit 5 pilot users (3 analysts, 1 team lead, 1 executive)
   - Complete 3-5 real assignments in platform parallel to manual workflow
   - Measure time-to-completion, calculation accuracy, user satisfaction
   - Gather feedback for Phase 2 prioritization

7. **Validation & SME Review (Weeks 8-9)**
   - Six Sigma SME validates all calculation formulas
   - Comprehensive unit testing of calculation engine
   - Cross-check automated outputs against manual calculations
   - Address any accuracy issues before pilot expansion

8. **Launch Preparation (Week 10-12)**
   - Create user documentation and training materials
   - Plan team rollout and change management approach
   - Establish support process for questions and issues
   - Define success metrics tracking methodology
   - Full team training sessions

### PM Handoff

This Project Brief provides the full context for **BPI Assignment Platform**. The next step is to create a comprehensive Product Requirements Document (PRD) that translates this strategic vision into detailed functional specifications.

**Recommended Approach:**
- Use the PRD template (`prd-tmpl.yaml`) to systematically elaborate each section
- Focus on user stories, acceptance criteria, and technical specifications
- Prioritize MVP scope strictly to maintain 6-8 week timeline
- Include Team Lead validation requirements and calculation transparency as critical non-functional requirements
- Reference brainstorming session insights for UX decisions and architectural rationale

**Key Considerations for PRD:**
1. **Data Model:** Multi-process structure with SIPOC → Artifacts workflow per process
2. **Calculation Transparency:** "Show your work" UI for all Six Sigma formulas (builds trust)
3. **Two-Mode Workflow:** State transitions and editing rules must be explicit
4. **Role-Based Access:** Define permissions matrix for all user types
5. **Auto-Save Strategy:** Handle interruptions gracefully (Ahmed's frequent disruptions)
6. **PDF Export Layout:** Professional formatting suitable for executive presentation

The Business Analyst is ready to collaborate on PRD development or provide additional research as needed.

---

*Document prepared using BMAD™ Core project brief template v2.0*