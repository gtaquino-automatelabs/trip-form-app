-- Migration: Add missing columns to travel_requests table
-- Date: 2024-10-17
-- Description: Add baggage_allowance, transport_allowance, and estimated_daily_allowance columns

-- Add missing columns to travel_requests table
ALTER TABLE public.travel_requests
ADD COLUMN IF NOT EXISTS baggage_allowance BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS transport_allowance BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS estimated_daily_allowance NUMERIC(10,2) DEFAULT 0.00;

-- Add helpful comments
COMMENT ON COLUMN public.travel_requests.baggage_allowance IS 'Whether baggage allowance is requested';
COMMENT ON COLUMN public.travel_requests.transport_allowance IS 'Whether transport allowance is requested';  
COMMENT ON COLUMN public.travel_requests.estimated_daily_allowance IS 'Estimated daily allowance amount in currency';

-- Update the database types for consistency
-- Note: You'll need to regenerate types after running this migration
