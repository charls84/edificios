import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { signout } from '@/features/auth/services/actions'
import { SelectorIdioma } from '@/shared/components/selector-idioma'
import { IS_DEMO } from '@/shared/lib/demo'
import { requireProfile } from '@/shared/lib/session'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile()
  const t = await getTranslations('comun')

  if (profile.role === 'sin_acceso') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="bento max-w-md text-center">
          <h1 className="text-xl font-bold">{t('sinAccesoTitulo')}</h1>
          <p className="mt-2 text-sm text-medio-texto">{t('sinAccesoTexto')}</p>
          <form action={signout} className="mt-6">
            <button className="boton">{t('salir')}</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {IS_DEMO && (
        <p className="bg-medio-texto px-4 py-1.5 text-center text-xs font-semibold text-white">{t('bannerDemo')}</p>
      )}
      <header className="border-b-2 border-rojo bg-torna">
        <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2 text-sm sm:gap-6">
          <Link href="/dashboard" aria-label={t('irPortafolio')} className="shrink-0">
            <Image
              src="/brand/torna-logo-oscuro.png"
              alt={t('logoAlt')}
              width={900}
              height={252}
              priority
              className="h-9 w-auto sm:h-11"
            />
          </Link>
          <Link href="/dashboard" className="hidden text-white/80 hover:text-white sm:inline">{t('portafolio')}</Link>
          {profile.role === 'admin' && (
            <Link href="/equipo" className="text-white/80 hover:text-white">{t('equipo')}</Link>
          )}
          <span className="ml-auto hidden text-white/70 lg:inline">{IS_DEMO ? t('usuarioDemo') : (profile.full_name ?? profile.email)}</span>
          <span className="ml-auto lg:ml-0">
            <SelectorIdioma />
          </span>
          <form action={signout}>
            <button className="whitespace-nowrap text-white/80 hover:text-white">{t('salir')}</button>
          </form>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}
