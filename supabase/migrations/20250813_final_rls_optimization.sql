-- Final RLS Optimization - Remove service role policies entirely
-- Service role bypasses RLS by default, so these policies are redundant

-- Drop all service role specific policies
DROP POLICY IF EXISTS "profiles_service_role_insert_delete" ON profiles;
DROP POLICY IF EXISTS "profiles_service_role_delete" ON profiles;

-- Also need to update the consolidated policies to remove service role checks
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- Recreate policies WITHOUT service role checks (service role bypasses RLS anyway)
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (id = (SELECT auth.uid()));

CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (id = (SELECT auth.uid()));

-- Note: Service role (used by triggers/functions with SECURITY DEFINER) 
-- automatically bypasses RLS, so we don't need explicit policies for it