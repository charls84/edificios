import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { DecisionSugerida } from '@/features/estudio/components/decision-sugerida'
import { AnalistaIA } from '@/features/estudio/components/analista-ia'
import { getAnalisisIA } from '@/features/estudio/services/analista'
import { IA_DISPONIBLE } from '@/shared/lib/ai'
import { getDecision } from '@/features/estudio/services/decision'
import { CalificacionVisita } from '@/features/visita/components/calificacion-visita'
import { resumirVisita } from '@/features/visita/lib/calificacion'
import { Analisis } from '@/features/estudio/components/analisis'
import { faltantesMayorMejorUso } from '@/features/estudio/lib/finanzas'
import { documentosMinimoFaltantes } from '@/features/estudio/lib/tamizaje'
import { getConsultaAuto, getDocumentos, getInformeVisita, getItemsGuia, getUltimoAnalisis, getUsos } from '@/features/estudio/services/consultas'
import type { ResultadoMayorMejorUso, ResultadoTamizaje } from '@/features/estudio/types'
import { IS_DEMO } from '@/shared/lib/demo'

export default async function AnalisisPage({ params }: { params: Promise<{ id: string }> }) {
  if (IS_DEMO) notFound()
  const { id } = await params
  const [docs, items, usos, tamizaje, mmu, decision, informe, t, ia, consulta] = await Promise.all([
    getDocumentos(id),
    getItemsGuia(id),
    getUsos(id),
    getUltimoAnalisis<ResultadoTamizaje>(id, 'tamizaje'),
    getUltimoAnalisis<ResultadoMayorMejorUso>(id, 'mayor_mejor_uso'),
    getDecision(id),
    getInformeVisita(id),
    getTranslations('estudio.visitaAnalisis'),
    getAnalisisIA(id),
    getConsultaAuto(id),
  ])
  const visita = resumirVisita(informe)

  return (
    <div className="space-y-4">
      <AnalistaIA edificioId={id} analisis={ia} disponible={IA_DISPONIBLE} desde={consulta?.fecha ?? null} />
      <DecisionSugerida sugerencia={decision} />
      <section className="bento" aria-labelledby="visita-analisis">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="visita-analisis" className="text-lg font-bold">{t('titulo')}</h2>
          <Link href={`/edificios/${id}/visita`} className="text-sm text-rojo hover:underline">{t('ir')}</Link>
        </div>
        {visita && visita.calificadas > 0 ? <CalificacionVisita resumen={visita} /> : <p className="text-sm text-medio-texto">{t('sinVisita')}</p>}
      </section>
      <Analisis
        edificioId={id}
        minimoFaltante={documentosMinimoFaltantes(docs)}
        sinUsos={usos.length === 0}
        faltantesMmu={faltantesMayorMejorUso(usos, items)}
        tamizaje={tamizaje}
        mmu={mmu}
      />
    </div>
  )
}
