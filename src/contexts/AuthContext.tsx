import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase, getProfile, signOut as supabaseSignOut, createProfileForUser } from '../lib/supabase'
import { UserProfile } from '../types'

type AuthContextType = {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Funksjon for å hente eller opprette profil
  const fetchOrCreateProfile = async (userId: string) => {
    try {
      // Prøv å hente profilen
      let userProfile = await getProfile(userId);
      
      // Hvis profilen ikke finnes, opprett en ny
      if (!userProfile) {
        console.log('Profil ikke funnet, oppretter ny profil for bruker:', userId);
        userProfile = await createProfileForUser(userId);
      }
      
      console.log('Profil oppdatert:', userProfile);
      setProfile(userProfile);
    } catch (error) {
      console.error('Feil ved henting/oppretting av profil:', error);
    }
  };

  useEffect(() => {
    // Sjekk om det finnes en lagret sesjon
    const savedSession = localStorage.getItem('sb-session')
    if (savedSession) {
      const parsedSession = JSON.parse(savedSession)
      supabase.auth.setSession(parsedSession)
    }

    // Hent gjeldende sesjon
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        fetchOrCreateProfile(session.user.id);
      }
      
      setLoading(false)
    })

    // Lytt til auth-endringer
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchOrCreateProfile(session.user.id);
        } else {
          setProfile(null)
          // Fjern lagret sesjon ved utlogging
          localStorage.removeItem('sb-session')
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    session,
    user,
    profile,
    loading,
    signOut: async () => {
      await supabaseSignOut()
      setProfile(null)
    }
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth må brukes innenfor en AuthProvider')
  }
  return context
} 