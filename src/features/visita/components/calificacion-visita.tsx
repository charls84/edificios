import { useTranslations } from 'next-intl'
import { CLAVES_VISITA, COLOR_NIVEL, nivelPuntaje, type ResumenVisita } from '../lib/calificacion'

// Tablero de las seis calificaciones de la visita y su promedio (vista, resumen e informe)
export function CalificacionVisita({ resumen, compacto = false }: { resumen: ResumenVisita; compacto?: boolean }) {
  const t = useTranslations('visita')
  const nivel = resumen.promedio != null ? nivelPuntaje(resumen.promedio) : null
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      <div className={`col-span-2 flex flex-col justify-center rounded-xl p-3 sm:col-span-1 ${nivel ? COLOR_NIVEL[nivel].solido : 'bg-piedra text-medio-texto'}`}>
        <span className="text-xs font-semibold uppercase tracking-widest opacity-80">{t('puntaje.promedio')}</span>
        <span className="text-3xl font-bold tabular-nums">{resumen.promedio != null ? resumen.promedio.toLocaleString('es-CO') : '—'}<span className="text-sm opacity-80">/10</span></span>
        {!compacto && <span className="text-xs opacity-80">{t('puntaje.deSeis', { n: resumen.calificadas })}</span>}
      </div>
      {CLAVES_VISITA.map((c) => {
        const p = resumen.porClave[c]
        const color = p != null ? COLOR_NIVEL[nivelPuntaje(p)].suave : 'bg-piedra text-medio-texto'
        return (
          <div key={c} className={`flex flex-col justify-between rounded-xl p-3 ${color}`}>
            <span className="text-xs font-medium leading-tight">{t(`claves.${c}`)}</span>
            <span className="mt-1 text-xl font-bold tabular-nums">{p ?? '—'}<span className="text-xs opacity-70">/10</span></span>
          </div>
        )
      })}
    </div>
  )
}
