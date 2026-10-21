import { cookies } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'
import { COOKIE_IDIOMA, esLocale, LOCALE_POR_DEFECTO } from './config'

// Idioma por cookie (sin prefijo en la URL): espanol por defecto, ingles opcional.
export default getRequestConfig(async () => {
  const valor = (await cookies()).get(COOKIE_IDIOMA)?.value
  const locale = esLocale(valor) ? valor : LOCALE_POR_DEFECTO
  return {
    locale,
    timeZone: 'America/Bogota',
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
