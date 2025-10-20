# Epic 1: Foundation & Authentication Infrastructure

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
