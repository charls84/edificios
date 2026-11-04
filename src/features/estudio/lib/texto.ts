import type { Texto } from '../types'

// Catalogos bilingues: elige el idioma activo
export const tx = (t: Texto, locale: string) => (locale === 'en' ? t.en : t.es)

export const COP = (locale: string, v: number, decimales = 0) =>
  new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: decimales,
  }).format(v)

export const porcentaje = (locale: string, v: number) =>
  new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-CO', { style: 'percent', maximumFractionDigits: 1 }).format(v)

export const numero = (locale: string, v: number, decimales = 1) =>
  new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-CO', { maximumFractionDigits: decimales }).format(v)

// Todas las fechas en hora de Colombia: el servidor de Vercel corre en UTC y, sin esto,
// algo hecho a las 8 p. m. en Bogotá aparecía con la fecha del día siguiente
const ZONA = 'America/Bogota'

export const fecha = (locale: string, iso: string) =>
  new Date(iso).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-CO', { year: 'numeric', month: 'short', day: 'numeric', timeZone: ZONA })

/** Fecha y hora de Bogotá, para mostrar cuándo se actualizó algo */
export const fechaHora = (locale: string, iso: string) =>
  `${new Date(iso).toLocaleString(locale === 'en' ? 'en-US' : 'es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: ZONA })}${locale === 'en' ? ' (Bogotá time)' : ' (hora de Bogotá)'}`
