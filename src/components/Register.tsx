import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RegisterFormValues, registerSchema } from '../lib/validations'
import { signUp, uploadAvatar } from '../lib/supabase'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { User, Camera, Building2, Briefcase, Mail, Lock, MapPin, Calendar } from 'lucide-react'

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
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Registrerer bruker med data:', { ...data, password: '[SKJULT]' });
      
      // Sikre at fødselsdato er i riktig format (YYYY-MM-DD)
      let formattedBirthDate = data.birthDate;
      try {
        const date = new Date(data.birthDate);
        if (!isNaN(date.getTime())) {
          formattedBirthDate = date.toISOString().split('T')[0];
        }
      } catch (e) {
        console.warn('Kunne ikke formatere fødselsdato:', e);
      }
      
      // Registrer bruker
      const authData = await signUp(data.email, data.password, {
        full_name: data.fullName,
        birth_date: formattedBirthDate,
        company: data.company,
        job_title: data.jobTitle,
        email: data.email,
        city: data.city,
        gender: data.gender
      });
      
      if (!authData.user) {
        console.error('Ingen brukerdata returnert etter registrering');
        throw new Error('Registrering mislyktes. Vennligst prøv igjen.');
      }
      
      console.log('Bruker registrert:', authData.user.id);
      
      // Last opp avatar hvis valgt
      if (avatarFile && authData.user.id) {
        try {
          console.log('Laster opp avatar for ny bruker');
          await uploadAvatar(authData.user.id, avatarFile);
          console.log('Avatar lastet opp for ny bruker');
        } catch (avatarError) {
          console.error('Feil ved opplasting av avatar:', avatarError);
          // Fortsett selv om avatar-opplastingen feiler
        }
      }
      
      // Vis suksessmelding
      setSuccess(true);
      
      // Omdiriger til login-siden etter 2 sekunder
      setTimeout(() => {
        window.location.hash = 'login';
      }, 2000);
    } catch (err: any) {
      console.error('Feil ved registrering:', err);
      setError(err.message || 'Det oppstod en feil under registrering. Vennligst prøv igjen.');
    } finally {
      setIsLoading(false);
    }
  };

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
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-white to-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-extrabold text-gray-900"
          >
            Bli en del av EagleFlow-familien
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-lg rounded-lg p-6 sm:p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
            {/* Avatar Upload */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                  )}
                </div>
                <label 
                  htmlFor="avatar" 
                  className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-primary-dark transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </label>
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Personlig informasjon */}
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <User className="h-4 w-4 mr-2" />
                    Fullt navn
                  </label>
                  <input
                    type="text"
                    {...register('fullName')}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm sm:text-base"
                    placeholder="Ola Nordmann"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Fødselsdato
                  </label>
                  <input
                    type="date"
                    {...register('birthDate')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  />
                  {errors.birthDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="h-4 w-4 mr-2" />
                    By
                  </label>
                  <input
                    type="text"
                    {...register('city')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    placeholder="Oslo"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    Kjønn
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center p-3 border rounded-md cursor-pointer hover:border-primary transition-colors">
                      <input
                        type="radio"
                        value="male"
                        {...register('gender')}
                        className="h-4 w-4 text-primary"
                      />
                      <span className="ml-2">Mann</span>
                    </label>
                    <label className="flex items-center p-3 border rounded-md cursor-pointer hover:border-primary transition-colors">
                      <input
                        type="radio"
                        value="female"
                        {...register('gender')}
                        className="h-4 w-4 text-primary"
                      />
                      <span className="ml-2">Kvinne</span>
                    </label>
                  </div>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                  )}
                </div>
              </div>

              {/* Jobb og kontoinformasjon */}
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Building2 className="h-4 w-4 mr-2" />
                    Firma
                  </label>
                  <input
                    type="text"
                    {...register('company')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    placeholder="Ditt firma"
                  />
                  {errors.company && (
                    <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Stillingstittel
                  </label>
                  <input
                    type="text"
                    {...register('jobTitle')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    placeholder="Din stilling"
                  />
                  {errors.jobTitle && (
                    <p className="mt-1 text-sm text-red-600">{errors.jobTitle.message}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Mail className="h-4 w-4 mr-2" />
                    E-post
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    placeholder="din@epost.no"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <Lock className="h-4 w-4 mr-2" />
                      Passord
                    </label>
                    <input
                      type="password"
                      {...register('password')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                      placeholder="Minst 8 tegn"
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <Lock className="h-4 w-4 mr-2" />
                      Bekreft passord
                    </label>
                    <input
                      type="password"
                      {...register('confirmPassword')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                      placeholder="Gjenta passord"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 sm:pt-6 border-t border-gray-200">
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mt-1"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                  Ved å registrere deg godtar du våre{' '}
                  <a href="#terms" className="text-primary hover:text-primary-dark">vilkår</a>{' '}
                  og{' '}
                  <a href="#privacy" className="text-primary hover:text-primary-dark">personvernerklæring</a>
                </label>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center py-2 sm:py-3 px-4 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white ${
                    isLoading ? 'bg-primary-light cursor-not-allowed' : 'bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registrerer...
                    </>
                  ) : (
                    'Opprett konto'
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default Register 