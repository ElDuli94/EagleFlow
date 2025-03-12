export default function CTA() {
  return (
    <section className="bg-primary py-8 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">Klar til å pensjonere Excel-arket ditt?</h2>
        <p className="text-base sm:text-lg text-white/80 mb-6 sm:mb-8 max-w-2xl mx-auto">
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
  )
} 