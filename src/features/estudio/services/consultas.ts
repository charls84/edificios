import 'server-only'
import type { InformeVisita } from '@/features/ficha/types'
import { createClient } from '@/lib/supabase/server'
import type {
  AnalisisGuardado,
  EdificioReal,
  EstadoDocumentoEdificio,
  EstadoItemEdificio,
  UsoCandidato,
} from '../types'

// Lecturas del modo real. RLS decide que ve cada quien: aqui solo se mapea.

interface FilaEdificio {
  id: string
  nombre: string | null
  direccion: string
  chip: string | null
  matricula_inmobiliaria: string | null
  zona: string | null
  lat: number | null
  lng: number | null
  etapa: EdificioReal['etapa']
  semaforo: EdificioReal['semaforo']
  resumen: string | null
  origen: string | null
  contacto: string | null
  notas: string | null
  created_at: string
  updated_at: string
}

const COLUMNAS_EDIFICIO =
  'id, nombre, direccion, chip, matricula_inmobiliaria, zona, lat, lng, etapa, semaforo, resumen, origen, contacto, notas, created_at, updated_at'

function mapEdificio(b: FilaEdificio): EdificioReal {
  return {
    id: b.id,
    nombre: b.nombre ?? b.direccion,
    direccion: b.direccion,
    chip: b.chip,
    matricula: b.matricula_inmobiliaria,
    zona: b.zona,
    lat: b.lat,
    lng: b.lng,
    etapa: b.etapa,
    semaforo: b.semaforo,
    resumen: b.resumen,
    origen: b.origen,
    contacto: b.contacto,
    notas: b.notas,
    createdAt: b.created_at,
    updatedAt: b.updated_at,
  }
}

export async function getEdificio(id: string): Promise<EdificioReal | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('buildings').select(COLUMNAS_EDIFICIO).eq('id', id).maybeSingle()
  return data ? mapEdificio(data as FilaEdificio) : null
}

export async function listEdificiosReales(): Promise<EdificioReal[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('buildings').select(COLUMNAS_EDIFICIO).order('updated_at', { ascending: false })
  return ((data ?? []) as FilaEdificio[]).map(mapEdificio)
}

export async function getDocumentos(buildingId: string): Promise<EstadoDocumentoEdificio[]> {
  const supabase = await createClient()
  const [{ data: estados }, { data: archivos }] = await Promise.all([
    supabase.from('building_documents').select('codigo, estado, notas').eq('building_id', buildingId),
    supabase
      .from('documents')
      .select('id, tipo, storage_path, nombre_archivo, tamano, fecha')
      .eq('building_id', buildingId)
      .order('fecha', { ascending: false }),
  ])
  const porCodigo = new Map<string, EstadoDocumentoEdificio>()
  for (const e of (estados ?? []) as { codigo: string; estado: EstadoDocumentoEdificio['estado']; notas: string | null }[]) {
    porCodigo.set(e.codigo, { codigo: e.codigo, estado: e.estado, notas: e.notas, archivos: [] })
  }
  type FilaArchivo = { id: string; tipo: string; storage_path: string; nombre_archivo: string | null; tamano: number | null; fecha: string }
  for (const a of (archivos ?? []) as FilaArchivo[]) {
    const doc = porCodigo.get(a.tipo) ?? { codigo: a.tipo, estado: 'cargado' as const, notas: null, archivos: [] }
    doc.archivos.push({
      id: a.id,
      codigo: a.tipo,
      nombreArchivo: a.nombre_archivo ?? a.storage_path.split('/').pop() ?? a.storage_path,
      tamano: a.tamano,
      ruta: a.storage_path,
      fecha: a.fecha,
    })
    porCodigo.set(a.tipo, doc)
  }
  return [...porCodigo.values()]
}

export async function getItemsGuia(buildingId: string): Promise<EstadoItemEdificio[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('checklist_items').select('codigo, estado, nota').eq('building_id', buildingId)
  return (data ?? []) as EstadoItemEdificio[]
}

interface FilaUso {
  id: string
  nombre: string
  categoria: UsoCandidato['categoria']
  orden: number
  legal: UsoCandidato['legal']
  legal_nota: string | null
  fisico: UsoCandidato['fisico']
  fisico_nota: string | null
  demanda: UsoCandidato['demanda']
  demanda_nota: string | null
  m2_netos: number | null
  canon_m2: number | null
  ocupacion: number
  inversion: number | null
  gastos_anuales: number | null
  meses_primer_ingreso: number | null
  riesgo: UsoCandidato['riesgo']
  updated_at: string
}

export async function getUsos(buildingId: string): Promise<UsoCandidato[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('candidate_uses').select('*').eq('building_id', buildingId).order('orden').order('created_at')
  return ((data ?? []) as FilaUso[]).map((u) => ({
    id: u.id,
    nombre: u.nombre,
    categoria: u.categoria,
    orden: u.orden,
    legal: u.legal,
    legalNota: u.legal_nota,
    fisico: u.fisico,
    fisicoNota: u.fisico_nota,
    demanda: u.demanda,
    demandaNota: u.demanda_nota,
    m2Netos: u.m2_netos == null ? null : Number(u.m2_netos),
    canonM2: u.canon_m2 == null ? null : Number(u.canon_m2),
    ocupacion: Number(u.ocupacion),
    inversion: u.inversion == null ? null : Number(u.inversion),
    gastosAnuales: u.gastos_anuales == null ? null : Number(u.gastos_anuales),
    mesesPrimerIngreso: u.meses_primer_ingreso,
    riesgo: u.riesgo,
    updatedAt: u.updated_at,
  }))
}

// Fecha del ultimo cambio en cualquier parte del estudio: sirve para marcar un analisis como desactualizado
async function ultimoCambio(buildingId: string): Promise<string> {
  const supabase = await createClient()
  const tablas = ['building_documents', 'checklist_items', 'candidate_uses'] as const
  const fechas = await Promise.all([
    supabase.from('buildings').select('updated_at').eq('id', buildingId).maybeSingle().then((r) => (r.data as { updated_at: string } | null)?.updated_at),
    ...tablas.map((t) =>
      supabase.from(t).select('updated_at').eq('building_id', buildingId).order('updated_at', { ascending: false }).limit(1).maybeSingle()
        .then((r) => (r.data as { updated_at: string } | null)?.updated_at)
    ),
    supabase.from('documents').select('fecha').eq('building_id', buildingId).order('fecha', { ascending: false }).limit(1).maybeSingle()
      .then((r) => (r.data as { fecha: string } | null)?.fecha),
  ])
  return fechas.filter((f): f is string => Boolean(f)).sort().at(-1) ?? ''
}

export async function getUltimoAnalisis<T>(buildingId: string, tipo: 'tamizaje' | 'mayor_mejor_uso'): Promise<AnalisisGuardado<T> | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('analyses')
    .select('id, resultado, created_at, corrido_por, profiles:corrido_por (full_name, email)')
    .eq('building_id', buildingId)
    .eq('tipo', tipo)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!data) return null
  const fila = data as unknown as { id: string; resultado: T; created_at: string; profiles: { full_name: string | null; email: string } | null }
  const cambio = await ultimoCambio(buildingId)
  return {
    id: fila.id,
    fecha: fila.created_at,
    autor: fila.profiles?.full_name ?? fila.profiles?.email ?? null,
    resultado: fila.resultado,
    desactualizado: cambio > fila.created_at,
  }
}

export async function getInformeVisita(buildingId: string): Promise<InformeVisita | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('visit_notes')
    .select('informe')
    .eq('building_id', buildingId)
    .not('informe', 'is', null)
    .order('fecha', { ascending: false })
    .limit(1)
    .maybeSingle()
  return ((data as { informe: InformeVisita | null } | null)?.informe) ?? null
}
