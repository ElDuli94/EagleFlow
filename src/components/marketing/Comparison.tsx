import { motion } from 'framer-motion'
import { FileSpreadsheet, Frown, Smile, Clock } from 'lucide-react'

export default function Comparison() {
  return (
    <section className="bg-gray-50 py-8 sm:py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Excel vs. EagleFlow</h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            La oss sammenligne den gamle måten med den nye. Spoiler: Det er ikke engang i nærheten.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
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
  )
} 