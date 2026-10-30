import { subirArchivo, urlArchivo } from '@/features/estudio/lib/archivos'
import { IS_DEMO } from '@/shared/lib/demo'
import { comprimirImagen, guardarFoto } from './fotos-db'

// Una foto de visita se comprime siempre; luego va a este navegador (demo) o a
// Supabase Storage (modo real), y se guarda en el informe solo como ruta.
export async function subirFotoVisita(file: File, edificioId: string): Promise<string> {
  const blob = await comprimirImagen(file)
  if (IS_DEMO) return guardarFoto(blob)
  const ruta = await subirArchivo('fotos', edificioId, blob, 'foto.jpg')
  return urlArchivo('fotos', ruta)
}
