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

export const fecha = (locale: string, iso: string) =>
  new Date(iso).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
