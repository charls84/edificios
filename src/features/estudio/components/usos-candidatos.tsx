'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { CATEGORIAS_USO, USOS_TIPICOS } from '../catalogo/usos'
import { tx } from '../lib/texto'
import { crearUso } from '../services/estudio-actions'
import type { CategoriaUso, UsoCandidato } from '../types'
import { TarjetaUso } from './tarjeta-uso'

export function UsosCandidatos({ edificioId, usos }: { edificioId: string; usos: UsoCandidato[] }) {
  const t = useTranslations('estudio.usos')
  const locale = useLocale()
  const router = useRouter()
  const [pendiente, iniciar] = useTransition()
  const [nombre, setNombre] = useState('')
  const [categoria, setCategoria] = useState<CategoriaUso>('vivienda')
  const existentes = new Set(usos.map((u) => u.nombre.toLowerCase()))

  function agregar(nombreUso: string, cat: CategoriaUso) {
    if (nombreUso.trim().length < 2) return
    iniciar(async () => {
      await crearUso({ buildingId: edificioId, nombre: nombreUso.trim(), categoria: cat })
      setNombre('')
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <section className="bento">
        <h2 className="text-xl font-bold">{t('titulo')}</h2>
        <p className="mt-1 max-w-2xl text-sm text-medio-texto">{t('texto')}</p>

        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-medio-texto">{t('tipicos')}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {USOS_TIPICOS.map((u) => {
            const n = tx(u.nombre, locale)
            const ya = existentes.has(n.toLowerCase())
            return (
              <button key={n} type="button" disabled={pendiente || ya} onClick={() => agregar(n, u.categoria)}
                className="rounded-full border border-borde bg-white px-3 py-1 text-sm hover:border-torna disabled:opacity-40">
                {ya ? '✓ ' : '+ '}{n}
              </button>
            )
          })}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); agregar(nombre, categoria) }} className="mt-4 flex flex-wrap items-end gap-2">
          <label className="min-w-48 flex-1">
            <span className="etiqueta">{t('otroUso')}</span>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="campo" placeholder={t('otroUsoEj')} />
          </label>
          <label>
            <span className="etiqueta">{t('categoria')}</span>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaUso)} className="campo">
              {CATEGORIAS_USO.map((c) => <option key={c} value={c}>{t(`categorias.${c}`)}</option>)}
            </select>
          </label>
          <button type="submit" disabled={pendiente || nombre.trim().length < 2} className="boton w-auto">{t('agregar')}</button>
        </form>
      </section>

      {usos.length === 0 ? (
        <section className="bento border-dashed text-center">
          <p className="font-semibold">{t('vacioTitulo')}</p>
          <p className="mt-1 text-sm text-medio-texto">{t('vacioTexto')}</p>
        </section>
      ) : (
        usos.map((u) => <TarjetaUso key={u.id + u.updatedAt} edificioId={edificioId} uso={u} />)
      )}
    </div>
  )
}
