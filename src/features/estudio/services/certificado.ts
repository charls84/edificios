import 'server-only'
import { extractText, getDocumentProxy } from 'unpdf'
import type { createClient } from '@/lib/supabase/server'
import { PREFIJO_AUTO } from '../lib/auto'
import type { SugerenciaItem } from '../lib/auto'
import { cruzarAreas, leerCatastral, type LecturaCatastral } from '../lib/catastral'
import { leerCertificado, sugerenciasCertificado, type LecturaCertificado } from '../lib/certificado'
import type { ConsultaPredio } from '../types'
import { aplicarChecklist, aplicarFiltrosAuto, aplicarFuentes } from './auto-aplicar'

// Lee los dos documentos base: certificado de tradición (F01) → lavado de activos (SAE),
// H1, H2 y A1; certificado catastral (F03) → A2. Luego cruza áreas y CHIP → H3 y A7.

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

/** Texto del último PDF cargado para un documento (F01 tradición, F03 catastral) */
async function textoDelUltimo(supabase: SupabaseClient, buildingId: string, tipo: 'F01' | 'F03'): Promise<string | null> {
  const { data } = await supabase
    .from('documents').select('storage_path, mime').eq('building_id', buildingId).eq('tipo', tipo)
    .order('fecha', { ascending: false }).limit(1).maybeSingle()
  const doc = data as { storage_path: string; mime: string | null } | null
  if (!doc || (!(doc.mime ?? '').includes('pdf') && !doc.storage_path.toLowerCase().endsWith('.pdf'))) return null
  const { data: archivo } = await supabase.storage.from('documentos').download(doc.storage_path)
  if (!archivo) return null
  const pdf = await getDocumentProxy(new Uint8Array(await archivo.arrayBuffer()))
  const { text } = await extractText(pdf, { mergePages: true })
  return text
}

/** Devuelve la lectura y cuántos datos llenó (0 si no hay certificado legible) */
export async function leerYAplicarCertificado(supabase: SupabaseClient, buildingId: string): Promise<{ lectura: LecturaCertificado | null; aplicados: number }> {
  const texto = await textoDelUltimo(supabase, buildingId, 'F01')
  const lectura: LecturaCertificado | null = texto ? leerCertificado(texto) : null
  if (!lectura) return { lectura: null, aplicados: 0 }
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
  return { lectura, aplicados: conteos.reduce((a, b) => a + b, 0) }
}

/** Certificado catastral (F03): áreas, destino, avalúo y CHIP */
export async function leerCatastralGuardado(supabase: SupabaseClient, buildingId: string): Promise<LecturaCatastral | null> {
  const texto = await textoDelUltimo(supabase, buildingId, 'F03')
  const lectura = texto ? leerCatastral(texto) : null
  if (lectura) {
    await supabase.from('data_points').upsert(
      { building_id: buildingId, categoria: 'auto', clave: 'catastral', valor: lectura, estado: 'automatico', fecha_consulta: new Date().toISOString() },
      { onConflict: 'building_id,categoria,clave' }
    )
  }
  return lectura
}

const miles = (n: number) => n.toLocaleString('es-CO')

/** Cruce de los tres orígenes (registro, Catastro en PDF y capas) → H3, A2 y A7 */
export async function aplicarCruces(supabase: SupabaseClient, buildingId: string, cert: LecturaCertificado | null, catastral: LecturaCatastral | null, consulta: ConsultaPredio | null, chip: string | null): Promise<number> {
  const cruce = cruzarAreas(cert, catastral, consulta, chip)
  const filtros = cruce ? [{ codigo: 'H3', puntaje: cruce.puntaje, nota: PREFIJO_AUTO + cruce.nota }] : []
  const checklist: SugerenciaItem[] = []
  if (catastral) {
    const datos = [
      catastral.areaTerrenoM2 && `terreno ${miles(catastral.areaTerrenoM2)} m²`,
      catastral.areaConstruidaM2 && `construida ${miles(catastral.areaConstruidaM2)} m²`,
      catastral.destino && `destino ${catastral.destino.toLowerCase()}`,
      catastral.avaluo && `avalúo ${catastral.anioAvaluo ?? ''} COP ${miles(catastral.avaluo)}`,
    ].filter(Boolean).join(' · ')
    checklist.push({ codigo: 'A2', estado: 'cumple', nota: `${PREFIJO_AUTO}Certificado catastral: ${datos}` })
  }
  if (cruce) checklist.push({ codigo: 'A7', estado: cruce.puntaje === 2 ? 'cumple' : cruce.puntaje === 1 ? 'por_verificar' : 'no_cumple', nota: PREFIJO_AUTO + cruce.nota })
  const conteos = await Promise.all([aplicarFiltrosAuto(supabase, buildingId, filtros), aplicarChecklist(supabase, buildingId, checklist)])
  return conteos[0] + conteos[1]
}
