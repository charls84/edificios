import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ListaEdificios } from '@/features/portafolio/components/lista-edificios'
import { MapaEdificios } from '@/features/portafolio/components/mapa-edificios'
import { PortafolioBento } from '@/features/portafolio/components/portafolio-bento'
import { listEdificios } from '@/features/portafolio/services/edificios'
import { getConteoPorEtapa } from '@/features/portafolio/services/stats'
import { IS_DEMO } from '@/shared/lib/demo'

export default async function DashboardPage() {
  const [{ conteo, error }, edificios] = await Promise.all([getConteoPorEtapa(), listEdificios()])
  const t = await getTranslations('portafolio')

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('titulo')}</h1>
        {!IS_DEMO && <Link href="/edificios/nuevo" className="boton w-auto">{t('matricular')}</Link>}
      </div>
      <PortafolioBento conteo={conteo} error={error} />
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <ListaEdificios edificios={edificios} />
        </div>
        <div className="h-[420px] lg:col-span-3 lg:h-auto">
          <MapaEdificios edificios={edificios} />
        </div>
      </div>
    </>
  )
}
