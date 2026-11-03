import { notFound } from 'next/navigation'
import { ChecklistDocumentos } from '@/features/estudio/components/checklist-documentos'
import { getConsultaAuto, getDocumentos } from '@/features/estudio/services/consultas'
import { IA_DISPONIBLE } from '@/shared/lib/ai'
import { IS_DEMO } from '@/shared/lib/demo'

export default async function DocumentosPage({ params }: { params: Promise<{ id: string }> }) {
  if (IS_DEMO) notFound()
  const { id } = await params
  const [estados, consulta] = await Promise.all([getDocumentos(id), getConsultaAuto(id)])
  return <ChecklistDocumentos edificioId={id} estados={estados} yaAnalizado={Boolean(consulta)} iaDisponible={IA_DISPONIBLE} />
}
