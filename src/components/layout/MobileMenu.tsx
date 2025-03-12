import { User } from '@supabase/supabase-js'

interface MobileMenuProps {
  user: User | null
  onSignOut: () => void
  setIsMenuOpen: (isOpen: boolean) => void
}

export default function MobileMenu({ user, onSignOut, setIsMenuOpen }: MobileMenuProps) {
  return (
    <div className="md:hidden mt-4 bg-white rounded-lg shadow-lg p-4">
      {!user && (
        <>
          <a href="#features" className="block py-2 text-gray-600 hover:text-primary">Funksjoner</a>
          <a href="#pricing" onClick={(e) => { e.preventDefault(); window.location.hash = 'pricing'; setIsMenuOpen(false); }} className="block py-2 text-gray-600 hover:text-primary">Priser</a>
        </>
      )}
      <a href="#contact" onClick={(e) => { e.preventDefault(); window.location.hash = 'contact'; setIsMenuOpen(false); }} className="block py-2 text-gray-600 hover:text-primary">Kontakt</a>
      
      {user ? (
        <>
          <a 
            href="#dashboard" 
            onClick={(e) => { e.preventDefault(); window.location.hash = 'dashboard'; setIsMenuOpen(false); }} 
            className="block py-2 text-gray-600 hover:text-primary"
          >
            Dashboard
          </a>
          <button 
            onClick={() => { onSignOut(); setIsMenuOpen(false); }}
            className="block w-full text-left py-2 text-primary"
          >
            Logg ut
          </button>
        </>
      ) : (
        <>
          <a href="#login" onClick={(e) => { e.preventDefault(); window.location.hash = 'login'; setIsMenuOpen(false); }} className="block py-2 text-primary">Logg inn</a>
          <a href="#register" onClick={(e) => { e.preventDefault(); window.location.hash = 'register'; setIsMenuOpen(false); }} className="block py-2 mt-2 bg-primary text-white rounded-md px-4">Registrer deg</a>
        </>
      )}
    </div>
  )
} 