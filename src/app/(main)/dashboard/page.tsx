import { ListaEdificios } from '@/features/portafolio/components/lista-edificios'
import { MapaEdificios } from '@/features/portafolio/components/mapa-edificios'
import { PortafolioBento } from '@/features/portafolio/components/portafolio-bento'
import { listEdificios } from '@/features/portafolio/services/edificios'
import { getConteoPorEtapa } from '@/features/portafolio/services/stats'

export default async function DashboardPage() {
  const [{ conteo, error }, edificios] = await Promise.all([getConteoPorEtapa(), listEdificios()])

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Portafolio de edificios</h1>
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
