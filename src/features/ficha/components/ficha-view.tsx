import { useTranslations } from 'next-intl'
import type { Edificio } from '../types'
import { EstadoBadge, SemaforoBadge } from './badges'
import { Galeria } from './galeria'
import { VisitaTecnica } from '@/features/visita/components/visita-tecnica'

export function FichaView({ edificio }: { edificio: Edificio }) {
  const t = useTranslations()
  const { documento, visita, informe } = edificio

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <div className="md:col-span-4">
        <Galeria fotos={edificio.fotos} titulo={edificio.nombre} />
      </div>

      <section className="bento md:col-span-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-medio-texto">{t('ficha.etiqueta')}</p>
        <h1 className="mt-2 text-2xl font-bold">{edificio.nombre}</h1>
        <p className="mt-1 text-sm text-medio-texto">
          {edificio.direccion} · {edificio.zona} · CHIP {edificio.chip ?? t('ficha.chipPendiente')}
        </p>
        <p className="mt-4 inline-block rounded-full bg-piedra px-3 py-1 text-xs">
          {t('ficha.etapa', { etapa: t(`etapas.${edificio.etapa}`) })}
        </p>
      </section>

      <section className="bento flex flex-col justify-between gap-3">
        <SemaforoBadge semaforo={edificio.semaforo} />
        <p className="text-sm">{edificio.resumen}</p>
      </section>

      {edificio.alertas.length > 0 && (
        <section className="bento border-rojo/40 bg-rojo-claro md:col-span-4">
          <h2 className="font-semibold text-rojo-oscuro">{t('ficha.alertas')}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {edificio.alertas.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </section>
      )}

      {edificio.datosDeEjemplo && (
        <p className="rounded-xl border border-ambar/40 bg-ambar-claro px-4 py-3 text-sm md:col-span-4">
          <strong>{t('ficha.ejemploTitulo')}</strong> {t('ficha.ejemploTexto')}
        </p>
      )}

      {edificio.secciones.length === 0 && (
        <section className="bento border-dashed md:col-span-4">
          <h2 className="font-semibold">{t('ficha.oficialesTitulo')}</h2>
          <p className="mt-1 text-sm text-medio-texto">{t('ficha.oficialesTexto')}</p>
        </section>
      )}

      {edificio.secciones.map((s) => (
        <section key={s.titulo} className="bento md:col-span-2">
          <h2 className="font-semibold">{s.titulo}</h2>
          <dl className="mt-3 divide-y divide-borde">
            {s.datos.map((d) => (
              <div key={d.label} className="flex items-start justify-between gap-3 py-2.5">
                <div>
                  <dt className="text-xs text-medio-texto">{d.label}</dt>
                  <dd className="font-medium">{d.valor}</dd>
                  <p className="mt-0.5 text-xs text-medio-texto">{t('ficha.fuente', { fuente: d.fuente, fecha: d.fecha })}</p>
                </div>
                <EstadoBadge estado={d.estado} />
              </div>
            ))}
          </dl>
        </section>
      ))}

      {documento && (
        <section className="bento md:col-span-2">
          <h2 className="font-semibold">{t('ficha.documentoIA')}</h2>
          <p className="mt-1 text-xs text-medio-texto">{documento.nombre}</p>
          <ul className="mt-3 divide-y divide-borde">
            {documento.extracciones.map((x) => (
              <li key={x.campo} className="flex items-start justify-between gap-3 py-2.5">
                <div>
                  <p className="text-xs text-medio-texto">{x.campo}</p>
                  <p className="font-medium">{x.valor}</p>
                  <p className="mt-0.5 text-xs text-medio-texto">{t('ficha.pagina', { pagina: x.pagina })}</p>
                </div>
                <EstadoBadge estado={x.estado} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {visita && (
        <section className="bento md:col-span-2">
          <h2 className="font-semibold">{t('ficha.visita')}</h2>
          <p className="mt-1 text-xs text-medio-texto">{visita.fecha} · {visita.autor}</p>
          <p className="mt-3 text-sm">{visita.nota}</p>
        </section>
      )}

      <div className="mt-4 md:col-span-4">
        <VisitaTecnica edificioId={edificio.id} inicial={informe ?? null} />
      </div>

      <section className="bento flex flex-wrap items-center justify-between gap-3 border-torna bg-torna text-white md:col-span-4">
        <p className="text-sm text-white/80">{t('ficha.exportarTexto')}</p>
        <button disabled className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white/70">
          {t('ficha.exportar')}
        </button>
      </section>
    </div>
  )
}
