import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEdificioDemo } from '@/features/demo/data'
import { FichaView } from '@/features/ficha/components/ficha-view'
import { IS_DEMO } from '@/shared/lib/demo'

export default async function EdificioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Fuera del demo, la ficha completa se construye en la Fase 1.
  const edificio = IS_DEMO ? getEdificioDemo(id) : null
  if (!edificio) notFound()

  return (
    <>
      <Link href="/dashboard" className="mb-4 inline-block text-sm text-ladrillo hover:underline">
        ← Volver al portafolio
      </Link>
      <FichaView edificio={edificio} />
    </>
  )
}
