import { motion } from 'framer-motion'
import { ChevronRight, ArrowRight } from 'lucide-react'
import Features from './Features'
import Comparison from './Comparison'
import Testimonial from './Testimonial'
import CTA from './CTA'

export default function Hero() {
  return (
    <>
      <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 mb-4 sm:mb-6"
            >
              Farvel Excel, <span className="text-primary">hallo</span> fremtiden for VVS-prosjektering
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-gray-600 mb-8"
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

      <Comparison />
      <Features />
      <Testimonial />
      <CTA />
    </>
  )
} 