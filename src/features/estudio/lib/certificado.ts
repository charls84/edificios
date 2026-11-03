// Lectura del certificado de tradición y libertad (Superintendencia de Notariado y Registro).
// Cada anotación trae: número, fecha, documento, "SE CANCELA ANOTACION NO: x" si cancela otra,
// y "ESPECIFICACION: <NATURALEZA>: <código> <descripción>". Aquí se buscan medidas vigentes
// que impidan negociar o que indiquen lavado de activos (extinción de dominio, SAE, Fiscalía).
// No se guardan nombres ni cédulas de las personas que intervienen (Ley 1581).

export type TipoRiesgo = 'extincion' | 'embargo' | 'demanda' | 'falsa_tradicion' | 'otra_medida'

export interface AnotacionCertificado {
  numero: number
  /** Cuántas personas quedan como titulares (marcadas con X) en esta anotación */
  titulares: number
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
  /** Titulares del dominio según la última compraventa o adjudicación vigente */
  titulares: number | null
  /** Hay un reglamento de propiedad horizontal vigente */
  propiedadHorizontal: boolean
  /** Cabida del lote en la descripción del certificado */
  areaRegistroM2: number | null
  /** Áreas expropiadas o cedidas (por ejemplo, franjas para vías) */
  areaExpropiadaM2: number
  /** Identificación del predio según el registro */
  matricula: string | null
  chip: string | null
  codigoCatastral: string | null
  /** Código de lote de Catastro (12 dígitos) derivado del código catastral */
  codigoLote: string | null
}

/**
 * Código catastral de Bogotá (sector 6 + manzana 2 + predio 2 + …) → código de lote de las
 * capas de Catastro (sector 6 + manzana 3 + predio 3). Ej.: 003109051700000000 → 003109005017.
 */
export function loteDesdeCodigoCatastral(codigo: string | null): string | null {
  if (!codigo || !/^\d{10,}$/.test(codigo)) return null
  return `${codigo.slice(0, 6)}0${codigo.slice(6, 8)}0${codigo.slice(8, 10)}`
}

/** "1.234,56" o "1234.56" → 1234.56 */
export function numeroCo(v: string): number | null {
  const s = v.trim()
  const n = /,\d{1,2}$/.test(s) ? s.replace(/\./g, '').replace(',', '.') : /\.\d{3}(\.|$)/.test(s) && !/\.\d{1,2}$/.test(s) ? s.replace(/\./g, '') : s.replace(/,/g, '')
  const x = Number(n)
  return Number.isFinite(x) ? x : null
}

export const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, ' ')

export function parsearAnotaciones(texto: string): AnotacionCertificado[] {
  const t = normalizar(texto)
  return t.split(/ANOTACION:? ?NRO:? ?/).slice(1).flatMap((bloque) => {
    const numero = Number(/^(\d+)/.exec(bloque)?.[1])
    if (!Number.isFinite(numero)) return []
    const espec = /ESPECIFICACION: ?([A-Z ]+?): ?(\d{2,4})? ?(.*?)(?= PERSONAS QUE INTERVIENEN|$)/.exec(bloque)
    // Las menciones sueltas ("anotación nro 0" en salvedades) no traen especificación
    if (!espec) return []
    const personas = bloque.slice(bloque.indexOf('PERSONAS QUE INTERVIENEN') + 24)
    const titulares = (personas.match(/ X(?= |$)/g) ?? []).length
    const cancela = [...bloque.matchAll(/SE CANCELA ANOTACION NO:? ?([\d ,Y]+)/g)].flatMap((m) => m[1].split(/[ ,Y]+/).filter(Boolean).map(Number))
    return [{
      numero,
      titulares,
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

// La cabida está en "DESCRIPCION: CABIDA Y LINDEROS", antes de las anotaciones
function cabida(t: string): number | null {
  const i = t.indexOf('CABIDA')
  if (i < 0) return null
  const m = /([\d.,]+) ?(METROS CUADRADOS|MTS2|M2)/.exec(t.slice(i, i + 1500))
  return m ? numeroCo(m[1]) : null
}

export function leerCertificado(texto: string): LecturaCertificado | null {
  const t = normalizar(texto)
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
  const codigoCatastral = /CODIGO CATASTRAL:? ?(\d{10,30})/.exec(t)?.[1] ?? null
  const vigente = (a: AnotacionCertificado) => !canceladas.has(a.numero)
  // Una expropiación parcial (franja vial) no cambia de dueño al resto del predio
  const adquisiciones = anotaciones.filter((a) => vigente(a) && a.naturaleza.includes('MODO DE ADQUISICION') && !/EXPROPIACION/.test(a.descripcion) && a.titulares > 0)
  const ultima = adquisiciones.at(-1)
  const areaExpropiadaM2 = anotaciones
    .filter((a) => /EXPROPIACION|CESION/.test(a.descripcion))
    .reduce((acc, a) => acc + (numeroCo(/([\d.,]+) ?M2/.exec(a.descripcion)?.[1] ?? '') ?? 0), 0)
  return {
    fecha: new Date().toISOString(),
    anotaciones: anotaciones.length,
    vigentes,
    canceladas: pasadas,
    titulares: ultima?.titulares ?? null,
    propiedadHorizontal: anotaciones.some((a) => vigente(a) && /PROPIEDAD HORIZONTAL/.test(a.descripcion) && !a.naturaleza.includes('CANCELACION')),
    areaRegistroM2: cabida(t),
    areaExpropiadaM2: Math.round(areaExpropiadaM2 * 100) / 100,
    matricula: /MATRICULA:? ?(\d{2,3}[A-Z]?-\d{3,9})/.exec(t)?.[1] ?? null,
    chip: /NUPRE:? ?(AAA[0-9A-Z]{8})/.exec(t)?.[1] ?? /\b(AAA[0-9A-Z]{8})\b/.exec(t)?.[1] ?? null,
    codigoCatastral,
    codigoLote: loteDesdeCodigoCatastral(codigoCatastral),
  }
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
  const filtros: { codigo: string; puntaje: 0 | 1 | 2; nota: string }[] = [{ codigo: 'H1', puntaje: bloqueos.length ? 0 : 2, nota }]
  if (l.titulares != null) {
    const ph = l.propiedadHorizontal ? ' · con propiedad horizontal vigente' : ''
    filtros.push({ codigo: 'H2', puntaje: l.propiedadHorizontal || l.titulares > 3 ? 0 : l.titulares === 1 ? 2 : 1, nota: `${l.titulares} titular(es) del dominio según el certificado${ph}. Falta confirmar disposición a negociar` })
  }
  return {
    fuentes,
    filtros,
    checklist: [{ codigo: 'A1', estado: (bloqueos.length ? 'no_cumple' : otras.length ? 'por_verificar' : 'cumple') as 'no_cumple' | 'por_verificar' | 'cumple', nota: otras.length && !bloqueos.length ? `${nota}. Revisar: ${otras.map(anot).join('; ')}` : nota }],
  }
}
