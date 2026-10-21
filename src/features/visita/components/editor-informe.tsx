'use client'

import type { InformeVisita, SeccionInforme } from '@/features/ficha/types'
import { Campo, CampoLista } from './campos'
import { EditorSeccion } from './editor-seccion'

export function EditorInforme({ value: inf, onChange }: { value: InformeVisita; onChange: (v: InformeVisita) => void }) {
  const set = (cambios: Partial<InformeVisita>) => onChange({ ...inf, ...cambios })
  const setSeccion = (i: number, s: SeccionInforme) => set({ secciones: inf.secciones.map((x, j) => (j === i ? s : x)) })

  function mover(i: number, delta: -1 | 1) {
    const secciones = [...inf.secciones]
    const [s] = secciones.splice(i, 1)
    secciones.splice(i + delta, 0, s)
    set({ secciones })
  }

  return (
    <div className="space-y-4">
      <section className="bento space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-rojo">Datos de la visita</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Campo label="Fecha" value={inf.fecha} onChange={(v) => set({ fecha: v })} placeholder="Ej.: Domingo 18 de octubre de 2026" />
          <Campo label="Hora" value={inf.hora} onChange={(v) => set({ hora: v })} placeholder="Ej.: 9:00 a. m." />
          <Campo label="Visita y fotos" value={inf.autor} onChange={(v) => set({ autor: v })} placeholder="Nombre · empresa" />
        </div>
        <Campo label="Conclusión general" value={inf.resumenTitulo} onChange={(v) => set({ resumenTitulo: v })} placeholder="Ej.: Estructura y redes listas para el nuevo uso" />

        <div>
          <p className="etiqueta">Hallazgos principales</p>
          <div className="mt-2 space-y-2">
            {inf.hallazgos.map((h, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 rounded-xl bg-piedra p-3 md:grid-cols-[1fr_2fr_auto]">
                <input className="campo mt-0" value={h.titulo} placeholder="Hallazgo" aria-label={`Hallazgo ${i + 1}`}
                  onChange={(e) => set({ hallazgos: inf.hallazgos.map((x, j) => (j === i ? { ...x, titulo: e.target.value } : x)) })} />
                <input className="campo mt-0" value={h.texto} placeholder="Detalle" aria-label={`Detalle del hallazgo ${i + 1}`}
                  onChange={(e) => set({ hallazgos: inf.hallazgos.map((x, j) => (j === i ? { ...x, texto: e.target.value } : x)) })} />
                <button type="button" onClick={() => set({ hallazgos: inf.hallazgos.filter((_, j) => j !== i) })}
                  className="rounded-lg px-3 text-sm text-rojo-oscuro hover:bg-rojo-claro">Quitar</button>
              </div>
            ))}
            <button type="button" onClick={() => set({ hallazgos: [...inf.hallazgos, { titulo: '', texto: '' }] })}
              className="rounded-xl border border-dashed border-borde px-4 py-2 text-sm hover:border-torna">+ Agregar hallazgo</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <CampoLista label="Otras observaciones" value={inf.observaciones} onChange={(v) => set({ observaciones: v })} />
          <CampoLista label="Documentos por solicitar al propietario" value={inf.documentosPorSolicitar} onChange={(v) => set({ documentosPorSolicitar: v })} />
        </div>
      </section>

      {inf.secciones.map((s, i) => (
        <EditorSeccion
          key={i}
          seccion={s}
          numero={String(i + 1).padStart(2, '0')}
          onChange={(x) => setSeccion(i, x)}
          onQuitar={() => set({ secciones: inf.secciones.filter((_, j) => j !== i) })}
          onMover={(d) => mover(i, d)}
          esPrimera={i === 0}
          esUltima={i === inf.secciones.length - 1}
        />
      ))}
      <button
        type="button"
        onClick={() => set({ secciones: [...inf.secciones, { numero: '', etiqueta: '', titulo: '', fotos: [] }] })}
        className="w-full rounded-2xl border-2 border-dashed border-borde py-4 text-sm font-semibold text-medio-texto hover:border-torna hover:text-torna"
      >
        + Agregar sección revisada
      </button>
    </div>
  )
}
