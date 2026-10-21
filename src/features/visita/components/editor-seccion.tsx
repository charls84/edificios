'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import type { FotoInforme as Foto, SeccionInforme } from '@/features/ficha/types'
import { comprimirImagen, guardarFoto } from '../lib/fotos-db'
import { Campo } from './campos'
import { FotoInforme } from './foto-informe'

interface Props {
  seccion: SeccionInforme
  numero: string
  onChange: (s: SeccionInforme) => void
  onQuitar: () => void
  onMover: (delta: -1 | 1) => void
  esPrimera: boolean
  esUltima: boolean
}

export function EditorSeccion({ seccion: s, numero, onChange, onQuitar, onMover, esPrimera, esUltima }: Props) {
  const t = useTranslations('visita.editor')
  const [subiendo, setSubiendo] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const set = (cambios: Partial<SeccionInforme>) => onChange({ ...s, ...cambios })
  const setFoto = (i: number, cambios: Partial<Foto>) =>
    set({ fotos: s.fotos.map((f, j) => (j === i ? { ...f, ...cambios } : f)) })

  async function subir(files: FileList | null) {
    if (!files?.length) return
    setError(null)
    setSubiendo(files.length)
    const nuevas: Foto[] = []
    for (const file of Array.from(files)) {
      try {
        nuevas.push({ src: await guardarFoto(await comprimirImagen(file)), destacado: '', texto: '' })
      } catch {
        setError(t('errorFoto', { nombre: file.name }))
      }
      setSubiendo((n) => n - 1)
    }
    set({ fotos: [...s.fotos, ...nuevas] })
  }

  return (
    <section className="bento space-y-4 border-torna/30">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-rojo">{t('seccion', { n: numero })}</p>
        <div className="flex gap-2 text-sm">
          <button type="button" onClick={() => onMover(-1)} disabled={esPrimera} className="rounded-lg border border-borde px-2 py-1 disabled:opacity-40" aria-label={t('subir')}>↑</button>
          <button type="button" onClick={() => onMover(1)} disabled={esUltima} className="rounded-lg border border-borde px-2 py-1 disabled:opacity-40" aria-label={t('bajar')}>↓</button>
          <button type="button" onClick={onQuitar} className="rounded-lg border border-rojo/40 px-3 py-1 text-rojo-oscuro hover:bg-rojo-claro">{t('quitarSeccion')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Campo label={t('queSeReviso')} value={s.etiqueta} onChange={(v) => set({ etiqueta: v })} placeholder={t('queSeRevisoEj')} />
        <div className="md:col-span-2">
          <Campo label={t('titular')} value={s.titulo} onChange={(v) => set({ titulo: v })} placeholder={t('titularEj')} />
        </div>
      </div>
      <Campo label={t('descripcion')} multilinea value={s.texto ?? ''} onChange={(v) => set({ texto: v || undefined })} />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Campo label={t('conclusionTitulo')} value={s.conclusion?.titulo ?? ''} onChange={(v) => set({ conclusion: { titulo: v, texto: s.conclusion?.texto ?? '' } })} />
        <Campo label={t('conclusionDetalle')} multilinea value={s.conclusion?.texto ?? ''} onChange={(v) => set({ conclusion: { titulo: s.conclusion?.titulo ?? '', texto: v } })} />
      </div>

      <div>
        <p className="etiqueta">{t('fotos')}</p>
        <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
          {s.fotos.map((f, i) => (
            <div key={f.src} className="space-y-1.5 rounded-xl border border-borde p-2">
              <FotoInforme src={f.src} alt={f.destacado || t('fotoN', { n: i + 1 })} className="aspect-[3/4] w-full rounded-lg object-cover" />
              <input className="campo mt-0" value={f.destacado} onChange={(e) => setFoto(i, { destacado: e.target.value })} placeholder={t('tituloFoto')} aria-label={t('tituloFotoN', { n: i + 1 })} />
              <input className="campo mt-0" value={f.texto} onChange={(e) => setFoto(i, { texto: e.target.value })} placeholder={t('descripcionFoto')} aria-label={t('descripcionFotoN', { n: i + 1 })} />
              <button
                type="button"
                // El archivo se borra al guardar el informe (asi "Cancelar" lo recupera)
                onClick={() => set({ fotos: s.fotos.filter((_, j) => j !== i) })}
                className="w-full rounded-lg py-1 text-xs text-rojo-oscuro hover:bg-rojo-claro"
              >
                {t('quitarFoto')}
              </button>
            </div>
          ))}
          <label className="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-borde text-center text-sm text-medio-texto hover:border-torna hover:text-torna">
            <span className="text-3xl leading-none">+</span>
            <span>{subiendo > 0 ? t('subiendo', { n: subiendo }) : t('agregarFotos')}</span>
            <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { subir(e.target.files); e.target.value = '' }} />
          </label>
        </div>
        {error && <p role="alert" className="mt-2 text-sm text-rojo-oscuro">{error}</p>}
      </div>
    </section>
  )
}
