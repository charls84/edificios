import type { Semaforo } from '@/features/ficha/types'
import type { Etapa } from '@/shared/types/database'

/** Texto en los dos idiomas de la app */
export interface Texto {
  es: string
  en: string
}

// ---------- Checklist de documentos (lista de Torna, 27-oct-2026) ----------

/** Donde se consigue: en linea, parcial (se consulta en linea y se pide aparte) o no en linea */
export type Disponibilidad = 'en_linea' | 'parcial' | 'no_en_linea'

export type EstadoDocumento = 'pendiente' | 'solicitado' | 'cargado' | 'validado' | 'no_aplica'

export interface DocumentoCatalogo {
  codigo: string
  grupo: string
  subgrupo: string
  nombre: Texto
  detalle?: Texto
  disponibilidad: Disponibilidad
  /** Forma parte del minimo para arrancar el tamizaje */
  minimo?: boolean
  /** Solo se pide en ciertos casos (sociedad, BIC, propiedad horizontal...) */
  siAplica?: boolean
}

export interface GrupoDocumentos {
  codigo: string
  titulo: Texto
  subgrupos: { codigo: string; titulo: Texto; pregunta?: Texto }[]
}

export interface ArchivoCargado {
  id: string
  codigo: string
  nombreArchivo: string
  tamano: number | null
  ruta: string
  fecha: string
}

export interface EstadoDocumentoEdificio {
  codigo: string
  estado: EstadoDocumento
  notas: string | null
  archivos: ArchivoCargado[]
}

// ---------- Checklist de la guia de mayor y mejor uso (bloques A-F) ----------

export type EstadoItem = 'pendiente' | 'cumple' | 'no_cumple' | 'por_verificar' | 'no_aplica'

export type Prueba = 'legal' | 'fisica' | 'financiera'

export interface ItemGuia {
  codigo: string
  bloque: string
  texto: Texto
  /** Donde se consigue o por que importa */
  nota: Texto
  /** Si no cumple, el tamizaje da rojo */
  bloqueante?: boolean
}

export interface BloqueGuia {
  codigo: string
  prueba: Prueba
  titulo: Texto
  pregunta: Texto
}

export interface EstadoItemEdificio {
  codigo: string
  estado: EstadoItem
  nota: string | null
}

// ---------- Usos candidatos ----------

export type Veredicto = 'si' | 'no' | 'por_verificar'
export type Riesgo = 'bajo' | 'medio' | 'alto'
export type CategoriaUso = 'vivienda' | 'trabajo' | 'comercio' | 'otros' | 'mixto'

export interface UsoCandidato {
  id: string
  nombre: string
  categoria: CategoriaUso
  orden: number
  legal: Veredicto
  legalNota: string | null
  fisico: Veredicto
  fisicoNota: string | null
  demanda: Veredicto
  demandaNota: string | null
  m2Netos: number | null
  canonM2: number | null
  ocupacion: number
  inversion: number | null
  gastosAnuales: number | null
  mesesPrimerIngreso: number | null
  riesgo: Riesgo
  updatedAt: string
}

// ---------- Analisis ----------

export interface ResultadoTamizaje {
  semaforo: Semaforo
  bloqueos: string[]
  pendientes: string[]
  documentosMinimoFaltantes: string[]
  usos: { id: string; nombre: string; pasaLegal: Veredicto; pasaFisica: Veredicto }[]
  documentosParaEstudio: string[]
}

export interface ParametrosFinancieros {
  tasaMinima: number
  horizonteAnios: number
  valorLoteVacio: number | null
}

export interface MetricasUso {
  id: string
  nombre: string
  viable: boolean
  motivo: string | null
  ingresoBruto: number
  ingresoNeto: number
  rentabilidad: number | null
  recuperacionAnios: number | null
  tir: number | null
  vpn: number | null
  mesesPrimerIngreso: number
  riesgo: Riesgo
  valorAjustado: number | null
  sensibilidad: { canonMenos10: number | null; obraMas20: number | null; colocacionLenta: number | null }
}

export interface ResultadoMayorMejorUso {
  parametros: ParametrosFinancieros
  usos: MetricasUso[]
  ranking: string[]
  recomendado: string | null
  loteVacioManda: boolean
}

export interface AnalisisGuardado<T> {
  id: string
  fecha: string
  autor: string | null
  resultado: T
  /** Hubo cambios en el edificio despues de la corrida */
  desactualizado: boolean
}

// ---------- Edificio en modo real ----------

export interface EdificioReal {
  id: string
  nombre: string
  direccion: string
  chip: string | null
  matricula: string | null
  zona: string | null
  lat: number | null
  lng: number | null
  etapa: Etapa
  semaforo: Semaforo | null
  resumen: string | null
  origen: string | null
  contacto: string | null
  notas: string | null
  createdAt: string
  updatedAt: string
}
