import { notFound } from 'next/navigation'
import { Analisis } from '@/features/estudio/components/analisis'
import { faltantesMayorMejorUso } from '@/features/estudio/lib/finanzas'
import { documentosMinimoFaltantes } from '@/features/estudio/lib/tamizaje'
import { getDocumentos, getItemsGuia, getUltimoAnalisis, getUsos } from '@/features/estudio/services/consultas'
import type { ResultadoMayorMejorUso, ResultadoTamizaje } from '@/features/estudio/types'
import { IS_DEMO } from '@/shared/lib/demo'

export default async function AnalisisPage({ params }: { params: Promise<{ id: string }> }) {
  if (IS_DEMO) notFound()
  const { id } = await params
  const [docs, items, usos, tamizaje, mmu] = await Promise.all([
    getDocumentos(id),
    getItemsGuia(id),
    getUsos(id),
    getUltimoAnalisis<ResultadoTamizaje>(id, 'tamizaje'),
    getUltimoAnalisis<ResultadoMayorMejorUso>(id, 'mayor_mejor_uso'),
  ])

  return (
    <Analisis
      edificioId={id}
      minimoFaltante={documentosMinimoFaltantes(docs)}
      sinUsos={usos.length === 0}
      faltantesMmu={faltantesMayorMejorUso(usos, items)}
      tamizaje={tamizaje}
      mmu={mmu}
    />
  )
}
