-- Fjern eksisterende policies for project_members
DROP POLICY IF EXISTS "Brukere kan se medlemmer i prosjekter de er medlem av" ON project_members;
DROP POLICY IF EXISTS "Prosjekteiere og administratorer kan legge til medlemmer" ON project_members;
DROP POLICY IF EXISTS "Prosjekteiere og administratorer kan oppdatere medlemmer" ON project_members;
DROP POLICY IF EXISTS "Prosjekteiere og administratorer kan fjerne medlemmer" ON project_members;

-- Aktiver Row Level Security
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Opprett policies for project_members
CREATE POLICY "Brukere kan se medlemmer i prosjekter de er medlem av"
  ON project_members
  FOR SELECT
  USING (true);

CREATE POLICY "Prosjekteiere og administratorer kan legge til medlemmer"
  ON project_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_id = NEW.project_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin') 
      AND invitation_status = 'accepted'
    ) OR auth.uid() = NEW.user_id -- Tillat brukere å legge til seg selv
  );

CREATE POLICY "Prosjekteiere og administratorer kan oppdatere medlemmer"
  ON project_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_id = project_members.project_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin') 
      AND invitation_status = 'accepted'
    )
  );

CREATE POLICY "Prosjekteiere og administratorer kan fjerne medlemmer"
  ON project_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_id = project_members.project_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin') 
      AND invitation_status = 'accepted'
    ) AND user_id != auth.uid() -- Kan ikke fjerne seg selv
  );

-- Opprett en trigger for å legge til prosjekteier som medlem
CREATE OR REPLACE FUNCTION handle_new_project()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_members (project_id, user_id, role, invitation_status)
  VALUES (NEW.id, NEW.created_by, 'owner', 'accepted');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_project_created ON projects;
CREATE TRIGGER on_project_created
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_project(); 