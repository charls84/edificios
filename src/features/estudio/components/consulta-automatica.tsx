'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { COP, fecha, numero } from '../lib/texto'
import { consultarAutomaticamente } from '../services/auto-actions'
import type { ConsultaPredio, EstadoFuenteAuto } from '../types'

const COLOR_ESTADO: Record<EstadoFuenteAuto, string> = {
  ok: 'bg-verde-claro text-verde',
  sin_datos: 'bg-piedra text-medio-texto',
  error: 'bg-rojo-claro text-rojo-oscuro',
}

const ERRORES = ['sinLote', 'sinRespuesta', 'invalido', 'demo'] as const

function Datos({ c }: { c: ConsultaPredio }) {
  const t = useTranslations('estudio.auto.datos')
  const locale = useLocale()
  if (!c.lote) return null
  const filas = [
    [t('lote'), `${c.lote.codigo} · ${t('area', { n: numero(locale, c.lote.areaM2) })}`],
    c.lote.unidadesPrediales ? ['', t('unidades', { n: c.lote.unidadesPrediales })] : null,
    c.construccion ? ['', t('pisos', { p: c.construccion.pisos, s: c.construccion.sotanos })] : null,
    c.construccion?.areaConstruidaM2 ? [t('construida'), t('area', { n: numero(locale, c.construccion.areaConstruidaM2, 0) })] : null,
    c.manzana?.valorReferencia ? [t('valor', { anio: c.manzana.anioValor ?? '' }), `${COP(locale, c.manzana.valorReferencia)}/m²${c.manzana.estrato ? ` · ${t('estrato', { n: c.manzana.estrato })}` : ''}`] : null,
    c.transporte.estacion && c.transporte.distanciaEstacion != null ? ['TransMilenio', t('estacion', { nombre: c.transporte.estacion, m: c.transporte.distanciaEstacion })] : null,
  ].filter((x): x is string[] => Boolean(x))
  return (
    <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
      {filas.map(([k, v], i) => (
        <div key={i} className="flex gap-2"><dt className="text-medio-texto">{k}</dt><dd className="font-medium">{v}</dd></div>
      ))}
    </dl>
  )
}

export function ConsultaAutomatica({ edificioId, consulta }: { edificioId: string; consulta: ConsultaPredio | null }) {
  const t = useTranslations('estudio.auto')
  const locale = useLocale()
  const router = useRouter()
  const [pendiente, iniciar] = useTransition()
  const [codigo, setCodigo] = useState('')
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const consultar = () => {
    setAviso(null)
    iniciar(async () => {
      const r = await consultarAutomaticamente({ buildingId: edificioId, codigoLote: codigo.trim() || null })
      if (r.error) {
        const k = ERRORES.find((e) => e === r.error) ?? 'sinRespuesta'
        setAviso({ tipo: 'error', texto: t(`error.${k}`) })
      } else {
        setAviso({ tipo: 'ok', texto: r.aplicados ? t('listo', { n: r.aplicados }) : t('listoSinCambios') })
      }
      router.refresh()
    })
  }

  return (
    <section className="bento border-torna/30" aria-labelledby="consulta-auto">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 id="consulta-auto" className="text-xl font-bold">{t('titulo')}</h2>
          <p className="mt-1 text-sm text-medio-texto">{t('texto')}</p>
          <p className="mt-1 text-xs text-medio-texto">{consulta ? t('ultima', { fecha: fecha(locale, consulta.fecha) }) : t('nunca')}</p>
        </div>
        <button type="button" onClick={consultar} disabled={pendiente} className="boton w-auto">
          {pendiente ? t('consultando') : consulta ? t('repetir') : t('boton')}
        </button>
      </div>

      <details className="mt-3 max-w-md text-sm">
        <summary className="cursor-pointer text-medio-texto">{t('noEncuentra')}</summary>
        <label htmlFor="codigo-lote" className="etiqueta mt-2 block">{t('codigoLote')}</label>
        <input id="codigo-lote" inputMode="numeric" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="003109005017" className="campo" aria-describedby="codigo-lote-ayuda" />
        <p id="codigo-lote-ayuda" className="mt-1 text-xs text-medio-texto">{t('codigoLoteAyuda')}</p>
      </details>

      {aviso && (
        <p role={aviso.tipo === 'error' ? 'alert' : 'status'} className={`mt-3 rounded-xl px-4 py-2 text-sm ${aviso.tipo === 'error' ? 'bg-rojo-claro text-rojo-oscuro' : 'bg-verde-claro text-verde'}`}>{aviso.texto}</p>
      )}

      {consulta && (
        <>
          <Datos c={consulta} />
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={t('titulo')}>
            {Object.entries(consulta.estado).map(([k, v]) => (
              <li key={k} title={v.mensaje} className={`rounded-full px-2.5 py-1 text-xs font-medium ${COLOR_ESTADO[v.estado]}`}>
                {t.has(`fuentes.${k}`) ? t(`fuentes.${k}`) : k} · {t(`estado.${v.estado}`)}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
