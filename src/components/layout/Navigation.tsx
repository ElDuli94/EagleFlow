import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import MobileMenu from '../../components/layout/MobileMenu'

interface NavigationProps {
  isMenuOpen: boolean
  setIsMenuOpen: (isOpen: boolean) => void
}

export default function Navigation({ isMenuOpen, setIsMenuOpen }: NavigationProps) {
  const { user, signOut: authSignOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await authSignOut()
      setIsMenuOpen(false)
      window.location.hash = '#'
    } catch (error) {
      console.error('Feil ved utlogging:', error)
    }
  }

  return (
    <nav className="container mx-auto px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <a 
            href="#" 
            onClick={(e) => { 
              e.preventDefault()
              window.location.hash = user ? 'dashboard' : ''
            }} 
            className="text-xl sm:text-2xl font-bold text-primary"
          >
            Eagle<span className="text-secondary">Flow</span>
          </a>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {!user && (
            <>
              <a href="#features" className="text-gray-600 hover:text-primary transition-colors">Funksjoner</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary transition-colors">Priser</a>
            </>
          )}
          <a href="#contact" className="text-gray-600 hover:text-primary transition-colors">Kontakt</a>
          
          {user ? (
            <>
              <a 
                href="#dashboard" 
                onClick={(e) => { e.preventDefault(); window.location.hash = 'dashboard'; }} 
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Dashboard
              </a>
              <button 
                onClick={handleSignOut}
                className="px-4 py-2 text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
              >
                Logg ut
              </button>
            </>
          ) : (
            <>
              <a href="#login" onClick={(e) => { e.preventDefault(); window.location.hash = 'login'; }} className="px-4 py-2 text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors">Logg inn</a>
              <a href="#register" onClick={(e) => { e.preventDefault(); window.location.hash = 'register'; }} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">Registrer deg</a>
            </>
          )}
        </div>
        
        {/* Mobile Navigation Toggle */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-600 focus:outline-none"
          >
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path fillRule="evenodd" clipRule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z" />
              ) : (
                <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && <MobileMenu user={user} onSignOut={handleSignOut} setIsMenuOpen={setIsMenuOpen} />}
    </nav>
  )
} 