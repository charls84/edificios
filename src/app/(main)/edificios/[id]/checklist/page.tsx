import { notFound } from 'next/navigation'
import { ChecklistGuia } from '@/features/estudio/components/checklist-guia'
import { getItemsGuia } from '@/features/estudio/services/consultas'
import { IS_DEMO } from '@/shared/lib/demo'

export default async function ChecklistPage({ params }: { params: Promise<{ id: string }> }) {
  if (IS_DEMO) notFound()
  const { id } = await params
  return <ChecklistGuia edificioId={id} estados={await getItemsGuia(id)} />
}
