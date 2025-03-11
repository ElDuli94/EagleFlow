import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../contexts/AuthContext'
import { uploadAvatar, supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import { User, Camera, Building2, Briefcase, MapPin, Calendar, X, Save } from 'lucide-react'
import { maleAvatar, femaleAvatar } from '../assets/avatars'

// Skjema for profilredigering
const profileEditSchema = z.object({
  full_name: z.string().min(2, 'Fullt navn må være minst 2 tegn'),
  birth_date: z.string().refine(date => {
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime())
  }, 'Ugyldig dato'),
  company: z.string().min(2, 'Firmanavn må være minst 2 tegn'),
  job_title: z.string().min(2, 'Stillingstittel må være minst 2 tegn'),
  city: z.string().min(2, 'By må være minst 2 tegn'),
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Vennligst velg kjønn' })
  })
})

type ProfileEditFormValues = z.infer<typeof profileEditSchema>

interface ProfileEditProps {
  onClose: () => void
}

const ProfileEdit = ({ onClose }: ProfileEditProps) => {
  const { user, profile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      birth_date: profile?.birth_date || '',
      company: profile?.company || '',
      job_title: profile?.job_title || '',
      city: profile?.city || '',
      gender: profile?.gender || 'male'
    }
  })

  // Oppdater skjemaet når profilen lastes
  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || '',
        birth_date: profile.birth_date || '',
        company: profile.company || '',
        job_title: profile.job_title || '',
        city: profile.city || '',
        gender: profile.gender || 'male'
      })
      setAvatarPreview(profile.avatar_url || null)
    }
  }, [profile, reset])

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

  const onSubmit = async (data: ProfileEditFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      console.log('Oppdaterer profil med data:', data);
      
      // Sikre at fødselsdato er i riktig format (YYYY-MM-DD)
      let formattedBirthDate = data.birth_date;
      try {
        const date = new Date(data.birth_date);
        if (!isNaN(date.getTime())) {
          formattedBirthDate = date.toISOString().split('T')[0];
        }
      } catch (e) {
        console.warn('Kunne ikke formatere fødselsdato:', e);
      }
      
      // Oppdater profil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          birth_date: formattedBirthDate,
          company: data.company,
          job_title: data.job_title,
          city: data.city,
          gender: data.gender
        })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Feil ved oppdatering av profil:', updateError);
        throw updateError;
      }
      
      console.log('Profil oppdatert for bruker:', user.id);
      
      // Last opp avatar hvis en fil er valgt
      if (avatarFile) {
        try {
          console.log('Laster opp avatar for bruker:', user.id);
          const avatarUrl = await uploadAvatar(user.id, avatarFile);
          console.log('Avatar lastet opp, URL:', avatarUrl);
        } catch (avatarError) {
          console.error('Feil ved opplasting av avatar:', avatarError);
          // Fortsett selv om avatar-opplastingen feiler
        }
      }
      
      setSuccess(true);
      
      // Oppdater AuthContext med ny profildata
      try {
        const { data: refreshedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        console.log('Hentet oppdatert profil:', refreshedProfile);
        
        // Vent litt før vi lukker modalen og oppdaterer siden
        setTimeout(() => {
          onClose();
          // Oppdater siden for å vise endringene
          window.location.reload();
        }, 1500);
      } catch (refreshError) {
        console.error('Feil ved henting av oppdatert profil:', refreshError);
        // Fortsett selv om vi ikke kan hente oppdatert profil
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
      }
    } catch (err: any) {
      console.error('Feil ved oppdatering av profil:', err);
      setError(err.message || 'Det oppstod en feil under oppdatering av profil. Vennligst prøv igjen.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Rediger profil</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-4 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 m-4 rounded-lg">
            Profilen din er oppdatert!
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6">
          {/* Avatar Upload */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = profile?.gender === 'female' ? femaleAvatar : maleAvatar;
                    }}
                  />
                ) : (
                  <User className="h-12 w-12 text-gray-400" />
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <User className="h-4 w-4 mr-2" />
                Fullt navn
              </label>
              <input
                type="text"
                {...register('full_name')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                placeholder="Ola Nordmann"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Calendar className="h-4 w-4 mr-2" />
                Fødselsdato
              </label>
              <input
                type="date"
                {...register('birth_date')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              />
              {errors.birth_date && (
                <p className="mt-1 text-sm text-red-600">{errors.birth_date.message}</p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Building2 className="h-4 w-4 mr-2" />
                Firma
              </label>
              <input
                type="text"
                {...register('company')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                placeholder="Firma AS"
              />
              {errors.company && (
                <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Briefcase className="h-4 w-4 mr-2" />
                Stilling
              </label>
              <input
                type="text"
                {...register('job_title')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                placeholder="Prosjektleder"
              />
              {errors.job_title && (
                <p className="mt-1 text-sm text-red-600">{errors.job_title.message}</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Kjønn</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="male"
                    {...register('gender')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <span className="ml-2">Mann</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="female"
                    {...register('gender')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <span className="ml-2">Kvinne</span>
                </label>
              </div>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-3"
              disabled={isLoading}
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 border border-transparent rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Lagrer...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Lagre endringer
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default ProfileEdit 