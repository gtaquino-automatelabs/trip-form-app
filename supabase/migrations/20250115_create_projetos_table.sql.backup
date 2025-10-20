-- Create projetos table to store project data with cost centers
CREATE TABLE IF NOT EXISTS projetos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  centros_custo JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for searching within the JSON array
CREATE INDEX IF NOT EXISTS idx_projetos_centros_custo ON projetos USING GIN (centros_custo);

-- Create index for project name searches
CREATE INDEX IF NOT EXISTS idx_projetos_nome ON projetos(nome);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_projetos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_projetos_updated_at
  BEFORE UPDATE ON projetos
  FOR EACH ROW
  EXECUTE FUNCTION update_projetos_updated_at();

-- Enable RLS
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow authenticated users to read all projects
CREATE POLICY "Allow authenticated users to read projetos" ON projetos
  FOR SELECT TO authenticated
  USING (true);

-- Allow only admin users to insert/update/delete projects
CREATE POLICY "Allow admin users to manage projetos" ON projetos
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Grant necessary permissions
GRANT SELECT ON projetos TO authenticated;
GRANT ALL ON projetos TO service_role;
