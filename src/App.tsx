import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, ArrowRight, BarChart3, Shield, Users, FileSpreadsheet, Calculator, Clock, Frown, Smile } from 'lucide-react'
import Pricing from './components/Pricing'
import Contact from './components/Contact'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function AppContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState('home')
  const { user, loading, signOut: authSignOut } = useAuth()

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

  // Håndter utlogging
  const handleSignOut = async () => {
    try {
      await authSignOut()
      setIsMenuOpen(false)
      window.location.hash = '#'
    } catch (error) {
      console.error('Feil ved utlogging:', error)
    }
  }

  // Vis lasteskjerm mens autentisering sjekkes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

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
        {isMenuOpen && (
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
                  onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
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
        )}
      </nav>

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
                  Farvel Excel, <span className="text-primary">hallo</span> fremtiden for VVS-prosjektering
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-lg text-gray-600 mb-8"
                >
                  EagleFlow er den kraftige plattformen som redder VVS-rådgivere fra endeløse Excel-formler, mystiske makroer og spontane krasj rett før deadline.
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
                >
                  <a 
                    href="#register" 
                    onClick={(e) => { e.preventDefault(); window.location.hash = 'register'; }} 
                    className="px-8 py-4 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center"
                  >
                    Redd meg fra Excel <ChevronRight className="ml-2 h-5 w-5" />
                  </a>
                  <a 
                    href="#learn-more" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); 
                    }} 
                    className="px-8 py-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    Vis meg magien <ArrowRight className="ml-2 h-5 w-5" />
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

          {/* Excel vs EagleFlow Section */}
          <section className="bg-gray-50 py-16 md:py-24">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Excel vs. EagleFlow</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Fordi livet er for kort til å tilbringe det i celle A1 til Z9999.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Excel Side */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white rounded-xl shadow-lg p-8 border-2 border-red-200"
                >
                  <div className="flex items-center mb-6">
                    <FileSpreadsheet className="h-10 w-10 text-red-500 mr-4" />
                    <h3 className="text-2xl font-bold text-gray-900">Excel <span className="text-sm font-normal text-gray-500">(Steinaldermåten)</span></h3>
                  </div>
                  
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <Frown className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-600">Tilbringer timer på å lage formler som bare du forstår (og som du garantert har glemt neste uke)</p>
                    </li>
                    <li className="flex items-start">
                      <Frown className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-600">Krasjer mystisk rett før du skal levere prosjektet</p>
                    </li>
                    <li className="flex items-start">
                      <Frown className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-600">Filen blir så stor at den får din PC til å høres ut som et jetfly</p>
                    </li>
                    <li className="flex items-start">
                      <Frown className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-600">Kollegaer som "låner" formler og ødelegger alt</p>
                    </li>
                    <li className="flex items-start">
                      <Frown className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-600">Versjonskontroll? Hva er det? Excel_final_FINAL_v2_BRUK_DENNE.xlsx</p>
                    </li>
                    <li className="flex items-start">
                      <Clock className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-600">Prosjekteringstid: <span className="font-bold">Uendelig</span> (pluss overtid)</p>
                    </li>
                  </ul>
                  
                  <div className="mt-8 p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600 italic">
                      "Jeg elsker å bruke 80% av arbeidsdagen min på å fikse ødelagte Excel-formler" - sa ingen VVS-rådgiver noensinne
                    </p>
                  </div>
                </motion.div>
                
                {/* EagleFlow Side */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white rounded-xl shadow-lg p-8 border-2 border-primary"
                >
                  <div className="flex items-center mb-6">
                    <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-4">EF</div>
                    <h3 className="text-2xl font-bold text-gray-900">EagleFlow <span className="text-sm font-normal text-gray-500">(Fremtiden er her)</span></h3>
                  </div>
                  
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <Smile className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-600">Automatiserte beregninger som faktisk fungerer hver gang</p>
                    </li>
                    <li className="flex items-start">
                      <Smile className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-600">Aldri mer "Formelfeil" eller "Referansefeil" meldinger</p>
                    </li>
                    <li className="flex items-start">
                      <Smile className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-600">Skybasert - jobber like bra på din 10 år gamle laptop som på en supermaskin</p>
                    </li>
                    <li className="flex items-start">
                      <Smile className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-600">Samarbeid i sanntid uten å ødelegge hverandres arbeid</p>
                    </li>
                    <li className="flex items-start">
                      <Smile className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-600">Automatisk versjonskontroll - aldri mer "hvilken fil er den nyeste?"</p>
                    </li>
                    <li className="flex items-start">
                      <Clock className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-600">Prosjekteringstid: <span className="font-bold">Redusert med 70%</span> (hello fritid!)</p>
                    </li>
                  </ul>
                  
                  <div className="mt-8 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 italic">
                      "Jeg trodde aldri jeg skulle få tid til å ta lunsj igjen, helt til jeg begynte å bruke EagleFlow" - Lykkelig VVS-rådgiver
                    </p>
                  </div>
                </motion.div>
              </div>
              
              <div className="text-center mt-12">
                <a 
                  href="#register" 
                  onClick={(e) => { e.preventDefault(); window.location.hash = 'register'; }} 
                  className="inline-block px-8 py-4 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Jeg vil også ha lunsj igjen!
                </a>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="bg-white py-16 md:py-24">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Kraftige funksjoner for VVS-prosjektering</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  EagleFlow gir deg verktøyene du trenger for å prosjektere raskere, smartere og med færre hodepinetabletter.
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
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Smarte beregninger</h3>
                  <p className="text-gray-600">
                    Automatiserte beregninger for rør, ventilasjon og varme som faktisk forstår fysikkens lover.
                  </p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -10 }}
                  className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="w-14 h-14 bg-secondary/10 rounded-lg flex items-center justify-center mb-6">
                    <Calculator className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Dimensjonering</h3>
                  <p className="text-gray-600">
                    Automatisk dimensjonering av systemer som tar hensyn til alle faktorer, ikke bare de du husker.
                  </p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -10 }}
                  className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Feilsikring</h3>
                  <p className="text-gray-600">
                    Intelligent feilsjekking som fanger opp problemer før bygget flommer over.
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
                    Jobber sømløst med arkitekter og andre ingeniører, uten å måtte sende 50MB Excel-filer.
                  </p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Testimonial Section */}
          <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row items-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mb-6 md:mb-0 md:mr-8 flex-shrink-0"></div>
                    <div>
                      <p className="text-xl text-gray-600 italic mb-6">
                        "Før EagleFlow brukte jeg 80% av tiden min på å fikse Excel-formler og 20% på faktisk prosjektering. Nå er det omvendt. Pluss at jeg faktisk kan ta helgefri uten å ha mareritt om ødelagte cellereferanser."
                      </p>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">Ola Rørlegger</h4>
                        <p className="text-gray-500">Senior VVS-rådgiver, Tidligere Excel-slave</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-primary py-16">
            <div className="container mx-auto px-6 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Klar til å pensjonere Excel-arket ditt?</h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Bli med hundrevis av VVS-rådgivere som har byttet ut endeløse formler med EagleFlow og fått livet tilbake.
              </p>
              <a 
                href="#register" 
                onClick={(e) => { e.preventDefault(); window.location.hash = 'register'; }} 
                className="inline-block px-8 py-4 bg-white text-primary font-medium rounded-md hover:bg-gray-100 transition-colors"
              >
                Kom i gang gratis
              </a>
              <p className="text-sm text-white/60 mt-4">
                Ingen Excel-kunnskaper nødvendig. Faktisk, jo mindre du kan om Excel, jo bedre.
              </p>
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
            <p className="text-gray-400">© 2023 EagleFlow. Alle rettigheter reservert. Ingen Excel-ark ble skadet under utviklingen av denne nettsiden.</p>
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
