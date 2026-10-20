import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { EDIFICIOS_DEMO } from '@/features/demo/data'
import { IS_DEMO } from '@/shared/lib/demo'
import type { Etapa } from '@/shared/types/database'

export type ConteoEtapas = Record<Etapa, number>

export async function getConteoPorEtapa(): Promise<{ conteo: ConteoEtapas; error: boolean }> {
  const conteo: ConteoEtapas = {
    identificado: 0,
    en_analisis: 0,
    presentado: 0,
    descartado: 0,
    en_intervencion: 0,
  }
  if (IS_DEMO) {
    for (const e of EDIFICIOS_DEMO) conteo[e.etapa] += 1
    return { conteo, error: false }
  }
  const supabase = await createClient()
  const { data, error } = await supabase.from('buildings').select('etapa')
  if (error) return { conteo, error: true }

  for (const row of data as { etapa: Etapa }[]) conteo[row.etapa] += 1
  return { conteo, error: false }
}
