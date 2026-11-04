import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEdificioDemo } from '@/features/demo/data'
import { ResumenEstudio } from '@/features/estudio/components/resumen-estudio'
import { FlujoEstudio, type DatosFlujo } from '@/features/estudio/components/flujo-estudio'
import { resumirVisita } from '@/features/visita/lib/calificacion'
import { getConsultaAuto, getDocumentos, getEdificio, getFiltros, getFuentes, getInformeVisita, getItemsGuia, getUltimoAnalisis, getUsos } from '@/features/estudio/services/consultas'
import { AnalistaIA } from '@/features/estudio/components/analista-ia'
import { getAnalisisIA } from '@/features/estudio/services/analista'
import { IA_DISPONIBLE } from '@/shared/lib/ai'
import { getDecision } from '@/features/estudio/services/decision'
import type { ResultadoMayorMejorUso, ResultadoTamizaje } from '@/features/estudio/types'
import { FichaView } from '@/features/ficha/components/ficha-view'
import { IS_DEMO } from '@/shared/lib/demo'

async function FichaDemo({ id }: { id: string }) {
  const edificio = getEdificioDemo(id, await getLocale())
  if (!edificio) notFound()
  const t = await getTranslations('comun')
  return (
    <>
      <Link href="/dashboard" className="mb-4 inline-block text-sm text-rojo hover:underline">{t('volverPortafolio')}</Link>
      <FichaView edificio={edificio} />
    </>
  )
}

export default async function EdificioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (IS_DEMO) return <FichaDemo id={id} />

  const [edificio, docs, items, usos, informe, tamizaje, mmu, filtros, fuentes, decision, ia, consulta] = await Promise.all([
    getEdificio(id),
    getDocumentos(id),
    getItemsGuia(id),
    getUsos(id),
    getInformeVisita(id),
    getUltimoAnalisis<ResultadoTamizaje>(id, 'tamizaje'),
    getUltimoAnalisis<ResultadoMayorMejorUso>(id, 'mayor_mejor_uso'),
    getFiltros(id),
    getFuentes(id),
    getDecision(id),
    getAnalisisIA(id),
    getConsultaAuto(id),
  ])
  if (!edificio) notFound()
  const estados = consulta ? Object.values(consulta.estado) : []
  const flujo: DatosFlujo = {
    edificioId: id,
    creado: edificio.createdAt,
    documentosBase: docs.filter((d) => d.codigo === 'F01' && ['cargado', 'validado'].includes(d.estado)).length,
    consulta: consulta ? { fecha: consulta.fecha, ok: estados.filter((e) => e.estado !== 'error').length, total: estados.length } : null,
    visitaCalificadas: resumirVisita(informe)?.calificadas ?? 0,
    ia: ia ? { fecha: ia.fecha, puntaje: ia.puntajeGlobal } : null,
    iaDisponible: IA_DISPONIBLE,
  }
  return <ResumenEstudio edificio={edificio} docs={docs} items={items} usos={usos} informe={informe} tamizaje={tamizaje} mmu={mmu} filtros={filtros} fuentes={fuentes} decision={decision} flujo={<FlujoEstudio d={flujo} className="md:col-span-4" />} ia={<AnalistaIA edificioId={id} analisis={ia} disponible={IA_DISPONIBLE} desde={consulta?.fecha ?? null} className="md:col-span-4" />} />
}
