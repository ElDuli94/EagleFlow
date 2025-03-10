import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginFormValues, loginSchema } from '../lib/validations'
import { signIn } from '../lib/supabase'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-3xl font-extrabold text-gray-900"
          >
            Logg inn på EagleFlow
          </motion.h2>
          <p className="mt-2 text-sm text-gray-600">
            Eller{' '}
            <a href="#register" className="font-medium text-primary hover:text-primary-dark">
              registrer deg for en ny konto
            </a>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-postadresse
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="din@epost.no"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Passord
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Husk meg
              </label>
            </div>

            <div className="text-sm">
              <a href="#forgot-password" className="font-medium text-primary hover:text-primary-dark">
                Glemt passord?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
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
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login 