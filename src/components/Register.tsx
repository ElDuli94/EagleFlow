import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RegisterFormValues, registerSchema } from '../lib/validations'
import { signUp, uploadAvatar } from '../lib/supabase'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const Register = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const { user } = useAuth()
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  })

  // Omdiriger til dashboard hvis brukeren allerede er logget inn
  useEffect(() => {
    if (user) {
      window.location.hash = 'dashboard'
    }
  }, [user])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)
      
      // Vis forhåndsvisning av bildet
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Konverter data til formatet som Supabase forventer
      const authData = await signUp(data.email, data.password, {
        full_name: data.fullName,
        birth_date: data.birthDate,
        company: data.company,
        job_title: data.jobTitle,
        email: data.email,
        city: data.city,
        gender: data.gender
      })
      
      // Last opp avatar hvis tilgjengelig
      if (avatarFile && authData.user) {
        try {
          await uploadAvatar(authData.user.id, avatarFile)
        } catch (error) {
          console.error('Feil ved opplasting av avatar:', error)
          // Fortsett selv om avatar-opplasting feiler
        }
      }
      
      // Registrering vellykket
      setSuccess(true)
    } catch (error: any) {
      console.error('Registreringsfeil:', error)
      setError(error.message || 'Det oppstod en feil under registrering. Vennligst prøv igjen.')
    } finally {
      setIsLoading(false)
    }
  }

  // Hvis brukeren allerede er logget inn, vis ingenting (omdirigering håndteres av useEffect)
  if (user && !success) {
    return null
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registrering vellykket!</h2>
            <p className="text-gray-600 mb-6">
              Takk for at du registrerte deg hos EagleFlow. Sjekk e-posten din for å bekrefte kontoen din.
            </p>
            <a
              href="#login"
              className="inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
            >
              Gå til innlogging
            </a>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-extrabold text-gray-900"
          >
            Opprett en ny konto
          </motion.h2>
          <p className="mt-2 text-sm text-gray-600">
            Eller{' '}
            <a href="#login" className="font-medium text-primary hover:text-primary-dark">
              logg inn på din eksisterende konto
            </a>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="bg-white shadow-lg rounded-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personlig informasjon - Venstre kolonne */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Personlig informasjon</h3>
                
                {/* Profilbilde */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profilbilde (valgfritt)
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <label htmlFor="avatar" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                        Velg bilde
                      </label>
                      <input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="sr-only"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG, GIF opptil 10MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fullt navn */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Fullt navn*
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    {...register('fullName')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Fødselsdato */}
                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Fødselsdato*
                  </label>
                  <input
                    id="birthDate"
                    type="date"
                    {...register('birthDate')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                  {errors.birthDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>
                  )}
                </div>

                {/* Kjønn */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kjønn*
                  </label>
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <input
                        id="male"
                        type="radio"
                        value="male"
                        {...register('gender')}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <label htmlFor="male" className="ml-2 block text-sm text-gray-700">
                        Mann
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="female"
                        type="radio"
                        value="female"
                        {...register('gender')}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <label htmlFor="female" className="ml-2 block text-sm text-gray-700">
                        Kvinne
                      </label>
                    </div>
                  </div>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                  )}
                </div>

                {/* By */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    By*
                  </label>
                  <input
                    id="city"
                    type="text"
                    {...register('city')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                  )}
                </div>
              </div>

              {/* Jobb og konto - Høyre kolonne */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Jobb og kontoinformasjon</h3>
                
                {/* E-post */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-post*
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="din@epost.no"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Firma */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Firma*
                  </label>
                  <input
                    id="company"
                    type="text"
                    {...register('company')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                  {errors.company && (
                    <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
                  )}
                </div>

                {/* Stillingstittel */}
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Stillingstittel*
                  </label>
                  <input
                    id="jobTitle"
                    type="text"
                    {...register('jobTitle')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                  {errors.jobTitle && (
                    <p className="mt-1 text-sm text-red-600">{errors.jobTitle.message}</p>
                  )}
                </div>

                {/* Passord */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Passord*
                  </label>
                  <input
                    id="password"
                    type="password"
                    {...register('password')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                {/* Bekreft passord */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Bekreft passord*
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  Jeg godtar <a href="#terms" className="text-primary hover:text-primary-dark">vilkårene</a> og <a href="#privacy" className="text-primary hover:text-primary-dark">personvernerklæringen</a>
                </label>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isLoading ? 'bg-primary-light cursor-not-allowed' : 'bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registrerer...
                    </>
                  ) : (
                    'Registrer deg'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register 