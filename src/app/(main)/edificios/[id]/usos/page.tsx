import { notFound } from 'next/navigation'
import { UsosCandidatos } from '@/features/estudio/components/usos-candidatos'
import { getUsos } from '@/features/estudio/services/consultas'
import { IS_DEMO } from '@/shared/lib/demo'

export default async function UsosPage({ params }: { params: Promise<{ id: string }> }) {
  if (IS_DEMO) notFound()
  const { id } = await params
  return <UsosCandidatos edificioId={id} usos={await getUsos(id)} />
}
