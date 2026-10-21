import { getTranslations } from 'next-intl/server'
import { AuthShell, UpdatePasswordForm } from '@/features/auth/components'

export default async function UpdatePasswordPage() {
  const t = await getTranslations('auth')
  return (
    <AuthShell title={t('definirTitulo')} subtitle={t('definirSubtitulo')}>
      <UpdatePasswordForm />
    </AuthShell>
  )
}
