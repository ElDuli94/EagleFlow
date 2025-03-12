import { motion } from 'framer-motion'
import { BarChart3, Shield, Users, Calculator } from 'lucide-react'

export default function Features() {
  return (
    <section id="features" className="bg-white py-8 sm:py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Kraftige funksjoner for VVS-prosjektering</h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            EagleFlow gir deg verktøyene du trenger for å prosjektere raskere, smartere og med færre hodepinetabletter.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
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
  )
} 