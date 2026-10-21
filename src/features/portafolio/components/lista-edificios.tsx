import Image from 'next/image'
import Link from 'next/link'
import { ETAPA_LABEL, SemaforoBadge } from '@/features/ficha/components/badges'
import type { ResumenEdificio } from '../services/edificios'

function Miniatura({ src }: { src: string | null }) {
  if (!src) {
    return <span className="h-14 w-20 shrink-0 rounded-lg bg-piedra" aria-hidden />
  }
  return (
    <Image
      src={src}
      alt=""
      width={160}
      height={112}
      unoptimized
      className="h-14 w-20 shrink-0 rounded-lg border border-borde object-cover"
    />
  )
}

export function ListaEdificios({ edificios }: { edificios: ResumenEdificio[] }) {
  if (edificios.length === 0) {
    return (
      <section className="bento">
        <h2 className="font-semibold">Edificios</h2>
        <p className="mt-1 text-sm text-medio-texto">Todavía no hay edificios registrados.</p>
      </section>
    )
  }

  return (
    <section className="bento p-4">
      <h2 className="px-2 font-semibold">Edificios</h2>
      <ul className="mt-2">
        {edificios.map((e) => (
          <li key={e.id}>
            <Link
              href={`/edificios/${e.id}`}
              className="flex items-center gap-3 rounded-xl p-2 hover:bg-fondo"
            >
              <Miniatura src={e.foto} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{e.nombre}</span>
                <span className="block truncate text-xs text-medio-texto">
                  {[e.direccion, e.zona].filter(Boolean).join(' · ')}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-piedra px-2 py-0.5 text-xs">{ETAPA_LABEL[e.etapa]}</span>
                  {e.semaforo && <SemaforoBadge semaforo={e.semaforo} />}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
