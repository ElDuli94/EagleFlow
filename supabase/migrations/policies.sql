-- Del 2: Policies
-- Denne filen inneholder alle policies for tabellene

-- Fjern eksisterende policies for profiles
DROP POLICY IF EXISTS "Alle kan lese profiler" ON profiles;
DROP POLICY IF EXISTS "Brukere kan oppdatere sin egen profil" ON profiles;
DROP POLICY IF EXISTS "Brukere kan sette inn sin egen profil" ON profiles;

-- Opprett policies for profiles
CREATE POLICY "Alle kan lese profiler" 
  ON profiles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Brukere kan oppdatere sin egen profil" 
  ON profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Brukere kan sette inn sin egen profil" 
  ON profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Fjern eksisterende policies for storage.objects
DROP POLICY IF EXISTS "Alle kan se avatarer" ON storage.objects;
DROP POLICY IF EXISTS "Autentiserte brukere kan laste opp avatarer" ON storage.objects;

-- Opprett policies for storage
CREATE POLICY "Alle kan se avatarer" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'avatars');

CREATE POLICY "Autentiserte brukere kan laste opp avatarer" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated'
  );

-- Fjern eksisterende policies for projects
DROP POLICY IF EXISTS "Brukere kan lese prosjekter de er medlem av" ON projects;
DROP POLICY IF EXISTS "Brukere kan opprette prosjekter" ON projects;
DROP POLICY IF EXISTS "Prosjekteiere og administratorer kan oppdatere prosjekter" ON projects;
DROP POLICY IF EXISTS "Prosjekteiere kan slette prosjekter" ON projects;

-- Opprett policies for projects
CREATE POLICY "Brukere kan lese prosjekter de er medlem av"
  ON projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_id = projects.id 
      AND user_id = auth.uid() 
      AND invitation_status = 'accepted'
    )
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
      AND invitation_status = 'accepted'
    )
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
      AND invitation_status = 'accepted'
    )
  );

-- Fjern eksisterende policies for project_members
DROP POLICY IF EXISTS "Brukere kan se medlemmer i prosjekter de er medlem av" ON project_members;
DROP POLICY IF EXISTS "Prosjekteiere og administratorer kan legge til medlemmer" ON project_members;
DROP POLICY IF EXISTS "Prosjekteiere og administratorer kan oppdatere medlemmer" ON project_members;
DROP POLICY IF EXISTS "Prosjekteiere og administratorer kan fjerne medlemmer" ON project_members;

-- Opprett policies for project_members
CREATE POLICY "Brukere kan se medlemmer i prosjekter de er medlem av"
  ON project_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members AS pm
      WHERE pm.project_id = project_members.project_id 
      AND pm.user_id = auth.uid() 
      AND pm.invitation_status = 'accepted'
    )
  );

-- Bruk variabel for å unngå NEW-referanse
CREATE POLICY "Prosjekteiere og administratorer kan legge til medlemmer"
  ON project_members
  FOR INSERT
  WITH CHECK (
    (
      EXISTS (
        SELECT 1 FROM project_members AS pm
        WHERE pm.project_id = project_members.project_id 
        AND pm.user_id = auth.uid() 
        AND pm.role IN ('owner', 'admin') 
        AND pm.invitation_status = 'accepted'
      )
    ) OR auth.uid() = project_members.user_id -- Tillat brukere å legge til seg selv
  );

CREATE POLICY "Prosjekteiere og administratorer kan oppdatere medlemmer"
  ON project_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM project_members AS pm
      WHERE pm.project_id = project_members.project_id 
      AND pm.user_id = auth.uid() 
      AND pm.role IN ('owner', 'admin') 
      AND pm.invitation_status = 'accepted'
    )
  );

CREATE POLICY "Prosjekteiere og administratorer kan fjerne medlemmer"
  ON project_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM project_members AS pm
      WHERE pm.project_id = project_members.project_id 
      AND pm.user_id = auth.uid() 
      AND pm.role IN ('owner', 'admin') 
      AND pm.invitation_status = 'accepted'
    ) AND user_id != auth.uid() -- Kan ikke fjerne seg selv
  );

-- Fjern eksisterende policies for project_invitations
DROP POLICY IF EXISTS "Brukere kan se invitasjoner til prosjekter de administrerer" ON project_invitations;
DROP POLICY IF EXISTS "Brukere kan se invitasjoner til sin e-post" ON project_invitations;
DROP POLICY IF EXISTS "Prosjekteiere og administratorer kan opprette invitasjoner" ON project_invitations;
DROP POLICY IF EXISTS "Prosjekteiere og administratorer kan oppdatere invitasjoner" ON project_invitations;
DROP POLICY IF EXISTS "Brukere kan oppdatere invitasjoner til sin e-post" ON project_invitations;
DROP POLICY IF EXISTS "Prosjekteiere og administratorer kan slette invitasjoner" ON project_invitations;

-- Opprett policies for project_invitations
CREATE POLICY "Brukere kan se invitasjoner til prosjekter de administrerer"
  ON project_invitations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members AS pm
      WHERE pm.project_id = project_invitations.project_id 
      AND pm.user_id = auth.uid() 
      AND pm.role IN ('owner', 'admin') 
      AND pm.invitation_status = 'accepted'
    )
  );

CREATE POLICY "Brukere kan se invitasjoner til sin e-post"
  ON project_invitations
  FOR SELECT
  USING (
    email = auth.email()
  );

-- Bruk variabel for å unngå NEW-referanse
CREATE POLICY "Prosjekteiere og administratorer kan opprette invitasjoner"
  ON project_invitations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members AS pm
      WHERE pm.project_id = project_invitations.project_id 
      AND pm.user_id = auth.uid() 
      AND pm.role IN ('owner', 'admin') 
      AND pm.invitation_status = 'accepted'
    ) AND invited_by = auth.uid()
  );

CREATE POLICY "Prosjekteiere og administratorer kan oppdatere invitasjoner"
  ON project_invitations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM project_members AS pm
      WHERE pm.project_id = project_invitations.project_id 
      AND pm.user_id = auth.uid() 
      AND pm.role IN ('owner', 'admin') 
      AND pm.invitation_status = 'accepted'
    )
  );

CREATE POLICY "Brukere kan oppdatere invitasjoner til sin e-post"
  ON project_invitations
  FOR UPDATE
  USING (
    email = auth.email()
  );

CREATE POLICY "Prosjekteiere og administratorer kan slette invitasjoner"
  ON project_invitations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM project_members AS pm
      WHERE pm.project_id = project_invitations.project_id 
      AND pm.user_id = auth.uid() 
      AND pm.role IN ('owner', 'admin') 
      AND pm.invitation_status = 'accepted'
    )
  ); 