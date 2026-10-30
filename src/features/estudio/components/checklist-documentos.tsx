'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { DOCUMENTOS, GRUPOS_DOCUMENTOS } from '../catalogo/documentos'
import { progresoDocumentos } from '../lib/progreso'
import { tx } from '../lib/texto'
import type { EstadoDocumentoEdificio } from '../types'
import { FilaDocumento } from './fila-documento'
import { Progreso } from './progreso'

const vacio = (codigo: string): EstadoDocumentoEdificio => ({ codigo, estado: 'pendiente', notas: null, archivos: [] })

export function ChecklistDocumentos({ edificioId, estados }: { edificioId: string; estados: EstadoDocumentoEdificio[] }) {
  const t = useTranslations('estudio.documentos')
  const locale = useLocale()
  const [soloMinimo, setSoloMinimo] = useState(false)
  const [ocultarNoAplica, setOcultarNoAplica] = useState(false)
  const porCodigo = new Map(estados.map((e) => [e.codigo, e]))
  const estadoDe = (codigo: string) => porCodigo.get(codigo) ?? vacio(codigo)
  const p = progresoDocumentos(estados)

  const visibles = DOCUMENTOS.filter((d) => (!soloMinimo || d.minimo) && (!ocultarNoAplica || estadoDe(d.codigo).estado !== 'no_aplica'))

  return (
    <div className="space-y-4">
      <section className="bento">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{t('titulo')}</h2>
            <p className="mt-1 max-w-2xl text-sm text-medio-texto">{t('texto')}</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={soloMinimo} onChange={(e) => setSoloMinimo(e.target.checked)} />{t('filtroMinimo')}</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={ocultarNoAplica} onChange={(e) => setOcultarNoAplica(e.target.checked)} />{t('filtroNoAplica')}</label>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Progreso label={t('progresoMinimo')} valor={p.minimoListos} total={p.minimo} destacado />
          <Progreso label={t('progresoTotal')} valor={p.listos} total={p.total} />
        </div>
        <p className="mt-3 text-xs text-medio-texto">{t('leyenda')}</p>
      </section>

      {GRUPOS_DOCUMENTOS.map((g, gi) => {
        const delGrupo = visibles.filter((d) => d.grupo === g.codigo)
        if (delGrupo.length === 0) return null
        return (
          <section key={g.codigo} className="bento">
            <h3 className="text-lg font-bold">{gi + 1}. {tx(g.titulo, locale)}</h3>
            {g.subgrupos.map((sg) => {
              const items = delGrupo.filter((d) => d.subgrupo === sg.codigo)
              if (items.length === 0) return null
              return (
                <div key={sg.codigo} className="mt-4">
                  {g.subgrupos.length > 1 && <h4 className="text-xs font-semibold uppercase tracking-widest text-rojo">{tx(sg.titulo, locale)}</h4>}
                  <ul className="divide-y divide-borde">
                    {items.map((d) => <FilaDocumento key={d.codigo} edificioId={edificioId} doc={d} estado={estadoDe(d.codigo)} />)}
                  </ul>
                </div>
              )
            })}
          </section>
        )
      })}
    </div>
  )
}
