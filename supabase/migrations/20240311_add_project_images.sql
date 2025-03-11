-- Opprett en lagringsbøtte for prosjektbilder hvis den ikke allerede finnes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project_images', 'project_images', true)
ON CONFLICT (id) DO NOTHING;

-- Legg til policy for prosjektbilder
CREATE POLICY "Alle kan se prosjektbilder"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'project_images');

CREATE POLICY "Autentiserte brukere kan laste opp prosjektbilder"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'project_images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Prosjekteiere kan oppdatere prosjektbilder"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'project_images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Prosjekteiere kan slette prosjektbilder"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'project_images' AND
    auth.role() = 'authenticated'
  );

-- Legg til image_url-feltet i prosjekttabellen hvis det ikke allerede finnes
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS image_url TEXT; 