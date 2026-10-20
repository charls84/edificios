import { AuthShell, DemoLogin, LoginForm } from '@/features/auth/components'
import { IS_DEMO } from '@/shared/lib/demo'

const ERRORS: Record<string, string> = {
  enlace_invalido: 'El enlace expiró o ya se usó. Pide uno nuevo.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <AuthShell title="Entrar" subtitle="Acceso solo para el equipo invitado.">
      {IS_DEMO ? <DemoLogin /> : <LoginForm initialError={error ? ERRORS[error] : undefined} />}
    </AuthShell>
  )
}
