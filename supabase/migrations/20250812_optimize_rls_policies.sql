-- Optimization Migration: Fix RLS Performance Issues
-- This migration addresses:
-- 1. Auth function re-evaluation issues (using subqueries for single evaluation)
-- 2. Multiple permissive policies (consolidating into single policies)

-- Drop existing policies to recreate them optimized
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON profiles;

DROP POLICY IF EXISTS "Users can view own requests" ON travel_requests;
DROP POLICY IF EXISTS "Users can create own requests" ON travel_requests;
DROP POLICY IF EXISTS "Users can update own draft requests" ON travel_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON travel_requests;
DROP POLICY IF EXISTS "Admins can update any request" ON travel_requests;

DROP POLICY IF EXISTS "Users can view history of own requests" ON status_history;
DROP POLICY IF EXISTS "Admins can view all history" ON status_history;
DROP POLICY IF EXISTS "System can insert history" ON status_history;

DROP POLICY IF EXISTS "Users can view attachments of own requests" ON file_attachments;
DROP POLICY IF EXISTS "Users can upload attachments to own requests" ON file_attachments;
DROP POLICY IF EXISTS "Admins can view all attachments" ON file_attachments;

DROP POLICY IF EXISTS "Users can manage own drafts" ON form_drafts;

-- ===========================================
-- PROFILES TABLE - Optimized Policies
-- ===========================================

-- Consolidated SELECT policy for profiles
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (
        -- Users can view their own profile OR service role can view all
        id = (SELECT auth.uid()) 
        OR 
        (SELECT auth.jwt()->>'role') = 'service_role'
    );

-- Consolidated UPDATE policy for profiles  
CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (
        -- Users can update their own profile OR service role can update all
        id = (SELECT auth.uid())
        OR 
        (SELECT auth.jwt()->>'role') = 'service_role'
    );

-- Service role INSERT and DELETE
CREATE POLICY "profiles_service_role_insert_delete" ON profiles
    FOR INSERT WITH CHECK ((SELECT auth.jwt()->>'role') = 'service_role');

CREATE POLICY "profiles_service_role_delete" ON profiles
    FOR DELETE USING ((SELECT auth.jwt()->>'role') = 'service_role');

-- ===========================================
-- TRAVEL_REQUESTS TABLE - Optimized Policies
-- ===========================================

-- Consolidated SELECT policy
CREATE POLICY "travel_requests_select_policy" ON travel_requests
    FOR SELECT USING (
        -- Users can view their own requests OR admins can view all
        user_id = (SELECT auth.uid())
        OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (SELECT auth.uid())
            AND profiles.role = 'admin'
        )
    );

-- INSERT policy (unchanged as it's single)
CREATE POLICY "travel_requests_insert_policy" ON travel_requests
    FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

-- Consolidated UPDATE policy
CREATE POLICY "travel_requests_update_policy" ON travel_requests
    FOR UPDATE USING (
        -- Users can update their own draft requests OR admins can update any
        (user_id = (SELECT auth.uid()) AND status = 'draft')
        OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (SELECT auth.uid())
            AND profiles.role = 'admin'
        )
    );

-- ===========================================
-- STATUS_HISTORY TABLE - Optimized Policies
-- ===========================================

-- Consolidated SELECT policy
CREATE POLICY "status_history_select_policy" ON status_history
    FOR SELECT USING (
        -- Users can view history of their own requests OR admins can view all
        EXISTS (
            SELECT 1 FROM travel_requests 
            WHERE travel_requests.id = status_history.request_id 
            AND travel_requests.user_id = (SELECT auth.uid())
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (SELECT auth.uid())
            AND profiles.role = 'admin'
        )
    );

-- INSERT policy (optimized)
CREATE POLICY "status_history_insert_policy" ON status_history
    FOR INSERT WITH CHECK (changed_by = (SELECT auth.uid()));

-- ===========================================
-- FILE_ATTACHMENTS TABLE - Optimized Policies
-- ===========================================

-- Consolidated SELECT policy
CREATE POLICY "file_attachments_select_policy" ON file_attachments
    FOR SELECT USING (
        -- Users can view attachments of their own requests OR admins can view all
        EXISTS (
            SELECT 1 FROM travel_requests 
            WHERE travel_requests.id = file_attachments.request_id 
            AND travel_requests.user_id = (SELECT auth.uid())
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (SELECT auth.uid())
            AND profiles.role = 'admin'
        )
    );

-- INSERT policy (optimized)
CREATE POLICY "file_attachments_insert_policy" ON file_attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM travel_requests 
            WHERE travel_requests.id = file_attachments.request_id 
            AND travel_requests.user_id = (SELECT auth.uid())
        )
    );

-- ===========================================
-- FORM_DRAFTS TABLE - Optimized Policy
-- ===========================================

-- Single ALL policy (optimized)
CREATE POLICY "form_drafts_all_policy" ON form_drafts
    FOR ALL USING (user_id = (SELECT auth.uid()));

-- Add helpful comment
COMMENT ON SCHEMA public IS 'RLS policies optimized for performance using subqueries and consolidated policies';