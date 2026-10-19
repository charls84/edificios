import type { ConteoEtapas } from '../services/stats'

const ETAPAS: { key: keyof ConteoEtapas; label: string; clase: string }[] = [
  { key: 'identificado', label: 'Identificados', clase: 'bg-white' },
  { key: 'en_analisis', label: 'En análisis', clase: 'bg-ocre-claro' },
  { key: 'presentado', label: 'Presentados', clase: 'bg-musgo-claro' },
  { key: 'en_intervencion', label: 'En intervención', clase: 'bg-ladrillo-claro' },
  { key: 'descartado', label: 'Descartados', clase: 'bg-white' },
]

export function PortafolioBento({ conteo, error }: { conteo: ConteoEtapas; error: boolean }) {
  const total = Object.values(conteo).reduce((a, b) => a + b, 0)

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-6">
      <section className="bento flex flex-col justify-between bg-ladrillo text-white md:col-span-2 md:row-span-2 lg:col-span-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Portafolio</p>
        <div className="mt-8">
          <p className="text-6xl font-bold">{total}</p>
          <p className="mt-1 text-white/80">edificios registrados</p>
        </div>
      </section>

      {ETAPAS.map((e) => (
        <section key={e.key} className={`bento ${e.clase}`}>
          <p className="text-3xl font-bold">{conteo[e.key]}</p>
          <p className="mt-1 text-sm text-gris">{e.label}</p>
        </section>
      ))}

      <section className="bento md:col-span-4 lg:col-span-6">
        <h2 className="font-semibold">Buscar edificio</h2>
        <p className="mt-1 text-sm text-gris">
          Búsqueda por dirección, CHIP o mapa: llega con la ficha del edificio (Fase 1).
        </p>
      </section>

      {error && (
        <p role="alert" className="text-sm text-ladrillo-oscuro md:col-span-4 lg:col-span-6">
          No se pudo leer el portafolio. Revisa la conexión con la base de datos.
        </p>
      )}
    </div>
  )
}
