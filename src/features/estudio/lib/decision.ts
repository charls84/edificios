import { CLAVES_VISITA, type ClaveVisita, type ResumenVisita } from '@/features/visita/lib/calificacion'
import { FILTROS } from '../catalogo/filtros'
import type { ConsultaPredio, EstadoDocumentoEdificio, ResultadoMayorMejorUso, Texto } from '../types'
import type { ResultadoFiltros } from './filtros'

// Sugerencia de decisión: junta los 5 filtros, la consulta automática, la visita y el
// análisis financiero en una recomendación con sus razones. Son reglas, no IA: cada
// razón dice de dónde sale. La decisión final es del comité.

const t = (es: string, en: string): Texto => ({ es, en })

export type Decision = 'continuar' | 'continuar_condiciones' | 'descartar' | 'falta_informacion'

export interface SugerenciaDecision {
  decision: Decision
  razones: Texto[]
  condiciones: Texto[]
  alertas: Texto[]
  faltantes: Texto[]
}

export interface EntradaDecision {
  filtros: ResultadoFiltros
  docs: EstadoDocumentoEdificio[]
  visita: ResumenVisita | null
  consulta: ConsultaPredio | null
  mmu: ResultadoMayorMejorUso | null
  /** Hay algo escrito en "Usos permitidos" (POT 555 o concepto de norma) */
  usosConsultados: boolean
  /** Respuestas de la verificación de lavado de activos (fuente SAE), por campo */
  sae: Partial<Record<'inventario' | 'medidas' | 'listas', string>>
}

// Un "Sí" al inicio de la respuesta es una alerta de lavado de activos
const afirma = (texto?: string) => Boolean(texto && /^\s*(s[ií]|yes)(?![a-záéíóúñ])/i.test(texto))
const PREGUNTA_SAE: Record<'inventario' | 'medidas' | 'listas', Texto> = {
  inventario: t('el inmueble lo administra la SAE o está en extinción de dominio', 'the property is managed by SAE or under asset forfeiture'),
  medidas: t('el certificado tiene medidas de Fiscalía, extinción de dominio o embargos', 'the certificate shows prosecutor, forfeiture or attachment measures'),
  listas: t('un propietario aparece en listas restrictivas', 'an owner is on restrictive lists'),
}
const alertasSae = (e: EntradaDecision) => (Object.keys(PREGUNTA_SAE) as (keyof typeof PREGUNTA_SAE)[]).filter((k) => afirma(e.sae[k]))

const NOMBRE_SECCION: Record<ClaveVisita, Texto> = {
  electricas: t('instalaciones eléctricas', 'electrical installations'),
  hidraulicas: t('instalaciones hidráulicas', 'plumbing'),
  estructurales: t('elementos estructurales', 'structural elements'),
  no_estructurales: t('elementos no estructurales', 'non-structural elements'),
  acabados: t('acabados', 'finishes'),
  general: t('estado general', 'overall condition'),
}

const cargado = (docs: EstadoDocumentoEdificio[], codigo: string) =>
  docs.some((d) => d.codigo === codigo && (d.estado === 'cargado' || d.estado === 'validado'))

function faltantes(e: EntradaDecision): Texto[] {
  const f: Texto[] = []
  if (!cargado(e.docs, 'F01')) f.push(t('Certificado de tradición y libertad (revela embargos, demandas y propietarios)', 'Certificate of title (shows liens, lawsuits and owners)'))
  if (!e.consulta?.lote) f.push(t('Consulta automática del predio en Catastro (revisar la dirección o el código de lote)', 'Automatic cadastre lookup (check the address or lot code)'))
  if (!e.visita || e.visita.calificadas < CLAVES_VISITA.length) f.push(t('Visita técnica con las seis secciones calificadas', 'Site visit with all six sections scored'))
  if (!e.sae.inventario) f.push(t('Verificación en la SAE de lavado de activos y extinción de dominio', 'SAE check for money laundering and asset forfeiture'))
  if (!e.usosConsultados) f.push(t('Usos permitidos: confirmar con el POT 555 o con un concepto de norma', 'Permitted uses: confirm with POT 555 or a planning opinion'))
  for (const r of e.filtros.filtros.filter((x) => x.vetoPendiente)) {
    const filtro = FILTROS.find((x) => x.codigo === r.codigo)!
    const veto = filtro.criterios.find((c) => c.veto)!
    f.push(t(`Criterio de veto ${veto.codigo} (${filtro.titulo.es.toLowerCase()})`, `Veto criterion ${veto.codigo} (${filtro.titulo.en.toLowerCase()})`))
  }
  return f
}

function condiciones(e: EntradaDecision): Texto[] {
  const c: Texto[] = []
  const q = e.consulta
  if (q?.bic || q?.pemp) {
    const nivel = q.bic?.nivel ? ` (${q.bic.nivel})` : ''
    c.push(t(`Confirmar con el IDPC qué intervención permite la condición patrimonial${nivel}`, `Confirm with IDPC what works the heritage status${nivel} allows`))
  }
  if (q?.reservaVial && q.reservaVial.areaM2 >= 1) c.push(t(`Descontar del área útil los ${q.reservaVial.areaM2.toLocaleString('es-CO')} m² de reserva vial`, `Exclude the ${q.reservaVial.areaM2.toLocaleString('en-US')} m² road reserve from usable area`))
  if (q?.lote?.unidadesPrediales && q.lote.unidadesPrediales > 1) c.push(t(`El lote tiene ${q.lote.unidadesPrediales} unidades prediales: confirmar cuántos dueños hay que poner de acuerdo`, `The lot has ${q.lote.unidadesPrediales} cadastral units: confirm how many owners must agree`))
  if (q?.arqueologia) c.push(t(`Está en ${q.arqueologia}: toda excavación necesita plan de manejo arqueológico (ICANH)`, `It is in ${q.arqueologia}: any excavation needs an archaeological plan (ICANH)`))
  if (q?.arboles.protegidos.some((x) => x.distancia <= 10)) c.push(t('Hay una especie protegida junto al lote: la obra no puede afectarla sin permiso', 'A protected species stands next to the lot: works cannot affect it without a permit'))
  for (const clave of e.visita?.criticas ?? []) {
    const p = e.visita!.porClave[clave]
    c.push(t(`Presupuestar el arreglo de ${NOMBRE_SECCION[clave].es} (visita: ${p}/10)`, `Budget repairs to ${NOMBRE_SECCION[clave].en} (visit: ${p}/10)`))
  }
  return c
}

function alertas(e: EntradaDecision): Texto[] {
  const a: Texto[] = []
  const q = e.consulta
  if (q?.amenazaRemocion === 'alta') a.push(t('Amenaza alta por remoción en masa: pedir concepto del IDIGER', 'High landslide hazard: request an IDIGER opinion'))
  if (q?.plusvalia) a.push(t('Registra zona de plusvalía: puede haber un cobro al cambiar el uso', 'Land value capture zone: a charge may apply on change of use'))
  if (q && Object.values(q.estado).some((s) => s.estado === 'error')) a.push(t('Algunas capas oficiales no respondieron: repetir la consulta automática', 'Some official layers did not respond: run the automatic lookup again'))
  if (e.mmu && !e.mmu.recomendado) a.push(t('Ningún uso da VPN positivo con los supuestos actuales', 'No use yields a positive NPV with current assumptions'))
  return a
}

function razones(e: EntradaDecision): Texto[] {
  const r: Texto[] = []
  const f = e.filtros
  if (f.potencial != null) r.push(t(`Potencial de los 5 filtros: ${f.potencial}/100 (${Math.round(f.cobertura * 100)} % de criterios evaluados)`, `5-filter potential: ${f.potencial}/100 (${Math.round(f.cobertura * 100)}% of criteria scored)`))
  const conPuntaje = f.filtros.filter((x) => x.puntaje != null).sort((a, b) => b.puntaje! - a.puntaje!)
  if (conPuntaje.length >= 2) {
    const mejor = FILTROS.find((x) => x.codigo === conPuntaje[0].codigo)!.titulo
    const peor = FILTROS.find((x) => x.codigo === conPuntaje[conPuntaje.length - 1].codigo)!.titulo
    r.push(t(`Lo más fuerte: ${mejor.es.toLowerCase()} (${conPuntaje[0].puntaje}). Lo más débil: ${peor.es.toLowerCase()} (${conPuntaje[conPuntaje.length - 1].puntaje})`,
      `Strongest: ${mejor.en.toLowerCase()} (${conPuntaje[0].puntaje}). Weakest: ${peor.en.toLowerCase()} (${conPuntaje[conPuntaje.length - 1].puntaje})`))
  }
  for (const k of alertasSae(e)) r.push(t(`Riesgo de lavado de activos: ${PREGUNTA_SAE[k].es}`, `Money laundering risk: ${PREGUNTA_SAE[k].en}`))
  for (const v of f.vetos) r.push(t(`No pasa el criterio de veto ${v}`, `Fails veto criterion ${v}`))
  if (e.visita?.promedio != null) r.push(t(`Visita técnica: ${e.visita.promedio.toLocaleString('es-CO')}/10 en promedio (${e.visita.calificadas} de 6 secciones)`, `Site visit: ${e.visita.promedio}/10 on average (${e.visita.calificadas} of 6 sections)`))
  const tr = e.consulta?.transporte
  if (tr?.estacion && tr.distanciaEstacion != null) r.push(t(`Estación ${tr.estacion} a ${tr.distanciaEstacion} m`, `${tr.estacion} station ${tr.distanciaEstacion} m away`))
  const uso = e.mmu?.usos.find((u) => u.id === e.mmu?.recomendado)
  if (uso) r.push(t(`Uso con mejor resultado: ${uso.nombre}`, `Best-performing use: ${uso.nombre}`))
  return r
}

export function sugerirDecision(e: EntradaDecision): SugerenciaDecision {
  const base = { razones: razones(e), condiciones: condiciones(e), alertas: alertas(e), faltantes: faltantes(e) }
  const f = e.filtros
  const estructuraCritica = e.visita?.porClave.estructurales != null && e.visita.porClave.estructurales <= 2
  let decision: Decision
  if (f.vetos.length || estructuraCritica || alertasSae(e).length) decision = 'descartar'
  else if (f.lectura === 'incompleto') decision = 'falta_informacion'
  else if (f.lectura === 'bajo' || (e.mmu && !e.mmu.recomendado && f.lectura !== 'alto')) decision = 'descartar'
  else if (f.lectura === 'alto' && base.condiciones.length === 0 && base.faltantes.length === 0 && (!e.mmu || e.mmu.recomendado)) decision = 'continuar'
  else decision = 'continuar_condiciones'
  return { decision, ...base }
}

/** Color de cada decisión (plano: sirve en servidor y cliente) */
export const COLOR_DECISION: Record<Decision, string> = {
  continuar: 'bg-verde text-white',
  continuar_condiciones: 'bg-ambar text-white',
  descartar: 'bg-rojo-oscuro text-white',
  falta_informacion: 'bg-piedra text-torna',
}
