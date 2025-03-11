import { createClient } from '@supabase/supabase-js'
import type { Project, UserProfile, ProjectMember, ProjectInvitation } from '../types';

// Hent miljøvariabler
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Sjekk at nødvendige miljøvariabler er satt
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Manglende miljøvariabler for Supabase. Sjekk at .env-filen er korrekt satt opp.')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Satt' : 'Mangler')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Satt' : 'Mangler')
}

// Opprett Supabase-klient
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Opprett en Supabase-klient med service_role for admin-operasjoner
// Dette bør kun brukes på server-side, men for demo-formål bruker vi det her
// const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''
// const supabaseAdmin = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null

// Autentiseringsfunksjoner
export async function signUp(
  email: string, 
  password: string, 
  userData: Omit<UserProfile, 'id' | 'created_at' | 'avatar_url'>
) {
  try {
    const normalizedEmail = email.toLowerCase()

    // 1. Opprett bruker i Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/#login`,
        data: {
          full_name: userData.full_name,
          birth_date: userData.birth_date,
          company: userData.company,
          job_title: userData.job_title,
          city: userData.city,
          gender: userData.gender
        }
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        throw new Error('En bruker med denne e-postadressen eksisterer allerede')
      }
      throw authError
    }

    if (!authData.user) {
      throw new Error('Kunne ikke opprette bruker')
    }

    // 2. Opprett brukerprofil i profiles-tabellen
    // Merk: Vi bruker en forenklet tilnærming her for demo-formål
    // I en produksjonsapp bør dette gjøres på server-side
    try {
      // Vent litt for å sikre at auth-brukeren er fullstendig opprettet
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Vis suksessmelding og omdiriger til innloggingssiden
      alert('Registrering vellykket! Vennligst sjekk e-posten din for å bekrefte kontoen.')
      window.location.hash = 'login'
      
      return authData
    } catch (profileError: any) {
      console.error('Profilfeil:', profileError)
      
      // Prøv å slette auth-brukeren hvis profil-opprettelsen feiler
      try {
        await supabase.auth.admin.deleteUser(authData.user.id)
      } catch (deleteError) {
        console.error('Kunne ikke slette auth-bruker:', deleteError)
      }

      throw new Error('Kunne ikke opprette brukerprofil. Dette er en kjent feil, men brukeren din er opprettet. Vennligst sjekk e-posten din for å bekrefte kontoen.')
    }
  } catch (error: any) {
    console.error('Registreringsfeil:', error)
    throw new Error(error.message || 'Det oppstod en feil under registrering. Vennligst prøv igjen.')
  }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw error
  }
  // Omdiriger til forsiden etter utlogging
  window.location.hash = ''
}

// Last opp avatar
export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
  try {
    console.log('Starter opplasting av avatar for bruker:', userId);
    
    if (!userId) {
      throw new Error('Bruker-ID er påkrevd for å laste opp avatar');
    }
    
    if (!file) {
      throw new Error('Ingen fil valgt for opplasting');
    }
    
    // Generer et unikt filnavn basert på bruker-ID og tidsstempel
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    console.log('Laster opp avatar til sti:', filePath);
    
    // Last opp filen til storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Feil ved opplasting av avatar:', uploadError);
      throw new Error(`Feil ved opplasting av avatar: ${uploadError.message}`);
    }
    
    // Hent offentlig URL for filen
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    console.log('Avatar lastet opp, offentlig URL:', publicUrl);
    
    // Oppdater brukerens profil med avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Feil ved oppdatering av profil med avatar URL:', updateError);
      throw new Error(`Feil ved oppdatering av profil: ${updateError.message}`);
    }
    
    console.log('Profil oppdatert med ny avatar URL');
    return publicUrl;
  } catch (error: any) {
    console.error('Uventet feil ved opplasting av avatar:', error);
    throw error;
  }
};

export async function getProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log('Henter profil for bruker:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Feil ved henting av profil:', error.message);
      console.error('Feildetaljer:', error);
      return null;
    }

    if (!data) {
      console.log('Ingen profildata funnet for bruker:', userId);
      
      // Opprett en ny profil hvis den ikke finnes
      console.log('Oppretter ny profil for bruker:', userId);
      
      const newProfile: Partial<UserProfile> = {
        id: userId,
        full_name: '',
        birth_date: new Date('2000-01-01').toISOString().split('T')[0],
        company: '',
        job_title: '',
        email: '',
        city: '',
        gender: 'male',
        created_at: new Date().toISOString()
      };
      
      const { data: newProfileData, error: insertError } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();
        
      if (insertError) {
        console.error('Feil ved oppretting av profil:', insertError);
        return null;
      }
      
      console.log('Ny profil opprettet:', newProfileData);
      return newProfileData;
    }

    // Logg profildata for debugging
    console.log('Profildata hentet:', {
      id: data.id,
      full_name: data.full_name || '[Tom]',
      avatar_url: data.avatar_url ? 'Finnes' : 'Mangler'
    });
    
    return data;
  } catch (error) {
    console.error('Uventet feil ved henting av profil:', error);
    return null;
  }
}

// Hent prosjekter for innlogget bruker
export async function getUserProjects(): Promise<Project[]> {
  try {
    const session = await getSession();
    if (!session) {
      console.log('Ingen bruker funnet for å hente prosjekter');
      return [];
    }

    console.log('Henter prosjekter for bruker:', session.user.id);
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_members!inner (
          user_id,
          role
        )
      `)
      .eq('project_members.user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Feil ved henting av prosjekter:', error);
      throw error;
    }

    if (!projects) {
      console.log('Ingen prosjekter funnet');
      return [];
    }

    console.log('Hentet prosjekter:', projects);
    return projects;
  } catch (error) {
    console.error('Uventet feil ved henting av prosjekter:', error);
    throw error;
  }
}

// Opprett nytt prosjekt
export async function createProject(projectData: Partial<Project>): Promise<{ project: Project | null; error: Error | null }> {
  try {
    const session = await getSession();
    if (!session) {
      console.log('Ingen bruker funnet for å opprette prosjekt');
      return { project: null, error: new Error('Ingen bruker funnet') };
    }

    const userId = session.user.id;
    console.log('Oppretter prosjekt for bruker:', userId);

    // Legg til created_by-feltet og andre påkrevde felter
    const newProject = {
      ...projectData,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: projectData.status || 'active',
      progress: projectData.progress || 0
    };

    console.log('Sender prosjektdata:', newProject);

    // Opprett prosjektet
    const { data, error } = await supabase
      .from('projects')
      .insert([newProject])
      .select();

    if (error) {
      console.error('Feil ved oppretting av prosjekt:', error);
      return { project: null, error: new Error(error.message) };
    }

    if (!data || data.length === 0) {
      console.error('Ingen data returnert ved oppretting av prosjekt');
      return { project: null, error: new Error('Kunne ikke opprette prosjekt') };
    }

    const createdProject = data[0];
    console.log('Prosjekt opprettet:', createdProject);

    return { project: createdProject, error: null };
  } catch (error) {
    console.error('Uventet feil ved oppretting av prosjekt:', error);
    return { project: null, error: error as Error };
  }
}

// Oppdater prosjekt
export async function updateProject(
  id: string,
  updates: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at' | 'created_by'>>
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Feil ved oppdatering av prosjekt:', error)
    throw error
  }

  return data
}

// Slett prosjekt
export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Feil ved sletting av prosjekt:', error)
    throw error
  }
}

// Hent prosjektmedlemmer med profilinformasjon
export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  try {
    const { data, error } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .order('role', { ascending: false }); // Sorter etter rolle (owner først, deretter admin, osv.)

    if (error) {
      console.error('Feil ved henting av prosjektmedlemmer:', error);
      throw error;
    }

    // Hent profildata separat for medlemmer
    if (data && data.length > 0) {
      const userIds = data.map(member => member.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) {
        console.error('Feil ved henting av profiler:', profilesError);
      } else if (profiles) {
        // Koble profiler til medlemmer
        return data.map(member => ({
          ...member,
          profile: profiles.find(profile => profile.id === member.user_id) || undefined
        }));
      }
    }

    return data || [];
  } catch (error) {
    console.error('Feil ved henting av prosjektmedlemmer:', error);
    return [];
  }
}

// Inviter bruker til prosjekt
export async function inviteUserToProject(
  projectId: string,
  email: string,
  role: 'admin' | 'member' | 'viewer' = 'member'
): Promise<void> {
  // Hent bruker-ID
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id
  
  if (!userId) {
    throw new Error('Bruker ikke logget inn')
  }

  // Generer en unik token
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

  // Opprett invitasjon
  const { error } = await supabase
    .from('project_invitations')
    .insert({
      project_id: projectId,
      email: email.toLowerCase(),
      role,
      invited_by: userId,
      token
    })

  if (error) {
    // Hvis brukeren allerede er invitert, gi en mer brukervennlig feilmelding
    if (error.code === '23505') {
      throw new Error('Denne e-postadressen er allerede invitert til prosjektet')
    }
    console.error('Feil ved invitasjon av bruker:', error)
    throw error
  }

  // TODO: Send e-post til brukeren med invitasjonslenke
  // Dette vil kreve en server-side funksjon i en produksjonsapp
}

// Aksepter prosjektinvitasjon
export async function acceptProjectInvitation(token: string): Promise<void> {
  // Hent bruker-ID og e-post
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id
  const userEmail = userData?.user?.email
  
  if (!userId || !userEmail) {
    throw new Error('Bruker ikke logget inn')
  }

  // Finn invitasjonen
  const { data: invitation, error: invitationError } = await supabase
    .from('project_invitations')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .single()

  if (invitationError || !invitation) {
    throw new Error('Ugyldig eller utløpt invitasjon')
  }

  // Sjekk om invitasjonen er til denne brukeren
  if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
    throw new Error('Denne invitasjonen er ikke til deg')
  }

  // Sjekk om invitasjonen er utløpt
  if (new Date(invitation.expires_at) < new Date()) {
    throw new Error('Invitasjonen er utløpt')
  }

  // Start en transaksjon
  // Merk: Supabase støtter ikke ekte transaksjoner i klienten, så vi gjør dette sekvensielt

  // 1. Oppdater invitasjonsstatusen
  const { error: updateError } = await supabase
    .from('project_invitations')
    .update({ status: 'accepted' })
    .eq('id', invitation.id)

  if (updateError) {
    console.error('Feil ved akseptering av invitasjon:', updateError)
    throw updateError
  }

  // 2. Legg til brukeren som prosjektmedlem
  const { error: memberError } = await supabase
    .from('project_members')
    .insert({
      project_id: invitation.project_id,
      user_id: userId,
      role: invitation.role,
      invited_by: invitation.invited_by,
      invitation_status: 'accepted',
      invitation_email: invitation.email
    })

  if (memberError) {
    console.error('Feil ved tillegging av prosjektmedlem:', memberError)
    throw memberError
  }
}

// Avvis prosjektinvitasjon
export async function rejectProjectInvitation(token: string): Promise<void> {
  // Hent bruker-ID og e-post
  const { data: userData } = await supabase.auth.getUser()
  const userEmail = userData?.user?.email
  
  if (!userEmail) {
    throw new Error('Bruker ikke logget inn')
  }

  // Finn invitasjonen
  const { data: invitation, error: invitationError } = await supabase
    .from('project_invitations')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .single()

  if (invitationError || !invitation) {
    throw new Error('Ugyldig eller utløpt invitasjon')
  }

  // Sjekk om invitasjonen er til denne brukeren
  if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
    throw new Error('Denne invitasjonen er ikke til deg')
  }

  // Oppdater invitasjonsstatusen
  const { error: updateError } = await supabase
    .from('project_invitations')
    .update({ status: 'rejected' })
    .eq('id', invitation.id)

  if (updateError) {
    console.error('Feil ved avvisning av invitasjon:', updateError)
    throw updateError
  }
}

// Hent invitasjoner for gjeldende bruker
export async function getUserInvitations(): Promise<ProjectInvitation[]> {
  // Hent bruker-ID og e-post
  const { data: userData } = await supabase.auth.getUser()
  const userEmail = userData?.user?.email
  
  if (!userEmail) {
    throw new Error('Bruker ikke logget inn')
  }

  const { data, error } = await supabase
    .from('project_invitations')
    .select(`
      *,
      project:projects(name)
    `)
    .eq('email', userEmail.toLowerCase())
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Feil ved henting av invitasjoner:', error)
    throw error
  }

  return data || []
}

// Hent invitasjoner for et prosjekt
export async function getProjectInvitations(projectId: string): Promise<ProjectInvitation[]> {
  try {
    const { data, error } = await supabase
      .from('project_invitations')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Feil ved henting av prosjektinvitasjoner:', error);
      throw error;
    }

    // Hent inviterer-profiler separat hvis det er nødvendig
    if (data && data.length > 0) {
      const inviterIds = data.map(invitation => invitation.invited_by).filter(Boolean);
      
      if (inviterIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', inviterIds);

        if (profilesError) {
          console.error('Feil ved henting av inviterer-profiler:', profilesError);
        } else if (profiles) {
          // Koble inviterer-profiler til invitasjoner
          return data.map(invitation => ({
            ...invitation,
            inviter: profiles.find(profile => profile.id === invitation.invited_by) || undefined
          }));
        }
      }
    }

    return data || [];
  } catch (error) {
    console.error('Feil ved henting av prosjektinvitasjoner:', error);
    return [];
  }
}

// Kanseller invitasjon
export async function cancelInvitation(invitationId: string): Promise<void> {
  const { error } = await supabase
    .from('project_invitations')
    .delete()
    .eq('id', invitationId)

  if (error) {
    console.error('Feil ved kansellering av invitasjon:', error)
    throw error
  }
}

// Fjern medlem fra prosjekt
export async function removeProjectMember(
  projectId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId)

  if (error) {
    console.error('Feil ved fjerning av prosjektmedlem:', error)
    throw error
  }
}

// Endre rolle for prosjektmedlem
export async function updateProjectMemberRole(
  projectId: string,
  userId: string,
  role: ProjectMember['role']
): Promise<void> {
  // Sjekk at brukeren ikke prøver å endre rollen til en eier
  const { data: members, error: membersError } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .single()

  if (membersError) {
    console.error('Feil ved sjekk av medlemsrolle:', membersError)
    throw membersError
  }

  if (members.role === 'owner' && role !== 'owner') {
    throw new Error('Kan ikke endre rollen til prosjekteieren')
  }

  const { error } = await supabase
    .from('project_members')
    .update({ role })
    .eq('project_id', projectId)
    .eq('user_id', userId)

  if (error) {
    console.error('Feil ved oppdatering av prosjektmedlemsrolle:', error)
    throw error
  }
}

// Funksjon for å manuelt opprette en profil for en eksisterende bruker
export async function createProfileForUser(userId: string): Promise<UserProfile | null> {
  try {
    console.log('Oppretter profil for eksisterende bruker:', userId);
    
    // Hent brukerdata fra session istedenfor admin API
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    
    if (!user) {
      console.error('Ingen aktiv bruker funnet');
      return null;
    }
    
    const email = user.email || '';
    
    // Opprett en standard profil
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          full_name: user.user_metadata?.full_name || '',
          birth_date: user.user_metadata?.birth_date || '2000-01-01',
          company: user.user_metadata?.company || '',
          job_title: user.user_metadata?.job_title || '',
          email: email,
          city: user.user_metadata?.city || '',
          gender: user.user_metadata?.gender || 'male'
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Feil ved oppretting av profil:', error);
      return null;
    }
    
    console.log('Profil opprettet for bruker:', userId);
    return data as UserProfile;
  } catch (error) {
    console.error('Uventet feil ved oppretting av profil:', error);
    return null;
  }
}

// Hent gjeldende sesjon
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Feil ved henting av sesjon:', error);
    return null;
  }
  return data.session;
};

// Last opp prosjektbilde
export async function uploadProjectImage(
  projectId: string,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${projectId}.${fileExt}`;
    const filePath = `${fileName}`;

    // Last opp filen til storage
    const { error: uploadError } = await supabase.storage
      .from('project_images')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Feil ved opplasting av prosjektbilde:', uploadError);
      return { url: null, error: new Error(uploadError.message) };
    }

    // Hent offentlig URL for bildet
    const { data } = supabase.storage
      .from('project_images')
      .getPublicUrl(filePath);

    const imageUrl = data.publicUrl;

    // Oppdater prosjektet med bilde-URL
    const { error: updateError } = await supabase
      .from('projects')
      .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
      .eq('id', projectId);

    if (updateError) {
      console.error('Feil ved oppdatering av prosjekt med bilde-URL:', updateError);
      return { url: null, error: new Error(updateError.message) };
    }

    return { url: imageUrl, error: null };
  } catch (error) {
    console.error('Uventet feil ved opplasting av prosjektbilde:', error);
    return { url: null, error: error as Error };
  }
}

// Slett prosjektbilde
export async function deleteProjectImage(
  projectId: string,
  imageUrl: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Hent filnavnet fra URL-en
    const fileName = imageUrl.split('/').pop();
    
    if (!fileName) {
      return { success: false, error: new Error('Ugyldig bilde-URL') };
    }

    // Slett filen fra storage
    const { error: deleteError } = await supabase.storage
      .from('project_images')
      .remove([fileName]);

    if (deleteError) {
      console.error('Feil ved sletting av prosjektbilde:', deleteError);
      return { success: false, error: new Error(deleteError.message) };
    }

    // Oppdater prosjektet for å fjerne bilde-URL
    const { error: updateError } = await supabase
      .from('projects')
      .update({ image_url: null, updated_at: new Date().toISOString() })
      .eq('id', projectId);

    if (updateError) {
      console.error('Feil ved oppdatering av prosjekt etter bildesletting:', updateError);
      return { success: false, error: new Error(updateError.message) };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Uventet feil ved sletting av prosjektbilde:', error);
    return { success: false, error: error as Error };
  }
}

// Hent et enkelt prosjekt
export async function getProject(projectId: string) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    if (error) {
      console.error('Feil ved henting av prosjekt:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Uventet feil ved henting av prosjekt:', error);
    return { data: null, error: error as Error };
  }
}