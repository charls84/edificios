import { z } from 'zod'

// Los mensajes son claves de messages/*.json > errores

export const loginSchema = z.object({
  email: z.email('correoInvalido'),
  password: z.string().min(1, 'escribeContrasena'),
})

export const emailSchema = z.object({
  email: z.email('correoInvalido'),
})

export const newPasswordSchema = z
  .object({
    password: z.string().min(8, 'minimo8'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'noCoinciden',
    path: ['confirm'],
  })
