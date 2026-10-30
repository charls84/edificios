import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEdificioDemo } from '@/features/demo/data'
import { ResumenEstudio } from '@/features/estudio/components/resumen-estudio'
import { getDocumentos, getEdificio, getInformeVisita, getItemsGuia, getUltimoAnalisis, getUsos } from '@/features/estudio/services/consultas'
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
  return <ResumenEstudio edificio={edificio} docs={docs} items={items} usos={usos} informe={informe} tamizaje={tamizaje} mmu={mmu} />
}
