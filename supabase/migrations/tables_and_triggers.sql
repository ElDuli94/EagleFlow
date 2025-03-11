-- Del 1: Tabeller og triggere
-- Denne filen inneholder tabelldefinisjoner og triggerfunksjoner

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

-- Opprett en lagringsbøtte for avatarer
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

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

-- Aktiver Row Level Security for alle tabeller
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;

-- Opprett en funksjon som automatisk legger til prosjekteieren som medlem
DROP FUNCTION IF EXISTS public.handle_new_project() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_project() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.project_members (project_id, user_id, role, invitation_status)
  VALUES (NEW.id, NEW.created_by, 'owner', 'accepted');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Opprett en trigger som kjører funksjonen når et prosjekt opprettes
CREATE TRIGGER on_project_created
  AFTER INSERT ON projects
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_project();

-- Opprett en funksjon som oppdaterer created_at når en bruker registrerer seg
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
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
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 