import { createClient } from '@/lib/supabase/client'

// Carga de archivos desde el navegador directo a Supabase Storage (RLS: solo el equipo).
// Se hace desde el cliente para no pasar PDF grandes por el servidor de la app.

export const RUTA_API = '/api/archivos'

export const urlArchivo = (bucket: 'documentos' | 'fotos', ruta: string) => `${RUTA_API}/${bucket}/${ruta}`

function extension(nombre: string, fallback: string) {
  const ext = nombre.split('.').pop()?.toLowerCase()
  return ext && ext.length <= 5 ? ext : fallback
}

export async function subirArchivo(bucket: 'documentos' | 'fotos', edificioId: string, archivo: Blob, nombre: string) {
  const ruta = `${edificioId}/${crypto.randomUUID()}.${extension(nombre, bucket === 'fotos' ? 'jpg' : 'pdf')}`
  const { error } = await createClient().storage.from(bucket).upload(ruta, archivo, {
    contentType: archivo.type || undefined,
    upsert: false,
  })
  if (error) throw new Error(error.message)
  return ruta
}

export function formatoTamano(bytes: number | null) {
  if (bytes == null) return ''
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
