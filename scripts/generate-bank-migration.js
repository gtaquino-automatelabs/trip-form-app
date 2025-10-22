const fs = require('fs');
const path = require('path');

// Read CSV file
const csvPath = path.join(__dirname, '..', 'bank_data.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const lines = csvContent.trim().split('\n');
const headers = lines[0].split(',');

// Generate SQL inserts
const values = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];

  // Parse CSV line handling quoted fields with commas
  const fields = [];
  let currentField = '';
  let insideQuotes = false;

  for (let j = 0; j < line.length; j++) {
    const char = line[j];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }
  fields.push(currentField); // Add last field

  // Remove BOM from first field if present
  if (i === 1 && fields[0].charCodeAt(0) === 0xFEFF) {
    fields[0] = fields[0].substring(1);
  }

  const ispb = fields[0].trim();
  const name = fields[1].trim().replace(/'/g, "''"); // Escape single quotes
  const code = fields[2].trim();
  const fullName = fields[3].trim().replace(/'/g, "''"); // Escape single quotes

  // Convert ispb to BIGINT (remove leading zeros)
  const ispbBigint = parseInt(ispb, 10);

  // Handle nullable code
  const codeValue = code ? `'${code}'` : 'NULL';

  values.push(`(${ispbBigint}, '${name}', ${codeValue}, '${fullName}')`);
}

// Generate migration SQL
const migrationSQL = `-- Migration: Remodel bancos_brasileiros table to match bank_data.csv structure
-- Description: Drop existing table and recreate with ispb as primary key
-- Source: bank_data.csv (${values.length} banks)

-- Drop existing table and all dependencies
DROP TABLE IF EXISTS bancos_brasileiros CASCADE;

-- Create new table structure matching CSV
CREATE TABLE bancos_brasileiros (
    ispb BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    code VARCHAR(10),
    full_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_bancos_code ON bancos_brasileiros(code) WHERE code IS NOT NULL;
CREATE INDEX idx_bancos_name ON bancos_brasileiros USING gin(to_tsvector('portuguese', name));
CREATE INDEX idx_bancos_full_name ON bancos_brasileiros USING gin(to_tsvector('portuguese', full_name));

-- Insert all Brazilian banking institutions from CSV
INSERT INTO bancos_brasileiros (ispb, name, code, full_name) VALUES
${values.join(',\n')};

-- Enable RLS
ALTER TABLE bancos_brasileiros ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated and anonymous users to read banking institutions
CREATE POLICY "Anyone can view banking institutions" ON bancos_brasileiros
    FOR SELECT USING (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bancos_brasileiros_updated_at
    BEFORE UPDATE ON bancos_brasileiros
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update travel_requests table to reference bancos_brasileiros by ispb
-- First, check if the column exists and modify it
DO $$
BEGIN
    -- Drop the old bank_name column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'travel_requests'
        AND column_name = 'bank_name'
    ) THEN
        ALTER TABLE travel_requests DROP COLUMN bank_name;
    END IF;

    -- Add bank_ispb column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'travel_requests'
        AND column_name = 'bank_ispb'
    ) THEN
        ALTER TABLE travel_requests
        ADD COLUMN bank_ispb BIGINT
        REFERENCES bancos_brasileiros(ispb)
        ON DELETE SET NULL;

        COMMENT ON COLUMN travel_requests.bank_ispb IS 'ISPB code of the banking institution (foreign key to bancos_brasileiros)';
    END IF;
END $$;

-- Create index on foreign key for better performance
CREATE INDEX IF NOT EXISTS idx_travel_requests_bank_ispb ON travel_requests(bank_ispb);
`;

// Write migration file with timestamp
const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '');
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', `${timestamp}_remodel_bancos_brasileiros.sql`);

fs.writeFileSync(migrationPath, migrationSQL);

console.log(`✅ Migration created: ${migrationPath}`);
console.log(`📊 Generated ${values.length} bank records`);
