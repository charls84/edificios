import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { FormularioEdificio } from '@/features/estudio/components/formulario-edificio'
import { getEdificio } from '@/features/estudio/services/consultas'
import { actualizarEdificio } from '@/features/estudio/services/edificios-actions'
import { IS_DEMO } from '@/shared/lib/demo'

export default async function EditarEdificioPage({ params }: { params: Promise<{ id: string }> }) {
  if (IS_DEMO) notFound()
  const { id } = await params
  const edificio = await getEdificio(id)
  if (!edificio) notFound()
  const t = await getTranslations('estudio.formulario')

  return (
    <section className="bento">
      <h2 className="text-xl font-bold">{t('editarTitulo')}</h2>
      <div className="mt-4">
        <FormularioEdificio action={actualizarEdificio.bind(null, id)} inicial={edificio} />
      </div>
    </section>
  )
}
