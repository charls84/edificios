'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { DEMO_COOKIE, IS_DEMO } from '@/shared/lib/demo'
import { createClient } from '@/lib/supabase/server'
import type { ActionState } from '../types'
import { emailSchema, loginSchema, newPasswordSchema } from './schemas'

async function errorDe(clave: string): Promise<ActionState> {
  const t = await getTranslations('errores')
  return { error: t(clave) }
}

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return errorDe(parsed.error.issues[0].message)

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return errorDe('credenciales')

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function requestPasswordReset(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = emailSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return errorDe(parsed.error.issues[0].message)

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/callback?next=/update-password`,
  })
  // Misma respuesta exista o no la cuenta, para no revelar quien esta registrado
  const t = await getTranslations('auth')
  return { success: t('enlaceEnviado') }
}

export async function updatePassword(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = newPasswordSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return errorDe(parsed.error.issues[0].message)

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) return errorDe('contrasenaNoGuardada')

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function enterDemo() {
  if (!IS_DEMO) redirect('/login')
  const store = await cookies()
  store.set(DEMO_COOKIE, '1', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 })
  redirect('/dashboard')
}

export async function signout() {
  if (IS_DEMO) {
    ;(await cookies()).delete(DEMO_COOKIE)
    redirect('/login')
  }
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
