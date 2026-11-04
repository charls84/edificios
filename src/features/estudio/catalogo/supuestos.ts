import type { CategoriaUso, Texto } from '../types'

// Supuestos de referencia para llenar los números de los usos cuando el equipo no los tiene.
// NO son datos de mercado cerrados: son puntos de partida para que el análisis de mayor y
// mejor uso pueda correr y el comité vea órdenes de magnitud. Cada uso dice que sus números
// son supuestos; el comercial los reemplaza en la pestaña Usos candidatos.
// Revisión: 4-nov-2026.

export type Confianza = 'media' | 'baja'

export interface SupuestoCanon {
  /** Canon mensual por m² útil, en COP */
  canonM2: number
  fuente: Texto
  confianza: Confianza
}

const t = (es: string, en: string): Texto => ({ es, en })

export const CANON_REFERENCIA: Partial<Record<CategoriaUso, SupuestoCanon>> = {
  trabajo: {
    canonM2: 48_000,
    fuente: t('Precio de oferta de oficinas en la zona centro de Bogotá, Properati, septiembre de 2026', 'Asking rent for offices in central Bogotá, Properati, September 2026'),
    confianza: 'media',
  },
  comercio: {
    canonM2: 52_000,
    fuente: t('Avisos de locales en el centro ampliado (por ejemplo, Paloquemao), 2026. Pocos datos', 'Retail listings in the wider center (e.g., Paloquemao), 2026. Few data points'),
    confianza: 'baja',
  },
  vivienda: {
    canonM2: 40_000,
    fuente: t('Estimación sin fuente verificada para vivienda pequeña en el centro: confirmar con un corredor', 'Unverified estimate for small housing in the center: confirm with a broker'),
    confianza: 'baja',
  },
  mixto: {
    canonM2: 50_000,
    fuente: t('Promedio de las referencias de oficinas y comercio', 'Average of the office and retail references'),
    confianza: 'baja',
  },
}

/** Costo de adecuación por m² construido (rehabilitación, redes y acabados; sin reforzamiento mayor) */
export const COSTO_OBRA_M2 = {
  valor: 2_000_000,
  fuente: t('Rangos publicados de remodelación en Bogotá 2026 (0,7 a 2,5 millones/m²), tomando la parte alta por ser edificio patrimonial. Reemplazar con cotización', 'Published 2026 Bogotá renovation ranges (0.7–2.5 million/m²), upper end for a heritage building. Replace with a quote'),
}

/** Parte del ingreso bruto que se va en administración, mantenimiento, predial y seguros */
export const GASTOS_SOBRE_INGRESO = 0.15
/** Meses hasta el primer ingreso: licencia ante curaduría (y el IDPC si es BIC) más obra */
export const MESES_PRIMER_INGRESO = 18
/** m² útiles por cada m² construido (circulaciones, muros, puntos fijos) */
export const EFICIENCIA = 0.8
