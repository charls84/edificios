import { getTranslations } from 'next-intl/server'
import { AuthShell, DemoLogin, LoginForm } from '@/features/auth/components'
import { ReenvioHash } from '@/features/auth/components/reenvio-hash'
import { IS_DEMO } from '@/shared/lib/demo'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const t = await getTranslations()

  return (
    <AuthShell title={t('auth.entrarTitulo')} subtitle={t('auth.entrarSubtitulo')}>
      <ReenvioHash />
      {IS_DEMO ? (
        <DemoLogin />
      ) : (
        <LoginForm initialError={error === 'enlace_invalido' ? t('errores.enlaceInvalido') : undefined} />
      )}
    </AuthShell>
  )
}
