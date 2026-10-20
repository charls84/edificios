import type { Edificio } from '../types'
import { ETAPA_LABEL, EstadoBadge, SemaforoBadge } from './badges'

export function FichaView({ edificio }: { edificio: Edificio }) {
  const { documento, visita } = edificio

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <section className="bento md:col-span-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-gris">Ficha del edificio</p>
        <h1 className="mt-2 text-2xl font-bold">{edificio.nombre}</h1>
        <p className="mt-1 text-sm text-gris">
          {edificio.direccion} · {edificio.zona} · CHIP {edificio.chip}
        </p>
        <p className="mt-4 inline-block rounded-full bg-crema px-3 py-1 text-xs">
          Etapa: {ETAPA_LABEL[edificio.etapa]}
        </p>
      </section>

      <section className="bento flex flex-col justify-between gap-3">
        <SemaforoBadge semaforo={edificio.semaforo} />
        <p className="text-sm">{edificio.resumen}</p>
      </section>

      {edificio.alertas.length > 0 && (
        <section className="bento border-ladrillo/40 bg-ladrillo-claro md:col-span-4">
          <h2 className="font-semibold text-ladrillo-oscuro">Alertas</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {edificio.alertas.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </section>
      )}

      {edificio.secciones.map((s) => (
        <section key={s.titulo} className="bento md:col-span-2">
          <h2 className="font-semibold">{s.titulo}</h2>
          <dl className="mt-3 divide-y divide-borde">
            {s.datos.map((d) => (
              <div key={d.label} className="flex items-start justify-between gap-3 py-2.5">
                <div>
                  <dt className="text-xs text-gris">{d.label}</dt>
                  <dd className="font-medium">{d.valor}</dd>
                  <p className="mt-0.5 text-xs text-gris">Fuente: {d.fuente} · {d.fecha}</p>
                </div>
                <EstadoBadge estado={d.estado} />
              </div>
            ))}
          </dl>
        </section>
      ))}

      {documento && (
        <section className="bento md:col-span-2">
          <h2 className="font-semibold">Documento leído con IA</h2>
          <p className="mt-1 text-xs text-gris">{documento.nombre}</p>
          <ul className="mt-3 divide-y divide-borde">
            {documento.extracciones.map((x) => (
              <li key={x.campo} className="flex items-start justify-between gap-3 py-2.5">
                <div>
                  <p className="text-xs text-gris">{x.campo}</p>
                  <p className="font-medium">{x.valor}</p>
                  <p className="mt-0.5 text-xs text-gris">Página {x.pagina}</p>
                </div>
                <EstadoBadge estado={x.estado} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {visita && (
        <section className="bento md:col-span-2">
          <h2 className="font-semibold">Visita</h2>
          <p className="mt-1 text-xs text-gris">{visita.fecha} · {visita.autor}</p>
          <p className="mt-3 text-sm">{visita.nota}</p>
        </section>
      )}

      <section className="bento flex flex-wrap items-center justify-between gap-3 bg-tinta text-white md:col-span-4">
        <p className="text-sm text-white/80">Ficha para el propietario, con fuentes y fecha de corte.</p>
        <button disabled className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white/70">
          Exportar PDF · llega en la Fase 1
        </button>
      </section>
    </div>
  )
}
