import 'server-only'

// Consultas a servicios ArcGIS REST del Distrito (Catastro, DADEP, Jardín Botánico).
// Sin llaves: son servicios públicos. Cada consulta tiene tiempo máximo para no
// bloquear la ficha si un servidor no responde.

export const CATASTRO = 'https://serviciosgis.catastrobogota.gov.co/arcgis/rest/services'
export const DADEP_RASTER = 'https://gisraster.dadep.gov.co/arcgis/rest/services'
export const DADEP_VECTOR = 'https://gisvector.dadep.gov.co/arcgis/rest/services'
export const JBB = 'https://geoportal.jbb.gov.co/agc/rest/services'

export type Atributos = Record<string, string | number | null>
export interface Rasgo {
  attributes: Atributos
  geometry?: { x?: number; y?: number; rings?: number[][][]; paths?: number[][][] }
}

export async function consultar(capa: string, params: Record<string, string>, ms = 25000): Promise<Rasgo[]> {
  const url = `${capa}/query?${new URLSearchParams({ f: 'json', outFields: '*', returnGeometry: 'false', ...params })}`
  const res = await fetch(url, { signal: AbortSignal.timeout(ms), cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = (await res.json()) as { features?: Rasgo[]; error?: { message?: string } }
  if (data.error) throw new Error(data.error.message ?? 'Error del servicio')
  return data.features ?? []
}

/** Rasgos que tocan el polígono (o a menos de `metros` de él) */
export function cruzar(capa: string, anillos: number[][][], extra: Record<string, string> = {}, metros?: number) {
  return consultar(capa, {
    geometry: JSON.stringify({ rings: anillos, spatialReference: { wkid: 4326 } }),
    geometryType: 'esriGeometryPolygon',
    inSR: '4326',
    outSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    ...(metros ? { distance: String(metros), units: 'esriSRUnit_Meter' } : {}),
    ...extra,
  })
}

/** Rasgos a menos de `metros` de un punto */
export function cerca(capa: string, lat: number, lng: number, metros: number, extra: Record<string, string> = {}) {
  return consultar(capa, {
    geometry: JSON.stringify({ x: lng, y: lat, spatialReference: { wkid: 4326 } }),
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    outSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    distance: String(metros),
    units: 'esriSRUnit_Meter',
    returnGeometry: 'true',
    ...extra,
  })
}

// ---------- Geometría plana local (suficiente para lotes de cientos de metros) ----------

const escala = (lat: number) => ({ kx: 111320 * Math.cos((lat * Math.PI) / 180), ky: 110574 })

export function areaM2(anillo: number[][]) {
  const { kx, ky } = escala(anillo[0][1])
  let s = 0
  for (let i = 0; i < anillo.length; i++) {
    const [x1, y1] = anillo[i === 0 ? anillo.length - 1 : i - 1]
    const [x2, y2] = anillo[i]
    s += x1 * kx * (y2 * ky) - x2 * kx * (y1 * ky)
  }
  return Math.abs(s) / 2
}

export function centro(anillo: number[][]) {
  const n = anillo.length
  return { lat: anillo.reduce((a, p) => a + p[1], 0) / n, lng: anillo.reduce((a, p) => a + p[0], 0) / n }
}

export function distanciaM(lat1: number, lng1: number, lat2: number, lng2: number) {
  const { kx, ky } = escala((lat1 + lat2) / 2)
  return Math.hypot((lng2 - lng1) * kx, (lat2 - lat1) * ky)
}

/** Distancia de un punto al borde del lote, en metros */
export function distanciaAlBorde(anillo: number[][], lat: number, lng: number) {
  const { kx, ky } = escala(lat)
  const px = lng * kx, py = lat * ky
  let mejor = Infinity
  for (let i = 1; i < anillo.length; i++) {
    const ax = anillo[i - 1][0] * kx, ay = anillo[i - 1][1] * ky, bx = anillo[i][0] * kx, by = anillo[i][1] * ky
    const largo = (bx - ax) ** 2 + (by - ay) ** 2 || 1
    const t = Math.max(0, Math.min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / largo))
    mejor = Math.min(mejor, Math.hypot(px - (ax + t * (bx - ax)), py - (ay + t * (by - ay))))
  }
  return mejor
}

function dentro(x: number, y: number, anillo: number[][]) {
  let c = false
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i], [xj, yj] = anillo[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}

/** Área del lote que cae dentro de otros polígonos, por muestreo en una malla de 0,5 m */
export function areaSuperpuestaM2(lote: number[][], otros: number[][][]) {
  if (otros.length === 0) return 0
  const { kx, ky } = escala(lote[0][1])
  const paso = 0.5
  const xs = lote.map((p) => p[0]), ys = lote.map((p) => p[1])
  let n = 0
  for (let y = Math.min(...ys); y < Math.max(...ys); y += paso / ky) {
    for (let x = Math.min(...xs); x < Math.max(...xs); x += paso / kx) {
      if (dentro(x, y, lote) && otros.some((o) => dentro(x, y, o))) n++
    }
  }
  return n * paso * paso
}
