import { motion } from 'framer-motion'
import { Check, X, Diamond, Crown, Star, CreditCard, Gift } from 'lucide-react'

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
          >
            Våre <span className="text-primary italic">*host*</span> "Rimelige" Priser
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Vi har laget en prisstrategi som garantert vil få økonomisjefen din til å gråte... av glede? <span className="line-through">Eller noe sånt.</span>
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 inline-block bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium"
          >
            <span className="animate-pulse inline-block mr-2">🔥</span> 
            HELT GRATIS! Men ikke fortell det til sjefen din...
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Basic Plan */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 transform transition-transform hover:scale-105"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Økonomisk Ruin</h3>
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">3 Kameler</span>
                <span className="text-gray-600 ml-2">/måned</span>
                <p className="text-sm text-gray-500 mt-2">Eller din førstefødte. Vi er fleksible.</p>
              </div>
              <p className="text-gray-600 mb-8">Perfekt for de som har for mange kameler og for lite fornuft.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600">Tilgang til EagleFlow</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600">Ubegrenset lagring (2MB)</span>
                </li>
                <li className="flex items-center">
                  <X className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-gray-400">Teknisk støtte (vi leser e-postene)</span>
                </li>
                <li className="flex items-center">
                  <X className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-gray-400">Prioritert behandling</span>
                </li>
              </ul>
              <button 
                onClick={(e) => { e.preventDefault(); window.location.hash = 'register'; }}
                className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
              >
                Velg plan (ikke gjør det)
              </button>
            </div>
            <div className="bg-gray-50 px-8 py-4">
              <p className="text-xs text-gray-500">* Alle priser er oppgitt i kameler. Vi aksepterer alle raser, men foretrekker Dromedar. Kameler må være i god helse og under 10 år gamle.</p>
            </div>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-primary transform transition-transform hover:scale-105 relative z-10 md:-mt-4 md:-mb-4"
          >
            <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 rounded-bl-lg font-medium text-sm">
              MEST POPULÆR
            </div>
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Konkursbeskyttelse</h3>
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">7 Kameler</span>
                <span className="text-gray-600 ml-2">/måned</span>
                <p className="text-sm text-gray-500 mt-2">Eller en liten oase i Sahara.</p>
              </div>
              <p className="text-gray-600 mb-8">For de som har en kamelflokk og vil bli kvitt noen av dem.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600">Alt i Økonomisk Ruin</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600">Ubegrenset lagring (5MB)</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600">Teknisk støtte (vi svarer faktisk)</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600">En sekk kamelhår (perfekt for vintergensere)</span>
                </li>
              </ul>
              <button 
                onClick={(e) => { e.preventDefault(); window.location.hash = 'register'; }}
                className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
              >
                Velg plan (virkelig, ikke gjør det)
              </button>
            </div>
            <div className="bg-blue-50 px-8 py-4">
              <p className="text-xs text-gray-500">* Inkluderer en personlig unnskyldning fra vår CEO for å ta så mange av dine verdifulle kameler.</p>
            </div>
          </motion.div>

          {/* Enterprise Plan */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 transform transition-transform hover:scale-105"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Galaktisk Luksus</h3>
                <Diamond className="h-6 w-6 text-purple-500" />
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">42 Kameler</span>
                <span className="text-gray-600 ml-2">/måned</span>
                <p className="text-sm text-gray-500 mt-2">Eller din sjel. Vi foretrekker kamelene.</p>
              </div>
              <p className="text-gray-600 mb-8">For de som eier en kamelkaravane og et lite ørkenkongedømme.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600">Alt i Konkursbeskyttelse</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600">Ubegrenset lagring (10MB)</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600">Vi sender deg et postkort med en kamel</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600">Vår CEO vasker bilen din med kamelmjølk*</span>
                </li>
              </ul>
              <button 
                onClick={(e) => { e.preventDefault(); window.location.hash = 'register'; }}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Velg plan (vær så snill, ikke)
              </button>
            </div>
            <div className="bg-purple-50 px-8 py-4">
              <p className="text-xs text-gray-500">* Bilvask gjelder kun for Tesla-modeller. CEO-en vår er en Tesla-fan og nekter å sløse kamelmjølk på andre biler.</p>
            </div>
          </motion.div>
        </div>

        {/* Free Plan Banner */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto"
        >
          <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Psst! Det er faktisk helt gratis!</h3>
              <p className="text-white/80">
                Alle funksjonene. Ingen kredittkort. Ingen kameler. Behold alle kamelene dine. Bare ikke fortell det til de andre.
              </p>
            </div>
            <div className="flex-shrink-0">
              <button 
                onClick={(e) => { e.preventDefault(); window.location.hash = 'register'; }}
                className="py-3 px-6 bg-white text-emerald-600 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center"
              >
                <Gift className="h-5 w-5 mr-2" />
                Få tilgang nå
              </button>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Ofte stilte spørsmål (eller ting vi fant på)</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hvorfor er prisene i kameler?</h3>
              <p className="text-gray-600">Fordi kameler er tidløse. Valutaer kommer og går, men en god kamel varer evig. Dessuten er vår økonomidirektør tidligere kamelhandler og insisterer på at dette er fremtidens betalingsmiddel.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.8 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hva gjør dere med alle kamelene?</h3>
              <p className="text-gray-600">Vi har en bedriftsoase hvor kamelene lever lykkelige liv. De får rikelig med vann, mat og WiFi. Noen av dem jobber faktisk i kundeservice. De er overraskende gode til å svare på e-post med hovene sine.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.9 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Kan jeg virkelig få CEO-en til å vaske bilen min med kamelmjølk?</h3>
              <p className="text-gray-600">Hvis du faktisk betaler 42 kameler per måned, vil vår CEO ikke bare vaske bilen din med kamelmjølk, men også synge "Kamelkaravanen" mens han gjør det. Men igjen, vennligst ikke prøv dette. Kamelene trenger deg.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 1.0 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Er det virkelig gratis?</h3>
              <p className="text-gray-600">Ja! EagleFlow er 100% gratis å bruke. Ingen kameler nødvendig. Vi finansierer dette gjennom... vel, vi har egentlig ikke tenkt så langt ennå. Men det er definitivt gratis, og ingen kameler blir skadet i prosessen!</p>
            </motion.div>
          </div>
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="text-center mt-20"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Fortsatt ikke overbevist?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Vi forstår. Det er vanskelig å tro at noe så bra kan være gratis. Men det er det. Virkelig. Ingen kameler nødvendig. Behold alle dine kameler.
          </p>
          <a 
            href="#register" 
            onClick={(e) => { e.preventDefault(); window.location.hash = 'register'; }}
            className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors font-medium"
          >
            <CreditCard className="mr-2 h-5 w-5" />
            <span>Registrer deg (100% gratis)</span>
          </a>
          <p className="text-sm text-gray-500 mt-4">Ingen kredittkort nødvendig. Ingen kameler. Ingen forpliktelser. #ReddKamelene</p>
        </motion.div>
      </div>
    </div>
  )
}

export default Pricing 