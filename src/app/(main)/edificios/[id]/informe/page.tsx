import { notFound } from 'next/navigation'
import { Informe } from '@/features/estudio/components/informe'
import { getConsultaAuto, getDocumentos, getEdificio, getFuentes, getInformeVisita, getItemsGuia, getUltimoAnalisis, getUsos } from '@/features/estudio/services/consultas'
import { AnalistaIA } from '@/features/estudio/components/analista-ia'
import { getAnalisisIA } from '@/features/estudio/services/analista'
import { getDecision } from '@/features/estudio/services/decision'
import type { ResultadoMayorMejorUso, ResultadoTamizaje } from '@/features/estudio/types'
import { IS_DEMO } from '@/shared/lib/demo'

export default async function InformePage({ params }: { params: Promise<{ id: string }> }) {
  if (IS_DEMO) notFound()
  const { id } = await params
  const [edificio, docs, items, usos, informe, tamizaje, mmu, fuentes, decision, ia, consulta] = await Promise.all([
    getEdificio(id),
    getDocumentos(id),
    getItemsGuia(id),
    getUsos(id),
    getInformeVisita(id),
    getUltimoAnalisis<ResultadoTamizaje>(id, 'tamizaje'),
    getUltimoAnalisis<ResultadoMayorMejorUso>(id, 'mayor_mejor_uso'),
    getFuentes(id),
    getDecision(id),
    getAnalisisIA(id),
    getConsultaAuto(id),
  ])
  if (!edificio) notFound()
  return <Informe edificio={edificio} docs={docs} items={items} usos={usos} informe={informe} tamizaje={tamizaje} mmu={mmu} fuentes={fuentes} decision={decision} ia={<AnalistaIA edificioId={id} analisis={ia} disponible={false} className="border-0 p-0 shadow-none" />} iaDatos={ia} consulta={consulta} />
}
