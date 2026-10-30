import { notFound } from 'next/navigation'
import { FiltrosTorna } from '@/features/estudio/components/filtros-torna'
import { getFiltros } from '@/features/estudio/services/consultas'
import { IS_DEMO } from '@/shared/lib/demo'

export default async function FiltrosPage({ params }: { params: Promise<{ id: string }> }) {
  if (IS_DEMO) notFound()
  const { id } = await params
  return <FiltrosTorna edificioId={id} evaluaciones={await getFiltros(id)} />
}
