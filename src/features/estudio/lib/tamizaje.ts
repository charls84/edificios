import type { Semaforo } from '@/features/ficha/types'
import { DOCUMENTOS, DOCUMENTOS_MINIMO } from '../catalogo/documentos'
import { ITEMS_GUIA } from '../catalogo/guia'
import type { EstadoDocumentoEdificio, EstadoItemEdificio, ResultadoTamizaje, UsoCandidato } from '../types'

// Tamizaje (paso 1 de la guia): decide si el inmueble merece el estudio detallado.
// Reglas, sin IA:
//   rojo     = un item bloqueante de A, B o CV marcado "no cumple", o ningun uso pasa la norma
//   amarillo = falta algo del minimo, o hay items de A/B/CV sin resolver, o usos por verificar
//   verde    = minimo completo, A/B/CV resueltos y al menos un uso pasa norma y edificio

const listo = (e: EstadoDocumentoEdificio['estado']) => e === 'cargado' || e === 'validado'

export function documentosMinimoFaltantes(docs: EstadoDocumentoEdificio[]): string[] {
  const estado = new Map(docs.map((x) => [x.codigo, x.estado]))
  return DOCUMENTOS_MINIMO.filter((codigo) => !listo(estado.get(codigo) ?? 'pendiente'))
}

export function puedeCorrerTamizaje(docs: EstadoDocumentoEdificio[], usos: UsoCandidato[]): boolean {
  return documentosMinimoFaltantes(docs).length === 0 && usos.length > 0
}

const BLOQUES_TAMIZAJE = new Set(['A', 'B', 'CV'])

export function correrTamizaje(
  docs: EstadoDocumentoEdificio[],
  items: EstadoItemEdificio[],
  usos: UsoCandidato[]
): ResultadoTamizaje {
  const estadoItem = new Map(items.map((x) => [x.codigo, x]))
  const bloqueos: string[] = []
  const pendientes: string[] = []

  for (const item of ITEMS_GUIA.filter((x) => BLOQUES_TAMIZAJE.has(x.bloque))) {
    const estado = estadoItem.get(item.codigo)?.estado ?? 'pendiente'
    if (estado === 'no_cumple' && item.bloqueante) bloqueos.push(item.codigo)
    if (estado === 'pendiente' || estado === 'por_verificar') pendientes.push(item.codigo)
  }

  const usosEvaluados = usos.map((u) => ({ id: u.id, nombre: u.nombre, pasaLegal: u.legal, pasaFisica: u.fisico }))
  const ningunoLegal = usos.length > 0 && usos.every((u) => u.legal === 'no')
  const algunoPasa = usos.some((u) => u.legal === 'si' && u.fisico === 'si')
  const usosPorVerificar = usos.some((u) => u.legal === 'por_verificar' || (u.legal === 'si' && u.fisico === 'por_verificar'))
  const minimoFaltante = documentosMinimoFaltantes(docs)

  let semaforo: Semaforo = 'verde'
  if (bloqueos.length > 0 || ningunoLegal) semaforo = 'rojo'
  else if (minimoFaltante.length > 0 || pendientes.length > 0 || usosPorVerificar || !algunoPasa) semaforo = 'amarillo'

  const estadoDoc = new Map(docs.map((x) => [x.codigo, x.estado]))
  const documentosParaEstudio = DOCUMENTOS
    .filter((d) => !d.minimo && !d.siAplica)
    .filter((d) => !listo(estadoDoc.get(d.codigo) ?? 'pendiente') && estadoDoc.get(d.codigo) !== 'no_aplica')
    .map((d) => d.codigo)

  return { semaforo, bloqueos, pendientes, documentosMinimoFaltantes: minimoFaltante, usos: usosEvaluados, documentosParaEstudio }
}
