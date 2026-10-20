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

export interface Edificio {
  id: string
  nombre: string
  direccion: string
  chip: string
  zona: string
  etapa: Etapa
  semaforo: Semaforo
  resumen: string
  alertas: string[]
  secciones: SeccionFicha[]
  documento?: { nombre: string; extracciones: Extraccion[] }
  visita?: { fecha: string; autor: string; nota: string }
}
