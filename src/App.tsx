import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navigation from './components/layout/Navigation'
import Hero from './components/marketing/Hero'
import Pricing from './components/Pricing'
import Contact from './components/Contact'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import ProjectDashboard from './components/ProjectDashboard'

function AppContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState('home')
  const { user, loading } = useAuth()
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  // Enkel ruting basert på hash
  useEffect(() => {
    const handleHashChange = () => {
      // Få hash fra URL
      const hash = window.location.hash.replace('#', '');
      
      // Håndter forskjellige ruter
      if (hash === 'pricing') {
        setCurrentPage('pricing');
      } else if (hash === 'contact') {
        setCurrentPage('contact');
      } else if (hash === 'login') {
        setCurrentPage('login');
      } else if (hash === 'register') {
        setCurrentPage('register');
      } else if (hash === 'dashboard') {
        setCurrentPage('dashboard');
      } else if (hash.startsWith('project/')) {
        const projectId = hash.replace('project/', '');
        setCurrentPage('project');
        setSelectedProjectId(projectId || null);
      } else {
        setCurrentPage('home');
      }
      
      // Scroll til toppen av siden
      window.scrollTo(0, 0);
    }

    // Sjekk hash ved oppstart
    handleHashChange()

    // Lytt til hash-endringer
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Omdiriger til dashboard hvis brukeren er logget inn
  useEffect(() => {
    if (user && (currentPage === 'login' || currentPage === 'register' || currentPage === 'home')) {
      window.location.hash = 'dashboard'
    }
  }, [user, currentPage])

  // Vis lasteskjerm mens autentisering sjekkes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Sjekk om vi skal vise navigasjon
  const isDashboard = currentPage === 'dashboard'

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation - skjul på dashboard */}
      {!isDashboard && <Navigation isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />}

      {/* Main Content */}
      {currentPage === 'login' ? (
        <Login />
      ) : currentPage === 'register' ? (
        <Register />
      ) : currentPage === 'pricing' ? (
        <Pricing />
      ) : currentPage === 'contact' ? (
        <Contact />
      ) : currentPage === 'dashboard' ? (
        <Dashboard />
      ) : currentPage === 'project' ? (
        <ProjectDashboard projectId={selectedProjectId} />
      ) : (
        <Hero />
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
