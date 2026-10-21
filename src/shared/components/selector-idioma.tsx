'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'
import { cambiarIdioma } from '@/i18n/actions'
import { LOCALES } from '@/i18n/config'

function Globo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" />
    </svg>
  )
}

// Selector ES/EN. "oscuro" para el encabezado azul; "claro" para fondos claros.
export function SelectorIdioma({ tono = 'oscuro' }: { tono?: 'oscuro' | 'claro' }) {
  const t = useTranslations('idioma')
  const actual = useLocale()
  const [pendiente, iniciar] = useTransition()
  const base = tono === 'oscuro' ? 'border-white/30 text-white/80' : 'border-borde bg-white text-medio-texto'
  const activo = tono === 'oscuro' ? 'bg-white text-torna' : 'bg-torna text-white'

  return (
    <div
      role="group"
      aria-label={t('cambiar')}
      className={`flex items-center gap-1 rounded-full border px-1.5 py-1 text-xs font-semibold ${base} ${pendiente ? 'opacity-60' : ''}`}
    >
      <Globo />
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={l === actual}
          aria-label={t(l)}
          disabled={pendiente || l === actual}
          onClick={() => iniciar(() => cambiarIdioma(l))}
          className={`rounded-full px-2 py-0.5 uppercase transition-colors ${l === actual ? activo : 'hover:opacity-100'}`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
