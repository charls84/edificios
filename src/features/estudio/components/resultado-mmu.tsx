import { useLocale, useTranslations } from 'next-intl'
import { Fragment } from 'react'
import { COP, numero, porcentaje } from '../lib/texto'
import type { MetricasUso, ResultadoMayorMejorUso } from '../types'

const vacio = '—'

function Fila({ etiqueta, usos, render }: { etiqueta: string; usos: MetricasUso[]; render: (m: MetricasUso) => React.ReactNode }) {
  return (
    <tr>
      <th scope="row" className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-medio-texto">{etiqueta}</th>
      {usos.map((m) => <Fragment key={m.id}>{render(m)}</Fragment>)}
    </tr>
  )
}

// Matriz de decision (bloque G) con los numeros calculados por uso
export function ResultadoMayorMejorUso({ r }: { r: ResultadoMayorMejorUso }) {
  const t = useTranslations('estudio.analisis.mmu')
  const tr = useTranslations('estudio.usos.riesgos')
  const locale = useLocale()
  const posicion = new Map(r.ranking.map((id, i) => [id, i + 1]))
  const recomendado = r.usos.find((m) => m.id === r.recomendado)
  const cop = (v: number) => COP(locale, v)
  const pct = (v: number) => porcentaje(locale, v)
  const si = t('si'), no = t('no')
  const celda = (contenido: React.ReactNode, clase = '') => <td className={`whitespace-nowrap px-3 py-2 text-right tabular-nums ${clase}`}>{contenido}</td>

  return (
    <div className="space-y-4">
      <div className={`rounded-xl p-4 ${recomendado ? 'bg-verde-claro' : 'bg-ambar-claro'}`}>
        <p className="text-xs font-semibold uppercase tracking-widest text-medio-texto">{t('recomendado')}</p>
        <p className="mt-1 text-xl font-bold">{recomendado ? recomendado.nombre : t('ninguno')}</p>
        <p className="mt-1 text-sm">{recomendado ? t('porque', { rentabilidad: pct(recomendado.rentabilidad ?? 0), vpn: cop(recomendado.vpn ?? 0) }) : t('ningunoTexto')}</p>
        {r.loteVacioManda && <p className="mt-2 text-sm font-semibold text-rojo-oscuro">{t('loteVacio')}</p>}
      </div>

      <p className="text-xs text-medio-texto">{t('parametros', { tasa: pct(r.parametros.tasaMinima), anios: r.parametros.horizonteAnios })}</p>

      <div className="overflow-x-auto rounded-xl border border-borde">
        <table className="w-full text-sm">
          <thead className="bg-fondo">
            <tr>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-medio-texto">{t('criterio')}</th>
              {r.usos.map((m) => (
                <th key={m.id} className={`px-3 py-2 text-right ${m.id === r.recomendado ? 'bg-verde-claro' : ''}`}>
                  {m.nombre}
                  {posicion.has(m.id) && <span className="ml-1 rounded-full bg-torna px-1.5 text-xs text-white">#{posicion.get(m.id)}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-borde">
            <Fila etiqueta={t('f.norma')} usos={r.usos} render={(m) => celda(m.motivo === 'legal' ? no : si)} />
            <Fila etiqueta={t('f.edificio')} usos={r.usos} render={(m) => celda(m.motivo === 'legal' ? vacio : m.motivo === 'fisica' ? no : si)} />
            <Fila etiqueta={t('f.demanda')} usos={r.usos} render={(m) => celda(['legal', 'fisica'].includes(m.motivo ?? '') ? vacio : m.motivo === 'demanda' ? no : si)} />
            <Fila etiqueta={t('f.ingresoBruto')} usos={r.usos} render={(m) => celda(m.rentabilidad == null ? vacio : cop(m.ingresoBruto))} />
            <Fila etiqueta={t('f.ingresoNeto')} usos={r.usos} render={(m) => celda(m.rentabilidad == null ? vacio : cop(m.ingresoNeto))} />
            <Fila etiqueta={t('f.rentabilidad')} usos={r.usos} render={(m) => celda(m.rentabilidad == null ? vacio : pct(m.rentabilidad), 'font-semibold')} />
            <Fila etiqueta={t('f.recuperacion')} usos={r.usos} render={(m) => celda(m.recuperacionAnios == null ? vacio : numero(locale, m.recuperacionAnios))} />
            <Fila etiqueta={t('f.tir')} usos={r.usos} render={(m) => celda(m.tir == null ? vacio : pct(m.tir))} />
            <Fila etiqueta={t('f.vpn')} usos={r.usos} render={(m) => celda(m.vpn == null ? vacio : cop(m.vpn))} />
            <Fila etiqueta={t('f.meses')} usos={r.usos} render={(m) => celda(m.rentabilidad == null ? vacio : m.mesesPrimerIngreso)} />
            <Fila etiqueta={t('f.riesgo')} usos={r.usos} render={(m) => celda(tr(m.riesgo))} />
            <Fila etiqueta={t('f.canonMenos10')} usos={r.usos} render={(m) => celda(m.sensibilidad.canonMenos10 == null ? vacio : pct(m.sensibilidad.canonMenos10))} />
            <Fila etiqueta={t('f.obraMas20')} usos={r.usos} render={(m) => celda(m.sensibilidad.obraMas20 == null ? vacio : pct(m.sensibilidad.obraMas20))} />
            <Fila etiqueta={t('f.colocacionLenta')} usos={r.usos} render={(m) => celda(m.sensibilidad.colocacionLenta == null ? vacio : cop(m.sensibilidad.colocacionLenta))} />
            <Fila etiqueta={t('f.valorAjustado')} usos={r.usos} render={(m) => celda(m.valorAjustado == null ? vacio : cop(m.valorAjustado), 'font-semibold')} />
            <Fila etiqueta={t('f.estado')} usos={r.usos} render={(m) => celda(m.viable ? t('viable') : t(`motivos.${m.motivo ?? 'datos'}`), m.viable ? 'text-verde' : 'text-rojo-oscuro')} />
          </tbody>
        </table>
      </div>
      <p className="text-xs text-medio-texto">{t('nota')}</p>
    </div>
  )
}
