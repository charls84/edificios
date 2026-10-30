import { notFound } from 'next/navigation'
import { getInformeVisita } from '@/features/estudio/services/consultas'
import { VisitaTecnica } from '@/features/visita/components/visita-tecnica'
import { IS_DEMO } from '@/shared/lib/demo'

export default async function VisitaPage({ params }: { params: Promise<{ id: string }> }) {
  if (IS_DEMO) notFound()
  const { id } = await params
  return <VisitaTecnica edificioId={id} inicial={await getInformeVisita(id)} modo="servidor" />
}
