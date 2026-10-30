import { notFound } from 'next/navigation'
import { ChecklistDocumentos } from '@/features/estudio/components/checklist-documentos'
import { getDocumentos } from '@/features/estudio/services/consultas'
import { IS_DEMO } from '@/shared/lib/demo'

export default async function DocumentosPage({ params }: { params: Promise<{ id: string }> }) {
  if (IS_DEMO) notFound()
  const { id } = await params
  return <ChecklistDocumentos edificioId={id} estados={await getDocumentos(id)} />
}
