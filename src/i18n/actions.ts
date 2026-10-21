'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { COOKIE_IDIOMA, esLocale } from './config'

export async function cambiarIdioma(locale: string) {
  if (!esLocale(locale)) return
  ;(await cookies()).set(COOKIE_IDIOMA, locale, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  revalidatePath('/', 'layout')
}
