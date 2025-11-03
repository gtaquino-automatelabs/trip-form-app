# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Trip Form App** is a travel request management system built for CEIA (Centro de Excelência em Inteligência Artificial). It's a fullstack Next.js 15 application with an 8-page multi-step form for managing travel requests, including passages and per diem allocations.

**Technology Stack:**
- Next.js 15.5.4 (App Router) + React 19 + TypeScript
- Supabase Cloud (PostgreSQL, Auth, Storage) - sa-east-1 region
- Zustand for state management
- shadcn/ui components + Tailwind CSS
- Zod validation
- Turborepo monorepo

## Development Commands

### Core Development
```bash
# Install dependencies
npm install

# Start development server (all apps)
npm run dev

# Start web app only
npm run dev:web

# Build for production
npm run build

# Type checking
npm run type-check
npm run check-types

# Linting
npm run lint
```

### Testing
```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Single test file
cd apps/web && npm run test -- src/path/to/test.test.ts
```

### Database (Supabase)
```bash
# Generate TypeScript types from database
npm run supabase:types

# Check Supabase status
npm run supabase:status

# Open Supabase Studio
npm run supabase:studio
```

**Important:** This project uses **Supabase Cloud** (not local Docker). Database URL and credentials are in `apps/web/.env.local`.

## Architecture

### Monorepo Structure
```
trip-form-app/
├── apps/
│   └── web/              # Next.js application
│       ├── src/
│       │   ├── app/      # Next.js App Router pages & API routes
│       │   ├── components/
│       │   │   ├── form/      # Multi-step form components
│       │   │   │   └── pages/ # 8 form pages (PassengerData, TravelDetails, etc)
│       │   │   ├── ui/        # shadcn/ui components
│       │   │   └── auth/      # Auth components
│       │   ├── contexts/      # React contexts (AuthContext)
│       │   ├── hooks/         # Custom hooks (useAutoSave, useFormNavigation, etc)
│       │   ├── stores/        # Zustand stores (form-store.ts)
│       │   ├── lib/           # Utilities and libraries
│       │   │   ├── supabase/  # Supabase client factories
│       │   │   ├── repositories/ # Data access layer
│       │   │   └── auth/      # Auth utilities
│       │   ├── schemas/       # Zod validation schemas
│       │   ├── services/      # Business logic services
│       │   └── types/         # TypeScript types
│       └── public/
│           └── uploads/       # Local file uploads (dev only)
├── supabase/
│   └── migrations/       # Database migration files
├── docs/                 # Architecture and PRD documentation
├── scripts/              # Utility scripts (migrations, data seeding)
└── claudedocs/           # Documentation for Claude Code
```

### Multi-Step Form Architecture

The form has **8 pages** with **conditional navigation**:
1. **Passenger Data** (sempre visível)
2. **Travel Details** (sempre visível)
3. **Expense Types** (sempre visível)
4. **Preferences** (sempre visível)
5. **International Travel** - Condicional: só aparece se `isInternational = true`
6. **Time Restrictions** - Condicional: só aparece se `hasTimeRestrictions = true` (marcado no Step 4)
7. **Flight Preferences** - Condicional: só aparece se `hasFlightPreferences = true` (marcado no Step 4)
8. **Trip Objective** (sempre visível)

**State Management:** Zustand store (`form-store.ts`) with:
- Form data persistence
- Auto-save every 30s to localStorage
- Auto-recovery on page load (silent, no popup)
- Page navigation state (`currentPage`, `visitedPages`)
- Conditional page logic (`shouldShowPage()`)

**Navigation Logic:**
- Forward navigation requires validation
- Backward navigation is always allowed
- Conditional pages are automatically skipped if criteria not met
- Logic in: `form-store.ts` (`getNextAvailablePage`, `getPreviousAvailablePage`, `canNavigateToPage`)

### API Routes (Next.js)

Located in `apps/web/src/app/api/`:

**Form & Requests:**
- `/api/form/submit` - Submit complete form (creates travel_request + file_attachments)
- `/api/trip-requests` - CRUD for travel requests
- `/api/requests/[id]` - Get request details

**File Uploads:**
- `/api/upload` - Upload files (uses Supabase Storage if `USE_SUPABASE_STORAGE=true`)
  - Strategy: Check `process.env.USE_SUPABASE_STORAGE`
  - Supabase: Uploads to bucket `travel-documents`
  - Local: Saves to `public/uploads/` (development fallback)

**Data:**
- `/api/banks` - Brazilian banks (from `bancos_brasileiros` table)
- `/api/projetos` - CEIA projects (from `projetos` table)
- `/api/user` - User profile data

**Auth:**
- `/api/auth/*` - Authentication endpoints (delegates to Supabase Auth)

### Database Schema (Supabase PostgreSQL)

**Core Tables:**
- `profiles` - User profiles (extends auth.users)
- `travel_requests` - Travel request submissions
- `file_attachments` - File metadata linked to requests
- `form_drafts` - Auto-saved form progress
- `status_history` - Request status audit trail
- `projetos` - 53 CEIA projects
- `bancos_brasileiros` - 357 Brazilian banks

**Key Columns in `bancos_brasileiros`:**
- `ispb` (PK) - Bank identifier
- `name` - Short name (e.g., "BCO DO BRASIL S.A.")
- `full_name` - Full official name (e.g., "Banco do Brasil S.A.") - **Use this for display**
- `code` - Compensation code (can be NULL)

**RLS Policies:**
- Users can only see/edit their own data (`user_id = auth.uid()`)
- Admins (role='admin' in profiles) can see all data

**Storage Bucket:**
- `travel-documents` - Private bucket for passport images and flight suggestions
  - Structure: `{user_id}/{category}/{filename}`
  - Categories: `passport`, `flights`
  - Max size: 10MB
  - RLS: Users access own files, admins access all

### Authentication Flow

1. **Email/Password**: Supabase Auth with email confirmation
2. **OAuth Providers**: Google and Microsoft (configured in Supabase dashboard)
3. **Session Management**: Server-side with cookies via `@supabase/auth-helpers-nextjs`
4. **Protected Routes**: Middleware checks `auth.uid()`, redirects to `/login` if not authenticated

**AuthContext:** (`src/contexts/auth-context.tsx`) provides:
- `user` - Current user
- `loading` - Auth loading state
- `signOut()` - Logout function

### Key Hooks

**Form Management:**
- `useFormNavigation()` - Page navigation with validation
- `useFormValidation()` - Zod schema validation per page
- `useAutoSave()` - Auto-save form data every 30s

**Data Fetching:**
- `useBankAutocomplete()` - Search Brazilian banks
- `useProjects()` - Load CEIA projects
- Custom hooks use fetch API (not React Query for forms)

**Other:**
- `useNetworkStatus()` - Online/offline detection
- `useDebounce()` - Debounced search input

## Important Patterns

### Conditional Steps Logic
```typescript
// form-store.ts
getNextAvailablePage() {
  let nextPage = currentPage + 1;

  // Skip page 5 if not international
  if (nextPage === 5 && !formData.isInternational) nextPage++;

  // Skip page 6 if no time restrictions
  if (nextPage === 6 && !formData.hasTimeRestrictions) nextPage++;

  // Skip page 7 if no flight preferences
  if (nextPage === 7 && !formData.hasFlightPreferences) nextPage++;

  return Math.min(nextPage, 8);
}
```

### File Upload Strategy
```typescript
// /api/upload/route.ts
const useSupabaseStorage = process.env.USE_SUPABASE_STORAGE === 'true';

if (useSupabaseStorage) {
  // Upload to Supabase Storage bucket 'travel-documents'
  const filePath = `${user.id}/${folder}/${uniqueFileName}`;
  await supabase.storage.from('travel-documents').upload(filePath, fileBuffer);
  fileUrl = supabase.storage.from('travel-documents').getPublicUrl(filePath);
} else {
  // Fallback: Save to public/uploads/ (local development)
  await writeFile(path.join(process.cwd(), 'public', 'uploads', uniqueFileName), buffer);
  fileUrl = `/uploads/${uniqueFileName}`;
}
```

### Auto-Save & Recovery
```typescript
// Auto-save runs every 30s (useAutoSave hook)
// Recovery is SILENT on page load (no popup)
useEffect(() => {
  if (hasRecoverableData) {
    recoverFormData(); // Loads silently
    logUserAction('form_data_auto_recovered');
  }
}, []);
```

### Bank Dropdown
```typescript
// API returns banks with full_name (not name)
// /api/banks/route.ts
const formattedBanks = banks?.map(bank => ({
  value: bank.full_name,  // Use full_name for value
  label: bank.code ? `${bank.full_name} (${bank.code})` : bank.full_name,
  code: bank.code || ''
}));
```

## Environment Variables

Required in `apps/web/.env.local`:

```bash
# Supabase Cloud (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://swsncutfzczgubdzjcpk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_KEY=<service-role-key>

# Server
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Storage Strategy (REQUIRED for file uploads)
USE_SUPABASE_STORAGE=true  # true = Supabase bucket, false = local public/uploads

# OAuth (Optional)
GOOGLE_CLIENT_ID=<client-id>
GOOGLE_CLIENT_SECRET=<client-secret>
AZURE_CLIENT_ID=<client-id>
AZURE_CLIENT_SECRET=<client-secret>
```

## Git Workflow

**Branches:**
- `main` - Production (do not push directly)
- `develop` - Active development branch (use this)
- `feature/*` - Feature branches

**Commit Convention:**
```bash
git add -A
git commit -m "feat: description

Detailed explanation if needed

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin develop
```

## Common Issues & Solutions

### Form Not Loading Saved Data
- Check if `hasRecoverableData` is true in form-store
- Check localStorage for `travelForm_autoSave` key
- Auto-recovery runs silently on mount (no popup)

### Steps 6 or 7 Not Appearing
- Verify checkboxes in Step 4 are setting `hasTimeRestrictions` and `hasFlightPreferences`
- Check `getNextAvailablePage()` logic in form-store.ts
- Conditional logic in: `form-store.ts` lines 373-397

### File Upload Returns 404
- If using Supabase Storage: Check `USE_SUPABASE_STORAGE=true` in .env.local
- If using local: Check files in `apps/web/public/uploads/`
- Verify Supabase bucket `travel-documents` exists and has RLS policies

### Bank Dropdown Shows Abbreviated Names
- API should use `full_name` column (not `name`)
- Check `/api/banks/route.ts` - should select and order by `full_name`
- Database has both: `name` (short) and `full_name` (complete)

### React Duplicate Key Warning
- Often in lists - ensure unique keys
- Bank dropdown: Use `${bank.value}-${bank.code || index}` as key

## Documentation

**Key Docs (in `/docs`):**
- `architecture.md` - Complete system architecture
- `prd.md` - Product requirements
- `stories/*.story.md` - User stories with acceptance criteria
- `supabase-oauth-setup.md` - OAuth provider setup

**Claude Docs (in `/claudedocs`):**
- `supabase-storage-activation.md` - Storage setup and troubleshooting

## Testing

Tests use Vitest + React Testing Library:
- Unit tests: `*.test.ts`, `*.test.tsx`
- Integration tests: `tests/integration/`
- No E2E tests yet (Playwright installed but not configured)

Run tests from `apps/web/`:
```bash
npm run test              # All tests
npm run test:ui           # With UI
npm run test:coverage     # With coverage report
```

## Deployment

**Development:** Localhost with Supabase Cloud
**Production:** Vercel (not yet configured)

Database is always Supabase Cloud (sa-east-1 region).

---

## Quick Reference

**Start Development:**
```bash
npm install
npm run dev  # Opens http://localhost:3000
```

**Test Form Flow:**
1. Login or signup at `/login`
2. Click "Nova Solicitação" → Choose "Eu mesmo" or "Outra pessoa"
3. Fill 8-page form (pages 5, 6, 7 are conditional)
4. Form auto-saves every 30s
5. Submit on page 8

**Check Database:**
- Dashboard: https://supabase.com/dashboard/project/swsncutfzczgubdzjcpk
- Tables: travel_requests, file_attachments, bancos_brasileiros, projetos
- Storage: travel-documents bucket

**Common Files to Edit:**
- Form pages: `apps/web/src/components/form/pages/`
- Form state: `apps/web/src/stores/form-store.ts`
- API routes: `apps/web/src/app/api/`
- Validation: `apps/web/src/schemas/`
