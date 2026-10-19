import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Correo no valido'),
  password: z.string().min(1, 'Escribe tu contraseña'),
})

export const emailSchema = z.object({
  email: z.email('Correo no valido'),
})

export const newPasswordSchema = z
  .object({
    password: z.string().min(8, 'Minimo 8 caracteres'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  })
