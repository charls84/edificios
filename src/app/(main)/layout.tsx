import { getTranslations } from 'next-intl/server'
import { signout } from '@/features/auth/services/actions'
import { Navegacion } from '@/shared/components/navegacion'
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
      <Navegacion
        esAdmin={profile.role === 'admin'}
        usuario={IS_DEMO ? t('usuarioDemo') : (profile.full_name ?? profile.email)}
      />
      <div className="lg:pl-64">
        {IS_DEMO && (
          <p className="bg-medio-texto px-4 py-1.5 text-center text-xs font-semibold text-white">{t('bannerDemo')}</p>
        )}
        <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
      </div>
    </div>
  )
}
