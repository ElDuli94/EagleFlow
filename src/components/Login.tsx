import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginFormValues, loginSchema } from '../lib/validations'
import { signIn } from '../lib/supabase'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock } from 'lucide-react'

const Login = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  })

  // Omdiriger til dashboard hvis brukeren allerede er logget inn
  useEffect(() => {
    if (user) {
      window.location.hash = 'dashboard'
    }
  }, [user])

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true)
      setError(null)
      await signIn(data.email, data.password)
      // Autentisering vellykket - AuthContext vil håndtere omdirigering
    } catch (error) {
      console.error('Innloggingsfeil:', error)
      setError('Feil e-post eller passord. Vennligst prøv igjen.')
    } finally {
      setIsLoading(false)
    }
  }

  // Hvis brukeren allerede er logget inn, vis ingenting (omdirigering håndteres av useEffect)
  if (user) {
    return null
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gradient-to-b from-white to-gray-50 items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-gray-900"
            >
              Velkommen tilbake!
            </motion.h2>
            <p className="mt-2 text-sm text-gray-600">
              Eller{' '}
              <a href="#register" className="font-medium text-primary hover:text-primary-dark transition-colors">
                registrer deg for en ny konto
              </a>
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                E-postadresse
              </label>
              <input
                type="email"
                autoComplete="email"
                {...register('email')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="din@epost.no"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Lock className="h-4 w-4 mr-2 text-gray-400" />
                Passord
              </label>
              <input
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded transition-colors"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Husk meg
                </label>
              </div>

              <a href="#forgot-password" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                Glemt passord?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white transition-colors ${
                isLoading ? 'bg-primary-light cursor-not-allowed' : 'bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logger inn...
                </>
              ) : (
                'Logg inn'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default Login 