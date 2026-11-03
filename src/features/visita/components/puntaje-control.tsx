'use client'

import { useTranslations } from 'next-intl'
import { COLOR_NIVEL, nivelPuntaje } from '../lib/calificacion'

// Calificación de 0 a 10 con color: rojo (0–3), ámbar (4–6), verde (7–10).
// Es un grupo de radios: se usa con teclado (flechas) y con lector de pantalla.
export function PuntajeControl({ nombre, etiqueta, valor, onChange }: { nombre: string; etiqueta: string; valor: number | null | undefined; onChange: (v: number | null) => void }) {
  const t = useTranslations('visita.puntaje')
  const nivel = valor != null ? nivelPuntaje(valor) : null
  return (
    <fieldset>
      <legend className="etiqueta">{etiqueta}</legend>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {Array.from({ length: 11 }, (_, n) => {
          const activo = valor === n
          const color = COLOR_NIVEL[nivelPuntaje(n)]
          return (
            <label key={n} className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-sm font-bold tabular-nums transition-all focus-within:ring-2 focus-within:ring-torna focus-within:ring-offset-1 ${activo ? `${color.solido} scale-110 shadow` : `${color.suave} opacity-60 hover:opacity-100`}`}>
              <input type="radio" name={nombre} value={n} checked={activo} onChange={() => onChange(n)} className="sr-only" />
              {n}
            </label>
          )
        })}
        {valor != null && (
          <button type="button" onClick={() => onChange(null)} className="ml-1 rounded-lg px-2 py-1 text-xs text-medio-texto hover:bg-piedra">{t('quitar')}</button>
        )}
      </div>
      <p className="mt-1.5 text-xs text-medio-texto" aria-live="polite">
        {nivel ? <><span className={`mr-1.5 inline-block rounded-full px-2 py-0.5 font-semibold ${COLOR_NIVEL[nivel].suave}`}>{t(`nivel.${nivel}`)}</span>{t(`ayuda.${nivel}`)}</> : t('sinCalificar')}
      </p>
    </fieldset>
  )
}
