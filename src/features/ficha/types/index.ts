import type { Etapa } from '@/shared/types/database'

export type Semaforo = 'verde' | 'amarillo' | 'rojo'
export type EstadoDato = 'automatico' | 'por_validar' | 'validado'

export interface DatoFicha {
  label: string
  valor: string
  fuente: string
  fecha: string
  estado: EstadoDato
}

export interface SeccionFicha {
  titulo: string
  datos: DatoFicha[]
}

export interface Extraccion {
  campo: string
  valor: string
  pagina: number
  estado: EstadoDato
}

export interface Foto {
  src: string
  alt: string
  /** Ilustracion generada, no una fotografia real */
  ilustrativa?: boolean
}

export interface Edificio {
  id: string
  nombre: string
  direccion: string
  chip: string
  zona: string
  /** Coordenadas WGS84 del predio */
  lat: number
  lng: number
  /** La primera es la foto principal */
  fotos: Foto[]
  etapa: Etapa
  semaforo: Semaforo
  resumen: string
  alertas: string[]
  secciones: SeccionFicha[]
  documento?: { nombre: string; extracciones: Extraccion[] }
  visita?: { fecha: string; autor: string; nota: string }
}
