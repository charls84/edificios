import { useTranslations } from 'next-intl'
import type { InformeVisita, SeccionInforme } from '@/features/ficha/types'
import { FotoInforme } from './foto-informe'

function Seccion({ s, numero }: { s: SeccionInforme; numero: string }) {
  const t = useTranslations('visita')
  return (
    <section className="bento">
      <p className="text-xs font-semibold uppercase tracking-widest text-rojo">
        {numero} · {s.etiqueta}
      </p>
      {s.titulo && <h3 className="mt-1 text-xl font-bold">{s.titulo}</h3>}
      {s.texto && <p className="mt-1 text-sm text-medio-texto">{s.texto}</p>}
      {s.fotos.length === 0 && !s.conclusion && (
        <p className="mt-3 text-sm text-medio-texto">{t('sinFotos')}</p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {s.fotos.map((f) => (
          <figure key={f.src}>
            <div className="overflow-hidden rounded-xl">
              <FotoInforme
                src={f.src}
                alt={`${f.destacado} ${f.texto}`.trim()}
                className="aspect-[3/4] w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <figcaption className="mt-1.5 text-xs text-medio-texto">
              <strong className="font-semibold text-torna">{f.destacado}</strong> {f.texto}
            </figcaption>
          </figure>
        ))}
        {s.conclusion && (s.conclusion.titulo || s.conclusion.texto) && (
          <div className="col-span-2 flex flex-col justify-end rounded-xl bg-torna p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-rojo">{t('loQueSeVio')}</p>
            <p className="mt-2 text-lg font-semibold leading-snug">{s.conclusion.titulo}</p>
            <p className="mt-3 text-sm text-white/75">{s.conclusion.texto}</p>
          </div>
        )}
      </div>
    </section>
  )
}

export function InformeVista({ informe }: { informe: InformeVisita }) {
  const t = useTranslations('visita')
  const meta = [informe.fecha, informe.hora, informe.autor && t('visitaYFotos', { autor: informe.autor })].filter(Boolean)
  return (
    <div className="space-y-4">
      <section className="bento">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-rojo">{informe.titulo}</p>
            {informe.resumenTitulo && <h2 className="mt-1 text-xl font-bold">{informe.resumenTitulo}</h2>}
            {meta.length > 0 && <p className="mt-1 text-sm text-medio-texto">{meta.join(' · ')}</p>}
          </div>
          {informe.pdf && (
            <a
              href={informe.pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-torna px-4 py-2 text-sm font-semibold hover:bg-torna hover:text-white"
            >
              {t('descargarPdf')}
            </a>
          )}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <ol className="space-y-3 lg:col-span-3">
            {informe.hallazgos.map((h, i) => (
              <li key={i} className="flex gap-4 rounded-xl bg-piedra p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-torna text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span>
                  <span className="block font-semibold">{h.titulo}</span>
                  <span className="block text-sm text-medio-texto">{h.texto}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="space-y-3 lg:col-span-2">
            {informe.observaciones.length > 0 && (
              <div className="rounded-xl border border-borde p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-medio-texto">{t('observaciones')}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {informe.observaciones.map((o, i) => <li key={i}>{o}</li>)}
                </ul>
              </div>
            )}
            {informe.documentosPorSolicitar.length > 0 && (
              <div className="rounded-xl border border-rojo/40 bg-rojo-claro p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-rojo-oscuro">
                  {t('documentos')}
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {informe.documentosPorSolicitar.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {informe.secciones.map((s, i) => (
        <Seccion key={i} s={s} numero={String(i + 1).padStart(2, '0')} />
      ))}
    </div>
  )
}
