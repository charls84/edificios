import { getTranslations } from 'next-intl/server'
import { AuthShell } from '@/features/auth/components'
import { ConfirmarEnlace } from '@/features/auth/components/confirmar-enlace'

export default async function ConfirmarPage() {
  const t = await getTranslations('auth.confirmar')
  return (
    <AuthShell title={t('titulo')} subtitle={t('subtitulo')}>
      <ConfirmarEnlace />
    </AuthShell>
  )
}
