import Link from 'next/link'
import { ETAPA_LABEL, SemaforoBadge } from '@/features/ficha/components/badges'
import type { ResumenEdificio } from '../services/edificios'

export function ListaEdificios({ edificios }: { edificios: ResumenEdificio[] }) {
  if (edificios.length === 0) {
    return (
      <section className="bento mt-4">
        <h2 className="font-semibold">Edificios</h2>
        <p className="mt-1 text-sm text-gris">Todavía no hay edificios registrados.</p>
      </section>
    )
  }

  return (
    <section className="bento mt-4">
      <h2 className="font-semibold">Edificios</h2>
      <ul className="mt-4 divide-y divide-borde">
        {edificios.map((e) => (
          <li key={e.id}>
            <Link
              href={`/edificios/${e.id}`}
              className="flex flex-wrap items-center justify-between gap-2 py-3 hover:bg-crema/60"
            >
              <span>
                <span className="font-medium">{e.nombre}</span>
                <span className="block text-sm text-gris">
                  {[e.direccion, e.zona, e.chip && `CHIP ${e.chip}`].filter(Boolean).join(' · ')}
                </span>
              </span>
              <span className="flex items-center gap-2">
                <span className="rounded-full bg-crema px-3 py-1 text-xs">{ETAPA_LABEL[e.etapa]}</span>
                {e.semaforo && <SemaforoBadge semaforo={e.semaforo} />}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
