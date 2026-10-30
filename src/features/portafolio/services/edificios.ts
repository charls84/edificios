import 'server-only'
import { getLocale } from 'next-intl/server'
import { getEdificiosDemo } from '@/features/demo/data'
import type { Semaforo } from '@/features/ficha/types'
import { listEdificiosReales } from '@/features/estudio/services/consultas'
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
    return getEdificiosDemo(await getLocale()).map(({ id, nombre, direccion, chip, zona, etapa, semaforo, lat, lng, fotos }) => ({
      id, nombre, direccion, chip, zona, etapa, semaforo, lat, lng, foto: fotos[0]?.src ?? null,
    }))
  }
  return (await listEdificiosReales()).map((b) => ({
    id: b.id,
    nombre: b.nombre,
    direccion: b.direccion,
    chip: b.chip,
    zona: b.zona,
    etapa: b.etapa,
    semaforo: b.semaforo,
    lat: b.lat,
    lng: b.lng,
    // La foto principal llega con la visita tecnica; en la lista se muestra el marcador neutro
    foto: null,
  }))
}
