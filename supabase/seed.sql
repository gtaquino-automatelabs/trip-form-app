-- Seed data for development and testing
-- This file is safe to run multiple times (idempotent)

-- Create test users if they don't exist
-- Note: In local dev, you'll need to create users through Supabase Auth
-- This is just to document the test users that should be created

-- Test User 1: Regular user
-- Email: user@example.com
-- Password: testuser123

-- Test User 2: Admin user  
-- Email: admin@example.com
-- Password: testadmin123

-- NOTE: The seed data below is commented out because it requires valid auth.users IDs
-- After creating users through Supabase Auth, you can uncomment and update the UUIDs

/*
-- Insert or update test profiles (run after users are created via Auth)
INSERT INTO profiles (id, email, name, role) 
VALUES 
  -- These UUIDs will need to be replaced with actual auth.users IDs after signup
  ('00000000-0000-0000-0000-000000000001'::uuid, 'user@example.com', 'Test User', 'user'),
  ('00000000-0000-0000-0000-000000000002'::uuid, 'admin@example.com', 'Test Admin', 'admin')
ON CONFLICT (id) 
DO UPDATE SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Sample travel requests (will need real user IDs)
INSERT INTO travel_requests (
  id,
  user_id,
  passenger_name,
  passenger_email,
  passenger_cpf,
  passenger_rg,
  passenger_birth_date,
  passenger_phone,
  emergency_contact_name,
  emergency_contact_phone,
  emergency_contact_email,
  requester_name,
  requester_email,
  cost_center,
  cost_center_manager,
  project_name,
  trip_origin,
  trip_destination,
  trip_start_date,
  trip_end_date,
  transport_type,
  expense_types,
  need_accommodation,
  accommodation_preferences,
  is_international,
  has_time_restrictions,
  trip_objective,
  expected_outcomes,
  status
) VALUES 
(
  'test-request-001',
  '00000000-0000-0000-0000-000000000001'::uuid,
  'John Doe',
  'john.doe@example.com',
  '123.456.789-00',
  'MG-12.345.678',
  '1990-01-15',
  '+55 11 98765-4321',
  'Jane Doe',
  '+55 11 98765-4322',
  'jane.doe@example.com',
  'John Doe',
  'john.doe@example.com',
  'IT-001',
  'Maria Silva',
  'Tech Conference 2025',
  'São Paulo, SP',
  'San Francisco, CA',
  '2025-09-15',
  '2025-09-20',
  'flight',
  '["airfare", "accommodation", "meals", "ground_transport"]',
  true,
  'Hotel near conference venue, single room',
  true,
  false,
  'Attend Tech Conference 2025 to learn about latest cloud technologies',
  'Knowledge sharing with team, implementation of new practices',
  'submitted'
),
(
  'test-request-002',
  '00000000-0000-0000-0000-000000000001'::uuid,
  'John Doe',
  'john.doe@example.com',
  '123.456.789-00',
  'MG-12.345.678',
  '1990-01-15',
  '+55 11 98765-4321',
  'Jane Doe',
  '+55 11 98765-4322',
  'jane.doe@example.com',
  'John Doe',
  'john.doe@example.com',
  'IT-001',
  'Maria Silva',
  'Client Meeting',
  'São Paulo, SP',
  'Rio de Janeiro, RJ',
  '2025-08-25',
  '2025-08-26',
  'flight',
  '["airfare", "meals", "ground_transport"]',
  false,
  null,
  false,
  true,
  'Meet with client to discuss project requirements',
  'Signed contract and project kickoff',
  'approved'
)
ON CONFLICT (id) DO NOTHING;

-- Sample status history
INSERT INTO status_history (
  request_id,
  changed_by,
  previous_status,
  new_status,
  comment
) VALUES 
(
  'test-request-001',
  '00000000-0000-0000-0000-000000000001'::uuid,
  'draft',
  'submitted',
  'Submitting request for approval'
),
(
  'test-request-002',
  '00000000-0000-0000-0000-000000000001'::uuid,
  'draft',
  'submitted',
  'Submitting request for approval'
),
(
  'test-request-002',
  '00000000-0000-0000-0000-000000000002'::uuid,
  'submitted',
  'approved',
  'Approved for client meeting'
)
ON CONFLICT DO NOTHING;

-- Sample form draft
INSERT INTO form_drafts (
  user_id,
  form_data,
  current_page
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '{
    "passenger_name": "John Doe",
    "passenger_email": "john.doe@example.com",
    "trip_origin": "São Paulo, SP",
    "trip_destination": "Brasília, DF"
  }',
  2
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  form_data = EXCLUDED.form_data,
  current_page = EXCLUDED.current_page;
*/