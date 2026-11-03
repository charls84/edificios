import { getLocale, getTranslations } from 'next-intl/server'
import { DIMENSIONES, PESOS_DIMENSION, type AnalisisIAGuardado } from '../lib/analista-ia'
import { COLOR_DECISION } from '../lib/decision'
import { fecha } from '../lib/texto'
import { BotonAnalista } from './boton-analista'

const color = (p: number | null) => (p == null ? 'bg-piedra text-medio-texto' : p >= 70 ? 'bg-verde text-white' : p >= 50 ? 'bg-ambar text-white' : 'bg-rojo text-white')
const barra = (p: number) => (p >= 70 ? 'bg-verde' : p >= 50 ? 'bg-ambar' : 'bg-rojo')

function Lista({ titulo, items, tono }: { titulo: string; items: string[]; tono: string }) {
  if (items.length === 0) return null
  return (
    <div className={`rounded-xl p-3 ${tono}`}>
      <p className="text-xs font-semibold uppercase tracking-widest">{titulo}</p>
      <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
    </div>
  )
}

// Tarjeta del analista de IA: puntaje global, 8 dimensiones y sugerencia
export async function AnalistaIA({ edificioId, analisis, disponible, className = '' }: { edificioId: string; analisis: AnalisisIAGuardado | null; disponible: boolean; className?: string }) {
  const [t, td, locale] = await Promise.all([getTranslations('estudio.analista'), getTranslations('estudio.decision'), getLocale()])
  const a = analisis?.resultado
  return (
    <section className={`bento break-inside-avoid ${className}`} aria-labelledby="analista-ia">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <h2 id="analista-ia" className="text-lg font-bold">{t('titulo')}</h2>
          <p className="mt-0.5 text-xs text-medio-texto">
            {analisis ? t('meta', { fecha: fecha(locale, analisis.fecha), modelo: analisis.modelo }) : disponible ? t('sinAnalisis') : t('sinLlave')}
          </p>
        </div>
        {disponible && <BotonAnalista edificioId={edificioId} hayAnalisis={Boolean(analisis)} />}
      </div>

      {a && (
        <>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[180px_1fr]">
            <div className={`flex flex-col justify-center rounded-xl p-4 ${color(analisis!.puntajeGlobal)}`}>
              <span className="text-xs font-semibold uppercase tracking-widest opacity-80">{t('global')}</span>
              <span className="text-4xl font-bold tabular-nums">{analisis!.puntajeGlobal ?? '—'}<span className="text-base opacity-80">/100</span></span>
              <span className={`mt-2 inline-block self-start rounded-lg px-2 py-1 text-xs font-bold ${COLOR_DECISION[a.decision]} ring-1 ring-white/40`}>{td(`opcion.${a.decision}`)}</span>
            </div>
            <div>
              <p className="text-sm">{a.resumenEjecutivo}</p>
              {a.usoRecomendado && <p className="mt-2 text-sm"><strong>{t('uso')}:</strong> {a.usoRecomendado}</p>}
            </div>
          </div>

          <ul className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
            {DIMENSIONES.map((d) => {
              const x = a.dimensiones[d]
              return (
                <li key={d} className="rounded-xl border border-borde p-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold">{t(`dimension.${d}`)} <span className="text-xs font-normal text-medio-texto">· {t('peso', { n: PESOS_DIMENSION[d] })}</span></span>
                    <span className={`rounded-lg px-2 py-0.5 text-sm font-bold tabular-nums ${color(x.puntaje)}`}>{x.puntaje ?? '—'}</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-piedra" aria-hidden>
                    {x.puntaje != null && <div className={`h-1.5 rounded-full ${barra(x.puntaje)}`} style={{ width: `${x.puntaje}%` }} />}
                  </div>
                  <p className="mt-2 text-sm">{x.resumen}</p>
                  {x.evidencias.length > 0 && (
                    <details className="mt-1 text-xs text-medio-texto">
                      <summary className="cursor-pointer">{t('evidencias', { n: x.evidencias.length })} · {t(`confianza.${x.confianza}`)}</summary>
                      <ul className="mt-1 list-disc space-y-0.5 pl-4">{x.evidencias.map((e, i) => <li key={i}>{e}</li>)}</ul>
                      {x.riesgos.length > 0 && <ul className="mt-1 list-disc space-y-0.5 pl-4 text-rojo-oscuro">{x.riesgos.map((r, i) => <li key={i}>{r}</li>)}</ul>}
                    </details>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
            <Lista titulo={t('condiciones')} items={a.condiciones} tono="bg-ambar-claro" />
            <Lista titulo={t('pasos')} items={a.proximosPasos} tono="bg-fondo" />
            <Lista titulo={t('faltantes')} items={a.datosFaltantes} tono="bg-piedra" />
          </div>
          <p className="mt-3 text-xs text-medio-texto">{t('aviso')}</p>
        </>
      )}
    </section>
  )
}
