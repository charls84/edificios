import { notFound } from 'next/navigation'
import { FuentesEnLinea } from '@/features/estudio/components/fuentes-en-linea'
import { getEdificio, getFuentes } from '@/features/estudio/services/consultas'
import { IS_DEMO } from '@/shared/lib/demo'

export default async function FuentesPage({ params }: { params: Promise<{ id: string }> }) {
  if (IS_DEMO) notFound()
  const { id } = await params
  const [edificio, valores] = await Promise.all([getEdificio(id), getFuentes(id)])
  if (!edificio) notFound()
  return <FuentesEnLinea edificioId={id} chip={edificio.chip} valores={valores} />
}
