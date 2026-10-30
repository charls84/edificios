import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { FormularioEdificio } from '@/features/estudio/components/formulario-edificio'
import { crearEdificio } from '@/features/estudio/services/edificios-actions'
import { IS_DEMO } from '@/shared/lib/demo'

export default async function NuevoEdificioPage() {
  const t = await getTranslations()

  return (
    <>
      <Link href="/dashboard" className="mb-4 inline-block text-sm text-rojo hover:underline">{t('comun.volverPortafolio')}</Link>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="bento lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-medio-texto">{t('estudio.paso', { n: 1 })}</p>
          <h1 className="mt-1 text-2xl font-bold">{t('estudio.formulario.titulo')}</h1>
          <p className="mt-1 text-sm text-medio-texto">{t('estudio.formulario.texto')}</p>
          {IS_DEMO && (
            <p className="mt-4 rounded-xl bg-ambar-claro px-4 py-3 text-sm">{t('estudio.soloModoReal')}</p>
          )}
          <div className="mt-6">
            <FormularioEdificio action={crearEdificio} />
          </div>
        </section>
        <aside className="bento space-y-3 text-sm">
          <h2 className="font-semibold">{t('estudio.formulario.queSigueTitulo')}</h2>
          <ol className="list-decimal space-y-2 pl-5 text-medio-texto">
            {(t.raw('estudio.formulario.queSigue') as string[]).map((p) => <li key={p}>{p}</li>)}
          </ol>
        </aside>
      </div>
    </>
  )
}
