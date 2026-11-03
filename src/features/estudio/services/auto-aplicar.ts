import 'server-only'
import type { createClient } from '@/lib/supabase/server'
import { PREFIJO_AUTO, sugerenciasDeConsulta, type SugerenciaFiltro, type SugerenciaItem } from '../lib/auto'
import type { ConsultaPredio } from '../types'
import { aplicarCruces, leerCatastralGuardado, leerYAplicarCertificado } from './certificado'
import { consultarPredio } from './gis/consulta-predio'

// Escribe lo que la plataforma encontró sola sin pisar el trabajo del equipo:
// solo llena lo vacío o lo que antes también llenó la plataforma (estado 'automatico').

type SupabaseClient = Awaited<ReturnType<typeof createClient>>
const ahora = () => new Date().toISOString()

async function clavesManuales(supabase: SupabaseClient, buildingId: string, categoria: string) {
  const { data } = await supabase.from('data_points').select('clave, estado').eq('building_id', buildingId).eq('categoria', categoria)
  return new Set(((data ?? []) as { clave: string; estado: string }[]).filter((d) => d.estado !== 'automatico').map((d) => d.clave))
}

export async function aplicarFiltrosAuto(supabase: SupabaseClient, buildingId: string, sugerencias: SugerenciaFiltro[]) {
  const manuales = await clavesManuales(supabase, buildingId, 'filtros')
  const filas = sugerencias
    .filter((s) => !manuales.has(s.codigo))
    .map((s) => ({ building_id: buildingId, categoria: 'filtros', clave: s.codigo, valor: { puntaje: s.puntaje, nota: s.nota }, estado: 'automatico', fecha_consulta: ahora() }))
  if (filas.length) await supabase.from('data_points').upsert(filas, { onConflict: 'building_id,categoria,clave' })
  return filas.length
}

export async function aplicarFuentes(supabase: SupabaseClient, buildingId: string, textos: Record<string, string>) {
  const manuales = await clavesManuales(supabase, buildingId, 'fuentes')
  const filas = Object.entries(textos)
    .filter(([clave]) => !manuales.has(clave))
    .map(([clave, texto]) => ({ building_id: buildingId, categoria: 'fuentes', clave, valor: { texto }, estado: 'automatico', fecha_consulta: ahora() }))
  if (filas.length) await supabase.from('data_points').upsert(filas, { onConflict: 'building_id,categoria,clave' })
  return filas.length
}

export async function aplicarChecklist(supabase: SupabaseClient, buildingId: string, sugerencias: SugerenciaItem[]) {
  const { data } = await supabase.from('checklist_items').select('codigo, estado, nota').eq('building_id', buildingId)
  const actuales = new Map(((data ?? []) as { codigo: string; estado: string; nota: string | null }[]).map((d) => [d.codigo, d]))
  const filas = sugerencias
    .filter((s) => {
      const a = actuales.get(s.codigo)
      return !a || (a.estado === 'pendiente' && !a.nota) || Boolean(a.nota?.startsWith(PREFIJO_AUTO))
    })
    .map((s) => ({ building_id: buildingId, codigo: s.codigo, estado: s.estado, nota: s.nota, updated_at: ahora() }))
  if (filas.length) await supabase.from('checklist_items').upsert(filas, { onConflict: 'building_id,codigo' })
  return filas.length
}

export interface ResultadoAuto {
  consulta: ConsultaPredio
  aplicados: number
}

/** Consulta las capas oficiales, guarda el resultado y llena lo que falte en la ficha */
export async function consultarYAplicar(supabase: SupabaseClient, buildingId: string, codigoLote?: string | null): Promise<ResultadoAuto | null> {
  const { data } = await supabase.from('buildings').select('direccion, chip, lat, lng, zona').eq('id', buildingId).maybeSingle()
  const b = data as { direccion: string; chip: string | null; lat: number | null; lng: number | null; zona: string | null } | null
  if (!b) return null

  // Los documentos base se leen aparte: no dependen de encontrar el lote
  const [cert, catastral, consulta] = await Promise.all([
    leerYAplicarCertificado(supabase, buildingId).catch(() => ({ lectura: null, aplicados: 0 })),
    leerCatastralGuardado(supabase, buildingId).catch(() => null),
    consultarPredio(b.direccion, codigoLote),
  ])
  const cruces = await aplicarCruces(supabase, buildingId, cert.lectura, catastral, consulta.lote ? consulta : null, b.chip).catch(() => 0)
  const certificado = cert.aplicados + cruces
  await supabase.from('data_points').upsert(
    { building_id: buildingId, categoria: 'auto', clave: 'consulta', valor: consulta, estado: 'automatico', fecha_consulta: consulta.fecha },
    { onConflict: 'building_id,categoria,clave' }
  )
  if (!consulta.lote) return { consulta, aplicados: certificado }

  const s = sugerenciasDeConsulta(consulta)
  const conteos = await Promise.all([
    aplicarFuentes(supabase, buildingId, s.fuentes),
    aplicarFiltrosAuto(supabase, buildingId, s.filtros),
    aplicarChecklist(supabase, buildingId, s.checklist),
  ])
  // Ubicación y zona solo si el equipo no las puso
  await supabase
    .from('buildings')
    .update({
      ...(b.lat == null || b.lng == null ? { lat: consulta.lote.lat, lng: consulta.lote.lng } : {}),
      ...(!b.zona && consulta.upl ? { zona: consulta.upl } : {}),
      updated_at: ahora(),
    })
    .eq('id', buildingId)
  return { consulta, aplicados: conteos.reduce((a, b) => a + b, certificado) }
}
