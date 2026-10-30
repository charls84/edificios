import type { EstadoItemEdificio, MetricasUso, ParametrosFinancieros, ResultadoMayorMejorUso, UsoCandidato } from '../types'
import { ITEMS_GUIA } from '../catalogo/guia'

// Analisis de mayor y mejor uso (guia, secciones 02, 05 y 06). Solo formulas:
// cada cifra del informe se puede rastrear a los datos del uso y a los parametros.
//
//   ingreso bruto anual = m2 netos x canon/m2/mes x 12 x ocupacion
//   ingreso neto anual  = bruto - gastos anuales
//   rentabilidad        = neto / inversion
//   recuperacion (anos) = inversion / neto
//   VPN y TIR sobre el horizonte, con los meses sin ingreso al inicio

export const PARAMETROS_DEFAULT: ParametrosFinancieros = { tasaMinima: 0.12, horizonteAnios: 10, valorLoteVacio: null }

const PESO_RIESGO = { bajo: 1, medio: 0.9, alto: 0.8 } as const

interface Entradas {
  m2: number
  canon: number
  ocupacion: number
  inversion: number
  gastos: number
  meses: number
}

function flujos(e: Entradas, horizonte: number): number[] {
  // Flujo mensual: inversion en el mes 0, nada hasta el primer ingreso, luego neto mensual
  const netoMensual = (e.m2 * e.canon * e.ocupacion * 12 - e.gastos) / 12
  const total = horizonte * 12
  const f = Array<number>(total + 1).fill(0)
  f[0] = -e.inversion
  for (let m = 1; m <= total; m++) f[m] = m > e.meses ? netoMensual : 0
  return f
}

function vpn(f: number[], tasaAnual: number): number {
  const r = Math.pow(1 + tasaAnual, 1 / 12) - 1
  return f.reduce((acc, v, m) => acc + v / Math.pow(1 + r, m), 0)
}

// TIR anual por biseccion sobre la tasa mensual; null si no cruza cero
function tir(f: number[]): number | null {
  let lo = -0.99
  let hi = 10
  if (vpn(f, lo) * vpn(f, hi) > 0) return null
  for (let k = 0; k < 100; k++) {
    const mid = (lo + hi) / 2
    if (vpn(f, mid) > 0) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

function completo(u: UsoCandidato): Entradas | null {
  if (u.m2Netos == null || u.canonM2 == null || u.inversion == null || u.inversion <= 0) return null
  return {
    m2: u.m2Netos,
    canon: u.canonM2,
    ocupacion: u.ocupacion,
    inversion: u.inversion,
    gastos: u.gastosAnuales ?? 0,
    meses: u.mesesPrimerIngreso ?? 0,
  }
}

function rentabilidadDe(e: Entradas): number {
  return (e.m2 * e.canon * e.ocupacion * 12 - e.gastos) / e.inversion
}

export function metricasDeUso(u: UsoCandidato, p: ParametrosFinancieros): MetricasUso {
  const base: MetricasUso = {
    id: u.id, nombre: u.nombre, viable: false, motivo: null,
    ingresoBruto: 0, ingresoNeto: 0, rentabilidad: null, recuperacionAnios: null, tir: null, vpn: null,
    mesesPrimerIngreso: u.mesesPrimerIngreso ?? 0, riesgo: u.riesgo, valorAjustado: null,
    sensibilidad: { canonMenos10: null, obraMas20: null, colocacionLenta: null },
  }
  if (u.legal !== 'si') return { ...base, motivo: 'legal' }
  if (u.fisico !== 'si') return { ...base, motivo: 'fisica' }
  if (u.demanda === 'no') return { ...base, motivo: 'demanda' }
  const e = completo(u)
  if (!e) return { ...base, motivo: 'datos' }

  const bruto = e.m2 * e.canon * e.ocupacion * 12
  const neto = bruto - e.gastos
  const f = flujos(e, p.horizonteAnios)
  const valor = vpn(f, p.tasaMinima)
  const rentabilidad = neto / e.inversion
  return {
    ...base,
    viable: neto > 0 && rentabilidad >= p.tasaMinima,
    motivo: neto <= 0 ? 'ingreso' : rentabilidad < p.tasaMinima ? 'tasa' : null,
    ingresoBruto: bruto,
    ingresoNeto: neto,
    rentabilidad,
    recuperacionAnios: neto > 0 ? e.inversion / neto : null,
    tir: tir(f),
    vpn: valor,
    valorAjustado: valor * PESO_RIESGO[u.riesgo],
    sensibilidad: {
      canonMenos10: rentabilidadDe({ ...e, canon: e.canon * 0.9 }),
      obraMas20: rentabilidadDe({ ...e, inversion: e.inversion * 1.2 }),
      colocacionLenta: vpn(flujos({ ...e, meses: e.meses + 6 }, p.horizonteAnios), p.tasaMinima),
    },
  }
}

export function correrMayorMejorUso(usos: UsoCandidato[], p: ParametrosFinancieros): ResultadoMayorMejorUso {
  const metricas = usos.map((u) => metricasDeUso(u, p))
  const ranking = metricas
    .filter((m) => m.viable)
    .sort((a, b) => (b.valorAjustado ?? 0) - (a.valorAjustado ?? 0))
    .map((m) => m.id)
  const mejor = metricas.find((m) => m.id === ranking[0])
  const loteVacioManda = p.valorLoteVacio != null && mejor?.vpn != null && p.valorLoteVacio > mejor.vpn
  return { parametros: p, usos: metricas, ranking, recomendado: ranking[0] ?? null, loteVacioManda }
}

/** Que falta para poder correr el analisis: usos sin numeros y bloques D-F sin resolver */
export function faltantesMayorMejorUso(usos: UsoCandidato[], items: EstadoItemEdificio[]) {
  const sobreviven = usos.filter((u) => u.legal === 'si' && u.fisico === 'si')
  const usosSinNumeros = sobreviven.filter((u) => !completo(u)).map((u) => u.nombre)
  const estado = new Map(items.map((x) => [x.codigo, x.estado]))
  const itemsPendientes = ITEMS_GUIA
    .filter((x) => ['D', 'E', 'F'].includes(x.bloque))
    .filter((x) => (estado.get(x.codigo) ?? 'pendiente') === 'pendiente')
    .map((x) => x.codigo)
  return { sinUsos: sobreviven.length === 0, usosSinNumeros, itemsPendientes }
}
