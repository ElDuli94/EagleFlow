import { z } from 'zod'

// Registreringsskjema validering
export const registerSchema = z.object({
  fullName: z.string().min(2, 'Fullt navn må være minst 2 tegn'),
  birthDate: z.string().refine(date => {
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime())
  }, 'Ugyldig dato'),
  company: z.string().min(2, 'Firmanavn må være minst 2 tegn'),
  jobTitle: z.string().min(2, 'Stillingstittel må være minst 2 tegn'),
  email: z.string().email('Ugyldig e-postadresse'),
  city: z.string().min(2, 'By må være minst 2 tegn'),
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Vennligst velg kjønn' })
  }),
  password: z.string().min(8, 'Passord må være minst 8 tegn'),
  confirmPassword: z.string().min(8, 'Bekreft passord må være minst 8 tegn')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passordene må være like',
  path: ['confirmPassword']
})

export type RegisterFormValues = z.infer<typeof registerSchema>

// Innloggingsskjema validering
export const loginSchema = z.object({
  email: z.string().email('Ugyldig e-postadresse'),
  password: z.string().min(1, 'Passord er påkrevd')
})

export type LoginFormValues = z.infer<typeof loginSchema> 