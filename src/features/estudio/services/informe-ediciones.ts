'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { IS_DEMO } from '@/shared/lib/demo'
import { requireProfile } from '@/shared/lib/session'
import { SECCIONES_EDITABLES, type CambioInforme, type NotaInforme } from '../lib/informe-ediciones'

// Ediciones manuales del informe antes de exportarlo. Cada sección guarda su texto con autor
// y fecha, y todo cambio queda en un historial que el informe imprime como "Control de cambios".

const entrada = z.object({
  buildingId: z.uuid(),
  clave: z.enum(SECCIONES_EDITABLES),
  texto: z.string().trim().max(4000),
  decision: z.enum(['continuar', 'continuar_condiciones', 'descartar', 'falta_informacion']).nullable().optional(),
})

export async function guardarNotaInforme(datos: z.infer<typeof entrada>): Promise<{ error?: string }> {
  if (IS_DEMO) return { error: 'demo' }
  const p = entrada.safeParse(datos)
  if (!p.success) return { error: 'invalido' }
  const { buildingId, clave, texto, decision } = p.data
  const profile = await requireProfile()
  const supabase = await createClient()
  const ahora = new Date().toISOString()
  const autor = profile.full_name || profile.email

  const { data: previa } = await supabase.from('data_points').select('valor').eq('building_id', buildingId).eq('categoria', 'informe').eq('clave', clave).maybeSingle()
  const antes = (previa as { valor: NotaInforme } | null)?.valor
  const accion: CambioInforme['accion'] = !texto && !decision ? 'borro' : antes?.texto || antes?.decision ? 'edito' : 'agrego'

  // Borrar filas es solo para administradores (RLS): una nota vacía cuenta como borrada
  const nota: NotaInforme = { texto, decision: decision ?? null, autor, fecha: ahora }
  const { error } = await supabase.from('data_points').upsert(
    { building_id: buildingId, categoria: 'informe', clave, valor: nota, estado: 'validado', validado_por: profile.id, fecha_consulta: ahora },
    { onConflict: 'building_id,categoria,clave' }
  )
  if (error) return { error: error.message }

  const { data: h } = await supabase.from('data_points').select('valor').eq('building_id', buildingId).eq('categoria', 'informe').eq('clave', 'historial').maybeSingle()
  const cambios = ((h as { valor: { cambios?: CambioInforme[] } } | null)?.valor?.cambios ?? []).slice(-199)
  cambios.push({ seccion: clave, accion, autor, fecha: ahora })
  await supabase.from('data_points').upsert(
    { building_id: buildingId, categoria: 'informe', clave: 'historial', valor: { cambios }, estado: 'validado', fecha_consulta: ahora },
    { onConflict: 'building_id,categoria,clave' }
  )
  revalidatePath(`/edificios/${buildingId}/informe`)
  return {}
}
