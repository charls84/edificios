import { notFound } from 'next/navigation'
import { Informe } from '@/features/estudio/components/informe'
import { getDocumentos, getEdificio, getInformeVisita, getItemsGuia, getUltimoAnalisis, getUsos } from '@/features/estudio/services/consultas'
import type { ResultadoMayorMejorUso, ResultadoTamizaje } from '@/features/estudio/types'
import { IS_DEMO } from '@/shared/lib/demo'

export default async function InformePage({ params }: { params: Promise<{ id: string }> }) {
  if (IS_DEMO) notFound()
  const { id } = await params
  const [edificio, docs, items, usos, informe, tamizaje, mmu] = await Promise.all([
    getEdificio(id),
    getDocumentos(id),
    getItemsGuia(id),
    getUsos(id),
    getInformeVisita(id),
    getUltimoAnalisis<ResultadoTamizaje>(id, 'tamizaje'),
    getUltimoAnalisis<ResultadoMayorMejorUso>(id, 'mayor_mejor_uso'),
  ])
  if (!edificio) notFound()
  return <Informe edificio={edificio} docs={docs} items={items} usos={usos} informe={informe} tamizaje={tamizaje} mmu={mmu} />
}
