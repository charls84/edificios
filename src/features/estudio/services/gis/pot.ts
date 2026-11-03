import 'server-only'
import { cruzar, type Rasgo } from './arcgis'

// Norma urbana del POT de Bogotá (Decreto 555 de 2021): tratamiento urbanístico y área de
// actividad. SINUPOT no responde a consultas automáticas, así que se usa la publicación del
// POT en ArcGIS Online. Las capas se buscan por nombre en el servicio (no por número), porque
// los números cambian cuando se republica.

const SERVICIO = 'https://services7.arcgis.com/lsxbLWF2l19Rmhqj/arcgis/rest/services/POT_Bogota_Decreto_555_2021/FeatureServer'

const CAPAS = {
  tratamiento: /^tratamiento urban/i,
  actividad: /^[áa]rea(s)? de actividad/i,
} as const

export interface NormaPot {
  tratamiento: string | null
  areaActividad: string | null
  /** Atributos tal como vienen, para revisar el detalle (y diagnosticar si cambia el servicio) */
  detalle: Record<string, Record<string, string>>
}

async function capas(): Promise<{ id: number; name: string }[]> {
  const res = await fetch(`${SERVICIO}?f=json`, { next: { revalidate: 86_400 }, signal: AbortSignal.timeout(15_000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = (await res.json()) as { layers?: { id: number; name: string }[]; error?: { message?: string } }
  if (data.error) throw new Error(data.error.message ?? 'Error del servicio POT')
  return data.layers ?? []
}

// Texto legible de un rasgo: prefiere campos de nombre o descripción sobre códigos
function texto(r: Rasgo | undefined): string | null {
  if (!r) return null
  const pares = Object.entries(r.attributes).filter(([, v]) => typeof v === 'string' && v.trim().length > 2) as [string, string][]
  const nombre = pares.find(([k]) => /nombre|nom_|descrip|tratamiento|actividad|modalidad/i.test(k) && !/codigo|cod_|^id|acto|norma|shape|globalid/i.test(k))
  return (nombre ?? pares.find(([k]) => !/codigo|cod_|^id|shape|globalid/i.test(k)))?.[1].trim() ?? null
}

const legible = (r: Rasgo | undefined) =>
  r ? Object.fromEntries(Object.entries(r.attributes).filter(([k, v]) => v != null && !/shape|objectid|globalid/i.test(k)).slice(0, 12).map(([k, v]) => [k, String(v)])) : {}

export async function normaPot(anillo: number[][]): Promise<NormaPot> {
  const lista = await capas()
  const buscar = (re: RegExp) => lista.find((l) => re.test(l.name.trim()))
  const t = buscar(CAPAS.tratamiento)
  const a = buscar(CAPAS.actividad)
  // El área de actividad tiene huecos sobre algunos lotes del centro: se busca con 30 m de margen
  const [trat, act] = await Promise.all([
    t ? cruzar(`${SERVICIO}/${t.id}`, [anillo]) : Promise.resolve([] as Rasgo[]),
    a ? cruzar(`${SERVICIO}/${a.id}`, [anillo], {}, 30) : Promise.resolve([] as Rasgo[]),
  ])
  return {
    tratamiento: texto(trat[0]),
    areaActividad: texto(act[0]),
    detalle: { tratamiento: legible(trat[0]), actividad: legible(act[0]) },
  }
}
