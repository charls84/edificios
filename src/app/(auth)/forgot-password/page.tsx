import Link from 'next/link'
import { AuthShell, ForgotPasswordForm } from '@/features/auth/components'

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Restablecer contraseña" subtitle="Te enviaremos un enlace a tu correo.">
      <ForgotPasswordForm />
      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-ladrillo hover:underline">Volver a entrar</Link>
      </p>
    </AuthShell>
  )
}
