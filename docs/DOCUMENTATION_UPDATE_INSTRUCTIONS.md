# Documentation Update Instructions for AI Agent

## Purpose
Update trip-form-app PRD and Architecture documentation to reflect current system state as of October 19, 2025, incorporating changes made since original documentation (August 11, 2025).

## Context
The project has evolved significantly since initial documentation:
- **Database enhancements:** Structured bank fields, Brazilian banks reference table, projects table
- **Infrastructure change:** Migration from local Docker Supabase to Supabase Cloud
- **Tech stack additions:** TanStack Query, TanStack Form
- **Missing Epic 5:** Supabase Cloud Migration epic created but not in main PRD

## Documents Requiring Updates

### Primary Documents
1. `docs/prd.md` - Product Requirements Document
2. `docs/architecture.md` - Architecture Document

### Sharded Documents (Update After Primary)
3. `docs/prd/*.md` - Sharded PRD sections
4. `docs/architecture/*.md` - Sharded architecture sections

---

## Part 1: PRD Updates (`docs/prd.md`)

### Section: Change Log
**Action:** Add new entry
```markdown
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-08-11 | 1.0 | Initial PRD creation from Project Brief | John (PM) |
| 2025-10-19 | 1.1 | Updated with database enhancements and Epic 5 | Winston (Architect) |
```

### Section: Technical Assumptions
**Location:** After "Additional Technical Assumptions and Requests"

**Action:** Update the following items:

**BEFORE:**
```markdown
- **Database**: Local Supabase instance (PostgreSQL) running in Docker Desktop
```

**AFTER:**
```markdown
- **Database**: Supabase Cloud (PostgreSQL) in South America region (sa-east-1)
  - Previously: Local Docker instance (migrated October 2025)
```

**ADD NEW ITEMS:**
```markdown
- **State Management Enhancement**: Zustand + TanStack Query for server state
- **Form Management**: TanStack Form alongside Zustand for complex form state
- **Reference Data Tables**:
  - `projetos` table with 53 pre-populated CEIA projects
  - `bancos_brasileiros` table with 190+ Brazilian banking institutions
- **Structured Bank Data**: Separate fields for bank name, branch (agência), and account number
```

### Section: Epic List
**Location:** After Epic 4

**Action:** Add Epic 5

```markdown
### Epic 5: Supabase Cloud Migration
Migrate the application from local Docker Supabase to Supabase Cloud (South America region) to enable cloud-based development and eliminate local infrastructure dependencies.
```

**Action:** Add link to epic details
```markdown
See `docs/prd/epic-5-supabase-cloud-migration.md` for complete epic details and stories.
```

### Section: Epic 1 - Story 1.2
**Location:** Story 1.2: Supabase Connection and Schema

**Action:** Add note about cloud migration

**ADD AFTER ACCEPTANCE CRITERIA:**
```markdown
**Note (October 2025):** This story was initially implemented with local Docker Supabase. The system was later migrated to Supabase Cloud in Epic 5. Current implementation uses cloud instance in sa-east-1 region.
```

### Section: Epic 2 - Story 2.2
**Location:** Story 2.2: Passenger Data Page (Page 1)

**Action:** Update bank details field description

**BEFORE:**
```markdown
4. Dados Bancários text area for bank account information
```

**AFTER:**
```markdown
4. Dados Bancários structured fields:
   - Bank selection dropdown (populated from bancos_brasileiros table with 190+ Brazilian banks)
   - Agência (branch) number input
   - Account number input
   - Legacy text area maintained for backwards compatibility
```

---

## Part 2: Architecture Updates (`docs/architecture.md`)

### Section: Change Log
**Action:** Add new entry
```markdown
| Date | Version | Description | Author |
|------|---------|-------------|-----------|
| 2025-08-11 | 1.0 | Initial architecture document created from PRD | Winston (Architect) |
| 2025-10-19 | 1.1 | Updated with database enhancements and cloud migration | Winston (Architect) |
```

### Section: High Level Architecture → Platform and Infrastructure Choice
**Action:** Update deployment information

**BEFORE:**
```markdown
**Platform:** Local Development with Supabase + Production on Vercel
**Key Services:**
- Supabase (PostgreSQL, Auth, Storage)
```

**AFTER:**
```markdown
**Platform:** Cloud Development with Supabase Cloud + Production on Vercel
**Key Services:**
- Supabase Cloud (PostgreSQL, Auth, Storage) - sa-east-1 region
```

**UPDATE:**
```markdown
**Deployment Host and Regions:**
- Development: Supabase Cloud (South America - sa-east-1)
- Production: Vercel (Global Edge Network)
- Database: Supabase Cloud (South America region for CEIA)
```

**ADD NOTE:**
```markdown
**Migration Note (October 2025):** System migrated from local Docker Supabase to Supabase Cloud. See Epic 5 documentation for migration details.
```

### Section: Tech Stack → Technology Stack Table
**Action:** Add TanStack libraries

**ADD ROWS:**
```markdown
| State Management | TanStack Query | 5.80+ | Server state management | Efficient data fetching and caching for API calls |
| Form Management | TanStack Form | 1.12+ | Advanced form state | Complex form validation and state handling |
```

### Section: Data Models → TravelRequest
**Action:** Update TypeScript interface with structured bank fields

**LOCATE:**
```typescript
interface TravelRequest {
  // ... existing fields ...

  // Passenger Data (Page 1)
  bankDetails: string;
```

**ADD AFTER bankDetails:**
```typescript
  // Structured Bank Data (Added October 2025)
  bankName?: string;          // Bank institution name (from bancos_brasileiros)
  bankBranch?: string;        // Agência number
  bankAccount?: string;       // Account number
```

**ADD COMMENT:**
```typescript
  bankDetails: string;  // Legacy field - maintained for backwards compatibility
```

### Section: Data Models
**Action:** Add two new data models after FileAttachment

**ADD:**
```markdown
### Projeto (Project Reference)
**Purpose:** Reference table for CEIA projects used in travel request form dropdown

**Key Attributes:**
- id: integer (auto-increment) - Primary key
- nome: string - Project name
- codigo: string - Project code/identifier
- ativo: boolean - Whether project is active
- created_at: timestamp - Record creation

#### TypeScript Interface
```typescript
interface Projeto {
  id: number;
  nome: string;
  codigo?: string;
  ativo: boolean;
  created_at: Date;
}
```

#### Relationships
- Referenced by TravelRequest (via projectName field - not foreign key, text match)

---

### BancoBrasileiro (Brazilian Bank Reference)
**Purpose:** Reference table for Brazilian banking institutions used in structured bank data selection

**Key Attributes:**
- id: integer (auto-increment) - Primary key
- codigo: string - Bank code (COMPE code)
- nome_banco: string - Full bank name
- ispb: string - ISPB identifier (Brazilian banking system)

#### TypeScript Interface
```typescript
interface BancoBrasileiro {
  id: number;
  codigo: string;
  nome_banco: string;
  ispb: string;
}
```

#### Relationships
- Referenced by TravelRequest (via bankName field - not foreign key, text match)
- Contains 190+ Brazilian banking institutions
```

### Section: Database Schema
**Action:** Add migrations executed and update schema

**AFTER THE MAIN SCHEMA SQL, ADD:**
```markdown
### Schema Enhancements (October 2025)

#### Projects Reference Table
```sql
-- Migration: 20250115_create_projetos_table.sql
CREATE TABLE IF NOT EXISTS projetos (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    codigo TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Populated with 53 CEIA projects via populate_projetos.sql
```

#### Brazilian Banks Reference Table
```sql
-- Migration: 20251017111942_create_bancos_brasileiros_table.sql
CREATE TABLE IF NOT EXISTS bancos_brasileiros (
    id SERIAL PRIMARY KEY,
    codigo TEXT NOT NULL UNIQUE,
    nome_banco TEXT NOT NULL,
    ispb TEXT
);

-- Contains 190+ Brazilian banking institutions
CREATE INDEX idx_bancos_codigo ON bancos_brasileiros(codigo);
```

#### Structured Bank Fields Enhancement
```sql
-- Migration: 20251017_220000_add_structured_bank_fields.sql
ALTER TABLE public.travel_requests
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_branch TEXT,
ADD COLUMN IF NOT EXISTS bank_account TEXT;

-- Comments and index
COMMENT ON COLUMN public.travel_requests.bank_name IS 'Name of the banking institution';
COMMENT ON COLUMN public.travel_requests.bank_branch IS 'Bank branch number (agência)';
COMMENT ON COLUMN public.travel_requests.bank_account IS 'Bank account number';
CREATE INDEX IF NOT EXISTS idx_travel_requests_bank_name ON public.travel_requests(bank_name);

-- Note: bank_details column maintained for backwards compatibility
```
```

### Section: Development Workflow → Environment Configuration
**Action:** Update environment variables section

**BEFORE:**
```markdown
#### Required Environment Variables
```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**AFTER:**
```markdown
#### Required Environment Variables (Cloud Configuration)
```bash
# Frontend (.env.local)
# Cloud Supabase Configuration (October 2025)
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<cloud-anon-key>

# Legacy Local Configuration (for reference/rollback)
# NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key>
```

**ADD NOTE:**
```markdown
**Migration Note:** As of October 2025, the application uses Supabase Cloud. For rollback instructions to local development, see `docs/cloud-migration-rollback.md` (created in Epic 5).
```

### Section: Deployment Architecture → Environments
**Action:** Update table with cloud database

**UPDATE TABLE:**
```markdown
| Environment | Frontend URL | Backend URL | Database | Purpose |
|-------------|-------------|-------------|----------|---------|
| Development | http://localhost:3000 | http://localhost:3000/api | Supabase Cloud (sa-east-1) | Local development |
| Staging | https://trip-form-staging.vercel.app | https://trip-form-staging.vercel.app/api | Supabase Cloud (sa-east-1) | Pre-production testing |
| Production | https://trip-form.vercel.app | https://trip-form.vercel.app/api | Supabase Cloud (sa-east-1) | Live environment |
```

---

## Part 3: Sharded Documentation Updates

### After updating main documents:

1. **Re-shard PRD** (if using sharding)
   ```
   Use shard-doc task on docs/prd.md
   Output to docs/prd/ directory
   ```

2. **Re-shard Architecture** (if using sharding)
   ```
   Use shard-doc task on docs/architecture.md
   Output to docs/architecture/ directory
   ```

---

## Part 4: Verification Checklist

After completing updates, verify:

### PRD Verification
- [ ] Change log updated with version 1.1
- [ ] Epic 5 added to Epic List
- [ ] Technical Assumptions reflect Supabase Cloud
- [ ] Structured bank fields mentioned
- [ ] Reference tables (projetos, bancos_brasileiros) documented
- [ ] TanStack libraries mentioned

### Architecture Verification
- [ ] Change log updated with version 1.1
- [ ] Platform section reflects Supabase Cloud migration
- [ ] Tech stack table includes TanStack Query and Form
- [ ] Data models include Projeto and BancoBrasileiro
- [ ] TravelRequest interface shows structured bank fields
- [ ] Database schema includes October 2025 migrations
- [ ] Environment variables show cloud configuration
- [ ] Deployment environments table updated

### Cross-References
- [ ] All references to "local Supabase" updated or noted as legacy
- [ ] Migration notes added where infrastructure changed
- [ ] Links to Epic 5 documentation included
- [ ] Backwards compatibility notes added for breaking changes

---

## Part 5: Additional Documentation to Create

### Optional: Create Migration Summary Document

**File:** `docs/MIGRATION_HISTORY.md`

**Content:**
```markdown
# Migration History - trip-form-app

## Infrastructure Migrations

### October 2025: Local Docker → Supabase Cloud
- **Date:** October 19, 2025
- **Type:** Infrastructure Migration
- **Epic:** Epic 5 - Supabase Cloud Migration
- **Impact:** Zero code changes, environment configuration only
- **Reason:** Enable cloud development, eliminate local dependencies

**Details:**
- Migrated from local Docker Supabase to Supabase Cloud (sa-east-1)
- All database schema, RLS policies, and data preserved
- See `docs/prd/epic-5-supabase-cloud-migration.md` for complete details

## Database Schema Enhancements

### October 2025: Structured Bank Data
- **Migration:** 20251017_220000_add_structured_bank_fields.sql
- **Changes:** Added bank_name, bank_branch, bank_account columns to travel_requests
- **Impact:** Enhanced data structure for Brazilian banking system
- **Compatibility:** Legacy bank_details field maintained

### October 2025: Brazilian Banks Reference Table
- **Migration:** 20251017111942_create_bancos_brasileiros_table.sql
- **Changes:** Created bancos_brasileiros table with 190+ banks
- **Impact:** Enables bank selection dropdown in UI
- **Data:** Populated with Brazilian banking institutions

### August 2025: Projects Reference Table
- **Migration:** 20250115_create_projetos_table.sql
- **Changes:** Created projetos table
- **Data:** Populated with 53 CEIA projects via populate_projetos.sql
- **Impact:** Centralized project management

### August 2025: Initial Schema
- **Migration:** 20250811_initial_schema.sql
- **Changes:** Base tables (profiles, travel_requests, status_history, file_attachments, form_drafts)
- **Impact:** Complete database foundation
```

---

## Execution Instructions for AI Agent

### Step-by-Step Process

1. **Read Current Documents**
   - Read `docs/prd.md` in full
   - Read `docs/architecture.md` in full
   - Note current version numbers and change logs

2. **Apply PRD Updates**
   - Follow Part 1 instructions sequentially
   - Use Edit tool for each change
   - Verify each edit before proceeding

3. **Apply Architecture Updates**
   - Follow Part 2 instructions sequentially
   - Use Edit tool for each change
   - Pay special attention to code block formatting

4. **Verify Updates**
   - Read updated documents in full
   - Check all cross-references
   - Ensure formatting is correct

5. **Update Sharded Docs** (if applicable)
   - Use shard-doc task if project uses sharded documentation
   - Verify sharded files match updated main documents

6. **Create Optional Documentation**
   - Consider creating MIGRATION_HISTORY.md as reference

7. **Report Completion**
   - Summarize changes made
   - List all files modified
   - Note any discrepancies requiring human review

---

## Important Notes

### Preservation Guidelines
- **DO NOT** remove historical information
- **DO** add "Migration Note" or "Updated October 2025" annotations
- **DO** maintain backwards compatibility notes
- **DO** preserve original field names with legacy notes

### Formatting Guidelines
- Maintain existing markdown formatting style
- Preserve table structures
- Keep code block syntax highlighting (```sql, ```typescript, etc.)
- Maintain heading hierarchy

### Accuracy Requirements
- Cross-reference with actual migration files in `supabase/migrations/`
- Verify table/column names match actual database schema
- Confirm project and bank counts (53 projects, 190+ banks)
- Validate technology versions against package.json

---

## Success Criteria

Documentation update is successful when:

1. ✅ All October 2025 enhancements documented
2. ✅ Supabase Cloud migration reflected throughout
3. ✅ New data models (Projeto, BancoBrasileiro) documented
4. ✅ Structured bank fields documented in schema
5. ✅ TanStack libraries added to tech stack
6. ✅ Version numbers incremented (1.0 → 1.1)
7. ✅ Change logs updated with October 2025 entry
8. ✅ No broken cross-references
9. ✅ Formatting consistency maintained
10. ✅ All migration notes added appropriately

---

**Created:** October 19, 2025
**Author:** Winston (Architect)
**Purpose:** Guide AI agent in updating documentation to reflect current system state
