'use client'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { documentoPorCodigo } from '../catalogo/documentos'
import { PARAMETROS_DEFAULT } from '../lib/finanzas'
import { fecha, tx } from '../lib/texto'
import { correrMayorMejorUsoAction, correrTamizajeAction } from '../services/analisis-actions'
import type { AnalisisGuardado, ResultadoMayorMejorUso, ResultadoTamizaje } from '../types'
import { ResultadoMayorMejorUso as VistaMmu } from './resultado-mmu'
import { ResultadoTamizaje as VistaTamizaje } from './resultado-tamizaje'

interface Props {
  edificioId: string
  minimoFaltante: string[]
  sinUsos: boolean
  faltantesMmu: { sinUsos: boolean; usosSinNumeros: string[]; itemsPendientes: string[] }
  tamizaje: AnalisisGuardado<ResultadoTamizaje> | null
  mmu: AnalisisGuardado<ResultadoMayorMejorUso> | null
}

function Estado({ a, t }: { a: AnalisisGuardado<unknown> | null; t: ReturnType<typeof useTranslations> }) {
  const locale = useLocale()
  if (!a) return <p className="text-sm text-medio-texto">{t('sinCorrer')}</p>
  return (
    <p className="text-sm text-medio-texto">
      {t('corrido', { fecha: fecha(locale, a.fecha), autor: a.autor ?? '—' })}
      {a.desactualizado && <span className="ml-2 rounded-full bg-ambar-claro px-2 py-0.5 text-xs font-semibold text-ambar">{t('desactualizado')}</span>}
    </p>
  )
}

function Requisito({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex items-start gap-2 text-sm ${ok ? 'text-verde' : 'text-medio-texto'}`}>
      <span aria-hidden className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] text-white ${ok ? 'bg-verde' : 'bg-piedra'}`}>{ok ? '✓' : ''}</span>
      <span>{children}</span>
    </li>
  )
}

// Los dos activadores del estudio: tamizaje (paso 1) y mayor y mejor uso (paso 3)
export function Analisis({ edificioId, minimoFaltante, sinUsos, faltantesMmu, tamizaje, mmu }: Props) {
  const t = useTranslations('estudio.analisis')
  const locale = useLocale()
  const router = useRouter()
  const [pendiente, iniciar] = useTransition()
  const [error, setError] = useState<string | null>(null)
  // Arranca con los parametros de la ultima corrida; si no hay, con los valores por defecto
  const previos = { ...PARAMETROS_DEFAULT, ...mmu?.resultado.parametros }
  const pct = (v: number) => String(Math.round(v * 1000) / 10)
  const [tasa, setTasa] = useState(pct(previos.tasaMinima))
  const [horizonte, setHorizonte] = useState(String(previos.horizonteAnios))
  const [salida, setSalida] = useState(pct(previos.tasaSalida))
  const enDefecto = Number(tasa) === PARAMETROS_DEFAULT.tasaMinima * 100 && Number(horizonte) === PARAMETROS_DEFAULT.horizonteAnios && Number(salida) === PARAMETROS_DEFAULT.tasaSalida * 100
  const restablecer = () => {
    setTasa(pct(PARAMETROS_DEFAULT.tasaMinima))
    setHorizonte(String(PARAMETROS_DEFAULT.horizonteAnios))
    setSalida(pct(PARAMETROS_DEFAULT.tasaSalida))
  }
  const [lote, setLote] = useState('')

  const listoTamizaje = minimoFaltante.length === 0 && !sinUsos
  const listoMmu = Boolean(tamizaje) && !faltantesMmu.sinUsos && faltantesMmu.usosSinNumeros.length === 0
  const base = `/edificios/${edificioId}`

  const correr = (accion: () => Promise<{ error?: string }>) =>
    iniciar(async () => {
      setError(null)
      const r = await accion()
      if (r.error) setError(t(`errores.${['faltaMinimo', 'faltanNumeros'].includes(r.error) ? r.error : 'generico'}`))
      router.refresh()
    })

  const correrMmu = () =>
    correr(() =>
      correrMayorMejorUsoAction(edificioId, {
        tasaMinima: Math.max(0, Number(tasa) || 0) / 100,
        horizonteAnios: Math.round(Number(horizonte) || PARAMETROS_DEFAULT.horizonteAnios),
        tasaSalida: Math.max(1, Number(salida) || PARAMETROS_DEFAULT.tasaSalida * 100) / 100,
        valorLoteVacio: lote.trim() ? Number(lote.replace(/[^\d.]/g, '')) : null,
      })
    )

  return (
    <div className="space-y-4">
      {error && <p role="alert" className="rounded-xl bg-rojo-claro px-4 py-2 text-sm text-rojo-oscuro">{error}</p>}

      <section className="bento space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-rojo">{t('activador', { n: 1 })}</p>
            <h2 className="mt-1 text-xl font-bold">{t('tamizaje.titulo')}</h2>
            <p className="mt-1 max-w-2xl text-sm text-medio-texto">{t('tamizaje.texto')}</p>
          </div>
          <button type="button" onClick={() => correr(() => correrTamizajeAction(edificioId))} disabled={pendiente || !listoTamizaje} className="boton w-auto">
            {pendiente ? t('corriendo') : tamizaje ? t('volverACorrer') : t('correr')}
          </button>
        </div>
        <ul className="grid grid-cols-1 gap-1 md:grid-cols-2">
          <Requisito ok={minimoFaltante.length === 0}>
            {t('tamizaje.reqMinimo')}
            {minimoFaltante.length > 0 && (
              <> · <Link href={`${base}/documentos`} className="text-rojo hover:underline">{t('tamizaje.faltan', { n: minimoFaltante.length })}</Link>
                <span className="block text-xs">{minimoFaltante.map((c) => tx(documentoPorCodigo(c)!.nombre, locale)).join(' · ')}</span></>
            )}
          </Requisito>
          <Requisito ok={!sinUsos}>
            {t('tamizaje.reqUsos')} {sinUsos && <Link href={`${base}/usos`} className="text-rojo hover:underline">{t('tamizaje.agregarUsos')}</Link>}
          </Requisito>
        </ul>
        <Estado a={tamizaje} t={t} />
        {tamizaje && <VistaTamizaje r={tamizaje.resultado} />}
      </section>

      <section className="bento space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-rojo">{t('activador', { n: 2 })}</p>
            <h2 className="mt-1 text-xl font-bold">{t('mmu.titulo')}</h2>
            <p className="mt-1 max-w-2xl text-sm text-medio-texto">{t('mmu.texto')}</p>
          </div>
          <button type="button" onClick={correrMmu} disabled={pendiente || !listoMmu} className="boton w-auto">
            {pendiente ? t('corriendo') : mmu ? t('volverACorrer') : t('correr')}
          </button>
        </div>
        <ul className="grid grid-cols-1 gap-1 md:grid-cols-2">
          <Requisito ok={Boolean(tamizaje)}>{t('mmu.reqTamizaje')}</Requisito>
          <Requisito ok={!faltantesMmu.sinUsos}>{t('mmu.reqSobreviven')}</Requisito>
          <Requisito ok={faltantesMmu.usosSinNumeros.length === 0}>
            {t('mmu.reqNumeros')}
            {faltantesMmu.usosSinNumeros.length > 0 && <span className="block text-xs"><Link href={`${base}/usos`} className="text-rojo hover:underline">{faltantesMmu.usosSinNumeros.join(' · ')}</Link></span>}
          </Requisito>
          <Requisito ok={faltantesMmu.itemsPendientes.length === 0}>
            {t('mmu.reqBloques')}
            {faltantesMmu.itemsPendientes.length > 0 && <span className="block text-xs"><Link href={`${base}/checklist`} className="text-ambar hover:underline">{t('mmu.itemsPendientes', { n: faltantesMmu.itemsPendientes.length })}</Link></span>}
          </Requisito>
        </ul>

        <div className="rounded-xl bg-fondo p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">{t('mmu.parametrosTitulo')}</p>
            {enDefecto
              ? <span className="text-xs text-medio-texto">{t('mmu.porDefecto')}</span>
              : <button type="button" onClick={restablecer} className="text-xs font-medium text-rojo hover:underline">{t('mmu.restablecer')}</button>}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm">
            <span className="etiqueta">{t('mmu.tasa')}</span>
            <input inputMode="decimal" value={tasa} onChange={(e) => setTasa(e.target.value)} className="campo" />
            <span className="text-xs text-medio-texto">{t('mmu.tasaAyuda')}</span>
          </label>
          <label className="block text-sm">
            <span className="etiqueta">{t('mmu.horizonte')}</span>
            <input inputMode="numeric" value={horizonte} onChange={(e) => setHorizonte(e.target.value)} className="campo" />
            <span className="text-xs text-medio-texto">{t('mmu.horizonteAyuda')}</span>
          </label>
          <label className="block text-sm">
            <span className="etiqueta">{t('mmu.salida')}</span>
            <input inputMode="decimal" value={salida} onChange={(e) => setSalida(e.target.value)} className="campo" />
            <span className="text-xs text-medio-texto">{t('mmu.salidaAyuda')}</span>
          </label>
          <label className="block text-sm">
            <span className="etiqueta">{t('mmu.lote')}</span>
            <input inputMode="decimal" value={lote} onChange={(e) => setLote(e.target.value)} className="campo" placeholder="COP" />
            <span className="text-xs text-medio-texto">{t('mmu.loteAyuda')}</span>
          </label>
        </div>
        </div>

        <Estado a={mmu} t={t} />
        {mmu && <VistaMmu r={mmu.resultado} />}
        {mmu && (
          <Link href={`${base}/informe`} className="inline-block rounded-xl border border-torna px-4 py-2 text-sm font-semibold text-torna hover:bg-torna hover:text-white">
            {t('verInforme')}
          </Link>
        )}
      </section>
    </div>
  )
}
