import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { AuthShell, ForgotPasswordForm } from '@/features/auth/components'

export default async function ForgotPasswordPage() {
  const t = await getTranslations('auth')
  return (
    <AuthShell title={t('restablecerTitulo')} subtitle={t('restablecerSubtitulo')}>
      <ForgotPasswordForm />
      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-rojo hover:underline">{t('volverEntrar')}</Link>
      </p>
    </AuthShell>
  )
}
