import 'server-only'
import { parsearDireccion } from '../../lib/direccion'
import type { ConsultaPredio } from '../../types'
import {
  areaM2, areaSuperpuestaM2, CATASTRO, centro, cerca, consultar, cruzar, DADEP_RASTER, DADEP_VECTOR,
  distanciaAlBorde, distanciaM, JBB, type Rasgo,
} from './arcgis'

// Consulta automática del predio: con la dirección (o el código de lote) ubica el lote en
// Catastro y cruza su forma con las capas oficiales. Cada fuente falla por separado: si una no
// responde, las demás siguen y el estado lo registra.

const C = {
  placa: `${CATASTRO}/catastro/placadomiciliaria/MapServer/0`,
  lote: `${CATASTRO}/catastro/lote/MapServer/0`,
  bic: `${CATASTRO}/recreaciondeporte/bienesinterescultural/MapServer`,
  licencias: `${CATASTRO}/ordenamientoterritorial/licenciasconstruccion/MapServer`,
  reserva: `${CATASTRO}/ordenamientoterritorial/reservavial/MapServer/2`,
  plusvalia: `${CATASTRO}/catastro/predioplusvalia/MapServer/0`,
  construccion: `${CATASTRO}/catastro/construccion/MapServer/0`,
  uso: `${CATASTRO}/catastro/usopredominante/MapServer/0`,
  valor: `${CATASTRO}/catastro/valorreferencia/MapServer/0`,
  estrato: `${CATASTRO}/ordenamientoterritorial/estratificacion/MapServer/1`,
  upl: `${CATASTRO}/ordenamientoterritorial/unidadplaneamientolocal/MapServer/0`,
  arqueologia: `${CATASTRO}/recreaciondeporte/planarqueologico/MapServer/9`,
  remocion: `${CATASTRO}/emergencias/gestionriesgos/MapServer/2`,
  tm: `${CATASTRO}/movilidad/transportepublico/MapServer`,
  metro: `${CATASTRO}/movilidad/metrobogota/MapServer/0`,
  ies: `${CATASTRO}/educacion/infraestructuraeducativa/MapServer/1`,
  renobo: `${CATASTRO}/ordenamientoterritorial/GeoRenoBo/MapServer`,
  andenes: `${DADEP_RASTER}/OBSERVATORIO/${encodeURIComponent('Espacio_Público_Conexión_y_Conectividad_Peatonal')}/MapServer`,
  prediosDadep: `${DADEP_VECTOR}/SIGDEP/DADEP/MapServer/6`,
  arboles: `${JBB}/JBB/CensoArbol_v0/MapServer/0`,
}

const ESPECIES_PROTEGIDAS = [/palma de cera/i, /nogal/i, /roble/i, /palma boba/i]

type Estado = ConsultaPredio['estado']

/** Ejecuta una parte de la consulta y registra si funcionó, sin detener las demás */
async function paso<T>(estado: Estado, fuente: string, fn: () => Promise<T>, vacio: (v: T) => boolean): Promise<T | null> {
  try {
    const v = await fn()
    estado[fuente] = { estado: vacio(v) ? 'sin_datos' : 'ok' }
    return v
  } catch (e) {
    estado[fuente] = { estado: 'error', mensaje: e instanceof Error ? e.message : 'Sin respuesta' }
    return null
  }
}

async function codigoDeLote(direccion: string): Promise<string | null> {
  const d = parsearDireccion(direccion)
  if (!d) return null
  const vias = d.vias.flatMap((v) => [`'${v}'`, `'${v} '`]).join(',')
  const placas = await consultar(C.placa, { where: `PDONVIAL IN (${vias}) AND PDOTEXTO = '${d.placa}'`, outFields: 'PDOCLOTE' })
  return (placas[0]?.attributes.PDOCLOTE as string | undefined) ?? null
}

async function lote(codigo: string) {
  const [f] = await consultar(C.lote, { where: `LOTCODIGO = '${codigo}'`, returnGeometry: 'true', outSR: '4326' })
  if (!f?.geometry?.rings) return null
  const anillo = f.geometry.rings[0]
  return {
    codigo, anillo, areaM2: Math.round(areaM2(anillo) * 10) / 10, ...centro(anillo),
    unidadesPrediales: (f.attributes.LOTUPREDIA as number | null) ?? null,
    manzana: (f.attributes.MANZCODIGO as string | null) ?? null,
  }
}

const texto = (r: Rasgo, k: string) => (r.attributes[k] == null ? null : String(r.attributes[k]))
const fechaIso = (v: unknown) => (typeof v === 'number' ? new Date(v).toISOString().slice(0, 10) : null)
const ultimoAnio = (rs: Rasgo[]) => [...rs].sort((a, b) => Number(b.attributes.ANO) - Number(a.attributes.ANO))[0]

async function patrimonio(anillo: number[][], codigo: string) {
  const [bic, afectada, influencia, sic] = await Promise.all([
    consultar(`${C.bic}/1`, { where: `LOTCODIGO = '${codigo}'` }),
    cruzar(`${C.bic}/5`, [anillo]),
    cruzar(`${C.bic}/6`, [anillo]),
    consultar(`${C.bic}/4`, { where: `LOTCODIGO = '${codigo}'` }),
  ])
  return {
    bic: bic[0] ? { ambito: texto(bic[0], 'AMBITO'), nivel: texto(bic[0], 'NIVEL_INTE'), localizacion: texto(bic[0], 'LOCALIZACI'), acto: [texto(bic[0], 'ACTO_ADMIN'), texto(bic[0], 'NUMERO_ACT')].filter(Boolean).join(' ') || null } : null,
    pemp: afectada.length ? ('afectada' as const) : influencia.length ? ('influencia' as const) : null,
    sectorInteresCultural: sic[0] ? texto(sic[0], 'NOMBRE_SEC') : null,
  }
}

async function licencias(anillo: number[][]) {
  const capas = [3, 4, 7, 12, 13]
  const grupos = await Promise.all(capas.map((c) => cruzar(`${C.licencias}/${c}`, [anillo])))
  const vistas = new Map<string, ConsultaPredio['licencias'][number]>()
  for (const r of grupos.flat()) {
    const acto = texto(r, 'ACTO_ADMINISTRATIVO') ?? ''
    vistas.set(acto, { acto, tipo: texto(r, 'DESC_TIPO_TRAMITE') ?? '', decision: texto(r, 'DESC_TIPO_DECISION') ?? '', fecha: fechaIso(r.attributes.FECHA_EJECUTORIA) })
  }
  return [...vistas.values()].sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''))
}

async function reservaVial(anillo: number[][]) {
  const rs = await cruzar(C.reserva, [anillo], { returnGeometry: 'true' })
  if (!rs.length) return null
  const poligonos = rs.flatMap((r) => r.geometry?.rings ?? [])
  return { nombre: texto(rs[0], 'NOMBRE') ?? 'Reserva vial', areaM2: Math.round(areaSuperpuestaM2(anillo, poligonos) * 10) / 10 }
}

async function manzana(anillo: number[][], codigoManzana: string | null) {
  if (!codigoManzana) return null
  const [uso, valor, estrato] = await Promise.all([
    consultar(C.uso, { where: `MANCODIGO = '${codigoManzana}'` }),
    consultar(C.valor, { where: `MANCODIGO = '${codigoManzana}'` }),
    cruzar(C.estrato, [anillo]),
  ])
  const v = ultimoAnio(valor)
  return {
    uso: uso.length ? texto(ultimoAnio(uso), 'GRUPOUSOECON') : null,
    valorReferencia: v ? Number(v.attributes.V_REF) : null,
    anioValor: v ? new Date(Number(v.attributes.ANO)).getUTCFullYear() : null,
    estrato: estrato[0] ? Number(estrato[0].attributes.ESTRATO) : null,
  }
}

async function transporte(lat: number, lng: number) {
  const [estaciones, troncales, metro] = await Promise.all([
    cerca(`${C.tm}/1`, lat, lng, 1500), cerca(`${C.tm}/3`, lat, lng, 60),
    // La capa del metro a veces no responde: no debe tumbar TransMilenio
    cerca(C.metro, lat, lng, 2000).catch((): Rasgo[] => []),
  ])
  const masCerca = (rs: Rasgo[], campo: string) => rs
    .map((r) => ({ nombre: texto(r, campo), d: distanciaM(lat, lng, r.geometry?.y ?? 0, r.geometry?.x ?? 0) }))
    .sort((a, b) => a.d - b.d)[0]
  const e = masCerca(estaciones, 'ETRNOMBRE'), m = masCerca(metro, 'NOMBRE')
  return {
    troncalCercana: troncales[0] ? texto(troncales[0], 'TTRATRONCA') : null,
    estacion: e?.nombre ?? null, distanciaEstacion: e ? Math.round(e.d) : null,
    metro: m?.nombre ?? null, distanciaMetro: m ? Math.round(m.d) : null,
  }
}

async function universidades(lat: number, lng: number) {
  const rs = await cerca(C.ies, lat, lng, 1000)
  const porNombre = new Map<string, number>()
  for (const r of rs) {
    const nombre = texto(r, 'NOMBRE') ?? ''
    const d = Math.round(distanciaM(lat, lng, r.geometry?.y ?? 0, r.geometry?.x ?? 0))
    if (nombre && (!porNombre.has(nombre) || d < porNombre.get(nombre)!)) porNombre.set(nombre, d)
  }
  return [...porNombre].map(([nombre, distancia]) => ({ nombre, distancia })).sort((a, b) => a.distancia - b.distancia)
}

async function espacioPublico(anillo: number[][]) {
  const [andenes, alamedas, predios] = await Promise.all([
    cruzar(`${C.andenes}/1`, [anillo], {}, 6), cruzar(`${C.andenes}/5`, [anillo], {}, 30), cruzar(C.prediosDadep, [anillo], {}, 15),
  ])
  const anchos = andenes.map((a) => Number(a.attributes.ANCHO)).filter((n) => Number.isFinite(n))
  return {
    alameda: alamedas[0] ? texto(alamedas[0], 'NOMBRE') : null,
    andenMaxM: anchos.length ? Math.round(Math.max(...anchos) * 10) / 10 : null,
    vias: new Set(andenes.map((a) => a.attributes.CIV)).size,
    prediosPublicos: predios.length,
  }
}

async function arboles(anillo: number[][]) {
  const rs = await cruzar(C.arboles, [anillo], { returnGeometry: 'true', outFields: 'Nombre_Esp,Altura_Total' }, 30)
  const lista = rs.map((r) => ({ especie: texto(r, 'Nombre_Esp') ?? 'Sin especie', distancia: Math.round(distanciaAlBorde(anillo, r.geometry?.y ?? 0, r.geometry?.x ?? 0) * 10) / 10 }))
    .sort((a, b) => a.distancia - b.distancia)
  return {
    a10m: lista.filter((a) => a.distancia <= 10).length,
    masCercano: lista[0] ?? null,
    protegidos: lista.filter((a) => ESPECIES_PROTEGIDAS.some((re) => re.test(a.especie))),
  }
}

async function capaSimple(url: string, anillo: number[][], campo: string) {
  const rs = await cruzar(url, [anillo])
  return rs[0] ? texto(rs[0], campo) : null
}

async function renobo(anillo: number[][]) {
  const [predio, area, proyecto] = await Promise.all([1, 2, 0].map((c) => cruzar(`${C.renobo}/${c}`, [anillo])))
  const r = predio[0] ?? area[0] ?? proyecto[0]
  return r ? Object.values(r.attributes).find((v) => typeof v === 'string' && v.length > 3) as string ?? 'Sí' : null
}

export async function consultarPredio(direccion: string, codigoManual?: string | null): Promise<ConsultaPredio> {
  const estado: Estado = {}
  const vacio: ConsultaPredio = {
    fecha: new Date().toISOString(), estado, lote: null, bic: null, pemp: null, sectorInteresCultural: null, licencias: [],
    reservaVial: null, plusvalia: null, construccion: null, manzana: null, upl: null, arqueologia: null, amenazaRemocion: null,
    transporte: { troncalCercana: null, estacion: null, distanciaEstacion: null, metro: null, distanciaMetro: null },
    universidades: [], espacioPublico: { alameda: null, andenMaxM: null, vias: 0, prediosPublicos: 0 },
    arboles: { a10m: 0, masCercano: null, protegidos: [] }, renobo: null,
  }
  const codigo = codigoManual || (await paso(estado, 'ubicacion', () => codigoDeLote(direccion), (v) => !v))
  if (!codigo) return vacio
  const l = await paso(estado, 'lote', () => lote(codigo), (v) => !v)
  if (!l) return vacio
  const a = l.anillo
  const [pat, lic, res, plus, cons, man, upl, arq, rem, trans, univ, ep, arb, reno] = await Promise.all([
    paso(estado, 'patrimonio', () => patrimonio(a, codigo), (v) => !v.bic && !v.pemp),
    paso(estado, 'licencias', () => licencias(a), (v) => !v.length),
    paso(estado, 'reserva_vial', () => reservaVial(a), (v) => !v),
    paso(estado, 'plusvalia', async () => (await cruzar(C.plusvalia, [a])).length > 0, () => false),
    paso(estado, 'construccion', async () => {
      const rs = await consultar(C.construccion, { where: `LOTECODIGO = '${codigo}'` })
      return rs.length ? { pisos: Math.max(...rs.map((r) => Number(r.attributes.CONNPISOS) || 0)), sotanos: Math.max(...rs.map((r) => Number(r.attributes.CONNSOTANO) || 0)) } : null
    }, (v) => !v),
    paso(estado, 'manzana', () => manzana(a, l.manzana), (v) => !v),
    paso(estado, 'upl', () => capaSimple(C.upl, a, 'NOMBRE'), (v) => !v),
    paso(estado, 'arqueologia', async () => { const z = await capaSimple(C.arqueologia, a, 'ZPA'); return z ? `ZPA ${z}` : null }, () => false),
    // Catastro escribe "Amenaza Baja": se guarda solo el nivel (baja, media, alta)
    paso(estado, 'amenaza', async () => (await capaSimple(C.remocion, a, 'AMENAZA'))?.replace(/^amenaza\s+/i, '').toLowerCase() ?? null, () => false),
    paso(estado, 'transporte', () => transporte(l.lat, l.lng), (v) => !v.estacion && !v.troncalCercana),
    paso(estado, 'universidades', () => universidades(l.lat, l.lng), () => false),
    paso(estado, 'espacio_publico', () => espacioPublico(a), (v) => !v.alameda && !v.andenMaxM),
    paso(estado, 'arbolado', () => arboles(a), () => false),
    paso(estado, 'renobo', () => renobo(a), () => false),
  ])
  return {
    ...vacio, lote: l, bic: pat?.bic ?? null, pemp: pat?.pemp ?? null, sectorInteresCultural: pat?.sectorInteresCultural ?? null,
    licencias: lic ?? [], reservaVial: res, plusvalia: plus, construccion: cons, manzana: man, upl, arqueologia: arq,
    amenazaRemocion: rem, transporte: trans ?? vacio.transporte, universidades: univ ?? [], espacioPublico: ep ?? vacio.espacioPublico,
    arboles: arb ?? vacio.arboles, renobo: reno,
  }
}
