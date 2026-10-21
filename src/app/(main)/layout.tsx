import Image from 'next/image'
import Link from 'next/link'
import { signout } from '@/features/auth/services/actions'
import { IS_DEMO } from '@/shared/lib/demo'
import { requireProfile } from '@/shared/lib/session'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile()

  if (profile.role === 'sin_acceso') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="bento max-w-md text-center">
          <h1 className="text-xl font-bold">Tu cuenta no tiene acceso</h1>
          <p className="mt-2 text-sm text-medio-texto">
            Pide a un administrador del equipo que te envíe una invitación.
          </p>
          <form action={signout} className="mt-6">
            <button className="boton">Salir</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {IS_DEMO && (
        <p className="bg-medio-texto px-4 py-1.5 text-center text-xs font-semibold text-white">
          Modo demostración · todos los edificios y datos son ficticios
        </p>
      )}
      <header className="border-b-2 border-rojo bg-torna">
        <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-2 text-sm">
          <Link href="/dashboard" aria-label="Torna, ir al portafolio" className="shrink-0">
            <Image
              src="/brand/torna-logo-oscuro.png"
              alt="Torna Rehabilitación Urbana"
              width={900}
              height={252}
              priority
              className="h-9 w-auto sm:h-11"
            />
          </Link>
          <Link href="/dashboard" className="text-white/80 hover:text-white">Portafolio</Link>
          {profile.role === 'admin' && (
            <Link href="/equipo" className="text-white/80 hover:text-white">Equipo</Link>
          )}
          <span className="ml-auto hidden text-white/70 sm:inline">{profile.full_name ?? profile.email}</span>
          <form action={signout} className="ml-auto sm:ml-0">
            <button className="text-white/80 hover:text-white">Salir</button>
          </form>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}
