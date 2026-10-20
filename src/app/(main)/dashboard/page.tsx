import { ListaEdificios } from '@/features/portafolio/components/lista-edificios'
import { PortafolioBento } from '@/features/portafolio/components/portafolio-bento'
import { listEdificios } from '@/features/portafolio/services/edificios'
import { getConteoPorEtapa } from '@/features/portafolio/services/stats'

export default async function DashboardPage() {
  const [{ conteo, error }, edificios] = await Promise.all([getConteoPorEtapa(), listEdificios()])

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Portafolio de edificios</h1>
      <PortafolioBento conteo={conteo} error={error} />
      <ListaEdificios edificios={edificios} />
    </>
  )
}
