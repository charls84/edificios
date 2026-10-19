import { AuthShell, UpdatePasswordForm } from '@/features/auth/components'

export default function UpdatePasswordPage() {
  return (
    <AuthShell title="Define tu contraseña" subtitle="La usarás para entrar a partir de ahora.">
      <UpdatePasswordForm />
    </AuthShell>
  )
}
