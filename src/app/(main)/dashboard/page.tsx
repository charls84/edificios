import { PortafolioBento } from '@/features/portafolio/components/portafolio-bento'
import { getConteoPorEtapa } from '@/features/portafolio/services/stats'

export default async function DashboardPage() {
  const { conteo, error } = await getConteoPorEtapa()

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Portafolio de edificios</h1>
      <PortafolioBento conteo={conteo} error={error} />
    </>
  )
}
