import 'server-only'
import { EDIFICIOS_DEMO } from '@/features/demo/data'
import type { Semaforo } from '@/features/ficha/types'
import { createClient } from '@/lib/supabase/server'
import { IS_DEMO } from '@/shared/lib/demo'
import type { Etapa } from '@/shared/types/database'

export interface ResumenEdificio {
  id: string
  nombre: string
  direccion: string
  chip: string | null
  zona: string | null
  etapa: Etapa
  semaforo: Semaforo | null
  lat: number | null
  lng: number | null
  foto: string | null
}

export async function listEdificios(): Promise<ResumenEdificio[]> {
  if (IS_DEMO) {
    return EDIFICIOS_DEMO.map(({ id, nombre, direccion, chip, zona, etapa, semaforo, lat, lng, fotos }) => ({
      id, nombre, direccion, chip, zona, etapa, semaforo, lat, lng, foto: fotos[0]?.src ?? null,
    }))
  }
  const supabase = await createClient()
  const { data } = await supabase
    .from('buildings')
    .select('id, direccion, chip, etapa')
    .order('updated_at', { ascending: false })
  return (data ?? []).map((b) => ({
    id: b.id,
    nombre: b.direccion,
    direccion: b.direccion,
    chip: b.chip,
    zona: null,
    etapa: b.etapa,
    semaforo: null,
    // Coordenadas y fotos reales llegan con la ficha (Fase 1): geom en PostGIS y fotos de visita
    lat: null,
    lng: null,
    foto: null,
  }))
}
