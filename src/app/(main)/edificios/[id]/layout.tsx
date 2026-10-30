import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { EncabezadoEdificio } from '@/features/estudio/components/encabezado-edificio'
import { Pestanas } from '@/features/estudio/components/pestanas'
import { getEdificio } from '@/features/estudio/services/consultas'
import { IS_DEMO } from '@/shared/lib/demo'
import { requireProfile } from '@/shared/lib/session'

// En modo real la ficha es un estudio con pestañas; en el demo sigue siendo la ficha de una sola pagina
export default async function EdificioLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  if (IS_DEMO) return children
  const { id } = await params
  const [edificio, profile, t] = await Promise.all([getEdificio(id), requireProfile(), getTranslations('comun')])
  if (!edificio) notFound()

  return (
    <div className="space-y-4">
      <Link href="/dashboard" className="inline-block text-sm text-rojo hover:underline">{t('volverPortafolio')}</Link>
      <EncabezadoEdificio edificio={edificio} esAdmin={profile.role === 'admin'} />
      <Pestanas edificioId={id} />
      <div>{children}</div>
    </div>
  )
}
