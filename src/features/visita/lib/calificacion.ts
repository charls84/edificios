import type { InformeVisita } from '@/features/ficha/types'

// Calificación de la visita técnica: el inspector pone de 0 a 10 cada una de las seis
// secciones que pidió Torna (3-nov-2026). Sin dependencias de React: la usan el editor,
// la vista, los filtros y la sugerencia de decisión.

export const CLAVES_VISITA = ['electricas', 'hidraulicas', 'estructurales', 'no_estructurales', 'acabados', 'general'] as const
export type ClaveVisita = (typeof CLAVES_VISITA)[number]

export type NivelPuntaje = 'critico' | 'regular' | 'bueno'

/** 0–3 crítico (rojo) · 4–6 regular (ámbar) · 7–10 bueno (verde) */
export const nivelPuntaje = (p: number): NivelPuntaje => (p <= 3 ? 'critico' : p <= 6 ? 'regular' : 'bueno')

export const COLOR_NIVEL: Record<NivelPuntaje, { solido: string; suave: string }> = {
  critico: { solido: 'bg-rojo text-white', suave: 'bg-rojo-claro text-rojo-oscuro' },
  regular: { solido: 'bg-ambar text-white', suave: 'bg-ambar-claro text-ambar' },
  bueno: { solido: 'bg-verde text-white', suave: 'bg-verde-claro text-verde' },
}

export const esPuntaje = (p: unknown): p is number => typeof p === 'number' && Number.isInteger(p) && p >= 0 && p <= 10

export interface ResumenVisita {
  /** Promedio de las secciones calificadas, con un decimal */
  promedio: number | null
  porClave: Partial<Record<ClaveVisita, number>>
  calificadas: number
  /** Secciones en rojo (0 a 3) */
  criticas: ClaveVisita[]
}

export function resumirVisita(informe: InformeVisita | null): ResumenVisita | null {
  if (!informe) return null
  const porClave: Partial<Record<ClaveVisita, number>> = {}
  for (const s of informe.secciones) {
    if (s.clave && esPuntaje(s.puntaje)) porClave[s.clave] = s.puntaje
  }
  const valores = Object.values(porClave)
  if (valores.length === 0) return { promedio: null, porClave, calificadas: 0, criticas: [] }
  const promedio = Math.round((valores.reduce((a, b) => a + b, 0) / valores.length) * 10) / 10
  const criticas = CLAVES_VISITA.filter((c) => porClave[c] != null && nivelPuntaje(porClave[c]!) === 'critico')
  return { promedio, porClave, calificadas: valores.length, criticas }
}

/** Puntajes de los filtros que se deducen de la visita (estructura y redes) */
export function sugerenciasDeVisita(r: ResumenVisita | null): { codigo: string; puntaje: 0 | 1 | 2; nota: string }[] {
  if (!r) return []
  const s: { codigo: string; puntaje: 0 | 1 | 2; nota: string }[] = []
  const est = r.porClave.estructurales
  // Un 0–2 en estructura es daño severo a la vista: el veto queda en 0 hasta que un ingeniero diga otra cosa
  // Un 3 queda sin sugerencia: lo decide el ingeniero
  if (est != null && est !== 3) s.push({ codigo: 'E1', puntaje: est <= 2 ? 0 : 2, nota: `Visita · elementos estructurales ${est}/10` })
  const redes = [r.porClave.electricas, r.porClave.hidraulicas].filter((x): x is number => x != null)
  if (redes.length) {
    const p = redes.reduce((a, b) => a + b, 0) / redes.length
    s.push({ codigo: 'E5', puntaje: p < 4 ? 0 : p < 7 ? 1 : 2, nota: `Visita · instalaciones eléctricas e hidráulicas ${Math.round(p * 10) / 10}/10` })
  }
  return s
}
