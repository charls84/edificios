'use client'

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
        setError(`No se pudo cargar "${file.name}". Prueba con una foto JPG o PNG.`)
      }
      setSubiendo((n) => n - 1)
    }
    set({ fotos: [...s.fotos, ...nuevas] })
  }

  return (
    <section className="bento space-y-4 border-torna/30">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-rojo">Sección {numero}</p>
        <div className="flex gap-2 text-sm">
          <button type="button" onClick={() => onMover(-1)} disabled={esPrimera} className="rounded-lg border border-borde px-2 py-1 disabled:opacity-40" aria-label="Subir sección">↑</button>
          <button type="button" onClick={() => onMover(1)} disabled={esUltima} className="rounded-lg border border-borde px-2 py-1 disabled:opacity-40" aria-label="Bajar sección">↓</button>
          <button type="button" onClick={onQuitar} className="rounded-lg border border-rojo/40 px-3 py-1 text-rojo-oscuro hover:bg-rojo-claro">Quitar sección</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Campo label="Qué se revisó" value={s.etiqueta} onChange={(v) => set({ etiqueta: v })} placeholder="Ej.: Estructura" />
        <div className="md:col-span-2">
          <Campo label="Titular" value={s.titulo} onChange={(v) => set({ titulo: v })} placeholder="Ej.: Estructura intervenida y actualizada" />
        </div>
      </div>
      <Campo label="Descripción" multilinea value={s.texto ?? ''} onChange={(v) => set({ texto: v || undefined })} />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Campo label="Conclusión: lo que se vio (opcional)" value={s.conclusion?.titulo ?? ''} onChange={(v) => set({ conclusion: { titulo: v, texto: s.conclusion?.texto ?? '' } })} />
        <Campo label="Conclusión: detalle (opcional)" multilinea value={s.conclusion?.texto ?? ''} onChange={(v) => set({ conclusion: { titulo: s.conclusion?.titulo ?? '', texto: v } })} />
      </div>

      <div>
        <p className="etiqueta">Fotos</p>
        <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
          {s.fotos.map((f, i) => (
            <div key={f.src} className="space-y-1.5 rounded-xl border border-borde p-2">
              <FotoInforme src={f.src} alt={f.destacado || `Foto ${i + 1}`} className="aspect-[3/4] w-full rounded-lg object-cover" />
              <input className="campo mt-0" value={f.destacado} onChange={(e) => setFoto(i, { destacado: e.target.value })} placeholder="Título (negrita)" aria-label={`Título de la foto ${i + 1}`} />
              <input className="campo mt-0" value={f.texto} onChange={(e) => setFoto(i, { texto: e.target.value })} placeholder="Descripción" aria-label={`Descripción de la foto ${i + 1}`} />
              <button
                type="button"
                // El archivo se borra al guardar el informe (asi "Cancelar" lo recupera)
                onClick={() => set({ fotos: s.fotos.filter((_, j) => j !== i) })}
                className="w-full rounded-lg py-1 text-xs text-rojo-oscuro hover:bg-rojo-claro"
              >
                Quitar foto
              </button>
            </div>
          ))}
          <label className="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-borde text-center text-sm text-medio-texto hover:border-torna hover:text-torna">
            <span className="text-3xl leading-none">+</span>
            <span>{subiendo > 0 ? `Subiendo ${subiendo}…` : 'Agregar fotos'}</span>
            <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { subir(e.target.files); e.target.value = '' }} />
          </label>
        </div>
        {error && <p role="alert" className="mt-2 text-sm text-rojo-oscuro">{error}</p>}
      </div>
    </section>
  )
}
