'use client'

import { useMemo, useSyncExternalStore } from 'react'
import type { InformeVisita } from '@/features/ficha/types'

// Informe editado en el navegador (modo demo). En la Fase 1 pasa a Supabase.
const clave = (edificioId: string) => `torna:informe:${edificioId}`
const EVENTO = 'torna:informe-cambio'

function leerRaw(edificioId: string): string | null {
  try {
    return localStorage.getItem(clave(edificioId))
  } catch {
    return null
  }
}

function suscribir(avisar: () => void) {
  window.addEventListener('storage', avisar)
  window.addEventListener(EVENTO, avisar)
  return () => {
    window.removeEventListener('storage', avisar)
    window.removeEventListener(EVENTO, avisar)
  }
}

/** Informe guardado en este navegador, o null si no hay cambios locales */
export function useInformeLocal(edificioId: string): InformeVisita | null {
  const raw = useSyncExternalStore(suscribir, () => leerRaw(edificioId), () => null)
  return useMemo(() => {
    try {
      return raw ? (JSON.parse(raw) as InformeVisita) : null
    } catch {
      return null
    }
  }, [raw])
}

export function guardarInforme(edificioId: string, informe: InformeVisita): boolean {
  try {
    localStorage.setItem(clave(edificioId), JSON.stringify(informe))
    window.dispatchEvent(new Event(EVENTO))
    return true
  } catch {
    return false
  }
}

export function borrarInforme(edificioId: string) {
  try {
    localStorage.removeItem(clave(edificioId))
    window.dispatchEvent(new Event(EVENTO))
  } catch {
    // sin almacenamiento disponible: no hay nada que borrar
  }
}

// Formato de informe de Torna: las 7 secciones que se revisan en cada visita
export function informeVacio(titulo: string, etiquetas: string[]): InformeVisita {
  return {
    titulo,
    fecha: '',
    hora: '',
    autor: '',
    resumenTitulo: '',
    hallazgos: [],
    observaciones: [],
    documentosPorSolicitar: [],
    secciones: etiquetas.map((etiqueta, i) => ({
      numero: String(i + 1).padStart(2, '0'),
      etiqueta,
      titulo: '',
      fotos: [],
    })),
  }
}

export function fotosDe(informe: InformeVisita | null): string[] {
  return informe ? informe.secciones.flatMap((s) => s.fotos.map((f) => f.src)) : []
}
