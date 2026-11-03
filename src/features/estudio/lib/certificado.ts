// Lectura del certificado de tradición y libertad (Superintendencia de Notariado y Registro).
// Cada anotación trae: número, fecha, documento, "SE CANCELA ANOTACION NO: x" si cancela otra,
// y "ESPECIFICACION: <NATURALEZA>: <código> <descripción>". Aquí se buscan medidas vigentes
// que impidan negociar o que indiquen lavado de activos (extinción de dominio, SAE, Fiscalía).
// No se guardan nombres ni cédulas de las personas que intervienen (Ley 1581).

export type TipoRiesgo = 'extincion' | 'embargo' | 'demanda' | 'falsa_tradicion' | 'otra_medida'

export interface AnotacionCertificado {
  numero: number
  fecha: string | null
  documento: string
  naturaleza: string
  descripcion: string
  cancela: number[]
}

export interface Hallazgo {
  numero: number
  fecha: string | null
  tipo: TipoRiesgo
  descripcion: string
}

export interface LecturaCertificado {
  fecha: string
  anotaciones: number
  vigentes: Hallazgo[]
  /** Medidas que existieron pero ya están canceladas */
  canceladas: Hallazgo[]
}

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, ' ')

export function parsearAnotaciones(texto: string): AnotacionCertificado[] {
  const t = normalizar(texto)
  return t.split(/ANOTACION:? ?NRO:? ?/).slice(1).flatMap((bloque) => {
    const numero = Number(/^(\d+)/.exec(bloque)?.[1])
    if (!Number.isFinite(numero)) return []
    const espec = /ESPECIFICACION: ?([A-Z ]+?): ?(\d{2,4})? ?(.*?)(?= PERSONAS QUE INTERVIENEN|$)/.exec(bloque)
    // Las menciones sueltas ("anotación nro 0" en salvedades) no traen especificación
    if (!espec) return []
    const cancela = [...bloque.matchAll(/SE CANCELA ANOTACION NO:? ?([\d ,Y]+)/g)].flatMap((m) => m[1].split(/[ ,Y]+/).filter(Boolean).map(Number))
    return [{
      numero,
      fecha: /FECHA: ?(\d{2}-\d{2}-\d{4})/.exec(bloque)?.[1] ?? null,
      documento: /DOC: ?(.*?)(?= VALOR ACTO| SE CANCELA| ESPECIFICACION|$)/.exec(bloque)?.[1]?.trim().slice(0, 160) ?? '',
      naturaleza: espec[1].trim(),
      descripcion: `${espec[2] ?? ''} ${espec[3] ?? ''}`.trim().slice(0, 200),
      cancela,
    }]
  })
}

function tipoDe(a: AnotacionCertificado): TipoRiesgo | null {
  const todo = `${a.naturaleza} ${a.descripcion} ${a.documento}`
  if (/EXTINCION|ACTIVOS ESPECIALES|SUSPENSION (DEL )?PODER DISPOSITIVO|INCAUTACION|COMISO/.test(todo)) return 'extincion'
  if (a.naturaleza.includes('MEDIDA CAUTELAR') && /FISCALIA/.test(a.documento)) return 'extincion'
  if (a.naturaleza.includes('CANCELACION')) return null
  if (/EMBARGO/.test(todo)) return 'embargo'
  if (/DEMANDA/.test(todo)) return 'demanda'
  if (/FALSA TRADICION/.test(todo)) return 'falsa_tradicion'
  if (a.naturaleza.includes('MEDIDA CAUTELAR')) return 'otra_medida'
  return null
}

export function leerCertificado(texto: string): LecturaCertificado | null {
  const anotaciones = parsearAnotaciones(texto)
  if (anotaciones.length === 0) return null
  const canceladas = new Set(anotaciones.flatMap((a) => a.cancela))
  const vigentes: Hallazgo[] = []
  const pasadas: Hallazgo[] = []
  for (const a of anotaciones) {
    const tipo = tipoDe(a)
    if (!tipo) continue
    const h = { numero: a.numero, fecha: a.fecha, tipo, descripcion: a.descripcion.toLowerCase() }
    ;(canceladas.has(a.numero) ? pasadas : vigentes).push(h)
  }
  return { fecha: new Date().toISOString(), anotaciones: anotaciones.length, vigentes, canceladas: pasadas }
}

/** Medidas que impiden negociar o son alerta de lavado de activos */
export const bloquea = (h: Hallazgo) => h.tipo !== 'otra_medida'

const anot = (h: Hallazgo) => `anotación ${h.numero}${h.fecha ? ` (${h.fecha})` : ''}: ${h.descripcion}`

/** Textos para la fuente SAE y sugerencias de H1 y A1 a partir del certificado */
export function sugerenciasCertificado(l: LecturaCertificado) {
  const extincion = l.vigentes.filter((h) => h.tipo === 'extincion')
  const bloqueos = l.vigentes.filter(bloquea)
  const otras = l.vigentes.filter((h) => !bloquea(h))
  const fuentes: Record<string, string> = {
    'sae.inventario': extincion.length
      ? `Sí · el certificado registra extinción de dominio o medida de la SAE/Fiscalía (${anot(extincion[0])})`
      : 'No · el certificado no registra extinción de dominio ni medidas de la SAE o la Fiscalía',
    'sae.medidas': bloqueos.length
      ? `Sí · ${bloqueos.map(anot).join('; ')}`
      : `No · ${l.anotaciones} anotaciones revisadas sin embargos, demandas ni extinción de dominio vigentes${otras.length ? `. Otra medida vigente: ${otras.map(anot).join('; ')}` : ''}`,
  }
  const nota = bloqueos.length ? `Medida vigente que impide negociar: ${anot(bloqueos[0])}` : `Certificado sin embargos, demandas ni extinción de dominio vigentes (${l.anotaciones} anotaciones)`
  return {
    fuentes,
    filtros: [{ codigo: 'H1', puntaje: (bloqueos.length ? 0 : 2) as 0 | 2, nota }],
    checklist: [{ codigo: 'A1', estado: (bloqueos.length ? 'no_cumple' : otras.length ? 'por_verificar' : 'cumple') as 'no_cumple' | 'por_verificar' | 'cumple', nota: otras.length && !bloqueos.length ? `${nota}. Revisar: ${otras.map(anot).join('; ')}` : nota }],
  }
}
