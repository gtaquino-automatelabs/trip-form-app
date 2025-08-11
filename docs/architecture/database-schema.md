# Database Schema

```sql
-- Enable UUID extension for Supabase Auth integration
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (managed by Supabase Auth)
-- This references auth.users but adds app-specific fields
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Travel Requests table
CREATE TABLE public.travel_requests (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    request_number TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'submitted' 
        CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'completed')),
    
    -- Passenger Data (Page 1)
    project_name TEXT NOT NULL,
    passenger_name TEXT NOT NULL,
    passenger_email TEXT NOT NULL,
    rg TEXT NOT NULL,
    rg_issuer TEXT NOT NULL,
    cpf TEXT NOT NULL,
    birth_date DATE NOT NULL,
    phone TEXT NOT NULL,
    bank_details TEXT NOT NULL,
    request_type TEXT NOT NULL 
        CHECK (request_type IN ('passages_per_diem', 'passages_only', 'per_diem_only')),
    
    -- Travel Details (Page 2)
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    departure_date DATE NOT NULL,
    return_date DATE NOT NULL,
    transport_type TEXT NOT NULL 
        CHECK (transport_type IN ('air', 'road', 'both', 'own_car')),
    
    -- Expense Types (Page 3)
    expense_types TEXT[] DEFAULT '{}',
    
    -- Preferences (Page 4)
    baggage_allowance BOOLEAN DEFAULT false,
    transport_allowance BOOLEAN DEFAULT false,
    estimated_daily_allowance NUMERIC(10,2) DEFAULT 0,
    
    -- International Travel (Page 5 - conditional)
    is_international BOOLEAN DEFAULT false,
    passport_number TEXT,
    passport_validity DATE,
    passport_image_url TEXT,
    visa_required BOOLEAN DEFAULT false,
    
    -- Time Restrictions (Page 6 - conditional)
    has_time_restrictions BOOLEAN DEFAULT false,
    time_restriction_details TEXT,
    
    -- Flight Preferences (Page 7 - conditional)
    has_flight_preferences BOOLEAN DEFAULT false,
    flight_suggestion_urls TEXT[] DEFAULT '{}',
    
    -- Trip Objective (Page 8)
    trip_objective TEXT NOT NULL,
    observations TEXT,
    is_urgent BOOLEAN DEFAULT false,
    urgent_justification TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Status History table for audit trail
CREATE TABLE public.status_history (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    request_id TEXT NOT NULL REFERENCES travel_requests(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID NOT NULL REFERENCES auth.users(id),
    comment TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- File Attachments table
CREATE TABLE public.file_attachments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    request_id TEXT NOT NULL REFERENCES travel_requests(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('passport', 'flight_suggestion', 'other')),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Form Drafts table for saving progress
CREATE TABLE public.form_drafts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    form_data JSONB NOT NULL,
    current_page INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id) -- One draft per user
);

-- Indexes for performance
CREATE INDEX idx_travel_requests_user_id ON travel_requests(user_id);
CREATE INDEX idx_travel_requests_status ON travel_requests(status);
CREATE INDEX idx_travel_requests_created_at ON travel_requests(created_at DESC);
CREATE INDEX idx_travel_requests_departure_date ON travel_requests(departure_date);
CREATE INDEX idx_status_history_request_id ON status_history(request_id);
CREATE INDEX idx_file_attachments_request_id ON file_attachments(request_id);

-- Row Level Security Policies
ALTER TABLE travel_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own requests
CREATE POLICY "Users can view own requests" ON travel_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create own requests" ON travel_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can see all requests
CREATE POLICY "Admins can view all requests" ON travel_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Admins can update any request
CREATE POLICY "Admins can update requests" ON travel_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Similar RLS policies for other tables
CREATE POLICY "Users can manage own drafts" ON form_drafts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own attachments" ON file_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM travel_requests 
            WHERE travel_requests.id = file_attachments.request_id 
            AND travel_requests.user_id = auth.uid()
        )
    );

-- Function to generate request numbers
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_num INTEGER;
    new_number TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    SELECT COUNT(*) + 1 INTO sequence_num
    FROM travel_requests
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
    
    new_number := 'REQ-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set request number
CREATE OR REPLACE FUNCTION set_request_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.request_number IS NULL THEN
        NEW.request_number := generate_request_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_request_number_trigger
    BEFORE INSERT ON travel_requests
    FOR EACH ROW
    EXECUTE FUNCTION set_request_number();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_travel_requests_updated_at
    BEFORE UPDATE ON travel_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_form_drafts_updated_at
    BEFORE UPDATE ON form_drafts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```
