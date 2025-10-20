-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    UNIQUE(email)
);

-- Create travel_requests table with all required fields
CREATE TABLE IF NOT EXISTS travel_requests (
    -- Primary identification
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    request_number TEXT UNIQUE,
    
    -- Passenger Information
    passenger_name TEXT NOT NULL,
    passenger_email TEXT NOT NULL,
    passenger_cpf TEXT NOT NULL,
    passenger_rg TEXT NOT NULL,
    passenger_birth_date DATE NOT NULL,
    passenger_phone TEXT NOT NULL,
    
    -- Emergency Contact
    emergency_contact_name TEXT NOT NULL,
    emergency_contact_phone TEXT NOT NULL,
    emergency_contact_email TEXT,
    
    -- Organization Details
    requester_name TEXT NOT NULL,
    requester_email TEXT NOT NULL,
    cost_center TEXT NOT NULL,
    cost_center_manager TEXT NOT NULL,
    project_name TEXT NOT NULL,
    
    -- Travel Details
    trip_origin TEXT NOT NULL,
    trip_destination TEXT NOT NULL,
    trip_start_date DATE NOT NULL,
    trip_end_date DATE NOT NULL,
    transport_type TEXT NOT NULL CHECK (transport_type IN ('flight', 'bus', 'car_rental', 'other')),
    transport_details TEXT,
    
    -- Expense Types (multi-select stored as JSONB array)
    expense_types JSONB DEFAULT '[]',
    
    -- Accommodation
    need_accommodation BOOLEAN DEFAULT false,
    accommodation_preferences TEXT,
    special_requests TEXT,
    
    -- International Travel
    is_international BOOLEAN DEFAULT false,
    passport_number TEXT,
    passport_expiry DATE,
    passport_issuing_country TEXT,
    visa_required BOOLEAN DEFAULT false,
    visa_information TEXT,
    
    -- Time Restrictions
    has_time_restrictions BOOLEAN DEFAULT false,
    time_restrictions_details TEXT,
    
    -- Flight Preferences
    preferred_airlines JSONB DEFAULT '[]',
    preferred_departure_time TEXT,
    preferred_arrival_time TEXT,
    seat_preference TEXT CHECK (seat_preference IN ('window', 'aisle', 'middle', 'no_preference') OR seat_preference IS NULL),
    additional_notes TEXT,
    
    -- Trip Objective
    trip_objective TEXT NOT NULL,
    expected_outcomes TEXT,
    
    -- Approval & Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'cancelled')),
    admin_notes TEXT,
    rejection_reason TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT end_date_after_start CHECK (trip_end_date >= trip_start_date),
    CONSTRAINT international_passport_required CHECK (
        (is_international = false) OR 
        (is_international = true AND passport_number IS NOT NULL AND passport_expiry IS NOT NULL)
    )
);

-- Create status_history table for audit trail
CREATE TABLE IF NOT EXISTS status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id TEXT NOT NULL REFERENCES travel_requests(id) ON DELETE CASCADE,
    changed_by UUID NOT NULL REFERENCES auth.users(id),
    previous_status TEXT,
    new_status TEXT NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create file_attachments table
CREATE TABLE IF NOT EXISTS file_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id TEXT NOT NULL REFERENCES travel_requests(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('passport', 'flight_suggestion', 'other')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create form_drafts table for saving form progress
CREATE TABLE IF NOT EXISTS form_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    form_data JSONB NOT NULL DEFAULT '{}',
    current_page INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id) -- One draft per user
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_travel_requests_user_id ON travel_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_requests_status ON travel_requests(status);
CREATE INDEX IF NOT EXISTS idx_travel_requests_request_number ON travel_requests(request_number);
CREATE INDEX IF NOT EXISTS idx_travel_requests_created_at ON travel_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_status_history_request_id ON status_history(request_id);
CREATE INDEX IF NOT EXISTS idx_file_attachments_request_id ON file_attachments(request_id);
CREATE INDEX IF NOT EXISTS idx_form_drafts_user_id ON form_drafts(user_id);

-- Function to generate request number
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_num INTEGER;
    new_number TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    SELECT COUNT(*) + 1 INTO sequence_num
    FROM public.travel_requests
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
    
    new_number := 'REQ-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Function to set request number on insert
CREATE OR REPLACE FUNCTION set_request_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.request_number IS NULL THEN
        NEW.request_number := public.generate_request_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Create triggers
DROP TRIGGER IF EXISTS set_request_number_trigger ON travel_requests;
CREATE TRIGGER set_request_number_trigger
    BEFORE INSERT ON travel_requests
    FOR EACH ROW
    EXECUTE FUNCTION set_request_number();

DROP TRIGGER IF EXISTS update_travel_requests_updated_at ON travel_requests;
CREATE TRIGGER update_travel_requests_updated_at
    BEFORE UPDATE ON travel_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_form_drafts_updated_at ON form_drafts;
CREATE TRIGGER update_form_drafts_updated_at
    BEFORE UPDATE ON form_drafts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles" ON profiles
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- RLS Policies for travel_requests table
CREATE POLICY "Users can view own requests" ON travel_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own requests" ON travel_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own draft requests" ON travel_requests
    FOR UPDATE USING (auth.uid() = user_id AND status = 'draft');

CREATE POLICY "Admins can view all requests" ON travel_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update any request" ON travel_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- RLS Policies for status_history table
CREATE POLICY "Users can view history of own requests" ON status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM travel_requests 
            WHERE travel_requests.id = status_history.request_id 
            AND travel_requests.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all history" ON status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "System can insert history" ON status_history
    FOR INSERT WITH CHECK (auth.uid() = changed_by);

-- RLS Policies for file_attachments table
CREATE POLICY "Users can view attachments of own requests" ON file_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM travel_requests 
            WHERE travel_requests.id = file_attachments.request_id 
            AND travel_requests.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can upload attachments to own requests" ON file_attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM travel_requests 
            WHERE travel_requests.id = file_attachments.request_id 
            AND travel_requests.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all attachments" ON file_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- RLS Policies for form_drafts table
CREATE POLICY "Users can manage own drafts" ON form_drafts
    FOR ALL USING (auth.uid() = user_id);

-- Function to handle user creation (creates profile automatically)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();