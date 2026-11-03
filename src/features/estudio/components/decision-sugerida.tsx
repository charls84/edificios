import { getLocale, getTranslations } from 'next-intl/server'
import { COLOR_DECISION, type SugerenciaDecision } from '../lib/decision'
import { tx } from '../lib/texto'
import type { Texto } from '../types'

function Lista({ titulo, items, locale, tono }: { titulo: string; items: Texto[]; locale: string; tono: string }) {
  if (items.length === 0) return null
  return (
    <div className={`rounded-xl p-3 ${tono}`}>
      <p className="text-xs font-semibold uppercase tracking-widest">{titulo}</p>
      <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm">
        {items.map((x, i) => <li key={i}>{tx(x, locale)}</li>)}
      </ul>
    </div>
  )
}

// Tarjeta de la sugerencia de decisión (Resumen, Análisis e Informe)
export async function DecisionSugerida({ sugerencia: s, className = '' }: { sugerencia: SugerenciaDecision; className?: string }) {
  const [t, locale] = await Promise.all([getTranslations('estudio.decision'), getLocale()])
  return (
    <section className={`bento break-inside-avoid ${className}`} aria-labelledby="decision-sugerida">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <h2 id="decision-sugerida" className="text-lg font-bold">{t('titulo')}</h2>
          <p className="mt-0.5 text-xs text-medio-texto">{t('subtitulo')}</p>
        </div>
        <span className={`rounded-xl px-4 py-2 text-base font-bold ${COLOR_DECISION[s.decision]}`}>{t(`opcion.${s.decision}`)}</span>
      </div>
      <p className="mt-2 text-sm">{t(`explica.${s.decision}`)}</p>
      <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
        <Lista titulo={t('razones')} items={s.razones} locale={locale} tono="bg-fondo" />
        <Lista titulo={t('condiciones')} items={s.condiciones} locale={locale} tono="bg-ambar-claro" />
        <Lista titulo={t('faltantes')} items={s.faltantes} locale={locale} tono="bg-piedra" />
        <Lista titulo={t('alertas')} items={s.alertas} locale={locale} tono="bg-rojo-claro text-rojo-oscuro" />
      </div>
    </section>
  )
}
