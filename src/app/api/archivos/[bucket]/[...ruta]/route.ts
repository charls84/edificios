import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Sirve archivos privados de Storage (documentos y fotos) con la sesion del usuario:
// RLS decide si puede verlos. Asi un <img src="/api/archivos/fotos/..."> funciona
// sin exponer el bucket ni firmar URLs.
const BUCKETS = new Set(['documentos', 'fotos'])

export async function GET(_req: Request, { params }: { params: Promise<{ bucket: string; ruta: string[] }> }) {
  const { bucket, ruta } = await params
  if (!BUCKETS.has(bucket)) return new NextResponse(null, { status: 404 })

  const supabase = await createClient()
  const { data, error } = await supabase.storage.from(bucket).download(ruta.join('/'))
  if (error || !data) return new NextResponse(null, { status: 404 })

  const nombre = ruta.at(-1) ?? 'archivo'
  return new NextResponse(data, {
    headers: {
      'Content-Type': data.type || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${encodeURIComponent(nombre)}"`,
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
