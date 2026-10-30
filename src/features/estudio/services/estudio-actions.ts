'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { IS_DEMO } from '@/shared/lib/demo'
import { requireProfile } from '@/shared/lib/session'
import { documentoPorCodigo } from '../catalogo/documentos'
import { ITEMS_GUIA } from '../catalogo/guia'
import { CATEGORIAS_USO } from '../catalogo/usos'

// Acciones del estudio: estado de documentos, archivos, checklist de la guia y usos.
// Todas devuelven { error } en vez de lanzar, para mostrar el aviso en la pantalla.

type Resultado = { error?: string }

const uuid = z.uuid()
const ahora = () => new Date().toISOString()

async function contexto() {
  const profile = await requireProfile()
  const supabase = await createClient()
  return { profile, supabase }
}

const refrescar = (buildingId: string) => revalidatePath(`/edificios/${buildingId}`, 'layout')

// ---------- Documentos ----------

const estadoDocumentoSchema = z.object({
  buildingId: uuid,
  codigo: z.string().refine((c) => Boolean(documentoPorCodigo(c))),
  estado: z.enum(['pendiente', 'solicitado', 'cargado', 'validado', 'no_aplica']),
  notas: z.string().trim().max(1000).nullable().optional(),
})

export async function setEstadoDocumento(entrada: z.infer<typeof estadoDocumentoSchema>): Promise<Resultado> {
  if (IS_DEMO) return { error: 'demo' }
  const parsed = estadoDocumentoSchema.safeParse(entrada)
  if (!parsed.success) return { error: 'invalido' }
  const { buildingId, codigo, estado, notas } = parsed.data
  const { profile, supabase } = await contexto()
  const { error } = await supabase
    .from('building_documents')
    .upsert(
      { building_id: buildingId, codigo, estado, ...(notas !== undefined ? { notas } : {}), updated_by: profile.id, updated_at: ahora() },
      { onConflict: 'building_id,codigo' }
    )
  if (error) return { error: error.message }
  refrescar(buildingId)
  return {}
}

const archivoSchema = z.object({
  buildingId: uuid,
  codigo: z.string().refine((c) => Boolean(documentoPorCodigo(c))),
  ruta: z.string().min(3).max(300),
  nombre: z.string().trim().min(1).max(200),
  tamano: z.number().int().nonnegative().nullable(),
  mime: z.string().max(100).nullable(),
})

/** Registra un archivo que el navegador ya subio a Storage y marca el documento como cargado */
export async function registrarArchivo(entrada: z.infer<typeof archivoSchema>): Promise<Resultado> {
  if (IS_DEMO) return { error: 'demo' }
  const parsed = archivoSchema.safeParse(entrada)
  if (!parsed.success) return { error: 'invalido' }
  const { buildingId, codigo, ruta, nombre, tamano, mime } = parsed.data
  if (!ruta.startsWith(`${buildingId}/`)) return { error: 'invalido' }
  const { profile, supabase } = await contexto()

  const { error } = await supabase.from('documents').insert({
    building_id: buildingId, tipo: codigo, storage_path: ruta, nombre_archivo: nombre, tamano, mime, cargado_por: profile.id,
  })
  if (error) return { error: error.message }

  // Pasa a "cargado" salvo que ya estuviera validado
  const { data: actual } = await supabase
    .from('building_documents').select('estado').eq('building_id', buildingId).eq('codigo', codigo).maybeSingle()
  if ((actual as { estado: string } | null)?.estado !== 'validado') {
    await supabase.from('building_documents').upsert(
      { building_id: buildingId, codigo, estado: 'cargado', updated_by: profile.id, updated_at: ahora() },
      { onConflict: 'building_id,codigo' }
    )
  }
  refrescar(buildingId)
  return {}
}

export async function quitarArchivo(documentId: string): Promise<Resultado> {
  if (IS_DEMO) return { error: 'demo' }
  if (!uuid.safeParse(documentId).success) return { error: 'invalido' }
  const { supabase } = await contexto()
  const { data } = await supabase.from('documents').select('building_id, storage_path').eq('id', documentId).maybeSingle()
  const fila = data as { building_id: string; storage_path: string } | null
  if (!fila) return { error: 'noExiste' }
  const { error } = await supabase.from('documents').delete().eq('id', documentId)
  if (error) return { error: error.message }
  await supabase.storage.from('documentos').remove([fila.storage_path])
  refrescar(fila.building_id)
  return {}
}

// ---------- Checklist de la guia ----------

const itemSchema = z.object({
  buildingId: uuid,
  codigo: z.string().refine((c) => ITEMS_GUIA.some((x) => x.codigo === c)),
  estado: z.enum(['pendiente', 'cumple', 'no_cumple', 'por_verificar', 'no_aplica']),
  nota: z.string().trim().max(1000).nullable().optional(),
})

export async function setItemGuia(entrada: z.infer<typeof itemSchema>): Promise<Resultado> {
  if (IS_DEMO) return { error: 'demo' }
  const parsed = itemSchema.safeParse(entrada)
  if (!parsed.success) return { error: 'invalido' }
  const { buildingId, codigo, estado, nota } = parsed.data
  const { profile, supabase } = await contexto()
  const { error } = await supabase.from('checklist_items').upsert(
    { building_id: buildingId, codigo, estado, ...(nota !== undefined ? { nota } : {}), updated_by: profile.id, updated_at: ahora() },
    { onConflict: 'building_id,codigo' }
  )
  if (error) return { error: error.message }
  refrescar(buildingId)
  return {}
}

// ---------- Usos candidatos ----------

const nuevoUsoSchema = z.object({
  buildingId: uuid,
  nombre: z.string().trim().min(2).max(120),
  categoria: z.enum(CATEGORIAS_USO),
})

export async function crearUso(entrada: z.infer<typeof nuevoUsoSchema>): Promise<Resultado> {
  if (IS_DEMO) return { error: 'demo' }
  const parsed = nuevoUsoSchema.safeParse(entrada)
  if (!parsed.success) return { error: 'invalido' }
  const { buildingId, nombre, categoria } = parsed.data
  const { supabase } = await contexto()
  const { count } = await supabase.from('candidate_uses').select('id', { count: 'exact', head: true }).eq('building_id', buildingId)
  const { error } = await supabase.from('candidate_uses').insert({ building_id: buildingId, nombre, categoria, orden: count ?? 0 })
  if (error) return { error: error.message }
  refrescar(buildingId)
  return {}
}

const veredicto = z.enum(['si', 'no', 'por_verificar'])
const numero = z.number().nonnegative().nullable()

const cambiosUsoSchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  categoria: z.enum(CATEGORIAS_USO),
  legal: veredicto,
  legalNota: z.string().trim().max(1000).nullable(),
  fisico: veredicto,
  fisicoNota: z.string().trim().max(1000).nullable(),
  demanda: veredicto,
  demandaNota: z.string().trim().max(1000).nullable(),
  m2Netos: numero,
  canonM2: numero,
  ocupacion: z.number().min(0).max(1),
  inversion: numero,
  gastosAnuales: numero,
  mesesPrimerIngreso: z.number().int().nonnegative().nullable(),
  riesgo: z.enum(['bajo', 'medio', 'alto']),
}).partial()

export async function actualizarUso(id: string, buildingId: string, cambios: z.infer<typeof cambiosUsoSchema>): Promise<Resultado> {
  if (IS_DEMO) return { error: 'demo' }
  if (!uuid.safeParse(id).success || !uuid.safeParse(buildingId).success) return { error: 'invalido' }
  const parsed = cambiosUsoSchema.safeParse(cambios)
  if (!parsed.success) return { error: 'invalido' }
  const c = parsed.data
  const fila = {
    nombre: c.nombre, categoria: c.categoria,
    legal: c.legal, legal_nota: c.legalNota, fisico: c.fisico, fisico_nota: c.fisicoNota,
    demanda: c.demanda, demanda_nota: c.demandaNota,
    m2_netos: c.m2Netos, canon_m2: c.canonM2, ocupacion: c.ocupacion, inversion: c.inversion,
    gastos_anuales: c.gastosAnuales, meses_primer_ingreso: c.mesesPrimerIngreso, riesgo: c.riesgo,
  }
  const definidos = Object.fromEntries(Object.entries(fila).filter(([, v]) => v !== undefined))
  const { supabase } = await contexto()
  const { error } = await supabase.from('candidate_uses').update({ ...definidos, updated_at: ahora() }).eq('id', id)
  if (error) return { error: error.message }
  refrescar(buildingId)
  return {}
}

export async function eliminarUso(id: string, buildingId: string): Promise<Resultado> {
  if (IS_DEMO) return { error: 'demo' }
  if (!uuid.safeParse(id).success) return { error: 'invalido' }
  const { supabase } = await contexto()
  const { error } = await supabase.from('candidate_uses').delete().eq('id', id)
  if (error) return { error: error.message }
  refrescar(buildingId)
  return {}
}
