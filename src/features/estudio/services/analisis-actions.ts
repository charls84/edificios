'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { InformeVisita } from '@/features/ficha/types'
import { createClient } from '@/lib/supabase/server'
import { IS_DEMO } from '@/shared/lib/demo'
import { requireProfile } from '@/shared/lib/session'
import { correrMayorMejorUso, faltantesMayorMejorUso, PARAMETROS_DEFAULT } from '../lib/finanzas'
import { correrTamizaje, puedeCorrerTamizaje } from '../lib/tamizaje'
import { getDocumentos, getItemsGuia, getUsos } from './consultas'

// Los dos activadores del estudio. Cada corrida se guarda en `analyses`;
// la ultima es la vigente y se marca desactualizada si algo cambia despues.

type Resultado = { error?: string }
const uuid = z.uuid()

export async function correrTamizajeAction(buildingId: string): Promise<Resultado> {
  if (IS_DEMO) return { error: 'demo' }
  if (!uuid.safeParse(buildingId).success) return { error: 'invalido' }
  const profile = await requireProfile()
  const [docs, items, usos] = await Promise.all([getDocumentos(buildingId), getItemsGuia(buildingId), getUsos(buildingId)])
  if (!puedeCorrerTamizaje(docs, usos)) return { error: 'faltaMinimo' }

  const resultado = correrTamizaje(docs, items, usos)
  const supabase = await createClient()
  const { error } = await supabase.from('analyses').insert({ building_id: buildingId, tipo: 'tamizaje', resultado, corrido_por: profile.id })
  if (error) return { error: error.message }

  // El semaforo de la ficha es el del tamizaje; un edificio identificado pasa a analisis
  const { data } = await supabase.from('buildings').select('etapa').eq('id', buildingId).maybeSingle()
  const etapa = (data as { etapa: string } | null)?.etapa
  await supabase
    .from('buildings')
    .update({ semaforo: resultado.semaforo, ...(etapa === 'identificado' ? { etapa: 'en_analisis' } : {}) })
    .eq('id', buildingId)

  revalidatePath(`/edificios/${buildingId}`, 'layout')
  revalidatePath('/dashboard')
  return {}
}

const parametrosSchema = z.object({
  tasaMinima: z.number().min(0).max(1),
  horizonteAnios: z.number().int().min(1).max(40),
  tasaSalida: z.number().min(0.01).max(1),
  valorLoteVacio: z.number().nonnegative().nullable(),
})

export async function correrMayorMejorUsoAction(buildingId: string, parametros: unknown): Promise<Resultado> {
  if (IS_DEMO) return { error: 'demo' }
  if (!uuid.safeParse(buildingId).success) return { error: 'invalido' }
  const p = parametrosSchema.safeParse(parametros)
  if (!p.success) return { error: 'invalido' }
  const profile = await requireProfile()
  const [items, usos] = await Promise.all([getItemsGuia(buildingId), getUsos(buildingId)])
  const faltantes = faltantesMayorMejorUso(usos, items)
  if (faltantes.sinUsos || faltantes.usosSinNumeros.length > 0) return { error: 'faltanNumeros' }

  const resultado = correrMayorMejorUso(usos, { ...PARAMETROS_DEFAULT, ...p.data })
  const supabase = await createClient()
  const { error } = await supabase
    .from('analyses')
    .insert({ building_id: buildingId, tipo: 'mayor_mejor_uso', resultado, corrido_por: profile.id })
  if (error) return { error: error.message }
  revalidatePath(`/edificios/${buildingId}`, 'layout')
  return {}
}

export async function guardarInformeVisita(buildingId: string, informe: InformeVisita): Promise<Resultado> {
  if (IS_DEMO) return { error: 'demo' }
  if (!uuid.safeParse(buildingId).success) return { error: 'invalido' }
  const profile = await requireProfile()
  const supabase = await createClient()
  const { data } = await supabase.from('visit_notes').select('id').eq('building_id', buildingId).limit(1).maybeSingle()
  const existente = (data as { id: string } | null)?.id
  const fila = { informe, texto: informe.resumenTitulo ?? '', autor: profile.id, fecha: new Date().toISOString() }
  const { error } = existente
    ? await supabase.from('visit_notes').update(fila).eq('id', existente)
    : await supabase.from('visit_notes').insert({ building_id: buildingId, ...fila })
  if (error) return { error: error.message }

  // La visita es parte del minimo del tamizaje: queda "cargada" al guardar el informe
  await supabase.from('building_documents').upsert(
    { building_id: buildingId, codigo: 'G01', estado: 'cargado', updated_by: profile.id, updated_at: new Date().toISOString() },
    { onConflict: 'building_id,codigo', ignoreDuplicates: true }
  )
  revalidatePath(`/edificios/${buildingId}`, 'layout')
  return {}
}
