-- Fjern eksisterende policies for projects
DROP POLICY IF EXISTS "Brukere kan lese prosjekter de er medlem av" ON projects;
DROP POLICY IF EXISTS "Brukere kan opprette prosjekter" ON projects;
DROP POLICY IF EXISTS "Prosjekteiere og administratorer kan oppdatere prosjekter" ON projects;
DROP POLICY IF EXISTS "Prosjekteiere kan slette prosjekter" ON projects;

-- Aktiver Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Opprett policies for projects
CREATE POLICY "Brukere kan lese prosjekter de er medlem av"
  ON projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_id = projects.id 
      AND user_id = auth.uid()
    ) OR created_by = auth.uid()
  );

CREATE POLICY "Brukere kan opprette prosjekter"
  ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Prosjekteiere og administratorer kan oppdatere prosjekter"
  ON projects
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_id = projects.id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    ) OR created_by = auth.uid()
  );

CREATE POLICY "Prosjekteiere kan slette prosjekter"
  ON projects
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_id = projects.id 
      AND user_id = auth.uid() 
      AND role = 'owner'
    ) OR created_by = auth.uid()
  ); 