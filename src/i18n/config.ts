export const LOCALES = ['es', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const LOCALE_POR_DEFECTO: Locale = 'es'
export const COOKIE_IDIOMA = 'NEXT_LOCALE'

export const esLocale = (v: unknown): v is Locale => LOCALES.includes(v as Locale)
