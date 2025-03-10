import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Coffee, Clock, AlertTriangle, Send } from 'lucide-react'
import { useState } from 'react'

const Contact = () => {
  const [messageStatus, setMessageStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    kamelCount: '0'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setMessageStatus('sending')
    
    // Simuler sending av melding
    setTimeout(() => {
      setMessageStatus('sent')
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        kamelCount: '0'
      })
    }, 1500)
  }

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
            Kontakt Oss <span className="text-primary">(Hvis Du Tør)</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Vi lover å svare på alle henvendelser innen 3-5 virkedager. Eller måneder. Avhengig av hvor mange kopper kaffe vi har igjen.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Hvor Du Kan Finne Oss</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full mr-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">E-post</h3>
                  <p className="text-gray-600 mt-1">kontakt@eagleflow.no</p>
                  <p className="text-gray-500 text-sm mt-1">Vi sjekker e-post hver gang månen er full.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full mr-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Telefon</h3>
                  <p className="text-gray-600 mt-1">+47 123 45 678</p>
                  <p className="text-gray-500 text-sm mt-1">Vår telefonsvarer er en ekte person som later som om de er en telefonsvarer.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full mr-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Adresse</h3>
                  <p className="text-gray-600 mt-1">Kamelveien 42, 0123 Ørkenen</p>
                  <p className="text-gray-500 text-sm mt-1">Følg lyden av hysterisk latter og lukten av brent kaffe.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full mr-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Åpningstider</h3>
                  <p className="text-gray-600 mt-1">Man-Fre: 10:00 - 16:00*</p>
                  <p className="text-gray-500 text-sm mt-1">*Eller når vi føler for det. Vi er ganske fleksible.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full mr-4">
                  <Coffee className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Kaffe-status</h3>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full w-[35%]"></div>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">Kritisk lavt nivå. Svar kan ta lengre tid enn normalt.</p>
                </div>
              </div>
            </div>

            <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Viktig merknad</h3>
                  <p className="text-gray-600 mt-1">
                    Vi aksepterer ikke kameler som betaling for våre tjenester, til tross for det prisene antyder. 
                    Vennligst ikke send kameler til vårt kontor. Vi har allerede 17 kameler og begrenset plass.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Oss En Melding</h2>
            
            {messageStatus === 'sent' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Melding Sendt!</h3>
                <p className="text-gray-600">
                  Takk for din henvendelse! Vi har mottatt meldingen din og vil svare så snart vi har fylt opp kaffebeholdningen.
                </p>
                <button 
                  onClick={() => setMessageStatus('idle')}
                  className="mt-6 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Send en ny melding
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Ditt navn*</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ola Nordmann"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Din e-post*</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="ola.nordmann@eksempel.no"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Emne*</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Jeg elsker EagleFlow!"
                  />
                </div>
                
                <div>
                  <label htmlFor="kamelCount" className="block text-sm font-medium text-gray-700 mb-1">Antall kameler du eier</label>
                  <select
                    id="kamelCount"
                    name="kamelCount"
                    value={formData.kamelCount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="0">Ingen kameler (dessverre)</option>
                    <option value="1-3">1-3 kameler (nybegynner)</option>
                    <option value="4-10">4-10 kameler (entusiast)</option>
                    <option value="11-42">11-42 kameler (profesjonell)</option>
                    <option value="43+">43+ kameler (kamelkonge)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Dette påvirker ikke vår responstid. Vi er bare nysgjerrige.</p>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Din melding*</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Skriv din melding her... Vær snill, ingen kamelrelaterte vitser. Vi har hørt dem alle."
                  ></textarea>
                </div>
                
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1 mr-2"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    Jeg bekrefter at jeg ikke vil sende kameler til EagleFlow-kontoret, uansett hvor fristende det måtte være.*
                  </label>
                </div>
                
                <button
                  type="submit"
                  disabled={messageStatus === 'sending'}
                  className={`w-full py-3 px-4 ${
                    messageStatus === 'sending' 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-primary hover:bg-primary-dark'
                  } text-white rounded-md transition-colors flex items-center justify-center`}
                >
                  {messageStatus === 'sending' ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sender...
                    </>
                  ) : (
                    'Send melding'
                  )}
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-4">
                  * Påkrevde felt. Vi lover å ikke selge din informasjon til kamelhandlere.
                </p>
              </form>
            )}
          </motion.div>
        </div>

        {/* FAQ */}
        <div className="mt-24">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">Ofte Stilte Spørsmål Om Kontakt</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hvor raskt svarer dere på henvendelser?</h3>
              <p className="text-gray-600">Det avhenger av flere faktorer: kaffenivået i kontoret, antall kameler i nærheten, og om det er fredag. Vanligvis svarer vi innen 1-3 virkedager, men hvis du hører lyden av kameler i bakgrunnen når du ringer, kan det ta litt lengre tid.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Kan jeg besøke kontoret deres?</h3>
              <p className="text-gray-600">Absolutt! Vi elsker besøk. Men vær oppmerksom på at vårt kontor er lokalisert i en hemmelig oase som bare kan nås ved å løse tre gåter og ri på en kamel i nøyaktig 42 minutter mot solnedgangen. Eller du kan bare bruke Google Maps. Det fungerer også.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hvorfor spør dere om antall kameler jeg eier?</h3>
              <p className="text-gray-600">Vår CEO har en teori om at det er en direkte korrelasjon mellom kameleierskapet og produktiviteten. Så langt har dataene vært... inkonklusive. Men vi fortsetter å spørre fordi det er morsomt å se folks reaksjoner.</p>
            </motion.div>
          </div>
        </div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-20 max-w-6xl mx-auto rounded-xl overflow-hidden shadow-lg"
        >
          <div className="bg-gray-200 h-96 flex items-center justify-center">
            <div className="text-center p-8">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Her skulle det vært et kart</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Men vi er redde for at hvis vi viser vår nøyaktige lokasjon, vil folk begynne å sende kameler. 
                Og vi har virkelig ikke plass til flere kameler.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Contact 