'use client'

import { useTranslations } from 'next-intl'
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
  const t = useTranslations('visita')
  const local = useInformeLocal(edificioId)
  const guardado = local ?? inicial
  const editado = local !== null
  const [borrador, setBorrador] = useState<InformeVisita | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  function guardar() {
    if (!borrador) return
    const nuevo = normalizar(borrador)
    if (!guardarInforme(edificioId, nuevo)) {
      setAviso(t('errorGuardar'))
      return
    }
    const siguen = new Set(fotosDe(nuevo))
    borrarFotos(fotosDe(guardado).filter((src) => !siguen.has(src)))
    setBorrador(null)
    setAviso(t('guardado'))
  }

  function cancelar() {
    const previas = new Set(fotosDe(guardado))
    borrarFotos(fotosDe(borrador).filter((src) => !previas.has(src)))
    setBorrador(null)
  }

  function restaurar() {
    if (!confirm(t('confirmarRestaurar'))) return
    const originales = new Set(fotosDe(inicial))
    borrarFotos(fotosDe(guardado).filter((src) => !originales.has(src)))
    borrarInforme(edificioId)
    setAviso(t('restaurado'))
  }

  return (
    <section aria-labelledby="visita-tecnica" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="visita-tecnica" className="text-2xl font-bold">{t('titulo')}</h2>
          <p className="text-sm text-medio-texto">{t('subtitulo')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {borrador ? (
            <>
              <button type="button" onClick={cancelar} className="rounded-xl border border-borde bg-white px-4 py-2 text-sm font-semibold">{t('cancelar')}</button>
              <button type="button" onClick={guardar} className="boton w-auto">{t('guardar')}</button>
            </>
          ) : (
            <>
              {editado && inicial && (
                <button type="button" onClick={restaurar} className="rounded-xl border border-borde bg-white px-4 py-2 text-sm">{t('restaurar')}</button>
              )}
              {guardado && (
                <button type="button" onClick={() => { setAviso(null); setBorrador(structuredClone(guardado)) }} className="boton w-auto">{t('editar')}</button>
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
          <p className="font-semibold">{t('vacioTitulo')}</p>
          <p className="mt-1 text-sm text-medio-texto">{t('vacioTexto')}</p>
          <button
            type="button"
            onClick={() => setBorrador(informeVacio(t('tituloInforme'), t.raw('seccionesPlantilla') as string[]))}
            className="boton mx-auto mt-4 w-auto"
          >
            {t('crear')}
          </button>
        </div>
      )}
    </section>
  )
}
