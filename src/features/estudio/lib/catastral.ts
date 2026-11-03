import type { ConsultaPredio } from '../types'
import { normalizar, numeroCo, type LecturaCertificado } from './certificado'

// Certificado catastral de Catastro Bogotá (documento F03): CHIP, cédula catastral, matrícula,
// áreas, destino y avalúo. Se leen por etiqueta, tolerando cambios menores de formato.
// Después se cruza con el certificado de tradición y con las capas de Catastro (criterio H3).

export interface LecturaCatastral {
  chip: string | null
  cedulaCatastral: string | null
  matricula: string | null
  areaTerrenoM2: number | null
  areaConstruidaM2: number | null
  destino: string | null
  avaluo: number | null
  anioAvaluo: number | null
}

const tras = (t: string, etiqueta: RegExp, valor: RegExp) => {
  const m = new RegExp(`${etiqueta.source}[^A-Z0-9$]{0,25}${valor.source}`).exec(t)
  // El valor es el último grupo: los grupos de la etiqueta van antes
  return m?.[m.length - 1]?.trim() ?? null
}

export function leerCatastral(texto: string): LecturaCatastral | null {
  const t = normalizar(texto)
  const chip = /\b(AAA[0-9A-Z]{8})\b/.exec(t)?.[1] ?? null
  const areaTerreno = tras(t, /AREA (TOTAL )?(DE )?TERRENO( \(?M2\)?)?/, /([\d.,]+)/)
  const areaConstruida = tras(t, /AREA (TOTAL )?CONSTRUIDA( \(?M2\)?)?/, /([\d.,]+)/)
  // El avalúo puede venir en una tabla por años: se toma el del año más reciente
  const avaluos = [...t.matchAll(/(20\d{2})[^$0-9]{0,15}\$ ?([\d.,]{7,})/g)].map((m) => ({ anio: Number(m[1]), valor: numeroCo(m[2]) }))
  const ultimo = avaluos.filter((a) => a.valor).sort((a, b) => b.anio - a.anio)[0]
  const avaluoSuelto = tras(t, /AVALUO( CATASTRAL)?/, /\$? ?([\d.,]{7,})/)
  const lectura: LecturaCatastral = {
    chip,
    cedulaCatastral: tras(t, /CEDULA CATASTRAL/, /(\d+[A-Z]?(?: \d+[A-Z]?){2,8})/),
    matricula: /\b(0?50[CNS]-?\d{4,9})\b/.exec(t)?.[1] ?? null,
    areaTerrenoM2: areaTerreno ? numeroCo(areaTerreno) : null,
    areaConstruidaM2: areaConstruida ? numeroCo(areaConstruida) : null,
    destino: tras(t, /DESTINO( CATASTRAL)?/, /(\d{2} ?[A-Z][A-Z ]{3,40}?)(?= [A-Z]+:| ESTRATO| AREA| INFORMACION|$)/),
    avaluo: ultimo?.valor ?? (avaluoSuelto ? numeroCo(avaluoSuelto) : null),
    anioAvaluo: ultimo?.anio ?? null,
  }
  const datos = Object.values(lectura).filter((v) => v != null).length
  return datos >= 2 ? lectura : null
}

export interface CruceAreas {
  puntaje: 0 | 1 | 2
  nota: string
}

const m2 = (n: number) => `${n.toLocaleString('es-CO', { maximumFractionDigits: 1 })} m²`

/** Coherencia de áreas y CHIP entre registro, Catastro (certificado y capas) y la ficha → H3 */
export function cruzarAreas(cert: LecturaCertificado | null, catastral: LecturaCatastral | null, consulta: ConsultaPredio | null, chipFicha: string | null): CruceAreas | null {
  const fuentes: { nombre: string; valor: number }[] = []
  if (cert?.areaRegistroM2) fuentes.push({ nombre: 'registro (descontando lo expropiado)', valor: cert.areaRegistroM2 - cert.areaExpropiadaM2 })
  if (catastral?.areaTerrenoM2) fuentes.push({ nombre: 'certificado catastral', valor: catastral.areaTerrenoM2 })
  if (consulta?.lote) fuentes.push({ nombre: 'polígono de Catastro', valor: consulta.lote.areaM2 })
  const chipDoc = catastral?.chip ?? cert?.chip ?? null
  const chipDistinto = Boolean(chipDoc && chipFicha && chipDoc !== chipFicha.toUpperCase())
  if (fuentes.length < 2 && !chipDistinto) return null
  const valores = fuentes.map((f) => f.valor)
  const dif = valores.length >= 2 ? (Math.max(...valores) - Math.min(...valores)) / Math.max(...valores) : 0
  const detalle = fuentes.map((f) => `${f.nombre} ${m2(f.valor)}`).join(' · ')
  if (chipDistinto) return { puntaje: 0, nota: `El CHIP de los documentos (${chipDoc}) no coincide con el de la ficha (${chipFicha}). ${detalle}` }
  const pct = Math.round(dif * 100)
  return {
    puntaje: dif <= 0.05 ? 2 : dif <= 0.15 ? 1 : 0,
    nota: `${dif <= 0.05 ? 'Las áreas coinciden' : `Diferencia de áreas del ${pct} %`}: ${detalle}`,
  }
}
