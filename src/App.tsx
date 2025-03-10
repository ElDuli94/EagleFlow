import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, ArrowRight, BarChart3, Zap, Shield, Users } from 'lucide-react'
import Pricing from './components/Pricing'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState('home')

  // Enkel ruting basert på hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash === 'pricing') {
        setCurrentPage('pricing')
      } else {
        setCurrentPage('home')
      }
    }

    // Sjekk hash ved oppstart
    handleHashChange()

    // Lytt til hash-endringer
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <a href="#" className="text-2xl font-bold text-primary">
              Eagle<span className="text-secondary">Flow</span>
            </a>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-primary transition-colors">Funksjoner</a>
            <a href="#pricing" className="text-gray-600 hover:text-primary transition-colors">Priser</a>
            <a href="#contact" className="text-gray-600 hover:text-primary transition-colors">Kontakt</a>
            <a href="#login" className="px-4 py-2 text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors">Logg inn</a>
            <a href="#signup" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">Registrer deg</a>
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
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-lg shadow-lg p-4">
            <a href="#features" className="block py-2 text-gray-600 hover:text-primary">Funksjoner</a>
            <a href="#pricing" className="block py-2 text-gray-600 hover:text-primary">Priser</a>
            <a href="#contact" className="block py-2 text-gray-600 hover:text-primary">Kontakt</a>
            <a href="#login" className="block py-2 text-primary">Logg inn</a>
            <a href="#signup" className="block py-2 mt-2 bg-primary text-white rounded-md px-4">Registrer deg</a>
          </div>
        )}
      </nav>

      {/* Main Content */}
      {currentPage === 'pricing' ? (
        <Pricing />
      ) : (
        <>
          {/* Hero Section */}
          <section className="container mx-auto px-6 py-16 md:py-24">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-12 md:mb-0">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 mb-6"
                >
                  Strømlinjeform din <span className="text-primary">arbeidsflyt</span> med EagleFlow
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-lg text-gray-600 mb-8"
                >
                  EagleFlow er en kraftig plattform som hjelper team med å organisere, automatisere og optimalisere arbeidsprosesser for maksimal effektivitet.
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
                >
                  <a href="#signup" className="px-8 py-4 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center">
                    Registrer deg i dag <ChevronRight className="ml-2 h-5 w-5" />
                  </a>
                  <a href="#learn-more" className="px-8 py-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center">
                    Lær mer <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </motion.div>
              </div>
              <div className="md:w-1/2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="relative"
                >
                  <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                    <div className="bg-primary p-4">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">EagleFlow Dashboard</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-secondary rounded-full opacity-50"></div>
                  <div className="absolute -top-6 -left-6 w-16 h-16 bg-primary rounded-full opacity-30"></div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="bg-white py-16 md:py-24">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Kraftige funksjoner</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  EagleFlow gir deg verktøyene du trenger for å effektivisere arbeidsflyten og øke produktiviteten.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <motion.div 
                  whileHover={{ y: -10 }}
                  className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                    <BarChart3 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Avansert analyse</h3>
                  <p className="text-gray-600">
                    Få innsikt i teamets ytelse med detaljerte rapporter og dashboards.
                  </p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -10 }}
                  className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="w-14 h-14 bg-secondary/10 rounded-lg flex items-center justify-center mb-6">
                    <Zap className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Automatisering</h3>
                  <p className="text-gray-600">
                    Automatiser repetitive oppgaver og frigjør tid til mer verdifullt arbeid.
                  </p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -10 }}
                  className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Sikkerhet</h3>
                  <p className="text-gray-600">
                    Beskytt sensitive data med avanserte sikkerhetsfunksjoner og tilgangskontroll.
                  </p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -10 }}
                  className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="w-14 h-14 bg-secondary/10 rounded-lg flex items-center justify-center mb-6">
                    <Users className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Samarbeid</h3>
                  <p className="text-gray-600">
                    Samarbeid sømløst med teamet ditt, uansett hvor de befinner seg.
                  </p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-primary py-16">
            <div className="container mx-auto px-6 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Klar til å forbedre arbeidsflyten din?</h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Bli med tusenvis av team som allerede bruker EagleFlow for å optimalisere sine arbeidsprosesser.
              </p>
              <a href="#signup" className="inline-block px-8 py-4 bg-white text-primary font-medium rounded-md hover:bg-gray-100 transition-colors">
                Kom i gang gratis
              </a>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex justify-center mb-8">
            <span className="text-2xl font-bold text-white">
              Eagle<span className="text-secondary">Flow</span>
            </span>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-row justify-between items-center">
            <p className="text-gray-400">© 2023 EagleFlow. Alle rettigheter reservert.</p>
            <a href="#linkedin" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
