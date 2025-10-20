# Epic 6: Form Draft Management & Auto-Save

**Goal:** Implement intelligent form draft management with multi-layer auto-save, recovery mechanisms, and TTL-based lifecycle management to prevent data loss and improve user experience when filling out travel request forms.

**Type:** Feature Enhancement (UX/Data Persistence)

**Status:** Draft

**Priority:** High (improves user experience and prevents data loss)

**Created:** October 19, 2025

**Author:** Product Team

## Business Context

**Problem:**
Users currently see an "Encontramos um erro inesperado. Nossos dados foram salvos automaticamente" pop-up every time they start a new request, indicating data recovery issues. Users lose work if they close the browser or navigate away before completing the 8-page form. No way to save partial progress and continue later.

**Solution:**
Implement a robust form draft system with:
- Multi-layer auto-save (localStorage + Supabase)
- Multiple concurrent drafts for different trips
- Smart TTL management (7-day warning, 15-day auto-delete)
- Recovery dialog on form initialization
- Draft cards in "My Requests" with clear status

**Impact:**
- Eliminates data loss frustration
- Enables users to work on multiple trip requests simultaneously
- Provides cross-device continuity (drafts saved in cloud)
- Clear draft lifecycle with automatic cleanup

## Existing System Context

**Current Functionality:**
- 8-page multi-step form with Zustand state management
- localStorage persistence (basic, not cloud-synced)
- No draft management UI
- No TTL or cleanup mechanism
- Single session-based state only

**Technology Stack:**
- Next.js 15.5.4 + React 19 + TypeScript
- Zustand for state management + localStorage persistence
- Supabase for database and auth
- shadcn/ui components

**Integration Points:**
- Zustand form store (`/stores/form-store.ts`)
- Form pages (`/components/form/pages/*`)
- My Requests page (`/app/my-requests/page.tsx`)
- Supabase `form_drafts` table (exists but basic)

## Enhancement Details

**What's Being Added/Changed:**

1. **Enhanced form_drafts Table:**
   - Add draft identification fields (destination, dates, title)
   - Add completion tracking (current_step, completion_percentage)
   - Add TTL fields (expires_at, notified_at)
   - Modify existing basic table to full-featured draft storage

2. **Multi-Layer Auto-Save:**
   - **Layer 1 (Local):** Immediate localStorage save on field change (existing Zustand)
   - **Layer 2 (Cloud):** Periodic Supabase save (every step completion + 60s debounce)
   - **Layer 3 (Confirmation):** beforeunload dialog when leaving with unsaved changes

3. **Draft Management UI:**
   - Draft cards in "My Requests" with visual distinction
   - Progress indicators (50% complete - Step 4 of 8)
   - Expiration warnings (⚠️ Expira em 3 dias)
   - Continue/Delete actions per draft

4. **Recovery Flow:**
   - On form initialization, check for existing drafts
   - Dialog: "Você tem rascunhos salvos. Continuar de onde parou?"
   - Load selected draft and navigate to saved step

5. **TTL Management:**
   - Day 0: Draft created, expires_at = created_at + 15 days
   - Day 7: System notifies user (toast + badge), notified_at set
   - Day 15: Auto-delete via cron job or edge function
   - On edit: Reset expires_at = now() + 15 days (keep active drafts alive)

**How It Integrates:**
- Extends existing Zustand store with draft sync methods
- Adds new API routes for draft CRUD operations
- Integrates with existing form navigation flow
- Reuses existing authentication and RLS policies
- Minimal changes to form page components

**Success Criteria:**
- ✅ Users can maintain multiple concurrent drafts
- ✅ Auto-save happens transparently (no user action needed)
- ✅ Drafts survive browser close/refresh
- ✅ Cross-device access (cloud-synced drafts)
- ✅ Clear expiration warnings (7 days) and auto-cleanup (15 days)
- ✅ Recovery dialog only shows when drafts exist
- ✅ No data loss during normal form filling workflow
- ✅ Performance impact < 100ms for auto-save operations

## Compatibility Requirements

- ✅ **Backward compatible with existing forms** - Form pages unchanged, only enhanced
- ✅ **Zustand store extended, not replaced** - Existing state management preserved
- ✅ **localStorage remains as Layer 1** - Immediate recovery still works
- ✅ **No breaking changes to form submission** - Draft system is parallel to submission
- ✅ **RLS policies follow existing patterns** - User can only see own drafts

## Risk Mitigation

**Primary Risk:** Auto-save latency impacting form UX

**Mitigation:**
- Layer 1 (localStorage) provides immediate save
- Layer 2 (Supabase) is debounced and async
- Visual indicator shows save status ("Salvo às 18:30")
- Never block user interaction for saves

**Rollback Plan:**
1. Disable auto-save feature flag
2. Keep localStorage persistence (Layer 1)
3. Users continue with existing workflow
4. Draft table remains but unused

**Additional Risks:**
- **Multiple Device Conflicts:** User edits same draft on 2 devices
  - *Mitigation:* Use `last_saved_at` timestamp, always load most recent version
- **Storage Quota Issues:** Too many drafts or large form_data
  - *Mitigation:* TTL cleanup, limit to reasonable number of active drafts per user
- **Edge Cases in TTL:** Timezone issues or cron job failures
  - *Mitigation:* Use UTC timestamps, add manual cleanup option for users

## Stories

### Story 6.1: Form Draft Auto-Save & Recovery System

**As a** user filling out a travel request form,
**I want** my progress to be automatically saved to the cloud with multiple concurrent drafts,
**So that** I can safely close my browser, continue later, or work on multiple trips simultaneously without losing data.

**Acceptance Criteria:**

1. **Enhanced form_drafts Table:**
   - Modify existing `form_drafts` table with new columns:
     - `draft_title` (auto-generated from destination)
     - `trip_destination`, `trip_start_date`, `trip_end_date` (quick identification)
     - `completion_percentage` (0-100)
     - `expires_at` (created_at + 15 days)
     - `notified_at` (when 7-day warning sent)
   - Keep existing: `id`, `user_id`, `form_data` (JSONB), `current_page`, `created_at`, `updated_at`
   - Rename `updated_at` to `last_saved_at` for clarity
   - Add indexes on `user_id`, `expires_at`
   - Update RLS policies for user-only access

2. **Auto-Save Implementation:**
   - Create API endpoint: `POST /api/form-drafts` (create/update draft)
   - Create API endpoint: `GET /api/form-drafts` (list user's drafts)
   - Create API endpoint: `GET /api/form-drafts/[id]` (get specific draft)
   - Create API endpoint: `DELETE /api/form-drafts/[id]` (delete draft)
   - Create hook: `useFormDraft()` with methods:
     - `saveDraft()` - Manual and auto-triggered save
     - `loadDraft(id)` - Load specific draft
     - `deleteDraft(id)` - Remove draft
   - Integrate auto-save triggers:
     - On step completion (after validation passes)
     - Every 60 seconds of inactivity (debounced)
     - Manual "Salvar Rascunho" button on all pages

3. **Draft Management UI:**
   - Create component: `<FormDraftCard />` with:
     - Draft title (e.g., "Viagem para São Paulo")
     - Destination and dates preview
     - Progress bar and percentage (e.g., "75% - Step 6 of 8")
     - Last edited timestamp (e.g., "Editado há 2 horas")
     - Expiration warning if < 7 days (⚠️ badge)
     - Actions: [Continuar] [Excluir]
   - Modify `/app/my-requests/page.tsx`:
     - Add "RASCUNHOS" section above "SOLICITAÇÕES ENVIADAS"
     - Fetch and display user's drafts
     - Handle click → navigate to `/form?draftId={id}`
   - Add visual indicator in form header:
     - "✓ Salvo automaticamente às 18:30" (when saved)
     - "Salvando..." (during save operation)

4. **Recovery Dialog:**
   - Create component: `<DraftRecoveryDialog />`
   - On form mount, check for existing drafts
   - If drafts exist and no `draftId` in URL:
     - Show dialog: "Você tem rascunhos salvos. Continuar de onde parou?"
     - List up to 3 most recent drafts with preview
     - Options: "Continuar Rascunho" | "Começar do Zero"
   - If `draftId` in URL:
     - Load specified draft automatically
     - Navigate to `current_page`
     - Populate Zustand store with `form_data`

5. **TTL and Cleanup:**
   - Add server-side function: `notifyExpiringDrafts()`
     - Runs daily (cron or edge function)
     - Find drafts where `expires_at - 7 days < now` AND `notified_at IS NULL`
     - Set `notified_at = now()`
   - Add server-side function: `cleanupExpiredDrafts()`
     - Runs daily
     - Delete drafts where `expires_at < now()`
   - On draft edit/save:
     - Reset `expires_at = now() + 15 days`
     - Keep active drafts alive
   - Display warning in draft card if expiring soon

6. **Exit Confirmation:**
   - Add `beforeunload` handler in form pages
   - Check if Zustand state !== last saved cloud state
   - If unsaved changes, show browser confirmation:
     - "Você tem alterações não salvas. Deseja salvar antes de sair?"
   - Optional: Custom modal with "Salvar e Sair" | "Sair sem Salvar" | "Cancelar"

7. **Testing and Validation:**
   - Verify multiple drafts can exist per user
   - Verify drafts sync across devices (save on desktop, load on mobile)
   - Verify TTL notifications work (7-day warning)
   - Verify auto-delete works (15-day cleanup)
   - Verify "Salvo automaticamente" indicator updates correctly
   - Test recovery dialog only shows when drafts exist
   - Test draft deletion removes from DB and UI

## Definition of Done

- ✅ `form_drafts` table modified with all new columns
- ✅ RLS policies active on `form_drafts` table
- ✅ All 4 API endpoints functional and tested
- ✅ `useFormDraft()` hook working with auto-save triggers
- ✅ Draft cards display correctly in "My Requests"
- ✅ Recovery dialog shows on form initialization when drafts exist
- ✅ Auto-save happens on step completion + 60s debounce
- ✅ Visual indicator shows save status
- ✅ TTL notifications work (7-day warning)
- ✅ Auto-cleanup works (15-day deletion)
- ✅ Exit confirmation prevents accidental data loss
- ✅ Multiple concurrent drafts work correctly
- ✅ Cross-device draft access verified
- ✅ No performance regression in form navigation
- ✅ No console errors during auto-save operations

## Tools & Resources

**MCP Tools:**
- Supabase MCP: Table modification, SQL execution, RLS policy management

**Key Files to Modify:**
- `/supabase/migrations/` - New migration for table changes
- `/app/api/form-drafts/*.ts` - New API endpoints
- `/hooks/useFormDraft.ts` - New hook (create)
- `/stores/form-store.ts` - Extend with draft sync methods
- `/components/form-draft-card.tsx` - New component (create)
- `/components/form-draft-recovery.tsx` - New component (create)
- `/app/my-requests/page.tsx` - Add drafts section
- `/components/form/pages/*.tsx` - Add auto-save triggers

**Testing:**
- Manual testing of complete draft lifecycle
- Cross-device testing (desktop + mobile)
- TTL testing (simulate time passage)

## External Dependencies

None - all features use existing stack

## Success Verification

**Complete User Journey:**
1. User starts filling form, gets to Step 3
2. Closes browser without completing
3. Reopens app, sees recovery dialog
4. Selects draft, continues from Step 3
5. Completes and submits form
6. Verify draft is deleted after successful submission

**TTL Verification:**
1. Create draft
2. Wait 7 days (or simulate)
3. Verify notification sent
4. Wait 15 days (or simulate)
5. Verify draft auto-deleted

**Multi-Draft Verification:**
1. Start "Viagem para São Paulo" draft (Step 4)
2. Start "Viagem para Rio de Janeiro" draft (Step 2)
3. Start "Viagem para Brasília" draft (Step 1)
4. Verify all 3 drafts appear in "My Requests"
5. Continue each draft independently
6. Verify no data conflicts
