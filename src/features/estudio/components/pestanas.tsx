'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const PESTANAS = ['resumen', 'documentos', 'checklist', 'usos', 'visita', 'analisis', 'informe'] as const

// Navegacion de la ficha: cada pestaña es una ruta, asi el enlace se puede compartir
export function Pestanas({ edificioId }: { edificioId: string }) {
  const t = useTranslations('estudio.pestanas')
  const ruta = usePathname()
  const base = `/edificios/${edificioId}`

  return (
    <nav aria-label={t('etiqueta')} className="-mx-4 overflow-x-auto px-4">
      <ul className="flex min-w-max gap-1 border-b border-borde">
        {PESTANAS.map((p) => {
          const href = p === 'resumen' ? base : `${base}/${p}`
          const activa = p === 'resumen' ? ruta === base || ruta === `${base}/editar` : ruta.startsWith(href)
          return (
            <li key={p}>
              <Link
                href={href}
                aria-current={activa ? 'page' : undefined}
                className={`block whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  activa ? 'border-rojo text-torna' : 'border-transparent text-medio-texto hover:text-torna'
                }`}
              >
                {t(p)}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
