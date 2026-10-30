import { DOCUMENTOS, DOCUMENTOS_MINIMO } from '../catalogo/documentos'
import { ITEMS_GUIA } from '../catalogo/guia'
import type { EstadoDocumentoEdificio, EstadoItemEdificio, Prueba, UsoCandidato } from '../types'
import { BLOQUES_GUIA } from '../catalogo/guia'

// Avance del estudio para la pestaña Resumen y la barra de pasos

const docListo = (e?: EstadoDocumentoEdificio['estado']) => e === 'cargado' || e === 'validado'

export function progresoDocumentos(docs: EstadoDocumentoEdificio[]) {
  const estado = new Map(docs.map((d) => [d.codigo, d.estado]))
  const aplican = DOCUMENTOS.filter((d) => estado.get(d.codigo) !== 'no_aplica')
  const listos = aplican.filter((d) => docListo(estado.get(d.codigo)))
  const minimoListos = DOCUMENTOS_MINIMO.filter((c) => docListo(estado.get(c)))
  return { total: aplican.length, listos: listos.length, minimo: DOCUMENTOS_MINIMO.length, minimoListos: minimoListos.length }
}

export function progresoPrueba(items: EstadoItemEdificio[], prueba: Prueba) {
  const bloques = new Set(BLOQUES_GUIA.filter((b) => b.prueba === prueba).map((b) => b.codigo))
  const estado = new Map(items.map((i) => [i.codigo, i.estado]))
  const delBloque = ITEMS_GUIA.filter((i) => bloques.has(i.bloque))
  const resueltos = delBloque.filter((i) => {
    const e = estado.get(i.codigo) ?? 'pendiente'
    return e !== 'pendiente' && e !== 'por_verificar'
  })
  return { total: delBloque.length, resueltos: resueltos.length }
}

export function resumenUsos(usos: UsoCandidato[]) {
  const pasanNorma = usos.filter((u) => u.legal === 'si')
  const pasanEdificio = pasanNorma.filter((u) => u.fisico === 'si')
  return { total: usos.length, pasanNorma: pasanNorma.length, pasanEdificio: pasanEdificio.length }
}
