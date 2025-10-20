-- Migration: Add structured bank fields to travel_requests table
-- Date: 2024-10-17
-- Description: Add separate columns for bank name, branch, and account while maintaining backwards compatibility

-- Add structured bank fields to travel_requests table
ALTER TABLE public.travel_requests
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_branch TEXT,
ADD COLUMN IF NOT EXISTS bank_account TEXT;

-- Add helpful comments
COMMENT ON COLUMN public.travel_requests.bank_name IS 'Name of the banking institution';
COMMENT ON COLUMN public.travel_requests.bank_branch IS 'Bank branch number (agência)';
COMMENT ON COLUMN public.travel_requests.bank_account IS 'Bank account number';

-- Create an index for bank name lookups (if needed for reporting)
CREATE INDEX IF NOT EXISTS idx_travel_requests_bank_name ON public.travel_requests(bank_name);

-- Note: The original bank_details column is kept for backwards compatibility
-- In the future, we can create a function to populate structured fields from bank_details
-- or vice versa for legacy data migration
