'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { BLOQUES_GUIA, itemsDelBloque } from '../catalogo/guia'
import { progresoPrueba } from '../lib/progreso'
import { tx } from '../lib/texto'
import { setItemGuia } from '../services/estudio-actions'
import type { EstadoItem, EstadoItemEdificio, ItemGuia, Prueba } from '../types'
import { Progreso } from './progreso'

const ESTADOS: EstadoItem[] = ['cumple', 'por_verificar', 'no_cumple', 'no_aplica']

const COLOR: Record<EstadoItem, string> = {
  pendiente: '',
  cumple: 'bg-verde text-white border-verde',
  por_verificar: 'bg-ambar text-white border-ambar',
  no_cumple: 'bg-rojo text-white border-rojo',
  no_aplica: 'bg-medio-texto text-white border-medio-texto',
}

function FilaItem({ edificioId, item, estado }: { edificioId: string; item: ItemGuia; estado: EstadoItemEdificio }) {
  const t = useTranslations('estudio.checklist')
  const locale = useLocale()
  const router = useRouter()
  const [pendiente, iniciar] = useTransition()
  const [nota, setNota] = useState(estado.nota ?? '')
  const [abierta, setAbierta] = useState(Boolean(estado.nota))

  const marcar = (nuevo: EstadoItem) =>
    iniciar(async () => {
      await setItemGuia({ buildingId: edificioId, codigo: item.codigo, estado: estado.estado === nuevo ? 'pendiente' : nuevo })
      router.refresh()
    })

  const guardarNota = () => {
    if ((estado.nota ?? '') === nota.trim()) return
    iniciar(async () => {
      await setItemGuia({ buildingId: edificioId, codigo: item.codigo, estado: estado.estado, nota: nota.trim() || null })
      router.refresh()
    })
  }

  return (
    <li className="py-3">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            <span className="mr-1.5 font-mono text-xs text-medio-texto">{item.codigo}</span>
            {tx(item.texto, locale)}
            {item.bloqueante && <span className="ml-1.5 rounded-full bg-rojo-claro px-2 py-0.5 text-xs font-semibold text-rojo-oscuro">{t('bloqueante')}</span>}
          </p>
          <p className="mt-0.5 text-xs text-medio-texto">{tx(item.nota, locale)}</p>
        </div>
        <div role="group" aria-label={t('estadoDe', { item: item.codigo })} className="flex flex-wrap gap-1">
          {ESTADOS.map((e) => (
            <button
              key={e}
              type="button"
              disabled={pendiente}
              aria-pressed={estado.estado === e}
              onClick={() => marcar(e)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                estado.estado === e ? COLOR[e] : 'border-borde bg-white text-medio-texto hover:border-torna hover:text-torna'
              }`}
            >
              {t(`estados.${e}`)}
            </button>
          ))}
        </div>
      </div>
      <button type="button" onClick={() => setAbierta((v) => !v)} className="mt-1.5 text-xs text-medio-texto hover:text-torna">
        {abierta ? t('ocultarNota') : estado.nota ? t('verNota') : t('agregarNota')}
      </button>
      {abierta && (
        <textarea value={nota} onChange={(e) => setNota(e.target.value)} onBlur={guardarNota} placeholder={t('notaEj')} aria-label={t('notaDe', { item: item.codigo })} className="campo mt-1 min-h-16" />
      )}
    </li>
  )
}

const PRUEBAS: Prueba[] = ['legal', 'fisica', 'financiera']

export function ChecklistGuia({ edificioId, estados }: { edificioId: string; estados: EstadoItemEdificio[] }) {
  const t = useTranslations('estudio.checklist')
  const locale = useLocale()
  const porCodigo = new Map(estados.map((e) => [e.codigo, e]))
  const estadoDe = (codigo: string): EstadoItemEdificio => porCodigo.get(codigo) ?? { codigo, estado: 'pendiente', nota: null }

  return (
    <div className="space-y-4">
      <section className="bento">
        <h2 className="text-xl font-bold">{t('titulo')}</h2>
        <p className="mt-1 max-w-2xl text-sm text-medio-texto">{t('texto')}</p>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {PRUEBAS.map((p, i) => {
            const pr = progresoPrueba(estados, p)
            return <Progreso key={p} label={t('prueba', { n: i + 1, nombre: t(`pruebas.${p}`) })} valor={pr.resueltos} total={pr.total} />
          })}
        </div>
      </section>

      {PRUEBAS.map((prueba, pi) => (
        <section key={prueba} className="bento">
          <p className="text-xs font-semibold uppercase tracking-widest text-rojo">{t('prueba', { n: pi + 1, nombre: t(`pruebas.${prueba}`) })}</p>
          <p className="mt-1 text-sm text-medio-texto">{t(`preguntas.${prueba}`)}</p>
          {BLOQUES_GUIA.filter((b) => b.prueba === prueba).map((b) => (
            <div key={b.codigo} className="mt-5">
              <h3 className="text-lg font-bold">
                <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-torna text-sm text-white">{b.codigo}</span>
                {tx(b.titulo, locale)}
                <span className="ml-2 text-sm font-normal text-medio-texto">{tx(b.pregunta, locale)}</span>
              </h3>
              <ul className="mt-2 divide-y divide-borde">
                {itemsDelBloque(b.codigo).map((item) => <FilaItem key={item.codigo} edificioId={edificioId} item={item} estado={estadoDe(item.codigo)} />)}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
