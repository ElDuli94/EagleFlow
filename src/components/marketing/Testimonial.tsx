export default function Testimonial() {
  return (
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
  )
} 