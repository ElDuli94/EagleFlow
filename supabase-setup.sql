-- Opprett profiles-tabell
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  company TEXT NOT NULL,
  job_title TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  avatar_url TEXT,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Opprett en sikkerhetspolicy som tillater lesing av profiler
CREATE POLICY "Alle kan lese profiler" 
  ON profiles 
  FOR SELECT 
  USING (true);

-- Opprett en sikkerhetspolicy som tillater brukere å oppdatere sin egen profil
CREATE POLICY "Brukere kan oppdatere sin egen profil" 
  ON profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Opprett en sikkerhetspolicy som tillater brukere å sette inn sin egen profil
CREATE POLICY "Brukere kan sette inn sin egen profil" 
  ON profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Aktiver Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Opprett en lagringsbøtte for avatarer
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- Opprett en sikkerhetspolicy for lagringsbøtten
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

-- Opprett en funksjon som oppdaterer created_at når en bruker registrerer seg
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, birth_date, company, job_title, email, city, gender)
  VALUES (
    new.id, 
    '', 
    '2000-01-01', 
    '', 
    '', 
    new.email, 
    '', 
    'male'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Opprett en trigger som kjører funksjonen når en bruker registrerer seg
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 