'use client'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'
import { DOCUMENTOS, GRUPOS_DOCUMENTOS } from '../catalogo/documentos'
import { progresoDocumentos } from '../lib/progreso'
import { tx } from '../lib/texto'
import type { EstadoDocumentoEdificio } from '../types'
import { BotonAnalizarPredio } from './boton-analizar-predio'
import { FilaDocumento } from './fila-documento'
import { Progreso } from './progreso'

const vacio = (codigo: string): EstadoDocumentoEdificio => ({ codigo, estado: 'pendiente', notas: null, archivos: [] })

// Torna (3-nov-2026): solo se carga el certificado de tradición. Lo demás lo busca la
// plataforma (Fuentes) o sale de la visita; la lista completa queda como apoyo opcional.
export function ChecklistDocumentos({ edificioId, estados, yaAnalizado, iaDisponible }: { edificioId: string; estados: EstadoDocumentoEdificio[]; yaAnalizado: boolean; iaDisponible: boolean }) {
  const t = useTranslations('estudio.documentos')
  const locale = useLocale()
  const [ocultarNoAplica, setOcultarNoAplica] = useState(false)
  const porCodigo = new Map(estados.map((e) => [e.codigo, e]))
  const estadoDe = (codigo: string) => porCodigo.get(codigo) ?? vacio(codigo)
  const p = progresoDocumentos(estados)

  const necesarios = DOCUMENTOS.filter((d) => d.minimo)
  const opcionales = DOCUMENTOS.filter((d) => !d.minimo)
  const opcionalesCargados = opcionales.filter((d) => ['cargado', 'validado'].includes(estadoDe(d.codigo).estado)).length
  const visibles = opcionales.filter((d) => !ocultarNoAplica || estadoDe(d.codigo).estado !== 'no_aplica')

  return (
    <div className="space-y-4">
      <section className="bento">
        <h2 className="text-xl font-bold">{t('titulo')}</h2>
        <p className="mt-1 max-w-2xl text-sm text-medio-texto">{t('texto')}</p>
        <div className="mt-4 max-w-md">
          <Progreso label={t('progresoMinimo')} valor={p.minimoListos} total={p.minimo} destacado />
        </div>
        <ul className="mt-2 divide-y divide-borde">
          {necesarios.map((d) => <FilaDocumento key={d.codigo} edificioId={edificioId} doc={d} estado={estadoDe(d.codigo)} />)}
        </ul>
        <div className="mt-4 rounded-xl bg-fondo p-4">
          <p className="text-sm font-semibold">{t('siguientePaso')}</p>
          <p className="mb-3 mt-0.5 text-sm text-medio-texto">{t('siguientePasoTexto')}</p>
          <BotonAnalizarPredio edificioId={edificioId} yaAnalizado={yaAnalizado} iaDisponible={iaDisponible} />
        </div>
      </section>

      <section className="bento">
        <h3 className="font-semibold">{t('automaticoTitulo')}</h3>
        <ul className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          {(t.raw('automatico') as string[]).map((x) => (
            <li key={x} className="flex gap-2 rounded-xl bg-fondo p-3"><span aria-hidden className="text-verde">✓</span>{x}</li>
          ))}
        </ul>
        <Link href={`/edificios/${edificioId}/fuentes`} className="mt-3 inline-block text-sm text-rojo hover:underline">{t('verFuentes')}</Link>
      </section>

      <details className="bento group">
        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
          <span>
            <span className="font-semibold">{t('opcionalesTitulo')}</span>
            <span className="block text-sm text-medio-texto">{t('opcionalesTexto', { n: opcionalesCargados, total: opcionales.length })}</span>
          </span>
          <span className="rounded-xl border border-borde px-3 py-1.5 text-sm group-open:hidden">{t('verOpcionales')}</span>
          <span className="hidden rounded-xl border border-borde px-3 py-1.5 text-sm group-open:inline">{t('ocultarOpcionales')}</span>
        </summary>
        <div className="mt-4 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-medio-texto">{t('leyenda')}</p>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ocultarNoAplica} onChange={(e) => setOcultarNoAplica(e.target.checked)} />{t('filtroNoAplica')}</label>
          </div>
          {GRUPOS_DOCUMENTOS.map((g, gi) => {
            const delGrupo = visibles.filter((d) => d.grupo === g.codigo)
            if (delGrupo.length === 0) return null
            return (
              <div key={g.codigo}>
                <h3 className="text-lg font-bold">{gi + 1}. {tx(g.titulo, locale)}</h3>
                {g.subgrupos.map((sg) => {
                  const items = delGrupo.filter((d) => d.subgrupo === sg.codigo)
                  if (items.length === 0) return null
                  return (
                    <div key={sg.codigo} className="mt-3">
                      {g.subgrupos.length > 1 && <h4 className="text-xs font-semibold uppercase tracking-widest text-rojo">{tx(sg.titulo, locale)}</h4>}
                      <ul className="divide-y divide-borde">
                        {items.map((d) => <FilaDocumento key={d.codigo} edificioId={edificioId} doc={d} estado={estadoDe(d.codigo)} />)}
                      </ul>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </details>
    </div>
  )
}
