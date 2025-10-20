# Epic 5: Supabase Cloud Migration

**Goal:** Migrate the trip-form-app from local Docker Supabase instance to Supabase Cloud (South America region) to enable cloud-based development and eliminate local infrastructure dependencies while maintaining all existing functionality without code changes.

**Type:** Brownfield Infrastructure Enhancement

**Status:** Draft

**Priority:** High (blocks cloud development)

**Created:** October 19, 2025

**Author:** Winston (Architect)

## Existing System Context

**Current Functionality:**
- Trip-form-app running Next.js 15.5.4 with local Supabase Docker instance
- 8-page multi-step form with authentication, file uploads, and data persistence
- Database with travel_requests, profiles, projetos (53 CEIA projects), bancos_brasileiros (190+ banks)
- Email/password authentication with OAuth provider configuration
- File storage for passport images and flight suggestions

**Technology Stack:**
- Next.js 15.5.4 + React 19 + TypeScript
- Supabase (currently local Docker, migrating to Cloud)
- Zustand for state management + TanStack Query
- shadcn/ui components
- Zod validation

**Integration Points:**
- Database connection via NEXT_PUBLIC_SUPABASE_URL
- Auth via @supabase/auth-helpers-nextjs
- File storage via Supabase Storage SDK
- RLS policies for data isolation

## Enhancement Details

**What's Being Added/Changed:**
- Replace local Supabase Docker instance with Supabase Cloud project (sa-east-1 region)
- Apply all database migrations to cloud instance (8 total migrations)
- Configure cloud authentication providers (email, Google OAuth, Microsoft OAuth)
- Set up cloud storage buckets for file uploads
- Update environment configuration to point to cloud endpoints

**How It Integrates:**
- Zero code changes required - only infrastructure configuration
- Same database schema applied to cloud instance
- Same authentication flow with cloud providers
- Environment variables updated from local to cloud URLs
- Existing Next.js app connects to cloud Supabase seamlessly

**Success Criteria:**
- ✅ All database tables exist in cloud with correct schema
- ✅ RLS policies active and functional
- ✅ Reference data loaded (projects, banks)
- ✅ Authentication working (email + OAuth providers configured)
- ✅ Storage bucket operational with correct permissions
- ✅ Application connects successfully to cloud instance
- ✅ No functionality regression - all features work identically

## Compatibility Requirements

- ✅ **Existing APIs remain unchanged** - Zero code changes, only configuration
- ✅ **Database schema changes are backward compatible** - Same schema, different host
- ✅ **UI changes follow existing patterns** - No UI changes required
- ✅ **Performance impact is minimal** - Cloud typically faster than local Docker
- ✅ **Authentication flow unchanged** - Same Supabase Auth, different instance
- ✅ **File storage patterns unchanged** - Same Supabase Storage SDK

## Risk Mitigation

**Primary Risk:** Loss of local development capability if cloud setup fails or connectivity issues occur

**Mitigation:**
- Keep local Docker Supabase configuration files intact (commented, not deleted)
- Document rollback steps to re-enable local instance
- Test cloud connection thoroughly before removing local dependencies
- Maintain ability to switch between local/cloud via environment variables

**Rollback Plan:**
1. Restore original `.env.local` with local Supabase URLs
2. Uncomment docker-compose.yml Supabase service
3. Run `npm run supabase:start` to restart local instance
4. Verify application works with local instance
5. No data loss risk - cloud project remains intact

**Additional Risks:**
- **OAuth Provider Setup Complexity:** May require manual configuration in Google/Microsoft consoles
  - *Mitigation:* Provide detailed setup guides, OAuth can be configured incrementally
- **Environment Variable Mistakes:** Incorrect URLs could break application
  - *Mitigation:* Verify credentials before updating, test connection immediately after changes

## Stories

### Story 5.1: Cloud Database Schema Setup and Data Migration

**As a** developer,
**I want** to apply all database migrations to the Supabase Cloud project,
**So that** the cloud database matches the local schema with all reference data loaded.

**Acceptance Criteria:**
1. Identify existing Supabase cloud project (trip-form-app) in sa-east-1 region
2. Apply migrations in order:
   - `20250811_initial_schema.sql` (base tables + RLS)
   - `20250812_optimize_rls_policies.sql` (RLS optimization)
   - `20250813_final_rls_optimization.sql` (final RLS)
   - `20250115_create_projetos_table.sql` (projects table)
   - `populate_projetos.sql` (53 projects data)
   - `20251017111942_create_bancos_brasileiros_table.sql` (banks table)
   - `20251017_220000_add_structured_bank_fields.sql` (structured bank fields)
   - `add_missing_travel_request_columns.sql` (additional columns)
3. Verify all 8 expected tables exist: profiles, travel_requests, status_history, file_attachments, form_drafts, projetos, bancos_brasileiros
4. Confirm RLS policies are enabled on all relevant tables
5. Verify 53 projects and 190+ banks loaded correctly
6. Run security and performance advisors to check for issues

### Story 5.2: Authentication and Storage Configuration

**As a** developer,
**I want** to configure cloud authentication providers and storage buckets,
**So that** users can authenticate and upload files to the cloud instance.

**Acceptance Criteria:**
1. Verify email/password authentication is enabled in cloud project
2. Configure OAuth providers (note: requires external credentials):
   - Google OAuth (provide setup instructions if credentials not available)
   - Microsoft OAuth (provide setup instructions if credentials not available)
3. Create "travel-documents" storage bucket with settings:
   - Public: false (private)
   - File size limit: 10MB
   - Allowed MIME types: jpg, png, pdf, doc, docx
4. Configure storage RLS policies:
   - Users can upload/read their own files (user_id folder structure)
   - Admins can access all files
5. Test bucket creation and permission setup
6. Document OAuth setup steps for manual completion

### Story 5.3: Environment Configuration and Connection Verification

**As a** developer,
**I want** to update environment variables to point to the cloud instance,
**So that** the Next.js application connects to Supabase Cloud instead of local Docker.

**Acceptance Criteria:**
1. Retrieve cloud project credentials:
   - Project URL (get_project_url)
   - Anonymous API key (get_anon_key)
2. Update `apps/web/.env.local` with cloud credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<cloud-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<cloud-anon-key>
   ```
3. Remove/update local Supabase references:
   - Comment out docker-compose.yml Supabase service
   - Update README with cloud setup instructions
   - Remove local Supabase start commands from package.json
4. Test database connection with simple query
5. Verify auth flow works (create test user if possible)
6. Test file upload to cloud storage bucket
7. Confirm all existing application features work with cloud instance
8. Document cloud setup process for team members

## Definition of Done

- ✅ All 8 database tables created in cloud with correct schema
- ✅ 53 CEIA projects loaded in projetos table
- ✅ 190+ Brazilian banks loaded in bancos_brasileiros table
- ✅ RLS policies active on all relevant tables
- ✅ Storage bucket "travel-documents" configured with correct permissions
- ✅ Environment variables updated with cloud credentials
- ✅ Database connection test successful
- ✅ Authentication flow tested (at minimum email/password)
- ✅ File upload tested to cloud storage
- ✅ Security advisors show no critical issues
- ✅ Existing form submission flow works end-to-end
- ✅ Documentation updated with cloud setup instructions
- ✅ No regression in any existing features

## Tools & Resources

**Tools:**
- Supabase MCP Server - Primary tool for cloud operations

**Migration Files:**
- All located in `supabase/migrations/`

**Environment Files:**
- `apps/web/.env.local` (to be updated)

**Testing:**
- Manual testing of form flow after each story

## External Dependencies

- Google OAuth credentials (optional - can be configured later)
- Microsoft OAuth credentials (optional - can be configured later)

## Success Verification

Run the complete user journey:
1. Sign up with email
2. Fill out all 8 form pages
3. Upload passport image
4. Upload flight suggestion
5. Submit form
6. Verify data in cloud database
7. Check "My Requests" page shows submission
