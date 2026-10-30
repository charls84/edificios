'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { FILTROS, UMBRALES, type CriterioFiltro } from '../catalogo/filtros'
import { calcularFiltros, COLOR_LECTURA, type EvaluacionCriterio, type Puntaje } from '../lib/filtros'
import { tx } from '../lib/texto'
import { setCriterioFiltro } from '../services/estudio-actions'
import { Progreso } from './progreso'
import { RadarFiltros } from './radar-filtros'


const COLOR_PUNTAJE: Record<Puntaje, string> = {
  0: 'border-rojo bg-rojo text-white',
  1: 'border-ambar bg-ambar text-white',
  2: 'border-verde bg-verde text-white',
}

const TITULOS = Object.fromEntries(FILTROS.map((f) => [f.codigo, f.titulo]))

function Criterio({ edificioId, c, ev }: { edificioId: string; c: CriterioFiltro; ev: EvaluacionCriterio | undefined }) {
  const t = useTranslations('estudio.filtros')
  const locale = useLocale()
  const router = useRouter()
  const [pendiente, iniciar] = useTransition()
  const [nota, setNota] = useState(ev?.nota ?? '')
  const [abierta, setAbierta] = useState(Boolean(ev?.nota))
  const actual = ev?.puntaje ?? null
  const opciones: Puntaje[] = c.veto ? [2, 0] : [2, 1, 0]

  const guardar = (puntaje: Puntaje | null, notaNueva = ev?.nota ?? null) =>
    iniciar(async () => {
      await setCriterioFiltro({ buildingId: edificioId, codigo: c.codigo, puntaje, nota: notaNueva })
      router.refresh()
    })

  return (
    <li className="py-3">
      <p className="text-sm font-medium">
        <span className="mr-1.5 font-mono text-xs text-medio-texto">{c.codigo}</span>
        {tx(c.texto, locale)}
        {c.veto && <span className="ml-1.5 rounded-full bg-rojo-claro px-2 py-0.5 text-xs font-semibold text-rojo-oscuro">{t('veto')}</span>}
      </p>
      <p className="mt-0.5 text-xs text-medio-texto">{t('fuente', { fuente: tx(c.fuente, locale) })}</p>
      <div role="group" aria-label={t('puntajeDe', { criterio: c.codigo })} className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
        {opciones.map((p) => (
          <button
            key={p}
            type="button"
            disabled={pendiente}
            aria-pressed={actual === p}
            onClick={() => guardar(actual === p ? null : p)}
            className={`rounded-xl border px-3 py-2 text-left text-xs transition-colors ${
              actual === p ? COLOR_PUNTAJE[p] : 'border-borde bg-white hover:border-torna'
            } ${c.veto ? 'sm:col-span-1' : ''}`}
          >
            <span className="block font-semibold">{c.veto ? (p === 2 ? t('cumple') : t('noCumple')) : t(`nivel.${p}`)}</span>
            <span className={actual === p ? 'text-white/85' : 'text-medio-texto'}>{tx(c.niveles[p], locale)}</span>
          </button>
        ))}
      </div>
      <button type="button" onClick={() => setAbierta((v) => !v)} className="mt-1.5 text-xs text-medio-texto hover:text-torna">
        {abierta ? t('ocultarNota') : ev?.nota ? t('verNota') : t('agregarNota')}
      </button>
      {abierta && (
        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          onBlur={() => nota.trim() !== (ev?.nota ?? '') && guardar(actual, nota.trim() || null)}
          placeholder={t('notaEj')}
          aria-label={t('notaDe', { criterio: c.codigo })}
          className="campo mt-1 min-h-16"
        />
      )}
    </li>
  )
}

export function FiltrosTorna({ edificioId, evaluaciones }: { edificioId: string; evaluaciones: EvaluacionCriterio[] }) {
  const t = useTranslations('estudio.filtros')
  const locale = useLocale()
  const r = calcularFiltros(evaluaciones)
  const por = new Map(evaluaciones.map((e) => [e.codigo, e]))

  return (
    <div className="space-y-4">
      <section className="bento">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold">{t('titulo')}</h2>
            <p className="mt-1 text-sm text-medio-texto">{t('texto')}</p>
          </div>
          <span className="rounded-full bg-ambar-claro px-3 py-1 text-xs font-semibold text-ambar">{t('propuesta')}</span>
        </div>

        <div className="mt-6 grid grid-cols-1 items-center gap-6 lg:grid-cols-[320px_1fr]">
          <RadarFiltros filtros={r.filtros} titulos={TITULOS} locale={locale} tamano={320} descripcion={t('radar', { potencial: r.potencial ?? 0 })} />
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-medio-texto">{t('potencial')}</p>
                <p className="text-5xl font-bold tabular-nums">{r.potencial ?? '—'}<span className="text-xl text-medio-texto">/100</span></p>
              </div>
              <span className={`mb-2 rounded-full px-3 py-1 text-sm font-semibold ${COLOR_LECTURA[r.lectura]}`}>{t(`lectura.${r.lectura}`)}</span>
            </div>
            <p className="text-sm">{t(`explica.${r.lectura}`, { alto: UMBRALES.alto, medio: UMBRALES.medio })}</p>
            {r.vetos.length > 0 && (
              <p className="rounded-xl bg-rojo-claro px-3 py-2 text-sm text-rojo-oscuro">{t('vetosFallidos', { codigos: r.vetos.join(', ') })}</p>
            )}
            <Progreso label={t('cobertura')} valor={Math.round(r.cobertura * 100)} total={100} />
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-5">
              {FILTROS.map((f) => {
                const rf = r.filtros.find((x) => x.codigo === f.codigo)!
                return (
                  <li key={f.codigo} className={`rounded-xl border p-3 ${rf.vetoFallido ? 'border-rojo bg-rojo-claro' : 'border-borde'}`}>
                    <a href={`#filtro-${f.codigo}`} className="block">
                      <span className="block text-xs text-medio-texto">{tx(f.titulo, locale)} · {f.peso} %</span>
                      <span className="block text-xl font-bold tabular-nums">{rf.vetoFallido ? t('veto') : rf.puntaje ?? '—'}</span>
                      <span className="block text-xs text-medio-texto">{t('evaluados', { a: rf.evaluados, b: rf.total })}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </section>

      {FILTROS.map((f, i) => (
        <section key={f.codigo} id={`filtro-${f.codigo}`} className="bento scroll-mt-20">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-bold">
              <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-torna text-sm text-white">{i + 1}</span>
              {tx(f.titulo, locale)}
              <span className="ml-2 text-sm font-normal text-medio-texto">{tx(f.pregunta, locale)}</span>
            </h3>
            <span className="text-xs text-medio-texto">{t('peso', { peso: f.peso })}</span>
          </div>
          <ul className="mt-2 divide-y divide-borde">
            {f.criterios.map((c) => <Criterio key={c.codigo} edificioId={edificioId} c={c} ev={por.get(c.codigo)} />)}
          </ul>
        </section>
      ))}

      <section className="bento text-sm text-medio-texto">
        <h3 className="font-semibold text-torna">{t('metodoTitulo')}</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {(t.raw('metodo') as string[]).map((m) => <li key={m}>{m}</li>)}
        </ul>
      </section>
    </div>
  )
}
