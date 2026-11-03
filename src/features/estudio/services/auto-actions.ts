'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { IS_DEMO } from '@/shared/lib/demo'
import { requireProfile } from '@/shared/lib/session'
import { correrAnalista } from './analista'
import { consultarYAplicar } from './auto-aplicar'

// Botón "Consultar automáticamente": vuelve a cruzar el predio con las capas oficiales.
// El código de lote (12 dígitos de Catastro) sirve cuando la dirección no se reconoce.

const entrada = z.object({
  buildingId: z.uuid(),
  codigoLote: z.string().trim().regex(/^\d{6,15}$/).nullable().optional(),
})

export async function consultarAutomaticamente(datos: z.infer<typeof entrada>): Promise<{ error?: string; aplicados?: number }> {
  if (IS_DEMO) return { error: 'demo' }
  const parsed = entrada.safeParse(datos)
  if (!parsed.success) return { error: 'invalido' }
  await requireProfile()
  const supabase = await createClient()
  const r = await consultarYAplicar(supabase, parsed.data.buildingId, parsed.data.codigoLote)
  if (!r) return { error: 'invalido' }
  revalidatePath(`/edificios/${parsed.data.buildingId}`, 'layout')
  if (!r.consulta.lote) return { error: r.consulta.estado.ubicacion?.estado === 'error' || r.consulta.estado.lote?.estado === 'error' ? 'sinRespuesta' : 'sinLote' }
  return { aplicados: r.aplicados }
}

// Botón "Pedir análisis al analista IA"
export async function pedirAnalisisIA(buildingId: string): Promise<{ error?: string }> {
  if (IS_DEMO) return { error: 'demo' }
  if (!z.uuid().safeParse(buildingId).success) return { error: 'invalido' }
  await requireProfile()
  const r = await correrAnalista(buildingId)
  revalidatePath(`/edificios/${buildingId}`, 'layout')
  return r.ok ? {} : { error: r.error }
}
