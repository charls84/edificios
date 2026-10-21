'use client'

import { useState } from 'react'
import type { InformeVisita } from '@/features/ficha/types'
import { borrarInforme, fotosDe, guardarInforme, informeVacio, useInformeLocal } from '../lib/almacen'
import { borrarFotos } from '../lib/fotos-db'
import { EditorInforme } from './editor-informe'
import { InformeVista } from './informe-vista'

const limpiarLista = (l: string[]) => l.map((x) => x.trim()).filter(Boolean)

function normalizar(inf: InformeVisita): InformeVisita {
  return {
    ...inf,
    observaciones: limpiarLista(inf.observaciones),
    documentosPorSolicitar: limpiarLista(inf.documentosPorSolicitar),
    hallazgos: inf.hallazgos.filter((h) => h.titulo.trim() || h.texto.trim()),
    secciones: inf.secciones.map((s, i) => ({ ...s, numero: String(i + 1).padStart(2, '0') })),
  }
}

export function VisitaTecnica({ edificioId, inicial }: { edificioId: string; inicial: InformeVisita | null }) {
  // Si hay cambios guardados en este navegador, mandan sobre el informe original
  const local = useInformeLocal(edificioId)
  const guardado = local ?? inicial
  const editado = local !== null
  const [borrador, setBorrador] = useState<InformeVisita | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  function guardar() {
    if (!borrador) return
    const nuevo = normalizar(borrador)
    if (!guardarInforme(edificioId, nuevo)) {
      setAviso('No se pudo guardar: el navegador no tiene espacio o bloquea el almacenamiento.')
      return
    }
    const siguen = new Set(fotosDe(nuevo))
    borrarFotos(fotosDe(guardado).filter((src) => !siguen.has(src)))
    setBorrador(null)
    setAviso('Cambios guardados en este navegador.')
  }

  function cancelar() {
    const previas = new Set(fotosDe(guardado))
    borrarFotos(fotosDe(borrador).filter((src) => !previas.has(src)))
    setBorrador(null)
  }

  function restaurar() {
    if (!confirm('¿Restaurar el informe original? Se perderán los cambios y las fotos subidas en este navegador.')) return
    const originales = new Set(fotosDe(inicial))
    borrarFotos(fotosDe(guardado).filter((src) => !originales.has(src)))
    borrarInforme(edificioId)
    setAviso('Se restauró el informe original.')
  }

  return (
    <section aria-labelledby="visita-tecnica" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="visita-tecnica" className="text-2xl font-bold">Visita técnica</h2>
          <p className="text-sm text-medio-texto">
            Secciones revisadas en sitio, con sus fotos. En el demo, los cambios se guardan en este navegador.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {borrador ? (
            <>
              <button type="button" onClick={cancelar} className="rounded-xl border border-borde bg-white px-4 py-2 text-sm font-semibold">Cancelar</button>
              <button type="button" onClick={guardar} className="boton w-auto">Guardar cambios</button>
            </>
          ) : (
            <>
              {editado && inicial && (
                <button type="button" onClick={restaurar} className="rounded-xl border border-borde bg-white px-4 py-2 text-sm">Restaurar original</button>
              )}
              {guardado && (
                <button type="button" onClick={() => { setAviso(null); setBorrador(structuredClone(guardado)) }} className="boton w-auto">Editar informe</button>
              )}
            </>
          )}
        </div>
      </div>

      {aviso && <p role="status" className="rounded-xl bg-verde-claro px-4 py-2 text-sm text-verde">{aviso}</p>}

      {borrador ? (
        <EditorInforme value={borrador} onChange={setBorrador} />
      ) : guardado ? (
        <InformeVista informe={guardado} />
      ) : (
        <div className="bento text-center">
          <p className="font-semibold">Aún no hay informe de visita</p>
          <p className="mt-1 text-sm text-medio-texto">
            Se crea con las 7 secciones del formato de Torna: fachada, estructura, redes, pisos, cubierta y entorno.
          </p>
          <button type="button" onClick={() => setBorrador(informeVacio())} className="boton mx-auto mt-4 w-auto">
            Crear informe de visita
          </button>
        </div>
      )}
    </section>
  )
}
