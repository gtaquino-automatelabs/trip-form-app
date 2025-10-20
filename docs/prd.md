# Travel Request Form System Product Requirements Document (PRD)

## Goals and Background Context

### Goals
- Transform CEIA's Microsoft Forms travel request system into a custom web application with database persistence
- Maintain familiar user experience while eliminating current form limitations
- Enable dynamic field controls and conditional logic within the form flow
- Persist all form submissions in a PostgreSQL database for future reference
- Provide administrative dashboard for viewing and managing travel requests
- Create foundation for future enhancements including API integrations and approval workflows

### Background Context

CEIA currently relies on Microsoft Forms for processing travel and per diem requests, which has created significant operational limitations including lack of database persistence, inability to implement dynamic fields, and no integrated flight search capabilities. This custom web application will replicate the exact functionality of the existing 8-page form while addressing these limitations through a Next.js-based solution with PostgreSQL storage. The MVP focuses on creating a "Simple Clone+" that maintains user familiarity while establishing a technical foundation for future enhancements including dynamic data integration, approval workflows, and third-party API connections.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-08-11 | 1.0 | Initial PRD creation from Project Brief | John (PM) |
| 2025-10-19 | 1.1 | Updated with database enhancements and Epic 5 | Winston (Architect) |

## Requirements

### Functional Requirements

- **FR1:** System shall replicate all 8 pages from the original Microsoft Forms with exact field structure and conditional navigation logic
- **FR2:** System shall persist all form submissions to PostgreSQL database with complete field data capture
- **FR3:** System shall support file uploads for passport images and flight suggestion documents with max 10MB per file
- **FR4:** System shall implement conditional page routing based on user selections (international travel, time restrictions, flight preferences)
- **FR5:** System shall provide real-time field validation with Portuguese error messages for all required fields
- **FR6:** System shall generate unique request IDs using CUID for each submission
- **FR7:** Admin dashboard shall display all submissions in a searchable, sortable table view
- **FR8:** System shall maintain form state across pages using Zustand state management
- **FR9:** System shall display confirmation page with submitted data summary after successful submission
- **FR10:** System shall support three request types: "Passagens e Diárias", "Apenas Passagens", "Apenas Diárias"
- **FR11:** System shall require user authentication via email/password or OAuth providers (Google, Microsoft) before form access
- **FR12:** System shall maintain user sessions and associate form submissions with authenticated users
- **FR13:** Login page shall support both sign-in and sign-up flows with password recovery option

### Non-Functional Requirements

- **NFR1:** Page load time must be under 2 seconds on standard broadband connection
- **NFR2:** Form submission processing must complete within 3 seconds
- **NFR3:** File uploads must support up to 10MB files and complete within 5 seconds
- **NFR4:** System must maintain 100% form completion success rate without data loss
- **NFR5:** Application must work on Chrome, Firefox, and Edge browsers (latest versions)
- **NFR6:** All UI text and error messages must be in Portuguese language
- **NFR7:** System must maintain visual consistency with original Microsoft Forms design (using provided background image)
- **NFR8:** Database must support concurrent form submissions without conflicts
- **NFR9:** System must handle browser back/forward navigation without data loss
- **NFR10:** Application must be deployable to standard Node.js hosting environments
- **NFR11:** Authentication tokens must be securely stored and validated
- **NFR12:** OAuth integration must follow provider security best practices

## User Interface Design Goals

### Overall UX Vision
Modern authentication-first experience leading into the familiar form interface. Users authenticate via email/password or SSO providers before accessing the travel request form, ensuring secure data capture and user tracking.

### Key Interaction Paradigms
- **Authentication gateway**: Login/signup page as entry point with multiple auth options
- **Progressive disclosure**: Multi-page flow reveals fields contextually based on user selections
- **Immediate validation**: Real-time field validation with inline Portuguese error messages
- **Visual continuity**: Fixed background image (background.png) throughout application
- **Breadcrumb navigation**: Clear indication of current position in form flow with ability to navigate backward

### Core Screens and Views
- **Login/Signup Page**: Email/password authentication with Google and Microsoft SSO options
- **Form Landing Page**: Post-authentication entry with project selection and start button
- **Page 1 - Passenger Data Screen**: Core passenger information collection
- **Page 2 - Travel Details Screen**: Origin, destination, and date selection
- **Page 3 - Expense Type Screen**: Selection of expense categories
- **Page 4 - Preferences Screen**: Per diem and allowance preferences
- **Page 5 - International Travel Screen**: Passport and visa information (conditional)
- **Page 6 - Time Restrictions Screen**: Flight time constraints (conditional)
- **Page 7 - Flight Suggestions Screen**: Upload interface for flight preferences (conditional)
- **Page 8 - Trip Objective Screen**: Justification and final details
- **Confirmation Screen**: Summary of submitted data with reference number
- **Admin Dashboard**: Table view with filters, search, and status management

### Accessibility: None
Standard web usability without specific accessibility compliance requirements.

### Branding
- **Background**: Fixed image using provided background.png (cyan to purple gradient with wave patterns)
- **CEIA brain logo**: Positioned in header/login page
- **Clean, modern typography**: Inter or system fonts
- **Form styling**: Clean white/semi-transparent cards over background image
- **Authentication providers**: Prominent Google and Microsoft login buttons with official branding

### Target Device and Platforms: Web Responsive
Primary target is desktop browsers (Chrome, Firefox, Edge) with responsive design that adapts to tablet screens. Mobile optimization is designated for Phase 2.

## Technical Assumptions

### Repository Structure: Monorepo
Using Turborepo structure as specified in the brief, allowing shared components and unified deployment while maintaining clear separation between web app and server concerns.

### Service Architecture
**Monolithic Next.js Application** - Single Next.js 15.3 application with integrated API routes for backend functionality. This provides simplified deployment, unified codebase, and leverages Next.js full-stack capabilities for the MVP scope.

### Testing Requirements
**Unit + Integration Testing** - Implement unit tests for critical business logic (form validation, data transformations) and integration tests for API endpoints and database operations. Manual testing convenience methods for form flow validation.

### Additional Technical Assumptions and Requests

- **Database**: Supabase Cloud (PostgreSQL) in South America region (sa-east-1)
  - Previously: Local Docker instance (migrated October 2025)
- **Authentication**: Supabase Auth (built-in authentication service)
- **Database Access**: Supabase JS Client for database operations
- **Frontend Framework**: Next.js 15.3 with React 19 and TypeScript for type safety
- **UI Component Library**: shadcn/ui for consistent, customizable components
- **Styling**: TailwindCSS for utility-first styling approach
- **State Management**: Zustand for client-side form state persistence across pages
- **State Management Enhancement**: Zustand + TanStack Query for server state
- **Form Management**: TanStack Form alongside Zustand for complex form state
- **Form Validation**: Zod schemas for runtime validation matching TypeScript types
- **File Handling**: Local filesystem storage for MVP, with uploaded files stored in `public/uploads/` (option for Supabase Storage)
- **Reference Data Tables**:
  - `projetos` table with 53 pre-populated CEIA projects
  - `bancos_brasileiros` table with 190+ Brazilian banking institutions
- **Structured Bank Data**: Separate fields for bank name, branch (agência), and account number
- **Package Manager**: npm 11.4.2 as specified
- **Deployment Target**: Node.js compatible hosting (Vercel, Railway, or similar)
- **Environment Management**: .env files for configuration (Supabase URL, anon key)
- **Session Management**: Supabase Auth session handling
- **Error Tracking**: Console logging for MVP, with structured error responses
- **Development Tools**: ESLint, Prettier for code quality and consistency
- **Real-time Potential**: Supabase real-time subscriptions available for future admin dashboard enhancements

## Epic List

### Epic 1: Foundation & Authentication Infrastructure
Establish project setup with Turborepo, authentication system, database schema, and deliver initial login/signup functionality with a health check endpoint.

### Epic 2: Core Form Flow & Data Capture
Implement the complete 8-page form flow with all fields, conditional navigation logic, state management, and database persistence.

### Epic 3: File Handling & Form Submission
Enable file upload capabilities, form submission processing, confirmation flow, and data validation with error handling.

### Epic 4: Administrative Dashboard
Create admin interface for viewing, searching, filtering, and managing submitted travel requests with status tracking.

### Epic 5: Supabase Cloud Migration
Migrate the application from local Docker Supabase to Supabase Cloud (South America region) to enable cloud-based development and eliminate local infrastructure dependencies.

See `docs/prd/epic-5-supabase-cloud-migration.md` for complete epic details and stories.

## Epic 1: Foundation & Authentication Infrastructure

**Goal:** Establish the complete project foundation with Turborepo structure, connect to local Supabase instance, and implement authentication using Supabase Auth with email/password and OAuth providers. This epic delivers immediate user value through secure login functionality while leveraging Supabase's built-in authentication features.

### Story 1.1: Project Setup and Infrastructure
As a developer,  
I want to initialize the Turborepo project with all dependencies and configurations,  
so that the team has a consistent development environment.

**Acceptance Criteria:**
1. Turborepo structure created with apps/web directory
2. Next.js 15.3 with React 19 and TypeScript configured in apps/web
3. All dependencies installed (TailwindCSS, shadcn/ui, Zustand, Zod, @supabase/supabase-js, @supabase/auth-helpers-nextjs)
4. ESLint and Prettier configured with consistent rules
5. Git repository initialized with proper .gitignore
6. Package.json scripts configured for dev, build, and test commands
7. Health check API endpoint at /api/health returning { status: "ok", supabase: "connected" }

### Story 1.2: Supabase Connection and Schema
As a developer,  
I want to connect to the local Supabase instance and create the database schema,  
so that the application can persist user and form data.

**Acceptance Criteria:**
1. Supabase client configured with local Docker instance URL and anon key
2. Environment variables set for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
3. TravelRequest table created with all fields from Project Brief specification
4. Row Level Security (RLS) policies configured for TravelRequest table
5. Database migrations tracked in supabase/migrations directory
6. Supabase client utilities created for server and client components
7. Test connection verified with sample query

**Note (October 2025):** This story was initially implemented with local Docker Supabase. The system was later migrated to Supabase Cloud in Epic 5. Current implementation uses cloud instance in sa-east-1 region.

### Story 1.3: Supabase Auth Implementation
As a developer,  
I want to implement Supabase Auth with email/password and OAuth providers,  
so that users can securely access the application.

**Acceptance Criteria:**
1. Supabase Auth configured for email/password authentication
2. Google OAuth provider configured in Supabase dashboard
3. Microsoft OAuth provider configured in Supabase dashboard
4. Auth middleware protecting /form routes
5. User session management with Supabase session cookies
6. Auth context provider wrapping the application
7. Helper functions for login, signup, logout, and getCurrentUser

### Story 1.4: Login and Signup UI
As a user,  
I want to sign up and log in using email or social providers,  
so that I can access the travel request form.

**Acceptance Criteria:**
1. Login page created with email/password form fields
2. "Sign in with Google" button using Supabase Auth
3. "Sign in with Microsoft" button using Supabase Auth
4. Toggle between login and signup modes on same page
5. Background image (background.png) displayed as fixed background
6. Form validation with Portuguese error messages
7. Successful login redirects to form landing page
8. Password recovery using Supabase's built-in password reset flow

## Epic 2: Core Form Flow & Data Capture

**Goal:** Implement the complete 8-page travel request form with all required fields, conditional navigation logic based on user selections, and client-side state management using Zustand. This epic delivers the core business functionality allowing users to input and navigate through all travel request information.

### Story 2.1: Form Layout and Navigation Framework
As a user,  
I want to navigate through a multi-step form with clear progress indication,  
so that I understand where I am in the submission process.

**Acceptance Criteria:**
1. Form layout component with fixed background image applied to all pages
2. Progress indicator showing current page (1 of 8) with step names in Portuguese
3. Navigation buttons "Anterior" (Previous) and "Próximo" (Next) styled with shadcn/ui
4. Zustand store created with form state structure for all fields
5. Navigation logic preventing forward movement without required fields
6. Browser back/forward button support maintaining form state
7. Breadcrumb navigation allowing jump to previously completed pages

### Story 2.2: Passenger Data Page (Page 1)
As a user,  
I want to enter my personal and project information,  
so that my travel request is associated with correct passenger details.

**Acceptance Criteria:**
1. Form fields for: Projeto Vinculado (dropdown), Nome do Passageiro, E-mail do passageiro
2. Fields for: RG, Órgão Expedidor, CPF (with mask: 000.000.000-00)
3. Fields for: Data de Nascimento (date picker), Telefone (with mask)
4. Dados Bancários structured fields:
   - Bank selection dropdown (populated from bancos_brasileiros table with 190+ Brazilian banks)
   - Agência (branch) number input
   - Account number input
   - Legacy text area maintained for backwards compatibility
5. Tipo de Solicitação radio buttons (Passagens e Diárias, Apenas Passagens, Apenas Diárias)
6. All required fields marked with asterisk and validated
7. Form data persisted to Zustand store on navigation
8. Portuguese validation messages for invalid inputs

### Story 2.3: Travel Details and Basic Pages (Pages 2-4)
As a user,  
I want to specify my travel details and preferences,  
so that appropriate arrangements can be made.

**Acceptance Criteria:**
1. Page 2 - Origem/Destino fields with city autocomplete suggestions
2. Page 2 - Data ida/volta with date pickers preventing past dates
3. Page 2 - Tipo de Transporte radio options (Aéreo, Rodoviário, Ambos, Carro Próprio)
4. Page 3 - Tipo de Despesa checkboxes for expense categories
5. Page 4 - Preferências including baggage and transport allowance options
6. Page 4 - Estimated daily allowances number input
7. Conditional navigation logic based on selections
8. All form data synchronized with Zustand store

### Story 2.4: Conditional Pages Implementation (Pages 5-7)
As a user,  
I want to provide additional information when applicable,  
so that special requirements are captured.

**Acceptance Criteria:**
1. Page 5 (International) - Shows only if destination is international
2. Page 5 - Passport number and validity date fields
3. Page 5 - Passport image upload with preview (stores file reference)
4. Page 6 (Time Restriction) - Shows only if user indicates time constraints
5. Page 6 - Text area for describing flight time restrictions
6. Page 7 (Flight Preferences) - Shows only if user wants to suggest flights
7. Page 7 - File upload for flight suggestions document
8. Conditional logic correctly routes users based on their selections

### Story 2.5: Trip Objective and Review (Page 8)
As a user,  
I want to provide trip justification and review my information,  
so that I can ensure all details are correct before submission.

**Acceptance Criteria:**
1. Trip objective text area with minimum 50 character validation
2. Observations optional text area for additional notes
3. Urgent request justification field (required if marked urgent)
4. Summary section showing key form data from previous pages
5. Edit links allowing return to specific pages for corrections
6. All data retrieved from Zustand store for display
7. Visual indication of which fields are editable vs read-only
8. "Enviar Solicitação" (Submit Request) button prominently displayed

## Epic 3: File Handling & Form Submission

**Goal:** Implement file upload capabilities for passport images and flight documents, create the form submission pipeline to Supabase, and provide users with a confirmation experience. This epic completes the user journey from data entry to successful submission with proper validation and error handling.

### Story 3.1: File Upload Infrastructure
As a developer,  
I want to implement secure file upload handling,  
so that users can attach required documents to their requests.

**Acceptance Criteria:**
1. File upload API endpoint at /api/upload accepting multipart form data
2. File validation for type (images: jpg, png; documents: pdf, doc, docx)
3. File size validation (max 10MB per file)
4. Files stored in public/uploads/ with unique naming (timestamp + original name)
5. Supabase Storage bucket configured for file storage (alternative to local)
6. Upload progress indicator showing percentage complete
7. Error handling for failed uploads with Portuguese error messages
8. Cleanup mechanism for orphaned files (uploaded but not submitted)

### Story 3.2: File Upload UI Components
As a user,  
I want to upload passport images and flight suggestions easily,  
so that I can provide required documentation.

**Acceptance Criteria:**
1. Drag-and-drop file upload zone with visual feedback
2. Click to browse file selection alternative
3. File preview for images showing thumbnail
4. File name and size display for uploaded documents
5. Delete button to remove uploaded files before submission
6. Multiple file support for flight suggestions
7. Real-time validation feedback for invalid file types/sizes
8. Upload state persisted in Zustand store with file references

### Story 3.3: Form Validation and Submission
As a user,  
I want my form to be validated and submitted successfully,  
so that my travel request is processed.

**Acceptance Criteria:**
1. Comprehensive Zod schema validating all form fields
2. Pre-submission validation checking all required fields
3. API endpoint /api/submit-form receiving complete form data
4. Form data inserted into Supabase TravelRequest table
5. File references linked to travel request record
6. Unique request ID (CUID) generated and returned
7. Error handling for submission failures with retry option
8. Loading state during submission with spinner

### Story 3.4: Confirmation and Success Flow
As a user,  
I want to see confirmation that my request was submitted,  
so that I have a reference for tracking.

**Acceptance Criteria:**
1. Confirmation page displaying "Solicitação Enviada com Sucesso!"
2. Request reference number prominently displayed (e.g., REQ-2025-0001)
3. Summary of submitted information in read-only format
4. Timestamp of submission in Brazilian format
5. "Imprimir" (Print) button for generating PDF summary
6. "Nova Solicitação" button to start new request
7. Email confirmation sent to user (if email service configured)
8. Zustand store cleared after successful submission

### Story 3.5: Error Recovery and Edge Cases
As a developer,  
I want to handle submission errors gracefully,  
so that users don't lose their data.

**Acceptance Criteria:**
1. Network failure detection with offline message
2. Partial submission recovery using saved Zustand state
3. Duplicate submission prevention (idempotency check)
4. Session timeout handling with re-authentication flow
5. Server validation errors displayed with field-level messages
6. Automatic form data backup to localStorage every 30 seconds
7. "Recuperar Formulário" option if browser closed unexpectedly
8. Comprehensive error logging for debugging

## Epic 4: Administrative Dashboard

**Goal:** Create a comprehensive administrative interface allowing authorized users to view, search, filter, and manage all submitted travel requests with status tracking capabilities. This epic delivers business value by enabling oversight and management of the travel request workflow.

### Story 4.1: Admin Authentication and Authorization
As an administrator,  
I want secure access to the admin dashboard,  
so that only authorized personnel can view travel requests.

**Acceptance Criteria:**
1. Admin role defined in Supabase auth.users metadata
2. Protected route /admin requiring authenticated admin user
3. Role-based access control checking user.role === 'admin'
4. Unauthorized access redirects to login with error message
5. Admin user indicator in UI header when logged in as admin
6. Separate admin login URL (/admin/login) if desired
7. Session validation on each admin page load
8. Audit log entry for admin access (user, timestamp)

### Story 4.2: Request List Table View
As an administrator,  
I want to see all travel requests in a table format,  
so that I can quickly review submissions.

**Acceptance Criteria:**
1. Data table component using shadcn/ui Table
2. Columns: Request ID, Passenger Name, Destination, Departure Date, Status, Submitted Date
3. Pagination with 25 records per page and page navigation
4. Sort functionality on all columns (ascending/descending)
5. Row highlighting on hover for better readability
6. Status badges with colors (Submitted=blue, Under Review=yellow, Approved=green, Rejected=red)
7. Click on row to view detailed request information
8. Loading skeleton while fetching data from Supabase

### Story 4.3: Search and Filter Capabilities
As an administrator,  
I want to search and filter travel requests,  
so that I can find specific submissions quickly.

**Acceptance Criteria:**
1. Global search box searching across passenger name, destination, and request ID
2. Date range filter for departure dates
3. Date range filter for submission dates
4. Status filter with multi-select checkboxes
5. Project filter dropdown populated from unique projects
6. Request type filter (Passagens e Diárias, Apenas Passagens, Apenas Diárias)
7. Clear filters button to reset all filters
8. Filter state persisted in URL parameters for sharing

### Story 4.4: Request Detail View and Actions
As an administrator,  
I want to view complete request details and take actions,  
so that I can process travel requests effectively.

**Acceptance Criteria:**
1. Modal or side panel showing all form fields from submission
2. Formatted display of passenger information section
3. Travel details with clear date formatting
4. File attachments viewable/downloadable (passport, flight suggestions)
5. Status change dropdown (Submitted, Under Review, Approved, Rejected, Completed)
6. Comments text area for adding internal notes
7. "Save Changes" button updating Supabase record
8. Activity history showing status changes and comments with timestamps

### Story 4.5: Export and Reporting Features
As an administrator,  
I want to export travel request data,  
so that I can create reports and share with stakeholders.

**Acceptance Criteria:**
1. Export to CSV button downloading filtered results
2. Export includes all form fields in structured format
3. Portuguese column headers in exported file
4. Date formatting suitable for Excel (DD/MM/YYYY)
5. Summary statistics card showing total requests by status
6. Monthly request volume chart (using simple chart library)
7. Print view for individual request details
8. Batch export option for selected requests

## Checklist Results Report

_Checklist validation pending - will be executed after document review_

## Next Steps

### UX Expert Prompt
Review the Travel Request Form System PRD and create detailed wireframes and user flow diagrams for the 8-page form interface, ensuring consistency with the existing Microsoft Forms design while incorporating the login/authentication flow.

### Architect Prompt
Using this PRD, create a comprehensive technical architecture document for the Travel Request Form System, detailing the Next.js 15.3 application structure, Supabase integration patterns, component hierarchy, API design, and deployment configuration.

---

**Document Version:** 1.0  
**Created:** 2025-08-11  
**Author:** John (Product Manager)  
**Status:** READY FOR ARCHITECTURE PHASE