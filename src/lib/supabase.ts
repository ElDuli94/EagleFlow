import { createClient } from '@supabase/supabase-js'

// Disse verdiene bør komme fra miljøvariabler i en produksjonsapp
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Brukertype basert på Supabase Auth og profiltabell
export type UserProfile = {
  id: string
  full_name: string
  birth_date: string
  company: string
  job_title: string
  email: string
  city: string
  avatar_url: string | null
  gender: 'male' | 'female'
  created_at: string
}

// Autentiseringsfunksjoner
export async function signUp(
  email: string, 
  password: string, 
  userData: Omit<UserProfile, 'id' | 'created_at' | 'avatar_url'>
) {
  // 1. Sjekk først om brukeren allerede eksisterer
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('email')
    .eq('email', email)
    .single()

  if (existingUser) {
    throw new Error('En bruker med denne e-postadressen eksisterer allerede')
  }

  // 2. Opprett bruker i Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError || !authData.user) {
    throw authError || new Error('Kunne ikke opprette bruker')
  }

  // 3. Opprett brukerprofil i profiles-tabellen
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      full_name: userData.full_name,
      birth_date: userData.birth_date,
      company: userData.company,
      job_title: userData.job_title,
      email: userData.email,
      city: userData.city,
      gender: userData.gender,
      avatar_url: null
    })

  if (profileError) {
    // Hvis profil-opprettelsen feiler, prøv å slette auth-brukeren
    await supabase.auth.admin.deleteUser(authData.user.id)
    if (profileError.code === '23505') {
      throw new Error('En bruker med denne e-postadressen eksisterer allerede')
    }
    throw profileError
  }

  return authData
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
}

export async function uploadAvatar(userId: string, file: File) {
  // 1. Last opp fil til storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Math.random()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file)

  if (uploadError) {
    throw uploadError
  }

  // 2. Få offentlig URL
  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
  
  // 3. Oppdater brukerprofil med avatar URL
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: data.publicUrl })
    .eq('id', userId)

  if (updateError) {
    throw updateError
  }

  return data.publicUrl
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Feil ved henting av profil:', error)
    return null
  }

  return data as UserProfile
} 