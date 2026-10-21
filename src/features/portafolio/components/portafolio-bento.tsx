import { useTranslations } from 'next-intl'
import type { ConteoEtapas } from '../services/stats'

const ETAPAS: { key: keyof ConteoEtapas; clase: string }[] = [
  { key: 'identificado', clase: 'bg-white' },
  { key: 'en_analisis', clase: 'bg-piedra' },
  { key: 'presentado', clase: 'bg-verde-claro' },
  { key: 'en_intervencion', clase: 'bg-rojo-claro' },
  { key: 'descartado', clase: 'bg-white' },
]

export function PortafolioBento({ conteo, error }: { conteo: ConteoEtapas; error: boolean }) {
  const t = useTranslations()
  const total = Object.values(conteo).reduce((a, b) => a + b, 0)

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
      <section className="bento col-span-2 flex flex-col justify-between border-torna bg-torna text-white md:row-span-2 lg:col-span-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70">{t('portafolio.etiqueta')}</p>
        <div className="mt-8">
          <p className="text-6xl font-bold">{total}</p>
          <span className="mt-3 block h-1 w-12 rounded-full bg-rojo" aria-hidden />
          <p className="mt-1 text-white/80">{t('portafolio.registrados')}</p>
        </div>
      </section>

      {ETAPAS.map((e) => (
        <section key={e.key} className={`bento ${e.clase}`}>
          <p className="text-3xl font-bold">{conteo[e.key]}</p>
          <p className="mt-1 text-sm text-medio-texto">{t(`etapasPlural.${e.key}`)}</p>
        </section>
      ))}

      <section className="bento border-rojo/30">
        <p className="text-3xl font-bold text-rojo">&lt; 1 h</p>
        <p className="mt-1 text-sm text-medio-texto">{t('portafolio.meta')}</p>
      </section>

      <section className="bento col-span-2 md:col-span-4 lg:col-span-6">
        <h2 className="font-semibold">{t('portafolio.buscarTitulo')}</h2>
        <p className="mt-1 text-sm text-medio-texto">{t('portafolio.buscarTexto')}</p>
      </section>

      {error && (
        <p role="alert" className="col-span-2 text-sm text-rojo-oscuro md:col-span-4 lg:col-span-6">
          {t('portafolio.errorLectura')}
        </p>
      )}
    </div>
  )
}
