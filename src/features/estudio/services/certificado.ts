import 'server-only'
import { extractText, getDocumentProxy } from 'unpdf'
import type { createClient } from '@/lib/supabase/server'
import { PREFIJO_AUTO } from '../lib/auto'
import { leerCertificado, sugerenciasCertificado, type LecturaCertificado } from '../lib/certificado'
import { aplicarChecklist, aplicarFiltrosAuto, aplicarFuentes } from './auto-aplicar'

// Lee el último certificado de tradición cargado (documento F01) y llena la verificación
// de lavado de activos (fuente SAE), el criterio de veto H1 y el ítem A1.

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

async function textoDelUltimoCertificado(supabase: SupabaseClient, buildingId: string): Promise<string | null> {
  const { data } = await supabase
    .from('documents').select('storage_path, mime').eq('building_id', buildingId).eq('tipo', 'F01')
    .order('fecha', { ascending: false }).limit(1).maybeSingle()
  const doc = data as { storage_path: string; mime: string | null } | null
  if (!doc || (!(doc.mime ?? '').includes('pdf') && !doc.storage_path.toLowerCase().endsWith('.pdf'))) return null
  const { data: archivo } = await supabase.storage.from('documentos').download(doc.storage_path)
  if (!archivo) return null
  const pdf = await getDocumentProxy(new Uint8Array(await archivo.arrayBuffer()))
  const { text } = await extractText(pdf, { mergePages: true })
  return text
}

/** Devuelve cuántos datos llenó (0 si no hay certificado legible) */
export async function leerYAplicarCertificado(supabase: SupabaseClient, buildingId: string): Promise<number> {
  const texto = await textoDelUltimoCertificado(supabase, buildingId)
  const lectura: LecturaCertificado | null = texto ? leerCertificado(texto) : null
  if (!lectura) return 0
  // Solo números, fechas y tipos de acto: sin nombres ni cédulas
  await supabase.from('data_points').upsert(
    { building_id: buildingId, categoria: 'auto', clave: 'certificado', valor: lectura, estado: 'automatico', fecha_consulta: lectura.fecha },
    { onConflict: 'building_id,categoria,clave' }
  )
  const s = sugerenciasCertificado(lectura)
  const conteos = await Promise.all([
    aplicarFuentes(supabase, buildingId, s.fuentes),
    aplicarFiltrosAuto(supabase, buildingId, s.filtros.map((x) => ({ ...x, nota: PREFIJO_AUTO + x.nota }))),
    aplicarChecklist(supabase, buildingId, s.checklist.map((x) => ({ ...x, nota: PREFIJO_AUTO + x.nota }))),
  ])
  return conteos.reduce((a, b) => a + b, 0)
}
