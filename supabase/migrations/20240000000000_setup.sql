-- Komplett SQL-oppsett for EagleFlow
-- Denne filen inneholder alt du trenger for å sette opp databasen

-- Aktiver UUID-v4 extension hvis den ikke allerede er aktivert
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Opprett profiles-tabell
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  birth_date DATE NOT NULL DEFAULT '2000-01-01',
  company TEXT NOT NULL DEFAULT '',
  job_title TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  gender TEXT NOT NULL DEFAULT 'male' CHECK (gender IN ('male', 'female')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

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

-- Aktiver Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Opprett en lagringsbøtte for avatarer
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

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

-- Opprett prosjekttabell
DROP TABLE IF EXISTS projects CASCADE;
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  size TEXT,
  location TEXT,
  main_contractor TEXT,
  technical_contractor TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  client TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users NOT NULL
);

-- Opprett en tabell for prosjektmedlemmer
DROP TABLE IF EXISTS project_members CASCADE;
CREATE TABLE IF NOT EXISTS project_members (
  project_id UUID REFERENCES projects ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invited_by UUID REFERENCES auth.users,
  invitation_status TEXT NOT NULL DEFAULT 'accepted' CHECK (invitation_status IN ('pending', 'accepted', 'rejected')),
  invitation_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  PRIMARY KEY (project_id, user_id)
);

-- Opprett en tabell for prosjektinvitasjoner
DROP TABLE IF EXISTS project_invitations CASCADE;
CREATE TABLE IF NOT EXISTS project_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  invited_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days') NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  UNIQUE (project_id, email)
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
      SELECT 1 FROM project_members 
      WHERE project_id = project_members.project_id 
      AND user_id = auth.uid() 
      AND invitation_status = 'accepted'
    )
  );

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
      SELECT 1 FROM project_members 
      WHERE project_id = project_invitations.project_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin') 
      AND invitation_status = 'accepted'
    )
  );

CREATE POLICY "Brukere kan se invitasjoner til sin e-post"
  ON project_invitations
  FOR SELECT
  USING (
    email = auth.email()
  );

CREATE POLICY "Prosjekteiere og administratorer kan opprette invitasjoner"
  ON project_invitations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_id = NEW.project_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin') 
      AND invitation_status = 'accepted'
    ) AND invited_by = auth.uid()
  );

CREATE POLICY "Prosjekteiere og administratorer kan oppdatere invitasjoner"
  ON project_invitations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_id = project_invitations.project_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin') 
      AND invitation_status = 'accepted'
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
      SELECT 1 FROM project_members 
      WHERE project_id = project_invitations.project_id 
      AND user_id = auth.uid() 
      AND role IN ('owner', 'admin') 
      AND invitation_status = 'accepted'
    )
  );

-- Aktiver Row Level Security for prosjekttabellene
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;

-- Opprett en funksjon som automatisk legger til prosjekteieren som medlem
CREATE OR REPLACE FUNCTION public.handle_new_project() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.project_members (project_id, user_id, role, invitation_status)
  VALUES (NEW.id, NEW.created_by, 'owner', 'accepted');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Opprett en trigger som kjører funksjonen når et prosjekt opprettes
DROP TRIGGER IF EXISTS on_project_created ON projects;
CREATE TRIGGER on_project_created
  AFTER INSERT ON projects
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_project();

-- Opprett en funksjon som oppdaterer created_at når en bruker registrerer seg
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Logg brukerdata for debugging
  RAISE LOG 'Oppretter ny profil for bruker: %, metadata: %', NEW.id, NEW.raw_user_meta_data;
  
  INSERT INTO public.profiles (
    id, 
    full_name, 
    birth_date, 
    company, 
    job_title, 
    email, 
    city, 
    gender
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'birth_date', ''), '2000-01-01'),
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    COALESCE(NEW.raw_user_meta_data->>'job_title', ''),
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', ''),
    COALESCE(NEW.raw_user_meta_data->>'city', ''),
    COALESCE(NEW.raw_user_meta_data->>'gender', 'male')
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Logg feil
  RAISE LOG 'Feil ved oppretting av profil: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Opprett en trigger som kjører funksjonen når en bruker registrerer seg
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 